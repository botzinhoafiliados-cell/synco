-- 20240407000002_channel_secrets.sql
-- Tabela isolada para segredos de canais Wasender

CREATE TABLE IF NOT EXISTS public.channel_secrets (
    id UUID PRIMARY KEY REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_api_key TEXT NOT NULL,
    webhook_secret TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.channel_secrets ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem gerenciar seus próprios segredos"
    ON public.channel_secrets
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_channel_secrets_updated_at 
    BEFORE UPDATE ON public.channel_secrets 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
