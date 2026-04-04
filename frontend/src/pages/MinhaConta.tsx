import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Pedido } from '../types';
import { api, formatarPreco } from '../utils/api';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pendente:   { label: 'Pendente',   color: '#ffc107' },
  confirmado: { label: 'Confirmado', color: '#007BFF' },
  enviado:    { label: 'Enviado',    color: '#17a2b8' },
  entregue:   { label: 'Entregue',  color: '#28a745' },
  cancelado:  { label: 'Cancelado', color: '#dc3545' },
};

export default function MinhaContaPage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) { navigate('/auth'); return; }
    api.get<Pedido[]>('/pedidos/meus')
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, [usuario]);

  return (
    <main className="container minha-conta-page">
      <div className="minha-conta-header">
        <div>
          <h1>Olá, {usuario?.nome?.split(' ')[0]}!</h1>
          <p>Gerencie seus pedidos e dados</p>
        </div>
        <button className="btn-outline-sm" onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={16} /> Sair
        </button>
      </div>

      <h2><Package size={20} /> Meus Pedidos</h2>

      {loading ? (
        <div className="spinner" />
      ) : pedidos.length === 0 ? (
        <div className="sem-pedidos">
          <Clock size={48} />
          <p>Você ainda não fez nenhum pedido.</p>
          <Link to="/" className="btn-primary">Explorar Produtos</Link>
        </div>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map(pedido => {
            const st = STATUS_LABEL[pedido.status] || STATUS_LABEL.pendente;
            return (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-card-header">
                  <div>
                    <strong>Pedido #{pedido.id}</strong>
                    <span className="pedido-data">
                      {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className="status-badge" style={{ background: st.color }}>
                    {st.label}
                  </span>
                </div>

                {pedido.itens && (
                  <div className="pedido-itens-lista">
                    {pedido.itens.map(item => (
                      <span key={item.id} className="pedido-item-tag">
                        {item.nome} × {item.quantidade}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pedido-card-footer">
                  <span>Pagamento: <strong>{pedido.forma_pagamento.toUpperCase()}</strong></span>
                  <strong className="pedido-total">{formatarPreco(pedido.total)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
