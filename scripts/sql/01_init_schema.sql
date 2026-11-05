-- ==============================================================================
-- 01_init_schema.sql - Esquema Relacional de SegadoresDnD
-- Compatible con PostgreSQL 15+, DataGrip y Supabase
-- ==============================================================================

-- 1. Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Función trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS '
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
';

-- ==============================================================================
-- 3. Tabla: players (Directorio de Jugadores / Usuarios Autenticados)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- Vinculado a auth.users(id) de Supabase
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'player' CHECK (role IN ('dm', 'player')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_players_updated_at ON public.players;
CREATE TRIGGER set_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. Tabla: campaigns (Campañas de Juego)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE, -- Código amigable de campaña (ej: 'SEG-001', '00000010')
  name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT '',
  dm_id UUID REFERENCES public.players(id) ON DELETE SET NULL, -- DM responsable
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER set_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. Tabla: characters (Hojas de Personaje - Propiedad del Jugador)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL, -- El jugador es el dueño
  
  -- Identidad y Rasgos
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE, -- Identificador amigable (ej: 'alizar', 'eru')
  character_class VARCHAR(100) NOT NULL,
  level INT NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  race VARCHAR(100) NOT NULL,
  alignment VARCHAR(255) DEFAULT 'Neutral',
  experience_points INT NOT NULL DEFAULT 0,

  -- Combate y Vitalidad
  max_hp INT NOT NULL DEFAULT 10,
  current_hp INT NOT NULL DEFAULT 10,
  temp_hp INT NOT NULL DEFAULT 0,
  hit_dice_total VARCHAR(255) DEFAULT '1d8',
  hit_dice_current INT NOT NULL DEFAULT 1,
  
  -- Defensas y Movilidad
  armor_class INT NOT NULL DEFAULT 10,
  speed INT NOT NULL DEFAULT 30, -- pies
  proficiency_bonus INT NOT NULL DEFAULT 2,
  passive_perception INT NOT NULL DEFAULT 10,
  initiative_modifier INT NOT NULL DEFAULT 0,

  -- Aptitud Mágica
  spellcasting_ability VARCHAR(10) DEFAULT NULL, -- 'INT', 'WIS', 'CHA'
  spell_save_dc INT DEFAULT NULL,
  spell_attack_bonus INT DEFAULT NULL,

  -- Atributos de Característica (JSONB estructurado)
  -- Formato: {"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}
  ability_scores JSONB NOT NULL DEFAULT '{"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}'::jsonb,

  -- Ranuras de Conjuro por Nivel (JSONB estructurado)
  -- Formato: {"1": {"total": 4, "used": 1}, "2": {"total": 3, "used": 0}}
  spell_slots JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Inventario Personal con referencias a Slugs del Compendio Markdown
  -- Formato: [{"slug": "daga", "name": "Daga", "qty": 1, "equipped": true}]
  inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  currency JSONB NOT NULL DEFAULT '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}'::jsonb,

  -- Conjuros Preparados o Conocidos (Slugs del Compendio)
  prepared_spells TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Notas de sesión y apariencia
  appearance TEXT DEFAULT '',
  player_notes TEXT DEFAULT '',
  
  -- Sincronización con Obsidian
  source_file VARCHAR(255) DEFAULT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_characters_updated_at ON public.characters;
CREATE TRIGGER set_characters_updated_at
BEFORE UPDATE ON public.characters
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. Tabla Intermedia N:M: campaign_characters (Relación Muchos a Muchos)
-- Permite que un mismo personaje participe en múltiples campañas o one-shots
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_characters (
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true, -- Si el personaje está activo en esta campaña
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, character_id)
);

-- ==============================================================================
-- 7. Tabla: campaign_vault (Pertenencias Comunes / Cofre de la Compañía)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL UNIQUE REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Tesoro compartido
  currency JSONB NOT NULL DEFAULT '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}'::jsonb,
  
  -- Inventario común (carromato, raciones, tiendas, botín no asignado)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_campaign_vault_updated_at ON public.campaign_vault;
CREATE TRIGGER set_campaign_vault_updated_at
BEFORE UPDATE ON public.campaign_vault
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. Tabla: demo_characters (Plantillas Públicas SRD para la Demo Web)
-- Solo lectura en BD. Las modificaciones en /demo se guardan en el localStorage del usuario
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.demo_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  character_class VARCHAR(100) NOT NULL,
  level INT NOT NULL DEFAULT 1,
  race VARCHAR(100) NOT NULL,
  max_hp INT NOT NULL DEFAULT 10,
  current_hp INT NOT NULL DEFAULT 10,
  armor_class INT NOT NULL DEFAULT 10,
  speed INT NOT NULL DEFAULT 30,
  proficiency_bonus INT NOT NULL DEFAULT 2,
  ability_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  spell_slots JSONB NOT NULL DEFAULT '{}'::jsonb,
  inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  prepared_spells TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. Índices de optimización para búsquedas rápidas
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_characters_slug ON public.characters(slug);
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON public.characters(player_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_code ON public.campaigns(code);
CREATE INDEX IF NOT EXISTS idx_campaign_characters_camp ON public.campaign_characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_characters_char ON public.campaign_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_demo_characters_slug ON public.demo_characters(slug);

-- Comentarios informativos
COMMENT ON TABLE public.campaign_characters IS 'Relación N:M entre campañas y personajes (un personaje puede jugar en varias campañas)';
COMMENT ON TABLE public.campaign_vault IS 'Baúl comunal y tesoro compartido de la compañía mercenaria';
COMMENT ON TABLE public.demo_characters IS 'Plantillas fijas de prueba legales del SRD para visitantes no autenticados en /demo';
