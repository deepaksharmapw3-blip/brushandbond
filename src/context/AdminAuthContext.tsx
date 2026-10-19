import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
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

/**
 * Mock admin users for development
 * In production, this will be replaced with Supabase Auth
 */
const MOCK_ADMIN_USERS: Record<string, { password: string; user: AdminUser }> = {
  'admin@brushandbond.local': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      email: 'admin@brushandbond.local',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  },
  'editor@brushandbond.local': {
    password: 'editor123',
    user: {
      id: 'editor-001',
      email: 'editor@brushandbond.local',
      name: 'Editor User',
      role: 'editor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
    },
  },
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading on mount
  useEffect(() => {
    const checkSession = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const stored = localStorage.getItem('bb-admin-session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          setUser(session);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('bb-admin-session');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const adminRecord = MOCK_ADMIN_USERS[email.toLowerCase()];

      if (!adminRecord) {
        throw new Error('Admin account not found. Try admin@brushandbond.local / admin123');
      }

      if (adminRecord.password !== password) {
        throw new Error('Invalid password. Try admin123');
      }

      const authenticatedUser = adminRecord.user;
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('bb-admin-session', JSON.stringify(authenticatedUser));
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bb-admin-session');
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
