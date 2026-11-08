import type { ActiveEffect, MechanicalModifiers, StandardConditionId } from '../types/effects.ts';

export interface InjuryDefinition {
  table: 'A' | 'B';
  minRoll: number;
  maxRoll: number;
  id: string;
  name: string;
  description: string;
  durationOrTreatment: string;
  isBeneficialOrNeutral?: boolean;
  instantStabilize?: boolean;
  instantReviveAt1Hp?: boolean;
  instantTempHpDice?: string;
  appliesCondition?: StandardConditionId;
  modifiers?: MechanicalModifiers;
}

/**
 * Tabla A: Heridas Menores / Estrés de Combate (1d20)
 * Activación: Golpe único > 50% de PG máximos o Golpe Crítico que deje al PJ Malherido (< 50% de PG máximos).
 */
export const TABLE_A_INJURIES: InjuryDefinition[] = [
  {
    table: 'A',
    minRoll: 1,
    maxRoll: 2,
    id: 'injury-a-falta-de-aire',
    name: 'Falta de Aire',
    description: 'El impacto te saca el aire de los pulmones. No puedes usar Reacciones hasta el final de tu próximo turno.',
    durationOrTreatment: 'Se recupera automáticamente al final de tu próximo turno.',
    modifiers: {
      blocksReactions: true
    }
  },
  {
    table: 'A',
    minRoll: 3,
    maxRoll: 4,
    id: 'injury-a-brazo-entumecido',
    name: 'Brazo Entumecido',
    description: 'El impacto adormece tu brazo dominante o del escudo. Tienes Desventaja en tu próxima tirada de ataque con arma o pierdes el bono de escudo (-1 CA).',
    durationOrTreatment: 'Dura 1 asalto o requiere gastar una Acción Adicional para reajustar el agarre.',
    modifiers: {
      disadvantageOnAttacks: true
    }
  },
  {
    table: 'A',
    minRoll: 5,
    maxRoll: 6,
    id: 'injury-a-vision-borrosa',
    name: 'Visión Borrosa',
    description: 'Sangre o sudor cae sobre tus ojos. Tienes Desventaja en pruebas de Percepción basadas en la vista y en ataques a más de 30 pies.',
    durationOrTreatment: 'Requiere gastar una Acción para limpiarse el rostro o un Descanso Corto.',
    modifiers: {
      disadvantageOnPerceptionSight: true,
      disadvantageOnRangedOver30Ft: true
    }
  },
  {
    table: 'A',
    minRoll: 7,
    maxRoll: 8,
    id: 'injury-a-corte-abierto',
    name: 'Corte Abierto (Sangrado)',
    description: 'Una herida sangrante te hace perder 1d4 PG cortantes al inicio de cada uno de tus turnos.',
    durationOrTreatment: 'Requiere una Acción para vendarse o recibir cualquier curación mágica (mínimo 1 PG).'
  },
  {
    table: 'A',
    minRoll: 9,
    maxRoll: 10,
    id: 'injury-a-tobillo-dislocado',
    name: 'Tobillo Dislocado / Cojera Leve',
    description: 'Un mal apoyo tras el golpe reduce tu velocidad al caminar en 10 pies.',
    durationOrTreatment: 'Se recupera tras un Descanso Corto o una prueba de Medicina CD 10.',
    modifiers: {
      speedBonus: -10
    }
  },
  {
    table: 'A',
    minRoll: 11,
    maxRoll: 12,
    id: 'injury-a-zumbido-ensordecedor',
    name: 'Zumbido Ensordecedor',
    description: 'La violencia del impactocerca de tu cabeza te deja Ensordecido temporalmente.',
    durationOrTreatment: 'Termina al final de tu próximo turno.',
    appliesCondition: 'ensordecido'
  },
  {
    table: 'A',
    minRoll: 13,
    maxRoll: 14,
    id: 'injury-a-costillas-fisuradas',
    name: 'Costillas Fisuradas',
    description: 'Un dolor punzante en el torso te impone Desventaja en pruebas de Fuerza (Atletismo).',
    durationOrTreatment: 'Termina tras un Descanso Corto o al recibir curación mágica.'
  },
  {
    table: 'A',
    minRoll: 15,
    maxRoll: 16,
    id: 'injury-a-defensas-abolladas',
    name: 'Defensas Abolladas',
    description: 'Una correa de tu armadura o escudo se rompe o abolla por el golpe, reduciendo tu CA en -1.',
    durationOrTreatment: 'Requiere reparación durante un Descanso Corto con herramientas de herrero o peletero.',
    modifiers: {
      acBonus: -1
    }
  },
  {
    table: 'A',
    minRoll: 17,
    maxRoll: 18,
    id: 'injury-a-perdida-de-equilibrio',
    name: 'Pérdida de Equilibrio',
    description: 'La fuerza bruta del impacto te hace caer Derribado (Tumbado) inmediatamente.',
    durationOrTreatment: 'Levantarse cuesta la mitad de tu velocidad en tu turno.',
    appliesCondition: 'derribado'
  },
  {
    table: 'A',
    minRoll: 19,
    maxRoll: 19,
    id: 'injury-a-magulladura-superficial',
    name: 'Magulladura Superficial (En el Filo)',
    description: 'Aprietas los dientes y absorbes el castigo sin sufrir penalizadores adicionales.',
    durationOrTreatment: 'Sin efecto mecánico negativo.',
    isBeneficialOrNeutral: true
  },
  {
    table: 'A',
    minRoll: 20,
    maxRoll: 20,
    id: 'injury-a-adrenalina-pura',
    name: '¡Adrenalina Pura! (20 Natural)',
    description: 'El dolor despierta tu instinto de supervivencia: ganas 1d6 Puntos de Golpe Temporales inmediatamente.',
    durationOrTreatment: 'Efecto positivo inmediato.',
    isBeneficialOrNeutral: true,
    instantTempHpDice: '1d6'
  }
];

/**
 * Tabla B: Heridas Graves y Persistentes (1d20)
 * Activación: Caer a 0 PG o fallar una Salvación de Muerte por 5 o más (resultado <= 5).
 */
export const TABLE_B_INJURIES: InjuryDefinition[] = [
  {
    table: 'B',
    minRoll: 1,
    maxRoll: 1,
    id: 'injury-b-perdida-extremidad',
    name: 'Pérdida de Extremidad',
    description: 'Pierdes un brazo/mano (impide armas a dos manos o arma+escudo) o una pierna/pie (velocidad reducida a la mitad).',
    durationOrTreatment: 'Requiere Regeneración o prótesis arcana/mecánica (ej. Mano de mago marcial de artífice).',
    modifiers: {
      speedMultiplier: 0.5
    }
  },
  {
    table: 'B',
    minRoll: 2,
    maxRoll: 2,
    id: 'injury-b-perdida-ojo',
    name: 'Pérdida de un Ojo',
    description: 'Tienes Desventaja permanente en pruebas de Percepción basadas en la vista y en ataques a distancia a más de 30 pies.',
    durationOrTreatment: 'Requiere el conjuro Regeneración o un parche ocular arcano.',
    modifiers: {
      disadvantageOnPerceptionSight: true,
      disadvantageOnRangedOver30Ft: true
    }
  },
  {
    table: 'B',
    minRoll: 3,
    maxRoll: 4,
    id: 'injury-b-cicatriz-atroz',
    name: 'Cicatriz Atroz / Desfiguración',
    description: 'Una herida brutal marca tu rostro o cuello: Desventaja en Carisma (Persuasión), pero Ventaja en Carisma (Intimidación).',
    durationOrTreatment: 'Requiere curación mágica de nivel 5 o superior si se desea borrar.'
  },
  {
    table: 'B',
    minRoll: 5,
    maxRoll: 6,
    id: 'injury-b-traumatismo-craneal',
    name: 'Traumatismo Craneal Severo',
    description: 'Conmoción cerebral severa: tienes Desventaja en salvaciones de Concentración y en pruebas de Inteligencia.',
    durationOrTreatment: 'Dura 1d6 días de reposo o se cura con Restablecimiento menor / mayor.',
    modifiers: {
      disadvantageOnConcentration: true
    }
  },
  {
    table: 'B',
    minRoll: 7,
    maxRoll: 8,
    id: 'injury-b-rotura-costillas',
    name: 'Rotura Múltiple de Costillas',
    description: 'Realizar más de 1 ataque por turno o usar la acción Correr exige superar una Salvación de CON CD 12 o quedar Incapacitado por el dolor hasta tu próximo turno.',
    durationOrTreatment: 'Requiere 10 días de reposo o magia de curación de nivel 3 o superior.'
  },
  {
    table: 'B',
    minRoll: 9,
    maxRoll: 10,
    id: 'injury-b-lesion-interna',
    name: 'Lesión Interna / Hemorragia Oculta',
    description: 'Tus Puntos de Golpe Máximos se reducen a la mitad debido al daño interno.',
    durationOrTreatment: 'Requiere cirugía (Medicina CD 15 durante un Descanso Largo) o el conjuro Restablecimiento menor.',
    modifiers: {
      maxHpMultiplier: 0.5
    }
  },
  {
    table: 'B',
    minRoll: 11,
    maxRoll: 12,
    id: 'injury-b-cojera-traumatica',
    name: 'Cojera Traumática (Tendón Rasgado)',
    description: 'Tu velocidad base al caminar se reduce en 10 pies de forma persistente.',
    durationOrTreatment: 'Requiere 7 días de reposo o el conjuro Restablecimiento menor.',
    modifiers: {
      speedBonus: -10
    }
  },
  {
    table: 'B',
    minRoll: 13,
    maxRoll: 14,
    id: 'injury-b-herida-purulenta',
    name: 'Herida Purulenta (Infección)',
    description: 'Tus PG máximos se reducen en 1d6 tras cada Descanso Largo mientras la infección siga activa.',
    durationOrTreatment: 'Superar Salvación de CON CD 13 en un descanso largo, cataplasma herbal o Restablecimiento menor.'
  },
  {
    table: 'B',
    minRoll: 15,
    maxRoll: 16,
    id: 'injury-b-mandibula-partida',
    name: 'Mandíbula o Dientes Partidos',
    description: 'Hablar con claridad es doloroso: lanzar conjuros con componente Verbal (V) exige superar una Salvación de CON CD 10 o el conjuro falla.',
    durationOrTreatment: 'Dura 1d4 días o termina al recibir cualquier curación mágica.',
    modifiers: {
      verbalSpellConSaveDc: 10
    }
  },
  {
    table: 'B',
    minRoll: 17,
    maxRoll: 18,
    id: 'injury-b-cicatriz-epica',
    name: 'Cicatriz de Batalla Épica',
    description: 'Una marca de guerra honorable sin penalizador mecánico; otorga +1 en interacciones sociales con soldados, guardias o mercenarios.',
    durationOrTreatment: 'Marca permanente de honor en combate.',
    isBeneficialOrNeutral: true
  },
  {
    table: 'B',
    minRoll: 19,
    maxRoll: 19,
    id: 'injury-b-golpe-amortiguado',
    name: 'Golpe Amortiguado (En el Filo)',
    description: 'Tu armadura o amuleto desvía lo peor del impacto mortal. Caes a 0 PG inconsciente pero quedas automáticamente Estabilizado y sin herida persistente.',
    durationOrTreatment: 'Estabilización automática inmediata.',
    isBeneficialOrNeutral: true,
    instantStabilize: true
  },
  {
    table: 'B',
    minRoll: 20,
    maxRoll: 20,
    id: 'injury-b-milagro-dioses',
    name: '¡Milagro de los Dioses! (20 Natural)',
    description: 'En el umbral de la muerte, una chispa divina o heroica te hace levantarte inmediatamente con 1 Punto de Golpe, consciente y listo para actuar.',
    durationOrTreatment: 'Recuperación heroica inmediata a 1 PG.',
    isBeneficialOrNeutral: true,
    instantReviveAt1Hp: true
  }
];

/**
 * Obtiene la definición de herida para una tirada de 1d20 (1 a 20) en la Tabla A o Tabla B.
 */
export function getInjuryDetails(table: 'A' | 'B', d20Roll: number): InjuryDefinition {
  const roll = Math.max(1, Math.min(20, Math.floor(d20Roll)));
  const source = table === 'A' ? TABLE_A_INJURIES : TABLE_B_INJURIES;
  const found = source.find(item => roll >= item.minRoll && roll <= item.maxRoll);
  if (!found) {
    return source[source.length - 1];
  }
  return found;
}

/**
 * Convierte un resultado de la Tabla A o Tabla B en un objeto ActiveEffect listo para persistir en active_effects.
 * Devuelve null si el resultado es neutral/instantáneo (ej. 19 o 20 natural) y no deja una condición persistente.
 */
export function createInjuryActiveEffect(
  table: 'A' | 'B',
  d20Roll: number,
  appliedBy = 'Sistema de Heridas'
): ActiveEffect | null {
  const details = getInjuryDetails(table, d20Roll);
  if (details.isBeneficialOrNeutral) {
    return null;
  }

  return {
    id: `${details.id}-${Date.now()}`,
    name: details.name,
    type: 'injury',
    injuryTable: table,
    injuryRoll: Math.max(1, Math.min(20, Math.floor(d20Roll))),
    conditionId: details.appliesCondition,
    description: details.description,
    treatment: details.durationOrTreatment,
    applied_by: appliedBy,
    created_at: new Date().toISOString(),
    modifiers: details.modifiers ? { ...details.modifiers } : undefined
  };
}

export interface InjuryTriggerInput {
  damageTaken: number;
  maxHp: number;
  currentHpAfterDamage: number;
  isCriticalHit?: boolean;
  deathSaveRoll?: number | null;
}

export interface InjuryTriggerEvaluation {
  shouldRollTableA: boolean;
  shouldRollTableB: boolean;
  reason: string | null;
}

/**
 * Evalúa si un impacto o salvación de muerte dispara una tirada en la Tabla A o en la Tabla B.
 * - Tabla B tiene prioridad si el PJ cae a 0 PG o falla una salvación de muerte con 5 o menos.
 * - Tabla A se dispara si el PJ sigue en pie (> 0 PG) pero sufrió > 50% de sus PG máximos de un solo golpe
 *   o recibió un crítico quedando Malherido (< 50% de sus PG máximos).
 */
export function evaluateInjuryTrigger(input: InjuryTriggerInput): InjuryTriggerEvaluation {
  if (input.deathSaveRoll !== undefined && input.deathSaveRoll !== null && input.deathSaveRoll <= 5) {
    return {
      shouldRollTableA: false,
      shouldRollTableB: true,
      reason: `Salvación de muerte fallida por 5 o más (tirada: ${input.deathSaveRoll}). Tirar en Tabla B.`
    };
  }

  if (input.damageTaken > 0 && input.currentHpAfterDamage <= 0) {
    return {
      shouldRollTableA: false,
      shouldRollTableB: true,
      reason: 'El personaje ha caído a 0 Puntos de Golpe. Tirar en Tabla B (Heridas Graves).'
    };
  }

  if (input.maxHp > 0 && input.currentHpAfterDamage > 0) {
    const halfMax = input.maxHp / 2;
    if (input.damageTaken > halfMax) {
      return {
        shouldRollTableA: true,
        shouldRollTableB: false,
        reason: `Daño masivo de un solo golpe (${input.damageTaken} > 50% de ${input.maxHp} PG). Tirar en Tabla A.`
      };
    }

    if (input.isCriticalHit && input.currentHpAfterDamage < halfMax) {
      return {
        shouldRollTableA: true,
        shouldRollTableB: false,
        reason: 'Golpe crítico que deja al personaje Malherido (< 50% PG). Tirar en Tabla A.'
      };
    }
  }

  return {
    shouldRollTableA: false,
    shouldRollTableB: false,
    reason: null
  };
}
