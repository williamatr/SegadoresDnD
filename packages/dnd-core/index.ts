/**
 * @segadores/dnd-core
 * Lógica matemática pura y reglas D&D (cálculo de modificadores, tiradas de dados, reglas SRD).
 * 100% independiente de UI y base de datos.
 */

export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};
