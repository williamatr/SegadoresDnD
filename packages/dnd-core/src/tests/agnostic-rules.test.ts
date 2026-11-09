import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getContextualRules,
  getTacticalActions,
  getEffectiveAbilityScore,
  isEvocationSavant,
  getClassMilestoneReward,
  type Character
} from '../../index.ts';

function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: 'Aventurero Genérico',
    slug: 'aventurero-generico',
    character_class: 'Guerrero',
    level: 5,
    race: 'Humano',
    background: 'Soldado',
    alignment: 'Neutral Bueno',
    experience_points: 6500,
    max_hp: 44,
    current_hp: 44,
    temp_hp: 0,
    hit_dice_total: '5d10',
    hit_dice_current: 5,
    armor_class: 18,
    speed: 30,
    proficiency_bonus: 3,
    passive_perception: 12,
    initiative_modifier: 0,
    spellcasting_ability: null,
    spell_save_dc: null,
    spell_attack_bonus: null,
    spellcasting_stats: [],
    ability_scores: { str: 16, dex: 10, con: 14, int: 10, wis: 10, cha: 10 },
    saving_throws_prof: ['FUE', 'CON'],
    skills: {},
    multiclass: overrides.multiclass ?? (overrides.character_class ? [{ class: overrides.character_class, level: overrides.level ?? 5 }] : [{ class: 'Guerrero', level: 5 }]),
    spell_slots: {},
    prepared_spells: [],
    known_spells: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    class_resources: [{ id: 'second_wind', name: 'Nuevas Energías', max: 1, used: 0, recharge: 'short_rest' }],
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    appearance: '',
    backstory: '',
    player_notes: '',
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: 3,
    ...overrides
  };
}

describe('@segadores/dnd-core - Motor Agnóstico de Reglas Contextuales y Tácticas', () => {
  describe('getEffectiveAbilityScore', () => {
    it('mantiene la Fuerza base si no hay objetos con stat override', () => {
      const char = createMockCharacter({ ability_scores: { str: 14, dex: 10, con: 12, int: 10, wis: 10, cha: 10 } });
      assert.equal(getEffectiveAbilityScore(char, 'str'), 14);
    });

    it('eleva la Fuerza a 19 si tiene Guanteletes de Fuerza de Ogro sintonizados', () => {
      const rogue = createMockCharacter({
        slug: 'custom-rogue',
        ability_scores: { str: 10, dex: 18, con: 14, int: 12, wis: 12, cha: 10 },
        inventory: [
          {
            slug: 'guanteletes-de-fuerza-de-ogro',
            name: 'Guanteletes de fuerza de ogro',
            category: 'magic_item',
            qty: 1,
            equipped: true,
            requires_attunement: true,
            attuned: true
          }
        ]
      });
      assert.equal(getEffectiveAbilityScore(rogue, 'str'), 19);
    });

    it('no reduce la Fuerza si la Fuerza natural del personaje es superior a 19', () => {
      const titan = createMockCharacter({
        slug: 'titan',
        ability_scores: { str: 20, dex: 10, con: 16, int: 8, wis: 10, cha: 6 },
        inventory: [
          {
            slug: 'guanteletes-de-fuerza-de-ogro',
            name: 'Guanteletes de fuerza de ogro',
            category: 'magic_item',
            qty: 1,
            equipped: true,
            requires_attunement: true,
            attuned: true
          }
        ]
      });
      assert.equal(getEffectiveAbilityScore(titan, 'str'), 20);
    });

    it('eleva la Fuerza a 20 si tiene Prótesis Arcana / Mano de Mago Marcial', () => {
      const cyborg = createMockCharacter({
        slug: 'cyborg-elf',
        ability_scores: { str: 12, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
        inventory: [
          {
            slug: 'protesis-arcana-marcial',
            name: 'Prótesis arcana marcial',
            category: 'magic_item',
            qty: 1,
            equipped: true,
            requires_attunement: false,
            attuned: false,
            notes: 'Mano espectral permanente con FUE 20.'
          }
        ]
      });
      assert.equal(getEffectiveAbilityScore(cyborg, 'str'), 20);
    });
  });

  describe('isEvocationSavant y getClassMilestoneReward', () => {
    it('detecta correctamente magos de la escuela de evocación', () => {
      const evoker = createMockCharacter({
        character_class: 'Mago',
        multiclass: [{ class: 'Mago', subclass: 'Evocación', level: 7 }]
      });
      assert.equal(isEvocationSavant(evoker), true);

      const diviner = createMockCharacter({
        character_class: 'Mago',
        multiclass: [{ class: 'Mago', subclass: 'Adivinación', level: 7 }]
      });
      assert.equal(isEvocationSavant(diviner), false);
    });

    it('obtiene el hito de nivel 10 para distintas clases', () => {
      const artificer = createMockCharacter({ character_class: 'Artificiero' });
      assert.match(getClassMilestoneReward(artificer, 10), /4 objetos mágicos/);

      const spores = createMockCharacter({ character_class: 'Druida (Círculo de las Esporas)' });
      assert.match(getClassMilestoneReward(spores, 10), /Esporas expansivas/);

      const rogue = createMockCharacter({ character_class: 'Pícaro' });
      assert.match(getClassMilestoneReward(rogue, 10), /Mejora de característica/);
    });
  });

  describe('getContextualRules', () => {
    it('genera reglas de Druida de las Esporas e Infección Fúngica a nivel >= 6', () => {
      const sporesDruid = createMockCharacter({
        slug: 'spores-generic',
        character_class: 'Druida',
        multiclass: [{ class: 'Druida', subclass: 'Círculo de las Esporas', level: 7 }],
        level: 7
      });

      const rules = getContextualRules(sporesDruid);
      const ruleIds = rules.map(r => r.id);
      assert.ok(ruleIds.includes('symbiotic-entity'), 'Debe incluir Entidad Simbiótica');
      assert.ok(ruleIds.includes('fungal-infestation'), 'Debe incluir Infección Fúngica a nivel 7');

      const symbioticRule = rules.find(r => r.id === 'symbiotic-entity')!;
      assert.ok(symbioticRule.description.includes('28 puntos de golpe temporales'));
    });

    it('genera reglas de Alquimista y Enano de la Colina', () => {
      const dwarfAlchemist = createMockCharacter({
        slug: 'dwarf-alchemist',
        character_class: 'Artificiero',
        multiclass: [{ class: 'Artificiero', subclass: 'Alquimista', level: 7 }],
        race: 'Enano de la colina',
        level: 7,
        ability_scores: { str: 10, dex: 12, con: 16, int: 18, wis: 14, cha: 8 }
      });

      const rules = getContextualRules(dwarfAlchemist);
      const ruleIds = rules.map(r => r.id);
      assert.ok(ruleIds.includes('alchemical-savant'), 'Debe incluir Tratamiento Alquímico');
      assert.ok(ruleIds.includes('dwarven-toughness'), 'Debe incluir Aguante Enano');

      const alchemistRule = rules.find(r => r.id === 'alchemical-savant')!;
      assert.ok(alchemistRule.title.includes('+4 INT'), 'Debe reflejar el modificador de INT (+4)');
    });

    it('genera combo rúnico si el personaje posee las dos armas de Gorthok', () => {
      const warrior = createMockCharacter({
        slug: 'storm-warrior',
        inventory: [
          {
            slug: 'ruthaglar',
            name: 'Rúthaglar, Estruendo de Gorthok',
            category: 'weapon',
            qty: 1,
            equipped: true,
            requires_attunement: true,
            attuned: true
          },
          {
            slug: 'aerasul',
            name: 'Aerasúl, Trueno de Gorthok',
            category: 'weapon',
            qty: 1,
            equipped: true,
            requires_attunement: true,
            attuned: true
          }
        ]
      });

      const rules = getContextualRules(warrior);
      assert.ok(rules.some(r => r.id === 'gorthok-runic-combo'), 'Debe generar el Combo Rúnico de Gorthok');
    });
  });

  describe('getTacticalActions', () => {
    it('genera acciones de combate adecuadas para un Pícaro / Bardo', () => {
      const char = createMockCharacter({
        slug: 'rogue-bard',
        character_class: 'Pícaro 5 / Bardo 2',
        multiclass: [
          { class: 'Pícaro', level: 5 },
          { class: 'Bardo', level: 2 }
        ],
        level: 7,
        class_resources: [{ id: 'bardic_inspiration', name: 'Inspiración Bárdica', max: 3, used: 0, recharge: 'short_rest' }]
      });

      const tactical = getTacticalActions(char);
      const bonusIds = tactical.bonusActions.map(a => a.id);
      const reactionIds = tactical.reactions.map(a => a.id);

      assert.ok(bonusIds.includes('rogue-cunning-action'), 'Debe tener Acción Astuta');
      assert.ok(bonusIds.includes('bard-inspiration'), 'Debe tener Inspiración Bárdica');
      assert.ok(reactionIds.includes('rogue-uncanny-dodge'), 'Debe tener Esquiva Asombrosa (Pícaro Nv. 5)');
      assert.ok(reactionIds.includes('universal-opportunity-attack'), 'Debe tener Ataque de Oportunidad');
    });

    it('genera acciones de combate para un Artificiero de nivel 7 (Destello de Genialidad)', () => {
      const artificer = createMockCharacter({
        slug: 'artificer-7',
        character_class: 'Artificiero',
        level: 7,
        ability_scores: { str: 10, dex: 12, con: 14, int: 18, wis: 12, cha: 8 }
      });

      const tactical = getTacticalActions(artificer);
      const flash = tactical.reactions.find(r => r.id === 'artificer-flash-of-genius');
      assert.ok(flash, 'Debe incluir Destello de Genialidad');
      assert.ok(flash?.description.includes('+4'), 'Debe indicar bono de INT (+4)');
    });

    it('bloquea acciones adicionales y reacciones si los estados del personaje lo indican', () => {
      const warrior = createMockCharacter({
        character_class: 'Guerrero',
        level: 5
      });

      const availability = {
        bonus_action: { actionType: 'bonus_action' as const, available: false, blockedBy: ['Incapacitado'], warnings: [] },
        reaction: { actionType: 'reaction' as const, available: false, blockedBy: ['Incapacitado'], warnings: [] },
        action: { actionType: 'action' as const, available: false, blockedBy: ['Incapacitado'], warnings: [] },
        movement: { actionType: 'movement' as const, available: true, blockedBy: [], warnings: [] },
        verbal_spell: { actionType: 'verbal_spell' as const, available: true, blockedBy: [], warnings: [] },
        somatic_spell: { actionType: 'somatic_spell' as const, available: true, blockedBy: [], warnings: [] },
        martial_arts: { actionType: 'martial_arts' as const, available: true, blockedBy: [], warnings: [] },
        unarmored_movement: { actionType: 'unarmored_movement' as const, available: true, blockedBy: [], warnings: [] },
        concentration: { actionType: 'concentration' as const, available: true, blockedBy: [], warnings: [] }
      };

      const tactical = getTacticalActions(warrior, availability);
      assert.equal(tactical.bonusActions.every(b => b.available === false), true);
      assert.equal(tactical.reactions.every(r => r.available === false), true);
    });
  });
});
