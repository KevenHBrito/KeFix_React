import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/connection';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    req.session.userId = usuario.id;
    req.session.userName = usuario.nome;
    req.session.userType = usuario.tipo;

    return res.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// POST /api/auth/cadastro
router.post('/cadastro', async (req: Request, res: Response) => {
  const { nome, email, telefone, senha, confirma_senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  if (senha !== confirma_senha) {
    return res.status(400).json({ erro: 'As senhas não coincidem.' });
  }

  try {
    const [existing]: any = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    const hash = await bcrypt.hash(senha, 10);
    await pool.query(
      'INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
      [nome, email, telefone || null, hash]
    );

    return res.status(201).json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ sucesso: true });
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ autenticado: false });
  }
  return res.json({
    autenticado: true,
    usuario: {
      id: req.session.userId,
      nome: req.session.userName,
      tipo: req.session.userType,
    },
  });
});

export default router;
