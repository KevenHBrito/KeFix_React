import type { SessionUser } from "./types.js";

// Estende a sessao do express-session com os dados usados pela aplicacao.
declare module "express-session" {
  interface SessionData {
    // Carrinho temporario salvo por sessao, indexado pelo id do produto.
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
    // Usuario autenticado atualmente na sessao.
    usuario?: SessionUser;
    // Ultimo pedido criado para liberar tela de confirmacao ao convidado.
    ultimoPedidoId?: number;
  }
}

export {};
