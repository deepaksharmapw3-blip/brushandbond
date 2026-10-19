import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export interface AdminUser {
  id: string | number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer' | string;
  avatar?: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored session on mount
  useEffect(() => {
    const checkSession = async () => {
      const stored = localStorage.getItem('bb-admin-session');
      const token = localStorage.getItem('bb-admin-token');
      if (stored && token) {
        try {
          const session = JSON.parse(stored);
          setUser(session);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('bb-admin-session');
          localStorage.removeItem('bb-admin-token');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Try real backend login
      const res = await authApi.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('bb-admin-token', res.token);
        const adminUser: AdminUser = {
          id: res.admin.id,
          email: res.admin.email,
          name: res.admin.name,
          role: res.admin.role.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.admin.email}`,
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('bb-admin-session', JSON.stringify(adminUser));
        return;
      }
      throw new Error('Authentication failed');
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('bb-admin-token');
      localStorage.removeItem('bb-admin-session');
      throw new Error(error.message || 'Invalid credentials. Use admin@gcectart.club / Admin@ArtClub2026');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bb-admin-session');
    localStorage.removeItem('bb-admin-token');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
