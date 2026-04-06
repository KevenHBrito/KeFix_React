import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Package, Check, PackageX } from "lucide-react";
import type { Produto } from "../types";
import { useCarrinho } from "../context/CarrinhoContext";
import { FirestoreService } from "../lib/services";
import { imgUrl, formatarPreco } from "../utils/api";
import { PageBreadcrumb } from "../components/PageBreadcrumb";

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [categoriaSlug, setCategoriaSlug] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adicionado, setAdicionado] = useState(false);
  const [erro, setErro] = useState("");
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErro("");
    FirestoreService.getProduto(id)
      .then((p) => {
        setProduto(p);
        if (!p) setErro("Produto não encontrado.");
      })
      .catch(() => setErro("Produto não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!produto) return;
    FirestoreService.getCategorias()
      .then((cats) => {
        const c = cats.find((x) => x.id === produto.categoria_id);
        setCategoriaSlug(c?.slug ?? null);
      })
      .catch(() => setCategoriaSlug(null));
  }, [produto]);

  async function handleAddCart() {
    if (!produto) return;
    try {
      await adicionarItem(produto.id, quantidade);
      setAdicionado(true);
      setTimeout(() => setAdicionado(false), 2500);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Não foi possível adicionar.");
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p className="loading-page-text">Carregando produto…</p>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <main className="container">
        <div className="empty-state empty-state-erro">
          <div className="empty-state-ico empty-state-ico-muted">
            <PackageX size={52} strokeWidth={1.25} />
          </div>
          <h1 className="empty-state-titulo">Produto indisponível</h1>
          <p className="empty-state-texto">{erro || "Não encontramos este item no catálogo."}</p>
          <div className="empty-state-acoes">
            <Link to="/" className="btn-primary">
              Ir para o início
            </Link>
            <Link to="/busca" className="btn-outline">
              Fazer uma busca
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container produto-page">
      <PageBreadcrumb
        items={[
          { label: "Início", to: "/" },
          {
            label: produto.categoria_nome,
            to: categoriaSlug ? `/categoria/${categoriaSlug}` : undefined,
          },
          { label: produto.nome.length > 42 ? `${produto.nome.slice(0, 42)}…` : produto.nome },
        ]}
      />

      <Link to="/" className="voltar-link">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="produto-detalhe">
        <div className="produto-imagem">
          <img
            src={imgUrl(produto.imagem)}
            alt={produto.nome}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
        </div>

        <div className="produto-info">
          <span className="produto-categoria">{produto.categoria_nome}</span>
          <h1>{produto.nome}</h1>
          <div className="produto-preco">{formatarPreco(produto.preco)}</div>

          {produto.descricao && <p className="produto-desc">{produto.descricao}</p>}

          <div className="produto-estoque">
            <Package size={16} />
            {produto.estoque > 0 ? (
              <span className="em-estoque">{produto.estoque} em estoque</span>
            ) : (
              <span className="sem-estoque">Esgotado</span>
            )}
          </div>

          {produto.estoque > 0 && (
            <div className="produto-acoes">
              <div className="quantidade-ctrl">
                <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{quantidade}</span>
                <button
                  type="button"
                  onClick={() => setQuantidade((q) => Math.min(produto.estoque, q + 1))}
                >
                  +
                </button>
              </div>
              <button type="button" className="btn-primary btn-add-grande" onClick={handleAddCart}>
                {adicionado ? (
                  <>
                    <Check size={18} /> Adicionado!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Adicionar ao carrinho
                  </>
                )}
              </button>
            </div>
          )}

          {adicionado && (
            <div className="alerta alerta-sucesso produto-alerta-carrinho">
              Produto adicionado.{" "}
              <Link to="/carrinho" className="produto-alerta-link">
                Ver carrinho →
              </Link>
            </div>
          )}
          {erro && produto && <div className="alerta alerta-erro">{erro}</div>}
        </div>
      </div>
    </main>
  );
}
