import type { Character } from '@segadores/dnd-core';

/**
 * Héroes oficiales de la compañía mercenaria Segadores de Orcos (Niveles 7 y 8).
 * Ingesta directa de los 5 personajes reales de la campaña de Obsidian (content/wiki/Personajes_Jugadores).
 */

export interface CampaignCharacterPreview {
  slug: string;
  name: string;
  characterClass: string;
  subclass: string;
  race: string;
  level: number;
  maxHp: number;
  armorClass: number;
  speed: number;
  primaryAbilities: string;
  specialTrait: string;
  playerRole: string;
}

export const CAMPAIGN_CHARACTERS: CampaignCharacterPreview[] = [
  {
    slug: 'alizar',
    name: 'Alizar Thorne',
    characterClass: 'Artificiero',
    subclass: 'Alquimista',
    race: 'Enano de la colina',
    level: 7,
    maxHp: 63,
    armorClass: 17, // 20 con Armadura de placas enana
    speed: 25,
    primaryAbilities: 'INT 18 (+4), SAB 19 (+4), CON 15 (+2), DES 12 (+1), FUE 11 (0), CAR 7 (-2)',
    specialTrait: 'Destello de Genialidad (+4 Reacción), Tratamiento Alquímico, Elixires experimentales e Infusiones arcanas.',
    playerRole: 'Aventurero'
  },
  {
    slug: 'eru',
    name: 'Eru Lion',
    characterClass: 'Guerrero / Paladín',
    subclass: 'Soldado (Sub-capitán) & Baluarte Marcial',
    race: 'Alto Elfo',
    level: 8,
    maxHp: 58,
    armorClass: 23, // 23 con placas y escudo baluarte +5 / 21 con escudo +1 / 19 doble espada
    speed: 30,
    primaryAbilities: 'FUE 20 (+5), CON 16 (+3), DES 10 (0), SAB 10 (0), INT 8 (-1), CAR 6 (-2)',
    specialTrait: 'Prótesis arcana de FUE 20, Rúthaglar y Aerasúl (Espadas de Gorthok), Nuevas Energías, Imposición de Manos.',
    playerRole: 'Aventurero'
  },
  {
    slug: 'honiel',
    name: 'Honiel Spellbinder',
    characterClass: 'Mago / Monje',
    subclass: 'Escuela de Evocación & Monje',
    race: 'Elfo Lunar',
    level: 9,
    maxHp: 58,
    armorClass: 16, // 16 con Cota de Mithral / 14 Defensa sin armadura / 21 con Escudo
    speed: 30,
    primaryAbilities: 'INT 20 (+5), DES 16 (+3), CON 15 (+2), SAB 13 (+1), FUE 8 (-1), CAR 7 (-2)',
    specialTrait: 'Esculpir Conjuros, Marginem Noctis (Rayo de Gorthok), Ki (2 Puntos), Metabolismo Prodigioso, Truco Potenciado.',
    playerRole: 'Aventurero'
  },
  {
    slug: 'solaria',
    name: 'Solaria Sombralba',
    characterClass: 'Druida',
    subclass: 'Círculo de las Esporas',
    race: 'Humana',
    level: 7,
    maxHp: 54,
    armorClass: 14,
    speed: 30,
    primaryAbilities: 'SAB 20 (+5), INT 15 (+2), CAR 14 (+2), DES 12 (+1), CON 10 (0), FUE 8 (-1)',
    specialTrait: 'Entidad Simbiótica (+28 PG temp, +1d6 daño necrótico), Halo de Esporas (1d6/2d6), Infección Fúngica.',
    playerRole: 'Aventurero'
  },
  {
    slug: 'zuma',
    name: 'Zuma Kobold',
    characterClass: 'Pícaro / Bardo',
    subclass: 'Embaucador Arcano & Saltimbanqui',
    race: 'Mediano (Piesligeros)',
    level: 8,
    maxHp: 60,
    armorClass: 19,
    speed: 25,
    primaryAbilities: 'FUE 19 (Guanteletes de Ogro), DES 15 (+2), CAR 14 (+2), INT 13 (+1), CON 12 (+1), SAB 7 (-2)',
    specialTrait: 'Ataque Furtivo 4d6 con FUE, Sa Yue (Relámpago de Gorthok), Acordeón de Gli-Aerth, Inspiración Bárdica.',
    playerRole: 'William (DM)'
  }
];

export function getCampaignCharacterBySlug(slug?: string | null): CampaignCharacterPreview | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase().trim();
  // Compatibilidad defensiva con slugs antiguos
  if (s === 'eru-illuvatar') return CAMPAIGN_CHARACTERS.find(c => c.slug === 'eru');
  return CAMPAIGN_CHARACTERS.find(c => c.slug.toLowerCase() === s);
}

/**
 * Fichas completas canónicas 1:1 con @segadores/dnd-core para inicialización, portal y demo interactivo.
 */
export const CAMPAIGN_FULL_CHARACTERS: Record<string, Character> = {
  alizar: {
    id: 'char-alizar',
    name: 'Alizar Thorne',
    slug: 'alizar',
    character_class: 'Artificiero (Alquimista)',
    level: 7,
    race: 'Enano de la colina',
    background: 'Artesano / Alquimista',
    alignment: 'Neutral Bueno',
    experience_points: 3600,
    max_hp: 63,
    current_hp: 63,
    temp_hp: 0,
    hit_dice_total: '7d8',
    hit_dice_current: 7,
    armor_class: 17,
    speed: 25,
    proficiency_bonus: 3,
    passive_perception: 14,
    initiative_modifier: 1,
    spellcasting_ability: 'INT',
    spell_save_dc: 15,
    spell_attack_bonus: 7,
    spellcasting_stats: [
      {
        source: 'Artificiero (Alquimista)',
        ability: 'INT',
        ability_en: 'INT',
        save_dc: 15,
        attack_bonus: 7
      }
    ],
    ability_scores: {
      str: 11,
      dex: 12,
      con: 15,
      int: 18,
      wis: 19,
      cha: 7
    },
    saving_throws_prof: ['CON', 'INT'],
    skills: {
      'Conocimiento Arcano': { bonus: 7, base_bonus: 7, proficiency: 'proficient' },
      'Naturaleza': { bonus: 7, base_bonus: 7, proficiency: 'proficient' }
    },
    multiclass: [
      { class: 'Artificiero', subclass: 'Alquimista', level: 7 }
    ],
    spell_slots: {
      '1': { total: 4, used: 0 },
      '2': { total: 3, used: 0 }
    },
    prepared_spells: ['Curar heridas', 'Rayo nauseabundo', 'Esfera flamígera', 'Flecha ácida de Melf'],
    known_spells: ['Látigo de espinas', 'Piedad con los moribundos', 'Curar heridas', 'Rayo nauseabundo', 'Esfera flamígera', 'Flecha ácida de Melf'],
    inventory: [
      {
        slug: 'daga',
        name: 'Daga',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: '1d4 perforante (Ligera, Precisión, Arrojadiza 20/60 pies)',
        weapon: {
          damageDice: '1d4',
          damageType: 'perforante',
          finesse: true,
          light: true,
          ranged: false,
          thrownRange: '20/60'
        }
      },
      {
        slug: 'armadura-de-placas-enana',
        name: 'Armadura de placas enana',
        category: 'armor',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Armadura pesada mágica muy rara (+2 CA, total 20). Reacción: reduce 3m empujes contra tu voluntad.',
        armor: {
          armorType: 'heavy',
          baseAc: 18,
          magicalBonus: 2,
          maxDexBonus: 0
        }
      },
      {
        slug: 'capa-de-desplazamiento',
        name: 'Capa de desplazamiento',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Objeto maravilloso raro. Proyecta espejismo que impone desventaja en tiradas de ataque en tu contra.'
      },
      {
        slug: 'anillo-de-almacenamiento-de-conjuros',
        name: 'Anillo de almacenamiento de conjuros',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Anillo raro. Permite albergar y lanzar hasta 5 niveles combinados de conjuros almacenados.'
      },
      {
        slug: 'sirena-de-cuarzo-azul',
        name: 'Sirena de cuarzo azul',
        category: 'gear',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Figura tallada en cuarzo azul translúcido con reflejos marinos.'
      },
      {
        slug: 'herramientas-de-artesano',
        name: 'Herramientas de Alquimista y Boticario',
        category: 'gear',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Foco arcano principal. Pericia duplicada (+6) en pruebas con herramientas.'
      }
    ],
    currency: { cp: 0, sp: 25, ep: 0, gp: 320, pp: 0 },
    class_resources: [
      { id: 'flash_of_genius', name: 'Destello de Genialidad (+4 Reacción)', max: 4, used: 0, recharge: 'long_rest' },
      { id: 'infused_items', name: 'Objetos Infundidos Activos', max: 3, used: 0, recharge: 'passive' },
      { id: 'experimental_elixir', name: 'Elixir Experimental Gratuito', max: 1, used: 0, recharge: 'long_rest' }
    ],
    personality: {
      traits: 'Pragmático, analítico y minucioso con sus fórmulas. Nunca bebe un brebaje sin antes olerlo tres veces.',
      ideals: 'La alquimia y la ingeniería arcana son la clave para reparar cualquier injusticia terrenal.',
      bonds: 'Lealtad férrea a sus compañeros de la compañía Segadores de Orcos.',
      flaws: 'A menudo antepone la experimentación alquímica a su propia seguridad física.'
    },
    appearance: 'Enano fornido y curtido con barba cobriza trenzada con latón y plata. Viste delantal de cuero sobre su armadura de placas con viales humeantes.',
    backstory: 'Erudito alquimista de las colinas que unió sus talentos de ingeniería a la vanguardia de Segadores de Orcos para probar sus elixires en el fragor de la batalla.',
    player_notes: '',
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: 3
  },

  eru: {
    id: 'char-eru',
    name: 'Eru Lion',
    slug: 'eru',
    character_class: 'Guerrero (Nivel 7) / Paladín (Nivel 1)',
    level: 8,
    race: 'Alto Elfo',
    background: 'Soldado (Sub-capitán)',
    alignment: 'Legal Malvado',
    experience_points: 16960,
    max_hp: 58,
    current_hp: 58,
    temp_hp: 0,
    hit_dice_total: '7d10 + 1d10',
    hit_dice_current: 8,
    armor_class: 23,
    speed: 30,
    proficiency_bonus: 3,
    passive_perception: 13,
    initiative_modifier: 0,
    spellcasting_ability: null,
    spell_save_dc: null,
    spell_attack_bonus: null,
    spellcasting_stats: [],
    ability_scores: {
      str: 20,
      dex: 10,
      con: 16,
      int: 8,
      wis: 10,
      cha: 6
    },
    saving_throws_prof: ['FUE', 'SAB'],
    skills: {
      'Atletismo': { bonus: 8, base_bonus: 8, proficiency: 'proficient' },
      'Intimidación': { bonus: 1, base_bonus: 1, proficiency: 'proficient' },
      'Percepción': { bonus: 3, base_bonus: 3, proficiency: 'proficient' },
      'Supervivencia': { bonus: 3, base_bonus: 3, proficiency: 'proficient' }
    },
    multiclass: [
      { class: 'Guerrero', level: 7 },
      { class: 'Paladín', level: 1 }
    ],
    spell_slots: {},
    prepared_spells: [],
    known_spells: ['Mano de mago marcial', 'Impacto certero', 'Agarre electrizante', 'Luces danzantes', 'Fuego sagrado'],
    inventory: [
      {
        slug: 'ruthaglar-estruendo-de-gorthok',
        name: 'Rúthaglar, Estruendo de Gorthok',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Espada larga rúnica (1d8/1d10). +1d6 eléctrico y +1d6 fuego. TS CON CD 15 o arde (1d4 fuego).',
        weapon: {
          damageDice: '1d8',
          versatileDice: '1d10',
          damageType: 'cortante',
          extraDamage: [
            { dice: '1d6', type: 'eléctrico' },
            { dice: '1d6', type: 'fuego' }
          ],
          onHitEffect: 'TS CON CD 15 o arde (1d4 fuego por turno). Combo sónico con Aerasúl.'
        }
      },
      {
        slug: 'aerasul-trueno-de-gorthok',
        name: 'Aerasúl, Trueno de Gorthok',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Espada larga rúnica (1d8/1d10). +2d6 eléctrico. TS CON CD 15 o herida sangrante (1d4 necrótico).',
        weapon: {
          damageDice: '1d8',
          versatileDice: '1d10',
          damageType: 'cortante',
          extraDamage: [{ dice: '2d6', type: 'eléctrico' }],
          onHitEffect: 'TS CON CD 15 o herida sangrante (1d4 necrótico por turno). Combo sónico con Rúthaglar.'
        }
      },
      {
        slug: 'escudo-magico-baluarte',
        name: 'Escudo mágico baluarte (+5 CA)',
        category: 'shield',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Escudo encantado legendario que otorga un total de +5 a la CA.',
        armor: {
          armorType: 'shield',
          baseAc: 2,
          magicalBonus: 3
        }
      },
      {
        slug: 'armadura-de-placas-negra',
        name: 'Armadura de placas negra',
        category: 'armor',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Placas completas de acero negro oscuro (CA 18 base) con el blasón de Tyr.',
        armor: {
          armorType: 'heavy',
          baseAc: 18,
          magicalBonus: 0,
          maxDexBonus: 0
        }
      },
      {
        slug: 'amuleto-de-tyr',
        name: 'Amuleto de Tyr',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: true,
        attuned: false,
        notes: 'Foco sagrado de paladín; ventaja en ataque y +1 al impacto/daño 1 vez al día (en reserva de sintonización).'
      },
      {
        slug: 'arco-largo',
        name: 'Arco largo',
        category: 'weapon',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: '1d8 perforante (Munición, Pesada, Dos manos, alcance 150/600 pies) con 20 flechas.',
        weapon: {
          damageDice: '1d8',
          damageType: 'perforante',
          ranged: true,
          twoHanded: true
        }
      }
    ],
    currency: { cp: 0, sp: 40, ep: 0, gp: 510, pp: 0 },
    class_resources: [
      { id: 'second_wind', name: 'Nuevas Energías (1d10+7 PG)', max: 1, used: 0, recharge: 'short_rest' },
      { id: 'action_surge', name: 'Acción Súbita', max: 1, used: 0, recharge: 'short_rest' },
      { id: 'lay_on_hands', name: 'Imposición de Manos (Reserva PG)', max: 5, used: 0, recharge: 'long_rest' },
      { id: 'divine_sense', name: 'Sentido Divino', max: 1, used: 0, recharge: 'long_rest' }
    ],
    personality: {
      traits: 'Puedo mirar fijamente a un sabueso infernal sin amilanarme. Nada en el campo de batalla quebranta mi templanza.',
      ideals: 'Hago lo que debo y obedezco la autoridad si es justa. El orden militar y la cadena de mando son supremos.',
      bonds: 'Nunca olvidaré la demoledora derrota que mi compañía sufrió ni a los enemigos que nos la infligieron; la venganza y la restitución del honor marcial lo son todo.',
      flaws: 'Tengo poco respeto por quien no haya demostrado ser un verdadero guerrero ante el filo del acero.'
    },
    appearance: 'Guerrero elfo imponente de 1.80 m, piel pálida, cabello plateado y penetrantes ojos verdes. Su mano izquierda amputada es una prótesis espectral arcana de energía luminosa.',
    backstory: 'Sub-capitán elfo de una orden militar diezmada que busca justicia, venganza y la reconstitución del honor de su estandarte.',
    player_notes: '',
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: 3
  },

  honiel: {
    id: 'char-honiel',
    name: 'Honiel Spellbinder',
    slug: 'honiel',
    character_class: 'Mago (Nivel 7) / Monje (Nivel 2)',
    level: 9,
    race: 'Elfo Lunar',
    background: 'Erudito / Sabio',
    alignment: 'Legal Bueno',
    experience_points: 48000,
    max_hp: 58,
    current_hp: 58,
    temp_hp: 0,
    hit_dice_total: '7d6 + 2d8',
    hit_dice_current: 9,
    armor_class: 16,
    speed: 30,
    proficiency_bonus: 4,
    passive_perception: 15,
    initiative_modifier: 3,
    spellcasting_ability: 'INT',
    spell_save_dc: 17,
    spell_attack_bonus: 9,
    spellcasting_stats: [
      {
        source: 'Mago (Evocación)',
        ability: 'INT',
        ability_en: 'INT',
        save_dc: 17,
        attack_bonus: 9
      }
    ],
    ability_scores: {
      str: 8,
      dex: 16,
      con: 15,
      int: 20,
      wis: 13,
      cha: 7
    },
    saving_throws_prof: ['INT', 'SAB', 'DES'],
    skills: {
      'Conocimiento Arcano': { bonus: 9, base_bonus: 9, proficiency: 'proficient' },
      'Historia': { bonus: 9, base_bonus: 9, proficiency: 'proficient' },
      'Investigación': { bonus: 9, base_bonus: 9, proficiency: 'proficient' },
      'Naturaleza': { bonus: 9, base_bonus: 9, proficiency: 'proficient' },
      'Percepción': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Religión': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Medicina': { bonus: 1, base_bonus: 1, proficiency: 'proficient' }
    },
    multiclass: [
      { class: 'Mago', subclass: 'Evocación', level: 7 },
      { class: 'Monje', level: 2 }
    ],
    spell_slots: {
      '1': { total: 4, used: 0 },
      '2': { total: 3, used: 0 },
      '3': { total: 3, used: 0 },
      '4': { total: 1, used: 0 }
    },
    prepared_spells: [
      'Escudo', 'Armadura de mago', 'Proyectil mágico', 'Manos ardientes', 'Falsa vida',
      'Hacer añicos', 'Arma mágica', 'Ceguera/Sordera', 'Bola de fuego', 'Relámpago',
      'Toque vampírico', 'Muro de fuego'
    ],
    known_spells: [
      // 5 Trucos (Cantrips)
      'Prestidigitación', 'Agarre electrizante', 'Rociada venenosa', 'Rayo de escarcha', 'Ilusión menor',
      // 12 Nivel 1
      'Escudo', 'Armadura de mago', 'Proyectil mágico', 'Manos ardientes', 'Falsa vida',
      'Hechizar persona', 'Dormir', 'Detectar magia', 'Identificar', 'Sirviente invisible',
      'Disfrazarse', 'Caída de pluma',
      // 6 Nivel 2
      'Hacer añicos', 'Arma mágica', 'Ceguera/Sordera', 'Cerradura arcana', 'Apertura (Knock)', 'Levitar',
      // 5 Nivel 3
      'Bola de fuego', 'Relámpago', 'Clarividencia', 'Maldecir (Bestow Curse)', 'Toque vampírico',
      // 2 Nivel 4
      'Asesino fantasmal', 'Muro de fuego'
    ],
    inventory: [
      {
        slug: 'cota-de-malla-de-mithral',
        name: 'Cota de Malla de Mithral',
        category: 'armor',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Armadura pesada de mithral (CA 16 fija). No requiere Fuerza mínima ni impone desventaja en Sigilo. Al llevarla equipada, desactiva Artes Marciales y Defensa sin Armadura de monje.',
        armor: {
          baseAc: 16,
          armorType: 'heavy',
          stealthDisadvantage: false
        }
      },
      {
        slug: 'marginem-noctis-rayo-de-gorthok',
        name: 'Marginem Noctis, Rayo de Gorthok',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Cimitarra muy rara (Precisión, Ligera). 1d6 cortante + 2d6 eléctrico. TS CON CD 15 o Paralizado 1d4 turnos.',
        weapon: {
          damageDice: '1d6',
          damageType: 'cortante',
          finesse: true,
          light: true,
          extraDamage: [{ dice: '2d6', type: 'eléctrico' }],
          onHitEffect: 'TS CON CD 15 o Paralizado 1d4 turnos.'
        }
      },
      {
        slug: 'baston-de-robo-de-vida',
        name: 'Bastón de robo de vida',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Bastón (1d6/1d8 versátil). Recupera en PG la mitad del daño infligido.',
        weapon: {
          damageDice: '1d6',
          versatileDice: '1d8',
          damageType: 'contundente'
        }
      },
      {
        slug: 'anillo-de-vision-de-rayos-x',
        name: 'Anillo de visión de rayos X',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Permite ver a través de materia sólida hasta 9 m (30 pies).'
      },
      {
        slug: 'broche-de-escudo',
        name: 'Broche de escudo',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Resistencia a daño de fuerza e inmunidad al daño de Proyectil mágico.'
      },
      {
        slug: 'manto-de-resistencia-a-conjuros',
        name: 'Manto de resistencia a conjuros',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: true,
        attuned: false,
        notes: 'Ventaja en todas las salvaciones contra conjuros (en reserva por límite de 3).'
      },
      {
        slug: 'sombrero-de-hechiceria',
        name: 'Sombrero de Hechicería',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: true,
        attuned: false,
        notes: 'Foco arcano de mago. Permite intentar lanzar un truco de mago que no conozcas (prueba INT CD 10).'
      },
      {
        slug: 'medallon-del-dios-vampirico',
        name: 'Medallón del Dios Vampírico',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: true,
        attuned: false,
        notes: 'Amuleto consagrado a Gulthias. Permite transferir la mitad del daño infligido a un enemigo vivo como curación a un aliado o a sí mismo (1/combate o descanso).'
      },
      {
        slug: 'varita-de-secretos',
        name: 'Varita de secretos',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Varita con 3 cargas para detectar puertas secretas o trampas a 30 pies.'
      },
      {
        slug: 'amuleto-de-relojeria',
        name: 'Amuleto de Relojería',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Colgante de engranajes que permite fijar 1 tirada de ataque al día en un 10 automático en el d20.'
      },
      {
        slug: 'piedras-mensajeras',
        name: 'Piedras mensajeras',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Pareja de piedras rúnicas para comunicación bidireccional a cualquier distancia.'
      },
      {
        slug: 'llave-misteriosa',
        name: 'Llave misteriosa',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: '5% de probabilidad (20 natural) de abrir cualquier cerradura del mundo. Se desvanece tras el éxito.'
      },
      {
        slug: 'bandas-de-hierro-de-bilarro',
        name: 'Bandas de hierro de Bilarro',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Esfera arrojadiza a 60 pies que apresa al objetivo (CD 20 Fuerza para liberarse).'
      }
    ],
    currency: { cp: 0, sp: 5, ep: 0, gp: 605, pp: 0 },
    class_resources: [
      { id: 'arcane_recovery', name: 'Recuperación Arcana (hasta Nv. 4)', max: 1, used: 0, recharge: 'long_rest' },
      { id: 'ki_points', name: 'Puntos de Concentración (Ki)', max: 2, used: 0, recharge: 'short_rest' },
      { id: 'uncanny_metabolism', name: 'Metabolismo Prodigioso', max: 1, used: 0, recharge: 'long_rest' }
    ],
    personality: {
      traits: 'Escuchar antes de juzgar. Prefiere analizar cada palabra, entorno y detalle antes de precipitarse a una conclusión.',
      ideals: 'Lógico, legal. Considera que la razón, el orden y el método estructurado son la senda hacia el verdadero conocimiento.',
      bonds: 'Custodia celosamente un libro que alberga secretos terribles que no deben caer en manos equivocadas.',
      flaws: 'Ser obstinado y omitir lo fácil; suele complicar las soluciones al desestimar alternativas sencillas en favor de métodos rigurosos.'
    },
    appearance: 'Elfo lunar de porte distinguido, piel de tono plata reflectante, cabello negro azabache y ojos bicolor azul y dorado.',
    backstory: 'Erudito arcano y custodio de grimorios que combinó la disciplina marcial del monasterio con los misterios de la evocación pura.',
    player_notes: '',
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: 3
  },

  solaria: {
    id: 'char-solaria',
    name: 'Solaria Sombralba',
    slug: 'solaria',
    character_class: 'Druida (Círculo de las Esporas)',
    level: 7,
    race: 'Humana',
    background: 'Sabio',
    alignment: 'Pendiente',
    experience_points: 0,
    max_hp: 54,
    current_hp: 54,
    temp_hp: 0,
    hit_dice_total: '7d8',
    hit_dice_current: 7,
    armor_class: 14,
    speed: 30,
    proficiency_bonus: 3,
    passive_perception: 18,
    initiative_modifier: 1,
    spellcasting_ability: 'SAB',
    spell_save_dc: 16,
    spell_attack_bonus: 8,
    spellcasting_stats: [
      {
        source: 'Druida (Círculo de las Esporas)',
        ability: 'SAB',
        ability_en: 'WIS',
        save_dc: 16,
        attack_bonus: 8
      }
    ],
    ability_scores: {
      str: 8,
      dex: 12,
      con: 10,
      int: 15,
      wis: 20,
      cha: 14
    },
    saving_throws_prof: ['INT', 'SAB'],
    skills: {
      'Conocimiento Arcano': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Historia': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Naturaleza': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Trato con Animales': { bonus: 8, base_bonus: 8, proficiency: 'proficient' },
      'Percepción': { bonus: 8, base_bonus: 8, proficiency: 'proficient' },
      'Persuasión': { bonus: 5, base_bonus: 5, proficiency: 'proficient' }
    },
    multiclass: [
      { class: 'Druida', subclass: 'Círculo de las Esporas', level: 7 }
    ],
    spell_slots: {
      '1': { total: 4, used: 0 },
      '2': { total: 3, used: 0 },
      '3': { total: 3, used: 0 },
      '4': { total: 1, used: 0 }
    },
    prepared_spells: [
      'Palabra de curación', 'Enmarañar', 'Curar heridas', 'Cuchillo de hielo', 'Saeta guía',
      'Crecimiento espinoso', 'Rayo de luna', 'Potenciar característica', 'Ceguera/Sordera', 'Rayo debilitador',
      'Maremoto', 'Animar a los muertos', 'Forma gaseosa', 'Marchitar', 'Confusión'
    ],
    known_spells: [
      'Saber druídico', 'Infestación', 'Guía', 'Fuego sagrado', 'Tocar a los muertos', 'Toque helado',
      'Palabra de curación', 'Enmarañar', 'Curar heridas', 'Cuchillo de hielo', 'Saeta guía',
      'Crecimiento espinoso', 'Rayo de luna', 'Potenciar característica', 'Ceguera/Sordera', 'Rayo debilitador',
      'Maremoto', 'Animar a los muertos', 'Forma gaseosa', 'Marchitar', 'Confusión'
    ],
    inventory: [
      {
        slug: 'cuchillo-pequeno',
        name: 'Daga Druídica',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: '1d4 perforante (Ligera, Precisión, Arrojadiza a 20/60 pies)',
        weapon: {
          damageDice: '1d4',
          damageType: 'perforante',
          finesse: true,
          light: true
        }
      },
      {
        slug: 'armadura-de-pieles',
        name: 'Armadura de pieles',
        category: 'armor',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Armadura media no metálica (CA 12 + DES max 2).',
        armor: {
          armorType: 'medium',
          baseAc: 12,
          maxDexBonus: 2
        }
      },
      {
        slug: 'escudo-de-madera',
        name: 'Escudo de madera',
        category: 'shield',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: '+2 a la CA tradicional de druida.',
        armor: {
          armorType: 'shield',
          baseAc: 2
        }
      },
      {
        slug: 'kit-de-herborista',
        name: 'Kit de herborista',
        category: 'gear',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Estuche con mortero, bolsas y frascos para elaboración de antitoxinas y remedios.'
      },
      {
        slug: 'foco-druidico',
        name: 'Foco druídico (Tótem fúngico)',
        category: 'gear',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: 'Ramitas consagradas y esporas secas para canalizar magia divina.'
      }
    ],
    currency: { cp: 0, sp: 20, ep: 0, gp: 195, pp: 0 },
    class_resources: [
      { id: 'wild_shape', name: 'Forma Salvaje / Entidad Simbiótica', max: 2, used: 0, recharge: 'short_rest' },
      { id: 'fungal_infestation', name: 'Infección Fúngica (Zombi fúngico 1 PG)', max: 5, used: 0, recharge: 'long_rest' }
    ],
    personality: {
      traits: '',
      ideals: '',
      bonds: '',
      flaws: ''
    },
    appearance: 'Lleva vestiduras clásicas de druida con un toque místico de hada y esporas luminiscentes que flotan a su alrededor.',
    backstory: 'Druida fúngica que comprende el ciclo sagrado de la vida, la putrefacción y el renacimiento en las profundidades del bosque.',
    player_notes: '',
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: 3
  },

  zuma: {
    id: 'char-zuma',
    name: 'Zuma Kobold',
    slug: 'zuma',
    character_class: 'Pícaro (Embaucador Arcano Nivel 7) / Bardo (Nivel 1)',
    level: 8,
    race: 'Mediano (Piesligeros)',
    background: 'Animador (Tragafuegos, Malabarista, Saltimbanqui)',
    alignment: 'Neutral Verdadero',
    experience_points: 0,
    max_hp: 60,
    current_hp: 60,
    temp_hp: 0,
    hit_dice_total: '7d8 + 1d8',
    hit_dice_current: 8,
    armor_class: 19,
    speed: 25,
    proficiency_bonus: 3,
    passive_perception: 11,
    initiative_modifier: 2,
    spellcasting_ability: 'INT',
    spell_save_dc: 12,
    spell_attack_bonus: 4,
    spellcasting_stats: [
      {
        source: 'Embaucador Arcano',
        ability: 'INT',
        ability_en: 'INT',
        save_dc: 12,
        attack_bonus: 4
      },
      {
        source: 'Bardo',
        ability: 'CAR',
        ability_en: 'CHA',
        save_dc: 13,
        attack_bonus: 5
      }
    ],
    ability_scores: {
      str: 10,
      dex: 15,
      con: 12,
      int: 13,
      wis: 7,
      cha: 14
    },
    saving_throws_prof: ['DES', 'INT', 'CAR'],
    skills: {
      'Acrobacias': { bonus: 8, base_bonus: 5, proficiency: 'expertise' },
      'Atletismo': { bonus: 6, base_bonus: 3, proficiency: 'expertise' },
      'Engaño': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Interpretación': { bonus: 8, base_bonus: 5, proficiency: 'expertise' },
      'Investigación': { bonus: 4, base_bonus: 4, proficiency: 'proficient' },
      'Persuasión': { bonus: 5, base_bonus: 5, proficiency: 'proficient' },
      'Sigilo': { bonus: 8, base_bonus: 5, proficiency: 'expertise' }
    },
    multiclass: [
      { class: 'Pícaro', subclass: 'Embaucador Arcano', level: 7 },
      { class: 'Bardo', level: 1 }
    ],
    spell_slots: {
      '1': { total: 6, used: 0 },
      '2': { total: 2, used: 0 }
    },
    prepared_spells: [
      'Disfrazarse', 'Susurros disonantes', 'Ola atronadora', 'Falsa vida', 'Invisibilidad', 'Sugestión'
    ],
    known_spells: [
      'Mano de mago', 'Prestidigitación', 'Burlar',
      'Disfrazarse', 'Susurros disonantes', 'Ola atronadora', 'Falsa vida', 'Invisibilidad', 'Sugestión'
    ],
    inventory: [
      {
        slug: 'sa-yue-relampago-de-gorthok',
        name: 'Sa Yue, Relámpago de Gorthok',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Estoque rúnico (1d8 perforante, Precisión). +2d6 daño eléctrico. TS CON CD 15 o Paralizado 1d4 turnos.',
        weapon: {
          damageDice: '1d8',
          damageType: 'perforante',
          finesse: true,
          extraDamage: [{ dice: '2d6', type: 'eléctrico' }],
          onHitEffect: 'TS CON CD 15 o Paralizado 1d4 turnos. Inmunidad a relámpago cerca de otra arma de Gorthok.'
        }
      },
      {
        slug: 'acordeon-de-gli-aerth',
        name: 'Instrumento de los bardos, Acordeón de Gli-Aerth',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Permite lanzar Curar heridas a Nivel 5, Calmar emociones, Patrón hipnótico. Desventaja a enemigos contra hechizar.'
      },
      {
        slug: 'guanteletes-de-fuerza-de-ogro',
        name: 'Guanteletes de fuerza de ogro',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: true,
        attuned: true,
        notes: 'Fija automáticamente la Fuerza en 19 (+4). Permite empuñar armas sutiles con FUE manteniendo Ataque Furtivo.'
      },
      {
        slug: 'escudo-atrapaflechas',
        name: 'Escudo atrapaflechas',
        category: 'shield',
        qty: 1,
        equipped: false,
        requires_attunement: true,
        attuned: false,
        notes: '+2 a la CA (+4 contra proyectiles) e intercepción de flechas (en reserva de sintonización).'
      },
      {
        slug: 'daga',
        name: 'Daga',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: '1d4 perforante (Ligera, Precisión, Arrojadiza a 20/60 pies)'
      },
      {
        slug: 'arco-corto',
        name: 'Arco corto',
        category: 'weapon',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: '1d6 perforante con 29 flechas en aljaba.'
      },
      {
        slug: 'guantes-de-ladron',
        name: 'Guantes de ladrón',
        category: 'magic_item',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        notes: '+5 a pruebas de Juego de manos y forzar cerraduras.'
      },
      {
        slug: 'bolsa-de-contencion',
        name: 'Bolsa de contención',
        category: 'magic_item',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Espacio extradimensional para hasta 250 kg.'
      },
      {
        slug: 'bragas-de-benyonce',
        name: 'Bragas de Benyonce',
        category: 'gear',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false,
        notes: 'Trofeo picaresco de la capitana líder de los Krakens de Neverwinter.'
      }
    ],
    currency: { cp: 0, sp: 35, ep: 0, gp: 440, pp: 0 },
    class_resources: [
      { id: 'bardic_inspiration', name: 'Inspiración Bárdica (1d6)', max: 2, used: 0, recharge: 'long_rest' }
    ],
    personality: {
      traits: 'Amable, empático. "Cambio de ánimo tan rápido como de ropa interior", pero siempre dispuesto a arrancar una sonrisa.',
      ideals: 'Le gusta ver sonreír a los demás; el arte y la risa son el mejor remedio contra la tragedia.',
      bonds: 'Haría cualquier cosa por sus compañeros de andanzas; su lealtad hacia ellos es inquebrantable.',
      flaws: 'Me pierden las caras bonitas, en especial las femeninas.'
    },
    appearance: 'Mediano de 44 años y 1.20 m de estatura. Tez mestiza cálida, cabello castaño alborotado y expresivos ojos ambarinos color miel. Viste chaleco de terciopelo y porta su acordeón verde.',
    backstory: 'Nacido en Conyberry cerca de Phandalin. Durante sus años de juventud partió a recorrer el mundo como saltimbanqui y al regresar descubrió que su aldea había sido arrasada por la guerra.',
    player_notes: '',
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: 3
  }
};

export function getCampaignFullCharacterBySlug(slug?: string | null): Character {
  if (!slug) return CAMPAIGN_FULL_CHARACTERS['zuma'];
  const s = slug.toLowerCase().trim();
  if (s === 'eru-illuvatar') return CAMPAIGN_FULL_CHARACTERS['eru'];
  return CAMPAIGN_FULL_CHARACTERS[s] || CAMPAIGN_FULL_CHARACTERS['zuma'];
}
