'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, AuthResponse, LoginDto, RegisterDto } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Always fetch fresh user data from API
          const response = await api.get<User>('/users/profile');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // Token invalid, clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get<User>('/users/profile');
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const login = async (data: LoginDto) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    router.push('/dashboard');
  };

  const register = async (data: RegisterDto) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
