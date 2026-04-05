import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Usuario } from '../types';

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
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        // Fetch extra data from Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', fbUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : { tipo: 'cliente' };
        
        setUsuario({
          id: fbUser.uid as any,
          nome: fbUser.displayName || userData.nome || fbUser.email?.split('@')[0] || 'Usuário',
          email: fbUser.email!,
          tipo: userData.tipo || 'cliente'
        });
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email: string, senha: string) {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async function logout() {
    await signOut(auth);
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
