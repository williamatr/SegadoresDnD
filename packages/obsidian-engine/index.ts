/**
 * @segadores/obsidian-engine
 * Motor de parseo y renderizado para notas Markdown de Obsidian.
 * Transforma wikilinks [[Nota]], callouts y frontmatter en estructuras compatibles con Next.js.
 */

export interface ObsidianEngineOptions {
  vaultPath?: string;
}
