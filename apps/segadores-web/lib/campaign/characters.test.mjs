import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCharacterState,
  validateLevelUp,
  previewLevelUp
} from '@segadores/dnd-core';

describe('Sistema de Héroes Reales de Campaña (Segadores de Orcos)', () => {
  it('contiene la lista completa de los 5 aventureros oficiales de la mesa', async () => {
    const { CAMPAIGN_CHARACTERS, getCampaignCharacterBySlug, getCampaignFullCharacterBySlug } = await import('./characters.ts');

    assert.equal(CAMPAIGN_CHARACTERS.length, 5);
    const slugs = CAMPAIGN_CHARACTERS.map(c => c.slug);
    assert.deepEqual(slugs, ['alizar', 'eru', 'honiel', 'solaria', 'zuma']);

    // Validar niveles reales (Niveles 7, 8 y 9)
    const expectedLevels = {
      alizar: 7,
      eru: 8,
      honiel: 9,
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
    assert.equal(fullHoniel.ability_scores.int, 20);
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

  it('evalúa el estado táctico de combate de los 5 héroes de campaña', async () => {
    const { CAMPAIGN_FULL_CHARACTERS } = await import('./characters.ts');

    // 1. Evaluar Alizar
    const alizarState = evaluateCharacterState(CAMPAIGN_FULL_CHARACTERS['alizar']);
    assert.ok(alizarState.effectiveAc >= 17);
    assert.equal(alizarState.effectiveSpeed, 25);
    assert.equal(alizarState.availability.action.available, true);

    // 2. Evaluar Eru con placas y baluarte
    const eruState = evaluateCharacterState(CAMPAIGN_FULL_CHARACTERS['eru']);
    assert.equal(eruState.effectiveAc, 23);
    assert.equal(eruState.effectiveSpeed, 30);

    // 3. Evaluar Zuma con Sa Yue y Guanteletes de Ogro
    const zumaState = evaluateCharacterState(CAMPAIGN_FULL_CHARACTERS['zuma']);
    assert.ok(zumaState.effectiveAc >= 14);
  });

  it('verifica límites y ranuras de sintonización mágica (máximo 3 ranuras)', async () => {
    const { CAMPAIGN_FULL_CHARACTERS } = await import('./characters.ts');

    for (const [slug, char] of Object.entries(CAMPAIGN_FULL_CHARACTERS)) {
      const attuned = char.inventory.filter(i => i.requires_attunement && i.attuned);
      assert.ok(
        attuned.length <= (char.attunement_slots || 3),
        `El personaje ${slug} no debe exceder su límite de sintonización inicial (${attuned.length} <= ${char.attunement_slots || 3})`
      );
    }
  });

  it('permite a Honiel Spellbinder (Mago 7 / Monje 1) subir a Monje 2 al 50% de coste y desbloquear Ki', async () => {
    const { CAMPAIGN_FULL_CHARACTERS } = await import('./characters.ts');
    const honiel = {
      ...CAMPAIGN_FULL_CHARACTERS['honiel'],
      level: 8,
      character_class: 'Mago 7 / Monje 1',
      multiclass: [
        { class: 'Mago', subclass: 'Evocación', level: 7 },
        { class: 'Monje', level: 1 }
      ],
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

  it('verifica que Honiel ("Oriel") activa Defensa sin Armadura de Monje (CA 14) y velocidad +10 pies al desequipar la armadura a pesar de portar el Broche de escudo', async () => {
    const { CAMPAIGN_FULL_CHARACTERS } = await import('./characters.ts');
    const honielBase = CAMPAIGN_FULL_CHARACTERS['honiel'];

    // 1. Con armadura equipada: CA 16, velocidad 30, Artes Marciales bloqueadas
    const stateArmored = evaluateCharacterState(honielBase);
    assert.equal(stateArmored.effectiveAc, 16);
    assert.equal(stateArmored.effectiveSpeed, 30);
    assert.equal(stateArmored.availability.martial_arts.available, false);
    assert.equal(stateArmored.availability.unarmored_movement.available, false);

    // 2. Desequipar la Cota de Malla de Mithral, manteniendo el Broche de escudo equipado
    const honielUnarmored = {
      ...honielBase,
      inventory: honielBase.inventory.map(item =>
        item.slug === 'cota-de-malla-de-mithral'
          ? { ...item, equipped: false }
          : item
      )
    };

    const stateUnarmored = evaluateCharacterState(honielUnarmored);
    // Defensa sin Armadura Monje: 10 + DES 3 (16) + SAB 1 (13) = 14
    assert.equal(stateUnarmored.effectiveAc, 14, 'La CA debe ser 14 por Defensa sin Armadura de Monje');
    assert.equal(stateUnarmored.effectiveSpeed, 40, 'La velocidad debe subir a 40 pies (+10 pies Movimiento sin Armadura)');
    assert.equal(stateUnarmored.availability.martial_arts.available, true, 'Artes Marciales deben estar plenamente activas');
    assert.equal(stateUnarmored.availability.unarmored_movement.available, true, 'Movimiento sin Armadura debe estar activo');
    assert.ok(
      stateUnarmored.acBreakdown.some(b => b.includes('Defensa sin Armadura de Monje')),
      'El desglose de CA debe indicar Defensa sin Armadura de Monje'
    );
  });
});
