/**
 * Tipos canónicos para condiciones, heridas en combate (Tablas A y B) y efectos temporales (buffs/debuffs).
 * 100% agnóstico de UI y base de datos.
 */

export type ActiveEffectType = 'condition' | 'injury' | 'buff' | 'debuff';

export type StandardConditionId =
  | 'agarrado'
  | 'apresado'
  | 'asustado'
  | 'aturdido'
  | 'cegado'
  | 'derribado'
  | 'ensordecido'
  | 'envenenado'
  | 'hechizado'
  | 'incapacitado'
  | 'inconsciente'
  | 'invisible'
  | 'paralizado'
  | 'petrificado'
  | 'silenciado';

export interface MechanicalModifiers {
  acBonus?: number;
  speedBonus?: number;
  speedMultiplier?: number;
  forceZeroSpeed?: boolean;
  attackBonusDice?: string[];
  saveBonusDice?: string[];
  abilityCheckBonusDice?: string[];
  flatAttackBonus?: number;
  flatSaveBonus?: number;
  flatDamageBonus?: number;
  maxHpMultiplier?: number;
  disadvantageOnAttacks?: boolean;
  advantageOnAttacks?: boolean;
  disadvantageOnRangedOver30Ft?: boolean;
  disadvantageOnPerceptionSight?: boolean;
  disadvantageOnConcentration?: boolean;
  blocksReactions?: boolean;
  blocksActions?: boolean;
  blocksBonusActions?: boolean;
  blocksVerbalSpells?: boolean;
  verbalSpellConSaveDc?: number;
}

export interface ActiveEffect {
  id: string;
  name: string;
  type: ActiveEffectType;
  conditionId?: StandardConditionId;
  injuryTable?: 'A' | 'B';
  injuryRoll?: number;
  description: string;
  duration?: string;
  treatment?: string;
  applied_by?: string;
  applied_by_uid?: string;
  created_at?: string;
  modifiers?: MechanicalModifiers;
}

export interface ActionAvailability {
  actionType: 'action' | 'bonus_action' | 'reaction' | 'movement' | 'verbal_spell' | 'somatic_spell' | 'martial_arts' | 'unarmored_movement' | 'concentration';
  available: boolean;
  blockedBy: string[];
  warnings: string[];
}

export interface EvaluatedCharacterState {
  effectiveAc: number;
  acBreakdown: string[];
  effectiveSpeed: number;
  speedBreakdown: string[];
  effectiveMaxHp: number;
  d20ExhaustionPenalty: number;
  spellDcExhaustionPenalty: number;
  activeBonusDice: {
    attack: string[];
    save: string[];
    check: string[];
  };
  disadvantages: string[];
  advantages: string[];
  availability: Record<ActionAvailability['actionType'], ActionAvailability>;
  tacticalReminders: string[];
}
