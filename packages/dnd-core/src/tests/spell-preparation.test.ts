import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSpellPreparationRules,
  isSpellCantrip,
  evaluateCharacterState,
  type Character
} from '../../index.ts';

describe('@segadores/dnd-core - Reglas Canónicas de Preparación de Conjuros', () => {
  it('calcula correctamente el límite de preparación de Honiel (Mago 7 + INT 20 = 12 máx)', () => {
    const honiel: Character = {
      id: 'char-honiel',
      name: 'Honiel Spellbinder',
      slug: 'honiel',
      character_class: 'Mago / Monje',
      level: 9,
      race: 'Elfo Lunar',
      background: 'Sabio',
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
      ability_scores: { str: 8, dex: 16, con: 15, int: 20, wis: 13, cha: 7 },
      multiclass: [
        { class: 'Mago', subclass: 'Evocación', level: 7 },
        { class: 'Monje', level: 2 }
      ],
      known_spells: [
        'Prestidigitación', 'Agarre electrizante', 'Rociada venenosa', 'Rayo de escarcha', 'Ilusión menor',
        'Escudo', 'Armadura de mago', 'Proyectil mágico', 'Manos ardientes', 'Falsa vida', 'Hechizar persona',
        'Dormir', 'Detectar magia', 'Identificar', 'Sirviente invisible', 'Disfrazarse', 'Caída de pluma',
        'Hacer añicos', 'Arma mágica', 'Ceguera/Sordera', 'Cerradura arcana', 'Apertura (Knock)', 'Levitar',
        'Bola de fuego', 'Relámpago', 'Clarividencia', 'Maldecir (Bestow Curse)', 'Toque vampírico',
        'Asesino fantasmal', 'Muro de fuego'
      ],
      prepared_spells: [
        // 5 Trucos (no cuentan)
        'Prestidigitación', 'Agarre electrizante', 'Rociada venenosa', 'Rayo de escarcha', 'Ilusión menor',
        // 12 Conjuros tácticos preparados
        'Escudo', 'Armadura de mago', 'Proyectil mágico', 'Manos ardientes', 'Falsa vida', 'Caída de pluma',
        'Hacer añicos', 'Arma mágica', 'Bola de fuego', 'Relámpago', 'Toque vampírico', 'Muro de fuego'
      ],
      inventory: [],
      currency: { cp: 0, sp: 5, ep: 0, gp: 605, pp: 0 }
    };

    const rules = getSpellPreparationRules(honiel);

    assert.equal(rules.isPreparedCaster, true);
    assert.equal(rules.primaryPreparationMode, 'prepared');
    assert.equal(rules.maxPreparedSpells, 12, 'Mago 7 + INT +5 debe dar exactamente 12 conjuros preparados');
    assert.equal(rules.cantrips.length, 5, 'Honiel debe tener 5 trucos conocidos');
    assert.equal(rules.currentPreparedCount, 12, 'Los 12 conjuros preparados de nivel 1+ deben contar hacia el tope');
    assert.equal(rules.canPrepareMore, false, 'Al alcanzar 12/12 no puede preparar más');
    assert.equal(rules.canCastRitualsUnprepared, true, 'El Mago puede lanzar rituales desde el Grimorio sin prepararlos');
  });

  it('verifica que los conjuros de círculo de Solaria (Círculo de las Esporas) son gratuitos y no consumen límite', () => {
    const solaria: Character = {
      id: 'char-solaria',
      name: 'Solaria Sombralba',
      slug: 'solaria',
      character_class: 'Druida (Círculo de las Esporas)',
      level: 7,
      race: 'Humana',
      background: 'Sabio',
      alignment: 'Neutral Bueno',
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
      spellcasting_ability: 'WIS',
      ability_scores: { str: 8, dex: 12, con: 10, int: 15, wis: 20, cha: 14 },
      multiclass: [
        { class: 'Druida', subclass: 'Círculo de las Esporas', level: 7 }
      ],
      known_spells: [
        'Saber druídico', 'Guía', 'Toque helado',
        'Palabra de curación', 'Curar heridas', 'Enmarañar', 'Ceguera/Sordera', 'Rayo debilitador',
        'Maremoto', 'Animar a los muertos', 'Forma gaseosa', 'Marchitar', 'Confusión'
      ],
      prepared_spells: [
        // De círculo (gratis): Ceguera/Sordera, Animar a los muertos, Forma gaseosa, Marchitar, Confusión, Rayo debilitador
        'Ceguera/Sordera', 'Animar a los muertos', 'Forma gaseosa', 'Marchitar', 'Confusión', 'Rayo debilitador',
        // De lista druídica general: Palabra de curación, Curar heridas, Enmarañar, Maremoto
        'Palabra de curación', 'Curar heridas', 'Enmarañar', 'Maremoto'
      ],
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    };

    const rules = getSpellPreparationRules(solaria);

    assert.equal(rules.maxPreparedSpells, 12, 'Druida Nv.7 + SAB +5 = 12 máx preparados');
    assert.equal(rules.currentPreparedCount, 4, 'Solo los 4 conjuros de lista general deben contar; los 6 de esporas son gratuitos');
    assert.equal(rules.canPrepareMore, true, 'Con 4/12 aún puede preparar 8 conjuros más');
    assert.ok(rules.alwaysPreparedSpells.includes('Animar a los muertos'));
  });

  it('verifica el límite de Artificiero de Alizar (⌊7/2⌋ + INT 4 = 7 máx preparados)', () => {
    const alizar: Character = {
      id: 'char-alizar',
      name: 'Alizar Thorne',
      slug: 'alizar',
      character_class: 'Artificiero (Alquimista)',
      level: 7,
      race: 'Enano',
      background: 'Artesano',
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
      ability_scores: { str: 11, dex: 12, con: 15, int: 18, wis: 19, cha: 7 },
      multiclass: [{ class: 'Artificiero', subclass: 'Alquimista', level: 7 }],
      known_spells: ['Látigo de espinas', 'Piedad con los moribundos', 'Curar heridas', 'Rayo nauseabundo', 'Esfera flamígera', 'Flecha ácida de Melf'],
      prepared_spells: ['Curar heridas', 'Rayo nauseabundo', 'Esfera flamígera', 'Flecha ácida de Melf'],
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    };

    const rules = getSpellPreparationRules(alizar);
    assert.equal(rules.maxPreparedSpells, 7, 'Artificiero 7 -> ⌊7/2⌋ + 4 = 7 máx preparados');
    // Como los 4 son conjuros de Alquimista, son siempre preparados y no consumen límite
    assert.equal(rules.currentPreparedCount, 0, 'Los 4 conjuros son de subclase y no cuentan hacia el límite');
    assert.equal(rules.canPrepareMore, true);
  });
});

describe('@segadores/dnd-core - Evaluación Reactiva de Consola de Combate e Interacción Armadura Monje', () => {
  it('evalúa la mutación de estado de Honiel: Con armadura CA 16, Vel 30, Artes Marciales desactivadas -> Sin armadura CA 14, Vel 40, Artes Marciales activas', () => {
    const baseHoniel: Character = {
      id: 'char-honiel',
      name: 'Honiel Spellbinder',
      slug: 'honiel',
      character_class: 'Mago / Monje',
      level: 9,
      race: 'Elfo Lunar',
      background: 'Sabio',
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
      ability_scores: { str: 8, dex: 16, con: 15, int: 20, wis: 13, cha: 7 },
      multiclass: [
        { class: 'Mago', subclass: 'Evocación', level: 7 },
        { class: 'Monje', level: 2 }
      ],
      known_spells: ['Prestidigitación'],
      prepared_spells: ['Escudo'],
      inventory: [
        {
          slug: 'cota-de-malla-de-mithral',
          name: 'Cota de Malla de Mithral',
          category: 'armor',
          qty: 1,
          equipped: true,
          requires_attunement: false,
          attuned: false,
          armor: { baseAc: 16, armorType: 'pesada' }
        }
      ],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    };

    // 1. ESTADO CON ARMADURA EQUIPADA
    const armoredState = evaluateCharacterState(baseHoniel);
    assert.equal(armoredState.effectiveAc, 16, 'Con Cota de Malla de Mithral equipada, la CA debe ser 16 fija');
    assert.equal(armoredState.effectiveSpeed, 30, 'Con armadura, la velocidad debe ser 30 pies (sin bono de movimiento sin armadura)');
    assert.equal(armoredState.availability.martial_arts.available, false, 'Artes marciales deben quedar bloqueadas');
    assert.equal(armoredState.availability.unarmored_movement.available, false, 'Movimiento sin armadura debe quedar bloqueado');
    assert.ok(armoredState.tacticalReminders.some(r => r.includes('Puntos de Ki')), 'Ki debe seguir activo');

    // 2. MUTACIÓN DE ESTADO: DESEQUIPAR ARMADURA EN INVENTARIO
    const unarmoredHoniel: Character = {
      ...baseHoniel,
      inventory: baseHoniel.inventory.map(item => ({ ...item, equipped: false }))
    };

    const unarmoredState = evaluateCharacterState(unarmoredHoniel);

    // Verificación de fórmulas matemáticas canónicas
    // Defensa sin armadura: 10 + DES (+3) + SAB (+1) = 14
    assert.equal(unarmoredState.effectiveAc, 14, 'Sin armadura, la CA de Honiel debe ser 10 + DES (3) + SAB (1) = 14');
    // Movimiento sin armadura: 30 + 10 = 40 pies
    assert.equal(unarmoredState.effectiveSpeed, 40, 'Sin armadura, la velocidad de Honiel debe subir a 40 pies (+10 pies)');
    assert.equal(unarmoredState.availability.martial_arts.available, true, 'Artes marciales deben habilitarse');
    assert.equal(unarmoredState.availability.unarmored_movement.available, true, 'Movimiento sin armadura debe habilitarse');
    assert.ok(unarmoredState.tacticalReminders.some(r => r.includes('Artes Marciales')), 'Debe avisar que Artes Marciales están activas');
  });
});
