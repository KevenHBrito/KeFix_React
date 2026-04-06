export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  criado_em?: string;
}

export interface Produto {
  id: number;
  categoria_id: number;
  categoria_nome: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
  destaque: number;
  ativo: number;
  criado_em?: string;
}

export interface ItemCarrinho {
  produto_id: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
}

export interface Carrinho {
  items: ItemCarrinho[];
  total: string;
  total_itens: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'cliente' | 'admin';
  telefone?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
}

export interface Pedido {
  id: number;
  usuario_id: number | null;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  forma_pagamento: 'pix' | 'cartao' | 'dinheiro';
  status: 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';
  total: number;
  observacoes?: string;
  criado_em: string;
  itens?: ItemPedido[];
}

export interface ItemPedido {
  id: number;
  pedido_id: number;
  produto_id: number;
  nome: string;
  imagem: string;
  quantidade: number;
  preco_unitario: number;
}

export interface AdminUltimoPedidoResumo {
  id: number;
  nome_cliente: string;
  total: number;
  status: string;
  criado_em: string;
  itens_count: number;
}

export interface AdminStats {
  total_pedidos: number;
  total_receita: number;
  total_produtos: number;
  pedidos_pendentes: number;
  total_categorias: number;
  total_clientes: number;
  pedidos_ultimos_7_dias: number;
  receita_ultimos_30_dias: number;
  produtos_estoque_baixo: number;
  produtos_esgotados: number;
  pedidos_por_status: Record<string, number>;
  ultimos_pedidos: AdminUltimoPedidoResumo[];
}
