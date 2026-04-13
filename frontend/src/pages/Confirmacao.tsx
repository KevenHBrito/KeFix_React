import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, PartyPopper } from 'lucide-react';
import { Pedido } from '../types';
import { FirestoreService } from '../lib/services';
import { formatarPreco } from '../utils/api';
import { PageBreadcrumb } from '../components/PageBreadcrumb';

export default function ConfirmacaoPage() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    if (!id) return;
    const num = parseInt(id, 10);
    if (Number.isNaN(num)) return;
    FirestoreService.getPedidoConfirmacao(num)
      .then(setPedido)
      .catch(() => setPedido(null));
  }, [id]);

  return (
    <main className="container confirmacao-page">
      <PageBreadcrumb
        items={[
          { label: 'Início', to: '/' },
          { label: 'Pedido confirmado' },
        ]}
      />
      <div className="confirmacao-card">
        <div className="confirmacao-ico-wrap">
          <CheckCircle className="confirmacao-check" size={56} strokeWidth={1.75} aria-hidden />
          <PartyPopper className="confirmacao-party" size={28} aria-hidden />
        </div>
        <h1>Pedido confirmado</h1>
        <p className="pedido-numero">Número do pedido <strong>#{id}</strong></p>
        <p className="confirmacao-msg">Recebemos seu pedido e vamos processar em breve. Você pode acompanhar o status em &quot;Minha conta&quot;.</p>

        {pedido && (
          <div className="confirmacao-itens">
            <h3>Resumo do pedido</h3>
            {pedido.itens?.map(item => (
              <div key={item.id} className="conf-item">
                <span>{item.nome} x{item.quantidade}</span>
                <span>{formatarPreco(item.preco_unitario * item.quantidade)}</span>
              </div>
            ))}
            <div className="conf-total">
              <strong>Total: {formatarPreco(pedido.total)}</strong>
            </div>
          </div>
        )}

        <div className="confirmacao-acoes">
          <Link to="/" className="btn-primary">Continuar Comprando</Link>
          <Link to={`/comprovante/${id}`} className="btn-outline" target="_blank">Imprimir comprovante</Link>
          <Link to="/minha-conta" className="btn-outline">Ver Meus Pedidos</Link>
        </div>
      </div>
    </main>
  );
}
