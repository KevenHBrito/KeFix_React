import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Produto } from '../types';
import { api } from '../utils/api';
import ProdutoCard from '../components/ProdutoCard';

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Produto[]>(`/produtos${slug ? `?categoria=${slug}` : ''}`)
      .then(setProdutos)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <main className="container secao-produtos" style={{ paddingTop: '2rem' }}>
      <h1 className="secao-titulo">{slug ? `Categoria: ${slug.replace(/-/g, ' ')}` : 'Todos os Produtos'}</h1>
      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card-skeleton" />)}
        </div>
      ) : produtos.length === 0 ? (
        <p className="sem-resultados">Nenhum produto encontrado nesta categoria.</p>
      ) : (
        <div className="grid-produtos">
          {produtos.map(p => <ProdutoCard key={p.id} produto={p} />)}
        </div>
      )}
    </main>
  );
}
