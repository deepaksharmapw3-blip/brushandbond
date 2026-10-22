import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
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
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi.getMe()
      .then(({ admin }) => setUser(admin))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { admin } = await authApi.login(email, password);
      setUser(admin);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    void authApi.logout().catch((error) => console.error('Could not end the admin session:', error));
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated: Boolean(user), user, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
