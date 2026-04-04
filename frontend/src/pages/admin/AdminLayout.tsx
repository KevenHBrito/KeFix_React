import { useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { usuario, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!loading && (!usuario || usuario.tipo !== 'admin')) {
      navigate('/auth');
    }
  }, [usuario, loading]);

  const links = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/produtos', label: 'Produtos', icon: <Package size={18} /> },
    { to: '/admin/pedidos', label: 'Pedidos', icon: <ShoppingBag size={18} /> },
    { to: '/admin/categorias', label: 'Categorias', icon: <Tag size={18} /> },
  ];

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Smartphone size={22} />
          <span>Ke<strong>Fix</strong> Admin</span>
        </div>
        <nav className="admin-nav">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`admin-nav-link ${pathname === l.to ? 'ativo' : ''}`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>
        <button className="admin-logout" onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={16} /> Sair
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
