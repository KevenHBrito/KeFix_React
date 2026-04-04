import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCarrinho } from '../context/CarrinhoContext';

export default function Header() {
  const { usuario, logout } = useAuth();
  const { totalItens } = useCarrinho();
  const [busca, setBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`);
      setBusca('');
    }
  }

  return (
    <header className="header">
      <div className="header-top">
        <span>🚚 Frete grátis em compras acima de R$ 299 | Entrega para todo Brasil</span>
      </div>
      <nav className="header-nav">
        <div className="container header-inner">
          <Link to="/" className="logo">Ke<span>Fix</span></Link>

          <form onSubmit={handleBusca} className="search-form">
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar peças, modelos..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <Search size={18} />
            </button>
          </form>

          <div className="header-actions">
            <Link to="/carrinho" className="btn-icon cart-btn">
              <ShoppingCart size={22} />
              {totalItens > 0 && <span className="cart-badge">{totalItens}</span>}
            </Link>

            {usuario ? (
              <div className="user-menu">
                <button className="btn-icon">
                  <User size={22} />
                  <span className="user-name">{usuario.nome.split(' ')[0]}</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/minha-conta"><User size={15} /> Minha Conta</Link>
                  {usuario.tipo === 'admin' && (
                    <Link to="/admin"><Settings size={15} /> Painel Admin</Link>
                  )}
                  <button onClick={logout}><LogOut size={15} /> Sair</button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="btn-outline-sm">Entrar</Link>
            )}

            <button className="menu-toggle" onClick={() => setMenuAberto(!menuAberto)}>
              {menuAberto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuAberto && (
          <div className="mobile-menu">
            <form onSubmit={handleBusca}>
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar peças..."
              />
              <button type="submit"><Search size={16} /></button>
            </form>
            <Link to="/" onClick={() => setMenuAberto(false)}>Início</Link>
            <Link to="/categorias" onClick={() => setMenuAberto(false)}>Categorias</Link>
            <Link to="/carrinho" onClick={() => setMenuAberto(false)}>Carrinho ({totalItens})</Link>
            {usuario ? (
              <>
                <Link to="/minha-conta" onClick={() => setMenuAberto(false)}>Minha Conta</Link>
                {usuario.tipo === 'admin' && <Link to="/admin" onClick={() => setMenuAberto(false)}>Admin</Link>}
                <button onClick={() => { logout(); setMenuAberto(false); }}>Sair</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuAberto(false)}>Entrar / Cadastrar</Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
