import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Search, PackageOpen, SlidersHorizontal, Sparkles } from "lucide-react";
import { Produto, Categoria } from "../types";
import { FirestoreService } from "../lib/services";
import ProdutoCard from "../components/ProdutoCard";
import { PageBreadcrumb } from "../components/PageBreadcrumb";

type SortKey = "relevancia" | "preco-asc" | "preco-desc" | "nome";

export default function BuscaPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q")?.trim() || "";
  const [input, setInput] = useState(q);
  const [sortBy, setSortBy] = useState<SortKey>("relevancia");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    FirestoreService.getCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!q) {
      setProdutos([]);
      return;
    }
    setLoading(true);
    FirestoreService.getProdutos({ busca: q })
      .then(setProdutos)
      .finally(() => setLoading(false));
  }, [q]);

  const ordenados = useMemo(() => {
    const list = [...produtos];
    switch (sortBy) {
      case "preco-asc":
        return list.sort((a, b) => a.preco - b.preco);
      case "preco-desc":
        return list.sort((a, b) => b.preco - a.preco);
      case "nome":
        return list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      default:
        return list;
    }
  }, [produtos, sortBy]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = input.trim();
    if (term) setParams({ q: term });
    else setParams({});
  }

  const sugestoes = ["tela", "bateria", "iphone", "samsung", "carregador"];

  return (
    <main className="busca-page">
      <section className="busca-hero">
        <div className="container">
          <PageBreadcrumb
            items={[
              { label: "Início", to: "/" },
              { label: "Busca", to: "/busca" },
              ...(q ? [{ label: `“${q}”` }] : []),
            ]}
          />
          <div className="busca-hero-inner">
            <h1 className="busca-titulo">
              <Search className="busca-titulo-ico" size={32} strokeWidth={2} aria-hidden />
              {q ? "Resultados da busca" : "Encontre a peça ideal"}
            </h1>
            <p className="busca-sub">
              {q
                ? `Mostrando itens que combinam com sua pesquisa. Ajuste os filtros ou refine o termo.`
                : "Digite modelo, tipo de peça ou marca. Você também pode explorar as categorias abaixo."}
            </p>

            <form className="busca-form-grande" onSubmit={handleSubmit}>
              <div className="busca-input-wrap">
                <Search size={22} className="busca-input-ico" aria-hidden />
                <input
                  type="search"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex.: tela iPhone 11, bateria Samsung A54..."
                  autoComplete="off"
                  aria-label="Buscar produtos"
                />
              </div>
              <button type="submit" className="btn-primary busca-submit-btn">
                Buscar
              </button>
            </form>

            {!q && (
              <div className="busca-chips-wrap">
                <span className="busca-chips-label">
                  <Sparkles size={14} /> Sugestões rápidas
                </span>
                <div className="busca-chips">
                  {sugestoes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="busca-chip"
                      onClick={() => {
                        setInput(s);
                        setParams({ q: s });
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!q && categorias.length > 0 && (
              <div className="busca-chips-wrap busca-chips-cats">
                <span className="busca-chips-label">Categorias</span>
                <div className="busca-chips">
                  {categorias.map((c) => (
                    <Link key={c.id} to={`/categoria/${c.slug}`} className="busca-chip busca-chip-link">
                      {c.nome}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container busca-conteudo">
        {q && (
          <div className="busca-toolbar">
            <p className="busca-contagem" role="status">
              {loading ? (
                "Carregando…"
              ) : (
                <>
                  <strong>{ordenados.length}</strong>{" "}
                  {ordenados.length === 1 ? "produto encontrado" : "produtos encontrados"}
                  {q && (
                    <>
                      {" "}
                      para <q className="busca-query">{q}</q>
                    </>
                  )}
                </>
              )}
            </p>
            <label className="busca-sort">
              <SlidersHorizontal size={16} aria-hidden />
              <span className="sr-only">Ordenar por</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                disabled={loading || ordenados.length === 0}
              >
                <option value="relevancia">Relevância</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
                <option value="nome">Nome A–Z</option>
              </select>
            </label>
          </div>
        )}

        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-skeleton" />
            ))}
          </div>
        ) : q && ordenados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-ico">
              <PackageOpen size={48} strokeWidth={1.25} />
            </div>
            <h2 className="empty-state-titulo">Nada encontrado para “{q}”</h2>
            <p className="empty-state-texto">
              Tente outras palavras-chave, menos termos de uma vez ou navegue pelas categorias.
            </p>
            <div className="empty-state-acoes">
              <button type="button" className="btn-outline" onClick={() => navigate("/")}>
                Voltar ao início
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setParams({});
                  setInput("");
                }}
              >
                Nova busca
              </button>
            </div>
          </div>
        ) : q ? (
          <div className="grid-produtos grid-produtos-busca">
            {ordenados.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
