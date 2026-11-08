import type { ActiveEffect } from './effects.ts';
import type { SpellSlotPool } from './spells.ts';

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type AbilityCodeEs = 'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export type ProficiencyLevel = 'none' | 'half' | 'proficient' | 'expertise';

export interface SkillEntry {
  bonus: number;
  base_bonus?: number;
  proficiency: ProficiencyLevel;
}

export type SkillsMap = Record<string, SkillEntry | number>;

export interface MulticlassEntry {
  class: string;
  subclass?: string;
  level: number;
}

export interface SpellcastingStat {
  source: string;
  ability: AbilityCodeEs | string;
  ability_en: 'INT' | 'WIS' | 'CHA' | string;
  save_dc: number | null;
  attack_bonus: number | null;
}

export type RestRechargeType = 'short_rest' | 'long_rest' | 'passive' | 'dawn';

export interface ClassResource {
  id: string;
  name: string;
  max: number;
  used: number;
  recharge: RestRechargeType;
  notes?: string;
}

export type InventoryCategory = 'weapon' | 'armor' | 'shield' | 'magic_item' | 'gear' | 'consumable' | 'general';

export interface WeaponMetadata {
  damageDice: string; // ej. '1d8'
  damageType: string; // ej. 'cortante', 'perforante', 'contundente'
  versatileDice?: string; // ej. '1d10'
  finesse?: boolean; // Propiedad Sutil / Precisión
  ranged?: boolean;
  light?: boolean;
  heavy?: boolean;
  twoHanded?: boolean;
  thrownRange?: string;
  magicalBonus?: number; // ej. +1, +2
  extraDamage?: Array<{ dice: string; type: string }>; // ej. [{ dice: '2d6', type: 'eléctrico' }]
  onHitEffect?: string;
}

export interface ArmorMetadata {
  armorType: 'light' | 'medium' | 'heavy' | 'shield';
  baseAc: number; // ej. 18 para placas, 16 para cota de malla de mithral, 2 para escudo
  magicalBonus?: number;
  maxDexBonus?: number | null; // null = sin límite, 2 = armadura media, 0 = pesada
  stealthDisadvantage?: boolean;
  isMithral?: boolean;
}

export interface InventoryItem {
  slug: string;
  name: string;
  category: InventoryCategory;
  qty: number;
  equipped: boolean;
  requires_attunement: boolean;
  attuned: boolean;
  notes?: string;
  weapon?: WeaponMetadata;
  armor?: ArmorMetadata;
}

export interface CurrencyPurse {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CharacterPersonality {
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

/**
 * Contrato canónico 1:1 con public.characters y public.demo_characters en PostgreSQL.
 */
export interface Character {
  id?: string;
  player_id?: string | null;
  name: string;
  slug: string;
  character_class: string;
  level: number;
  race: string;
  background: string;
  alignment: string;
  experience_points: number;
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  hit_dice_total: string;
  hit_dice_current: number;
  armor_class: number;
  speed: number;
  proficiency_bonus: number;
  passive_perception: number;
  initiative_modifier: number;
  spellcasting_ability: string | null;
  spell_save_dc: number | null;
  spell_attack_bonus: number | null;
  spellcasting_stats: SpellcastingStat[];
  ability_scores: AbilityScores;
  saving_throws_prof: AbilityCodeEs[];
  skills: SkillsMap;
  multiclass: MulticlassEntry[];
  spell_slots: SpellSlotPool;
  prepared_spells: string[];
  known_spells: string[];
  inventory: InventoryItem[];
  currency: CurrencyPurse;
  class_resources: ClassResource[];
  personality: CharacterPersonality;
  appearance: string;
  backstory: string;
  player_notes: string;
  active_effects: ActiveEffect[];
  death_saves: DeathSaves;
  inspiration: boolean;
  exhaustion: number;
  concentrating_on: string | null;
  attunement_slots: number;
  source_file?: string | null;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}
