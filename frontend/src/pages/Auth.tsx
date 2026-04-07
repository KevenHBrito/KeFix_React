import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatarTelefone } from '../utils/formatters';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'cadastro'>(
    params.get('tab') === 'cadastro' ? 'cadastro' : 'login'
  );
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirma_senha: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) navigate(usuario.tipo === 'admin' ? '/admin' : '/');
  }, [usuario, navigate]);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    let valor = e.target.value;
    if (e.target.name === 'telefone') {
      valor = formatarTelefone(valor);
    }
    setForm({ ...form, [e.target.name]: valor });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      await login(form.email, form.senha);
      // Redirecionamento: useEffect envia admin → /admin e cliente → /
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      await api.post('/auth/cadastro', form);
      setSucesso('Cadastro realizado! Faça login para continuar.');
      setTab('login');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-main">
      <div className="auth-container">
        <div className="auth-logo">
          <h1 className="auth-brand">Ke<span>Fix</span></h1>
          <p>Distribuidora de Peças</p>
        </div>

        <div className="auth-tabs">
          <button className={tab === 'login' ? 'ativo' : ''} onClick={() => setTab('login')}>Entrar</button>
          <button className={tab === 'cadastro' ? 'ativo' : ''} onClick={() => setTab('cadastro')}>Cadastrar</button>
        </div>

        {erro && <div className="alerta alerta-erro">{erro}</div>}
        {sucesso && <div className="alerta alerta-sucesso">{sucesso}</div>}

        {tab === 'login' ? (
          <div className="auth-card">
            <form onSubmit={handleLogin}>
              <div className="campo">
                <label>E-mail</label>
                <input type="email" name="email" value={form.email} onChange={handle} placeholder="seu@email.com" required />
              </div>
              <div className="campo">
                <label>Senha</label>
                <input type="password" name="senha" value={form.senha} onChange={handle} placeholder="••••••" required />
              </div>
              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <p className="auth-link">Não tem conta? <button onClick={() => setTab('cadastro')}>Cadastre-se grátis</button></p>
          </div>
        ) : (
          <div className="auth-card">
            <form onSubmit={handleCadastro}>
              <div className="campo">
                <label>Nome completo *</label>
                <input type="text" name="nome" value={form.nome} onChange={handle} placeholder="Seu nome" required />
              </div>
              <div className="campo">
                <label>E-mail *</label>
                <input type="email" name="email" value={form.email} onChange={handle} placeholder="seu@email.com" required />
              </div>
              <div className="campo">
                <label>Telefone</label>
                <input type="tel" name="telefone" value={form.telefone} onChange={handle} placeholder="(44) 99999-9999" maxLength={15} />
              </div>
              <div className="campo">
                <label>Senha * (mín. 6 caracteres)</label>
                <input type="password" name="senha" value={form.senha} onChange={handle} minLength={6} required />
              </div>
              <div className="campo">
                <label>Confirmar senha *</label>
                <input type="password" name="confirma_senha" value={form.confirma_senha} onChange={handle} required />
              </div>
              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
            <p className="auth-link">Já tem conta? <button onClick={() => setTab('login')}>Entrar</button></p>
          </div>
        )}


      </div>
    </main>
  );
}
