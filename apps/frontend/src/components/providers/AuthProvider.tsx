'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'ADMIN' | 'KITCHEN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        // Security best practice: No almacenar JWT en localStorage.
        // El token se envía automáticamente vía cookie httpOnly,
        // lo que previene exfiltración por XSS (ISO 25010 - Security).
        const userData = await fetchApi('/auth/me');
        setUser(userData);
      } catch {
        // Sin sesión activa — estado por defecto
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials: any) => {
    // Security: El backend setea la cookie httpOnly automáticamente.
    // No almacenamos el token en localStorage — la cookie viaja sola.
    const { user: userData } = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setUser(userData);

    const role = userData.role;
    if (role === 'ADMIN') {
      router.replace('/paneladmin');
    } else if (role === 'KITCHEN') {
      router.replace('/panelkitchen');
    } else {
      router.replace('/panel');
    }
  };

  const logout = async () => {
    try {
      // Security: El backend limpia la cookie httpOnly
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpieza local de estado
      sessionStorage.clear();
      setUser(null);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
