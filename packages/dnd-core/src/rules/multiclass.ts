import type { MulticlassEntry } from '../types/character.ts';
import type { SpellSlotPool } from '../types/spells.ts';

/**
 * Umbrales de Puntos de Experiencia acumulados por nivel (1 al 20) en D&D 5e / 5.5e.
 */
export const XP_THRESHOLDS_BY_LEVEL: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
};

/**
 * Coste incremental estándar de PX para adquirir un nuevo nivel `L` en una clase.
 * Nota de regla de campaña: adquirir el Nivel 1 de una clase secundaria tiene un coste base normal de 300 PX (150 PX al 50%).
 */
export const INCREMENTAL_XP_COST_BY_LEVEL: Record<number, number> = {
  1: 300,
  2: 300,
  3: 600,
  4: 1800,
  5: 3800,
  6: 7500,
  7: 9000,
  8: 11000,
  9: 14000,
  10: 16000,
  11: 21000,
  12: 15000,
  13: 20000,
  14: 20000,
  15: 25000,
  16: 30000,
  17: 30000,
  18: 40000,
  19: 40000,
  20: 50000
};

export interface MulticlassXpCostResult {
  targetClassCurrentLevel: number;
  targetClassNextLevel: number;
  primaryClassLevel: number;
  characterTotalLevel: number;
  nextCharacterTotalLevel: number;
  officialRawCost: number; // Coste oficial RAW D&D 5e / 5.5e (100% del escalón de nivel de personaje)
  normalCost: number; // Alias para compatibilidad con código existente
  xpCost: number; // Coste final aplicando regla de campaña
  savings: number; // PX ahorrados gracias a la regla casera
  isCatchUpHalfCost: boolean;
}

/**
 * Representa el estado de progreso de experiencia y nivel de un personaje.
 */
export interface CharacterXpProgress {
  currentXp: number;
  currentLevel: number;
  nextLevel: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  remainingXp: number;
  isMaxLevel: boolean;
}

/**
 * Calcula el progreso de experiencia (PX) de un personaje respecto al umbral oficial de su nivel actual y el siguiente.
 * Admite tanto PX acumulados totales (ej. 26.600 PX) como PX en progreso dentro del nivel (ej. 3.600 PX hacia nivel 8).
 */
export function getCharacterXpProgress(level: number, experiencePoints: number): CharacterXpProgress {
  const currentLevel = Math.max(1, Math.min(20, Math.floor(level || 1)));
  const nextLevel = Math.min(20, currentLevel + 1);
  const isMaxLevel = currentLevel >= 20;

  const currentLevelThreshold = XP_THRESHOLDS_BY_LEVEL[currentLevel] ?? 0;
  const nextLevelThreshold = XP_THRESHOLDS_BY_LEVEL[nextLevel] ?? currentLevelThreshold;

  // Si los PX son menores que el umbral del nivel actual, se interpretan como progreso dentro del nivel
  // (ej. 3.600 PX en un personaje de nivel 7 con umbral 23.000 -> 26.600 PX acumulados)
  const totalAccumulatedXp = experiencePoints < currentLevelThreshold
    ? currentLevelThreshold + Math.max(0, experiencePoints)
    : Math.max(0, experiencePoints);

  const xpNeededForNextLevel = isMaxLevel ? 0 : Math.max(0, nextLevelThreshold - currentLevelThreshold);
  const xpIntoCurrentLevel = Math.max(0, totalAccumulatedXp - currentLevelThreshold);
  const remainingXp = isMaxLevel ? 0 : Math.max(0, nextLevelThreshold - totalAccumulatedXp);
  const progressPercent = isMaxLevel
    ? 100
    : xpNeededForNextLevel > 0
      ? Math.min(100, Math.max(0, Math.round((xpIntoCurrentLevel / xpNeededForNextLevel) * 100)))
      : 100;

  return {
    currentXp: totalAccumulatedXp,
    currentLevel,
    nextLevel,
    currentLevelThreshold,
    nextLevelThreshold,
    xpNeededForNextLevel,
    progressPercent,
    remainingXp,
    isMaxLevel
  };
}

/**
 * Calcula el coste en Puntos de Experiencia para subir de nivel en una clase,
 * comparando la regla oficial de D&D 5e / 5.5e (RAW) con la Regla de Campaña (Catch-Up al 50%).
 *
 * REGLA OFICIAL D&D 5.5e (SRD 5.2.1 pág. 27):
 * - El coste en PX se basa estrictamente en el NIVEL TOTAL DEL PERSONAJE, no en la clase concreta.
 * - Subir de Nivel Total N a N+1 cuesta exactamente INCREMENTAL_XP_COST_BY_LEVEL[N+1], sin importar qué clase se suba.
 *
 * REGLA DE CAMPAÑA CORREGIDA (CATCH-UP AL 50% BASADO EN EL ESCALÓN DE PERSONAJE):
 * - Si la clase secundaria está por debajo del nivel de la clase primaria (targetCurrent < primaryLevel),
 *   subir de nivel esa clase secundaria cuesta el 50% del escalón del siguiente nivel de personaje.
 * - Si la clase secundaria ya igualó a la primaria (targetCurrent >= primaryLevel),
 *   o si se sube la clase primaria, cuesta el 100% del escalón del siguiente nivel de personaje.
 *
 * @param targetClassNextLevel Nivel objetivo al que se desea subir la clase (ej. 2 para pasar de Monje 1 a 2)
 * @param primaryClassLevel Nivel de la clase principal del personaje (ej. 7 de Mago)
 * @param characterTotalLevel (Opcional) Nivel total actual del personaje. Si no se pasa, se asume primaryClassLevel + (targetClassNextLevel - 1).
 */
export function calculateMulticlassLevelUpCost(
  targetClassNextLevel: number,
  primaryClassLevel: number,
  characterTotalLevel?: number
): MulticlassXpCostResult {
  const clampedTargetNext = Math.max(1, Math.min(20, Math.floor(targetClassNextLevel)));
  const targetCurrent = clampedTargetNext - 1;
  const clampedPrimary = Math.max(1, Math.min(20, Math.floor(primaryClassLevel)));

  // Determinar el nivel total del personaje
  const currentTotal = characterTotalLevel !== undefined
    ? Math.max(1, Math.min(19, Math.floor(characterTotalLevel)))
    : Math.max(1, Math.min(19, clampedPrimary + targetCurrent));

  const nextTotal = Math.min(20, currentTotal + 1);

  // El coste oficial de saltar al siguiente nivel total de personaje
  const officialRawCost = INCREMENTAL_XP_COST_BY_LEVEL[nextTotal] ?? 0;

  // Regla de campaña: si la clase objetivo actual es estrictamente menor que la clase principal,
  // aplica el 50% de descuento sobre el escalón del personaje.
  const isCatchUpHalfCost = clampedPrimary > 0 && targetCurrent < clampedPrimary;
  const xpCost = isCatchUpHalfCost ? Math.floor(officialRawCost * 0.5) : officialRawCost;
  const savings = isCatchUpHalfCost ? officialRawCost - xpCost : 0;

  return {
    targetClassCurrentLevel: targetCurrent,
    targetClassNextLevel: clampedTargetNext,
    primaryClassLevel: clampedPrimary,
    characterTotalLevel: currentTotal,
    nextCharacterTotalLevel: nextTotal,
    officialRawCost,
    normalCost: officialRawCost,
    xpCost,
    savings,
    isCatchUpHalfCost
  };
}

/**
 * Tabla oficial de Espacios de Conjuro por Nivel de Lanzador Multiclase (Niveles 1 a 20).
 */
const MULTICLASS_SPELL_SLOTS_TABLE: Record<number, number[]> = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calcula el Nivel de Lanzador de Conjuros efectivo combinando todas las clases del personaje.
 * - Lanzadores completos (Bardo, Clérigo, Druida, Hechicero, Mago): nivel * 1
 * - Semilanzadores (Artífice, Paladín, Explorador/Guardabosques): ceil(nivel / 2)
 * - Un tercio de lanzador (Embaucador Arcano, Caballero Arcano): floor(nivel / 3)
 */
export function calculateMulticlassCasterLevel(classes: MulticlassEntry[]): number {
  let totalCasterLevel = 0;

  for (const entry of classes) {
    const cls = normalizeText(entry.class);
    const sub = normalizeText(entry.subclass ?? '');
    const fullText = `${cls} ${sub}`;

    if (
      cls.includes('bardo') ||
      cls.includes('clerigo') ||
      cls.includes('druida') ||
      cls.includes('hechicero') ||
      cls.includes('mago')
    ) {
      totalCasterLevel += entry.level;
    } else if (
      cls.includes('artifice') ||
      cls.includes('paladin') ||
      cls.includes('explorador') ||
      cls.includes('guardabosques')
    ) {
      totalCasterLevel += Math.ceil(entry.level / 2);
    } else if (
      fullText.includes('embaucador arcano') ||
      fullText.includes('arcane trickster') ||
      fullText.includes('caballero arcano') ||
      fullText.includes('eldritch knight')
    ) {
      totalCasterLevel += Math.floor(entry.level / 3);
    }
  }

  return Math.max(0, Math.min(20, totalCasterLevel));
}

/**
 * Devuelve el pool de espacios de conjuro correspondiente a un nivel de lanzador (1 a 20).
 */
export function getMulticlassSpellSlots(casterLevel: number): SpellSlotPool {
  const clamped = Math.max(0, Math.min(20, Math.floor(casterLevel)));
  if (clamped === 0) return {};

  const row = MULTICLASS_SPELL_SLOTS_TABLE[clamped] ?? [];
  const pool: SpellSlotPool = {};

  row.forEach((totalSlots, idx) => {
    if (totalSlots > 0) {
      pool[String(idx + 1)] = { total: totalSlots, used: 0 };
    }
  });

  return pool;
}
