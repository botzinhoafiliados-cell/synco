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
import { MoreHorizontal, Edit, Trash2, Send, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChannelListProps {
  channels: Channel[];
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
}

export function ChannelList({ channels, onEdit, onDelete }: ChannelListProps) {
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
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel) => (
            <TableRow key={channel.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-semibold">{channel.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {channel.type === 'whatsapp' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium px-2 py-0.5">
                      <MessageCircle size={12} /> WhatsApp
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium px-2 py-0.5">
                      <Send size={12} /> Telegram
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                {channel.description || <span className="text-muted-foreground/50 italic">Sem descrição</span>}
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
