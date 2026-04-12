// src/hooks/use-campaigns.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/services/supabase/campaign-service';
import { CreateCampaignDTO } from '@/types/campaign';
import { toast } from 'sonner';

export function useCampaigns(userId?: string) {
  return useQuery({
    queryKey: ['campaigns', userId],
    queryFn: () => userId ? campaignService.list(userId) : Promise.resolve([]),
    enabled: !!userId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: CreateCampaignDTO }) => 
      campaignService.create(userId, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(`Campanha ${data.id.slice(0, 8)} criada com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Error creating campaign:', error);
      toast.error('Erro ao criar campanha: ' + error.message);
    }
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      campaignService.delete(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campanha excluída.');
    },
  });
}

export function useCampaignStats(campaignId?: string) {
  return useQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: () => campaignId ? campaignService.getStats(campaignId) : null,
    enabled: !!campaignId,
    refetchInterval: (query) => {
      const stats = query.state.data as any;
      // Se ainda houver jobs pendentes ou em processamento, continua o refresh a cada 3s
      return (stats?.pending > 0 || stats?.processing > 0) ? 3000 : false;
    }
  });
}

export function useCampaignJobs(campaignId: string | undefined, page: number = 1) {
  return useQuery({
    queryKey: ['campaign-jobs', campaignId, page],
    queryFn: () => campaignId ? campaignService.getJobsPaginated(campaignId, page) : null,
    enabled: !!campaignId,
  });
}
