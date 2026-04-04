import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Check } from 'lucide-react';
import { Produto } from '../types';
import { api, imgUrl, formatarPreco } from '../utils/api';
import { useCarrinho } from '../context/CarrinhoContext';

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adicionado, setAdicionado] = useState(false);
  const [erro, setErro] = useState('');
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    api.get<Produto>(`/produtos/${id}`)
      .then(setProduto)
      .catch(() => setErro('Produto não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddCart() {
    if (!produto) return;
    try {
      await adicionarItem(produto.id, quantidade);
      setAdicionado(true);
      setTimeout(() => setAdicionado(false), 2500);
    } catch (err: any) {
      setErro(err.message);
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (erro || !produto) return (
    <div className="container erro-page">
      <p>{erro || 'Produto não encontrado.'}</p>
      <Link to="/" className="btn-primary">Voltar ao início</Link>
    </div>
  );

  return (
    <main className="container produto-page">
      <Link to="/" className="voltar-link"><ArrowLeft size={16} /> Voltar</Link>

      <div className="produto-detalhe">
        <div className="produto-imagem">
          <img
            src={imgUrl(produto.imagem)}
            alt={produto.nome}
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
          />
        </div>

        <div className="produto-info">
          <span className="produto-categoria">{produto.categoria_nome}</span>
          <h1>{produto.nome}</h1>
          <div className="produto-preco">{formatarPreco(produto.preco)}</div>

          {produto.descricao && (
            <p className="produto-desc">{produto.descricao}</p>
          )}

          <div className="produto-estoque">
            <Package size={16} />
            {produto.estoque > 0
              ? <span className="em-estoque">{produto.estoque} em estoque</span>
              : <span className="sem-estoque">Esgotado</span>
            }
          </div>

          {produto.estoque > 0 && (
            <div className="produto-acoes">
              <div className="quantidade-ctrl">
                <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>−</button>
                <span>{quantidade}</span>
                <button onClick={() => setQuantidade(q => Math.min(produto.estoque, q + 1))}>+</button>
              </div>
              <button className="btn-primary btn-add-grande" onClick={handleAddCart}>
                {adicionado ? <><Check size={18} /> Adicionado!</> : <><ShoppingCart size={18} /> Adicionar ao Carrinho</>}
              </button>
            </div>
          )}

          {adicionado && (
            <div className="alerta alerta-sucesso">
              ✅ Produto adicionado! <Link to="/carrinho">Ver carrinho →</Link>
            </div>
          )}
          {erro && <div className="alerta alerta-erro">{erro}</div>}
        </div>
      </div>
    </main>
  );
}
