import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  waPhone?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await apiClient<{ data: User }>('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (data: any) => {
    const response = await apiClient<{ data: User }>('/auth/login', {
      method: 'POST',
      body: data,
    });
    setUser(response.data);
  };

  const register = async (data: any) => {
    const response = await apiClient<{ data: User }>('/auth/register', {
      method: 'POST',
      body: data,
    });
    setUser(response.data);
  };

  const logout = async () => {
    await apiClient('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
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
