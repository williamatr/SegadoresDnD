-- ==============================================================================
-- 02_rls_policies.sql - Políticas de Seguridad Row Level Security (RLS)
-- Define el control de acceso en Supabase para Jugadores, DM y Demo Pública
-- ==============================================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_characters ENABLE ROW LEVEL SECURITY;

-- 2. Función auxiliar para verificar si el usuario autenticado es DM
CREATE OR REPLACE FUNCTION public.is_dm()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS '
  SELECT EXISTS (
    SELECT 1 FROM public.players
    WHERE auth_user_id = auth.uid() AND role = ''dm''
  );
';

-- ==============================================================================
-- Políticas para: public.players
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura de jugadores autenticados" ON public.players;
CREATE POLICY "Lectura de jugadores autenticados"
ON public.players FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Actualizar propio perfil o DM" ON public.players;
CREATE POLICY "Actualizar propio perfil o DM"
ON public.players FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid() OR public.is_dm());

-- ==============================================================================
-- Políticas para: public.campaigns
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura de campañas activas" ON public.campaigns;
CREATE POLICY "Lectura de campañas activas"
ON public.campaigns FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Solo el DM gestiona campañas" ON public.campaigns;
CREATE POLICY "Solo el DM gestiona campañas"
ON public.campaigns FOR ALL
TO authenticated
USING (public.is_dm());

-- ==============================================================================
-- Políticas para: public.characters
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura de personajes a la mesa" ON public.characters;
CREATE POLICY "Lectura de personajes a la mesa"
ON public.characters FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Edición de ficha: dueño o DM" ON public.characters;
CREATE POLICY "Edición de ficha: dueño o DM"
ON public.characters FOR UPDATE
TO authenticated
USING (
  player_id IN (SELECT id FROM public.players WHERE auth_user_id = auth.uid())
  OR public.is_dm()
);

DROP POLICY IF EXISTS "Creación de personajes: dueño o DM" ON public.characters;
CREATE POLICY "Creación de personajes: dueño o DM"
ON public.characters FOR INSERT
TO authenticated
WITH CHECK (
  player_id IN (SELECT id FROM public.players WHERE auth_user_id = auth.uid())
  OR public.is_dm()
);

-- ==============================================================================
-- Políticas para: public.campaign_characters
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura de miembros de campaña" ON public.campaign_characters;
CREATE POLICY "Lectura de miembros de campaña"
ON public.campaign_characters FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestión de miembros: dueño del personaje o DM" ON public.campaign_characters;
CREATE POLICY "Gestión de miembros: dueño del personaje o DM"
ON public.campaign_characters FOR ALL
TO authenticated
USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE player_id IN (SELECT id FROM public.players WHERE auth_user_id = auth.uid())
  )
  OR public.is_dm()
);

-- ==============================================================================
-- Políticas para: public.campaign_vault
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura de baúl de campaña" ON public.campaign_vault;
CREATE POLICY "Lectura de baúl de campaña"
ON public.campaign_vault FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Actualización de baúl por miembros o DM" ON public.campaign_vault;
CREATE POLICY "Actualización de baúl por miembros o DM"
ON public.campaign_vault FOR UPDATE
TO authenticated
USING (true);

-- ==============================================================================
-- Políticas para: public.demo_characters (Demo Pública)
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura pública de demo_characters" ON public.demo_characters;
CREATE POLICY "Lectura pública de demo_characters"
ON public.demo_characters FOR SELECT
TO anon, authenticated
USING (true);
