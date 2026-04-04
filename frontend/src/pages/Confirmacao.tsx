import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Pedido } from '../types';
import { api, formatarPreco } from '../utils/api';

export default function ConfirmacaoPage() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    // Try to get from meus pedidos (if logged in) or just show id
    api.get<Pedido[]>('/pedidos/meus')
      .then(pedidos => {
        const found = pedidos.find(p => p.id === parseInt(id!));
        if (found) setPedido(found);
      })
      .catch(() => { });
  }, [id]);

  return (
    <main className="container confirmacao-page">
      <div className="confirmacao-card">
        <CheckCircle size={64} color="#28a745" />
        <h1>Pedido Confirmado!</h1>
        <p className="pedido-numero">Pedido <strong>#{id}</strong></p>
        <p>Seu pedido foi recebido e está sendo processado. Entraremos em contato em breve.</p>

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
          <Link to="/minha-conta" className="btn-outline">Ver Meus Pedidos</Link>
        </div>
      </div>
    </main>
  );
}
