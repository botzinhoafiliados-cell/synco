-- 20240412000006_fix_group_constraints.sql
-- Adiciona a restrição de unicidade necessária para o MESH SYNC em public.groups

DO $$ 
BEGIN
    -- 1. Tentar adicionar a restrição de unicidade
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'groups_channel_id_remote_id_key'
    ) THEN
        ALTER TABLE public.groups 
        ADD CONSTRAINT groups_channel_id_remote_id_key UNIQUE (channel_id, remote_id);
    END IF;
END $$;

-- 2. Garantir que remote_id não seja nulo para grupos sincronizados
-- Nota: grupos manuais legados podem ter remote_id nulo, mas o sync exige este campo.
-- Não aplicaremos NOT NULL agora para evitar quebra de dados legados, 
-- mas o índice único já protegerá a integridade do sync.
