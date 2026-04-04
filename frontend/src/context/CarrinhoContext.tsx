import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Carrinho } from '../types';
import { api } from '../utils/api';

interface CarrinhoContextType {
  carrinho: Carrinho;
  totalItens: number;
  adicionarItem: (produto_id: number, quantidade?: number) => Promise<string>;
  atualizarItem: (produto_id: number, quantidade: number) => Promise<void>;
  removerItem: (produto_id: number) => Promise<void>;
  recarregar: () => Promise<void>;
}

const CarrinhoContext = createContext<CarrinhoContextType>({} as CarrinhoContextType);

const VAZIO: Carrinho = { items: [], total: '0.00', total_itens: 0 };

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<Carrinho>(VAZIO);

  async function recarregar() {
    try {
      const data = await api.get<Carrinho>('/carrinho');
      setCarrinho(data);
    } catch {
      setCarrinho(VAZIO);
    }
  }

  useEffect(() => { recarregar(); }, []);

  async function adicionarItem(produto_id: number, quantidade = 1): Promise<string> {
    const data: any = await api.post('/carrinho/adicionar', { produto_id, quantidade });
    await recarregar();
    return data.mensagem;
  }

  async function atualizarItem(produto_id: number, quantidade: number) {
    await api.post('/carrinho/atualizar', { produto_id, quantidade });
    await recarregar();
  }

  async function removerItem(produto_id: number) {
    await api.post('/carrinho/remover', { produto_id });
    await recarregar();
  }

  return (
    <CarrinhoContext.Provider value={{
      carrinho,
      totalItens: carrinho.total_itens,
      adicionarItem,
      atualizarItem,
      removerItem,
      recarregar,
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
