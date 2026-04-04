import { useEffect, useState } from 'react';
import { Package, ShoppingBag, DollarSign, AlertCircle } from 'lucide-react';
import { AdminStats } from '../../types';
import { api, formatarPreco } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<AdminStats>('/pedidos/admin/stats').then(setStats).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total de Pedidos', value: stats.total_pedidos, icon: <ShoppingBag size={28} />, color: '#007BFF' },
    { label: 'Receita Total', value: formatarPreco(stats.total_receita), icon: <DollarSign size={28} />, color: '#28a745' },
    { label: 'Produtos Ativos', value: stats.total_produtos, icon: <Package size={28} />, color: '#6f42c1' },
    { label: 'Pedidos Pendentes', value: stats.pedidos_pendentes, icon: <AlertCircle size={28} />, color: '#ffc107' },
  ] : [];

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{ borderLeftColor: c.color }}>
            <div className="stat-icon" style={{ color: c.color }}>{c.icon}</div>
            <div>
              <div className="stat-valor">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
