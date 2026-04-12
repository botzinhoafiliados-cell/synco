-- supabase/migrations/20240412000003_automation_pipeline.sql

-- 1. Tabela de Fontes de Automação (Origens)
CREATE TABLE IF NOT EXISTS public.automation_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
    external_group_id TEXT, -- JID do grupo ou ID externo
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('group_monitor', 'radar_offers')),
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Rotas de Automação (Destinos e Regras)
CREATE TABLE IF NOT EXISTS public.automation_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.automation_sources(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('group', 'list')),
    target_id UUID NOT NULL, -- UUID de um grupo ou de uma lista_destino
    template_id UUID, -- Referência opcional a uma tabela de templates se existir
    is_active BOOLEAN DEFAULT true,
    filters JSONB DEFAULT '{}'::jsonb,
    template_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Deduplicação (Evitar duplicatas e loops)
CREATE TABLE IF NOT EXISTS public.automation_dedupe (
    hash_key TEXT PRIMARY KEY, -- MD5 de ingestão ou destino
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Logs de Automação (Observabilidade)
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.automation_sources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('captured', 'filtered', 'processed', 'error')),
    event_type TEXT NOT NULL, -- Ex: 'product_found', 'price_too_low', 'sent_to_job'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Segurança (RLS)
ALTER TABLE public.automation_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
-- automation_dedupe geralmente é gerenciado pelo sistema, mas permitimos leitura se necessário

-- Políticas para automation_sources
CREATE POLICY "Users can view own automation sources" ON public.automation_sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation sources" ON public.automation_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation sources" ON public.automation_sources
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automation sources" ON public.automation_sources
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para automation_routes (Através do owner da source)
CREATE POLICY "Users can manage own automation routes" ON public.automation_routes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.automation_sources
            WHERE id = automation_routes.source_id AND user_id = auth.uid()
        )
    );

-- Políticas para automation_logs
CREATE POLICY "Users can view own automation logs" ON public.automation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs" ON public.automation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_automation_sources_user ON public.automation_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_sources_external ON public.automation_sources(channel_id, external_group_id);
CREATE INDEX IF NOT EXISTS idx_automation_routes_source ON public.automation_routes(source_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_source ON public.automation_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_automation_dedupe_expire ON public.automation_dedupe(created_at);

-- 7. Correção de Schema legado (se necessário)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='destination_lists' AND column_name='description') THEN
        ALTER TABLE public.destination_lists ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='destination_lists' AND column_name='icon') THEN
        ALTER TABLE public.destination_lists ADD COLUMN icon TEXT;
    END IF;
END $$;

-- 8. Trigger para Updated At
CREATE TRIGGER update_automation_sources_updated_at BEFORE UPDATE ON public.automation_sources FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_automation_routes_updated_at BEFORE UPDATE ON public.automation_routes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
