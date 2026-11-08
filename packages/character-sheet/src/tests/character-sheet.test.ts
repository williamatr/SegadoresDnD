import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCharacterState,
  calculateArmorClass,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  previewLevelUp,
  validateLevelUp
} from '@segadores/dnd-core';
import { CAMPAIGN_FULL_CHARACTERS, CAMPAIGN_CHARACTERS } from '../../../../apps/segadores-web/lib/campaign/characters.ts';

describe('@segadores/character-sheet - Suite de Hojas de Personaje (Las 7 Vistas A–G)', () => {
  it('contiene los 5 héroes reales con atributos y reglas canónicas', () => {
    assert.equal(Object.keys(CAMPAIGN_FULL_CHARACTERS).length, 5);

    // 1. Alizar Thorne (Artificiero Alquimista Nivel 7)
    const alizar = CAMPAIGN_FULL_CHARACTERS['alizar'];
    assert.ok(alizar);
    assert.equal(alizar.name, 'Alizar Thorne');
    assert.equal(alizar.race, 'Enano de la colina');
    assert.equal(alizar.level, 7);
    assert.equal(alizar.max_hp, 63);
    assert.equal(alizar.ability_scores.int, 18);
    assert.equal(alizar.ability_scores.wis, 19);
    assert.equal(alizar.ability_scores.con, 15);
    assert.equal(alizar.ability_scores.str, 11);
    assert.equal(alizar.ability_scores.cha, 7);
    assert.deepEqual(alizar.saving_throws_prof, ['CON', 'INT']);
    assert.equal(alizar.class_resources.length, 3);

    // 2. Eru Lion (Alto Elfo Guerrero 7 / Paladín 1 Nivel 8)
    const eru = CAMPAIGN_FULL_CHARACTERS['eru'];
    assert.ok(eru);
    assert.equal(eru.name, 'Eru Lion');
    assert.equal(eru.race, 'Alto Elfo');
    assert.equal(eru.level, 8);
    assert.equal(eru.max_hp, 58);
    assert.equal(eru.ability_scores.str, 20); // Prótesis / FUE 20
    assert.equal(eru.ability_scores.con, 16);
    assert.equal(eru.multiclass.length, 2);
    assert.deepEqual(eru.saving_throws_prof, ['FUE', 'SAB']);

    // 3. Honiel Spellbinder (Elfo Lunar Mago 7 / Monje 1 Nivel 8)
    const honiel = CAMPAIGN_FULL_CHARACTERS['honiel'];
    assert.ok(honiel);
    assert.equal(honiel.name, 'Honiel Spellbinder');
    assert.equal(honiel.race, 'Elfo Lunar');
    assert.equal(honiel.level, 8);
    assert.equal(honiel.max_hp, 44);
    assert.equal(honiel.ability_scores.int, 18);
    assert.equal(honiel.ability_scores.dex, 14);
    assert.equal(honiel.ability_scores.con, 14);
    assert.equal(honiel.multiclass.length, 2);

    // 4. Solaria (Humana Druida Círculo de las Esporas Nivel 7)
    const solaria = CAMPAIGN_FULL_CHARACTERS['solaria'];
    assert.ok(solaria);
    assert.equal(solaria.name, 'Solaria');
    assert.equal(solaria.race, 'Humana');
    assert.equal(solaria.level, 7);
    assert.equal(solaria.max_hp, 54);
    assert.equal(solaria.ability_scores.wis, 20);
    assert.equal(solaria.ability_scores.int, 15);
    assert.equal(solaria.ability_scores.cha, 14);
    assert.equal(solaria.spell_save_dc, 16);
    assert.equal(solaria.spell_attack_bonus, 8);

    // 5. Zuma Kobold (Mediano Piesligeros Pícaro 7 / Bardo 1 Nivel 8)
    const zuma = CAMPAIGN_FULL_CHARACTERS['zuma'];
    assert.ok(zuma);
    assert.equal(zuma.name, 'Zuma Kobold');
    assert.equal(zuma.race, 'Mediano (Piesligeros)');
    assert.equal(zuma.level, 8);
    assert.equal(zuma.max_hp, 60);
    assert.equal(zuma.multiclass.length, 2);
    assert.deepEqual(zuma.saving_throws_prof, ['DES', 'INT', 'CAR']);
  });

  it('evalúa el estado de combate con evaluateCharacterState para los héroes reales', () => {
    // Evaluar Alizar
    const alizarState = evaluateCharacterState(CAMPAIGN_FULL_CHARACTERS['alizar']);
    assert.ok(alizarState.effectiveAc >= 17);
    assert.equal(alizarState.effectiveSpeed, 25);
    assert.equal(alizarState.availability.action.available, true);

    // Evaluar Eru con placas y baluarte
    const eruState = evaluateCharacterState(CAMPAIGN_FULL_CHARACTERS['eru']);
    assert.equal(eruState.effectiveAc, 25);
    assert.equal(eruState.effectiveSpeed, 30);

    // Evaluar Zuma con Sa Yue y Guanteletes de Ogro
    const zuma = CAMPAIGN_FULL_CHARACTERS['zuma'];
    const zumaState = evaluateCharacterState(zuma);
    assert.ok(zumaState.effectiveAc >= 14);
  });

  it('verifica límites y conteos de sintonización mágica (máximo 3 ranuras)', () => {
    for (const [slug, char] of Object.entries(CAMPAIGN_FULL_CHARACTERS)) {
      const attuned = char.inventory.filter(i => i.requires_attunement && i.attuned);
      assert.ok(
        attuned.length <= (char.attunement_slots || 3),
        `El personaje ${slug} no debe exceder su límite de sintonización inicial (${attuned.length} <= ${char.attunement_slots || 3})`
      );
    }
  });

  it('permite a Honiel Spellbinder (Mago 7 / Monje 1) subir a Monje 2 al 50% de coste y desbloquear Ki', () => {
    const honiel = {
      ...CAMPAIGN_FULL_CHARACTERS['honiel'],
      experience_points: 10000 // Otorgamos PX suficientes para la prueba
    };

    const validation = validateLevelUp(honiel, 'Monje');
    assert.equal(validation.canLevelUp, true);
    assert.equal(validation.isCatchUpHalfCost, true);
    assert.equal(validation.xpCost, 7000); // 50% de 14.000 PX
    assert.equal(validation.savings, 7000);

    const preview = previewLevelUp(honiel, 'Monje', { hpMethod: 'average' });
    const updated = preview.updatedCharacter;

    // Nivel total 9 (Mago 7 / Monje 2)
    assert.equal(updated.level, 9);
    assert.equal(updated.character_class, 'Mago 7 / Monje 2');
    assert.equal(updated.experience_points, 3000); // 10.000 - 7.000
    assert.equal(updated.proficiency_bonus, 4); // Sube de +3 a +4

    // Recursos de clase: Puntos de Ki desbloqueados (2 puntos)
    const ki = updated.class_resources.find(r => r.name.toLowerCase().includes('ki'));
    assert.ok(ki, 'Honiel debe desbloquear Puntos de Ki al subir a Monje 2');
    assert.equal(ki.max, 2);

    // Rasgos de clase adquiridos
    const featureNames = preview.newFeatures.map(f => f.name);
    assert.ok(featureNames.some(f => f.includes('Puntos de Ki')));
    assert.ok(featureNames.some(f => f.includes('Ráfaga de Golpes')));
  });
});
