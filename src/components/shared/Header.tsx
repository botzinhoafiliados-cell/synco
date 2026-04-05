"use client";

import React from 'react';
import { Search, Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface HeaderProps {
    onMobileMenuToggle?: () => void;
    user?: {
        full_name?: string;
        email?: string;
    };
}

export default function Header({ onMobileMenuToggle, user }: HeaderProps) {
    const displayName = user?.full_name || 'Usuário';
    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle}>
                    <Menu className="w-5 h-5" />
                </Button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar produtos, campanhas, templates..." className="pl-9 w-[320px] bg-muted/50 border-0" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                        <div className="p-3 border-b">
                            <p className="font-semibold text-sm">Notificações</p>
                        </div>
                        <DropdownMenuItem className="p-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Automação executada</p>
                                <p className="text-xs text-muted-foreground">Comissão Alta Automática enviou 10 produtos</p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Campanha concluída</p>
                                <p className="text-xs text-muted-foreground">Flash Friday finalizada com sucesso</p>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 pl-2 pr-3 h-10">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden md:inline">{displayName}</span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <div className="px-3 py-2 border-b">
                            <p className="text-sm font-medium">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                        </div>
                        <DropdownMenuItem asChild>
                            <Link href="/settings?tab=profile" className="flex items-center cursor-pointer">
                                <User className="w-4 h-4 mr-2" />
                                Meu Perfil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings?tab=affiliates" className="flex items-center cursor-pointer">
                                <span className="w-4 h-4 mr-2 text-center text-xs">🛍️</span>
                                Programas de Afiliado
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings?tab=org" className="flex items-center cursor-pointer">
                                <span className="w-4 h-4 mr-2 text-center text-xs">🏢</span>
                                Organização
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
