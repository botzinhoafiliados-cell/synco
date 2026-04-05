import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: number;
    className?: string;
}

export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    className 
}: StatCardProps) {
    return (
        <Card className={cn("p-5 relative overflow-hidden group hover:shadow-md transition-shadow", className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    {trend !== undefined && (
                        <p className={cn("text-xs font-medium", trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground")}>
                            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% vs ontem
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                )}
            </div>
        </Card>
    );
}
