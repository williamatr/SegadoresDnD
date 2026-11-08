import type { NoteVisibility } from '../types/frontmatter.ts';

/**
 * Carpetas y rutas que están reservadas exclusivamente para el Dungeon Master (DM)
 * y deben ser completamente invisibles para jugadores.
 */
export const RESTRICTED_DM_DIRECTORIES = [
  'campañas predefinidas',
  'campanas predefinidas',
  'bestiario',
  'notas del máster',
  'notas del master',
  'secretos',
  'dm-only',
  'dm_only',
  'dm'
];

/**
 * Etiquetas que marcan una nota como confidencial para el DM.
 */
export const DM_ONLY_TAGS = ['dm-only', 'dmonly', 'secreto-dm', 'dm'];

/**
 * Comprueba si una ruta de archivo pertenece a una carpeta restringida para jugadores.
 */
export function isPathRestrictedForPlayer(filePath?: string): boolean {
  if (!filePath) return false;
  const normalized = filePath
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const dir of RESTRICTED_DM_DIRECTORIES) {
    const cleanDir = dir.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (
      normalized.includes(`/${cleanDir}/`) ||
      normalized.includes(`\\${cleanDir}\\`) ||
      normalized.startsWith(`${cleanDir}/`) ||
      normalized.startsWith(`${cleanDir}\\`)
    ) {
      return true;
    }
  }

  return false;
}

export interface NoteAccessCheckOptions {
  path?: string;
  visibility?: NoteVisibility;
  tags?: string[];
}

/**
 * Evalúa si una nota es accesible para el rol de usuario especificado ('player' vs 'dm').
 * - Si el rol es 'dm', siempre tiene acceso total.
 * - Si el rol es 'player', se bloquea si la ruta está restringida, si tiene visibility: 'dm'
 *   o si contiene etiquetas #dm-only.
 */
export function isNoteAccessible(
  options: NoteAccessCheckOptions,
  userRole: 'player' | 'dm'
): boolean {
  if (userRole === 'dm') return true;

  if (options.path && isPathRestrictedForPlayer(options.path)) {
    return false;
  }

  if (options.visibility === 'dm') {
    return false;
  }

  if (options.tags && options.tags.length > 0) {
    const normTags = options.tags.map(t =>
      t.toLowerCase().replace(/^#/, '').trim()
    );
    for (const dmTag of DM_ONLY_TAGS) {
      if (normTags.includes(dmTag)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Expresión regular para detectar el inicio de un callout secreto de DM:
 * > [!dm] Título o > [!dm]+ Título o > [!dm]- Título o > [!secret]
 */
const DM_CALLOUT_START_REGEX = /^>\s*\[!(?:dm|secret)\][+-]?(?:\s+.*)?$/i;

/**
 * Purga de forma determinista todos los bloques callout `> [!dm]` del texto Markdown.
 * Si el usuario es 'dm', preserva el contenido íntegro.
 * Si el usuario es 'player', elimina completamente el callout y todas sus líneas hijas (> ...),
 * garantizando cero fugas de información y cero texto residual en el DOM.
 */
export function purgeDmContent(markdown: string, userRole: 'player' | 'dm'): string {
  if (userRole === 'dm') {
    return markdown;
  }

  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];
  let inDmCallout = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar inicio de callout secreto
    if (DM_CALLOUT_START_REGEX.test(line.trim())) {
      inDmCallout = true;
      continue;
    }

    if (inDmCallout) {
      // Un callout continúa mientras la línea comience con '>' o sea una línea en blanco dentro del bloque
      if (line.trim().startsWith('>')) {
        continue;
      }
      // Si la línea no empieza con '>', terminó el bloque callout
      inDmCallout = false;
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * Sanitiza el árbol de navegación o lista de notas para un rol dado.
 */
export function filterNavigationTree<T extends NoteAccessCheckOptions>(
  items: T[],
  userRole: 'player' | 'dm'
): T[] {
  return items.filter(item => isNoteAccessible(item, userRole));
}
