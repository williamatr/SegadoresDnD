export type NoteVisibility = 'player' | 'dm';

export interface BaseFrontmatter {
  title?: string;
  type?: string;
  visibility?: NoteVisibility;
  tags?: string[] | string;
  cssclasses?: string[] | string;
  [key: string]: any;
}

export interface ParsedNote<T = BaseFrontmatter> {
  metadata: T;
  content: string;
  rawFrontmatter?: string;
  title: string;
  tags: string[];
  visibility: NoteVisibility;
}
