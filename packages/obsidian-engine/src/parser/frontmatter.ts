import type { BaseFrontmatter, NoteVisibility, ParsedNote } from '../types/frontmatter.ts';

/**
 * Parsea un valor escalar de YAML (números, booleanos, cadenas con/sin comillas).
 */
function parseYamlScalar(raw: string): any {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === '~') return null;
  if (trimmed === 'true' || trimmed === 'True') return true;
  if (trimmed === 'false' || trimmed === 'False') return false;

  // Cadenas con comillas
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Arrays inline: [a, b, c]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(',')
      .map(item => parseYamlScalar(item))
      .filter(item => item !== undefined);
  }

  // Números
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

/**
 * Parsea un bloque de texto YAML en un objeto plano o anidado.
 * Soporta escalares, listas con guiones y arrays inline sin librerías externas.
 */
export function parseYaml(yamlText: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yamlText.split(/\r?\n/);

  let currentKey: string | null = null;
  let currentList: any[] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignorar líneas vacías o comentarios puros
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Detectar elemento de lista: "  - elemento" o "- elemento"
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch) {
      if (currentKey && currentList) {
        currentList.push(parseYamlScalar(listMatch[1]));
        continue;
      }
    }

    // Si estábamos acumulando una lista y encontramos una clave nueva, asignarla
    if (currentKey && currentList) {
      result[currentKey] = currentList;
      currentKey = null;
      currentList = null;
    }

    // Detectar par clave-valor: "clave: valor" o "clave:"
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();

      if (!key) continue;

      if (!value) {
        // Posible inicio de lista o bloque hijo
        currentKey = key;
        currentList = [];
        result[key] = currentList;
      } else {
        result[key] = parseYamlScalar(value);
      }
    }
  }

  // Guardar última lista si quedó abierta
  if (currentKey && currentList) {
    result[currentKey] = currentList;
  }

  return result;
}

/**
 * Normaliza etiquetas (tags) eliminando '#' inicial y convirtiendo a minúsculas.
 */
export function normalizeTags(rawTags: any): string[] {
  if (!rawTags) return [];
  const list = Array.isArray(rawTags) ? rawTags : [rawTags];
  const tagsSet = new Set<string>();

  for (const item of list) {
    if (typeof item === 'string') {
      const clean = item.trim().replace(/^#/, '').toLowerCase();
      if (clean) tagsSet.add(clean);
    }
  }

  return Array.from(tagsSet);
}

/**
 * Extrae tags inline en el cuerpo Markdown (#dnd/hechizo, #dm-only, etc.)
 */
export function extractInlineTags(content: string): string[] {
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-\/]+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(content)) !== null) {
    const t = match[1].toLowerCase();
    // Evitar títulos de Markdown (# Título o ## Subtítulo)
    if (!match[0].startsWith(' #') && match[0].startsWith('#') && content.charAt(match.index + match[0].length) === ' ') {
      continue;
    }
    tags.push(t);
  }

  return Array.from(new Set(tags));
}

/**
 * Parsea una nota de Obsidian con o sin frontmatter YAML (--- ... ---).
 * Extrae metadatos, tags normalizados, visibilidad ('player' vs 'dm') y contenido limpio.
 */
export function parseFrontmatter<T = BaseFrontmatter>(fileContent: string): ParsedNote<T> {
  const normalized = fileContent.replace(/^\uFEFF/, ''); // Eliminar BOM si existe
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const match = normalized.match(frontmatterRegex);

  let rawFrontmatter = '';
  let metadata: Record<string, any> = {};
  let content = normalized;

  if (match) {
    rawFrontmatter = match[1];
    metadata = parseYaml(rawFrontmatter);
    content = normalized.slice(match[0].length);
  }

  // Extraer título: de metadata.title o del primer encabezado `# Titulo`
  let title = typeof metadata.title === 'string' ? metadata.title.trim() : '';
  if (!title) {
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      title = headingMatch[1].trim();
    }
  }

  // Normalizar tags del frontmatter y sumar tags inline
  const frontmatterTags = normalizeTags(metadata.tags);
  const inlineTags = extractInlineTags(content);
  const allTags = Array.from(new Set([...frontmatterTags, ...inlineTags]));

  // Determinar visibilidad (Player vs DM)
  let visibility: NoteVisibility = 'player';
  const metaVis = String(metadata.visibility ?? '').toLowerCase();
  if (
    metaVis === 'dm' ||
    allTags.includes('dm-only') ||
    allTags.includes('dmonly') ||
    allTags.includes('dm')
  ) {
    visibility = 'dm';
  }

  return {
    metadata: metadata as T,
    content,
    rawFrontmatter,
    title,
    tags: allTags,
    visibility
  };
}
