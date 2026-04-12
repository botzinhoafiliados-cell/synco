'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/use-groups';
import { useChannels } from '@/hooks/use-channels';
import { GroupList } from '@/components/groups/GroupList';
import { GroupDialog } from '@/components/groups/GroupDialog';
import { Group } from '@/types/group';
import { Button } from '@/components/ui/button';
import { Plus, Users, Search, RefreshCw, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import LayoutContainer from '@/components/layout/LayoutContainer';
import PageHeader from '@/components/shared/PageHeader';
import { KineticButton } from '@/components/ui/KineticButton';

export default function GruposPage() {
  const { user } = useAuth();
  const { data: groups, isLoading: isLoadingGroups, isError: isErrorGroups, refetch: refetchGroups } = useGroups(user?.id);
  const { data: channels, isLoading: isLoadingChannels } = useChannels(user?.id);
  
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    setEditingGroup(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const handleDelete = (group: Group) => {
    if (window.confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) {
      deleteGroup.mutate({ id: group.id, user_id: user?.id as string });
    }
  };

  const handleSubmit = (data: any) => {
    if (editingGroup) {
      updateGroup.mutate({
        id: editingGroup.id,
        user_id: user?.id as string,
        ...data,
      }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      createGroup.mutate({
        user_id: user?.id as string,
        ...data,
      }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = isLoadingGroups || isLoadingChannels;

  return (
    <LayoutContainer type="operational">
      <PageHeader 
        title="Grupos"
        description="Gestão de vetores de destino. Organize seus grupos por canal e categoria operacional."
        icon={<Users size={24} />}
        actions={
          <KineticButton onClick={handleCreate} className="gap-2 px-6 h-12">
            <Plus size={18} /> Novo Grupo
          </KineticButton>
        }
      />

      <div className="flex items-center gap-4 bg-anthracite-surface p-4 rounded-2xl border-none shadow-skeuo-flat mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <Input 
            placeholder="Buscar por nome, ID ou descrição..." 
            className="pl-10 bg-white/5 border-none shadow-skeuo-pressed"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => refetchGroups()} 
          className="shrink-0 h-12 w-12 rounded-xl bg-white/5 border border-white/5"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin text-kinetic-orange" : "text-white/40"} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[80px] w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-[80px] w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-[80px] w-full rounded-2xl bg-white/5" />
        </div>
      ) : isErrorGroups ? (
        <div className="p-12 text-center bg-red-500/5 rounded-[40px] border border-red-500/10">
          <p className="text-red-500 font-black uppercase tracking-widest text-sm italic">Erro de Sincronização</p>
          <p className="text-white/20 text-xs mt-1">Não foi possível carregar os dados operacionais dos grupos.</p>
          <Button variant="link" onClick={() => refetchGroups()} className="text-kinetic-orange mt-4 uppercase font-bold text-[10px] tracking-widest">Tentar novamente</Button>
        </div>
      ) : (
        <GroupList 
          groups={filteredGroups || []} 
          channels={channels || []}
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      <GroupDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingGroup}
        isSubmitting={createGroup.isPending || updateGroup.isPending}
      />
    </LayoutContainer>
  );
}
