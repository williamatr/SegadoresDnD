import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAbilityModifier,
  formatModifier,
  calculateProficiencyBonus,
  calculateSkillOrSaveBonus,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculateGrappleOrShoveDC,
  calculateConcentrationDC,
  calculateArmorClass,
  calculateWeaponAttack,
  applyTemporaryHp,
  applyDamageToCharacter,
  applyShortRest,
  applyLongRest,
  getInjuryDetails,
  createInjuryActiveEffect,
  evaluateInjuryTrigger,
  calculateMulticlassLevelUpCost,
  getCharacterXpProgress,
  calculateMulticlassCasterLevel,
  getMulticlassSpellSlots,
  evaluateCharacterState,
  type Character
} from '../../index.ts';

function createMockSrdCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: 'Valeros de la Costa',
    slug: 'valeros-guerrero',
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
    passive_perception: 14,
    initiative_modifier: 2,
    spellcasting_ability: null,
    spell_save_dc: null,
    spell_attack_bonus: null,
    spellcasting_stats: [],
    ability_scores: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
    saving_throws_prof: ['FUE', 'CON'],
    skills: {},
    multiclass: [{ class: 'Guerrero', level: 5 }],
    spell_slots: {},
    prepared_spells: [],
    known_spells: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    class_resources: [
      { id: 'second-wind', name: 'Tomar Aliento', max: 1, used: 1, recharge: 'short_rest' }
    ],
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

describe('@segadores/dnd-core - Reglas Base D&D 5.5e (SRD 5.2.1)', () => {
  it('calcula modificadores de característica correctamente de 1 a 30', () => {
    assert.equal(calculateAbilityModifier(1), -5);
    assert.equal(calculateAbilityModifier(8), -1);
    assert.equal(calculateAbilityModifier(10), 0);
    assert.equal(calculateAbilityModifier(11), 0);
    assert.equal(calculateAbilityModifier(15), 2);
    assert.equal(calculateAbilityModifier(18), 4);
    assert.equal(calculateAbilityModifier(19), 4);
    assert.equal(calculateAbilityModifier(20), 5);
    assert.equal(formatModifier(3), '+3');
    assert.equal(formatModifier(0), '+0');
    assert.equal(formatModifier(-2), '-2');
  });

  it('calcula el bonificador de competencia por nivel (1 a 20)', () => {
    assert.equal(calculateProficiencyBonus(1), 2);
    assert.equal(calculateProficiencyBonus(4), 2);
    assert.equal(calculateProficiencyBonus(5), 3);
    assert.equal(calculateProficiencyBonus(8), 3);
    assert.equal(calculateProficiencyBonus(9), 4);
    assert.equal(calculateProficiencyBonus(13), 5);
    assert.equal(calculateProficiencyBonus(17), 6);
    assert.equal(calculateProficiencyBonus(20), 6);
  });

  it('calcula habilidades, salvaciones, CD de conjuros y CD de agarre con Agotamiento 5.5e', () => {
    // Nivel 5 (+3 comp), DES 16 (+3), Pericia (+6) -> +9. Con 2 niveles de agotamiento (-4) -> +5
    assert.equal(calculateSkillOrSaveBonus(16, 3, 'expertise', 0), 9);
    assert.equal(calculateSkillOrSaveBonus(16, 3, 'expertise', 2), 5);

    // CD Conjuros: 8 + SAB 16 (+3) + Comp (+3) = 14
    assert.equal(calculateSpellSaveDC(16, 3, true, 0), 14);
    assert.equal(calculateSpellSaveDC(16, 3, true, 1), 12);
    assert.equal(calculateSpellAttackBonus(16, 3, true, 0), 6);

    // CD Agarre/Empujón 5.5e: 8 + FUE 19 (+4) + Comp (+3) = 15
    assert.equal(calculateGrappleOrShoveDC(19, 3), 15);

    // CD Concentración: max(10, floor(daño / 2)), tope 30
    assert.equal(calculateConcentrationDC(8), 10);
    assert.equal(calculateConcentrationDC(26), 13);
    assert.equal(calculateConcentrationDC(70), 30);
  });

  it('calcula Clase de Armadura (CA) sin acumular fórmulas base incompatibles', () => {
    const scores = { str: 10, dex: 16, con: 14, int: 10, wis: 16, cha: 10 };

    // Sin armadura pero con Defensa sin Armadura de Monje (10 + 3 + 3 = 16) vs Armadura de Mago (13 + 3 = 16)
    const monkUnarmored = calculateArmorClass({
      abilityScores: scores,
      hasMonkUnarmoredDefense: true
    });
    assert.equal(monkUnarmored.totalAc, 16);

    // Con Armadura Pesada (Placas = 18) + Escudo (+2) + Estilo Defensa (+1) = 21 (ignora DES y Defensa sin Armadura)
    const heavyTank = calculateArmorClass({
      abilityScores: scores,
      equippedArmor: { armorType: 'heavy', baseAc: 18 },
      equippedShieldBonus: 2,
      hasDefenseFightingStyle: true,
      hasMonkUnarmoredDefense: true
    });
    assert.equal(heavyTank.totalAc, 21);
  });

  it('calcula ataques con armas Sutiles (Finesse) eligiendo FUE si es mayor que DES y manteniendo Ataque Furtivo', () => {
    // Arquetipo Pícaro con FUE 19 (+4) y DES 16 (+3) usando Estoque +1 (Sutil)
    const result = calculateWeaponAttack({
      abilityScores: { str: 19, dex: 16, con: 14, int: 14, wis: 10, cha: 14 },
      proficiencyBonus: 3,
      weapon: {
        damageDice: '1d8',
        damageType: 'perforante',
        finesse: true,
        magicalBonus: 1
      },
      rogueLevel: 4
    });

    assert.equal(result.abilityUsed, 'FUE');
    assert.equal(result.abilityMod, 4);
    assert.equal(result.attackBonus, 8); // +4 FUE +3 Comp +1 Mágico
    assert.equal(result.sneakAttackEligible, true);
    assert.equal(result.sneakAttackDice, '2d6');
  });

  it('gestiona PG temporales (sin acumular), absorción de daño y descansos corto/largo', () => {
    assert.equal(applyTemporaryHp(10, 20), 20);
    assert.equal(applyTemporaryHp(20, 8), 20);

    const afterHit = applyDamageToCharacter(38, 38, 20, 25);
    assert.equal(afterHit.tempHp, 0);
    assert.equal(afterHit.currentHp, 33);
    assert.equal(afterHit.overflowDamage, 0);

    const char = createMockSrdCharacter({
      current_hp: 20,
      temp_hp: 10,
      exhaustion: 2,
      spell_slots: { '1': { total: 4, used: 3 } }
    });

    const afterShort = applyShortRest(char, 1, 8);
    assert.equal(afterShort.current_hp, 28);
    assert.equal(afterShort.hit_dice_current, 4);
    assert.equal(afterShort.class_resources[0].used, 0);

    const afterLong = applyLongRest(char);
    assert.equal(afterLong.current_hp, 44);
    assert.equal(afterLong.temp_hp, 0);
    assert.equal(afterLong.exhaustion, 1);
    assert.equal(afterLong.spell_slots['1'].used, 0);
  });
});

describe('@segadores/dnd-core - Reglas de Mesa: Heridas (Tablas A y B) y Multiclase 50%', () => {
  it('evalúa disparadores y resultados de Tabla A (Heridas Menores) y Tabla B (Heridas Graves)', () => {
    // Golpe > 50% de PG máximos sin caer a 0 PG -> Tabla A
    const trigA = evaluateInjuryTrigger({
      damageTaken: 25,
      maxHp: 44,
      currentHpAfterDamage: 19
    });
    assert.equal(trigA.shouldRollTableA, true);
    assert.equal(trigA.shouldRollTableB, false);

    // Caer a 0 PG -> Tabla B
    const trigB = evaluateInjuryTrigger({
      damageTaken: 20,
      maxHp: 44,
      currentHpAfterDamage: 0
    });
    assert.equal(trigB.shouldRollTableA, false);
    assert.equal(trigB.shouldRollTableB, true);

    // Tirada 1 en Tabla A -> Falta de Aire (bloquea reacciones)
    const effA1 = createInjuryActiveEffect('A', 1);
    assert.ok(effA1);
    assert.equal(effA1.name, 'Falta de Aire');
    assert.equal(effA1.modifiers?.blocksReactions, true);

    // Tirada 20 en Tabla B -> Milagro de los Dioses (revive a 1 PG, no genera debuff persistente)
    const detailsB20 = getInjuryDetails('B', 20);
    assert.equal(detailsB20.instantReviveAt1Hp, true);
    assert.equal(createInjuryActiveEffect('B', 20), null);
  });

  it('calcula el coste de PX de Multiclase al 50% por Alcance (Catch-Up) y Espacios Multiclase', () => {
    // Ejemplo de William: Mago nivel 8 que sube Monje 2 -> 3 (Nivel Total 10 -> 11, escalón de 21.000 PX)
    // El coste oficial RAW de nivel 11 es 21.000 PX; al 50% de alcance cuesta 10.500 PX
    const monkCatchUp = calculateMulticlassLevelUpCost(3, 8, 10);
    assert.equal(monkCatchUp.targetClassCurrentLevel, 2);
    assert.equal(monkCatchUp.targetClassNextLevel, 3);
    assert.equal(monkCatchUp.characterTotalLevel, 10);
    assert.equal(monkCatchUp.nextCharacterTotalLevel, 11);
    assert.equal(monkCatchUp.officialRawCost, 21000);
    assert.equal(monkCatchUp.isCatchUpHalfCost, true);
    assert.equal(monkCatchUp.xpCost, 10500);
    assert.equal(monkCatchUp.savings, 10500);

    // Honiel (Mago 7 / Monje 1 -> Nivel Total 8): Subir a Monje 2 (Nivel Total 9, escalón de 14.000 PX)
    const honielMonk2 = calculateMulticlassLevelUpCost(2, 7, 8);
    assert.equal(honielMonk2.officialRawCost, 14000);
    assert.equal(honielMonk2.xpCost, 7000); // 50% de 14.000
    assert.equal(honielMonk2.isCatchUpHalfCost, true);

    // Subir la clase principal (Mago 7 -> 8): cuesta el 100% del escalón (14.000 PX)
    const honielWizard8 = calculateMulticlassLevelUpCost(8, 7, 8);
    assert.equal(honielWizard8.isCatchUpHalfCost, false);
    assert.equal(honielWizard8.xpCost, 14000);

    // Una vez que ambas clases están igualadas (ej. Mago 5 / Monje 5 = Nivel Total 10), subir a 6 cuesta el 100% (21.000 PX)
    const equalizedLvl = calculateMulticlassLevelUpCost(6, 5, 10);
    assert.equal(equalizedLvl.isCatchUpHalfCost, false);
    assert.equal(equalizedLvl.xpCost, 21000);

    // Regla de desbloqueo a Nivel 7: Si la clase principal no ha alcanzado Nivel 7, la regla está bloqueada (100% normal)
    const lockedPrimary6 = calculateMulticlassLevelUpCost(2, 6, 7);
    assert.equal(lockedPrimary6.isCatchUpHalfCost, false, 'Clase principal < 7 no debe desbloquear descuento de multiclase');
    assert.equal(lockedPrimary6.xpCost, lockedPrimary6.officialRawCost);

    // Subida de clase secundaria de Nivel 6 a 7 con primaria >= 7: aplica el 50% (último nivel con descuento)
    const monkTo7 = calculateMulticlassLevelUpCost(7, 8, 14);
    assert.equal(monkTo7.isCatchUpHalfCost, true, 'Subir multiclase a Nivel 7 aún debe disfrutar del 50%');
    assert.equal(monkTo7.xpCost, Math.floor(monkTo7.officialRawCost * 0.5));

    // Expiración a Nivel 7: Una vez que la multiclase alcanza Nivel 7, subir a Nivel 8 vuelve al 100% oficial
    const monkTo8 = calculateMulticlassLevelUpCost(8, 8, 15);
    assert.equal(monkTo8.isCatchUpHalfCost, false, 'Multiclase en Nivel 7 que pasa a 8 debe pagar el 100% completo');
    assert.equal(monkTo8.xpCost, monkTo8.officialRawCost);

    // Progreso de PX de personajes (Alizar: Nivel 7 con 3.600 PX hacia nivel 8)
    const alizarProgress = getCharacterXpProgress(7, 3600);
    assert.equal(alizarProgress.currentLevel, 7);
    assert.equal(alizarProgress.nextLevel, 8);
    assert.equal(alizarProgress.currentXp, 26600);
    assert.equal(alizarProgress.currentAvailableXp, 3600);
    assert.equal(alizarProgress.totalAccumulatedXp, 26600);
    assert.equal(alizarProgress.currentLevelThreshold, 23000);
    assert.equal(alizarProgress.nextLevelThreshold, 34000);
    assert.equal(alizarProgress.xpNeededForNextLevel, 11000);
    assert.equal(alizarProgress.progressPercent, 33);
    assert.equal(alizarProgress.remainingXp, 7400);

    // Eru: Nivel 8 con 16.960 PX disponibles (supera los 14.000 necesarios para subir a nivel 9)
    const eruProgress = getCharacterXpProgress(8, 16960);
    assert.equal(eruProgress.currentLevel, 8);
    assert.equal(eruProgress.nextLevel, 9);
    assert.equal(eruProgress.currentAvailableXp, 16960);
    assert.equal(eruProgress.totalAccumulatedXp, 50960);
    assert.equal(eruProgress.xpNeededForNextLevel, 14000);
    assert.equal(eruProgress.remainingXp, 0, 'Eru tiene PX suficientes, no faltan PX');
    assert.equal(eruProgress.progressPercent, 100);

    // Zuma: Nivel 8 con 0 PX
    const zumaProgress = getCharacterXpProgress(8, 0);
    assert.equal(zumaProgress.currentAvailableXp, 0);
    assert.equal(zumaProgress.totalAccumulatedXp, 34000);
    assert.equal(zumaProgress.remainingXp, 14000);
    assert.equal(zumaProgress.progressPercent, 0);

    // Nivel de lanzador multiclase: Pícaro (Embaucador Arcano) 4 (floor(4/3)=1) + Bardo 1 (1) = Nivel 2 -> 3 espacios Nv.1
    const casterLvl = calculateMulticlassCasterLevel([
      { class: 'Pícaro', subclass: 'Embaucador Arcano', level: 4 },
      { class: 'Bardo', level: 1 }
    ]);
    assert.equal(casterLvl, 2);
    const slots = getMulticlassSpellSlots(casterLvl);
    assert.equal(slots['1'].total, 3);
  });

  it('evalúa estados combinados, bloqueos de acción e interacciones de clase (Monje con Placas, Silenciado, Heridas)', () => {
    const armoredMonk = createMockSrdCharacter({
      character_class: 'Monje',
      multiclass: [{ class: 'Monje', level: 5 }],
      exhaustion: 1,
      inventory: [
        {
          slug: 'armadura-placas',
          name: 'Armadura de placas',
          category: 'armor',
          qty: 1,
          equipped: true,
          requires_attunement: false,
          attuned: false
        }
      ],
      active_effects: [
        {
          id: 'cond-silenciado',
          name: 'Silenciado',
          type: 'condition',
          conditionId: 'silenciado',
          description: 'No puede emitir sonido.'
        },
        createInjuryActiveEffect('B', 9)! // Lesión Interna: maxHpMultiplier 0.5
      ]
    });

    const state = evaluateCharacterState(armoredMonk);

    // Agotamiento 1: -2 a d20 y -5 pies de velocidad (30 -> 25)
    assert.equal(state.d20ExhaustionPenalty, -2);
    assert.equal(state.effectiveSpeed, 25);

    // Lesión Interna (Tabla B, 9-10): reduce PG máximos a la mitad (44 -> 22)
    assert.equal(state.effectiveMaxHp, 22);

    // Monje con armadura: bloquea Artes Marciales y Movimiento sin Armadura, pero recuerda que el Ki sigue activo
    assert.equal(state.availability.martial_arts.available, false);
    assert.equal(state.availability.unarmored_movement.available, false);
    assert.ok(state.tacticalReminders.some(r => r.includes('Puntos de Ki')));

    // Silenciado: bloquea conjuros verbales
    assert.equal(state.availability.verbal_spell.available, false);
  });
});
