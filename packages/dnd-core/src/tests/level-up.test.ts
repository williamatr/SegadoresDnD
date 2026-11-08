import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateLevelUp,
  previewLevelUp,
  applyLevelUp,
  getClassHitDie,
  normalizeClassName,
  formatHitDiceTotal,
  type Character
} from '../../index.ts';

function createTestHero(overrides: Partial<Character> = {}): Character {
  return {
    name: 'Zuma Marginem',
    slug: 'zuma',
    character_class: 'Mago 7 / Monje 1',
    level: 8,
    race: 'Tiefling',
    background: 'Erudito',
    alignment: 'Caótico Bueno',
    experience_points: 10000,
    max_hp: 44,
    current_hp: 44,
    temp_hp: 0,
    hit_dice_total: '7d6 + 1d8',
    hit_dice_current: 8,
    armor_class: 15,
    speed: 30,
    proficiency_bonus: 3,
    passive_perception: 14,
    initiative_modifier: 2,
    spellcasting_ability: 'INT',
    spell_save_dc: 15,
    spell_attack_bonus: 7,
    spellcasting_stats: [
      {
        source: 'Mago',
        ability: 'INT',
        ability_en: 'INT',
        save_dc: 15,
        attack_bonus: 7
      }
    ],
    ability_scores: { str: 10, dex: 14, con: 15, int: 18, wis: 14, cha: 8 },
    saving_throws_prof: ['INT', 'SAB'],
    skills: {
      'Conocimiento Arcano': { bonus: 7, base_bonus: 7, proficiency: 'proficient' },
      'Percepción': { bonus: 5, base_bonus: 5, proficiency: 'proficient' }
    },
    multiclass: [
      { class: 'Mago', subclass: 'Evocación', level: 7 },
      { class: 'Monje', level: 1 }
    ],
    spell_slots: {
      '1': { total: 4, used: 1 },
      '2': { total: 3, used: 0 },
      '3': { total: 3, used: 2 },
      '4': { total: 1, used: 0 }
    },
    prepared_spells: [],
    known_spells: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    class_resources: [],
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

describe('@segadores/dnd-core - Motor de Subida de Nivel (Level-Up Engine)', () => {
  it('normaliza nombres de clases y obtiene sus dados de golpe canónicos', () => {
    assert.equal(normalizeClassName('monk'), 'Monje');
    assert.equal(normalizeClassName('Mago'), 'Mago');
    assert.equal(normalizeClassName('fighter'), 'Guerrero');
    assert.equal(normalizeClassName('Artificiero'), 'Artífice');
    assert.equal(normalizeClassName('rogue'), 'Pícaro');

    assert.equal(getClassHitDie('Mago').die, 'd6');
    assert.equal(getClassHitDie('Mago').avgHp, 4);

    assert.equal(getClassHitDie('Monje').die, 'd8');
    assert.equal(getClassHitDie('Monje').avgHp, 5);

    assert.equal(getClassHitDie('Guerrero').die, 'd10');
    assert.equal(getClassHitDie('Guerrero').avgHp, 6);

    assert.equal(getClassHitDie('Bárbaro').die, 'd12');
    assert.equal(getClassHitDie('Bárbaro').avgHp, 7);
  });

  it('formatea dados de golpe acumulados de forma multiclase (formatHitDiceTotal)', () => {
    const classes = [
      { class: 'Mago', level: 7 },
      { class: 'Monje', level: 2 }
    ];
    assert.equal(formatHitDiceTotal(classes), '7d6 + 2d8');
  });

  it('valida coste al 50% (Catch-Up) para subir clase secundaria menor que primaria', () => {
    // Zuma: Mago 7 / Monje 1 (Total Nivel 8). Escalón a nivel 9 = 14.000 PX.
    // Al 50% de catch-up, cuesta 7.000 PX.
    const hero = createTestHero({ experience_points: 10000 });
    const validation = validateLevelUp(hero, 'Monje');

    assert.equal(validation.canLevelUp, true);
    assert.equal(validation.targetClass, 'Monje');
    assert.equal(validation.targetClassCurrentLevel, 1);
    assert.equal(validation.targetClassNextLevel, 2);
    assert.equal(validation.characterTotalLevel, 8);
    assert.equal(validation.nextCharacterTotalLevel, 9);
    assert.equal(validation.officialRawCost, 14000);
    assert.equal(validation.xpCost, 7000);
    assert.equal(validation.savings, 7000);
    assert.equal(validation.isCatchUpHalfCost, true);
    assert.equal(validation.remainingXpAfterLevelUp, 3000);
    assert.equal(validation.missingXp, 0);
  });

  it('detecta falta de experiencia y reporta missingXp y canLevelUp = false', () => {
    // Zuma tiene solo 4.000 PX pero necesita 7.000 PX
    const hero = createTestHero({ experience_points: 4000 });
    const validation = validateLevelUp(hero, 'Monje');

    assert.equal(validation.canLevelUp, false);
    assert.equal(validation.xpCost, 7000);
    assert.equal(validation.missingXp, 3000);
    assert.ok(validation.reason?.includes('faltan'));
  });

  it('cobra el 100% de PX al subir la clase principal (no aplica descuento de alcance)', () => {
    // Zuma sube Mago 7 -> 8 (Nivel total 8 -> 9). Cuesta el 100% (14.000 PX)
    const hero = createTestHero({ experience_points: 15000 });
    const validation = validateLevelUp(hero, 'Mago');

    assert.equal(validation.canLevelUp, true);
    assert.equal(validation.isCatchUpHalfCost, false);
    assert.equal(validation.officialRawCost, 14000);
    assert.equal(validation.xpCost, 14000);
    assert.equal(validation.savings, 0);
    assert.equal(validation.remainingXpAfterLevelUp, 1000);
  });

  it('genera una Vista Previa completa e inmutable (previewLevelUp) con nuevos rasgos y Ki de Monje', () => {
    const hero = createTestHero({ experience_points: 10000 });
    const preview = previewLevelUp(hero, 'Monje', { hpMethod: 'average' });

    // 1. Verificación de inmutabilidad del héroe original
    assert.equal(hero.level, 8);
    assert.equal(hero.experience_points, 10000);
    assert.equal(hero.max_hp, 44);

    // 2. Verificación del personaje actualizado
    const updated = preview.updatedCharacter;
    assert.equal(updated.level, 9);
    assert.equal(updated.character_class, 'Mago 7 / Monje 2');
    assert.equal(updated.experience_points, 3000); // 10.000 - 7.000

    // PG: Monje d8 media = 5. CON 15 -> mod +2. Ganancia = 5 + 2 = 7 PG.
    assert.equal(updated.max_hp, 44 + 7);
    assert.equal(updated.current_hp, 44 + 7);
    assert.equal(updated.hit_dice_total, '7d6 + 2d8');
    assert.equal(updated.hit_dice_current, 9);

    // Nivel total 9 incrementa bonificador de competencia de +3 a +4
    assert.equal(updated.proficiency_bonus, 4);
    assert.equal(preview.diff.proficiencyBonus.increased, true);

    // Habilidades actualizadas con el nuevo bonificador
    const arcanaSkill = updated.skills['Conocimiento Arcano'];
    assert.ok(typeof arcanaSkill === 'object' && arcanaSkill !== null);
    assert.equal((arcanaSkill as { bonus: number }).bonus, 8); // 7 + 1

    // Estadísticas de conjuro actualizadas con competencia
    assert.equal(updated.spell_save_dc, 16); // 15 + 1
    assert.equal(updated.spell_attack_bonus, 8); // 7 + 1

    // Recursos de clase: Monje Nivel 2 desbloquea Puntos de Ki
    const kiResource = updated.class_resources.find(r => r.name.toLowerCase().includes('ki'));
    assert.ok(kiResource, 'Debe haber creado el recurso de Puntos de Ki');
    assert.equal(kiResource.max, 2);
    assert.equal(kiResource.recharge, 'short_rest');

    // Rasgos de clase adquiridos
    const featureNames = preview.newFeatures.map(f => f.name);
    assert.ok(featureNames.some(n => n.includes('Puntos de Ki')));
    assert.ok(featureNames.some(n => n.includes('Ráfaga de Golpes')));
    assert.ok(featureNames.some(n => n.includes('Movimiento sin Armadura')));

    // Diff informativo
    assert.equal(preview.diff.totalLevel.before, 8);
    assert.equal(preview.diff.totalLevel.after, 9);
    assert.equal(preview.diff.maxHp.increase, 7);
    assert.equal(preview.diff.experiencePoints.cost, 7000);
  });

  it('soporta cálculo de PG mediante tirada manual (hpMethod = roll)', () => {
    const hero = createTestHero({ experience_points: 10000 });
    // Tirada de dado de 8 (máximo en d8) + mod CON (+2) = 10 PG
    const preview = previewLevelUp(hero, 'Monje', { hpMethod: 'roll', rolledHp: 8 });

    assert.equal(preview.updatedCharacter.max_hp, 44 + 10);
    assert.equal(preview.diff.maxHp.increase, 10);
    assert.equal(preview.diff.maxHp.method, 'roll');
    assert.equal(preview.diff.maxHp.baseRoll, 8);
  });

  it('aplica subida formal con applyLevelUp y lanza excepción si faltan PX', () => {
    const richHero = createTestHero({ experience_points: 10000 });
    const applied = applyLevelUp(richHero, 'Monje');
    assert.equal(applied.level, 9);
    assert.equal(applied.experience_points, 3000);

    const poorHero = createTestHero({ experience_points: 500 });
    assert.throws(() => {
      applyLevelUp(poorHero, 'Monje');
    }, /Puntos de Experiencia insuficientes/);
  });

  it('bloquea subida de nivel si el personaje ya es nivel 20', () => {
    const epicHero = createTestHero({ level: 20, experience_points: 999999 });
    const validation = validateLevelUp(epicHero, 'Guerrero');

    assert.equal(validation.canLevelUp, false);
    assert.ok(validation.reason?.includes('nivel épico máximo') || validation.reason?.includes('20'));

    assert.throws(() => {
      applyLevelUp(epicHero, 'Guerrero');
    }, /nivel épico máximo|nivel máximo/);
  });
});
