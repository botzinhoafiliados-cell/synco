'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { TactileCard, TactileCardProps } from "./TactileCard"

interface StatCardProps extends TactileCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    positive?: boolean;
  };
  description?: string;
  variant?: "flat" | "elevated";
  colorScheme?: "default" | "kinetic" | "success" | "destructive";
}

/**
 * StatCard
 * 
 * Componente padronizado para exibir KPIs e métricas operacionais.
 * Usa TactileCard como base para manter a profundidade Skeuo.
 */
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, icon, trend, description, variant = "elevated", colorScheme = "default", ...props }, ref) => {
    return (
      <TactileCard
        ref={ref}
        variant={variant}
        className={cn(
          "p-5 flex flex-col justify-between group transition-all duration-300",
          colorScheme === "kinetic" && "border-kinetic-orange/10 bg-kinetic-orange/[0.03]",
          colorScheme === "success" && "border-emerald-500/10 bg-emerald-500/[0.03]",
          colorScheme === "destructive" && "border-red-500/10 bg-red-500/[0.03]",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">
            {label}
          </span>
          {icon && (
            <div className={cn(
              "p-2 rounded-lg bg-white/5 border border-white/5 shadow-skeuo-flat group-hover:shadow-glow-orange/10 transition-all",
              colorScheme === "kinetic" && "text-kinetic-orange",
              colorScheme === "success" && "text-emerald-500",
              colorScheme === "destructive" && "text-red-500",
              colorScheme === "default" && "text-white/40"
            )}>
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black italic text-white/90 font-headline tracking-tight">
              {value}
            </span>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight",
                trend.positive ? "text-emerald-500" : "text-red-500"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[9px] font-bold uppercase text-white/20 tracking-widest italic">
              {description}
            </p>
          )}
        </div>
      </TactileCard>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
