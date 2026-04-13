-- 20240413000001_add_group_owner_column.sql
-- Adiciona suporte a Dono do Grupo e garante integridade para Malha Profunda

-- 1. Adicionar coluna owner se não existir
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS owner TEXT;

-- 2. Garantir contadores com valores default seguros
ALTER TABLE public.groups 
ALTER COLUMN members_count SET DEFAULT 0,
ALTER COLUMN admin_count SET DEFAULT 0;

-- 3. Auditoria de constraints para UPSERT (Safe Check)
DO $$ 
BEGIN
    -- unique(channel_id, remote_id) para groups
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'groups_channel_remote_unique') THEN
        ALTER TABLE public.groups 
        ADD CONSTRAINT groups_channel_remote_unique UNIQUE (channel_id, remote_id);
    END IF;

    -- contacts já tem UNIQUE(channel_id, remote_id) na migração 05
    -- group_participants já tem PRIMARY KEY (group_id, contact_id) na migração 05
END $$;
