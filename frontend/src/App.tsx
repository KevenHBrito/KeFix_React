import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import Header from './components/Header';
import { Footer } from './components/Footer';

import Home from './pages/Home';
import ProdutoPage from './pages/Produto';
import CategoriaPage from './pages/Categoria';
import BuscaPage from './pages/Busca';
import CarrinhoPage from './pages/Carrinho';
import ConfirmacaoPage from './pages/Confirmacao';
import AuthPage from './pages/Auth';
import MinhaContaPage from './pages/MinhaConta';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProdutos from './pages/admin/Produtos';
import AdminPedidos from './pages/admin/Pedidos';
import AdminCategorias from './pages/admin/Categorias';

function StoreLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<ProdutoPage />} />
        <Route path="/categoria/:slug" element={<CategoriaPage />} />
        <Route path="/categoria" element={<CategoriaPage />} />
        <Route path="/busca" element={<BuscaPage />} />
        <Route path="/carrinho" element={<CarrinhoPage />} />
        <Route path="/confirmacao/:id" element={<ConfirmacaoPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/minha-conta" element={<MinhaContaPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarrinhoProvider>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="produtos" element={<AdminProdutos />} />
              <Route path="pedidos" element={<AdminPedidos />} />
              <Route path="categorias" element={<AdminCategorias />} />
            </Route>
            <Route path="/*" element={<StoreLayout />} />
          </Routes>
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
