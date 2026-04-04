import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db/connection';
import { requireAdmin } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: 'uploads/produtos/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `produto_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// GET /api/produtos - listar produtos (com filtros opcionais)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoria, busca, destaque, limit } = req.query;
    let sql = `
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = 1
    `;
    const params: any[] = [];

    if (categoria) {
      sql += ' AND c.slug = ?';
      params.push(categoria);
    }
    if (busca) {
      sql += ' AND (p.nome LIKE ? OR p.descricao LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }
    if (destaque === '1') {
      sql += ' AND p.destaque = 1';
    }

    sql += ' ORDER BY p.id DESC';

    if (limit) {
      sql += ` LIMIT ${parseInt(limit as string)}`;
    }

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
});

// GET /api/produtos/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT p.*, c.nome AS categoria_nome
       FROM produtos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ? AND p.ativo = 1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
});

// POST /api/produtos - admin only
router.post('/', requireAdmin, upload.single('imagem'), async (req: Request, res: Response) => {
  const { nome, descricao, preco, estoque, categoria_id, destaque } = req.body;
  const imagem = req.file ? req.file.filename : 'sem-imagem.png';

  if (!nome || !preco || !categoria_id) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const [result]: any = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id, destaque, imagem) VALUES (?,?,?,?,?,?,?)',
      [nome, descricao || '', parseFloat(preco), parseInt(estoque) || 0, parseInt(categoria_id), destaque === '1' ? 1 : 0, imagem]
    );
    return res.status(201).json({ sucesso: true, id: result.insertId });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
});

// PUT /api/produtos/:id - admin only
router.put('/:id', requireAdmin, upload.single('imagem'), async (req: Request, res: Response) => {
  const { nome, descricao, preco, estoque, categoria_id, destaque, imagem_atual } = req.body;
  const imagem = req.file ? req.file.filename : (imagem_atual || 'sem-imagem.png');

  try {
    await pool.query(
      'UPDATE produtos SET nome=?, descricao=?, preco=?, estoque=?, categoria_id=?, destaque=?, imagem=? WHERE id=?',
      [nome, descricao || '', parseFloat(preco), parseInt(estoque), parseInt(categoria_id), destaque === '1' ? 1 : 0, imagem, req.params.id]
    );
    return res.json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
});

// DELETE /api/produtos/:id - admin only (soft delete)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query('UPDATE produtos SET ativo = 0 WHERE id = ?', [req.params.id]);
    return res.json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao remover produto.' });
  }
});

export default router;
