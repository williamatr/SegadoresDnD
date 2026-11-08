import type { Character } from '@segadores/dnd-core';

export interface DemoCharacterPreview {
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
  license: string;
}

export const PUBLIC_DEMO_PREVIEWS: DemoCharacterPreview[] = [
  {
    slug: 'valeros-srd',
    name: 'Valeros (Guerrero SRD)',
    characterClass: 'Guerrero',
    subclass: 'Campeón',
    race: 'Humano',
    level: 3,
    maxHp: 28,
    armorClass: 18,
    speed: 30,
    primaryAbilities: 'FUE 16, CON 15, DES 14',
    specialTrait: 'Crítico mejorado (19-20), Nuevas Energías (1d10+3) y Estilo Defensa (+1 CA).',
    license: 'CC-BY-4.0 SRD 5.2.1'
  },
  {
    slug: 'ezren-srd',
    name: 'Ezren (Mago SRD)',
    characterClass: 'Mago',
    subclass: 'Evocación',
    race: 'Humano',
    level: 3,
    maxHp: 20,
    armorClass: 12,
    speed: 30,
    primaryAbilities: 'INT 16, CON 14, DES 14',
    specialTrait: 'Esculpir conjuros de área, Proyectil Mágico, Manos Ardientes y Rayo Abrasador.',
    license: 'CC-BY-4.0 SRD 5.2.1'
  },
  {
    slug: 'kyra-srd',
    name: 'Kyra (Clériga SRD)',
    characterClass: 'Clérigo',
    subclass: 'Dominio de la Vida',
    race: 'Humana',
    level: 3,
    maxHp: 24,
    armorClass: 18,
    speed: 30,
    primaryAbilities: 'SAB 16, FUE 14, CON 14',
    specialTrait: 'Discípulo de la Vida (+2+Nivel curación), Canalizar Divinidad: Preservar la Vida.',
    license: 'CC-BY-4.0 SRD 5.2.1'
  }
];

export const PUBLIC_DEMO_FULL_CHARACTERS: Record<string, Character> = {
  'valeros-srd': {
    name: 'Valeros (Guerrero SRD)',
    slug: 'valeros-srd',
    character_class: 'Guerrero',
    level: 3,
    race: 'Humano',
    background: 'Soldado',
    alignment: 'Neutral Bueno',
    experience_points: 900,
    max_hp: 28,
    current_hp: 28,
    temp_hp: 0,
    hit_dice_total: '3d10',
    hit_dice_current: 3,
    armor_class: 18,
    speed: 30,
    proficiency_bonus: 2,
    passive_perception: 13,
    initiative_modifier: 2,
    spellcasting_ability: null,
    spell_save_dc: null,
    spell_attack_bonus: null,
    spellcasting_stats: [],
    ability_scores: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
    saving_throws_prof: ['FUE', 'CON'],
    skills: {
      atletismo: { bonus: 5, proficiency: 'proficient' },
      percepcion: { bonus: 3, proficiency: 'proficient' },
      supervivencia: { bonus: 3, proficiency: 'proficient' },
      intimidacion: { bonus: 1, proficiency: 'proficient' }
    },
    active_effects: [],
    class_resources: [
      { id: 'second_wind', name: 'Nuevas Energías (Second Wind)', max: 1, used: 0, recharge: 'short_rest', notes: 'Recupera 1d10 + Nivel PG' },
      { id: 'action_surge', name: 'Acción Súbita (Action Surge)', max: 1, used: 0, recharge: 'short_rest', notes: 'Una acción adicional en tu turno' }
    ],
    personality: {
      traits: 'Siempre dispuesto a defender a los débiles con una sonrisa fanfarrona.',
      ideals: 'Responsabilidad y honor marcial.',
      bonds: 'Mis compañeros de armas son mi familia.',
      flaws: 'A veces me confío demasiado en combate cuerpo a cuerpo.'
    },
    backstory: 'Veterano de la guardia fronteriza que busca aventuras y gloria en las tierras salvajes según el System Reference Document 5.2.1.',
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    multiclass: [{ class: 'Guerrero', subclass: 'Campeón', level: 3 }],
    attunement_slots: 3,
    known_spells: [],
    prepared_spells: [],
    spell_slots: {},
    inventory: [
      {
        slug: 'espada-larga',
        name: 'Espada Larga',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        weapon: { damageDice: '1d8', damageType: 'cortante', versatileDice: '1d10' }
      },
      {
        slug: 'cota-de-malla',
        name: 'Cota de Malla',
        category: 'armor',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        armor: { armorType: 'heavy', baseAc: 16, stealthDisadvantage: true }
      },
      {
        slug: 'escudo',
        name: 'Escudo',
        category: 'shield',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        armor: { armorType: 'shield', baseAc: 2 }
      }
    ],
    currency: { cp: 25, sp: 14, ep: 0, gp: 35, pp: 0 },
    appearance: 'Guerrero humano de complexión fuerte con cicatriz en la mejilla y armadura pulida.',
    player_notes: 'Ficha de demostración pública bajo licencia CC-BY-4.0 SRD 5.2.1.'
  },
  'ezren-srd': {
    name: 'Ezren (Mago SRD)',
    slug: 'ezren-srd',
    character_class: 'Mago',
    level: 3,
    race: 'Humano',
    background: 'Erudito',
    alignment: 'Neutral Bueno',
    experience_points: 900,
    max_hp: 20,
    current_hp: 20,
    temp_hp: 0,
    hit_dice_total: '3d6',
    hit_dice_current: 3,
    armor_class: 12,
    speed: 30,
    proficiency_bonus: 2,
    passive_perception: 13,
    initiative_modifier: 2,
    spellcasting_ability: 'INT',
    spell_save_dc: 13,
    spell_attack_bonus: 5,
    spellcasting_stats: [
      { source: 'Mago', ability: 'INT', ability_en: 'INT', save_dc: 13, attack_bonus: 5 }
    ],
    ability_scores: { str: 9, dex: 14, con: 14, int: 16, wis: 13, cha: 10 },
    saving_throws_prof: ['INT', 'SAB'],
    skills: {
      arcana: { bonus: 5, proficiency: 'proficient' },
      historia: { bonus: 5, proficiency: 'proficient' },
      investigacion: { bonus: 5, proficiency: 'proficient' },
      percepcion: { bonus: 3, proficiency: 'proficient' }
    },
    active_effects: [],
    class_resources: [
      { id: 'arcane_recovery', name: 'Recuperación Arcana', max: 1, used: 0, recharge: 'short_rest', notes: 'Recupera hasta 2 niveles de ranuras' }
    ],
    personality: {
      traits: 'Siempre tomo notas de cualquier fenómeno inusual.',
      ideals: 'El conocimiento es la herramienta definitiva contra la ignorancia.',
      bonds: 'Mi libro de conjuros es mi tesoro más preciado.',
      flaws: 'A veces me pierdo en pensamientos abstractos en medio del peligro.'
    },
    backstory: 'Mago académico dedicado al estudio de los pergaminos arcanos y las leyes fundamentales de la magia.',
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    multiclass: [{ class: 'Mago', subclass: 'Evocación', level: 3 }],
    attunement_slots: 3,
    known_spells: ['proyectil-magico', 'manos-ardientes', 'rayo-abrasador', 'armadura-de-mago'],
    prepared_spells: ['proyectil-magico', 'manos-ardientes', 'rayo-abrasador', 'armadura-de-mago'],
    spell_slots: {
      '1': { total: 4, used: 0 },
      '2': { total: 2, used: 0 }
    },
    inventory: [
      {
        slug: 'baston-arcano',
        name: 'Bastón Arcano',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        weapon: { damageDice: '1d6', damageType: 'contundente', versatileDice: '1d8' }
      },
      {
        slug: 'libro-de-conjuros',
        name: 'Libro de Conjuros',
        category: 'gear',
        qty: 1,
        equipped: false,
        requires_attunement: false,
        attuned: false
      }
    ],
    currency: { cp: 10, sp: 20, ep: 0, gp: 50, pp: 0 },
    appearance: 'Erudito maduro con túnica azul índigo, anteojos de lectura y vara de roble.',
    player_notes: 'Ficha de demostración pública bajo licencia CC-BY-4.0 SRD 5.2.1.'
  },
  'kyra-srd': {
    name: 'Kyra (Clériga SRD)',
    slug: 'kyra-srd',
    character_class: 'Clérigo',
    level: 3,
    race: 'Humana',
    background: 'Acólito',
    alignment: 'Neutral Bueno',
    experience_points: 900,
    max_hp: 24,
    current_hp: 24,
    temp_hp: 0,
    hit_dice_total: '3d8',
    hit_dice_current: 3,
    armor_class: 18,
    speed: 30,
    proficiency_bonus: 2,
    passive_perception: 15,
    initiative_modifier: 0,
    spellcasting_ability: 'SAB',
    spell_save_dc: 13,
    spell_attack_bonus: 5,
    spellcasting_stats: [
      { source: 'Clérigo', ability: 'SAB', ability_en: 'WIS', save_dc: 13, attack_bonus: 5 }
    ],
    ability_scores: { str: 14, dex: 10, con: 14, int: 10, wis: 16, cha: 12 },
    saving_throws_prof: ['SAB', 'CAR'],
    skills: {
      medicina: { bonus: 5, proficiency: 'proficient' },
      persuasion: { bonus: 3, proficiency: 'proficient' },
      religion: { bonus: 2, proficiency: 'proficient' },
      percepcion: { bonus: 5, proficiency: 'proficient' }
    },
    active_effects: [],
    class_resources: [
      { id: 'channel_divinity', name: 'Canalizar Divinidad', max: 1, used: 0, recharge: 'short_rest', notes: 'Preservar la Vida o Expulsar Muertos Vivientes' }
    ],
    personality: {
      traits: 'Tiendo a ver la chispa divina en cada criatura viva.',
      ideals: 'Sanar y amparar al afligido.',
      bonds: 'Mi fe y mi templo son mi baluarte.',
      flaws: 'A veces juzgo con severidad a quienes quebrantan sus juramentos.'
    },
    backstory: 'Sacerdotisa consagrada a los dioses de la luz y la vida, enviada a sanar las heridas del mundo.',
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    multiclass: [{ class: 'Clérigo', subclass: 'Vida', level: 3 }],
    attunement_slots: 3,
    known_spells: ['curar-heridas', 'palabra-de-curacion', 'bendicion', 'auxilio'],
    prepared_spells: ['curar-heridas', 'palabra-de-curacion', 'bendicion', 'auxilio'],
    spell_slots: {
      '1': { total: 4, used: 0 },
      '2': { total: 2, used: 0 }
    },
    inventory: [
      {
        slug: 'maza',
        name: 'Maza',
        category: 'weapon',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        weapon: { damageDice: '1d6', damageType: 'contundente' }
      },
      {
        slug: 'cota-de-malla',
        name: 'Cota de Malla',
        category: 'armor',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        armor: { armorType: 'heavy', baseAc: 16, stealthDisadvantage: true }
      },
      {
        slug: 'escudo-sagrado',
        name: 'Escudo Sagrado',
        category: 'shield',
        qty: 1,
        equipped: true,
        requires_attunement: false,
        attuned: false,
        armor: { armorType: 'shield', baseAc: 2 }
      }
    ],
    currency: { cp: 15, sp: 30, ep: 0, gp: 40, pp: 0 },
    appearance: 'Sacerdotisa con armadura brillante, cinto solar y maza consagrada.',
    player_notes: 'Ficha de demostración pública bajo licencia CC-BY-4.0 SRD 5.2.1.'
  }
};
