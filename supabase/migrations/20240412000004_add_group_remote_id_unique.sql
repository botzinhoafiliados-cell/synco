-- 20240412000004_add_group_remote_id_unique.sql
-- Adiciona restrição de unicidade para (channel_id, remote_id) permitindo upsert eficiente.

-- 1. Remover eventuais duplicatas antes de criar o índice (mantendo o registro mais antigo)
DELETE FROM public.groups a
USING public.groups b
WHERE a.id > b.id
  AND a.channel_id = b.channel_id
  AND a.remote_id = b.remote_id;

-- 2. Criar o índice único
CREATE UNIQUE INDEX IF NOT EXISTS groups_channel_remote_idx ON public.groups (channel_id, remote_id);

-- 3. Adicionar a constraint se o índice foi criado com sucesso
-- Nota: Usando um bloco anônimo para segurança
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'groups_channel_remote_unique'
    ) THEN
        ALTER TABLE public.groups
        ADD CONSTRAINT groups_channel_remote_unique UNIQUE USING INDEX groups_channel_remote_idx;
    END IF;
END $$;
