-- 20240412000002_campaign_performance_indexes.sql
-- Migration: Performance de monitoramento de campanhas

-- 1. Índice composto para agregação rápida por status em cada campanha
CREATE INDEX IF NOT EXISTS idx_send_jobs_campaign_status 
ON public.send_jobs(campaign_id, status);

-- 2. Índice para ordenação por criação em listagem paginada
CREATE INDEX IF NOT EXISTS idx_send_jobs_campaign_created 
ON public.send_jobs(campaign_id, created_at DESC);

-- 3. Comentários para documentação
COMMENT ON INDEX idx_send_jobs_campaign_status IS 'Otimiza o agrupamento/count por status dentro de uma campanha.';
COMMENT ON INDEX idx_send_jobs_campaign_created IS 'Otimiza a listagem paginada de logs de envio de uma campanha.';
