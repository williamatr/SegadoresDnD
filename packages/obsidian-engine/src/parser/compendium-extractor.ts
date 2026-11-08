import type {
  ItemCategory,
  ItemEntry,
  SpellComponentsInfo,
  SpellEntry
} from '../types/compendium.ts';
import { parseFrontmatter } from './frontmatter.ts';
import { slugifyWikilink } from './wikilinks.ts';

function cleanWikilinksInText(text: string): string {
  return text.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target, alias) => {
    return alias ? alias.trim() : target.trim();
  });
}

function normalizeArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => cleanWikilinksInText(String(v).trim())).filter(Boolean);
  }
  const str = String(value).trim();
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      // Intentar parsear array JSON o con comillas simples
      const jsonStr = str.replace(/'/g, '"');
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) return parsed.map(v => cleanWikilinksInText(String(v).trim()));
    } catch {
      // Ignorar fallo y dividir por coma
    }
  }
  return str
    .split(',')
    .map(v => cleanWikilinksInText(v.trim()))
    .filter(Boolean);
}

/**
 * Extrae y parsea los componentes de un conjuro (V, S, M y descripción del material).
 */
export function parseSpellComponents(rawComponents: any): SpellComponentsInfo {
  const result: SpellComponentsInfo = {
    verbal: false,
    somatic: false,
    material: false
  };

  if (!rawComponents) return result;
  const str = Array.isArray(rawComponents) ? rawComponents.join(', ') : String(rawComponents);

  if (/\bV\b/i.test(str) || /verbal/i.test(str)) {
    result.verbal = true;
  }
  if (/\bS\b/i.test(str) || /som[aá]tico/i.test(str)) {
    result.somatic = true;
  }
  if (/\bM\b/i.test(str) || /material/i.test(str)) {
    result.material = true;
    const materialMatch = str.match(/M\s*\(([^)]+)\)/i);
    if (materialMatch) {
      result.materialDescription = materialMatch[1].trim();
    }
  }

  return result;
}

/**
 * Parsea una nota de conjuro desde su contenido Markdown (soporta tanto formato frontmatter como formato inline).
 */
export function parseSpellNote(rawContent: string, sourcePath?: string): SpellEntry {
  const parsed = parseFrontmatter(rawContent);
  const meta = parsed.metadata as Record<string, any>;
  const content = parsed.content;

  const title = parsed.title || 'Conjuro Sin Nombre';
  const slug = slugifyWikilink(title);

  // 1. Nivel y Escuela
  let level = 1;
  let levelLabel = 'Nivel 1';
  let school = 'Evocación';

  if (meta.nivel !== undefined) {
    level = Number(meta.nivel) || 0;
  } else {
    // Buscar inline: "*Nivel 3 - Transmutación*" o "*Truco de Evocación*"
    const levelMatch = content.match(/\*(?:(Truco)\s+de\s+([A-Za-záéíóúÁÉÍÓÚñ]+)|Nivel\s+(\d+)\s*-\s*([A-Za-záéíóúÁÉÍÓÚñ]+))\*/i);
    if (levelMatch) {
      if (levelMatch[1] && /truco/i.test(levelMatch[1])) {
        level = 0;
        school = levelMatch[2].trim();
      } else if (levelMatch[3]) {
        level = parseInt(levelMatch[3], 10);
        school = (levelMatch[4] || '').trim();
      }
    }
  }

  if (meta.escuela) {
    school = String(meta.escuela).trim();
  }
  levelLabel = level === 0 ? 'Truco' : `Nivel ${level}`;

  // 2. Clases
  let classes: string[] = [];
  if (meta.clases) {
    classes = normalizeArray(meta.clases);
  } else {
    const classMatch = content.match(/-\s+\*\*Clases:\*\*\s*(.+)$/m);
    if (classMatch) {
      classes = normalizeArray(classMatch[1]);
    }
  }

  // 3. Tiempo de lanzamiento
  let castingTime = '1 acción';
  if (meta.tiempo_lanzamiento) {
    castingTime = String(meta.tiempo_lanzamiento).trim();
  } else {
    const timeMatch = content.match(/-\s+\*\*Tiempo de [Ll]anzamiento:\*\*\s*(.+)$/m);
    if (timeMatch) castingTime = timeMatch[1].trim();
  }

  // 4. Alcance
  let range = '30 pies';
  if (meta.alcance) {
    range = String(meta.alcance).trim();
  } else {
    const rangeMatch = content.match(/-\s+\*\*Alcance:\*\*\s*(.+)$/m);
    if (rangeMatch) {
      const arr = normalizeArray(rangeMatch[1]);
      range = arr[0] || rangeMatch[1].trim();
    }
  }

  // 5. Componentes
  let componentsRaw: any = meta.componentes;
  if (!componentsRaw) {
    const compMatch = content.match(/-\s+\*\*Componentes:\*\*\s*(.+)$/m);
    if (compMatch) componentsRaw = compMatch[1].trim();
  }
  const components = parseSpellComponents(componentsRaw);

  // 6. Duración y Concentración
  let duration = 'Instantánea';
  if (meta.duracion) {
    duration = String(meta.duracion).trim();
  } else {
    const durMatch = content.match(/-\s+\*\*Duraci[oó]n:\*\*\s*(.+)$/m);
    if (durMatch) duration = durMatch[1].trim();
  }

  const concentration =
    meta.concentracion === true ||
    /concentraci[oó]n/i.test(duration) ||
    /concentraci[oó]n/i.test(parsed.tags.join(' '));

  const ritual =
    meta.ritual === true ||
    /ritual/i.test(castingTime) ||
    /ritual/i.test(duration) ||
    /ritual/i.test(parsed.tags.join(' '));

  // 7. Descripción y Niveles Superiores
  let description = '';
  let higherLevels: string | undefined;

  const descSectionMatch = content.match(/##\s+Descripci[oó]n\r?\n([\s\S]*?)(?=(?:\r?\n##|\r?\n\*\*A niveles superiores|\s*$))/i);
  if (descSectionMatch) {
    description = descSectionMatch[1].trim();
  } else {
    // Si no tiene "## Descripción", extraer lo que está después de la lista de metadatos o callouts
    const cleanBody = content.replace(/^(?:#[^\n]*|\*[^\n]*|-\s+\*\*[^\n]*)\r?\n/gm, '').trim();
    description = cleanBody;
  }

  const higherMatch = content.match(/\*\*A niveles superiores:\*\*\s*([\s\S]*?)$/i);
  if (higherMatch) {
    higherLevels = higherMatch[1].trim();
  }

  return {
    slug,
    name: title,
    level,
    levelLabel,
    school,
    castingTime,
    range,
    components,
    duration,
    concentration,
    ritual,
    classes,
    description,
    higherLevels,
    sourcePath,
    visibility: parsed.visibility,
    tags: parsed.tags
  };
}

/**
 * Deduce la categoría de un objeto según sus subtítulos y contenido.
 */
function deduceItemCategory(text: string): ItemCategory {
  const norm = text.toLowerCase();
  if (norm.includes('escudo')) return 'shield';
  if (norm.includes('armadura')) return 'armor';
  if (norm.includes('arma')) return 'weapon';
  if (norm.includes('poción') || norm.includes('pocion') || norm.includes('pergamino')) return 'consumable';
  if (norm.includes('objeto mágico') || norm.includes('artefacto') || norm.includes('maravilloso')) return 'magic_item';
  if (norm.includes('herramienta') || norm.includes('equipo')) return 'gear';
  return 'general';
}

/**
 * Parsea una nota de objeto (normal o mágico) en un objeto ItemEntry estructurado.
 */
export function parseItemNote(rawContent: string, sourcePath?: string): ItemEntry {
  const parsed = parseFrontmatter(rawContent);
  const content = parsed.content;

  const title = parsed.title || 'Objeto Sin Nombre';
  const slug = slugifyWikilink(title);

  // Categoría y rareza
  const subtitleMatch = content.match(/^\*([^*]+)\*/m);
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : '';

  const category = deduceItemCategory(subtitle || title);

  let rarity: string | undefined;
  const rarityMatch = subtitle.match(/\b(com[uú]n|poco com[uú]n|rara|muy rara|legendaria|artefacto)\b/i);
  if (rarityMatch) {
    rarity = rarityMatch[1].toLowerCase();
  }

  const requiresAttunement =
    /requiere\s+(?:sintonizaci[oó]n|sincronizaci[oó]n)/i.test(content) ||
    /attunement/i.test(content);

  let attunementDetails: string | undefined;
  const attuneMatch = content.match(/\((requiere\s+[^)]+)\)/i);
  if (attuneMatch) {
    attunementDetails = attuneMatch[1].trim();
  }

  // Propiedades
  const properties: string[] = [];
  const propsMatch = content.match(/\*Propiedades:\s*([^*]+)\*/i);
  if (propsMatch) {
    properties.push(...propsMatch[1].split(',').map(p => p.trim()).filter(Boolean));
  }

  // Descripción
  let description = '';
  const descMatch = content.match(/##\s+Descripci[oó]n\r?\n([\s\S]*?)(?=(?:\r?\n##|\s*$))/i);
  if (descMatch) {
    description = descMatch[1].trim();
  } else {
    description = content.replace(/^(?:#[^\n]*|\*[^\n]*)\r?\n/gm, '').trim();
  }

  return {
    slug,
    name: title,
    category,
    rarity,
    requiresAttunement,
    attunementDetails,
    properties: properties.length > 0 ? properties : undefined,
    description,
    sourcePath,
    visibility: parsed.visibility,
    tags: parsed.tags
  };
}

export interface CompendiumVaultResult {
  spells: SpellEntry[];
  items: ItemEntry[];
  isFallback: boolean;
  totalSpells: number;
  totalItems: number;
}

/**
 * Escanea un directorio de la wiki o de mocks y carga todo el compendio estructurado de hechizos y objetos.
 * Si wikiDir no existe o está vacío, recurre a fallbackDir (ej. content/mocks/).
 */
export async function loadCompendium(
  wikiDir: string,
  fallbackDir?: string
): Promise<CompendiumVaultResult> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  async function dirExists(dir: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dir);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async function readAllMarkdownFiles(dir: string): Promise<Array<{ fullPath: string; content: string }>> {
    const results: Array<{ fullPath: string; content: string }> = [];
    if (!(await dirExists(dir))) return results;

    async function walk(current: string) {
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = await fs.readFile(full, 'utf-8');
          results.push({ fullPath: full, content });
        }
      }
    }

    await walk(dir);
    return results;
  }

  let useFallback = false;
  let targetWikiSpells = path.join(wikiDir, 'DnD wiki', 'lista_de_hechizos_y_habilidades', 'Hechizos');
  let targetWikiItemsMag = path.join(wikiDir, 'DnD wiki', 'Objetos Mágicos');
  let targetWikiItemsNorm = path.join(wikiDir, 'DnD wiki', 'Objetos Normales');

  let spellFiles = await readAllMarkdownFiles(targetWikiSpells);
  let itemMagFiles = await readAllMarkdownFiles(targetWikiItemsMag);
  let itemNormFiles = await readAllMarkdownFiles(targetWikiItemsNorm);

  if (spellFiles.length === 0 && fallbackDir) {
    useFallback = true;
    const fallbackSpells = path.join(fallbackDir, 'Hechizos');
    const fallbackItems = path.join(fallbackDir, 'Objetos');
    spellFiles = await readAllMarkdownFiles(fallbackSpells);
    itemMagFiles = await readAllMarkdownFiles(fallbackItems);
    itemNormFiles = [];
  }

  const spells = spellFiles.map(f => parseSpellNote(f.content, f.fullPath));
  const items = [...itemMagFiles, ...itemNormFiles].map(f => parseItemNote(f.content, f.fullPath));

  return {
    spells,
    items,
    isFallback: useFallback,
    totalSpells: spells.length,
    totalItems: items.length
  };
}
