import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Produto } from '../types';
import { api } from '../utils/api';
import ProdutoCard from '../components/ProdutoCard';

export default function BuscaPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get<Produto[]>(`/produtos?busca=${encodeURIComponent(q)}`)
      .then(setProdutos)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="container" style={{ paddingTop: '2rem' }}>
      <h1 className="secao-titulo">
        {q ? `Resultados para "${q}"` : 'Busca'}
      </h1>
      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card-skeleton" />)}
        </div>
      ) : produtos.length === 0 && q ? (
        <p className="sem-resultados">Nenhum produto encontrado para "{q}".</p>
      ) : (
        <div className="grid-produtos">
          {produtos.map(p => <ProdutoCard key={p.id} produto={p} />)}
        </div>
      )}
    </main>
  );
}
