import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Usuario } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  async function recarregar() {
    try {
      const data: any = await api.get('/auth/me');
      setUsuario(data.autenticado ? data.usuario : null);
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { recarregar(); }, []);

  async function login(email: string, senha: string) {
    const data: any = await api.post('/auth/login', { email, senha });
    setUsuario(data.usuario);
  }

  async function logout() {
    await api.post('/auth/logout', {});
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, recarregar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
