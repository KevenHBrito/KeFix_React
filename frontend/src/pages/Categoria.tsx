import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { Produto, Categoria } from "../types";
import { FirestoreService } from "../lib/services";
import ProdutoCard from "../components/ProdutoCard";
import { PageBreadcrumb } from "../components/PageBreadcrumb";

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const nomeCat =
    categorias.find((c) => c.slug === slug)?.nome ||
    (slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Catálogo");

  useEffect(() => {
    FirestoreService.getCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    FirestoreService.getProdutos({ categoria: slug })
      .then(setProdutos)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <main className="categoria-page">
      <div className="categoria-header-wrap">
        <div className="container">
          <PageBreadcrumb
            items={[
              { label: "Início", to: "/" },
              { label: "Categorias", to: "/#produtos" },
              { label: nomeCat },
            ]}
          />
          <div className="categoria-header">
            <div className="categoria-header-texto">
              <span className="categoria-badge">
                <LayoutGrid size={16} aria-hidden />
                Categoria
              </span>
              <h1 className="categoria-titulo">{nomeCat}</h1>
              <p className="categoria-desc">
                {loading
                  ? "Carregando produtos…"
                  : `${produtos.length} ${produtos.length === 1 ? "item disponível" : "itens disponíveis"} nesta linha.`}
              </p>
            </div>
            <Link to="/busca" className="btn-outline categoria-busca-link">
              Buscar em todo o site
            </Link>
          </div>
        </div>
      </div>

      <div className="container categoria-grid-wrap">
        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-skeleton" />
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="empty-state empty-state-compact">
            <h2 className="empty-state-titulo">Nenhum produto aqui ainda</h2>
            <p className="empty-state-texto">
              Esta categoria está vazia no momento. Confira outras linhas ou use a busca.
            </p>
            <Link to="/" className="btn-primary">
              Ver início
            </Link>
          </div>
        ) : (
          <div className="grid-produtos">
            {produtos.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
