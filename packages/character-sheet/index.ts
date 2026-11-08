/**
 * @segadores/character-sheet
 * Suite completa de UI para la Hoja de Personaje D&D 5.5e (7 Vistas Interactivas A–G).
 * Componentes React puros y desacoplados: 100% controlados mediante props y callbacks.
 * Sin dependencias directas de base de datos ni cookies.
 */

export * from './src/types.ts';
export * from './src/CharacterSheet.tsx';

// Exportación individual de las 7 vistas A–G
export * from './src/views/CoreStatsView.tsx';
export * from './src/views/CombatConsoleView.tsx';
export * from './src/views/InventoryView.tsx';
export * from './src/views/SpellsAndAbilitiesView.tsx';
export * from './src/views/LoreAndChronicleView.tsx';
export * from './src/views/ContextualRulesView.tsx';
export * from './src/views/ConditionsAndEffectsView.tsx';

// Exportación de subcomponentes tácticos
export * from './src/components/HpTracker.tsx';
export * from './src/components/DeathSavesTracker.tsx';
export * from './src/components/HitDiceTracker.tsx';
export * from './src/components/ExhaustionSelector.tsx';
export * from './src/components/ClassResourcesTracker.tsx';
export * from './src/components/AttunementTracker.tsx';
export * from './src/components/LevelUpModal.tsx';
