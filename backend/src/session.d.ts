import type { SessionUser } from "./types.js";

declare module "express-session" {
  interface SessionData {
    carrinho?: Record<
      string,
      {
        produto_id: number;
        nome: string;
        preco: number;
        imagem: string;
        quantidade: number;
      }
    >;
    usuario?: SessionUser;
    ultimoPedidoId?: number;
  }
}

export {};
