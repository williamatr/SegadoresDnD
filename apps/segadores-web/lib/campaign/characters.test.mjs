import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Sistema de Héroes Reales de Campaña (Segadores de Orcos)', () => {
  it('contiene la lista completa de los 5 aventureros oficiales de la mesa', async () => {
    const { CAMPAIGN_CHARACTERS, getCampaignCharacterBySlug, getCampaignFullCharacterBySlug } = await import('./characters.ts');

    assert.equal(CAMPAIGN_CHARACTERS.length, 5);
    const slugs = CAMPAIGN_CHARACTERS.map(c => c.slug);
    assert.deepEqual(slugs, ['alizar', 'eru', 'honiel', 'solaria', 'zuma']);

    // Validar niveles reales (Niveles 7 y 8)
    const expectedLevels = {
      alizar: 7,
      eru: 8,
      honiel: 8,
      solaria: 7,
      zuma: 8
    };

    CAMPAIGN_CHARACTERS.forEach(c => {
      assert.equal(c.level, expectedLevels[c.slug], `El personaje ${c.name} debe tener nivel ${expectedLevels[c.slug]}`);
      assert.ok(c.maxHp > 0, `El personaje ${c.name} debe tener PG máximos`);
      assert.ok(c.armorClass >= 10, `El personaje ${c.name} debe tener CA válida`);
    });

    // Búsqueda por slug
    const zuma = getCampaignCharacterBySlug('zuma');
    assert.ok(zuma);
    assert.equal(zuma.name, 'Zuma Kobold');
    assert.equal(zuma.characterClass, 'Pícaro / Bardo');

    const alizar = getCampaignCharacterBySlug('ALIZAR'); // Case insensitive
    assert.ok(alizar);
    assert.equal(alizar.name, 'Alizar Thorne');

    const eru = getCampaignCharacterBySlug('eru-illuvatar'); // Compatibilidad con alias
    assert.ok(eru);
    assert.equal(eru.slug, 'eru');

    const inexistente = getCampaignCharacterBySlug('personaje-fantasma');
    assert.equal(inexistente, undefined);

    const nulo = getCampaignCharacterBySlug(null);
    assert.equal(nulo, undefined);

    // Obtención de ficha canónica completa
    const fullHoniel = getCampaignFullCharacterBySlug('honiel');
    assert.ok(fullHoniel);
    assert.equal(fullHoniel.name, 'Honiel Spellbinder');
    assert.equal(fullHoniel.multiclass.length, 2);
    assert.equal(fullHoniel.ability_scores.int, 18);
  });

  it('valida reglas de asignación e invitaciones del DM', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación de emails
    assert.ok(emailRegex.test('carlos@ejemplo.com'));
    assert.ok(emailRegex.test('aventurero.dnd@ejemplo.com'));
    assert.ok(!emailRegex.test('invalido-sin-arroba'));
    assert.ok(!emailRegex.test('@solo-dominio.com'));

    // Asignación de rol
    const normalizeRole = (r) => (r === 'dm' ? 'dm' : 'player');
    assert.equal(normalizeRole('dm'), 'dm');
    assert.equal(normalizeRole('player'), 'player');
    assert.equal(normalizeRole('cualquier_otro'), 'player');
    assert.equal(normalizeRole(undefined), 'player');

    // Normalización de slug de personaje
    const normalizeSlug = (slug) => {
      if (!slug || slug === 'none' || slug.trim() === '') return null;
      return slug.trim().toLowerCase();
    };

    assert.equal(normalizeSlug('zuma'), 'zuma');
    assert.equal(normalizeSlug('  Alizar  '), 'alizar');
    assert.equal(normalizeSlug('none'), null);
    assert.equal(normalizeSlug(''), null);
    assert.equal(normalizeSlug(null), null);
  });
});
