import type { WikilinkMatch, WikilinkResolver } from '../types/wikilinks.ts';

/**
 * Convierte un nombre de nota en un slug URL-friendly.
 * Ej: "Proyectil Mágico" -> "proyectil-magico"
 * Ej: "Aerasúl, Trueno de Gorthok" -> "aerasul-trueno-de-gorthok"
 */
export function slugifyWikilink(target: string): string {
  return target
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const WIKILINK_REGEX = /(!?)\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

/**
 * Extrae todos los wikilinks (estándar e incrustaciones ![[...]]) presentes en el texto.
 */
export function extractWikilinks(content: string): WikilinkMatch[] {
  const matches: WikilinkMatch[] = [];
  const regex = new RegExp(WIKILINK_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const isEmbed = match[1] === '!';
    const target = match[2].trim();
    const heading = match[3] ? match[3].trim() : undefined;
    const alias = match[4] ? match[4].trim() : undefined;

    matches.push({
      raw: match[0],
      target,
      heading,
      alias,
      isEmbed
    });
  }

  return matches;
}

/**
 * Resolver por defecto para wikilinks.
 * - Incrustaciones de imagen (![[imagen.png]]): genera etiqueta de imagen markdown.
 * - Enlaces a notas ([[Nota]] o [[Nota|Alias]]): genera enlace markdown a /wiki/${slug}.
 */
export const defaultWikilinkResolver: WikilinkResolver = (match: WikilinkMatch): string => {
  const label = match.alias || match.target;
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(match.target);

  if (match.isEmbed) {
    if (isImage) {
      return `![${label}](/assets/wiki/${encodeURIComponent(match.target)})`;
    }
    // Incrustación de nota de texto
    return `> [!info] ${label}\n> Consulta la nota [[${match.target}]]`;
  }

  const slug = slugifyWikilink(match.target);
  const hash = match.heading ? `#${slugifyWikilink(match.heading)}` : '';
  return `[${label}](/wiki/${slug}${hash})`;
};

/**
 * Transforma todos los wikilinks de un texto usando el resolver indicado.
 */
export function transformWikilinks(content: string, resolver: WikilinkResolver = defaultWikilinkResolver): string {
  return content.replace(WIKILINK_REGEX, (raw, embedMark, targetRaw, headingRaw, aliasRaw) => {
    const isEmbed = embedMark === '!';
    const target = targetRaw.trim();
    const heading = headingRaw ? headingRaw.trim() : undefined;
    const alias = aliasRaw ? aliasRaw.trim() : undefined;

    return resolver({
      raw,
      target,
      heading,
      alias,
      isEmbed
    });
  });
}

/**
 * Extrae los nombres de archivos multimedia incrustados (![[archivo.png]]).
 */
export function extractEmbeddedAssets(content: string): string[] {
  return extractWikilinks(content)
    .filter(m => m.isEmbed && /\.(png|jpe?g|gif|webp|svg|pdf)$/i.test(m.target))
    .map(m => m.target);
}
