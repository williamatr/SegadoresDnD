export type CalloutType =
  | 'statblock'
  | 'dnd-grid'
  | 'info'
  | 'tip'
  | 'warning'
  | 'todo'
  | 'dm'
  | 'note'
  | 'quote'
  | 'summary'
  | string;

export type CalloutFold = '+' | '-' | null;

export interface CalloutBlock {
  id: string;
  type: CalloutType;
  title: string;
  fold: CalloutFold;
  content: string;
  raw: string;
  isDmOnly: boolean;
}
