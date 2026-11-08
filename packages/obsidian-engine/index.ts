/**
 * @segadores/obsidian-engine
 * Motor agnóstico de parseo, compendio, filtrado anti-metajuego y renderizado de callouts para notas de Obsidian.
 * 100% independiente de Supabase y bases de datos.
 */

export * from './src/types/index.ts';
export * from './src/parser/frontmatter.ts';
export * from './src/parser/wikilinks.ts';
export * from './src/parser/callouts.ts';
export * from './src/parser/compendium-extractor.ts';
export * from './src/filters/anti-metagame.ts';
export * from './src/components/callouts.tsx';
