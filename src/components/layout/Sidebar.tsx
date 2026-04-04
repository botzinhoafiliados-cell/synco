'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NAV_SECTIONS,
  APP_ICON,
  APP_NAME,
} from '@/lib/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Sidebar
 *
 * Migrado de: scr/components/layout/Sidebar.jsx (botBase)
 * Alterações:
 * - `Link` e `useLocation` (react-router-dom) → `Link` e `usePathname` (next/navigation)
 * - NAV_ITEMS flat → NAV_SECTIONS com separadores de seção
 * - Rotas em português (via navigation.ts)
 * - Zero dependências Base44
 */
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const AppIcon = APP_ICON;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar z-40 flex flex-col transition-all duration-300 border-r border-sidebar-border',
        collapsed ? 'w-[68px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <AppIcon className="w-3.5 h-3.5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sidebar-foreground font-bold text-sm tracking-tight whitespace-nowrap">
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            {!collapsed && (
              <div className="pt-3 pb-1 px-2">
                <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-wider">
                  {section.label}
                </p>
              </div>
            )}
            {collapsed && <div className="pt-2" />}

            {/* Items */}
            {section.items.map((item) => {
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                      : item.highlight
                        ? 'text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <Icon
                    className={cn('w-4 h-4 flex-shrink-0', isActive && 'drop-shadow-sm')}
                  />
                  {!collapsed && (
                    <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {/* Tooltip em modo compacto */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <div className="p-2 border-t border-sidebar-border flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
