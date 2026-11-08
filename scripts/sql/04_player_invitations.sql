-- ==============================================================================
-- 04_player_invitations.sql - Sistema de Invitaciones y Asignación de Héroes
-- SegadoresDnD: Consola de Administración para el Dungeon Master (DM)
-- Compatible e idempotente para PostgreSQL 15+, Supabase y DataGrip
-- ==============================================================================

-- 1. Ampliación de la tabla: public.players
-- Añade soporte para asignación de personaje oficial por el DM y trazabilidad
-- de quién emitió la invitación o autorización de acceso a la mesa.

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS assigned_character_slug VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.players(id) ON DELETE SET NULL;

-- 2. Documentación de metadatos de columnas
COMMENT ON COLUMN public.players.assigned_character_slug IS 'Slug del héroe oficial asignado por el DM (ej: zuma, eru-illuvatar, gary, rick, skelly) o NULL para creación libre.';
COMMENT ON COLUMN public.players.invited_by IS 'Referencia al Dungeon Master (public.players.id) que autorizó la entrada del aventurero.';

-- 3. Índices de rendimiento para consultas de acceso y asignación
CREATE INDEX IF NOT EXISTS idx_players_assigned_character ON public.players(assigned_character_slug);
CREATE INDEX IF NOT EXISTS idx_players_invited_by ON public.players(invited_by);

-- 4. Índice para agilizar la resolución de propiedad en public.characters
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'characters'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_characters_player_id ON public.characters(player_id);
    CREATE INDEX IF NOT EXISTS idx_characters_slug ON public.characters(slug);
  END IF;
END $$;

-- 5. Verificación de Políticas RLS para gestión de aventureros por el DM
-- Asegura que el Master DM o Co-DM autenticado pueda listar, invitar, actualizar y revocar jugadores
DO $$
BEGIN
  -- Política para permitir que el DM elimine registros de jugadores (Revocar acceso)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'players' 
      AND policyname = 'DM puede eliminar jugadores revocados'
  ) THEN
    CREATE POLICY "DM puede eliminar jugadores revocados"
    ON public.players FOR DELETE
    TO authenticated
    USING (public.is_dm());
  END IF;

  -- Política para permitir que el DM inserte nuevas invitaciones
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'players' 
      AND policyname = 'DM puede insertar nuevas invitaciones'
  ) THEN
    CREATE POLICY "DM puede insertar nuevas invitaciones"
    ON public.players FOR INSERT
    TO authenticated
    WITH CHECK (public.is_dm());
  END IF;
END $$;

-- ==============================================================================
-- Instrucciones de reversión (Rollback si fuera necesario):
-- ALTER TABLE public.players DROP COLUMN IF EXISTS assigned_character_slug;
-- ALTER TABLE public.players DROP COLUMN IF EXISTS invited_by;
-- DROP INDEX IF EXISTS idx_players_assigned_character;
-- DROP INDEX IF EXISTS idx_players_invited_by;
-- ==============================================================================
