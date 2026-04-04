import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCarrinho } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';
import { api, imgUrl, formatarPreco } from '../utils/api';

export default function CarrinhoPage() {
  const { carrinho, atualizarItem, removerItem } = useCarrinho();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    telefone: '',
    endereco: '',
    pagamento: 'pix',
    observacoes: '',
  });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const total = parseFloat(carrinho.total);
  const freteGratis = total >= 299;

  async function handleFinalizar(e: React.FormEvent) {
    e.preventDefault();
    if (carrinho.items.length === 0) return;
    setErro('');
    setEnviando(true);
    try {
      const data: any = await api.post('/pedidos', { ...form });
      navigate(`/confirmacao/${data.pedido_id}`);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (carrinho.items.length === 0) {
    return (
      <main className="container carrinho-vazio">
        <ShoppingBag size={64} />
        <h2>Seu carrinho está vazio</h2>
        <p>Adicione produtos para continuar comprando.</p>
        <Link to="/" className="btn-primary">Ver Produtos</Link>
      </main>
    );
  }

  return (
    <main className="container carrinho-page">
      <Link to="/" className="voltar-link"><ArrowLeft size={16} /> Continuar comprando</Link>
      <h1>Carrinho</h1>

      <div className="carrinho-layout">
        {/* Itens */}
        <div className="carrinho-itens">
          {carrinho.items.map(item => (
            <div key={item.produto_id} className="carrinho-item">
              <img
                src={imgUrl(item.imagem)}
                alt={item.nome}
                onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
              <div className="item-info">
                <Link to={`/produto/${item.produto_id}`}>{item.nome}</Link>
                <span className="item-preco">{formatarPreco(item.preco)}</span>
              </div>
              <div className="quantidade-ctrl">
                <button onClick={() => atualizarItem(item.produto_id, item.quantidade - 1)}>−</button>
                <span>{item.quantidade}</span>
                <button onClick={() => atualizarItem(item.produto_id, item.quantidade + 1)}>+</button>
              </div>
              <span className="item-subtotal">{formatarPreco(item.preco * item.quantidade)}</span>
              <button className="btn-remover" onClick={() => removerItem(item.produto_id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {freteGratis && (
            <div className="frete-gratis-aviso">✅ Parabéns! Você ganhou frete grátis!</div>
          )}
        </div>

        {/* Checkout */}
        <div className="checkout-box">
          <h2>Finalizar Pedido</h2>

          <div className="resumo-pedido">
            <div className="resumo-linha">
              <span>Subtotal</span>
              <span>{formatarPreco(total)}</span>
            </div>
            <div className="resumo-linha">
              <span>Frete</span>
              <span>{freteGratis ? 'Grátis' : 'A calcular'}</span>
            </div>
            <div className="resumo-linha total">
              <strong>Total</strong>
              <strong>{formatarPreco(total)}</strong>
            </div>
          </div>

          <form onSubmit={handleFinalizar}>
            <div className="campo">
              <label>Nome completo *</label>
              <input
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome"
                required
              />
            </div>
            <div className="campo">
              <label>Telefone</label>
              <input
                value={form.telefone}
                onChange={e => setForm({ ...form, telefone: e.target.value })}
                placeholder="(44) 99999-9999"
              />
            </div>
            <div className="campo">
              <label>Endereço completo *</label>
              <textarea
                value={form.endereco}
                onChange={e => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade, CEP"
                required
                rows={3}
              />
            </div>
            <div className="campo">
              <label>Forma de pagamento *</label>
              <div className="pagamento-opcoes">
                {[
                  { val: 'pix', label: '💠 PIX' },
                  { val: 'cartao', label: '💳 Cartão' },
                  { val: 'dinheiro', label: '💵 Dinheiro na retirada' },
                ].map(op => (
                  <label key={op.val} className={`pagamento-opcao ${form.pagamento === op.val ? 'selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="pagamento"
                      value={op.val}
                      checked={form.pagamento === op.val}
                      onChange={e => setForm({ ...form, pagamento: e.target.value })}
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="campo">
              <label>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={e => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Alguma observação para o pedido?"
                rows={2}
              />
            </div>

            {erro && <div className="alerta alerta-erro">{erro}</div>}

            <button type="submit" className="btn-primary btn-full" disabled={enviando}>
              {enviando ? 'Processando...' : `Confirmar Pedido • ${formatarPreco(total)}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
