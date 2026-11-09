import type { Character } from '../types/character.ts';
import type { ActionAvailability } from '../types/effects.ts';
import { calculateAbilityModifier } from './abilities.ts';

export interface TacticalActionItem {
  id: string;
  name: string;
  description: string;
  source: string;
  actionType: 'bonus_action' | 'reaction' | 'action';
  cost?: string;
  available?: boolean;
  highlightVariant?: 'gold' | 'crimson' | 'green' | 'default';
}

export interface TacticalActionsResult {
  bonusActions: TacticalActionItem[];
  reactions: TacticalActionItem[];
  actions: TacticalActionItem[];
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Deriva las acciones tácticas disponibles para un personaje en combate
 * (acciones adicionales, reacciones y acciones de clase/objetos).
 * 100% agnóstica de slug.
 */
export function getTacticalActions(
  character: Character,
  availability?: Record<string, ActionAvailability>
): TacticalActionsResult {
  const isBonusBlocked = availability?.bonus_action ? !availability.bonus_action.available : false;
  const isReactionBlocked = availability?.reaction ? !availability.reaction.available : false;
  const isActionBlocked = availability?.action ? !availability.action.available : false;
  const isMartialArtsBlocked = availability?.martial_arts ? !availability.martial_arts.available : false;

  const classesNorm = [
    normalizeText(character.character_class || ''),
    ...(character.multiclass || []).map(m => `${normalizeText(m.class || '')} ${normalizeText(m.subclass || '')}`)
  ].join(' ');

  const inventory = character.inventory || [];
  const resources = character.class_resources || [];

  const isFighter =
    classesNorm.includes('guerrero') ||
    classesNorm.includes('fighter') ||
    resources.some(r => r.id === 'second_wind');
  const isRogue = classesNorm.includes('picaro') || classesNorm.includes('rogue');
  const isBard =
    classesNorm.includes('bardo') ||
    classesNorm.includes('bard') ||
    resources.some(r => r.id === 'bardic_inspiration');
  const isSporesDruid =
    classesNorm.includes('esporas') ||
    (classesNorm.includes('druida') && normalizeText(character.player_notes || '').includes('esporas'));
  const isMonk =
    classesNorm.includes('monje') ||
    classesNorm.includes('monk') ||
    resources.some(r => r.id.includes('ki'));
  const isArtificer = classesNorm.includes('artific');

  const bonusActions: TacticalActionItem[] = [];
  const reactions: TacticalActionItem[] = [];
  const actions: TacticalActionItem[] = [];

  // --- ACCIONES ADICIONALES (BONUS ACTIONS) ---

  // Monje: Artes Marciales y Ki
  if (isMonk) {
    if (!isMartialArtsBlocked) {
      bonusActions.push({
        id: 'monk-unarmed-strike',
        name: 'Golpe Desarmado Adicional',
        description: 'Al atacar con arma de monje o desarmado, 1 golpe desarmado con DES gratis.',
        source: 'Monje (Artes Marciales)',
        actionType: 'bonus_action',
        available: !isBonusBlocked,
        highlightVariant: 'gold'
      });
      bonusActions.push({
        id: 'monk-flurry-of-blows',
        name: 'Ráfaga de Golpes (Ki)',
        description: 'Gasta 1 Ki para realizar 2 ataques desarmados.',
        source: 'Monje (Ki)',
        actionType: 'bonus_action',
        cost: '1 Ki',
        available: !isBonusBlocked,
        highlightVariant: 'gold'
      });
    }
    bonusActions.push({
      id: 'monk-patient-defense',
      name: 'Defensa Paciente (Ki)',
      description: 'Destrabarse gratis, o 1 Ki para Destrabarse + Esquivar.',
      source: 'Monje (Ki)',
      actionType: 'bonus_action',
      cost: '0-1 Ki',
      available: !isBonusBlocked,
      highlightVariant: 'gold'
    });
    bonusActions.push({
      id: 'monk-step-of-the-wind',
      name: 'Paso del Viento (Ki)',
      description: 'Correr gratis, o 1 Ki para Destrabarse + Correr (x2 salto).',
      source: 'Monje (Ki)',
      actionType: 'bonus_action',
      cost: '0-1 Ki',
      available: !isBonusBlocked,
      highlightVariant: 'gold'
    });
  }

  // Guerrero: Nuevas Energías (Second Wind)
  if (isFighter) {
    const swResource = resources.find(r => r.id === 'second_wind');
    const isAvailable = !isBonusBlocked && (!swResource || swResource.used < swResource.max);
    bonusActions.push({
      id: 'fighter-second-wind',
      name: 'Nuevas Energías (Second Wind)',
      description: `Recupera 1d10+${character.level} PG`,
      source: 'Guerrero',
      actionType: 'bonus_action',
      cost: '1 Uso',
      available: isAvailable,
      highlightVariant: 'crimson'
    });
  }

  // Pícaro: Acción Astuta (Cunning Action)
  if (isRogue) {
    bonusActions.push({
      id: 'rogue-cunning-action',
      name: 'Acción Astuta (Pícaro)',
      description: 'Correr, Destrabarse o Esconderse',
      source: 'Pícaro',
      actionType: 'bonus_action',
      available: !isBonusBlocked,
      highlightVariant: 'crimson'
    });
  }

  // Bardo: Inspiración Bárdica
  if (isBard) {
    const bardResource = resources.find(r => r.id === 'bardic_inspiration');
    const isAvailable = !isBonusBlocked && (!bardResource || bardResource.used < bardResource.max);
    bonusActions.push({
      id: 'bard-inspiration',
      name: 'Inspiración Bárdica',
      description: 'Dar 1d6 a un aliado a 60 pies',
      source: 'Bardo',
      actionType: 'bonus_action',
      cost: '1 Uso',
      available: isAvailable,
      highlightVariant: 'crimson'
    });
  }

  // Druida Esporas: Entidad Simbiótica
  if (isSporesDruid) {
    bonusActions.push({
      id: 'druid-symbiotic-entity-action',
      name: 'Entidad Simbiótica',
      description: `+${character.level * 4} PG temp, 2d6 esporas`,
      source: 'Druida Esporas',
      actionType: 'bonus_action',
      cost: '1 Forma Salvaje',
      available: !isBonusBlocked,
      highlightVariant: 'crimson'
    });
  }

  // Armas mágicas con acción adicional (Marginem Noctis u otras)
  for (const item of inventory) {
    if (item.equipped && item.attuned) {
      const normSlug = normalizeText(item.slug);
      const normNotes = normalizeText(item.notes || '');
      if (
        normSlug.includes('marginem-noctis') ||
        normNotes.includes('encender') ||
        normNotes.includes('activar como acción adicional')
      ) {
        bonusActions.push({
          id: `item-bonus-${item.slug}`,
          name: `Encender ${item.name}`,
          description: item.notes?.split('.')[0] || 'Activa daño elemental o efecto de impacto.',
          source: item.name,
          actionType: 'bonus_action',
          available: !isBonusBlocked,
          highlightVariant: 'gold'
        });
      }
    }
  }

  // --- REACCIONES (REACTIONS) ---

  // Reacción Universal: Ataque de Oportunidad
  reactions.push({
    id: 'universal-opportunity-attack',
    name: 'Ataque de Oportunidad',
    description: 'Ataque cuerpo a cuerpo cuando un enemigo sale de tu alcance.',
    source: 'Regla Básica',
    actionType: 'reaction',
    available: !isReactionBlocked,
    highlightVariant: 'default'
  });

  // Artificiero (Nv. >= 7): Destello de Genialidad
  if (isArtificer && character.level >= 7) {
    const intMod = calculateAbilityModifier(character.ability_scores.int);
    reactions.push({
      id: 'artificer-flash-of-genius',
      name: 'Destello de Genialidad',
      description: `+${intMod} a tirada de salvación o prueba de aliado a 30 pies`,
      source: 'Artificiero',
      actionType: 'reaction',
      cost: '1 Reacción',
      available: !isReactionBlocked,
      highlightVariant: 'gold'
    });
  }

  // Druida Esporas: Halo de Esporas
  if (isSporesDruid) {
    reactions.push({
      id: 'druid-halo-of-spores',
      name: 'Halo de Esporas',
      description: '1d6 / 2d6 necrótico a criatura a 10 pies (TS CON)',
      source: 'Druida Esporas',
      actionType: 'reaction',
      available: !isReactionBlocked,
      highlightVariant: 'green'
    });
  }

  // Pícaro (Nv. >= 5): Esquiva Asombrosa (Uncanny Dodge)
  if (isRogue && character.level >= 5) {
    reactions.push({
      id: 'rogue-uncanny-dodge',
      name: 'Esquiva Asombrosa',
      description: 'Reduce a la mitad el daño de un ataque visible que te impacte.',
      source: 'Pícaro',
      actionType: 'reaction',
      available: !isReactionBlocked,
      highlightVariant: 'crimson'
    });
  }

  // Monje: Desviar Ataques / Proyectiles
  if (isMonk && character.level >= 3) {
    reactions.push({
      id: 'monk-deflect-attacks',
      name: 'Desviar Ataques / Proyectiles',
      description: 'Reduce daño en 1d10 + DES + Nivel de monje',
      source: 'Monje',
      actionType: 'reaction',
      available: !isReactionBlocked,
      highlightVariant: 'gold'
    });
  }

  return {
    bonusActions,
    reactions,
    actions
  };
}
