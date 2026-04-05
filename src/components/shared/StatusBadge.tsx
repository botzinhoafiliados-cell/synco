import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/mock/mock-data';

const colorMap: Record<string, string> = {
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: status, color: "blue" };
    return (
        <Badge variant="outline" className={`${colorMap[config.color] || colorMap.blue} font-medium text-xs`}>
            {config.label}
        </Badge>
    );
}
