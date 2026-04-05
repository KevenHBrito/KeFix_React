import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  limit, 
  orderBy, 
  addDoc, 
  Timestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Produto, Categoria, Pedido } from '../types';

export const FirestoreService = {
  // --- Categorias ---
  async getCategorias(): Promise<Categoria[]> {
    const snap = await getDocs(query(collection(db, 'categorias'), orderBy('nome')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  },

  // --- Produtos ---
  async getProdutos(filters: { categoria?: string, busca?: string, destaque?: boolean, limitCount?: number } = {}): Promise<Produto[]> {
    let q = query(collection(db, 'produtos'), where('ativo', '==', true));

    if (filters.categoria) {
      q = query(q, where('categoria_slug', '==', filters.categoria));
    }
    if (filters.destaque) {
      q = query(q, where('destaque', '==', true));
    }
    
    // Sort by ID/Date desc
    q = query(q, orderBy('criado_em', 'desc'));

    if (filters.limitCount) {
      q = query(q, limit(filters.limitCount));
    }

    const snap = await getDocs(q);
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    // Client-side search (Firestore doesn't support partial match well natively)
    if (filters.busca) {
      const b = filters.busca.toLowerCase();
      results = results.filter((p: any) => 
        p.nome.toLowerCase().includes(b) || p.descricao.toLowerCase().includes(b)
      );
    }

    return results;
  },

  async getProduto(id: string): Promise<Produto | null> {
    const snap = await getDoc(doc(db, 'produtos', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as any) : null;
  },

  // --- Pedidos ---
  async criarPedido(pedidoData: any): Promise<string> {
    const docRef = await addDoc(collection(db, 'pedidos'), {
      ...pedidoData,
      status: 'pendente',
      criado_em: Timestamp.now()
    });
    return docRef.id;
  },

  async getMeusPedidos(usuarioId: string): Promise<Pedido[]> {
    const q = query(
      collection(db, 'pedidos'), 
      where('usuario_id', '==', usuarioId), 
      orderBy('criado_em', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  },

  // --- Admin ---
  async updateProduto(id: string, data: any) {
    await updateDoc(doc(db, 'produtos', id), data);
  },

  async getAdminStats(): Promise<any> {
    const prodsCount = (await getDocs(collection(db, 'produtos'))).size;
    const pedidosCount = (await getDocs(collection(db, 'pedidos'))).size;
    // ... simplificado para fins de migração
    return {
      total_pedidos: pedidosCount,
      total_receita: 0, 
      total_produtos: prodsCount,
      pedidos_pendentes: 0
    };
  }
};
