import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageBreadcrumb } from '../components/PageBreadcrumb';
import { Pedido } from '../types';
import { FirestoreService } from '../lib/services';
import { formatarPreco } from '../utils/api';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pendente:   { label: 'Pendente',   color: '#ffc107' },
  confirmado: { label: 'Confirmado', color: '#007BFF' },
  enviado:    { label: 'Enviado',    color: '#17a2b8' },
  entregue:   { label: 'Entregue',  color: '#28a745' },
  cancelado:  { label: 'Cancelado', color: '#dc3545' },
};

export default function MinhaContaPage() {
  const { usuario, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!usuario) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    FirestoreService.getMeusPedidos()
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, [usuario, authLoading, navigate]);

  if (authLoading || (!usuario && loading)) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="container minha-conta-page">
      <PageBreadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Minha conta' }]} />
      <div className="minha-conta-header">
        <div className="minha-conta-header-texto">
          <span className="minha-conta-badge"><User size={16} /> Área do cliente</span>
          <h1>Olá, {usuario.nome.split(' ')[0]}!</h1>
          <p>Acompanhe seus pedidos e o status de cada compra.</p>
        </div>
        <button className="btn-outline-sm" onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={16} /> Sair
        </button>
      </div>

      <h2 className="minha-conta-h2"><Package size={20} strokeWidth={2} /> Meus pedidos</h2>

      {loading ? (
        <div className="minha-conta-loading"><div className="spinner" /></div>
      ) : pedidos.length === 0 ? (
        <div className="sem-pedidos">
          <div className="sem-pedidos-ico"><Clock size={44} strokeWidth={1.25} /></div>
          <h3 className="sem-pedidos-titulo">Nenhum pedido ainda</h3>
          <p>Quando você finalizar uma compra, ela aparecerá aqui com o status atualizado.</p>
          <Link to="/" className="btn-primary">Explorar produtos</Link>
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
