'use client';

import React from 'react';
import { Channel } from '@/types/group';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Send, MessageCircle, QrCode, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WasenderConnectionDialog } from './WasenderConnectionDialog';

interface ChannelListProps {
  channels: Channel[];
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
}

export function ChannelList({ channels, onEdit, onDelete }: ChannelListProps) {
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);
  const [isConnectOpen, setIsConnectOpen] = React.useState(false);

  const handleConnect = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsConnectOpen(true);
  };

  const getStatusBadge = (config: any) => {
    const status = config?.status || 'disconnected';
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      'connected': { label: 'Conectado', color: 'bg-green-50 text-green-700 border-green-200', icon: <Wifi size={10} /> },
      'disconnected': { label: 'Pendente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <AlertCircle size={10} /> },
      'qrcode_pending': { label: 'Aguardando Scan', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <QrCode size={10} /> },
      'session_lost': { label: 'Sessão Perdida', color: 'bg-red-50 text-red-700 border-red-200', icon: <WifiOff size={10} /> },
      'sync_failed': { label: 'Falha Sinc.', color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle size={10} /> },
    };

    const cfg = statusMap[status] || statusMap.disconnected;
    return (
      <Badge variant="outline" className={`${cfg.color} gap-1 font-bold text-[10px] uppercase tracking-wider`}>
        {cfg.icon} {cfg.label}
      </Badge>
    );
  };

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Send className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">Nenhum canal encontrado</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
          Você ainda não cadastrou nenhum canal de envio. Crie seu primeiro canal para começar a organizar seus grupos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status / Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel) => (
            <TableRow key={channel.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-semibold">{channel.name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                   {getStatusBadge(channel.config)}
                   <div className="flex items-center gap-2">
                    {channel.type === 'whatsapp' ? (
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <MessageCircle size={10} /> WHATSAPP
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Send size={10} /> TELEGRAM
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                {channel.description || <span className="text-muted-foreground/50 italic">Sem descrição</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                   {channel.type === 'whatsapp' && (
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => handleConnect(channel)}
                       className="h-8 font-bold text-[10px] uppercase bg-kinetic-orange/5 border-kinetic-orange/20 text-kinetic-orange hover:bg-kinetic-orange hover:text-white"
                     >
                       Conectar
                     </Button>
                   )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onEdit(channel)} className="gap-2 cursor-pointer">
                        <Edit size={14} className="text-primary" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(channel)} 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
                      >
                        <Trash2 size={14} /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedChannel && (
        <WasenderConnectionDialog 
          isOpen={isConnectOpen}
          onClose={() => setIsConnectOpen(false)}
          channel={selectedChannel}
        />
      )}
    </div>
  );
}
