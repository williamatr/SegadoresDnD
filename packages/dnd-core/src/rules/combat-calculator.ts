import type { AbilityScores, ArmorMetadata, Character, WeaponMetadata } from '../types/character.ts';
import { calculateAbilityModifier, formatModifier } from './abilities.ts';

export interface ArmorCalculationInput {
  abilityScores: AbilityScores;
  equippedArmor?: ArmorMetadata | null;
  equippedShieldBonus?: number; // ej. 2 para escudo normal, 3 para Escudo +1, 5 para Escudo Baluarte
  hasMageArmor?: boolean;
  hasMonkUnarmoredDefense?: boolean;
  hasBarbarianUnarmoredDefense?: boolean;
  hasDefenseFightingStyle?: boolean;
  hasDualWielderFeat?: boolean;
  isDualWieldingMelee?: boolean;
  activeEffectsAcBonus?: number;
}

export interface ArmorCalculationResult {
  totalAc: number;
  baseAc: number;
  baseFormulaName: string;
  breakdown: string[];
}

/**
 * Calcula la Clase de Armadura (CA) respetando la regla oficial de no acumulación de fórmulas base
 * (Armadura equipada vs Defensa sin Armadura de Monje/Bárbaro vs Armadura de Mago).
 */
export function calculateArmorClass(input: ArmorCalculationInput): ArmorCalculationResult {
  const dexMod = calculateAbilityModifier(input.abilityScores.dex);
  const wisMod = calculateAbilityModifier(input.abilityScores.wis);
  const conMod = calculateAbilityModifier(input.abilityScores.con);
  const breakdown: string[] = [];

  let baseAc = 10 + dexMod;
  let baseFormulaName = 'Sin armadura';

  if (input.equippedArmor && input.equippedArmor.armorType !== 'shield') {
    const armor = input.equippedArmor;
    const magic = armor.magicalBonus ?? 0;
    let appliedDex = 0;

    if (armor.armorType === 'light') {
      appliedDex = dexMod;
    } else if (armor.armorType === 'medium') {
      const cap = armor.maxDexBonus !== undefined && armor.maxDexBonus !== null ? armor.maxDexBonus : 2;
      appliedDex = Math.min(dexMod, cap);
    } else if (armor.armorType === 'heavy') {
      appliedDex = 0;
    }

    baseAc = armor.baseAc + appliedDex + magic;
    baseFormulaName = `Armadura (${armor.armorType})`;
    breakdown.push(`Base armadura: ${armor.baseAc}`);
    if (appliedDex !== 0) breakdown.push(`DES (${formatModifier(appliedDex)})`);
    if (magic !== 0) breakdown.push(`Bono mágico armadura (${formatModifier(magic)})`);
  } else {
    // Evaluar fórmulas sin armadura (no se acumulan entre sí: se elige la más favorable)
    const candidates: Array<{ name: string; ac: number; detail: string }> = [
      { name: 'Base sin armadura', ac: 10 + dexMod, detail: `10 + DES (${formatModifier(dexMod)})` }
    ];

    if (input.hasMageArmor) {
      candidates.push({
        name: 'Armadura de Mago',
        ac: 13 + dexMod,
        detail: `13 + DES (${formatModifier(dexMod)})`
      });
    }

    if (input.hasMonkUnarmoredDefense && !input.equippedShieldBonus) {
      candidates.push({
        name: 'Defensa sin Armadura (Monje)',
        ac: 10 + dexMod + wisMod,
        detail: `10 + DES (${formatModifier(dexMod)}) + SAB (${formatModifier(wisMod)})`
      });
    }

    if (input.hasBarbarianUnarmoredDefense) {
      candidates.push({
        name: 'Defensa sin Armadura (Bárbaro)',
        ac: 10 + dexMod + conMod,
        detail: `10 + DES (${formatModifier(dexMod)}) + CON (${formatModifier(conMod)})`
      });
    }

    candidates.sort((a, b) => b.ac - a.ac);
    const best = candidates[0];
    baseAc = best.ac;
    baseFormulaName = best.name;
    breakdown.push(`${best.name}: ${best.detail}`);
  }

  let totalAc = baseAc;

  if (input.equippedShieldBonus && input.equippedShieldBonus > 0) {
    totalAc += input.equippedShieldBonus;
    breakdown.push(`Escudo (${formatModifier(input.equippedShieldBonus)})`);
  }

  if (input.hasDefenseFightingStyle && input.equippedArmor) {
    totalAc += 1;
    breakdown.push('Estilo de Combate: Defensa (+1)');
  }

  if (input.hasDualWielderFeat && input.isDualWieldingMelee && !input.equippedShieldBonus) {
    totalAc += 1;
    breakdown.push('Combatiente con dos armas (+1)');
  }

  if (input.activeEffectsAcBonus && input.activeEffectsAcBonus !== 0) {
    totalAc += input.activeEffectsAcBonus;
    breakdown.push(`Efectos activos (${formatModifier(input.activeEffectsAcBonus)})`);
  }

  return {
    totalAc,
    baseAc,
    baseFormulaName,
    breakdown
  };
}

export interface WeaponAttackInput {
  abilityScores: AbilityScores;
  proficiencyBonus: number;
  weapon: WeaponMetadata;
  isProficient?: boolean;
  isOffHandBonusAttack?: boolean;
  hasTwoWeaponFightingStyle?: boolean;
  rogueLevel?: number;
  exhaustionLevel?: number;
  flatAttackBonus?: number;
  flatDamageBonus?: number;
}

export interface WeaponAttackResult {
  abilityUsed: 'FUE' | 'DES';
  abilityMod: number;
  attackBonus: number;
  attackRollFormula: string;
  baseDamageFormula: string;
  fullDamageFormula: string;
  sneakAttackEligible: boolean;
  sneakAttackDice: string | null;
}

/**
 * Calcula bonificador de ataque y fórmula de daño de un arma.
 * Soporta propiedad Sutil/Precisión (Finesse) eligiendo automáticamente entre FUE y DES,
 * y valida elegibilidad de Ataque Furtivo (Sneak Attack) incluso al usar FUE con un arma Sutil.
 */
export function calculateWeaponAttack(input: WeaponAttackInput): WeaponAttackResult {
  const strMod = calculateAbilityModifier(input.abilityScores.str);
  const dexMod = calculateAbilityModifier(input.abilityScores.dex);
  const isProficient = input.isProficient ?? true;

  let abilityUsed: 'FUE' | 'DES' = 'FUE';
  let abilityMod = strMod;

  if (input.weapon.finesse) {
    if (dexMod > strMod) {
      abilityUsed = 'DES';
      abilityMod = dexMod;
    } else {
      abilityUsed = 'FUE';
      abilityMod = strMod;
    }
  } else if (input.weapon.ranged) {
    abilityUsed = 'DES';
    abilityMod = dexMod;
  }

  const magicBonus = input.weapon.magicalBonus ?? 0;
  const exhaustionPenalty = Math.max(0, Math.min(6, input.exhaustionLevel ?? 0)) * 2;
  const prof = isProficient ? input.proficiencyBonus : 0;
  const extraAtk = input.flatAttackBonus ?? 0;

  const attackBonus = abilityMod + prof + magicBonus + extraAtk - exhaustionPenalty;
  const attackRollFormula = `1d20 ${formatModifier(attackBonus)}`;

  // En ataque adicional con segunda mano, solo se suma el modificador positivo si tiene el Estilo de Combate con Dos Armas
  const applyPositiveAbilityToDamage =
    !input.isOffHandBonusAttack || Boolean(input.hasTwoWeaponFightingStyle) || abilityMod < 0;
  const effectiveDamageMod = (applyPositiveAbilityToDamage ? abilityMod : 0) + magicBonus + (input.flatDamageBonus ?? 0);

  const modStr =
    effectiveDamageMod > 0
      ? ` + ${effectiveDamageMod}`
      : effectiveDamageMod < 0
        ? ` - ${Math.abs(effectiveDamageMod)}`
        : '';

  const baseDamageFormula = `${input.weapon.damageDice}${modStr} ${input.weapon.damageType}`;
  const extraParts = (input.weapon.extraDamage ?? []).map(e => `${e.dice} ${e.type}`);
  const fullDamageFormula = [baseDamageFormula, ...extraParts].join(' + ');

  // Regla PHB 2024 / SRD 5.2.1: Ataque Furtivo requiere arma Sutil (Finesse) o a distancia
  const sneakAttackEligible = Boolean(input.weapon.finesse || input.weapon.ranged);
  const rogueLvl = input.rogueLevel ?? 0;
  const sneakDiceCount = sneakAttackEligible && rogueLvl >= 1 ? Math.ceil(rogueLvl / 2) : 0;
  const sneakAttackDice = sneakDiceCount > 0 ? `${sneakDiceCount}d6` : null;

  return {
    abilityUsed,
    abilityMod,
    attackBonus,
    attackRollFormula,
    baseDamageFormula,
    fullDamageFormula,
    sneakAttackEligible,
    sneakAttackDice
  };
}

/**
 * Aplica Puntos de Golpe Temporales respetando la regla de no acumulación (se conserva el mayor).
 */
export function applyTemporaryHp(currentTempHp: number, incomingTempHp: number): number {
  return Math.max(0, currentTempHp, incomingTempHp);
}

/**
 * Aplica daño absorbiendo primero con Puntos de Golpe Temporales y luego reduciendo PG actuales.
 */
export function applyDamageToCharacter(
  currentHp: number,
  maxHp: number,
  tempHp: number,
  damage: number
): { currentHp: number; tempHp: number; overflowDamage: number } {
  if (damage <= 0) {
    return { currentHp, tempHp, overflowDamage: 0 };
  }
  const absorbedByTemp = Math.min(tempHp, damage);
  const remainingDamage = damage - absorbedByTemp;
  const newTempHp = tempHp - absorbedByTemp;
  const newCurrentHp = Math.max(0, Math.min(maxHp, currentHp - remainingDamage));
  const overflowDamage = Math.max(0, remainingDamage - currentHp);

  return {
    currentHp: newCurrentHp,
    tempHp: newTempHp,
    overflowDamage
  };
}

/**
 * Aplica un Descanso Corto: recarga recursos de 'short_rest' y limpia heridas menores tratadas en descanso corto.
 */
export function applyShortRest(character: Character, hitDiceSpent = 0, hpRecovered = 0): Character {
  const newHitDiceCurrent = Math.max(0, character.hit_dice_current - Math.max(0, hitDiceSpent));
  const newCurrentHp = Math.min(character.max_hp, character.current_hp + Math.max(0, hpRecovered));

  const updatedResources = (character.class_resources ?? []).map(res =>
    res.recharge === 'short_rest' ? { ...res, used: 0 } : res
  );

  return {
    ...character,
    current_hp: newCurrentHp,
    hit_dice_current: newHitDiceCurrent,
    class_resources: updatedResources
  };
}

/**
 * Aplica un Descanso Largo (D&D 5.5e):
 * - Restaura PG al máximo y limpia PG temporales.
 * - Restaura todos los espacios de conjuro y recursos de descanso corto/largo.
 * - Reduce en 1 el nivel de Agotamiento.
 * - Recupera Dados de Golpe gastados.
 */
export function applyLongRest(character: Character): Character {
  const updatedSlots: typeof character.spell_slots = {};
  for (const [lvl, pool] of Object.entries(character.spell_slots ?? {})) {
    updatedSlots[lvl] = { total: pool.total, used: 0 };
  }

  const updatedResources = (character.class_resources ?? []).map(res =>
    res.recharge === 'short_rest' || res.recharge === 'long_rest' || res.recharge === 'dawn'
      ? { ...res, used: 0 }
      : res
  );

  return {
    ...character,
    current_hp: character.max_hp,
    temp_hp: 0,
    hit_dice_current: character.level,
    spell_slots: updatedSlots,
    class_resources: updatedResources,
    death_saves: { successes: 0, failures: 0 },
    exhaustion: Math.max(0, (character.exhaustion ?? 0) - 1)
  };
}
