import type { ActiveEffect, MechanicalModifiers } from '../types/effects.ts';

export type BuffTargetScope = 'self' | 'allies' | 'both';

export interface CharacterBuffDefinition {
  id: string;
  name: string;
  ownerSlug: string;
  ownerName: string;
  targetScope: BuffTargetScope;
  description: string;
  duration: string;
  type?: 'buff';
  modifiers?: MechanicalModifiers;
}

export const CAMPAIGN_HERO_NAMES: Record<string, string> = {
  eru: 'Eru Lion',
  honiel: 'Honiel Spellbinder',
  alizar: 'Alizar Thorne',
  solaria: 'Solaria Sombralba',
  zuma: 'Zuma'
};

export const CANONICAL_PARTY_BUFFS: CharacterBuffDefinition[] = [
  // --- ERU LION (Guerrero Arcano / Paladín) ---
  {
    id: 'eru-bendicion',
    name: 'Bendición',
    ownerSlug: 'eru',
    ownerName: 'Eru Lion',
    targetScope: 'both',
    description: '+1d4 a tiradas de ataque y de salvación',
    duration: '1 minuto (Concentración)',
    type: 'buff',
    modifiers: {
      attackBonusDice: ['1d4'],
      saveBonusDice: ['1d4']
    }
  },
  {
    id: 'eru-escudo-de-fe',
    name: 'Escudo de Fe',
    ownerSlug: 'eru',
    ownerName: 'Eru Lion',
    targetScope: 'both',
    description: '+2 a la CA',
    duration: '10 minutos (Concentración)',
    type: 'buff',
    modifiers: {
      acBonus: 2
    }
  },
  {
    id: 'eru-proteccion-intercepcion',
    name: 'Protección / Intercepción',
    ownerSlug: 'eru',
    ownerName: 'Eru Lion',
    targetScope: 'allies',
    description: 'Desventaja al ataque contra aliado a 5 pies (Reacción)',
    duration: '1 asalto',
    type: 'buff'
  },
  {
    id: 'eru-escudo-guerrero-arcano',
    name: 'Escudo (Guerrero Arcano)',
    ownerSlug: 'eru',
    ownerName: 'Eru Lion',
    targetScope: 'self',
    description: '+5 a la CA e inmunidad a Proyectil mágico (Reacción)',
    duration: '1 asalto',
    type: 'buff',
    modifiers: {
      acBonus: 5
    }
  },

  // --- HONIEL SPELLBINDER (Mago Evocador / Monje) ---
  {
    id: 'honiel-escudo',
    name: 'Escudo',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'self',
    description: '+5 a la CA e inmunidad a Proyectil mágico (Reacción)',
    duration: '1 asalto',
    type: 'buff',
    modifiers: {
      acBonus: 5
    }
  },
  {
    id: 'honiel-armadura-de-mago',
    name: 'Armadura de Mago',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'both',
    description: 'CA base pasa a 13 + modificador de Destreza sin armadura',
    duration: '8 horas',
    type: 'buff'
  },
  {
    id: 'honiel-falsa-vida',
    name: 'Falsa Vida',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'self',
    description: 'Otorga 1d4 + 4 Puntos de Golpe temporales',
    duration: '1 hora',
    type: 'buff'
  },
  {
    id: 'honiel-defensa-paciente',
    name: 'Defensa Paciente (Ki)',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'self',
    description: 'Ataques en tu contra tienen desventaja y ventaja en TS de Destreza',
    duration: '1 asalto',
    type: 'buff'
  },
  {
    id: 'honiel-arma-magica',
    name: 'Arma Mágica',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'both',
    description: 'El arma se vuelve mágica con bonificador +1 al ataque y daño',
    duration: '1 hora (Concentración)',
    type: 'buff',
    modifiers: {
      flatAttackBonus: 1,
      flatDamageBonus: 1
    }
  },
  {
    id: 'honiel-invisibilidad',
    name: 'Invisibilidad',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'both',
    description: 'Invisible: ventaja en ataques y ataques en contra tienen desventaja',
    duration: '1 hora (Concentración)',
    type: 'buff',
    modifiers: {
      advantageOnAttacks: true
    }
  },
  {
    id: 'honiel-caida-de-pluma',
    name: 'Caída de Pluma',
    ownerSlug: 'honiel',
    ownerName: 'Honiel Spellbinder',
    targetScope: 'both',
    description: 'Velocidad de caída baja a 60 pies/ronda, 0 daño por caída',
    duration: '1 minuto',
    type: 'buff'
  },

  // --- ALIZAR THORNE (Artífice Alquimista) ---
  {
    id: 'alizar-destello-de-genialidad',
    name: 'Destello de Genialidad',
    ownerSlug: 'alizar',
    ownerName: 'Alizar Thorne',
    targetScope: 'both',
    description: '+4 (INT) a una prueba de característica o tirada de salvación como Reacción',
    duration: 'Instantáneo',
    type: 'buff',
    modifiers: {
      flatSaveBonus: 4
    }
  },
  {
    id: 'alizar-elixir-osadia',
    name: 'Elixir Experimental: Osadía',
    ownerSlug: 'alizar',
    ownerName: 'Alizar Thorne',
    targetScope: 'both',
    description: '+1d4 a tiradas de ataque y salvación durante 1 minuto',
    duration: '1 minuto',
    type: 'buff',
    modifiers: {
      attackBonusDice: ['1d4'],
      saveBonusDice: ['1d4']
    }
  },
  {
    id: 'alizar-elixir-resiliencia',
    name: 'Elixir Experimental: Resiliencia',
    ownerSlug: 'alizar',
    ownerName: 'Alizar Thorne',
    targetScope: 'both',
    description: '+1 a la Clase de Armadura (CA)',
    duration: '10 minutos',
    type: 'buff',
    modifiers: {
      acBonus: 1
    }
  },
  {
    id: 'alizar-elixir-rapidez',
    name: 'Elixir Experimental: Rapidez',
    ownerSlug: 'alizar',
    ownerName: 'Alizar Thorne',
    targetScope: 'both',
    description: 'Velocidad al caminar aumenta en 10 pies',
    duration: '1 hora',
    type: 'buff',
    modifiers: {
      speedBonus: 10
    }
  },
  {
    id: 'alizar-elixir-vuelo',
    name: 'Elixir Experimental: Vuelo',
    ownerSlug: 'alizar',
    ownerName: 'Alizar Thorne',
    targetScope: 'both',
    description: 'Velocidad de vuelo de 10 pies',
    duration: '10 minutos',
    type: 'buff'
  },
  {
    id: 'alizar-santuario',
    name: 'Santuario',
    ownerSlug: 'alizar',
    ownerName: 'Alizar Thorne',
    targetScope: 'both',
    description: 'Atacantes deben superar TS de Sabiduría CD 15 o elegir otro objetivo',
    duration: '1 minuto',
    type: 'buff'
  },

  // --- SOLARIA SOMBRALBA (Druida de las Esporas) ---
  {
    id: 'solaria-guia',
    name: 'Guía',
    ownerSlug: 'solaria',
    ownerName: 'Solaria Sombralba',
    targetScope: 'both',
    description: '+1d4 a una prueba de característica',
    duration: '1 minuto (Concentración)',
    type: 'buff',
    modifiers: {
      abilityCheckBonusDice: ['1d4']
    }
  },
  {
    id: 'solaria-entidad-simbiotica',
    name: 'Entidad Simbiótica',
    ownerSlug: 'solaria',
    ownerName: 'Solaria Sombralba',
    targetScope: 'self',
    description: '+28 PG temporales, Halo de Esporas hace doble daño y +1d6 necrótico cuerpo a cuerpo',
    duration: '10 minutos',
    type: 'buff'
  },
  {
    id: 'solaria-escudo-de-fuego',
    name: 'Escudo de Fuego',
    ownerSlug: 'solaria',
    ownerName: 'Solaria Sombralba',
    targetScope: 'self',
    description: 'Resistencia a daño de frío o fuego; atacantes a 5 pies sufren 2d8 de daño',
    duration: '10 minutos',
    type: 'buff'
  },
  {
    id: 'solaria-libertad-de-movimiento',
    name: 'Libertad de Movimiento',
    ownerSlug: 'solaria',
    ownerName: 'Solaria Sombralba',
    targetScope: 'both',
    description: 'Inmune a terreno difícil, magia que reduzca velocidad, paralizado o apresado',
    duration: '1 hora',
    type: 'buff'
  },
  {
    id: 'solaria-pasar-sin-rastro',
    name: 'Pasar sin Rastro',
    ownerSlug: 'solaria',
    ownerName: 'Solaria Sombralba',
    targetScope: 'both',
    description: '+10 a pruebas de Destreza (Sigilo) y no deja huellas',
    duration: '1 hora (Concentración)',
    type: 'buff'
  },

  // --- ZUMA (Pícaro / Bardo) ---
  {
    id: 'zuma-inspiracion-bardica',
    name: 'Inspiración Bárdica (1d6)',
    ownerSlug: 'zuma',
    ownerName: 'Zuma',
    targetScope: 'allies',
    description: 'Suma 1d6 a una prueba de característica, ataque o salvación',
    duration: '10 minutos',
    type: 'buff'
  },
  {
    id: 'zuma-heroismo',
    name: 'Heroísmo',
    ownerSlug: 'zuma',
    ownerName: 'Zuma',
    targetScope: 'both',
    description: 'Inmune a estar Asustado y gana PG temporales al inicio de cada turno',
    duration: '1 minuto (Concentración)',
    type: 'buff'
  },
  {
    id: 'zuma-caida-de-pluma',
    name: 'Caída de Pluma',
    ownerSlug: 'zuma',
    ownerName: 'Zuma',
    targetScope: 'both',
    description: 'Velocidad de caída baja a 60 pies/ronda, 0 daño por caída',
    duration: '1 minuto',
    type: 'buff'
  },
  {
    id: 'zuma-invisibilidad',
    name: 'Invisibilidad',
    ownerSlug: 'zuma',
    ownerName: 'Zuma',
    targetScope: 'both',
    description: 'Invisible: ventaja en ataques y ataques en contra tienen desventaja',
    duration: '1 hora (Concentración)',
    type: 'buff',
    modifiers: {
      advantageOnAttacks: true
    }
  }
];

export interface BuffFilterOptions {
  userRole?: 'dm' | 'player';
  targetCharacterSlug: string;
  viewerCharacterSlug?: string | null;
  readOnly?: boolean;
}

/**
 * Filtra los buffs disponibles de forma contextual según las reglas canónicas:
 * 1. Jugador viendo su PROPIA hoja: buffs propios que puede aplicarse a sí mismo (ownerSlug === target && (self | both)).
 * 2. Jugador viendo la hoja de un ALIADO: buffs del héroe activo (viewerSlug) que puede aplicar a aliados (ownerSlug === viewerSlug && (allies | both)).
 * 3. Master DM: ve todas las posibilidades para el personaje objetivo:
 *    - Buffs propios (ownerSlug === target && (self | both)).
 *    - Buffs de soporte de los demás compañeros (ownerSlug !== target && (allies | both)).
 */
export function filterAvailableBuffs(
  buffs: CharacterBuffDefinition[],
  options: BuffFilterOptions
): CharacterBuffDefinition[] {
  const { userRole = 'player', targetCharacterSlug, viewerCharacterSlug, readOnly = false } = options;

  if (userRole === 'dm') {
    return buffs.filter(buff => {
      if (buff.ownerSlug === targetCharacterSlug) {
        return buff.targetScope === 'self' || buff.targetScope === 'both';
      }
      return buff.targetScope === 'allies' || buff.targetScope === 'both';
    });
  }

  // userRole === 'player'
  const isViewingSelf =
    (viewerCharacterSlug && viewerCharacterSlug === targetCharacterSlug) ||
    (!viewerCharacterSlug && !readOnly);

  if (isViewingSelf) {
    return buffs.filter(
      buff => buff.ownerSlug === targetCharacterSlug && (buff.targetScope === 'self' || buff.targetScope === 'both')
    );
  }

  if (viewerCharacterSlug && viewerCharacterSlug !== targetCharacterSlug) {
    return buffs.filter(
      buff => buff.ownerSlug === viewerCharacterSlug && (buff.targetScope === 'allies' || buff.targetScope === 'both')
    );
  }

  return [];
}

/**
 * Crea un ActiveEffect estándar a partir de una definición canónica de buff.
 */
export function createActiveEffectFromBuff(
  buff: CharacterBuffDefinition,
  appliedByName?: string
): ActiveEffect {
  return {
    id: `buff-${buff.id}-${Date.now()}`,
    name: buff.name,
    type: 'buff',
    description: buff.description,
    duration: buff.duration,
    applied_by: appliedByName || buff.ownerName,
    created_at: new Date().toISOString(),
    modifiers: buff.modifiers
  };
}
