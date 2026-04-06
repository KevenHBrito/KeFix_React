import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCarrinho } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';
import { FirestoreService } from '../lib/services';
import { imgUrl, formatarPreco } from '../utils/api';
import { PageBreadcrumb } from '../components/PageBreadcrumb';

export default function CarrinhoPage() {
  const { carrinho, atualizarItem, removerItem, recarregar } = useCarrinho();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    telefone: usuario?.telefone || '',
    rua: usuario?.rua || '',
    numero: usuario?.numero || '',
    bairro: usuario?.bairro || '',
    cidade: usuario?.cidade || '',
    cep: usuario?.cep || '',
    endereco: '', // Fallback se precisar
    pagamento: 'pix',
    observacoes: '',
    salvar_endereco: false,
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
      const pedido_id = await FirestoreService.criarPedido({
        ...form,
        usuario_id: usuario?.id || null,
        total,
        items: carrinho.items,
      });
      await recarregar(); // Esvazia o carrinho no estado global
      navigate(`/confirmacao/${pedido_id}`);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (carrinho.items.length === 0) {
    return (
      <main className="container carrinho-vazio-page">
        <PageBreadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Carrinho' }]} />
        <div className="carrinho-vazio">
          <div className="carrinho-vazio-ico">
            <ShoppingBag size={56} strokeWidth={1.25} />
          </div>
          <h2>Seu carrinho está vazio</h2>
          <p>Explore o catálogo e adicione peças com um clique no carrinho.</p>
          <Link to="/" className="btn-primary">Ver produtos</Link>
          <Link to="/busca" className="btn-outline carrinho-vazio-busca">Ir para busca</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container carrinho-page">
      <PageBreadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Carrinho' }]} />
      <Link to="/" className="voltar-link"><ArrowLeft size={16} /> Continuar comprando</Link>
      <div className="carrinho-page-head">
        <h1>Carrinho</h1>
        <p className="carrinho-page-sub">Revise os itens e finalize com seus dados de entrega.</p>
      </div>
      <div className="carrinho-trust-bar">
        <span><ShieldCheck size={16} /> Pagamento informado no pedido</span>
        <span><Truck size={16} /> Frete combinado após confirmação</span>
      </div>

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
            <div className="form-secao-titulo">Informações de Contato</div>
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

            <div className="form-secao-titulo">Endereço de Entrega</div>
            <div className="checkout-grid-endereco">
              <div className="campo col-3">
                <label>Rua *</label>
                <input
                  value={form.rua}
                  onChange={e => setForm({ ...form, rua: e.target.value })}
                  placeholder="Rua..."
                  required
                />
              </div>
              <div className="campo col-1">
                <label>Nº *</label>
                <input
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  placeholder="123"
                  required
                />
              </div>
              <div className="campo col-2">
                <label>Bairro *</label>
                <input
                  value={form.bairro}
                  onChange={e => setForm({ ...form, bairro: e.target.value })}
                  placeholder="Bairro..."
                  required
                />
              </div>
              <div className="campo col-2">
                <label>Cidade *</label>
                <input
                  value={form.cidade}
                  onChange={e => setForm({ ...form, cidade: e.target.value })}
                  placeholder="Cidade..."
                  required
                />
              </div>
              <div className="campo col-2">
                <label>CEP *</label>
                <input
                  value={form.cep}
                  onChange={e => setForm({ ...form, cep: e.target.value })}
                  placeholder="00000-000"
                  required
                />
              </div>
            </div>

            {usuario && (
              <div className="campo-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.salvar_endereco}
                    onChange={e => setForm({ ...form, salvar_endereco: e.target.checked })}
                  />
                  Salvar endereço para próxima compra
                </label>
              </div>
            )}

            <div className="form-secao-titulo">Forma de Pagamento</div>
            <div className="campo">
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

            <div className="form-secao-titulo">Outros</div>
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
