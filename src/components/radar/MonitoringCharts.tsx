"use client";

import React from 'react';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';

interface MonitoringChartsProps {
    hourlyData: any[];
    sourceData: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function MonitoringCharts({ hourlyData, sourceData }: MonitoringChartsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Fluxo por Hora */}
            <div className="h-64 w-full">
                <p className="text-xs font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Volume de Interceptação (24h)</p>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="hour" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#64748b'}} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#64748b'}} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line 
                            type="monotone" 
                            dataKey="intercepted" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#3b82f6' }} 
                            activeDot={{ r: 6 }} 
                            name="Interceptados"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="sent" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#10b981' }} 
                            name="Enviados"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top Fontes */}
            <div className="h-64 w-full">
                <p className="text-xs font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Top Fontes (Conversão)</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#64748b'}} 
                            width={100}
                        />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} name="Volume">
                            {sourceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
