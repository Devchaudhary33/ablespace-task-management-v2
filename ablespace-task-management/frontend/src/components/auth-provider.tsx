'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, User } from '../lib/api';

type AuthContextType = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  guest: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ablespace_token');
      const storedUser = localStorage.getItem('ablespace_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUserState(JSON.parse(storedUser) as User);
      }
    } finally {
      setReady(true);
    }
  }, []);

  const save = (nextToken: string, nextUser: User) => {
    localStorage.setItem('ablespace_token', nextToken);
    localStorage.setItem('ablespace_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUserState(nextUser);
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    ready,
    login: async (email, password) => {
      const result = await authApi.login(email, password);
      save(result.accessToken, result.user);
    },
    register: async (name, email, password) => {
      const result = await authApi.register(name, email, password);
      save(result.accessToken, result.user);
    },
    guest: async () => {
      const result = await authApi.guest();
      save(result.accessToken, result.user);
    },
    logout: () => {
      localStorage.removeItem('ablespace_token');
      localStorage.removeItem('ablespace_user');
      setToken(null);
      setUserState(null);
    },
    setUser: (nextUser) => {
      localStorage.setItem('ablespace_user', JSON.stringify(nextUser));
      setUserState(nextUser);
    },
  }), [ready, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
