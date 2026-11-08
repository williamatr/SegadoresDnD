-- ==============================================================================
-- 03_character_sheet_enhancements.sql - Ampliación para Hojas de Personaje (Vistas A a G)
-- Compatible e idempotente para PostgreSQL 15+, DataGrip y Supabase
-- ==============================================================================

-- 1. Ampliación de la tabla: characters
-- Añade soporte para efectos temporales (condiciones/buffs/debuffs/heridas),
-- recursos de clase por descanso, agotamiento 5.5e, concentración activa,
-- death saves, inspiración, trasfondo, lore, multiclase, doble aptitud mágica y sintonización.

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS background VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS class_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personality JSONB NOT NULL DEFAULT '{"traits": "", "ideals": "", "bonds": "", "flaws": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS backstory TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS death_saves JSONB NOT NULL DEFAULT '{"successes": 0, "failures": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS inspiration BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exhaustion INT NOT NULL DEFAULT 0 CHECK (exhaustion >= 0 AND exhaustion <= 6),
  ADD COLUMN IF NOT EXISTS concentrating_on VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS saving_throws_prof TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS multiclass JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS spellcasting_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attunement_slots INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS known_spells TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Comentarios explicativos de las columnas en characters
COMMENT ON COLUMN public.characters.background IS 'Trasfondo formal del personaje (ej: Soldado, Sabio, Animador).';
COMMENT ON COLUMN public.characters.active_effects IS 'Array JSONB unificado de efectos activos: condiciones, buffs, debuffs y heridas temporales/persistentes.';
COMMENT ON COLUMN public.characters.class_resources IS 'Array JSONB de recursos consumibles por descanso corto/largo (Ki, Forma Salvaje, Acción Súbita, Inspiración Bárdica, etc.).';
COMMENT ON COLUMN public.characters.personality IS 'JSONB con rasgos de personalidad, ideales, vínculos y defectos del personaje.';
COMMENT ON COLUMN public.characters.backstory IS 'Texto de trasfondo, historia previa y crónica de hazañas en campaña.';
COMMENT ON COLUMN public.characters.death_saves IS 'Contador de salvaciones contra la muerte: successes (0-3) y failures (0-3).';
COMMENT ON COLUMN public.characters.exhaustion IS 'Nivel de agotamiento según reglas D&D 5.5e (0 a 6; penaliza -2*Nivel en d20/CD y -5*Nivel pies).';
COMMENT ON COLUMN public.characters.concentrating_on IS 'Nombre o slug del conjuro de concentración activo actualmente (máximo 1 a la vez).';
COMMENT ON COLUMN public.characters.skills IS 'Diccionario JSONB de habilidades con su bonificador y nivel de competencia.';
COMMENT ON COLUMN public.characters.multiclass IS 'Array JSONB de clases con sus niveles y subclases (ej: [{"class": "Mago", "subclass": "Evocación", "level": 7}]).';
COMMENT ON COLUMN public.characters.spellcasting_stats IS 'Array JSONB de aptitudes mágicas por clase para soportar lanzadores multiclase (ej: INT CD 12 +4 y CAR CD 13 +5).';

-- 2. Ampliación de la tabla: demo_characters (paridad 100% con public.characters para /demo pública)
ALTER TABLE public.demo_characters
  ADD COLUMN IF NOT EXISTS alignment VARCHAR(255) DEFAULT 'Neutral',
  ADD COLUMN IF NOT EXISTS background VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience_points INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS temp_hp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hit_dice_total VARCHAR(255) DEFAULT '1d8',
  ADD COLUMN IF NOT EXISTS hit_dice_current INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS passive_perception INT NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS initiative_modifier INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spellcasting_ability VARCHAR(10) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS spell_save_dc INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS spell_attack_bonus INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS currency JSONB NOT NULL DEFAULT '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS player_notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS class_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personality JSONB NOT NULL DEFAULT '{"traits": "", "ideals": "", "bonds": "", "flaws": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS backstory TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS death_saves JSONB NOT NULL DEFAULT '{"successes": 0, "failures": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS inspiration BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exhaustion INT NOT NULL DEFAULT 0 CHECK (exhaustion >= 0 AND exhaustion <= 6),
  ADD COLUMN IF NOT EXISTS concentrating_on VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS saving_throws_prof TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS multiclass JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS spellcasting_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attunement_slots INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS known_spells TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS set_demo_characters_updated_at ON public.demo_characters;
CREATE TRIGGER set_demo_characters_updated_at
BEFORE UPDATE ON public.demo_characters
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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
SET search_path = public
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
  IF p_effect IS NULL OR jsonb_typeof(p_effect) <> ''object'' THEN
    RAISE EXCEPTION ''El efecto proporcionado debe ser un objeto JSON válido.'';
  END IF;

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

  -- Comprobar si el que llama es un compañero de campaña activa
  v_is_ally := (v_caller_auth IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.campaign_characters cc_target
    JOIN public.campaign_characters cc_caller ON cc_target.campaign_id = cc_caller.campaign_id
    JOIN public.characters c_caller ON cc_caller.character_id = c_caller.id
    JOIN public.players p_caller ON c_caller.player_id = p_caller.id
    WHERE cc_target.character_id = p_character_id
      AND cc_target.is_active = true
      AND cc_caller.is_active = true
      AND p_caller.auth_user_id = v_caller_auth
  ));

  -- Validar permisos de inserción
  IF NOT (v_is_dm OR v_is_owner OR (v_is_ally AND v_effect_type = ''buff'')) THEN
    RAISE EXCEPTION ''Permisos insuficientes. Los aliados solo pueden aplicar efectos de tipo buff.'';
  END IF;

  -- Agregar id único, timestamp y autor autenticado si no vienen definidos
  IF p_effect->>''id'' IS NULL THEN
    p_effect := jsonb_set(p_effect, ''{id}'', to_jsonb(gen_random_uuid()::text));
  END IF;
  IF p_effect->>''created_at'' IS NULL THEN
    p_effect := jsonb_set(p_effect, ''{created_at}'', to_jsonb(NOW()::text));
  END IF;
  IF v_caller_auth IS NOT NULL AND p_effect->>''applied_by_uid'' IS NULL THEN
    p_effect := jsonb_set(p_effect, ''{applied_by_uid}'', to_jsonb(v_caller_auth::text));
  END IF;

  -- Actualizar el array active_effects
  UPDATE public.characters
  SET active_effects = active_effects || jsonb_build_array(p_effect)
  WHERE id = p_character_id
  RETURNING active_effects INTO v_updated_effects;

  RETURN v_updated_effects;
END;
';

REVOKE EXECUTE ON FUNCTION public.apply_character_effect(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_character_effect(UUID, JSONB) TO authenticated, service_role;

-- 4. Función RPC de Seguridad: remove_character_effect
-- Restricción estricta: SOLO el DM o el dueño del personaje pueden remover o limpiar un efecto.
CREATE OR REPLACE FUNCTION public.remove_character_effect(
  p_character_id UUID,
  p_effect_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

REVOKE EXECUTE ON FUNCTION public.remove_character_effect(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_character_effect(UUID, TEXT) TO authenticated, service_role;

-- 5. Publicación idempotente de eventos en tiempo real (Supabase Realtime)
-- Permite que los cambios en characters y campaign_vault sean escuchados en vivo sin fallar si se re-ejecuta
DO '
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = ''supabase_realtime''
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = ''supabase_realtime'' AND schemaname = ''public'' AND tablename = ''characters''
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = ''supabase_realtime'' AND schemaname = ''public'' AND tablename = ''campaign_vault''
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_vault;
    END IF;
  END IF;
END;
';
