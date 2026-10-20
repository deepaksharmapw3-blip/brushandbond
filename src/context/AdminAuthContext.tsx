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

const MOCK_ADMIN_USERS: Record<string, { password: string; user: AdminUser }> = {
  'admin@gcectart.club': {
    password: 'Admin@ArtClub2026',
    user: {
      id: 'admin-001',
      email: 'admin@gcectart.club',
      name: 'GCECT Art Club Admin',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gcectadmin',
    },
  },
  'admin@brushandbond.local': {
    password: 'admin123',
    user: {
      id: 'admin-002',
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

  // Check stored session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bb-admin-session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.email) {
          setUser(session);
          setIsAuthenticated(true);
        }
      }
    } catch {
      localStorage.removeItem('bb-admin-session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      let authenticatedUser: AdminUser | null = null;
      let token = 'mock-jwt-token-for-dev';

      // 1. Try real backend login first
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            token = data.token;
            authenticatedUser = {
              id: String(data.admin?.id || 'admin-001'),
              email: data.admin?.email || trimmedEmail,
              name: data.admin?.name || 'GCECT Art Club Admin',
              role: 'admin',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gcectadmin',
            };
          }
        }
      } catch (err) {
        console.warn('Backend login unavailable, falling back to local credentials', err);
      }

      // 2. Fallback to mock credentials if backend was offline or returned error
      if (!authenticatedUser) {
        const adminRecord = MOCK_ADMIN_USERS[trimmedEmail];
        if (!adminRecord) {
          throw new Error('Admin account not found. Try admin@gcectart.club / Admin@ArtClub2026');
        }
        if (adminRecord.password !== password) {
          throw new Error('Invalid password. Try Admin@ArtClub2026 or admin123');
        }
        authenticatedUser = adminRecord.user;
      }

      // Store tokens and session
      localStorage.setItem('bb-auth-token', token);
      localStorage.setItem('bb-admin-token', token);
      localStorage.setItem('bb-admin-session', JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      setIsAuthenticated(true);
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('bb-auth-token');
      localStorage.removeItem('bb-admin-token');
      localStorage.removeItem('bb-admin-session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bb-auth-token');
    localStorage.removeItem('bb-admin-token');
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
