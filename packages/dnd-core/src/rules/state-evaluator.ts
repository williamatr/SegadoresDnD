import type { Character } from '../types/character.ts';
import type {
  ActionAvailability,
  ActiveEffect,
  EvaluatedCharacterState,
  StandardConditionId
} from '../types/effects.ts';
import { formatModifier } from './abilities.ts';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const CONDITION_ALIASES: Record<string, StandardConditionId> = {
  agarrado: 'agarrado',
  grappled: 'agarrado',
  apresado: 'apresado',
  restringido: 'apresado',
  restrained: 'apresado',
  asustado: 'asustado',
  frightened: 'asustado',
  aturdido: 'aturdido',
  stunned: 'aturdido',
  cegado: 'cegado',
  blinded: 'cegado',
  derribado: 'derribado',
  tumbado: 'derribado',
  prone: 'derribado',
  ensordecido: 'ensordecido',
  deafened: 'ensordecido',
  envenenado: 'envenenado',
  poisoned: 'envenenado',
  hechizado: 'hechizado',
  charmed: 'hechizado',
  incapacitado: 'incapacitado',
  incapacitated: 'incapacitado',
  inconsciente: 'inconsciente',
  unconscious: 'inconsciente',
  invisible: 'invisible',
  paralizado: 'paralizado',
  paralyzed: 'paralizado',
  petrificado: 'petrificado',
  petrified: 'petrificado',
  silenciado: 'silenciado',
  silenced: 'silenciado'
};

function detectConditionId(effect: ActiveEffect): StandardConditionId | undefined {
  if (effect.conditionId) return effect.conditionId;
  const norm = normalizeText(effect.name);
  for (const [alias, condId] of Object.entries(CONDITION_ALIASES)) {
    if (norm === alias || norm.includes(alias)) {
      return condId;
    }
  }
  return undefined;
}

function createEmptyAvailability(): Record<ActionAvailability['actionType'], ActionAvailability> {
  const keys: ActionAvailability['actionType'][] = [
    'action',
    'bonus_action',
    'reaction',
    'movement',
    'verbal_spell',
    'somatic_spell',
    'martial_arts',
    'unarmored_movement',
    'concentration'
  ];

  const map = {} as Record<ActionAvailability['actionType'], ActionAvailability>;
  for (const k of keys) {
    map[k] = {
      actionType: k,
      available: true,
      blockedBy: [],
      warnings: []
    };
  }
  return map;
}

function blockAction(
  availability: Record<ActionAvailability['actionType'], ActionAvailability>,
  actionType: ActionAvailability['actionType'],
  reason: string
): void {
  const entry = availability[actionType];
  entry.available = false;
  if (!entry.blockedBy.includes(reason)) {
    entry.blockedBy.push(reason);
  }
}

function warnAction(
  availability: Record<ActionAvailability['actionType'], ActionAvailability>,
  actionType: ActionAvailability['actionType'],
  warning: string
): void {
  const entry = availability[actionType];
  if (!entry.warnings.includes(warning)) {
    entry.warnings.push(warning);
  }
}

/**
 * Evalúa el estado mecánico completo de un personaje combinando sus atributos base,
 * inventario equipado, niveles de agotamiento 5.5e, condiciones, heridas (Tablas A/B) y rasgos de clase.
 */
export function evaluateCharacterState(character: Character): EvaluatedCharacterState {
  const availability = createEmptyAvailability();
  const acBreakdown: string[] = [`CA Base ficha: ${character.armor_class}`];
  const speedBreakdown: string[] = [`Velocidad base: ${character.speed} pies`];
  const disadvantages: string[] = [];
  const advantages: string[] = [];
  const tacticalReminders: string[] = [];

  const activeBonusDice = {
    attack: [] as string[],
    save: [] as string[],
    check: [] as string[]
  };

  let effectiveAc = character.armor_class;
  let effectiveSpeed = character.speed;
  let speedMultiplier = 1;
  let forceZeroSpeed = false;
  let maxHpMultiplier = 1;

  // 1. Evaluar Agotamiento D&D 5.5e (Niveles 0 a 6)
  const exhaustion = Math.max(0, Math.min(6, character.exhaustion ?? 0));
  const d20ExhaustionPenalty = exhaustion > 0 ? -(exhaustion * 2) : 0;
  const spellDcExhaustionPenalty = exhaustion > 0 ? -(exhaustion * 2) : 0;

  if (exhaustion > 0) {
    const speedPen = exhaustion * 5;
    effectiveSpeed -= speedPen;
    speedBreakdown.push(`Agotamiento Nv.${exhaustion} (-${speedPen} pies)`);
    tacticalReminders.push(
      `Agotamiento Nivel ${exhaustion} (5.5e): ${d20ExhaustionPenalty} a todas las pruebas d20 (ataques, habilidades, salvaciones) y CD de conjuros.`
    );
  }

  if (exhaustion >= 6) {
    forceZeroSpeed = true;
    for (const key of Object.keys(availability) as ActionAvailability['actionType'][]) {
      blockAction(availability, key, 'Muerte por Agotamiento Nivel 6');
    }
  }

  // 2. Evaluar Rasgos de Clase e Interacciones de Equipo (Monje, Artífice, Druida, Multiclase)
  const classesNorm = [
    normalizeText(character.character_class),
    ...(character.multiclass ?? []).map(m => `${normalizeText(m.class)} ${normalizeText(m.subclass ?? '')}`)
  ].join(' ');

  const isMonk = classesNorm.includes('monje');
  const isArtificer = classesNorm.includes('artifice');
  const isSporesDruid = classesNorm.includes('esporas') || (classesNorm.includes('druida') && normalizeText(character.player_notes ?? '').includes('esporas'));

  const hasEquippedArmorOrShield = (character.inventory ?? []).some(
    item =>
      item.equipped &&
      (item.category === 'armor' ||
        item.category === 'shield' ||
        normalizeText(item.name).includes('armadura de') ||
        normalizeText(item.name).includes('cota de') ||
        normalizeText(item.name).includes('escudo'))
  );

  if (isMonk && hasEquippedArmorOrShield) {
    blockAction(availability, 'martial_arts', 'Armadura o escudo equipado');
    blockAction(availability, 'unarmored_movement', 'Armadura o escudo equipado');
    tacticalReminders.push(
      'Monje con Armadura/Escudo: Defensa sin Armadura, Artes Marciales y Movimiento sin Armadura están desactivados, pero tus Puntos de Ki (Ráfaga de golpes, Defensa paciente, Paso del viento) siguen 100% activos.'
    );
  }

  if (isArtificer) {
    warnAction(
      availability,
      'somatic_spell',
      'Conjuros de Artífice requieren canalizador Material (herramientas o infusión) en mano.'
    );
    tacticalReminders.push(
      'Conjuración de Artífice: Todos tus conjuros de Artífice tienen componente Material (M) obligatorio; debes empuñar herramientas de artesano o un objeto imbuido con una de tus Infusiones.'
    );
  }

  if (isSporesDruid) {
    if ((character.temp_hp ?? 0) <= 0) {
      tacticalReminders.push(
        'Círculo de las Esporas: No tienes PG temporales activos; recuerda que el daño necrótico adicional cuerpo a cuerpo (+1d6) de Entidad Simbiótica solo se mantiene mientras conserves sus PG temporales.'
      );
    } else {
      tacticalReminders.push(
        `Entidad Simbiótica activa (${character.temp_hp} PG temporales): Tus impactos con armas cuerpo a cuerpo infligen +1d6 de daño necrótico extra y Halo de Esporas tira 2d4.`
      );
    }
  }

  if ((character.spellcasting_stats ?? []).length > 1) {
    const summary = character.spellcasting_stats
      .map(s => `${s.source} (${s.ability}: CD ${s.save_dc ?? '-'}, Ataque ${formatModifier(s.attack_bonus ?? 0)})`)
      .join(' | ');
    tacticalReminders.push(`Lanzador Multiclase Dual: Usa la estadística según la clase de origen del conjuro -> ${summary}.`);
  }

  if (character.concentrating_on) {
    tacticalReminders.push(
      `Concentración activa en "${character.concentrating_on}": Al sufrir daño debes superar Salvación de CON (CD = máx(10, mitad del daño)). Lanzar otro conjuro de concentración cancela este efecto.`
    );
  }

  // 3. Evaluar Efectos Activos (Condiciones, Heridas Tablas A/B, Buffs y Debuffs)
  for (const effect of character.active_effects ?? []) {
    const condId = detectConditionId(effect);
    const normName = normalizeText(effect.name);

    // Detectar buffs clásicos por nombre si no traen modifiers explícitos
    if (normName.includes('bendicion') || normName.includes('bless')) {
      if (!activeBonusDice.attack.includes('1d4')) activeBonusDice.attack.push('1d4');
      if (!activeBonusDice.save.includes('1d4')) activeBonusDice.save.push('1d4');
    }
    if (normName.includes('escudo de fe') || normName.includes('shield of faith')) {
      if (!effect.modifiers?.acBonus) {
        effectiveAc += 2;
        acBreakdown.push(`${effect.name} (+2)`);
      }
    }

    // Evaluar Condiciones Estándar de D&D 5.5e
    if (condId === 'agarrado') {
      forceZeroSpeed = true;
      speedBreakdown.push(`${effect.name}: Velocidad 0`);
    } else if (condId === 'apresado') {
      forceZeroSpeed = true;
      speedBreakdown.push(`${effect.name}: Velocidad 0`);
      disadvantages.push(`Tiradas de ataque y Salvaciones de DES (${effect.name})`);
    } else if (condId === 'asustado') {
      disadvantages.push(`Pruebas de característica y ataques mientras veas la fuente del miedo (${effect.name})`);
    } else if (condId === 'cegado') {
      disadvantages.push(`Tiradas de ataque y pruebas basadas en la vista (${effect.name})`);
    } else if (condId === 'derribado') {
      disadvantages.push(`Tiradas de ataque cuerpo a cuerpo/distancia (${effect.name})`);
      warnAction(availability, 'movement', 'Levantarse cuesta la mitad de tu velocidad total.');
    } else if (condId === 'ensordecido') {
      disadvantages.push(`Pruebas de Percepción basadas en el oído (${effect.name})`);
    } else if (condId === 'envenenado') {
      disadvantages.push(`Tiradas de ataque y pruebas de característica (${effect.name})`);
    } else if (condId === 'incapacitado') {
      blockAction(availability, 'action', effect.name);
      blockAction(availability, 'bonus_action', effect.name);
      blockAction(availability, 'reaction', effect.name);
      blockAction(availability, 'concentration', effect.name);
      blockAction(availability, 'verbal_spell', effect.name);
      blockAction(availability, 'somatic_spell', effect.name);
    } else if (
      condId === 'aturdido' ||
      condId === 'paralizado' ||
      condId === 'inconsciente' ||
      condId === 'petrificado'
    ) {
      forceZeroSpeed = true;
      speedBreakdown.push(`${effect.name}: Velocidad 0`);
      blockAction(availability, 'action', effect.name);
      blockAction(availability, 'bonus_action', effect.name);
      blockAction(availability, 'reaction', effect.name);
      blockAction(availability, 'movement', effect.name);
      blockAction(availability, 'concentration', effect.name);
      blockAction(availability, 'verbal_spell', effect.name);
      blockAction(availability, 'somatic_spell', effect.name);
    } else if (condId === 'silenciado') {
      blockAction(availability, 'verbal_spell', effect.name);
    } else if (condId === 'invisible') {
      advantages.push(`Tiradas de ataque e Iniciativa (${effect.name})`);
    }

    // Evaluar modificadores explícitos (ej. Heridas de Tabla A y Tabla B o buffs personalizados)
    if (effect.modifiers) {
      const m = effect.modifiers;
      if (m.acBonus) {
        effectiveAc += m.acBonus;
        acBreakdown.push(`${effect.name} (${formatModifier(m.acBonus)})`);
      }
      if (m.speedBonus) {
        effectiveSpeed += m.speedBonus;
        speedBreakdown.push(`${effect.name} (${formatModifier(m.speedBonus)} pies)`);
      }
      if (m.speedMultiplier !== undefined) {
        speedMultiplier *= m.speedMultiplier;
        speedBreakdown.push(`${effect.name} (x${m.speedMultiplier})`);
      }
      if (m.forceZeroSpeed) {
        forceZeroSpeed = true;
        speedBreakdown.push(`${effect.name}: Velocidad 0`);
      }
      if (m.maxHpMultiplier !== undefined) {
        maxHpMultiplier *= m.maxHpMultiplier;
      }
      if (m.attackBonusDice) {
        for (const d of m.attackBonusDice) {
          if (!activeBonusDice.attack.includes(d)) activeBonusDice.attack.push(d);
        }
      }
      if (m.saveBonusDice) {
        for (const d of m.saveBonusDice) {
          if (!activeBonusDice.save.includes(d)) activeBonusDice.save.push(d);
        }
      }
      if (m.abilityCheckBonusDice) {
        for (const d of m.abilityCheckBonusDice) {
          if (!activeBonusDice.check.includes(d)) activeBonusDice.check.push(d);
        }
      }
      if (m.disadvantageOnAttacks) {
        disadvantages.push(`Tiradas de ataque (${effect.name})`);
      }
      if (m.advantageOnAttacks) {
        advantages.push(`Tiradas de ataque (${effect.name})`);
      }
      if (m.disadvantageOnRangedOver30Ft) {
        disadvantages.push(`Ataques a distancia a más de 30 pies (${effect.name})`);
      }
      if (m.disadvantageOnPerceptionSight) {
        disadvantages.push(`Pruebas de Percepción basadas en la vista (${effect.name})`);
      }
      if (m.disadvantageOnConcentration) {
        disadvantages.push(`Salvaciones de Concentración (${effect.name})`);
        warnAction(availability, 'concentration', `Desventaja en Concentración por ${effect.name}`);
      }
      if (m.blocksReactions) {
        blockAction(availability, 'reaction', effect.name);
      }
      if (m.blocksActions) {
        blockAction(availability, 'action', effect.name);
      }
      if (m.blocksBonusActions) {
        blockAction(availability, 'bonus_action', effect.name);
      }
      if (m.blocksVerbalSpells) {
        blockAction(availability, 'verbal_spell', effect.name);
      }
      if (m.verbalSpellConSaveDc) {
        warnAction(
          availability,
          'verbal_spell',
          `${effect.name}: Exige superar Salvación de CON CD ${m.verbalSpellConSaveDc} o el conjuro con componente Verbal falla.`
        );
      }
    }
  }

  const finalSpeed = forceZeroSpeed ? 0 : Math.max(0, Math.floor(effectiveSpeed * speedMultiplier));
  if (finalSpeed === 0) {
    blockAction(availability, 'movement', 'Velocidad reducida a 0 pies');
  }

  const effectiveMaxHp = Math.max(1, Math.floor(character.max_hp * maxHpMultiplier));

  return {
    effectiveAc,
    acBreakdown,
    effectiveSpeed: finalSpeed,
    speedBreakdown,
    effectiveMaxHp,
    d20ExhaustionPenalty,
    spellDcExhaustionPenalty,
    activeBonusDice,
    disadvantages,
    advantages,
    availability,
    tacticalReminders
  };
}
