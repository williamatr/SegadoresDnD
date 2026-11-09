import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_PARTY_BUFFS,
  filterAvailableBuffs,
  createActiveEffectFromBuff,
  evaluateCharacterState,
  type Character,
  type CharacterBuffDefinition
} from '../../index.ts';

const BASE_TEST_HERO: Character = {
  id: 'char-eru',
  name: 'Eru Lion',
  slug: 'eru',
  character_class: 'Guerrero / Paladín',
  level: 8,
  race: 'Alto Elfo',
  background: 'Soldado',
  alignment: 'Legal Bueno',
  experience_points: 34000,
  max_hp: 76,
  current_hp: 76,
  temp_hp: 0,
  hit_dice_total: '6d10 + 2d10',
  hit_dice_current: 8,
  armor_class: 18,
  speed: 30,
  proficiency_bonus: 3,
  passive_perception: 13,
  initiative_modifier: 1,
  spellcasting_ability: 'CHA',
  spell_save_dc: 14,
  spell_attack_bonus: 6,
  ability_scores: { str: 18, dex: 12, con: 16, int: 10, wis: 12, cha: 14 },
  saving_throws: { str: 7, dex: 1, con: 6, int: 0, wis: 1, cha: 2 },
  skills: { atletismo: 7, percepcion: 4, intimidacion: 5 },
  active_effects: []
};

describe('@segadores/dnd-core - Catálogo y Filtrado Canónico de Buffs de la Compañía', () => {
  it('garantiza la integridad estructural del catálogo de los 5 héroes de la campaña', () => {
    assert.ok(CANONICAL_PARTY_BUFFS.length >= 20, 'Debe haber un catálogo rico de al menos 20 buffs');

    const expectedSlugs = new Set(['eru', 'honiel', 'alizar', 'solaria', 'zuma']);
    const foundSlugs = new Set(CANONICAL_PARTY_BUFFS.map(b => b.ownerSlug));

    assert.deepEqual(
      Array.from(foundSlugs).sort(),
      Array.from(expectedSlugs).sort(),
      'El catálogo debe contener exactamente a los 5 héroes de la campaña'
    );

    for (const buff of CANONICAL_PARTY_BUFFS) {
      assert.ok(buff.id.length > 0, `El buff ${buff.name} debe tener id`);
      assert.ok(buff.name.length > 0, `El buff ${buff.id} debe tener name`);
      assert.ok(buff.ownerName.length > 0, `El buff ${buff.id} debe tener ownerName`);
      assert.ok(['self', 'allies', 'both'].includes(buff.targetScope), `Scope inválido en ${buff.id}`);
      assert.ok(buff.duration.length > 0, `Duración vacía en ${buff.id}`);
      assert.ok(buff.description.length > 0, `Descripción vacía en ${buff.id}`);
    }
  });

  it('Caso 1: Jugador viendo su PROPIA ficha -> solo ve buffs que puede aplicarse a sí mismo (self o both)', () => {
    const eruSelfBuffs = filterAvailableBuffs(CANONICAL_PARTY_BUFFS, {
      userRole: 'player',
      targetCharacterSlug: 'eru',
      viewerCharacterSlug: 'eru',
      readOnly: false
    });

    const buffNames = eruSelfBuffs.map(b => b.name);

    // Eru tiene:
    // Bendición (both) -> SÍ
    // Escudo de Fe (both) -> SÍ
    // Escudo (Guerrero Arcano) (self) -> SÍ
    // Protección / Intercepción (allies) -> NO (es solo para aliados)
    assert.ok(buffNames.includes('Bendición'), 'Debe incluir Bendición (targetScope: both)');
    assert.ok(buffNames.includes('Escudo de Fe'), 'Debe incluir Escudo de Fe (targetScope: both)');
    assert.ok(buffNames.includes('Escudo (Guerrero Arcano)'), 'Debe incluir Escudo (targetScope: self)');
    assert.strictEqual(
      buffNames.includes('Protección / Intercepción'),
      false,
      'NO debe incluir Protección / Intercepción porque solo aplica a aliados'
    );

    // Debe contener ÚNICAMENTE buffs de Eru
    for (const b of eruSelfBuffs) {
      assert.strictEqual(b.ownerSlug, 'eru', 'No debe incluir buffs de otros personajes');
      assert.ok(b.targetScope === 'self' || b.targetScope === 'both');
    }
  });

  it('Caso 1B: Jugador viendo su propia ficha sin viewerCharacterSlug pero con readOnly = false', () => {
    const solariaSelfBuffs = filterAvailableBuffs(CANONICAL_PARTY_BUFFS, {
      userRole: 'player',
      targetCharacterSlug: 'solaria',
      viewerCharacterSlug: null,
      readOnly: false
    });

    const buffNames = solariaSelfBuffs.map(b => b.name);
    assert.ok(buffNames.includes('Guía'));
    assert.ok(buffNames.includes('Entidad Simbiótica'));
    assert.ok(buffNames.includes('Escudo de Fuego'));
    assert.ok(buffNames.includes('Libertad de Movimiento'));
    assert.ok(buffNames.includes('Pasar sin Rastro'));

    for (const b of solariaSelfBuffs) {
      assert.strictEqual(b.ownerSlug, 'solaria');
      assert.ok(b.targetScope === 'self' || b.targetScope === 'both');
    }
  });

  it('Caso 2: Jugador viendo la ficha de un COMPAÑERO -> solo ve los buffs que su héroe activo puede aplicar a aliados', () => {
    // Eru está viendo la ficha de Honiel
    const eruViewingHoniel = filterAvailableBuffs(CANONICAL_PARTY_BUFFS, {
      userRole: 'player',
      targetCharacterSlug: 'honiel',
      viewerCharacterSlug: 'eru',
      readOnly: true
    });

    const buffNames = eruViewingHoniel.map(b => b.name);

    // Eru puede darle a aliados:
    // Bendición (both) -> SÍ
    // Escudo de Fe (both) -> SÍ
    // Protección / Intercepción (allies) -> SÍ
    // Escudo (Guerrero Arcano) (self) -> NO
    assert.ok(buffNames.includes('Bendición'), 'Debe incluir Bendición (targetScope: both)');
    assert.ok(buffNames.includes('Escudo de Fe'), 'Debe incluir Escudo de Fe (targetScope: both)');
    assert.ok(buffNames.includes('Protección / Intercepción'), 'Debe incluir Protección / Intercepción (allies)');
    assert.strictEqual(
      buffNames.includes('Escudo (Guerrero Arcano)'),
      false,
      'NO debe incluir Escudo (Guerrero Arcano) porque es self-only'
    );

    // NINGÚN buff de Honiel debe aparecer en la lista de inyección de Eru
    for (const b of eruViewingHoniel) {
      assert.strictEqual(b.ownerSlug, 'eru', 'Solo debe ver buffs de Eru (el héroe observador)');
      assert.ok(b.targetScope === 'allies' || b.targetScope === 'both');
    }
  });

  it('Caso 2B: Alizar viendo la ficha de Zuma -> ve sus elixires experimentales y Destello de Genialidad', () => {
    const alizarViewingZuma = filterAvailableBuffs(CANONICAL_PARTY_BUFFS, {
      userRole: 'player',
      targetCharacterSlug: 'zuma',
      viewerCharacterSlug: 'alizar',
      readOnly: true
    });

    const names = alizarViewingZuma.map(b => b.name);
    assert.ok(names.includes('Destello de Genialidad'));
    assert.ok(names.includes('Elixir Experimental: Osadía'));
    assert.ok(names.includes('Elixir Experimental: Resiliencia'));
    assert.ok(names.includes('Elixir Experimental: Rapidez'));
    assert.ok(names.includes('Elixir Experimental: Vuelo'));
    assert.ok(names.includes('Santuario'));

    // NINGÚN buff de Zuma ni de otros
    for (const b of alizarViewingZuma) {
      assert.strictEqual(b.ownerSlug, 'alizar');
      assert.ok(b.targetScope === 'allies' || b.targetScope === 'both');
    }
  });

  it('Caso 3: Master DM viendo una ficha -> ve todos los buffs propios y todos los de soporte de los aliados', () => {
    const dmViewingHoniel = filterAvailableBuffs(CANONICAL_PARTY_BUFFS, {
      userRole: 'dm',
      targetCharacterSlug: 'honiel'
    });

    const names = dmViewingHoniel.map(b => b.name);

    // 1. Propios de Honiel (self y both):
    assert.ok(names.includes('Escudo'), 'DM ve Escudo propio de Honiel');
    assert.ok(names.includes('Armadura de Mago'), 'DM ve Armadura de Mago propia de Honiel');
    assert.ok(names.includes('Falsa Vida'), 'DM ve Falsa Vida propia de Honiel');
    assert.ok(names.includes('Defensa Paciente (Ki)'), 'DM ve Defensa Paciente propia de Honiel');
    assert.ok(names.includes('Arma Mágica'), 'DM ve Arma Mágica propia de Honiel');

    // 2. Soporte de aliados hacia Honiel:
    assert.ok(names.includes('Bendición'), 'DM ve Bendición de Eru hacia Honiel');
    assert.ok(names.includes('Escudo de Fe'), 'DM ve Escudo de Fe de Eru hacia Honiel');
    assert.ok(names.includes('Protección / Intercepción'), 'DM ve Protección de Eru hacia Honiel');
    assert.ok(names.includes('Inspiración Bárdica (1d6)'), 'DM ve Inspiración Bárdica de Zuma');
    assert.ok(names.includes('Elixir Experimental: Resiliencia'), 'DM ve Elixir de Alizar');
    assert.ok(names.includes('Guía'), 'DM ve Guía de Solaria');

    // 3. NO debe incluir buffs de aliados que sean EXCLUSIVAMENTE propios (self-only):
    assert.strictEqual(
      names.includes('Escudo (Guerrero Arcano)'),
      false,
      'No debe incluir el Escudo personal de Eru'
    );
    assert.strictEqual(
      names.includes('Entidad Simbiótica'),
      false,
      'No debe incluir la Entidad Simbiótica personal de Solaria'
    );
    assert.strictEqual(
      names.includes('Escudo de Fuego'),
      false,
      'No debe incluir el Escudo de Fuego personal de Solaria'
    );
  });

  it('Verificación estricta de State Diff & Modificadores al inyectar un Buff generado', () => {
    const shieldOfFaithBuff = CANONICAL_PARTY_BUFFS.find(b => b.id === 'eru-escudo-de-fe')!;
    const blessingBuff = CANONICAL_PARTY_BUFFS.find(b => b.id === 'eru-bendicion')!;

    // 1. Crear efectos canónicos
    const effectShield = createActiveEffectFromBuff(shieldOfFaithBuff, 'Eru Lion');
    const effectBlessing = createActiveEffectFromBuff(blessingBuff, 'Eru Lion');

    assert.strictEqual(effectShield.name, 'Escudo de Fe');
    assert.strictEqual(effectShield.applied_by, 'Eru Lion');
    assert.strictEqual(effectShield.modifiers?.acBonus, 2);

    assert.strictEqual(effectBlessing.name, 'Bendición');
    assert.deepEqual(effectBlessing.modifiers?.attackBonusDice, ['1d4']);

    // 2. Estado antes de la inyección
    const stateBefore = evaluateCharacterState(BASE_TEST_HERO);
    assert.strictEqual(stateBefore.effectiveAc, 18, 'CA base inicial debe ser 18');
    assert.deepEqual(stateBefore.activeBonusDice.attack, [], 'Sin dados de bonificación antes de buff');

    // 3. Mutar inyectando Escudo de Fe y Bendición
    const heroWithBuffs: Character = {
      ...BASE_TEST_HERO,
      active_effects: [effectShield, effectBlessing]
    };

    // 4. Estado después de la inyección (State Diff)
    const stateAfter = evaluateCharacterState(heroWithBuffs);

    assert.strictEqual(
      stateAfter.effectiveAc,
      stateBefore.effectiveAc + 2,
      'La CA debe incrementarse exactamente en +2 por Escudo de Fe'
    );
    assert.deepEqual(
      stateAfter.activeBonusDice.attack,
      ['1d4'],
      'Los dados de ataque deben incluir 1d4 de Bendición'
    );
    assert.deepEqual(
      stateAfter.activeBonusDice.save,
      ['1d4'],
      'Los dados de salvación deben incluir 1d4 de Bendición'
    );

    // 5. Verificar inmutabilidad: el estado anterior y el objeto original no sufren mutación
    assert.strictEqual(BASE_TEST_HERO.active_effects?.length, 0);
  });
});
