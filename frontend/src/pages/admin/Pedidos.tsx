import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { Pedido } from '../../types';
import { api, formatarPreco } from '../../utils/api';

const STATUS_OPTS = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];
const STATUS_COLOR: Record<string, string> = {
  pendente: '#ffc107', confirmado: '#007BFF', enviado: '#17a2b8', entregue: '#28a745', cancelado: '#dc3545',
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState('');
  const [detalhe, setDetalhe] = useState<Pedido | null>(null);

  async function carregar(status = '') {
    const url = status ? `/pedidos?status=${status}` : '/pedidos';
    const data = await api.get<Pedido[]>(url);
    setPedidos(data);
  }

  useEffect(() => { carregar(); }, []);

  async function atualizarStatus(id: number, status: string) {
    await api.put(`/pedidos/${id}/status`, { status });
    carregar(filtro);
  }

  async function verDetalhe(id: number) {
    const data = await api.get<Pedido>(`/pedidos/${id}`);
    setDetalhe(data);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Pedidos</h1>
        <select value={filtro} onChange={e => { setFiltro(e.target.value); carregar(e.target.value); }}>
          <option value="">Todos os status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Pagamento</th><th>Total</th><th>Status</th><th>Data</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.nome_cliente}</td>
                <td>{p.forma_pagamento.toUpperCase()}</td>
                <td>{formatarPreco(p.total)}</td>
                <td>
                  <select
                    value={p.status}
                    style={{ color: STATUS_COLOR[p.status] }}
                    onChange={e => atualizarStatus(p.id, e.target.value)}
                    className="status-select"
                  >
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td>{new Date(p.criado_em).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button className="btn-icon-sm" onClick={() => verDetalhe(p.id)}><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <div className="modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pedido #{detalhe.id}</h2>
              <button onClick={() => setDetalhe(null)}><X size={20} /></button>
            </div>
            <div className="detalhe-pedido">
              <p><strong>Cliente:</strong> {detalhe.nome_cliente}</p>
              <p><strong>Telefone:</strong> {detalhe.telefone || '—'}</p>
              <p><strong>Endereço:</strong> {detalhe.endereco}</p>
              <p><strong>Pagamento:</strong> {detalhe.forma_pagamento.toUpperCase()}</p>
              {detalhe.observacoes && <p><strong>Obs:</strong> {detalhe.observacoes}</p>}
              <hr />
              <h3>Itens</h3>
              {detalhe.itens?.map(item => (
                <div key={item.id} className="detalhe-item">
                  <span>{item.nome} × {item.quantidade}</span>
                  <span>{formatarPreco(item.preco_unitario * item.quantidade)}</span>
                </div>
              ))}
              <div className="detalhe-total">
                <strong>Total: {formatarPreco(detalhe.total)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
