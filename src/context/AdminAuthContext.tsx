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

const resolveUser = async (supabaseUserId: string, email: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', supabaseUserId)
    .single();
  if (error || !profile || profile.role !== 'admin') return null;
  return {
    id: supabaseUserId,
    email,
    name: profile.full_name ?? email,
    role: 'admin' as const,
  };
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authIdentity, setAuthIdentity] = useState<{ id: string; email: string } | null>(null);
  const [hasSessionSnapshot, setHasSessionSnapshot] = useState(false);
  const [profileCheckNonce, setProfileCheckNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Only copy the auth identity in this callback. Supabase warns that awaiting
  // another Supabase request here can deadlock the client's auth lock. The
  // profile lookup below runs in a React effect after the callback returns.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const authUser = session?.user;
      setAuthIdentity(authUser ? { id: authUser.id, email: authUser.email ?? '' } : null);
      setAuthError(null);
      setHasSessionSnapshot(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Resolve the admin profile outside the auth callback. The active flag keeps
  // a stale request from restoring a user after sign-out or account switching.
  useEffect(() => {
    if (!hasSessionSnapshot) return;

    let active = true;
    if (!authIdentity) {
      // oxlint-disable-next-line react/set-state-in-effect -- Mirrors an external Supabase sign-out into React state; the active flag guards stale updates.
      setUser(null);
      setAuthError(null);
      setIsLoading(false);
      return () => { active = false; };
    }

    setIsLoading(true);
    resolveUser(authIdentity.id, authIdentity.email)
      .then((resolved) => {
        if (!active) return;
        setUser(resolved);
        setAuthError(null);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setAuthError('Could not reach Supabase. Check your connection and retry.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [authIdentity, hasSessionSnapshot, profileCheckNonce]);

  const retrySessionCheck = () => {
    setAuthError(null);
    setIsLoading(true);
    setProfileCheckNonce((nonce) => nonce + 1);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Login failed — no user returned.');
      const resolved = await resolveUser(data.user.id, data.user.email ?? email);
      if (!resolved) {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account does not have the admin role.');
      }
      setUser(resolved);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    void supabase.auth.signOut().catch((err: any) => console.error('Sign-out error:', err));
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated: Boolean(user), user, login, logout, isLoading, authError, retrySessionCheck }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components -- Keep the auth provider and its hook as one context API.
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
