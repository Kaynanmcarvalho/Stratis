import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase.config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  role: 'admin_platform' | 'owner' | 'user';
  companyId: string;
  funcionarioId?: string;
  cargoId?: string;  // Alpha 11.0.0 - Sistema de Permissões Granulares
  nome: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Se for funcionário (role: user), buscar dados do funcionário
            let funcionarioId: string | undefined;
            let cargoId: string | undefined;
            
            if (userData.role === 'user') {
              const funcionariosSnapshot = await getDoc(
                doc(db, `companies/${userData.companyId}/funcionarios`, firebaseUser.uid)
              );
              if (funcionariosSnapshot.exists()) {
                funcionarioId = funcionariosSnapshot.id;
                const funcionarioData = funcionariosSnapshot.data();
                cargoId = funcionarioData?.cargoId;  // Alpha 11.0.0 - Cargo do funcionário
              }
            }
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role,
              companyId: userData.companyId,
              funcionarioId,
              cargoId,  // Alpha 11.0.0 - Sistema de Permissões Granulares
              nome: userData.name || firebaseUser.displayName || '',
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
        setFirebaseUser(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
