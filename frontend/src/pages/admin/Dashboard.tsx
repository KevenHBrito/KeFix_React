import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Users,
  Tag,
  TrendingUp,
  CalendarClock,
  Warehouse,
  Ban,
  ExternalLink,
  RefreshCw,
  LayoutGrid,
} from 'lucide-react';
import { AdminStats } from '../../types';
import { FirestoreService } from '../../lib/services';
import { formatarPreco } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_ORDER = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'] as const;
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  pendente: '#ffc107',
  confirmado: '#007BFF',
  enviado: '#17a2b8',
  entregue: '#28a745',
  cancelado: '#dc3545',
};

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    setLoading(true);
    setErro('');
    FirestoreService.getAdminStats()
      .then(setStats)
      .catch(() => setErro('Não foi possível carregar as métricas. Verifique se a API está no ar.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const ticketMedio =
    stats && stats.total_pedidos > 0 ? stats.total_receita / stats.total_pedidos : 0;

  const limite100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const cardsPrincipais = stats
    ? [
        {
          label: 'Total de pedidos',
          value: stats.total_pedidos,
          icon: <ShoppingBag size={26} strokeWidth={2} />,
          color: '#2563eb',
          hint: `${stats.pedidos_ultimos_7_dias} nos últimos 7 dias`,
          badge: `${stats.pedidos_ultimos_7_dias} recentes`,
          badgeTone: 'info',
          progresso: limite100((stats.pedidos_ultimos_7_dias / Math.max(stats.total_pedidos, 1)) * 100),
        },
        {
          label: 'Receita total',
          value: formatarPreco(stats.total_receita),
          icon: <DollarSign size={26} strokeWidth={2} />,
          color: '#10b981',
          hint: `${formatarPreco(stats.receita_ultimos_30_dias)} nos últimos 30 dias (exc. cancelados)`,
          badge: `${formatarPreco(stats.receita_ultimos_30_dias)} 30d`,
          badgeTone: 'good',
          progresso: limite100((stats.receita_ultimos_30_dias / Math.max(stats.total_receita, 1)) * 100),
        },
        {
          label: 'Produtos ativos',
          value: stats.total_produtos,
          icon: <Package size={26} strokeWidth={2} />,
          color: '#7c3aed',
          hint:
            stats.produtos_esgotados > 0 || stats.produtos_estoque_baixo > 0
              ? `${stats.produtos_esgotados} esgotados · ${stats.produtos_estoque_baixo} com estoque baixo (1–5)`
              : 'Catálogo em dia',
          badge:
            stats.produtos_esgotados > 0
              ? `${stats.produtos_esgotados} esgotados`
              : stats.produtos_estoque_baixo > 0
                ? `${stats.produtos_estoque_baixo} em alerta`
                : 'Estoque saudável',
          badgeTone:
            stats.produtos_esgotados > 0
              ? 'danger'
              : stats.produtos_estoque_baixo > 0
                ? 'warn'
                : 'good',
          progresso: limite100(
            ((stats.total_produtos - stats.produtos_estoque_baixo - stats.produtos_esgotados) /
              Math.max(stats.total_produtos, 1)) *
              100,
          ),
        },
        {
          label: 'Pedidos pendentes',
          value: stats.pedidos_pendentes,
          icon: <AlertCircle size={26} strokeWidth={2} />,
          color: '#f59e0b',
          hint: 'Aguardando tratamento',
          badge: `${stats.pedidos_pendentes} em fila`,
          badgeTone: stats.pedidos_pendentes > 0 ? 'warn' : 'good',
          progresso: limite100((stats.pedidos_pendentes / Math.max(stats.total_pedidos, 1)) * 100),
        },
      ]
    : [];

  const cardsSecundarios = stats
    ? [
        {
          label: 'Categorias',
          value: stats.total_categorias,
          icon: <LayoutGrid size={22} strokeWidth={2} />,
          color: '#64748b',
        },
        {
          label: 'Clientes cadastrados',
          value: stats.total_clientes,
          icon: <Users size={22} strokeWidth={2} />,
          color: '#0ea5e9',
        },
        {
          label: 'Ticket médio',
          value: stats.total_pedidos > 0 ? formatarPreco(ticketMedio) : '—',
          icon: <TrendingUp size={22} strokeWidth={2} />,
          color: '#059669',
        },
        {
          label: 'Pedidos (7 dias)',
          value: stats.pedidos_ultimos_7_dias,
          icon: <CalendarClock size={22} strokeWidth={2} />,
          color: '#2563eb',
        },
        {
          label: 'Estoque baixo',
          value: stats.produtos_estoque_baixo,
          icon: <Warehouse size={22} strokeWidth={2} />,
          color: '#d97706',
        },
        {
          label: 'Esgotados',
          value: stats.produtos_esgotados,
          icon: <Ban size={22} strokeWidth={2} />,
          color: '#dc2626',
        },
      ]
    : [];

  const porStatus = stats?.pedidos_por_status ?? {};
  const ultimosPedidos = stats?.ultimos_pedidos ?? [];

  const totalPorStatus = stats
    ? STATUS_ORDER.reduce((acc, s) => acc + (porStatus[s] ?? 0), 0)
    : 0;

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Admin';

  return (
    <div className="admin-page admin-dashboard">
      <header className="admin-dashboard-header admin-dashboard-hero">
        <div className="admin-dashboard-hero-copy">
          <h1>Dashboard</h1>
          <p className="admin-dashboard-sub">
            Olá, <strong>{primeiroNome}</strong> — visão geral da loja KeFix.
          </p>
          {stats && (
            <div className="admin-hero-chips">
              <span className="admin-hero-chip">Pedidos hoje: {stats.pedidos_ultimos_7_dias > 0 ? 'em movimento' : 'sem novidades'}</span>
              <span className="admin-hero-chip">Receita 30d: {formatarPreco(stats.receita_ultimos_30_dias)}</span>
              <span className="admin-hero-chip">Pendentes: {stats.pedidos_pendentes}</span>
            </div>
          )}
        </div>
        <div className="admin-dashboard-acoes">
          <button type="button" className="btn-outline-sm admin-dashboard-refresh" onClick={carregar} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'admin-icon-spin' : ''} />
            Atualizar
          </button>
          <Link to="/" target="_blank" rel="noreferrer" className="btn-outline-sm">
            <ExternalLink size={16} />
            Ver loja
          </Link>
        </div>
      </header>

      <nav className="admin-dashboard-quick" aria-label="Atalhos do painel">
        <Link to="/admin/produtos" className="admin-quick-link">
          <Package size={18} /> Produtos
        </Link>
        <Link to="/admin/pedidos" className="admin-quick-link">
          <ShoppingBag size={18} /> Pedidos
        </Link>
        <Link to="/admin/clientes" className="admin-quick-link">
          <Users size={18} /> Clientes
        </Link>
        <Link to="/admin/categorias" className="admin-quick-link">
          <Tag size={18} /> Categorias
        </Link>
      </nav>

      {erro && (
        <div className="alerta alerta-erro admin-dashboard-erro">
          {erro}
          <button type="button" className="admin-dashboard-retry" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className="admin-dashboard-loading">
          <div className="spinner" />
          <span>Carregando métricas…</span>
        </div>
      ) : stats ? (
        <>
          <section className="admin-dashboard-secao" aria-labelledby="dash-kpi-principal">
            <h2 id="dash-kpi-principal" className="admin-dashboard-secao-titulo">
              Indicadores principais
            </h2>
            <div className="stats-grid admin-stats-grid-principal">
              {cardsPrincipais.map((c, i) => (
                <div key={i} className="stat-card stat-card-rich" style={{ borderLeftColor: c.color }}>
                  <div className="stat-icon" style={{ color: c.color }}>
                    {c.icon}
                  </div>
                  <div className="stat-card-body">
                    <div className="stat-kpi-top">
                      <div className="stat-label stat-label-kpi">{c.label}</div>
                      <span className={`stat-kpi-badge stat-kpi-badge-${c.badgeTone}`}>{c.badge}</span>
                    </div>
                    <div className="stat-valor">{c.value}</div>
                    <div className="stat-hint">{c.hint}</div>
                    <div className="stat-kpi-meter" role="presentation">
                      <div className="stat-kpi-meter-fill" style={{ width: `${c.progresso}%`, background: c.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-dashboard-secao" aria-labelledby="dash-kpi-sec">
            <h2 id="dash-kpi-sec" className="admin-dashboard-secao-titulo">
              Operação e catálogo
            </h2>
            <div className="stats-grid admin-stats-grid-secundario">
              {cardsSecundarios.map((c, i) => (
                <div key={i} className="stat-card stat-card-compact" style={{ borderLeftColor: c.color }}>
                  <div className="stat-icon stat-icon-sm" style={{ color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="stat-valor stat-valor-sm">{c.value}</div>
                    <div className="stat-label">{c.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="admin-dashboard-grid2">
            <section className="admin-panel" aria-labelledby="dash-status">
              <h2 id="dash-status" className="admin-panel-titulo">
                Pedidos por status
              </h2>
              {totalPorStatus === 0 ? (
                <p className="admin-panel-vazio">Ainda não há pedidos registrados.</p>
              ) : (
                <ul className="admin-status-list">
                  {STATUS_ORDER.map((st) => {
                    const n = porStatus[st] ?? 0;
                    const pct = totalPorStatus > 0 ? Math.round((n / totalPorStatus) * 100) : 0;
                    return (
                      <li key={st} className="admin-status-row">
                        <div className="admin-status-row-head">
                          <span className="admin-status-nome" style={{ color: STATUS_COLOR[st] }}>
                            {STATUS_LABEL[st] ?? st}
                          </span>
                          <span className="admin-status-num">
                            {n} <span className="admin-status-pct">({pct}%)</span>
                          </span>
                        </div>
                        <div className="admin-status-bar-track" role="presentation">
                          <div
                            className="admin-status-bar-fill"
                            style={{ width: `${pct}%`, background: STATUS_COLOR[st] }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="admin-panel" aria-labelledby="dash-recent">
              <div className="admin-panel-head">
                <h2 id="dash-recent" className="admin-panel-titulo">
                  Últimos pedidos
                </h2>
                <Link to="/admin/pedidos" className="admin-panel-link">
                  Ver todos
                </Link>
              </div>
              {ultimosPedidos.length === 0 ? (
                <p className="admin-panel-vazio">Nenhum pedido ainda.</p>
              ) : (
                <div className="admin-table-wrap admin-table-wrap-flush">
                  <table className="admin-table admin-table-compact">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cliente</th>
                        <th>Itens</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosPedidos.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <Link to="/admin/pedidos" className="admin-table-id">
                              #{p.id}
                            </Link>
                          </td>
                          <td className="admin-table-ellipsis" title={p.nome_cliente}>
                            {p.nome_cliente}
                          </td>
                          <td>{p.itens_count}</td>
                          <td>{formatarPreco(p.total)}</td>
                          <td>
                            <span
                              className="admin-status-pill"
                              style={{ background: `${STATUS_COLOR[p.status] ?? '#64748b'}22`, color: STATUS_COLOR[p.status] ?? '#64748b' }}
                            >
                              {STATUS_LABEL[p.status] ?? p.status}
                            </span>
                          </td>
                          <td>{new Date(p.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
