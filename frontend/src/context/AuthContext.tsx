import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../utils/api";
import type { Usuario } from "../types";

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ usuario: Usuario | null }>("/auth/me")
      .then((r) => setUsuario(r.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, senha: string) {
    const r = await api.post<{ usuario: Usuario }>("/auth/login", { email, senha });
    setUsuario(r.usuario);
  }

  async function logout() {
    await api.post("/auth/logout", {});
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
