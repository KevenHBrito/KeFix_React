import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userName?: string;
    userType?: 'cliente' | 'admin';
    cart?: Record<number, CartItem>;
  }
}

export interface CartItem {
  produto_id: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.userType !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }
  next();
}
