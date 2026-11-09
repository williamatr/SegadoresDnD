import type { Character } from '../types/character.ts';
import { calculateAbilityModifier } from './abilities.ts';

export interface ContextualRule {
  id: string;
  title: string;
  description: string;
  category: 'class' | 'race' | 'item' | 'magic' | 'universal' | 'rest';
  iconType: 'sparkles' | 'zap' | 'shield' | 'flame' | 'swords' | 'moon' | 'heart' | 'book';
  badge?: string;
  colorVariant?: 'gold' | 'crimson' | 'green' | 'terracotta' | 'default';
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Genera dinámicamente las reglas contextuales oficiales y de mesa aplicables a un personaje
 * basándose en su raza, clase, subclase, equipo rúnico, prótesis y rasgos de campaña.
 * 100% agnóstica de slug.
 */
export function getContextualRules(character: Character): ContextualRule[] {
  const rules: ContextualRule[] = [];

  const classesNorm = [
    normalizeText(character.character_class || ''),
    ...(character.multiclass || []).map(m => `${normalizeText(m.class || '')} ${normalizeText(m.subclass || '')}`)
  ].join(' ');

  const raceNorm = normalizeText(character.race || '');
  const inventory = character.inventory || [];

  // --- 1. Objetos Mágicos, Prótesis y Sinergias de Inventario ---

  // Prótesis Arcana Permanente
  const hasProsthesis =
    inventory.some(
      i =>
        normalizeText(i.slug).includes('protesis') ||
        normalizeText(i.name).includes('protesis arcana') ||
        normalizeText(i.name).includes('mano de mago marcial')
    ) ||
    normalizeText(character.player_notes || '').includes('protesis') ||
    normalizeText(character.appearance || '').includes('protesis') ||
    normalizeText(character.backstory || '').includes('protesis');

  if (hasProsthesis) {
    rules.push({
      id: 'arcane-prosthesis',
      title: 'Prótesis Arcana Permanente (FUE 20)',
      description:
        'Fruto del adiestramiento arcano y marcial, la mano amputada ha sido sustituida por una prótesis espectral permanente. Funciona como una mano física con Fuerza 20 (+5), sin requerir concentración ni tener límite de duración. Le permite empuñar dos espadas a la vez o embrazar su escudo de combate.',
      category: 'item',
      iconType: 'sparkles',
      badge: 'Prótesis Arcana',
      colorVariant: 'gold'
    });
  }

  // Combo Rúnico de Gorthok (Resonancia Sónica)
  const hasRuthaglar = inventory.some(
    i => normalizeText(i.slug).includes('ruthaglar') || normalizeText(i.name).includes('ruthaglar')
  );
  const hasAerasul = inventory.some(
    i => normalizeText(i.slug).includes('aerasul') || normalizeText(i.name).includes('aerasul')
  );
  if (hasRuthaglar && hasAerasul) {
    rules.push({
      id: 'gorthok-runic-combo',
      title: 'Combo Rúnico de Gorthok (Resonancia Sónica)',
      description:
        'Cuando Rúthaglar (Estruendo) y Aerasúl (Trueno) impactan al mismo objetivo en el mismo turno, se desata una onda de resonancia de trueno que obliga al enemigo a una tirada de salvación de Constitución CD 15 o sufrir el estado Paralizado durante 1d4 turnos.',
      category: 'item',
      iconType: 'zap',
      badge: 'Armas Rúnicas',
      colorVariant: 'terracotta'
    });
  }

  // Guanteletes de Fuerza de Ogro & Armas Sutiles con Fuerza
  const hasOgreGauntlets = inventory.some(
    i =>
      i.attuned &&
      (normalizeText(i.slug).includes('guanteletes') ||
        normalizeText(i.name).includes('ogro') ||
        normalizeText(i.name).includes('ogre'))
  );
  if (hasOgreGauntlets && (classesNorm.includes('picaro') || classesNorm.includes('rogue'))) {
    rules.push({
      id: 'ogre-strength-sneak-attack',
      title: 'Ataque Furtivo con Fuerza (+4d6)',
      description:
        'Según las reglas de D&D 5.5e y SRD, las armas con propiedad Sutil (Finesse) permiten elegir indistintamente Fuerza o Destreza sin perder el Ataque Furtivo. Con los Guanteletes de Fuerza de Ogro (FUE 19), se puede atacar usando +4 de Fuerza y aplicar el Ataque Furtivo completo.',
      category: 'item',
      iconType: 'swords',
      badge: 'FUE 19 Furtivo',
      colorVariant: 'crimson'
    });
  }

  // --- 2. Rasgos de Clase y Subclase ---

  // Artificiero Alquimista: Tratamiento Alquímico
  if (classesNorm.includes('artific') && classesNorm.includes('alquim')) {
    const intMod = calculateAbilityModifier(character.ability_scores.int);
    rules.push({
      id: 'alchemical-savant',
      title: `Tratamiento Alquímico (+${intMod} INT a Daño y Curación)`,
      description: `Al lanzar cualquier conjuro utilizando sus herramientas de alquimista como foco que cure puntos de golpe o inflija daño de ácido, fuego, necrótico o veneno, suma su modificador de Inteligencia (+${intMod}) a una tirada de daño o curación.`,
      category: 'class',
      iconType: 'sparkles',
      badge: 'Alquimista',
      colorVariant: 'gold'
    });
  }

  // Enano de la Colina: Aguante Enano y Armadura Pesada
  if (raceNorm.includes('enano') || raceNorm.includes('dwarf')) {
    const hpBonus = character.level;
    rules.push({
      id: 'dwarven-toughness',
      title: 'Aguante Enano y Armadura Pesada',
      description: `Como enano de la colina, la velocidad de movimiento no se reduce en 10 pies al vestir armadura pesada. Además, gana +1 PG extra por cada nivel de personaje (+${hpBonus} PG a nivel ${character.level}).`,
      category: 'race',
      iconType: 'shield',
      badge: 'Enano de la Colina',
      colorVariant: 'gold'
    });
  }

  // Druida Esporas: Entidad Simbiótica
  if (classesNorm.includes('esporas') || (classesNorm.includes('druida') && classesNorm.includes('spores'))) {
    const tempHpAmount = character.level * 4;
    rules.push({
      id: 'symbiotic-entity',
      title: 'Entidad Simbiótica (Círculo de las Esporas)',
      description: `Al gastar 1 uso de Forma Salvaje como acción, despierta las esporas fúngicas: gana ${tempHpAmount} puntos de golpe temporales (4 × nivel de druida), el daño de Halo de Esporas se duplica a 2d6 necrótico, y sus ataques cuerpo a cuerpo con armas infligen +1d6 de daño necrótico adicional.`,
      category: 'class',
      iconType: 'sparkles',
      badge: 'Druida Esporas',
      colorVariant: 'green'
    });

    if (character.level >= 6) {
      rules.push({
        id: 'fungal-infestation',
        title: 'Infección Fúngica (Reanimación Instantánea)',
        description:
          'Cuando una criatura Pequeña o Mediana muere a 10 pies o menos de Solaria, puede utilizar su reacción para reanimarla inmediatamente como un zombi fúngico bajo su control con 1 PG durante 1 hora (hasta 5 veces por descanso largo).',
        category: 'class',
        iconType: 'flame',
        badge: 'Druida Esporas Nv. 6',
        colorVariant: 'terracotta'
      });
    }
  }

  // Mago de Evocación: Esculpir Conjuros
  if (classesNorm.includes('evocaci') || (classesNorm.includes('mago') && classesNorm.includes('evocation'))) {
    rules.push({
      id: 'sculpt-spells',
      title: 'Esculpir Conjuros (Evocación Segura)',
      description:
        'Al lanzar conjuros de evocación de área (como Manos ardientes o Bola de fuego), puede elegir hasta 1 + nivel del conjuro criaturas aliadas para que superen automáticamente su tirada de salvación y no sufran ningún daño si normalmente recibirían la mitad.',
      category: 'class',
      iconType: 'sparkles',
      badge: 'Mago Evocación',
      colorVariant: 'gold'
    });

    if (character.level >= 6) {
      rules.push({
        id: 'potent-cantrip',
        title: 'Truco Potenciado y Defensa sin Armadura',
        description:
          'Sus trucos dañinos afectan incluso a criaturas que superen la tirada de salvación (reciben la mitad del daño en vez de ninguno). Si cuenta con niveles de Monje, sin armadura su CA es 10 + DES + SAB (alcanzando CA 21 con sus protecciones mágicas).',
        category: 'class',
        iconType: 'zap',
        badge: 'Mago Evocación Nv. 6',
        colorVariant: 'terracotta'
      });
    }
  }

  // Pícaro Embaucador Arcano / Mediano Afortunado
  if (
    classesNorm.includes('embaucador') ||
    (classesNorm.includes('picaro') && raceNorm.includes('mediano'))
  ) {
    rules.push({
      id: 'mage-hand-lucky',
      title: 'Mano de Mago Embaucadora y Afortunado',
      description:
        'Su Mano de mago es completamente invisible y puede utilizarse mediante acción adicional de Acción Astuta para abrir cerraduras a 30 pies. Como mediano, si saca un 1 natural en cualquier tirada de ataque, salvación o habilidad, puede repetir el dado.',
      category: 'class',
      iconType: 'sparkles',
      badge: 'Pícaro / Mediano',
      colorVariant: 'gold'
    });
  }

  // Guerrero / Paladín
  if (classesNorm.includes('guerrero') || classesNorm.includes('fighter')) {
    if (!rules.some(r => r.id === 'arcane-prosthesis' || r.id === 'gorthok-runic-combo')) {
      rules.push({
        id: 'fighter-martial-resilience',
        title: 'Nuevas Energías y Disciplina Marcial',
        description:
          'Como acción adicional, puedes recuperar 1d10 + nivel de guerrero PG una vez por descanso corto. Con Acción Súbita, puedes realizar una acción adicional en tu turno.',
        category: 'class',
        iconType: 'swords',
        badge: 'Guerrero',
        colorVariant: 'crimson'
      });
    }
  }

  return rules;
}
