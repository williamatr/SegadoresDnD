import type { Character } from '../types/character.ts';
import { calculateAbilityModifier } from './abilities.ts';

export interface ClassSpellPrepInfo {
  className: string;
  subclass?: string;
  casterType: 'prepared' | 'known';
  casterLevel: number;
  keyAbility: 'INT' | 'WIS' | 'CHA' | 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  abilityModifier: number;
  maxPrepared: number; // For prepared casters (0 if known)
  formulaDescription: string;
  alwaysPreparedSpells: string[];
  canCastRitualsUnprepared: boolean;
}

export interface SpellPreparationRules {
  isPreparedCaster: boolean;
  primaryPreparationMode: 'prepared' | 'known' | 'hybrid';
  maxPreparedSpells: number; // Total max prepared spells across prepared classes
  currentPreparedCount: number; // Prepared spells that count toward limit
  alwaysPreparedSpells: string[]; // Spells always prepared by subclass/domain
  cantrips: string[];
  canCastRitualsUnprepared: boolean;
  formulaDescription: string;
  canPrepareMore: boolean;
  classes: ClassSpellPrepInfo[];
}

function normalize(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Lista canónica de trucos para identificación rápida en preparación de conjuros.
 */
export const CANONICAL_CANTRIPS = new Set([
  'prestidigitacion',
  'agarre electrizante',
  'agarre electrico',
  'rociada venenosa',
  'rayo de escarcha',
  'ilusion menor',
  'luz',
  'mano de mago',
  'reparar',
  'latigo de espinas',
  'piedad con los moribundos',
  'saber druidico',
  'infestacion',
  'guia',
  'fuego sagrado',
  'tocar a los muertos',
  'toque helado',
  'burla danina',
  'descarga sobrenatural',
  'descarga de fuego',
  'salpicadura acida',
  'luces danzantes',
  'amistad',
  'mensaje',
  'guardia de cuchillas',
  'proteccion contra armas blancas',
  'impacto certero',
  'tanido por los muertos',
  'elementalismo',
  'estallido de espadas',
  'filo atronador',
  'filo de llamas verdes'
]);

export function isSpellCantrip(spellName: string): boolean {
  return CANONICAL_CANTRIPS.has(normalize(spellName));
}

/**
 * Calcula las reglas oficiales de preparación de conjuros (D&D 5e / 5.5e SRD 5.2.1) para un personaje.
 */
export function getSpellPreparationRules(character: Character): SpellPreparationRules {
  const scores = character.ability_scores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const intMod = calculateAbilityModifier(scores.int ?? 10);
  const wisMod = calculateAbilityModifier(scores.wis ?? 10);
  const chaMod = calculateAbilityModifier(scores.cha ?? 10);

  // Extraer clases del personaje
  const rawClasses = character.multiclass && character.multiclass.length > 0
    ? character.multiclass
    : [{ class: character.character_class, level: character.level }];

  const classInfos: ClassSpellPrepInfo[] = [];
  const alwaysPreparedSet = new Set<string>();
  let hasPreparedCaster = false;
  let hasKnownCaster = false;
  let canCastRitualsUnprepared = false;
  let totalMaxPrepared = 0;

  for (const c of rawClasses) {
    const norm = normalize(c.class);
    const subNorm = normalize(c.subclass || '');
    const lvl = Math.max(1, c.level || 1);

    // 1. Mago (Wizard)
    if (norm.includes('mago') || norm.includes('wizard')) {
      hasPreparedCaster = true;
      canCastRitualsUnprepared = true; // Grimorio permite lanzar rituales sin preparar
      const maxPrep = Math.max(1, lvl + intMod);
      totalMaxPrepared += maxPrep;
      classInfos.push({
        className: 'Mago',
        subclass: c.subclass || 'Evocación',
        casterType: 'prepared',
        casterLevel: lvl,
        keyAbility: 'INT',
        abilityModifier: intMod,
        maxPrepared: maxPrep,
        formulaDescription: `Mago Nv.${lvl} + Mod. INT (${intMod >= 0 ? `+${intMod}` : intMod}) = ${maxPrep} máx.`,
        alwaysPreparedSpells: [],
        canCastRitualsUnprepared: true
      });
    }

    // 2. Druida (Druid)
    else if (norm.includes('druida') || norm.includes('druid')) {
      hasPreparedCaster = true;
      const maxPrep = Math.max(1, lvl + wisMod);
      totalMaxPrepared += maxPrep;

      const druidAlwaysPrepared: string[] = [];
      // Subclase Círculo de las Esporas
      if (subNorm.includes('espora') || normalize(character.character_class).includes('espora')) {
        const sporesSpells = [
          'Toque helado',
          'Ceguera/Sordera',
          'Sordera_Ceguera',
          'Rayo debilitador',
          'Animar a los muertos',
          'Forma gaseosa',
          'Marchitar',
          'Confusión'
        ];
        for (const sp of sporesSpells) {
          druidAlwaysPrepared.push(sp);
          alwaysPreparedSet.add(sp);
        }
      }

      classInfos.push({
        className: 'Druida',
        subclass: c.subclass || 'Círculo de las Esporas',
        casterType: 'prepared',
        casterLevel: lvl,
        keyAbility: 'WIS',
        abilityModifier: wisMod,
        maxPrepared: maxPrep,
        formulaDescription: `Druida Nv.${lvl} + Mod. SAB (${wisMod >= 0 ? `+${wisMod}` : wisMod}) = ${maxPrep} máx.`,
        alwaysPreparedSpells: druidAlwaysPrepared,
        canCastRitualsUnprepared: false
      });
    }

    // 3. Artificiero (Artificer)
    else if (norm.includes('artifice') || norm.includes('artificiero') || norm.includes('artificer')) {
      hasPreparedCaster = true;
      const maxPrep = Math.max(1, Math.floor(lvl / 2) + intMod);
      totalMaxPrepared += maxPrep;

      const alchemistAlwaysPrepared: string[] = [];
      if (subNorm.includes('alquimista') || normalize(character.character_class).includes('alquimista')) {
        const alchSpells = [
          'Curar heridas',
          'Rayo nauseabundo',
          'Esfera flamígera',
          'Esfera de llamas',
          'Flecha ácida de Melf',
          'Flecha ácida',
          'Palabra de curación'
        ];
        for (const sp of alchSpells) {
          alchemistAlwaysPrepared.push(sp);
          alwaysPreparedSet.add(sp);
        }
      }

      classInfos.push({
        className: 'Artificiero',
        subclass: c.subclass || 'Alquimista',
        casterType: 'prepared',
        casterLevel: lvl,
        keyAbility: 'INT',
        abilityModifier: intMod,
        maxPrepared: maxPrep,
        formulaDescription: `Artificiero ⌊Nv.${lvl}/2⌋ + Mod. INT (${intMod >= 0 ? `+${intMod}` : intMod}) = ${maxPrep} máx.`,
        alwaysPreparedSpells: alchemistAlwaysPrepared,
        canCastRitualsUnprepared: false
      });
    }

    // 4. Paladín (Paladin)
    else if (norm.includes('paladin') || norm.includes('paladín')) {
      hasPreparedCaster = true;
      const maxPrep = Math.max(1, Math.floor(lvl / 2) + chaMod);
      totalMaxPrepared += maxPrep;
      classInfos.push({
        className: 'Paladín',
        subclass: c.subclass,
        casterType: 'prepared',
        casterLevel: lvl,
        keyAbility: 'CHA',
        abilityModifier: chaMod,
        maxPrepared: maxPrep,
        formulaDescription: `Paladín ⌊Nv.${lvl}/2⌋ + Mod. CAR (${chaMod >= 0 ? `+${chaMod}` : chaMod}) = ${maxPrep} máx.`,
        alwaysPreparedSpells: [],
        canCastRitualsUnprepared: false
      });
    }

    // 5. Lanzadores de Conjuros Conocidos (Bardo, Embaucador Arcano, Guerrero Arcano, Hechicero, Brujo, Explorador)
    else if (
      norm.includes('bardo') ||
      norm.includes('hechicero') ||
      norm.includes('brujo') ||
      norm.includes('explorador') ||
      subNorm.includes('embaucador arcano') ||
      subNorm.includes('guerrero arcano')
    ) {
      hasKnownCaster = true;
      classInfos.push({
        className: c.class,
        subclass: c.subclass,
        casterType: 'known',
        casterLevel: lvl,
        keyAbility: norm.includes('bardo') ? 'CHA' : norm.includes('hechicero') ? 'CHA' : norm.includes('brujo') ? 'CHA' : 'INT',
        abilityModifier: norm.includes('bardo') ? chaMod : intMod,
        maxPrepared: 0,
        formulaDescription: 'Conjuros Conocidos (siempre listos según tabla de progresión)',
        alwaysPreparedSpells: [],
        canCastRitualsUnprepared: false
      });
    }
  }

  const primaryMode: 'prepared' | 'known' | 'hybrid' =
    hasPreparedCaster && hasKnownCaster
      ? 'hybrid'
      : hasPreparedCaster
        ? 'prepared'
        : 'known';

  // Cantrips conocidos
  const knownSpells = character.known_spells || [];
  const cantrips = knownSpells.filter(isSpellCantrip);

  // Filtrar los que están en prepared_spells y cuentan hacia el límite
  const rawPrepared = character.prepared_spells || [];
  const alwaysPreparedList = Array.from(alwaysPreparedSet);

  const countingPrepared = rawPrepared.filter(sp => {
    if (isSpellCantrip(sp)) return false; // Los trucos nunca cuentan
    // Verificar si es un conjuro de subclase siempre preparado
    const normSp = normalize(sp);
    for (const ap of alwaysPreparedList) {
      if (normalize(ap) === normSp) return false;
    }
    return true;
  });

  const currentPreparedCount = countingPrepared.length;
  const canPrepareMore = hasPreparedCaster ? currentPreparedCount < totalMaxPrepared : true;

  const formulaDescriptions = classInfos
    .filter(ci => ci.casterType === 'prepared')
    .map(ci => ci.formulaDescription);

  const formulaDescription = formulaDescriptions.length > 0
    ? formulaDescriptions.join(' + ')
    : 'Lanzador de Conjuros Conocidos';

  return {
    isPreparedCaster: hasPreparedCaster,
    primaryPreparationMode: primaryMode,
    maxPreparedSpells: totalMaxPrepared,
    currentPreparedCount,
    alwaysPreparedSpells: alwaysPreparedList,
    cantrips,
    canCastRitualsUnprepared,
    formulaDescription,
    canPrepareMore,
    classes: classInfos
  };
}
