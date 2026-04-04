import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Produto } from '../types';
import { useCarrinho } from '../context/CarrinhoContext';
import { imgUrl, formatarPreco } from '../utils/api';

interface Props {
  produto: Produto;
}

export default function ProdutoCard({ produto }: Props) {
  const { adicionarItem } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAddCart(e: React.MouseEvent) {
    e.preventDefault();
    if (produto.estoque === 0 || loading) return;
    setLoading(true);
    try {
      await adicionarItem(produto.id);
      setAdicionado(true);
      setTimeout(() => setAdicionado(false), 2000);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-produto">
      <Link to={`/produto/${produto.id}`} className="card-img">
        <img
          src={imgUrl(produto.imagem)}
          alt={produto.nome}
          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
        />
        {produto.estoque === 0 && <span className="badge-esgotado">Esgotado</span>}
      </Link>
      <div className="card-info">
        <span className="card-categoria">{produto.categoria_nome}</span>
        <h3>
          <Link to={`/produto/${produto.id}`}>{produto.nome}</Link>
        </h3>
        <div className="card-rodape">
          <strong className="card-preco">{formatarPreco(produto.preco)}</strong>
          {produto.estoque > 0 && (
            <button
              className={`btn-add-carrinho ${adicionado ? 'adicionado' : ''}`}
              onClick={handleAddCart}
              disabled={loading}
              title="Adicionar ao carrinho"
            >
              {adicionado ? <Check size={16} /> : <ShoppingCart size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
