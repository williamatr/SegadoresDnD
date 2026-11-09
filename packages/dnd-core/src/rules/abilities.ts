import type { AbilityScores, AbilityKey, ProficiencyLevel, Character } from '../types/character.ts';

/**
 * Calcula el modificador de una puntuación de característica de D&D: floor((score - 10) / 2).
 */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Formatea un modificador numérico con signo explícito (ej. +3, +0, -2).
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Calcula el bonificador por competencia según el nivel total de personaje (1 a 20).
 * Niveles 1-4: +2 | 5-8: +3 | 9-12: +4 | 13-16: +5 | 17-20: +6.
 */
export function calculateProficiencyBonus(totalLevel: number): number {
  const clamped = Math.max(1, Math.min(20, Math.floor(totalLevel)));
  return Math.ceil(1 + clamped / 4);
}

/**
 * Calcula el bonificador de una habilidad o salvación aplicando nivel de competencia y agotamiento 5.5e.
 * En D&D 5.5e, cada nivel de Agotamiento resta (2 * nivel) a todas las pruebas con d20.
 */
export function calculateSkillOrSaveBonus(
  abilityScore: number,
  proficiencyBonus: number,
  proficiency: ProficiencyLevel = 'none',
  exhaustionLevel = 0
): number {
  const mod = calculateAbilityModifier(abilityScore);
  const profMultiplier =
    proficiency === 'expertise'
      ? 2
      : proficiency === 'proficient'
        ? 1
        : proficiency === 'half'
          ? 0.5
          : 0;
  const exhaustionPenalty = Math.max(0, Math.min(6, exhaustionLevel)) * 2;
  return mod + Math.floor(proficiencyBonus * profMultiplier) - exhaustionPenalty;
}

/**
 * Calcula la CD de Salvación de Conjuros: 8 + Mod. Aptitud Mágica + Competencia - (2 * Agotamiento 5.5e).
 */
export function calculateSpellSaveDC(
  abilityScoreOrMod: number,
  proficiencyBonus: number,
  isRawScore = false,
  exhaustionLevel = 0
): number {
  const mod = isRawScore ? calculateAbilityModifier(abilityScoreOrMod) : abilityScoreOrMod;
  const exhaustionPenalty = Math.max(0, Math.min(6, exhaustionLevel)) * 2;
  return 8 + mod + proficiencyBonus - exhaustionPenalty;
}

/**
 * Calcula el bonificador de Ataque de Conjuro: Mod. Aptitud Mágica + Competencia - (2 * Agotamiento 5.5e).
 */
export function calculateSpellAttackBonus(
  abilityScoreOrMod: number,
  proficiencyBonus: number,
  isRawScore = false,
  exhaustionLevel = 0
): number {
  const mod = isRawScore ? calculateAbilityModifier(abilityScoreOrMod) : abilityScoreOrMod;
  const exhaustionPenalty = Math.max(0, Math.min(6, exhaustionLevel)) * 2;
  return mod + proficiencyBonus - exhaustionPenalty;
}

/**
 * Calcula la CD de Agarre (Grapple) o Empujón (Shove) según reglas D&D 5.5e (2024):
 * CD = 8 + Mod. Fuerza + Bonificador de Competencia.
 */
export function calculateGrappleOrShoveDC(strScore: number, proficiencyBonus: number): number {
  return 8 + calculateAbilityModifier(strScore) + proficiencyBonus;
}

/**
 * Calcula la CD de salvación de Constitución para mantener la Concentración al recibir daño (D&D 5.5e):
 * Mayor entre 10 y la mitad del daño recibido, con un tope máximo de CD 30.
 */
export function calculateConcentrationDC(damageTaken: number): number {
  if (damageTaken <= 0) return 10;
  return Math.min(30, Math.max(10, Math.floor(damageTaken / 2)));
}

/**
 * Devuelve todos los modificadores de característica a partir del objeto AbilityScores.
 */
export function getAllAbilityModifiers(scores: AbilityScores): Record<AbilityKey, number> {
  return {
    str: calculateAbilityModifier(scores.str),
    dex: calculateAbilityModifier(scores.dex),
    con: calculateAbilityModifier(scores.con),
    int: calculateAbilityModifier(scores.int),
    wis: calculateAbilityModifier(scores.wis),
    cha: calculateAbilityModifier(scores.cha)
  };
}

/**
 * Obtiene la puntuación efectiva de una característica evaluando objetos con fijación/modificadores
 * (ej. Guanteletes de fuerza de ogro = 19, Prótesis arcana = 20) de forma 100% agnóstica.
 */
export function getEffectiveAbilityScore(character: Character, ability: AbilityKey): number {
  const baseScore = character.ability_scores?.[ability] ?? 10;
  if (ability === 'str') {
    // 1. Guanteletes de fuerza de ogro (fija FUE a 19 si la base es menor)
    const hasOgreGauntlets = (character.inventory ?? []).some(
      i =>
        (i.equipped || i.attuned) &&
        (i.slug.includes('guanteletes') ||
          i.name?.toLowerCase().includes('guanteletes de fuerza de ogro') ||
          i.name?.toLowerCase().includes('ogre power'))
    );
    if (hasOgreGauntlets && baseScore < 19) {
      return 19;
    }

    // 2. Prótesis Arcana / Mano de Mago Marcial (FUE 20)
    const hasStr20Prosthesis =
      (character.inventory ?? []).some(
        i =>
          (i.slug.includes('protesis') ||
            i.name?.toLowerCase().includes('prótesis arcana') ||
            i.name?.toLowerCase().includes('mano de mago marcial')) &&
          (i.notes?.includes('FUE 20') ||
            i.notes?.includes('Fuerza 20') ||
            i.notes?.toLowerCase().includes('fuerza 20'))
      ) ||
      (character.player_notes?.includes('FUE 20') ?? false) ||
      (character.appearance?.toLowerCase().includes('prótesis') && baseScore >= 20);

    if (hasStr20Prosthesis && baseScore < 20) {
      return 20;
    }
  }
  return baseScore;
}

/**
 * Evalúa si un personaje es Mago de la Escuela de Evocación (Sabio en Evocación).
 */
export function isEvocationSavant(character: Character): boolean {
  const classesNorm = [
    character.character_class || '',
    ...(character.multiclass || []).map(m => `${m.class} ${m.subclass || ''}`)
  ]
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return (
    (classesNorm.includes('mago') || classesNorm.includes('wizard')) &&
    (classesNorm.includes('evocacion') || classesNorm.includes('evocation'))
  );
}

/**
 * Deriva la recompensa o rasgo de hito de nivel basándose en la clase y subclase del personaje.
 */
export function getClassMilestoneReward(character: Character, level = 10): string {
  const classesNorm = [
    character.character_class || '',
    ...(character.multiclass || []).map(m => `${m.class} ${m.subclass || ''}`)
  ]
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (classesNorm.includes('artific')) {
    return 'Artificiero: Tu límite de sintonización mágica aumenta de 3 a 4 objetos mágicos simultáneos (Erudito en Objetos Mágicos).';
  }
  if (classesNorm.includes('esporas') || (classesNorm.includes('druida') && classesNorm.includes('spores'))) {
    return 'Druida: Esporas expansivas (puedes lanzar tu Halo de Esporas a un punto a distancia como acción adicional).';
  }
  if (classesNorm.includes('evocacion') || (classesNorm.includes('mago') && classesNorm.includes('evocation'))) {
    return 'Mago: Magia potenciada de la Escuela de Evocación (suma modificador de Inteligencia al daño de conjuros de evocación).';
  }
  if (classesNorm.includes('picaro') || classesNorm.includes('rogue')) {
    return 'Pícaro: Mejora de característica adicional (ASI) o dote adicional de pícaro.';
  }
  if (classesNorm.includes('guerrero') || classesNorm.includes('fighter')) {
    return 'Guerrero: Rasgo marcial adicional de arquetipo e inmunidad a condiciones adicionales.';
  }
  if (classesNorm.includes('monje') || classesNorm.includes('monk')) {
    return 'Monje: Pureza corporal (inmunidad a veneno y enfermedades) y mejoras de Ki.';
  }
  if (classesNorm.includes('paladin')) {
    return 'Paladín: Aura de valor e inmunidad a ser asustado.';
  }
  if (classesNorm.includes('bardo') || classesNorm.includes('bard')) {
    return 'Bardo: Secretos mágicos adicionales (puedes aprender conjuros de cualquier lista de clase).';
  }
  if (classesNorm.includes('clerigo') || classesNorm.includes('cleric')) {
    return 'Clérigo: Intervención Divina (puedes implorar ayuda directa a tu deidad).';
  }

  return `Hito de Nivel ${level}: Rasgo avanzado de clase o mejora de característica / dote.`;
}
