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
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token) {
        try {
          const userData = await fetchApi('/auth/me');
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else if (userStr) {
        localStorage.removeItem('user');
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (credentials: any) => {
    try {
      const { user: userData, token } = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      const role = userData.role;
      if (role === "ADMIN") {
        router.replace("/paneladmin");
      } else if (role === "KITCHEN") {
        router.replace("/panelkitchen");
      } else {
        router.replace("/panel");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
