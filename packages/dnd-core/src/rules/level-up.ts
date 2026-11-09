import type {
  Character,
  MulticlassEntry,
  ClassResource,
  SkillsMap,
  SkillEntry,
  SpellcastingStat
} from '../types/character.ts';
import type { SpellSlotPool } from '../types/spells.ts';
import {
  calculateAbilityModifier,
  calculateProficiencyBonus
} from './abilities.ts';
import {
  calculateMulticlassLevelUpCost,
  calculateMulticlassCasterLevel,
  getMulticlassSpellSlots,
  type MulticlassXpCostResult
} from './multiclass.ts';

/**
 * Clases canónicas soportadas en SegadoresDnD y D&D 5.5e (SRD 5.2.1).
 */
export const CANONICAL_CLASSES = [
  'Mago',
  'Monje',
  'Guerrero',
  'Paladín',
  'Artífice',
  'Druida',
  'Pícaro',
  'Bardo',
  'Clérigo',
  'Hechicero',
  'Brujo',
  'Explorador',
  'Bárbaro'
] as const;

export type CanonicalClassName = typeof CANONICAL_CLASSES[number];

export interface HitDieInfo {
  die: 'd6' | 'd8' | 'd10' | 'd12';
  dieValue: number;
  avgHp: number;
}

export const CLASS_HIT_DICE: Record<string, HitDieInfo> = {
  Mago: { die: 'd6', dieValue: 6, avgHp: 4 },
  Hechicero: { die: 'd6', dieValue: 6, avgHp: 4 },
  Monje: { die: 'd8', dieValue: 8, avgHp: 5 },
  Bardo: { die: 'd8', dieValue: 8, avgHp: 5 },
  Clérigo: { die: 'd8', dieValue: 8, avgHp: 5 },
  Druida: { die: 'd8', dieValue: 8, avgHp: 5 },
  Pícaro: { die: 'd8', dieValue: 8, avgHp: 5 },
  Artífice: { die: 'd8', dieValue: 8, avgHp: 5 },
  Artificiero: { die: 'd8', dieValue: 8, avgHp: 5 },
  Brujo: { die: 'd8', dieValue: 8, avgHp: 5 },
  Guerrero: { die: 'd10', dieValue: 10, avgHp: 6 },
  Paladín: { die: 'd10', dieValue: 10, avgHp: 6 },
  Explorador: { die: 'd10', dieValue: 10, avgHp: 6 },
  Bárbaro: { die: 'd12', dieValue: 12, avgHp: 7 }
};

export interface ClassFeature {
  name: string;
  description: string;
  level: number;
  className: string;
  type?: 'action' | 'bonus_action' | 'reaction' | 'passive' | 'spellcasting' | 'asi';
}

/**
 * Rasgos canónicos esenciales por clase y nivel (SRD 5.1 / 5.2.1 + Reglas de Campaña).
 */
export const CLASS_FEATURES_BY_LEVEL: Record<string, Record<number, ClassFeature[]>> = {
  Monje: {
    1: [
      { name: 'Artes Marciales (d4)', description: 'Puedes usar Destreza para ataques desarmados y con armas de monje. Puedes hacer un ataque desarmado como acción adicional.', level: 1, className: 'Monje', type: 'bonus_action' },
      { name: 'Defensa sin Armadura', description: 'Cuando no lleves armadura ni escudo, tu CA es 10 + mod. Destreza + mod. Sabiduría.', level: 1, className: 'Monje', type: 'passive' }
    ],
    2: [
      { name: 'Puntos de Ki (2)', description: 'Canalizas la energía mística del Ki. Tienes tantos puntos de Ki como tu nivel de monje, recuperables en descanso corto o largo.', level: 2, className: 'Monje', type: 'passive' },
      { name: 'Ráfaga de Golpes (Flurry of Blows)', description: 'Inmediatamente después de hacer una acción de Ataque, puedes gastar 1 Ki para realizar dos ataques desarmados como acción adicional.', level: 2, className: 'Monje', type: 'bonus_action' },
      { name: 'Defensa Paciente (Patient Defense)', description: 'Puedes gastar 1 punto de Ki para realizar la acción de Esquivar como acción adicional en tu turno.', level: 2, className: 'Monje', type: 'bonus_action' },
      { name: 'Paso del Viento (Step of the Wind)', description: 'Puedes gastar 1 punto de Ki para Destrabarte o Correr como acción adicional, y tu distancia de salto se duplica.', level: 2, className: 'Monje', type: 'bonus_action' },
      { name: 'Movimiento sin Armadura (+10 pies)', description: 'Tu velocidad incrementa en +10 pies mientras no lleves armadura ni escudo.', level: 2, className: 'Monje', type: 'passive' }
    ],
    3: [
      { name: 'Tradición Monástica (Subclase)', description: 'Eliges una orden monástica (ej. Mano Abierta, Sombra, Cuatro Elementos) que te confiere técnicas secretas.', level: 3, className: 'Monje', type: 'passive' },
      { name: 'Desviar Proyectiles', description: 'Puedes usar tu reacción para atrapar o reducir el daño de un proyectil a distancia en 1d10 + DES + nivel de monje.', level: 3, className: 'Monje', type: 'reaction' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Monje', type: 'asi' },
      { name: 'Caída Lenta', description: 'Reduce el daño por caída en una cantidad igual a 5 veces tu nivel de monje usando tu reacción.', level: 4, className: 'Monje', type: 'reaction' }
    ],
    5: [
      { name: 'Ataque Adicional', description: 'Puedes atacar dos veces en lugar de una siempre que uses la acción de Ataque.', level: 5, className: 'Monje', type: 'action' },
      { name: 'Golpe Aturdidor (Stunning Strike)', description: 'Cuando golpeas a una criatura con un ataque de arma cuerpo a cuerpo, puedes gastar 1 Ki para forzar una TS CON o queda aturdida hasta el final de tu siguiente turno.', level: 5, className: 'Monje', type: 'action' },
      { name: 'Artes Marciales (d6)', description: 'El dado de daño de tus golpes desarmados y armas de monje asciende a 1d6.', level: 5, className: 'Monje', type: 'passive' }
    ],
    6: [
      { name: 'Golpes Imbuidos de Ki', description: 'Tus ataques desarmados cuentan como mágicos para superar resistencias e inmunidades.', level: 6, className: 'Monje', type: 'passive' },
      { name: 'Movimiento sin Armadura (+15 pies)', description: 'Tu bono de velocidad sin armadura sube a +15 pies.', level: 6, className: 'Monje', type: 'passive' }
    ],
    7: [
      { name: 'Evasión', description: 'Cuando superas una TS de Destreza para reducir el daño a la mitad, no recibes daño; si fallas, solo la mitad.', level: 7, className: 'Monje', type: 'passive' },
      { name: 'Mente en Calma', description: 'Puedes usar tu acción para finalizar un efecto sobre ti que te esté Hechizando o Asustando.', level: 7, className: 'Monje', type: 'action' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Monje', type: 'asi' }
    ],
    9: [
      { name: 'Mejora de Movimiento sin Armadura', description: 'Ganas la habilidad de moverte a lo largo de superficies verticales y a través de líquidos en tu turno sin caer.', level: 9, className: 'Monje', type: 'passive' }
    ],
    10: [
      { name: 'Pureza Corporal', description: 'Tu dominio del Ki te hace inmune a las enfermedades y al veneno.', level: 10, className: 'Monje', type: 'passive' },
      { name: 'Movimiento sin Armadura (+20 pies)', description: 'Tu bono de velocidad sin armadura sube a +20 pies.', level: 10, className: 'Monje', type: 'passive' }
    ],
    11: [
      { name: 'Rasgo de Tradición Monástica', description: 'Desbloqueas el rasgo avanzado de tu subclase.', level: 11, className: 'Monje', type: 'passive' },
      { name: 'Artes Marciales (d8)', description: 'El dado de daño de tus golpes desarmados asciende a 1d8.', level: 11, className: 'Monje', type: 'passive' }
    ],
    12: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 12, className: 'Monje', type: 'asi' }
    ],
    13: [
      { name: 'Lengua del Sol y la Luna', description: 'Aprendes a tocar el Ki de otras mentes para comprender todos los idiomas hablados.', level: 13, className: 'Monje', type: 'passive' }
    ],
    14: [
      { name: 'Alma de Diamante', description: 'Tu maestría del Ki te otorga competencia en todas las tiradas de salvación. Además, puedes gastar 1 Ki para repetir una tirada de salvación fallida.', level: 14, className: 'Monje', type: 'passive' },
      { name: 'Movimiento sin Armadura (+25 pies)', description: 'Tu bono de velocidad sin armadura sube a +25 pies.', level: 14, className: 'Monje', type: 'passive' }
    ],
    15: [
      { name: 'Cuerpo Atemporal', description: 'Tu Ki te sostiene de tal forma que no sufres la fragilidad de la vejez ni puedes envejecer mágicamente.', level: 15, className: 'Monje', type: 'passive' }
    ],
    16: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 16, className: 'Monje', type: 'asi' }
    ],
    17: [
      { name: 'Rasgo de Tradición Monástica', description: 'Desbloqueas la técnica suprema de tu orden monástica.', level: 17, className: 'Monje', type: 'passive' },
      { name: 'Artes Marciales (d10)', description: 'El dado de daño de tus golpes desarmados asciende a 1d10.', level: 17, className: 'Monje', type: 'passive' }
    ],
    18: [
      { name: 'Cuerpo Vacío', description: 'Puedes gastar 4 puntos de Ki para volverte invisible durante 1 minuto y ganar resistencia a todo el daño excepto daño de fuerza.', level: 18, className: 'Monje', type: 'action' },
      { name: 'Movimiento sin Armadura (+30 pies)', description: 'Tu bono de velocidad sin armadura sube a +30 pies.', level: 18, className: 'Monje', type: 'passive' }
    ],
    19: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 19, className: 'Monje', type: 'asi' }
    ],
    20: [
      { name: 'Yo Perfeccionado (Perfect Self)', description: 'Al tirar iniciativa, si no te queda ningún punto de Ki, recuperas 4 puntos de Ki de inmediato.', level: 20, className: 'Monje', type: 'passive' }
    ]
  },
  Mago: {
    1: [
      { name: 'Lanzamiento de Conjuros Arcanos', description: 'Conoces trucos y preparas conjuros de tu libro de conjuros utilizando Inteligencia.', level: 1, className: 'Mago', type: 'spellcasting' },
      { name: 'Recuperación Arcana', description: 'Una vez al día tras un descanso corto, puedes recuperar espacios de conjuro gastados con un nivel combinado de hasta la mitad de tu nivel de mago.', level: 1, className: 'Mago', type: 'passive' }
    ],
    2: [
      { name: 'Tradición Arcana (Subclase)', description: 'Eliges una escuela de magia (ej. Evocación, Abjuración, Nigromancia) que moldea tus investigaciones.', level: 2, className: 'Mago', type: 'passive' }
    ],
    3: [
      { name: 'Conjuros de Nivel 2', description: 'Acceso a espacios de conjuro de nivel 2 y aprendizaje de nuevos conjuros arcanos.', level: 3, className: 'Mago', type: 'spellcasting' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Mago', type: 'asi' },
      { name: 'Truco Adicional', description: 'Aprendes un truco adicional de la lista de mago.', level: 4, className: 'Mago', type: 'spellcasting' }
    ],
    5: [
      { name: 'Conjuros de Nivel 3', description: 'Acceso a espacios de conjuro de nivel 3 (Bola de Fuego, Contrahechizo, etc.).', level: 5, className: 'Mago', type: 'spellcasting' }
    ],
    6: [
      { name: 'Rasgo de Tradición Arcana', description: 'Desbloqueas un nuevo poder de tu escuela de magia.', level: 6, className: 'Mago', type: 'passive' }
    ],
    7: [
      { name: 'Conjuros de Nivel 4', description: 'Acceso a espacios de conjuro de nivel 4.', level: 7, className: 'Mago', type: 'spellcasting' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Mago', type: 'asi' }
    ],
    9: [
      { name: 'Conjuros de Nivel 5', description: 'Acceso a espacios de conjuro de nivel 5.', level: 9, className: 'Mago', type: 'spellcasting' }
    ],
    10: [
      { name: 'Rasgo de Tradición Arcana', description: 'Poder avanzado de tu escuela de magia.', level: 10, className: 'Mago', type: 'passive' },
      { name: 'Truco Adicional', description: 'Aprendes un truco adicional de mago.', level: 10, className: 'Mago', type: 'spellcasting' }
    ],
    11: [
      { name: 'Conjuros de Nivel 6', description: 'Acceso a espacios de conjuro de nivel 6.', level: 11, className: 'Mago', type: 'spellcasting' }
    ],
    12: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 12, className: 'Mago', type: 'asi' }
    ],
    13: [
      { name: 'Conjuros de Nivel 7', description: 'Acceso a espacios de conjuro de nivel 7.', level: 13, className: 'Mago', type: 'spellcasting' }
    ],
    14: [
      { name: 'Rasgo de Tradición Arcana Maestro', description: 'Rasgo cumbre de tu escuela de magia.', level: 14, className: 'Mago', type: 'passive' }
    ],
    15: [
      { name: 'Conjuros de Nivel 8', description: 'Acceso a espacios de conjuro de nivel 8.', level: 15, className: 'Mago', type: 'spellcasting' }
    ],
    16: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 16, className: 'Mago', type: 'asi' }
    ],
    17: [
      { name: 'Conjuros de Nivel 9', description: 'Acceso a los conjuros más poderosos del multiverso (Deseo, Parar el Tiempo, etc.).', level: 17, className: 'Mago', type: 'spellcasting' }
    ],
    18: [
      { name: 'Maestría en Conjuros (Spell Mastery)', description: 'Eliges un conjuro de nivel 1 y uno de nivel 2 para lanzarlos a voluntad sin gastar espacios de conjuro.', level: 18, className: 'Mago', type: 'spellcasting' }
    ],
    19: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 19, className: 'Mago', type: 'asi' }
    ],
    20: [
      { name: 'Conjuros Insignia (Signature Spells)', description: 'Eliges dos conjuros de nivel 3; siempre los tienes preparados y puedes lanzar cada uno una vez a nivel 3 sin gastar espacio entre descansos cortos.', level: 20, className: 'Mago', type: 'spellcasting' }
    ]
  },
  Guerrero: {
    1: [
      { name: 'Estilo de Combate', description: 'Adoptas un estilo marcial especializado (Defensa, Duelo, Armas a dos manos, Tiro con arco, etc.).', level: 1, className: 'Guerrero', type: 'passive' },
      { name: 'Nuevas Energías (Second Wind)', description: 'En tu turno puedes usar una acción adicional para recuperar 1d10 + nivel de guerrero PG. Se recarga en descanso corto o largo.', level: 1, className: 'Guerrero', type: 'bonus_action' }
    ],
    2: [
      { name: 'Acción Súbita (Action Surge)', description: 'Puedes realizar una acción adicional en tu turno. Se recarga tras un descanso corto o largo.', level: 2, className: 'Guerrero', type: 'action' }
    ],
    3: [
      { name: 'Arquetipo Marcial (Subclase)', description: 'Eliges tu arquetipo (Campeón, Maestro de la Batalla, Caballero Arcano).', level: 3, className: 'Guerrero', type: 'passive' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Guerrero', type: 'asi' }
    ],
    5: [
      { name: 'Ataque Adicional', description: 'Puedes atacar dos veces en tu acción de Ataque.', level: 5, className: 'Guerrero', type: 'action' }
    ],
    6: [
      { name: 'Mejora de Característica / Dote Adicional', description: 'El guerrero obtiene una mejora de característica adicional.', level: 6, className: 'Guerrero', type: 'asi' }
    ],
    7: [
      { name: 'Rasgo de Arquetipo Marcial', description: 'Desbloqueas un rasgo avanzado de tu subclase.', level: 7, className: 'Guerrero', type: 'passive' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Guerrero', type: 'asi' }
    ],
    9: [
      { name: 'Indómito (1 uso)', description: 'Puedes repetir una tirada de salvación fallida una vez por descanso largo.', level: 9, className: 'Guerrero', type: 'reaction' }
    ],
    10: [
      { name: 'Rasgo de Arquetipo Marcial', description: 'Técnica perfeccionada de arquetipo.', level: 10, className: 'Guerrero', type: 'passive' }
    ],
    11: [
      { name: 'Ataque Adicional (2)', description: 'Puedes atacar tres veces con una sola acción de Ataque.', level: 11, className: 'Guerrero', type: 'action' }
    ],
    12: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 12, className: 'Guerrero', type: 'asi' }
    ],
    13: [
      { name: 'Indómito (2 usos)', description: 'Ganas un segundo uso de Indómito entre descansos largos.', level: 13, className: 'Guerrero', type: 'reaction' }
    ],
    14: [
      { name: 'Mejora de Característica / Dote Adicional', description: 'Mejora de característica adicional de guerrero.', level: 14, className: 'Guerrero', type: 'asi' }
    ],
    15: [
      { name: 'Rasgo de Arquetipo Marcial', description: 'Poder superior de tu arquetipo.', level: 15, className: 'Guerrero', type: 'passive' }
    ],
    16: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 16, className: 'Guerrero', type: 'asi' }
    ],
    17: [
      { name: 'Acción Súbita (2 usos)', description: 'Puedes usar Acción Súbita dos veces entre descansos.', level: 17, className: 'Guerrero', type: 'action' },
      { name: 'Indómito (3 usos)', description: 'Ganas un tercer uso de Indómito.', level: 17, className: 'Guerrero', type: 'reaction' }
    ],
    18: [
      { name: 'Rasgo de Arquetipo Marcial Supremo', description: 'Rasgo cumbre de tu arquetipo.', level: 18, className: 'Guerrero', type: 'passive' }
    ],
    19: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 19, className: 'Guerrero', type: 'asi' }
    ],
    20: [
      { name: 'Ataque Adicional (3)', description: 'Puedes atacar cuatro veces con una sola acción de Ataque.', level: 20, className: 'Guerrero', type: 'action' }
    ]
  },
  Paladín: {
    1: [
      { name: 'Sentidos Divinos', description: 'Detectas la presencia de celestiales, infernales y muertos vivientes.', level: 1, className: 'Paladín', type: 'action' },
      { name: 'Imposición de Manos', description: 'Posees una reserva de energía curativa igual a tu nivel de paladín × 5 PG por descanso largo.', level: 1, className: 'Paladín', type: 'action' }
    ],
    2: [
      { name: 'Estilo de Combate', description: 'Especialización marcial defensiva u ofensiva.', level: 2, className: 'Paladín', type: 'passive' },
      { name: 'Lanzamiento de Conjuros Divinos', description: 'Preparas conjuros de la lista de paladín usando Carisma.', level: 2, className: 'Paladín', type: 'spellcasting' },
      { name: 'Castigo Divino (Divine Smite)', description: 'Al golpear con un arma cuerpo a cuerpo, puedes gastar un espacio de conjuro para infligir 2d8 radiante (+1d8 por nivel superior).', level: 2, className: 'Paladín', type: 'passive' }
    ],
    3: [
      { name: 'Juramento Sagrado (Subclase)', description: 'Consagras tu senda con un juramento sagrado (Devoción, Venganza, Antiguos, etc.).', level: 3, className: 'Paladín', type: 'passive' },
      { name: 'Canalizar Divinidad', description: 'Canalizas energía divina para alimentar efectos mágicos de tu juramento.', level: 3, className: 'Paladín', type: 'action' },
      { name: 'Salud Divina', description: 'La magia divina que fluye por ti te hace inmune a las enfermedades.', level: 3, className: 'Paladín', type: 'passive' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Paladín', type: 'asi' }
    ],
    5: [
      { name: 'Ataque Adicional', description: 'Puedes atacar dos veces por acción de Ataque.', level: 5, className: 'Paladín', type: 'action' }
    ],
    6: [
      { name: 'Aura de Protección', description: 'Tú y tus aliados a 10 pies sumáis vuestro modificador de Carisma a todas las tiradas de salvación.', level: 6, className: 'Paladín', type: 'passive' }
    ],
    7: [
      { name: 'Rasgo de Juramento Sagrado', description: 'Aura o beneficio especial de tu juramento.', level: 7, className: 'Paladín', type: 'passive' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Paladín', type: 'asi' }
    ],
    9: [
      { name: 'Conjuros de Nivel 3', description: 'Acceso a espacios de conjuro de nivel 3.', level: 9, className: 'Paladín', type: 'spellcasting' }
    ],
    10: [
      { name: 'Aura de Valor', description: 'Tú y tus aliados a 10 pies no podéis ser Asustados mientras estés consciente.', level: 10, className: 'Paladín', type: 'passive' }
    ],
    11: [
      { name: 'Castigo Divino Mejorado', description: 'Tus golpes cuerpo a cuerpo con armas infligen automáticamente 1d8 radiante adicional.', level: 11, className: 'Paladín', type: 'passive' }
    ],
    12: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 12, className: 'Paladín', type: 'asi' }
    ],
    13: [
      { name: 'Conjuros de Nivel 4', description: 'Acceso a espacios de conjuro de nivel 4.', level: 13, className: 'Paladín', type: 'spellcasting' }
    ],
    14: [
      { name: 'Toque Purificador', description: 'Puedes usar tu acción para finalizar un conjuro sobre ti o sobre una criatura voluntaria un número de veces igual a tu Carisma.', level: 14, className: 'Paladín', type: 'action' }
    ],
    15: [
      { name: 'Rasgo de Juramento Sagrado Avanzado', description: 'Defensa o poder especial de tu juramento.', level: 15, className: 'Paladín', type: 'passive' }
    ],
    16: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 16, className: 'Paladín', type: 'asi' }
    ],
    17: [
      { name: 'Conjuros de Nivel 5', description: 'Acceso a espacios de conjuro de nivel 5.', level: 17, className: 'Paladín', type: 'spellcasting' }
    ],
    18: [
      { name: 'Auras Mejoradas (30 pies)', description: 'El alcance de todas tus auras divinas se expande a 30 pies.', level: 18, className: 'Paladín', type: 'passive' }
    ],
    19: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 19, className: 'Paladín', type: 'asi' }
    ],
    20: [
      { name: 'Campeón Sagrado', description: 'Te transformas en el avatar definitivo de tu juramento durante 1 minuto por descanso largo.', level: 20, className: 'Paladín', type: 'action' }
    ]
  },
  Artífice: {
    1: [
      { name: 'Bricolaje Mágico (Magical Tinkering)', description: 'Imbuyes objetos diminutos mundanos con propiedades sensoriales mágicas.', level: 1, className: 'Artífice', type: 'action' },
      { name: 'Lanzamiento de Conjuros', description: 'Lanzas conjuros mediante herramientas artesanas utilizando Inteligencia.', level: 1, className: 'Artífice', type: 'spellcasting' }
    ],
    2: [
      { name: 'Infundir Objeto (Infusions)', description: 'Aprendes a imbuir objetos ordinarios con infusiones mágicas de artífice.', level: 2, className: 'Artífice', type: 'passive' }
    ],
    3: [
      { name: 'Especialista de Artífice (Subclase)', description: 'Eliges tu especialidad (Alquimista, Armero, Artillero, Herrero de Batalla).', level: 3, className: 'Artífice', type: 'passive' },
      { name: 'La Herramienta Adecuada para el Trabajo', description: 'Puedes crear mágicamente un conjunto de herramientas de artesano con 1 hora de trabajo.', level: 3, className: 'Artífice', type: 'action' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Artífice', type: 'asi' }
    ],
    5: [
      { name: 'Rasgo de Especialista', description: 'Desbloqueas un poder ofensivo o de apoyo de tu especialidad.', level: 5, className: 'Artífice', type: 'passive' }
    ],
    6: [
      { name: 'Pericia con Herramientas', description: 'Tu bonificador de competencia se duplica para cualquier prueba de característica con herramientas.', level: 6, className: 'Artífice', type: 'passive' }
    ],
    7: [
      { name: 'Golpe de Genio (Flash of Genius)', description: 'Como reacción cuando tú o una criatura a 30 pies hagáis una tirada o salvación, sumas tu Inteligencia a la tirada.', level: 7, className: 'Artífice', type: 'reaction' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Artífice', type: 'asi' }
    ],
    9: [
      { name: 'Rasgo de Especialista Avanzado', description: 'Mejora de tus creaciones de subclase.', level: 9, className: 'Artífice', type: 'passive' }
    ],
    10: [
      { name: 'Adepto de Objetos Mágicos', description: 'Puedes sintonizarte con hasta 4 objetos mágicos a la vez.', level: 10, className: 'Artífice', type: 'passive' }
    ],
    11: [
      { name: 'Objeto Guardaconjuros', description: 'Almacenas un conjuro de nivel 1 o 2 en un arma o foco para lanzarlo hasta el doble de tu Inteligencia de veces.', level: 11, className: 'Artífice', type: 'action' }
    ],
    12: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 12, className: 'Artífice', type: 'asi' }
    ],
    13: [
      { name: 'Conjuros de Nivel 4', description: 'Acceso a espacios de conjuro de nivel 4.', level: 13, className: 'Artífice', type: 'spellcasting' }
    ],
    14: [
      { name: 'Sabio de Objetos Mágicos', description: 'Puedes sintonizarte con hasta 5 objetos mágicos a la vez e ignoras requisitos de clase/raza.', level: 14, className: 'Artífice', type: 'passive' }
    ],
    15: [
      { name: 'Rasgo Supremo de Especialista', description: 'Poder cumbre de tu especialidad.', level: 15, className: 'Artífice', type: 'passive' }
    ],
    16: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 16, className: 'Artífice', type: 'asi' }
    ],
    17: [
      { name: 'Conjuros de Nivel 5', description: 'Acceso a espacios de conjuro de nivel 5.', level: 17, className: 'Artífice', type: 'spellcasting' }
    ],
    18: [
      { name: 'Maestro de Objetos Mágicos', description: 'Puedes sintonizarte con hasta 6 objetos mágicos a la vez.', level: 18, className: 'Artífice', type: 'passive' }
    ],
    19: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 19, className: 'Artífice', type: 'asi' }
    ],
    20: [
      { name: 'Alma del Artificio', description: 'Ganas un +1 a todas las tiradas de salvación por cada objeto mágico al que estés sintonizado.', level: 20, className: 'Artífice', type: 'passive' }
    ]
  },
  Druida: {
    1: [
      { name: 'Druídico', description: 'Conoces el lenguaje secreto de los druidas.', level: 1, className: 'Druida', type: 'passive' },
      { name: 'Lanzamiento de Conjuros Primitivos', description: 'Lanzas conjuros basados en Sabiduría en comunión con la naturaleza.', level: 1, className: 'Druida', type: 'spellcasting' }
    ],
    2: [
      { name: 'Forma Salvaje (Wild Shape - 2 usos)', description: 'Puedes transformarte mágicamente en una bestia que hayas visto dos veces por descanso corto o largo.', level: 2, className: 'Druida', type: 'action' },
      { name: 'Círculo Druídico (Subclase)', description: 'Eliges tu círculo (Tierra, Luna, Esporas, Estrellas, etc.).', level: 2, className: 'Druida', type: 'passive' }
    ],
    3: [
      { name: 'Conjuros de Nivel 2', description: 'Acceso a espacios de conjuro de nivel 2.', level: 3, className: 'Druida', type: 'spellcasting' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Druida', type: 'asi' },
      { name: 'Forma Salvaje Mejorada (Nado)', description: 'Tu Forma Salvaje puede adoptar bestias con velocidad de nado.', level: 4, className: 'Druida', type: 'passive' }
    ],
    5: [
      { name: 'Conjuros de Nivel 3', description: 'Acceso a espacios de conjuro de nivel 3.', level: 5, className: 'Druida', type: 'spellcasting' }
    ],
    6: [
      { name: 'Rasgo de Círculo Druídico', description: 'Desbloqueas un poder de tu círculo druídico.', level: 6, className: 'Druida', type: 'passive' }
    ],
    7: [
      { name: 'Conjuros de Nivel 4', description: 'Acceso a espacios de conjuro de nivel 4.', level: 7, className: 'Druida', type: 'spellcasting' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Druida', type: 'asi' },
      { name: 'Forma Salvaje Mejorada (Vuelo)', description: 'Tu Forma Salvaje puede adoptar bestias con velocidad de vuelo.', level: 8, className: 'Druida', type: 'passive' }
    ],
    9: [
      { name: 'Conjuros de Nivel 5', description: 'Acceso a espacios de conjuro de nivel 5.', level: 9, className: 'Druida', type: 'spellcasting' }
    ],
    10: [
      { name: 'Rasgo de Círculo Druídico', description: 'Poder avanzado de círculo.', level: 10, className: 'Druida', type: 'passive' }
    ],
    18: [
      { name: 'Cuerpo Atemporal', description: 'Por cada 10 años que pasen, tu cuerpo envejece solo 1 año.', level: 18, className: 'Druida', type: 'passive' },
      { name: 'Conjuros de Bestia', description: 'Puedes lanzar conjuros en tu Forma Salvaje.', level: 18, className: 'Druida', type: 'spellcasting' }
    ],
    20: [
      { name: 'Archidruida', description: 'Puedes usar Forma Salvaje un número ilimitado de veces.', level: 20, className: 'Druida', type: 'passive' }
    ]
  },
  Pícaro: {
    1: [
      { name: 'Pericia (Expertise)', description: 'Tu bonificador de competencia se duplica para dos habilidades elegidas.', level: 1, className: 'Pícaro', type: 'passive' },
      { name: 'Ataque Furtivo (1d6)', description: 'Una vez por turno, infliges 1d6 extra a una criatura si tienes ventaja o un aliado a 5 pies.', level: 1, className: 'Pícaro', type: 'passive' },
      { name: 'Jerga de Ladrones', description: 'Conoces los dialectos y signos secretos de los bajos fondos.', level: 1, className: 'Pícaro', type: 'passive' }
    ],
    2: [
      { name: 'Acción Astuta (Cunning Action)', description: 'Puedes Correr, Destrabarte o Esconderte como acción adicional en tu turno.', level: 2, className: 'Pícaro', type: 'bonus_action' }
    ],
    3: [
      { name: 'Arquetipo de Pícaro (Subclase)', description: 'Eliges tu arquetipo (Ladrón, Asesino, Embaucador Arcano, etc.).', level: 3, className: 'Pícaro', type: 'passive' },
      { name: 'Ataque Furtivo (2d6)', description: 'El daño de tu ataque furtivo asciende a 2d6.', level: 3, className: 'Pícaro', type: 'passive' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Pícaro', type: 'asi' }
    ],
    5: [
      { name: 'Evasión Extraordinaria (Uncanny Dodge)', description: 'Como reacción, reduces a la mitad el daño de un ataque que te impacte y puedas ver.', level: 5, className: 'Pícaro', type: 'reaction' },
      { name: 'Ataque Furtivo (3d6)', description: 'El daño de tu ataque furtivo asciende a 3d6.', level: 5, className: 'Pícaro', type: 'passive' }
    ],
    6: [
      { name: 'Pericia Adicional', description: 'Eliges dos habilidades adicionales para duplicar tu bonificador de competencia.', level: 6, className: 'Pícaro', type: 'passive' }
    ],
    7: [
      { name: 'Evasión', description: 'En tiradas de salvación de Destreza, no recibes daño si tienes éxito y la mitad si fallas.', level: 7, className: 'Pícaro', type: 'passive' },
      { name: 'Ataque Furtivo (4d6)', description: 'El daño de tu ataque furtivo asciende a 4d6.', level: 7, className: 'Pícaro', type: 'passive' }
    ],
    8: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 8, className: 'Pícaro', type: 'asi' }
    ],
    9: [
      { name: 'Ataque Furtivo (5d6)', description: 'El daño de tu ataque furtivo asciende a 5d6.', level: 9, className: 'Pícaro', type: 'passive' }
    ],
    10: [
      { name: 'Mejora de Característica / Dote Adicional', description: 'El pícaro obtiene una mejora adicional en nivel 10.', level: 10, className: 'Pícaro', type: 'asi' }
    ],
    11: [
      { name: 'Talento Fiable (Reliable Talent)', description: 'Cualquier tirada de d20 con una habilidad en la que seas competente no puede ser menor a 10.', level: 11, className: 'Pícaro', type: 'passive' },
      { name: 'Ataque Furtivo (6d6)', description: 'El daño de tu ataque furtivo asciende a 6d6.', level: 11, className: 'Pícaro', type: 'passive' }
    ],
    20: [
      { name: 'Golpe de Suerte (Stroke of Luck)', description: 'Si fallas un ataque o prueba de habilidad, puedes tratar la tirada como un 20.', level: 20, className: 'Pícaro', type: 'action' }
    ]
  },
  Bardo: {
    1: [
      { name: 'Lanzamiento de Conjuros Bárdicos', description: 'Lanzas conjuros mediante música y palabras mágicas utilizando Carisma.', level: 1, className: 'Bardo', type: 'spellcasting' },
      { name: 'Inspiración Bárdica (d6)', description: 'Otorga un d6 de inspiración a un aliado como acción adicional (usos = Carisma).', level: 1, className: 'Bardo', type: 'bonus_action' }
    ],
    2: [
      { name: 'Aprendiz de Mucho (Jack of All Trades)', description: 'Sumas la mitad de tu competencia a cualquier prueba de habilidad en la que no seas competente.', level: 2, className: 'Bardo', type: 'passive' },
      { name: 'Canción de Descanso (d6)', description: 'Tú y tus aliados recuperáis 1d6 PG adicionales al gastar dados de golpe en descanso corto.', level: 2, className: 'Bardo', type: 'passive' }
    ],
    3: [
      { name: 'Colegio Bárdico (Subclase)', description: 'Eliges tu colegio (Sabiduría, Valor, Espadas, Elocuencia, etc.).', level: 3, className: 'Bardo', type: 'passive' },
      { name: 'Pericia (Expertise)', description: 'Duplicas la competencia en 2 habilidades.', level: 3, className: 'Bardo', type: 'passive' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Bardo', type: 'asi' }
    ],
    5: [
      { name: 'Fuente de Inspiración (Font of Inspiration)', description: 'Recuperas tus dados de Inspiración Bárdica en descansos cortos o largos.', level: 5, className: 'Bardo', type: 'passive' },
      { name: 'Inspiración Bárdica (d8)', description: 'El dado de inspiración asciende a 1d8.', level: 5, className: 'Bardo', type: 'bonus_action' }
    ],
    10: [
      { name: 'Secretos Mágicos', description: 'Eliges dos conjuros de cualquier clase y los añades a tu lista de bardo.', level: 10, className: 'Bardo', type: 'spellcasting' },
      { name: 'Inspiración Bárdica (d10)', description: 'El dado de inspiración asciende a 1d10.', level: 10, className: 'Bardo', type: 'bonus_action' }
    ],
    20: [
      { name: 'Inspiración Superior', description: 'Si tiras iniciativa sin usos de inspiración, recuperas uno.', level: 20, className: 'Bardo', type: 'passive' }
    ]
  },
  Clérigo: {
    1: [
      { name: 'Dominio Divino (Subclase)', description: 'Eliges el dominio de tu deidad (Vida, Luz, Guerra, Tempestad, etc.).', level: 1, className: 'Clérigo', type: 'passive' },
      { name: 'Lanzamiento de Conjuros Divinos', description: 'Preparas conjuros de la lista de clérigo utilizando Sabiduría.', level: 1, className: 'Clérigo', type: 'spellcasting' }
    ],
    2: [
      { name: 'Canalizar Divinidad (1 uso)', description: 'Canalizas energía sagrada para Expulsar Muertos Vivientes y activar el poder de tu dominio.', level: 2, className: 'Clérigo', type: 'action' }
    ],
    3: [
      { name: 'Conjuros de Nivel 2', description: 'Acceso a espacios de conjuro de nivel 2.', level: 3, className: 'Clérigo', type: 'spellcasting' }
    ],
    4: [
      { name: 'Mejora de Característica / Dote', description: 'Aumenta una puntuación en +2, dos en +1, o elige una Dote.', level: 4, className: 'Clérigo', type: 'asi' }
    ],
    5: [
      { name: 'Destruir Muertos Vivientes (VD 1/2)', description: 'Cuando un muerto viviente falla la salvación contra Expulsar, es destruido al instante si su VD es 1/2 o menor.', level: 5, className: 'Clérigo', type: 'action' }
    ],
    6: [
      { name: 'Canalizar Divinidad (2 usos)', description: 'Ganas un segundo uso de Canalizar Divinidad por descanso.', level: 6, className: 'Clérigo', type: 'action' }
    ],
    10: [
      { name: 'Intervención Divina', description: 'Imploras la ayuda directa de tu dios mediante una tirada de d100.', level: 10, className: 'Clérigo', type: 'action' }
    ],
    20: [
      { name: 'Intervención Divina Garantizada', description: 'Tu petición de Intervención Divina tiene éxito automáticamente sin necesidad de tirar dados.', level: 20, className: 'Clérigo', type: 'action' }
    ]
  }
};

/**
 * Normaliza nombres de clase considerando variaciones, sinónimos e idiomas (inglés / español).
 */
export function normalizeClassName(input: string): string {
  const norm = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (norm.includes('mag') || norm.includes('wiz')) return 'Mago';
  if (norm.includes('monk') || norm.includes('monj')) return 'Monje';
  if (norm.includes('guerr') || norm.includes('fight')) return 'Guerrero';
  if (norm.includes('palad')) return 'Paladín';
  if (norm.includes('artif')) return 'Artífice';
  if (norm.includes('druid')) return 'Druida';
  if (norm.includes('picar') || norm.includes('rogu') || norm.includes('ladron')) return 'Pícaro';
  if (norm.includes('bard')) return 'Bardo';
  if (norm.includes('cler')) return 'Clérigo';
  if (norm.includes('hechic') || norm.includes('sorc')) return 'Hechicero';
  if (norm.includes('bruj') || norm.includes('warl')) return 'Brujo';
  if (norm.includes('explor') || norm.includes('rang') || norm.includes('guardabosq')) return 'Explorador';
  if (norm.includes('barbar')) return 'Bárbaro';

  return input.trim();
}

/**
 * Obtiene la información del dado de golpe de una clase.
 */
export function getClassHitDie(className: string): HitDieInfo {
  const norm = normalizeClassName(className);
  return CLASS_HIT_DICE[norm] ?? { die: 'd8', dieValue: 8, avgHp: 5 };
}

/**
 * Extrae y normaliza la lista de clases actuales de un personaje.
 */
export function getCharacterClasses(character: Character): MulticlassEntry[] {
  if (Array.isArray(character.multiclass) && character.multiclass.length > 0) {
    return character.multiclass.map(m => ({
      class: normalizeClassName(m.class),
      subclass: m.subclass,
      level: Math.max(1, Math.floor(m.level))
    }));
  }

  // Si no hay array multiclass, parsear desde character_class
  const rawClass = character.character_class || 'Aventurero';
  if (rawClass.includes('/')) {
    const parts = rawClass.split('/');
    const parsed: MulticlassEntry[] = [];
    for (const part of parts) {
      const match = part.trim().match(/^([A-Za-záéíóúÁÉÍÓÚñÑ\s]+?)\s*(\d+)$/);
      if (match) {
        parsed.push({
          class: normalizeClassName(match[1]),
          level: parseInt(match[2], 10)
        });
      }
    }
    if (parsed.length > 0) return parsed;
  }

  return [{
    class: normalizeClassName(rawClass),
    level: Math.max(1, Math.floor(character.level || 1))
  }];
}

/**
 * Identifica la clase principal (mayor nivel) del personaje.
 */
export function getPrimaryClassEntry(classes: MulticlassEntry[]): MulticlassEntry {
  if (classes.length === 0) {
    return { class: 'Aventurero', level: 1 };
  }
  let primary = classes[0];
  for (let i = 1; i < classes.length; i++) {
    if (classes[i].level > primary.level) {
      primary = classes[i];
    }
  }
  return primary;
}

/**
 * Formatea el desglose acumulado de dados de golpe (ej. '7d6 + 2d8').
 */
export function formatHitDiceTotal(classes: MulticlassEntry[]): string {
  if (classes.length === 0) return '1d8';

  const parts = classes.map(c => {
    const dieInfo = getClassHitDie(c.class);
    return `${c.level}${dieInfo.die}`;
  });

  return parts.join(' + ');
}

export interface LevelUpValidationResult {
  canLevelUp: boolean;
  targetClass: string;
  targetClassCurrentLevel: number;
  targetClassNextLevel: number;
  isNewMulticlass: boolean;
  characterTotalLevel: number;
  nextCharacterTotalLevel: number;
  currentXp: number;
  xpCost: number;
  officialRawCost: number;
  savings: number;
  isCatchUpHalfCost: boolean;
  remainingXpAfterLevelUp: number;
  missingXp: number;
  reason?: string;
}

/**
 * Valida si un personaje puede subir de nivel en una clase específica
 * considerando la regla de campaña (Catch-Up al 50%) y los PX acumulados.
 */
export function validateLevelUp(character: Character, rawTargetClass: string): LevelUpValidationResult {
  const targetClass = normalizeClassName(rawTargetClass);
  const classes = getCharacterClasses(character);
  const primary = getPrimaryClassEntry(classes);

  const existingEntry = classes.find(c => normalizeClassName(c.class) === targetClass);
  const targetClassCurrentLevel = existingEntry ? existingEntry.level : 0;
  const targetClassNextLevel = targetClassCurrentLevel + 1;
  const isNewMulticlass = !existingEntry;

  const currentTotalLevel = Math.max(1, Math.min(20, character.level || classes.reduce((sum, c) => sum + c.level, 0)));
  const nextCharacterTotalLevel = Math.min(20, currentTotalLevel + 1);

  if (currentTotalLevel >= 20) {
    return {
      canLevelUp: false,
      targetClass,
      targetClassCurrentLevel,
      targetClassNextLevel,
      isNewMulticlass,
      characterTotalLevel: currentTotalLevel,
      nextCharacterTotalLevel,
      currentXp: character.experience_points || 0,
      xpCost: 0,
      officialRawCost: 0,
      savings: 0,
      isCatchUpHalfCost: false,
      remainingXpAfterLevelUp: character.experience_points || 0,
      missingXp: 0,
      reason: 'El personaje ya ha alcanzado el nivel épico máximo (Nivel 20).'
    };
  }

  // Coste con regla de campaña al 50%
  const costResult: MulticlassXpCostResult = calculateMulticlassLevelUpCost(
    targetClassNextLevel,
    primary.level,
    currentTotalLevel
  );

  const currentXp = Math.max(0, character.experience_points || 0);
  const xpCost = costResult.xpCost;
  const missingXp = Math.max(0, xpCost - currentXp);
  const remainingXpAfterLevelUp = Math.max(0, currentXp - xpCost);
  const canLevelUp = currentXp >= xpCost;

  let reason: string | undefined;
  if (!canLevelUp) {
    reason = `Puntos de Experiencia insuficientes. Necesitas ${xpCost.toLocaleString()} PX y posees ${currentXp.toLocaleString()} PX (faltan ${missingXp.toLocaleString()} PX).`;
  }

  return {
    canLevelUp,
    targetClass,
    targetClassCurrentLevel,
    targetClassNextLevel,
    isNewMulticlass,
    characterTotalLevel: currentTotalLevel,
    nextCharacterTotalLevel,
    currentXp,
    xpCost,
    officialRawCost: costResult.officialRawCost,
    savings: costResult.savings,
    isCatchUpHalfCost: costResult.isCatchUpHalfCost,
    remainingXpAfterLevelUp,
    missingXp,
    reason
  };
}

export interface LevelUpOptions {
  hpMethod?: 'average' | 'roll' | 'manual';
  rolledHp?: number;
}

export interface LevelUpDiff {
  totalLevel: { before: number; after: number };
  classes: { before: string; after: string };
  targetClassLevel: { className: string; before: number; after: number };
  maxHp: { before: number; after: number; increase: number; method: 'average' | 'roll' | 'manual'; baseRoll: number; conMod: number };
  hitDice: { before: string; after: string };
  experiencePoints: { before: number; after: number; cost: number };
  proficiencyBonus: { before: number; after: number; increased: boolean };
  spellSlots?: {
    beforeCasterLevel: number;
    afterCasterLevel: number;
    slotsBefore: SpellSlotPool;
    slotsAfter: SpellSlotPool;
  };
  resources: Array<{
    name: string;
    beforeMax: number;
    afterMax: number;
    isNew: boolean;
  }>;
}

export interface LevelUpPreviewResult {
  validation: LevelUpValidationResult;
  updatedCharacter: Character;
  newFeatures: ClassFeature[];
  diff: LevelUpDiff;
}

/**
 * Genera una vista previa completa e inmutable del personaje tras subir de nivel.
 * No modifica el personaje original.
 */
export function previewLevelUp(
  character: Character,
  rawTargetClass: string,
  options: LevelUpOptions = {}
): LevelUpPreviewResult {
  const targetClass = normalizeClassName(rawTargetClass);
  const validation = validateLevelUp(character, targetClass);

  const classes = getCharacterClasses(character);
  const hitDieInfo = getClassHitDie(targetClass);
  const conMod = calculateAbilityModifier(character.ability_scores.con);

  // Cálculo de Puntos de Golpe (PG)
  const hpMethod = options.hpMethod ?? 'average';
  const baseRoll = (hpMethod === 'roll' || hpMethod === 'manual') && options.rolledHp !== undefined
    ? Math.max(1, Math.min(hitDieInfo.dieValue, Math.floor(options.rolledHp)))
    : hitDieInfo.avgHp;

  // Regla D&D 5e: ganancia mínima de 1 PG por nivel
  const hpIncrease = Math.max(1, baseRoll + conMod);

  // Nuevas clases actualizadas
  let updatedClasses: MulticlassEntry[];
  const existingIdx = classes.findIndex(c => normalizeClassName(c.class) === targetClass);

  if (existingIdx >= 0) {
    updatedClasses = classes.map((c, i) =>
      i === existingIdx ? { ...c, level: c.level + 1 } : { ...c }
    );
  } else {
    updatedClasses = [...classes, { class: targetClass, level: 1 }];
  }

  const newTotalLevel = Math.min(20, (character.level || 1) + 1);
  const newClassesString = updatedClasses.map(c => `${c.class} ${c.level}`).join(' / ');
  const oldHitDice = character.hit_dice_total || formatHitDiceTotal(classes);
  const newHitDice = formatHitDiceTotal(updatedClasses);

  // Bonificador de competencia
  const oldPb = character.proficiency_bonus || calculateProficiencyBonus(character.level);
  const newPb = calculateProficiencyBonus(newTotalLevel);
  const pbIncreased = newPb > oldPb;
  const pbDiff = newPb - oldPb;

  // Actualizar habilidades si el bonificador de competencia cambió
  const updatedSkills: SkillsMap = { ...character.skills };
  if (pbDiff > 0) {
    for (const [skillKey, skillVal] of Object.entries(character.skills || {})) {
      if (typeof skillVal === 'object' && skillVal !== null) {
        const prof = (skillVal as SkillEntry).proficiency;
        const multiplier = prof === 'expertise' ? 2 : prof === 'proficient' ? 1 : prof === 'half' ? 0.5 : 0;
        if (multiplier > 0) {
          const delta = Math.floor(newPb * multiplier) - Math.floor(oldPb * multiplier);
          updatedSkills[skillKey] = {
            ...skillVal,
            bonus: (skillVal as SkillEntry).bonus + delta,
            base_bonus: ((skillVal as SkillEntry).base_bonus ?? (skillVal as SkillEntry).bonus) + delta
          };
        }
      }
    }
  }

  // Actualizar CD de salvación y ataque de conjuros si subió competencia
  const updatedSpellcastingStats: SpellcastingStat[] = (character.spellcasting_stats || []).map(stat => ({
    ...stat,
    save_dc: stat.save_dc !== null ? stat.save_dc + pbDiff : null,
    attack_bonus: stat.attack_bonus !== null ? stat.attack_bonus + pbDiff : null
  }));

  // Espacios de conjuro multiclase
  const beforeCasterLevel = calculateMulticlassCasterLevel(classes);
  const afterCasterLevel = calculateMulticlassCasterLevel(updatedClasses);
  const slotsBefore = character.spell_slots || {};
  let slotsAfter: SpellSlotPool = { ...slotsBefore };

  if (afterCasterLevel > 0) {
    const rawSlots = getMulticlassSpellSlots(afterCasterLevel);
    slotsAfter = {};
    for (const [lvl, slot] of Object.entries(rawSlots)) {
      const prevUsed = slotsBefore[lvl]?.used ?? 0;
      slotsAfter[lvl] = {
        total: slot.total,
        used: Math.min(slot.total, prevUsed)
      };
    }
  }

  // Recursos de clase (ej. Ki para monje, Nuevas Energías / Acción Súbita para guerrero)
  const resourceChanges: Array<{ name: string; beforeMax: number; afterMax: number; isNew: boolean }> = [];
  const updatedResources: ClassResource[] = (character.class_resources || []).map(r => ({ ...r }));

  // Monje: Ki = nivel de monje a partir de nivel 2
  const monkClass = updatedClasses.find(c => normalizeClassName(c.class) === 'Monje');
  if (monkClass && monkClass.level >= 2) {
    const existingKiIdx = updatedResources.findIndex(r =>
      r.id.toLowerCase().includes('ki') || r.name.toLowerCase().includes('ki')
    );
    if (existingKiIdx >= 0) {
      const oldMax = updatedResources[existingKiIdx].max;
      updatedResources[existingKiIdx] = {
        ...updatedResources[existingKiIdx],
        max: monkClass.level
      };
      resourceChanges.push({
        name: updatedResources[existingKiIdx].name,
        beforeMax: oldMax,
        afterMax: monkClass.level,
        isNew: false
      });
    } else {
      updatedResources.push({
        id: 'ki_points',
        name: 'Puntos de Ki',
        max: monkClass.level,
        used: 0,
        recharge: 'short_rest',
        notes: 'Ráfaga de golpes, Defensa paciente, Paso del viento'
      });
      resourceChanges.push({
        name: 'Puntos de Ki',
        beforeMax: 0,
        afterMax: monkClass.level,
        isNew: true
      });
    }
  }

  // Guerrero: Acción Súbita a nivel 2
  const fighterClass = updatedClasses.find(c => normalizeClassName(c.class) === 'Guerrero');
  if (fighterClass && fighterClass.level >= 2) {
    const surgeIdx = updatedResources.findIndex(r =>
      r.id.toLowerCase().includes('surge') || r.name.toLowerCase().includes('súbita') || r.name.toLowerCase().includes('subita')
    );
    const targetSurgeMax = fighterClass.level >= 17 ? 2 : 1;
    if (surgeIdx >= 0) {
      if (updatedResources[surgeIdx].max !== targetSurgeMax) {
        const oldMax = updatedResources[surgeIdx].max;
        updatedResources[surgeIdx].max = targetSurgeMax;
        resourceChanges.push({
          name: updatedResources[surgeIdx].name,
          beforeMax: oldMax,
          afterMax: targetSurgeMax,
          isNew: false
        });
      }
    } else {
      updatedResources.push({
        id: 'action_surge',
        name: 'Acción Súbita (Action Surge)',
        max: targetSurgeMax,
        used: 0,
        recharge: 'short_rest',
        notes: 'Una acción adicional en tu turno'
      });
      resourceChanges.push({
        name: 'Acción Súbita',
        beforeMax: 0,
        afterMax: targetSurgeMax,
        isNew: true
      });
    }
  }

  // Paladín: Imposición de manos (nivel × 5 PG)
  const paladinClass = updatedClasses.find(c => normalizeClassName(c.class) === 'Paladín');
  if (paladinClass) {
    const lohIdx = updatedResources.findIndex(r =>
      r.id.toLowerCase().includes('manos') || r.name.toLowerCase().includes('manos')
    );
    const targetMax = paladinClass.level * 5;
    if (lohIdx >= 0) {
      const oldMax = updatedResources[lohIdx].max;
      updatedResources[lohIdx].max = targetMax;
      resourceChanges.push({
        name: updatedResources[lohIdx].name,
        beforeMax: oldMax,
        afterMax: targetMax,
        isNew: false
      });
    }
  }

  // Rasgos adquiridos en este nivel
  const classFeatureMap = CLASS_FEATURES_BY_LEVEL[targetClass] ?? {};
  const newFeatures: ClassFeature[] = classFeatureMap[validation.targetClassNextLevel] ?? [];

  // Deducción de PX
  const remainingXp = validation.remainingXpAfterLevelUp;

  // Construcción del personaje actualizado (clon inmutable)
  const updatedCharacter: Character = {
    ...character,
    level: newTotalLevel,
    character_class: newClassesString,
    multiclass: updatedClasses,
    experience_points: remainingXp,
    max_hp: character.max_hp + hpIncrease,
    current_hp: character.current_hp + hpIncrease,
    hit_dice_total: newHitDice,
    hit_dice_current: (character.hit_dice_current || 0) + 1,
    proficiency_bonus: newPb,
    passive_perception: (character.passive_perception || 10) + (pbIncreased ? pbDiff : 0),
    spell_save_dc: character.spell_save_dc !== null ? character.spell_save_dc + pbDiff : null,
    spell_attack_bonus: character.spell_attack_bonus !== null ? character.spell_attack_bonus + pbDiff : null,
    spellcasting_stats: updatedSpellcastingStats,
    skills: updatedSkills,
    spell_slots: slotsAfter,
    class_resources: updatedResources
  };

  const diff: LevelUpDiff = {
    totalLevel: {
      before: character.level,
      after: newTotalLevel
    },
    classes: {
      before: character.character_class,
      after: newClassesString
    },
    targetClassLevel: {
      className: targetClass,
      before: validation.targetClassCurrentLevel,
      after: validation.targetClassNextLevel
    },
    maxHp: {
      before: character.max_hp,
      after: updatedCharacter.max_hp,
      increase: hpIncrease,
      method: hpMethod,
      baseRoll,
      conMod
    },
    hitDice: {
      before: oldHitDice,
      after: newHitDice
    },
    experiencePoints: {
      before: character.experience_points || 0,
      after: remainingXp,
      cost: validation.xpCost
    },
    proficiencyBonus: {
      before: oldPb,
      after: newPb,
      increased: pbIncreased
    },
    spellSlots: afterCasterLevel > 0 ? {
      beforeCasterLevel,
      afterCasterLevel,
      slotsBefore,
      slotsAfter
    } : undefined,
    resources: resourceChanges
  };

  return {
    validation,
    updatedCharacter,
    newFeatures,
    diff
  };
}

/**
 * Aplica formalmente la subida de nivel validando previamente los requisitos de PX y reglas.
 * Lanza un error si no se cumplen las condiciones.
 */
export function applyLevelUp(
  character: Character,
  rawTargetClass: string,
  options: LevelUpOptions = {}
): Character {
  const preview = previewLevelUp(character, rawTargetClass, options);
  if (!preview.validation.canLevelUp) {
    throw new Error(
      preview.validation.reason ||
      `No se puede subir de nivel en ${preview.validation.targetClass}.`
    );
  }
  return preview.updatedCharacter;
}
