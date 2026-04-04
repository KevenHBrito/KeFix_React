import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// POST /api/pedidos - finalizar pedido
router.post('/', async (req: Request, res: Response) => {
  const { nome, telefone, endereco, pagamento, observacoes } = req.body;
  const formasValidas = ['pix', 'cartao', 'dinheiro'];

  if (!nome || !endereco || !formasValidas.includes(pagamento)) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const cart = req.session.cart || {};
  const items = Object.values(cart);

  if (items.length === 0) {
    return res.status(400).json({ erro: 'Carrinho vazio.' });
  }

  const total = items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result]: any = await conn.query(
      `INSERT INTO pedidos (usuario_id, nome_cliente, telefone, endereco, forma_pagamento, total, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.session.userId || null, nome, telefone || null, endereco, pagamento, total, observacoes || null]
    );
    const pedido_id = result.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?,?,?,?)',
        [pedido_id, item.produto_id, item.quantidade, item.preco]
      );
      await conn.query(
        'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
        [item.quantidade, item.produto_id]
      );
    }

    await conn.commit();
    req.session.cart = {};

    return res.status(201).json({ sucesso: true, pedido_id });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ erro: 'Erro ao processar pedido.' });
  } finally {
    conn.release();
  }
});

// GET /api/pedidos/meus - pedidos do cliente logado
router.get('/meus', requireAuth, async (req: Request, res: Response) => {
  try {
    const [pedidos]: any = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC',
      [req.session.userId]
    );

    for (const pedido of pedidos) {
      const [itens] = await pool.query(
        `SELECT ip.*, p.nome, p.imagem
         FROM itens_pedido ip JOIN produtos p ON ip.produto_id = p.id
         WHERE ip.pedido_id = ?`,
        [pedido.id]
      );
      pedido.itens = itens;
    }

    return res.json(pedidos);
  } catch {
    return res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
  }
});

// GET /api/pedidos - admin: todos os pedidos
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.query;
  try {
    let sql = 'SELECT * FROM pedidos';
    const params: any[] = [];
    if (status) { sql += ' WHERE status = ?'; params.push(status); }
    sql += ' ORDER BY criado_em DESC';
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch {
    return res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
  }
});

// GET /api/pedidos/:id - admin: detalhes
router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
    const pedido = rows[0];
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

    const [itens] = await pool.query(
      `SELECT ip.*, p.nome, p.imagem
       FROM itens_pedido ip JOIN produtos p ON ip.produto_id = p.id
       WHERE ip.pedido_id = ?`,
      [pedido.id]
    );
    pedido.itens = itens;
    return res.json(pedido);
  } catch {
    return res.status(500).json({ erro: 'Erro ao buscar pedido.' });
  }
});

// PUT /api/pedidos/:id/status - admin
router.put('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.body;
  const validos = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];
  if (!validos.includes(status)) return res.status(400).json({ erro: 'Status inválido.' });

  try {
    await pool.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ sucesso: true });
  } catch {
    return res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
});

// GET /api/pedidos/admin/stats - dashboard stats
router.get('/admin/stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [[{ total_pedidos }]]: any = await pool.query('SELECT COUNT(*) AS total_pedidos FROM pedidos');
    const [[{ total_receita }]]: any = await pool.query("SELECT COALESCE(SUM(total),0) AS total_receita FROM pedidos WHERE status != 'cancelado'");
    const [[{ total_produtos }]]: any = await pool.query('SELECT COUNT(*) AS total_produtos FROM produtos WHERE ativo = 1');
    const [[{ pedidos_pendentes }]]: any = await pool.query("SELECT COUNT(*) AS pedidos_pendentes FROM pedidos WHERE status = 'pendente'");
    return res.json({ total_pedidos, total_receita, total_produtos, pedidos_pendentes });
  } catch {
    return res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
  }
});

export default router;
