import { api } from "../utils/api";
import type {
  AdminStats,
  Categoria,
  ComprovanteVenda,
  Despesa,
  DespesaCategoria,
  Pedido,
  Produto,
  RelatorioFinanceiro,
} from "../types";

/** Camada de dados da loja — API REST KeFix (Express + sessão). */
export const FirestoreService = {
  async getCategorias(): Promise<Categoria[]> {
    return api.get<Categoria[]>("/categorias");
  },

  async getProdutos(
    filters: {
      categoria?: string;
      busca?: string;
      destaque?: boolean;
      limitCount?: number;
      adminTodos?: boolean;
    } = {},
  ): Promise<Produto[]> {
    const q = new URLSearchParams();
    if (filters.categoria) q.set("categoria", filters.categoria);
    if (filters.destaque) q.set("destaque", "1");
    if (filters.limitCount) q.set("limit", String(filters.limitCount));
    if (filters.busca) q.set("q", filters.busca);
    if (filters.adminTodos) q.set("todos", "1");
    const qs = q.toString();
    return api.get<Produto[]>(`/produtos${qs ? `?${qs}` : ""}`);
  },

  async getProduto(id: string | number): Promise<Produto | null> {
    try {
      return await api.get<Produto>(`/produtos/${id}`);
    } catch {
      return null;
    }
  },

  async criarPedido(pedidoData: {
    nome: string;
    telefone: string;
    endereco: string;
    pagamento: string;
    observacoes?: string;
    usuario_id?: number | null;
    total: number;
    frete_valor?: number;
    frete_tipo?: string;
    items: { produto_id: number; quantidade: number; nome?: string; preco?: number; imagem?: string }[];
  }): Promise<number> {
    const res = await api.post<{ id: number }>("/pedidos", pedidoData);
    return res.id;
  },

  async getMeusPedidos(): Promise<Pedido[]> {
    return api.get<Pedido[]>("/pedidos/meus");
  },

  async getAdminStats(): Promise<AdminStats> {
    return api.get<AdminStats>("/admin/stats");
  },

  async getPedidoConfirmacao(id: number): Promise<Pedido> {
    return api.get<Pedido>(`/pedidos/confirmacao/${id}`);
  },

  async getComprovantePedido(id: number): Promise<ComprovanteVenda> {
    return api.get<ComprovanteVenda>(`/pedidos/${id}/comprovante`);
  },

  async getDespesas(params: { inicio: string; fim: string; q?: string; categoria?: string }): Promise<Despesa[]> {
    const query = new URLSearchParams({
      inicio: params.inicio,
      fim: params.fim,
    });
    if (params.q) query.set("q", params.q);
    if (params.categoria) query.set("categoria", params.categoria);
    return api.get<Despesa[]>(`/despesas?${query.toString()}`);
  },

  async getDespesaCategorias(): Promise<DespesaCategoria[]> {
    return api.get<DespesaCategoria[]>("/despesas/categorias");
  },

  async criarDespesaCategoria(data: { nome: string }): Promise<DespesaCategoria> {
    return api.post<DespesaCategoria>("/despesas/categorias", data);
  },

  async atualizarDespesaCategoria(id: number, data: { nome: string }): Promise<DespesaCategoria> {
    return api.put<DespesaCategoria>(`/despesas/categorias/${id}`, data);
  },

  async excluirDespesaCategoria(id: number): Promise<{ ok: true }> {
    return api.delete<{ ok: true }>(`/despesas/categorias/${id}`);
  },

  async criarDespesa(data: {
    descricao: string;
    categoria: string;
    valor: number;
    data_competencia: string;
  }): Promise<Despesa> {
    return api.post<Despesa>("/despesas", data);
  },

  async atualizarDespesa(
    id: number,
    data: { descricao: string; categoria: string; valor: number; data_competencia: string },
  ): Promise<Despesa> {
    return api.put<Despesa>(`/despesas/${id}`, data);
  },

  async excluirDespesa(id: number): Promise<{ ok: true }> {
    return api.delete<{ ok: true }>(`/despesas/${id}`);
  },

  async getRelatorioFinanceiro(inicio: string, fim: string): Promise<RelatorioFinanceiro> {
    const query = new URLSearchParams({ inicio, fim });
    return api.get<RelatorioFinanceiro>(`/financeiro/relatorio?${query.toString()}`);
  },
};
