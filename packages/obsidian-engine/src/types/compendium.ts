import type { NoteVisibility } from './frontmatter.ts';

export interface SpellComponentsInfo {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialDescription?: string;
}

export interface SpellEntry {
  slug: string;
  name: string;
  level: number;
  levelLabel: string;
  school: string;
  castingTime: string;
  range: string;
  components: SpellComponentsInfo;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  classes: string[];
  description: string;
  higherLevels?: string;
  sourcePath?: string;
  visibility: NoteVisibility;
  tags: string[];
}

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'magic_item'
  | 'gear'
  | 'consumable'
  | 'general';

export interface ItemEntry {
  slug: string;
  name: string;
  category: ItemCategory;
  rarity?: string;
  requiresAttunement: boolean;
  attunementDetails?: string;
  properties?: string[];
  description: string;
  sourcePath?: string;
  visibility: NoteVisibility;
  tags: string[];
}
