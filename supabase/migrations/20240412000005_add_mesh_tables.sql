-- 20240412000005_add_mesh_tables.sql
-- Expansão da infraestrutura SYNCO para suporte a Malha Completa do Canal.

-- 1. Expansão da tabela public.groups
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS invite_link TEXT,
ADD COLUMN IF NOT EXISTS admin_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS remote_created_at TIMESTAMPTZ;

-- 2. Criação da tabela public.contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    remote_id TEXT NOT NULL, -- JID do WhatsApp
    name TEXT,
    push_name TEXT,
    avatar_url TEXT,
    is_saved BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, remote_id)
);

-- 3. Criação da tabela public.group_participants
CREATE TABLE IF NOT EXISTS public.group_participants (
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, admin, creator
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, contact_id)
);

-- 4. Triggers updated_at para contacts
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at 
BEFORE UPDATE ON public.contacts 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_remote_id ON public.contacts(remote_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_group_id ON public.group_participants(group_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_contact_id ON public.group_participants(contact_id);

-- 6. RLS para novas tabelas
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;
  CREATE POLICY "Users can manage their own contacts"
    ON public.contacts FOR ALL USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view participants of their groups" ON public.group_participants;
  CREATE POLICY "Users can view participants of their groups"
    ON public.group_participants FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND user_id = auth.uid())
    );
END $$;
