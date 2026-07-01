import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  created_at?: string | null;
  is_verified: boolean;
};

type ProfileUpdate = {
  full_name?: string;
  email?: string;
  avatar_url?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (payload: ProfileUpdate) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'agrilens_local_user';
const DEFAULT_AVATAR_URL =
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=160';

function makeLocalUser(email: string, existing?: AuthUser | null): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackName = normalizedEmail.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Local Farmer';

  return {
    id: existing?.id ?? 'local-user',
    full_name: existing?.full_name || fallbackName,
    email: normalizedEmail,
    avatar_url: existing?.avatar_url ?? DEFAULT_AVATAR_URL,
    created_at: existing?.created_at ?? new Date().toISOString(),
    is_verified: true,
  };
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    writeStoredUser(user);
  }, [user]);

  const login = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      setUser(current => makeLocalUser(email, current));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    setUser(readStoredUser());
  }, []);

  const updateProfile = useCallback(async (payload: ProfileUpdate) => {
    setUser(current => {
      const base = current ?? makeLocalUser(payload.email ?? 'farmer@agrilens.local');
      return {
        ...base,
        full_name: payload.full_name?.trim() || base.full_name,
        email: payload.email?.trim().toLowerCase() || base.email,
        avatar_url: payload.avatar_url === undefined ? base.avatar_url : payload.avatar_url,
      };
    });
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, refreshMe, updateProfile, logout }),
    [user, loading, error, login, refreshMe, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
