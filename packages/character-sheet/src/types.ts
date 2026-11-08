import type {
  Character,
  AbilityKey,
  AbilityCodeEs,
  ActiveEffect,
  DeathSaves,
  CharacterPersonality,
  InventoryItem,
  ClassResource,
  EvaluatedCharacterState
} from '@segadores/dnd-core';

export type CharacterSheetTab =
  | 'stats'      // Vista A: Estadísticas Nucleares
  | 'combat'     // Vista B: Consola de Combate
  | 'inventory'  // Vista C: Inventario y Sintonización
  | 'spells'     // Vista D: Hechizos y Habilidades
  | 'lore'       // Vista E: Lore, Personalidad y Crónica
  | 'rules'      // Vista F: Reglas Contextuales del Personaje
  | 'effects';   // Vista G: Condiciones, Heridas y Buffs

export interface TabConfig {
  id: CharacterSheetTab;
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  label: string;
  subtitle: string;
  badge?: string | number | null;
  badgeVariant?: 'gold' | 'red' | 'purple' | 'emerald';
}

export interface CharacterSheetCallbacks {
  onUpdateHp?: (currentHp: number, tempHp: number) => void;
  onUpdateDeathSaves?: (deathSaves: DeathSaves) => void;
  onUpdateHitDice?: (currentHitDice: number) => void;
  onUpdateExhaustion?: (exhaustion: number) => void;
  onUpdateResource?: (resourceId: string, used: number) => void;
  onUpdateSpellSlot?: (level: string, used: number) => void;
  onToggleConcentration?: (spellName: string | null) => void;
  onToggleInspiration?: (hasInspiration: boolean) => void;
  onToggleAttunement?: (itemSlug: string) => void;
  onToggleEquipped?: (itemSlug: string) => void;
  onApplyEffect?: (effect: ActiveEffect) => void;
  onRemoveEffect?: (effectId: string) => void;
  onUpdatePersonalityField?: (field: keyof CharacterPersonality, value: string) => void;
  onUpdatePlayerNotes?: (notes: string) => void;
  onShortRest?: () => void;
  onLongRest?: () => void;
  onTriggerInjuryTable?: (table: 'A' | 'B') => void;
  onLevelUp?: (updatedCharacter: Character) => Promise<void> | void;
  onOpenLevelUp?: () => void;
}

export interface CharacterSheetProps extends CharacterSheetCallbacks {
  character: Character;
  activeTab?: CharacterSheetTab;
  onTabChange?: (tab: CharacterSheetTab) => void;
  readOnly?: boolean;
  userRole?: 'dm' | 'player';
  evaluatedState?: EvaluatedCharacterState;
  className?: string;
}

export interface BaseViewProps extends CharacterSheetCallbacks {
  character: Character;
  readOnly?: boolean;
  userRole?: 'dm' | 'player';
  evaluatedState?: EvaluatedCharacterState;
}
