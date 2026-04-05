import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

export default function PageHeader({ title, description, icon, actions, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
                {icon && <div className="mt-1">{icon}</div>}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
            </div>
            {(actions || children) && (
                <div className="flex items-center gap-2 flex-wrap">
                    {actions}
                    {children}
                </div>
            )}
        </div>
    );
}
