import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/supabase/group-service';
import { Group } from '@/types/group';
import { toast } from 'sonner';

export function useGroups(userId: string | undefined) {
  return useQuery({
    queryKey: ['groups', userId],
    queryFn: () => userId ? groupService.list(userId) : Promise.resolve([]),
    enabled: !!userId,
  });
}

export function useGroupDetail(groupId: string, userId: string | undefined) {
  const queryClient = useQueryClient();

  // 1. Query para os metadados do grupo
  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => userId ? groupService.getById(groupId, userId) : Promise.resolve(null),
    enabled: !!userId && !!groupId,
  });

  // 2. Query para os participantes
  const participantsQuery = useQuery({
    queryKey: ['group-participants', groupId],
    queryFn: () => groupService.getParticipants(groupId),
    enabled: !!groupId,
  });

  // 3. Mutação para disparar o Deep Sync
  const syncMutation = useMutation({
    mutationFn: () => groupService.triggerDeepSync(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-participants', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
      toast.success('Malha do grupo sincronizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error syncing group mesh:', error);
      toast.error(`Falha ao sincronizar malha: ${error.message}`);
    }
  });

  return {
    group: groupQuery.data,
    participants: participantsQuery.data || [],
    isLoading: groupQuery.isLoading || participantsQuery.isLoading,
    isSyncing: syncMutation.isPending,
    sync: syncMutation.mutate,
    isError: groupQuery.isError || participantsQuery.isError
  };
}
