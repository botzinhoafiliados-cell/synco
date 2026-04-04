'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getFakeUser, fakeLogout, type FakeUser } from '@/lib/auth/fake-auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: FakeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * AuthProvider — Fase 1 / Desenvolvimento
 *
 * Usa fake-auth para simular usuário sempre autenticado.
 * SERÁ SUBSTITUÍDO na Fase 6 por autenticação real Supabase.
 *
 * Origem: scr/lib/AuthContext.jsx do botBase (sem dependência @base44/sdk)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFakeUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    setUser(null);
    await fakeLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return context;
}
