/**
 * Contratos de datos para conjuros, componentes mágicos y espacios de conjuro.
 */

export type SpellSchool =
  | 'Abjuración'
  | 'Adivinación'
  | 'Conjuración'
  | 'Encantamiento'
  | 'Evocación'
  | 'Ilusión'
  | 'Nigromancia'
  | 'Transmutación';

export type SpellRoleTag = 'damage' | 'healing' | 'support' | 'control' | 'utility' | 'defense';

export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialDescription?: string;
}

export interface Spell {
  slug: string;
  name: string;
  level: number; // 0 para Trucos (Cantrips), 1-9 para niveles de conjuro
  school: SpellSchool | string;
  castingTime: string;
  range: string;
  components: SpellComponents;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  classes: string[];
  description: string;
  higherLevels?: string;
  roleTags?: SpellRoleTag[];
  sourceClass?: string;
}

export interface SpellSlotLevelPool {
  total: number;
  used: number;
}

export type SpellSlotPool = Record<string, SpellSlotLevelPool>;
