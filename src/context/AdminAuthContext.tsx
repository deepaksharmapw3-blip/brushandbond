import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  const resolveUser = async (supabaseUserId: string, email: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', supabaseUserId)
      .single();
    if (error || !profile) return null;
    return {
      id: supabaseUserId,
      email,
      name: profile.full_name ?? email,
      role: 'admin' as const,
    };
  };

  // Bootstrap: check existing session on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const resolved = await resolveUser(session.user.id, session.user.email ?? '');
        if (mounted) setUser(resolved);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }).catch(() => {
      if (mounted) {
        setAuthError('Could not reach Supabase. Check your connection and retry.');
        setIsLoading(false);
      }
    });

    // Subscribe to auth state changes (token refresh, sign-out from another tab, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const resolved = await resolveUser(session.user.id, session.user.email ?? '');
        setUser(resolved);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const retrySessionCheck = () => {
    setAuthError(null);
    setIsLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const resolved = await resolveUser(session.user.id, session.user.email ?? '');
        setUser(resolved);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }).catch(() => {
      setAuthError('Could not reach Supabase. Check your connection and retry.');
      setIsLoading(false);
    });
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Login failed — no user returned.');
      const resolved = await resolveUser(data.user.id, data.user.email ?? email);
      if (!resolved) throw new Error('Access denied. You are not a staff member.');
      setUser(resolved);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    void supabase.auth.signOut().catch((err) => console.error('Sign-out error:', err));
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated: Boolean(user), user, login, logout, isLoading, authError, retrySessionCheck }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
