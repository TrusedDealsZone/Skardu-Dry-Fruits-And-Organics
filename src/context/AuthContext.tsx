import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isCustomer: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dryfruit_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dryfruit_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then(userData => {
          setUser(userData);
          localStorage.setItem('dryfruit_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to sign in' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dryfruit_token', data.token);
      localStorage.setItem('dryfruit_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to sign up' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dryfruit_token', data.token);
      localStorage.setItem('dryfruit_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dryfruit_token');
    localStorage.removeItem('dryfruit_user');
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isCustomer, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
