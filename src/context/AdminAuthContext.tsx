import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiRequestError, authApi } from '../services/api';

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
  authError: string | null;
  retrySessionCheck: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sessionCheckVersion, setSessionCheckVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setAuthError(null);

    authApi.getMe()
      .then(({ admin }) => {
        if (active) setUser(admin);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setUser(null);
        // A 401 simply means there is no current session. Network and server
        // errors need to remain visible so an API outage is not mistaken for logout.
        if (!(error instanceof ApiRequestError && error.status === 401)) {
          setAuthError('Could not reach the admin API. Check the server connection and retry.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionCheckVersion]);

  const retrySessionCheck = () => setSessionCheckVersion((version) => version + 1);

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
    <AdminAuthContext.Provider value={{ isAuthenticated: Boolean(user), user, login, logout, isLoading, authError, retrySessionCheck }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
