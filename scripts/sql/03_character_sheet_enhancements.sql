-- ==============================================================================
-- 03_character_sheet_enhancements.sql - Ampliación para Hojas de Personaje (Vistas A a G)
-- Compatible con PostgreSQL 15+, DataGrip y Supabase
-- ==============================================================================

-- 1. Ampliación de la tabla: characters
-- Añade soporte para efectos temporales (condiciones/buffs/debuffs/heridas),
-- death saves, inspiración, lore, desglose de multiclase y sintonización.

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personality JSONB NOT NULL DEFAULT '{"traits": "", "ideals": "", "bonds": "", "flaws": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS backstory TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS death_saves JSONB NOT NULL DEFAULT '{"successes": 0, "failures": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS inspiration BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS saving_throws_prof TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS multiclass JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attunement_slots INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS known_spells TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Comentarios explicativos de las columnas en characters
COMMENT ON COLUMN public.characters.active_effects IS 'Array JSONB unificado de efectos activos: condiciones, buffs, debuffs y heridas temporales/persistentes.';
COMMENT ON COLUMN public.characters.personality IS 'JSONB con rasgos de personalidad, ideales, vínculos y defectos del personaje.';
COMMENT ON COLUMN public.characters.backstory IS 'Texto de trasfondo, historia previa y crónica de hazañas en campaña.';
COMMENT ON COLUMN public.characters.death_saves IS 'Contador de salvaciones contra la muerte: successes (0-3) y failures (0-3).';
COMMENT ON COLUMN public.characters.skills IS 'Diccionario JSONB de proficiencias en habilidades (ej: {"stealth": "expertise", "arcana": "proficient"}).';
COMMENT ON COLUMN public.characters.multiclass IS 'Array JSONB de clases secundarias con sus niveles (ej: [{"class": "Paladín", "level": 1}]).';

-- 2. Ampliación de la tabla: demo_characters (para paridad visual en /demo pública)
ALTER TABLE public.demo_characters
  ADD COLUMN IF NOT EXISTS active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personality JSONB NOT NULL DEFAULT '{"traits": "", "ideals": "", "bonds": "", "flaws": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS backstory TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS death_saves JSONB NOT NULL DEFAULT '{"successes": 0, "failures": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS inspiration BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS saving_throws_prof TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS multiclass JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attunement_slots INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS known_spells TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 3. Función RPC de Seguridad: apply_character_effect
-- Permite al DM, al dueño de la ficha o a un aliado de la misma campaña aplicar efectos.
-- Los aliados únicamente tienen autorización para aplicar efectos de tipo 'buff'.
CREATE OR REPLACE FUNCTION public.apply_character_effect(
  p_character_id UUID,
  p_effect JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS '
DECLARE
  v_player_id UUID;
  v_caller_auth UUID;
  v_is_dm BOOLEAN;
  v_is_owner BOOLEAN;
  v_is_ally BOOLEAN;
  v_effect_type TEXT;
  v_updated_effects JSONB;
BEGIN
  v_caller_auth := auth.uid();
  v_is_dm := public.is_dm();
  v_effect_type := COALESCE(p_effect->>''type'', ''buff'');

  -- Obtener dueño del personaje
  SELECT player_id INTO v_player_id
  FROM public.characters
  WHERE id = p_character_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION ''Personaje no encontrado.'';
  END IF;

  -- Comprobar si el que llama es el dueño
  v_is_owner := (v_caller_auth IS NOT NULL AND v_player_id IN (
    SELECT id FROM public.players WHERE auth_user_id = v_caller_auth
  ));

  -- Comprobar si el que llama es un compañero de campaña
  v_is_ally := EXISTS (
    SELECT 1
    FROM public.campaign_characters cc_target
    JOIN public.campaign_characters cc_caller ON cc_target.campaign_id = cc_caller.campaign_id
    JOIN public.characters c_caller ON cc_caller.character_id = c_caller.id
    JOIN public.players p_caller ON c_caller.player_id = p_caller.id
    WHERE cc_target.character_id = p_character_id
      AND p_caller.auth_user_id = v_caller_auth
  );

  -- Validar permisos de inserción
  IF NOT (v_is_dm OR v_is_owner OR (v_is_ally AND v_effect_type = ''buff'')) THEN
    RAISE EXCEPTION ''Permisos insuficientes. Los aliados solo pueden aplicar efectos de tipo buff.'';
  END IF;

  -- Agregar id único y timestamp si no vienen definidos
  IF p_effect->>''id'' IS NULL THEN
    p_effect := jsonb_set(p_effect, ''{id}'', to_jsonb(gen_random_uuid()::text));
  END IF;
  IF p_effect->>''created_at'' IS NULL THEN
    p_effect := jsonb_set(p_effect, ''{created_at}'', to_jsonb(NOW()::text));
  END IF;

  -- Actualizar el array active_effects
  UPDATE public.characters
  SET active_effects = active_effects || jsonb_build_array(p_effect)
  WHERE id = p_character_id
  RETURNING active_effects INTO v_updated_effects;

  RETURN v_updated_effects;
END;
';

-- 4. Función RPC de Seguridad: remove_character_effect
-- Restricción estricta: SOLO el DM o el dueño del personaje pueden remover o limpiar un efecto.
CREATE OR REPLACE FUNCTION public.remove_character_effect(
  p_character_id UUID,
  p_effect_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS '
DECLARE
  v_player_id UUID;
  v_caller_auth UUID;
  v_is_dm BOOLEAN;
  v_is_owner BOOLEAN;
  v_updated_effects JSONB;
BEGIN
  v_caller_auth := auth.uid();
  v_is_dm := public.is_dm();

  -- Obtener dueño del personaje
  SELECT player_id INTO v_player_id
  FROM public.characters
  WHERE id = p_character_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION ''Personaje no encontrado.'';
  END IF;

  -- Comprobar si el que llama es el dueño
  v_is_owner := (v_caller_auth IS NOT NULL AND v_player_id IN (
    SELECT id FROM public.players WHERE auth_user_id = v_caller_auth
  ));

  -- Solo el DM o el propietario pueden retirar efectos
  IF NOT (v_is_dm OR v_is_owner) THEN
    RAISE EXCEPTION ''Permisos insuficientes. Solo el DM o el dueño del personaje pueden retirar un efecto.'';
  END IF;

  -- Filtrar el efecto por su ID
  UPDATE public.characters
  SET active_effects = (
    SELECT COALESCE(jsonb_agg(elem), ''[]''::jsonb)
    FROM jsonb_array_elements(active_effects) AS elem
    WHERE elem->>''id'' <> p_effect_id
  )
  WHERE id = p_character_id
  RETURNING active_effects INTO v_updated_effects;

  RETURN v_updated_effects;
END;
';

-- 5. Publicación de eventos en tiempo real (Supabase Realtime)
-- Permite que los cambios en characters sean escuchados en vivo por clientes conectados
DO '
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = ''supabase_realtime''
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
  END IF;
END;
';
