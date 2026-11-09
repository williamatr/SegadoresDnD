import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCharacterState,
  calculateArmorClass,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  previewLevelUp,
  validateLevelUp,
  type Character
} from '@segadores/dnd-core';

/**
 * Fixture Canónico SRD 5.2.1 de Personaje de Demostración.
 * Cumple estrictamente la Regla 2 y 3 de GEMINI.md (datos agnósticos amparados bajo CC-BY-4.0).
 */
const mockSrdFighter: Character = {
  id: 'mock-srd-warrior-1',
  slug: 'guerrero-srd',
  name: 'Valeros el Campeón',
  race: 'Humano',
  character_class: 'Guerrero',
  level: 5,
  experience_points: 6500,
  max_hp: 44,
  current_hp: 44,
  temp_hp: 0,
  armor_class: 18,
  speed: 30,
  proficiency_bonus: 3,
  ability_scores: {
    str: 18,
    dex: 12,
    con: 16,
    int: 10,
    wis: 12,
    cha: 8
  },
  saving_throws_prof: ['FUE', 'CON'],
  skill_proficiencies: {
    atletismo: 1,
    percepcion: 1,
    intimidacion: 1
  },
  death_saves: { successes: 0, failures: 0 },
  hit_dice_total: '5d10',
  hit_dice_current: 5,
  exhaustion: 0,
  inspiration: false,
  attunement_slots: 3,
  inventory: [
    {
      id: 'item-1',
      slug: 'espada-larga-srd',
      name: 'Espada Larga',
      category: 'weapon',
      equipped: true,
      requires_attunement: false,
      attuned: false,
      quantity: 1,
      weight_lb: 3
    },
    {
      id: 'item-2',
      slug: 'cota-de-malla-srd',
      name: 'Cota de Malla',
      category: 'armor',
      equipped: true,
      requires_attunement: false,
      attuned: false,
      quantity: 1,
      weight_lb: 55
    },
    {
      id: 'item-3',
      slug: 'anillo-proteccion-srd',
      name: 'Anillo de Protección',
      category: 'magic_item',
      equipped: true,
      requires_attunement: true,
      attuned: true,
      quantity: 1,
      weight_lb: 0.1
    }
  ],
  weapons: [
    {
      id: 'w-1',
      name: 'Espada Larga',
      category: 'cuerpo a cuerpo',
      damage: '1d8',
      damage_type: 'cortante',
      range: '5 pies',
      properties: ['Versátil (1d10)'],
      is_equipped: true
    }
  ],
  class_resources: [
    {
      id: 'res-1',
      name: 'Tomar Aliento (Second Wind)',
      current: 1,
      max: 1,
      reset_on: 'short_rest'
    },
    {
      id: 'res-2',
      name: 'Oleada de Acción (Action Surge)',
      current: 1,
      max: 1,
      reset_on: 'short_rest'
    }
  ],
  spell_slots: {},
  active_effects: [],
  personality: {
    traits: 'Siempre dispuesto a proteger a los suyos.',
    ideals: 'Responsabilidad y honor.',
    bonds: 'Mi espada fue forjada por mi abuelo.',
    flaws: 'A veces actúo antes de evaluar el peligro.'
  },
  multiclass: [
    {
      class: 'Guerrero',
      level: 5,
      subclass: 'Campeón'
    }
  ]
};

describe('@segadores/character-sheet - Suite de Hojas de Personaje (Agnóstica SRD)', () => {
  it('valida el contrato completo de personaje SRD y sus atributos base', () => {
    assert.equal(mockSrdFighter.name, 'Valeros el Campeón');
    assert.equal(mockSrdFighter.level, 5);
    assert.equal(mockSrdFighter.proficiency_bonus, 3);
    assert.equal(calculateAbilityModifier(mockSrdFighter.ability_scores.str), 4);
    assert.equal(calculateAbilityModifier(mockSrdFighter.ability_scores.con), 3);
    assert.equal(calculateProficiencyBonus(mockSrdFighter.level), 3);
  });

  it('evalúa el estado táctico de combate de la hoja con evaluateCharacterState', () => {
    const state = evaluateCharacterState(mockSrdFighter);
    assert.ok(state.effectiveAc >= 16, 'La CA efectiva debe ser acorde al equipamiento');
    assert.equal(state.effectiveSpeed, 30, 'La velocidad base de Humano es 30 pies');
    assert.equal(state.availability.action.available, true);
    assert.equal(state.availability.bonus_action.available, true);
    assert.equal(state.availability.reaction.available, true);
  });

  it('verifica límites y ranuras de sintonización mágica (máximo 3 ranuras)', () => {
    const attuned = mockSrdFighter.inventory.filter(i => i.requires_attunement && i.attuned);
    assert.ok(
      attuned.length <= mockSrdFighter.attunement_slots,
      `Los objetos sintonizados (${attuned.length}) no deben exceder las ranuras (${mockSrdFighter.attunement_slots})`
    );
  });

  it('ejecuta simulación inmutable de subida de nivel (Level Up) a nivel 6', () => {
    // Nivel 5 -> 6 requiere 7.500 PX en SRD 5.2.1 (Guerrero tiene 6.500 PX, le faltan 1.000)
    const initialValidation = validateLevelUp(mockSrdFighter, 'Guerrero');
    assert.equal(initialValidation.canLevelUp, false, 'No debe subir si le faltan PX');
    assert.equal(initialValidation.missingXp, 1000);

    // Otorgar los 1.000 PX requeridos
    const readyFighter = {
      ...mockSrdFighter,
      experience_points: 7500
    };

    const readyValidation = validateLevelUp(readyFighter, 'Guerrero');
    assert.equal(readyValidation.canLevelUp, true);
    assert.equal(readyValidation.xpCost, 7500);

    // Vista previa con PG medios (+6 PG por d10 + CON +3 = +9 PG)
    const preview = previewLevelUp(readyFighter, 'Guerrero', { hpMethod: 'average' });
    const updated = preview.updatedCharacter;

    // Aserciones de Estado Diferencial
    assert.equal(updated.level, 6, 'El nivel total debe ser 6');
    assert.equal(updated.max_hp, mockSrdFighter.max_hp + 9, 'Los PG máximos deben aumentar exactamente 9');
    assert.equal(updated.hit_dice_total, '6d10', 'Los dados de golpe deben subir a 6d10');
    assert.equal(updated.experience_points, 0, 'Los PX invertidos deben deducirse');

    // Invariabilidad del objeto original (Inmutabilidad funcional)
    assert.equal(mockSrdFighter.level, 5);
    assert.equal(mockSrdFighter.max_hp, 44);
  });
});
