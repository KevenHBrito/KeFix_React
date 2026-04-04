import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/categorias
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nome');
    return res.json(rows);
  } catch {
    return res.status(500).json({ erro: 'Erro ao buscar categorias.' });
  }
});

// POST /api/categorias - admin
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { nome, slug, icone } = req.body;
  if (!nome || !slug) return res.status(400).json({ erro: 'Nome e slug são obrigatórios.' });
  try {
    const [result]: any = await pool.query(
      'INSERT INTO categorias (nome, slug, icone) VALUES (?,?,?)',
      [nome, slug, icone || 'box']
    );
    return res.status(201).json({ sucesso: true, id: result.insertId });
  } catch {
    return res.status(500).json({ erro: 'Erro ao criar categoria.' });
  }
});

// PUT /api/categorias/:id - admin
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const { nome, slug, icone } = req.body;
  try {
    await pool.query(
      'UPDATE categorias SET nome=?, slug=?, icone=? WHERE id=?',
      [nome, slug, icone || 'box', req.params.id]
    );
    return res.json({ sucesso: true });
  } catch {
    return res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
  }
});

// DELETE /api/categorias/:id - admin
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    return res.json({ sucesso: true });
  } catch {
    return res.status(500).json({ erro: 'Erro ao excluir categoria.' });
  }
});

export default router;
