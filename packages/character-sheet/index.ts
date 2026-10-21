/**
 * @segadores/character-sheet
 * Componentes de interfaz de usuario desacoplados para la Hoja de Personaje.
 * Sin dependencias de base de datos ni backend: controlados puramente mediante props.
 */

export interface CharacterSheetProps {
  characterId: string;
  name: string;
  level: number;
}
