import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { CartItem } from '../middleware/auth';

const router = Router();

function getCart(req: Request): Record<number, CartItem> {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function cartTotal(cart: Record<number, CartItem>): number {
  return Object.values(cart).reduce((sum, item) => sum + item.preco * item.quantidade, 0);
}

// GET /api/carrinho
router.get('/', (req: Request, res: Response) => {
  const cart = getCart(req);
  const items = Object.values(cart);
  const total = cartTotal(cart);
  return res.json({
    items,
    total: total.toFixed(2),
    total_itens: items.reduce((s, i) => s + i.quantidade, 0),
  });
});

// POST /api/carrinho/adicionar
router.post('/adicionar', async (req: Request, res: Response) => {
  const produto_id = parseInt(req.body.produto_id);
  const quantidade = parseInt(req.body.quantidade) || 1;

  if (!produto_id || quantidade <= 0) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos.' });
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT id, nome, preco, estoque, imagem FROM produtos WHERE id = ? AND ativo = 1',
      [produto_id]
    );
    const produto = rows[0];
    if (!produto) return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });

    const cart = getCart(req);
    const qtd_atual = cart[produto_id]?.quantidade || 0;
    const nova_qtd = qtd_atual + quantidade;

    if (nova_qtd > produto.estoque) {
      return res.status(400).json({ sucesso: false, mensagem: 'Estoque insuficiente.' });
    }

    cart[produto_id] = {
      produto_id: produto.id,
      nome: produto.nome,
      preco: parseFloat(produto.preco),
      imagem: produto.imagem,
      quantidade: nova_qtd,
    };
    req.session.cart = cart;

    return res.json({
      sucesso: true,
      mensagem: 'Produto adicionado ao carrinho!',
      total_itens: Object.values(cart).reduce((s, i) => s + i.quantidade, 0),
    });
  } catch {
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
  }
});

// POST /api/carrinho/atualizar
router.post('/atualizar', (req: Request, res: Response) => {
  const produto_id = parseInt(req.body.produto_id);
  const quantidade = parseInt(req.body.quantidade);
  const cart = getCart(req);

  if (cart[produto_id]) {
    if (quantidade <= 0) {
      delete cart[produto_id];
    } else {
      cart[produto_id].quantidade = quantidade;
    }
  }
  req.session.cart = cart;
  return res.json({ sucesso: true, total: cartTotal(cart).toFixed(2) });
});

// POST /api/carrinho/remover
router.post('/remover', (req: Request, res: Response) => {
  const produto_id = parseInt(req.body.produto_id);
  const cart = getCart(req);
  delete cart[produto_id];
  req.session.cart = cart;
  return res.json({
    sucesso: true,
    total: cartTotal(cart).toFixed(2),
    total_itens: Object.values(cart).reduce((s, i) => s + i.quantidade, 0),
  });
});

export default router;
