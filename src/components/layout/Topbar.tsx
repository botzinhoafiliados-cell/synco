'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Topbar
 *
 * Migrado de: scr/components/layout/Topbar.jsx (botBase)
 * Alterações:
 * - Removido: `import { base44 } from '@/api/base44Client'`
 * - Logout agora usa `useAuth().logout()` (fake-auth por enquanto)
 * - Links de settings ajustados para rotas pt-BR (/configuracoes)
 * - Removido import de componentes shadcn não disponíveis ainda (UI será Fase 2)
 *   → versão inline com HTML semântico e classes Tailwind diretas
 */
export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName = user?.full_name ?? 'Usuário';
  const initials = getInitials(displayName);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left — hamburger + search */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={onMobileMenuToggle}
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar produtos, campanhas, templates..."
            className={cn(
              'pl-9 pr-4 py-2 w-[320px] text-sm rounded-lg',
              'bg-muted/50 border-0 outline-none ring-0',
              'placeholder:text-muted-foreground',
              'focus:bg-muted focus:ring-1 focus:ring-ring transition-all'
            )}
            aria-label="Buscar"
          />
        </div>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-1">

        {/* Notificações */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            aria-label="Notificações"
            aria-expanded={notifOpen}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-72 bg-popover border border-border rounded-xl shadow-lg z-50 animate-fade-in">
                <div className="p-3 border-b border-border">
                  <p className="font-semibold text-sm">Notificações</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { title: 'Automação executada', desc: 'Comissão Alta Automática enviou 10 produtos' },
                    { title: 'Campanha concluída', desc: 'Flash Friday finalizada com sucesso' },
                    { title: 'Novo produto em alta', desc: 'Fone Bluetooth TWS com score 95' },
                  ].map((n) => (
                    <button
                      key={n.title}
                      className="w-full text-left p-3 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            aria-expanded={userMenuOpen}
            aria-label="Menu do usuário"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium hidden md:inline">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/configuracoes?tab=perfil"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                  <Link
                    href="/configuracoes?tab=afiliados"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="w-4 h-4 text-center text-xs">🛍️</span>
                    Programas de Afiliado
                  </Link>
                  <Link
                    href="/configuracoes?tab=organizacao"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="w-4 h-4 text-center text-xs">🏢</span>
                    Organização
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
