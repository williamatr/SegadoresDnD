/**
 * @segadores/dnd-core
 * Motor matemático puro, contratos de tipos y evaluador de estados D&D 5.5e (SRD 5.2.1 + Reglas de Mesa).
 * 100% agnóstico de UI, red y base de datos.
 */

export * from './src/types/effects.ts';
export * from './src/types/spells.ts';
export * from './src/types/character.ts';

export * from './src/rules/abilities.ts';
export * from './src/rules/combat-calculator.ts';
export * from './src/rules/lingering-injuries.ts';
export * from './src/rules/multiclass.ts';
export * from './src/rules/state-evaluator.ts';
export * from './src/rules/level-up.ts';
export * from './src/rules/spell-preparation.ts';
export * from './src/rules/canonical-buffs.ts';
export * from './src/data/class-spells.ts';
export * from './src/data/class-features.ts';
