-- ==========================================
-- SCRIPT: Setup Supabase Vault para Shopee
-- ==========================================
-- Rode isso no SQL Editor do seu painel do Supabase.

-- 1. Ativa a extensão Vault nativa do Supabase (ignora se já estiver ativa)
CREATE EXTENSION IF NOT EXISTS vault WITH SCHEMA vault;

-- 2. Concede acesso aos metadados do Vault para o schema public trabalhar se criar triggers (opcional)
-- GRANT USAGE ON SCHEMA vault TO postgres;

-- 3. Adiciona as colunas para o App ID e para o ponteiro do Secret
ALTER TABLE public.user_marketplaces 
ADD COLUMN IF NOT EXISTS shopee_app_id text,
ADD COLUMN IF NOT EXISTS shopee_app_secret_id uuid;

-- Nota: não fazemos REFERENCES direto pra vault.secrets por restrições de permissões em alguns tiers, 
-- mas o ID armazenado aqui ligará logicamente ao secret no vault.

-- 4. Função Segura (SECURITY DEFINER) para o Frontend injetar o Secret no Vault sem permissão direta
CREATE OR REPLACE FUNCTION set_shopee_secret(p_marketplace_id uuid, p_secret text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_id uuid;
BEGIN
  -- 1. Cria ou atualiza o secret no vault
  SELECT id INTO v_secret_id FROM vault.create_secret(p_secret, 'Shopee API Secret - User: ' || auth.uid());
  
  -- 2. Salva o ponteiro na tabela do usuário (O upsert básico já deve ter ocorrido)
  UPDATE public.user_marketplaces 
  SET shopee_app_secret_id = v_secret_id 
  WHERE user_id = auth.uid() AND marketplace_id = p_marketplace_id;
END;
$$;

