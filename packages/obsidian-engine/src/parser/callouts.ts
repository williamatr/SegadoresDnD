import type { CalloutBlock, CalloutFold, CalloutType } from '../types/callouts.ts';

const CALLOUT_HEADER_REGEX = /^>\s*\[!([a-zA-Z0-9_\-]+)\]([+-]?)(?:\s+(.*))?$/;

/**
 * Parsea bloques callout de Obsidian (> [!tipo] Título) presentes en un texto Markdown.
 */
export function extractCallouts(markdown: string): CalloutBlock[] {
  const lines = markdown.split(/\r?\n/);
  const callouts: CalloutBlock[] = [];

  let currentCallout: Partial<CalloutBlock> | null = null;
  let currentLines: string[] = [];
  let rawLines: string[] = [];
  let calloutIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const headerMatch = trimmed.match(CALLOUT_HEADER_REGEX);

    if (headerMatch) {
      // Guardar callout previo si existía
      if (currentCallout) {
        callouts.push({
          id: currentCallout.id || `callout-${calloutIndex++}`,
          type: currentCallout.type || 'info',
          title: currentCallout.title || '',
          fold: currentCallout.fold || null,
          content: currentLines.join('\n').trim(),
          raw: rawLines.join('\n'),
          isDmOnly: (currentCallout.type || '').toLowerCase() === 'dm'
        });
        currentLines = [];
        rawLines = [];
      }

      const type = headerMatch[1].toLowerCase() as CalloutType;
      const foldSymbol = headerMatch[2] as '+' | '-' | '';
      const fold: CalloutFold = foldSymbol === '+' ? '+' : foldSymbol === '-' ? '-' : null;
      const title = (headerMatch[3] || '').trim();

      currentCallout = {
        id: `callout-${calloutIndex++}`,
        type,
        fold,
        title: title || capitalize(type)
      };
      rawLines.push(line);
      continue;
    }

    if (currentCallout) {
      if (trimmed.startsWith('>')) {
        // Quitar el '>' y el primer espacio
        const contentLine = line.replace(/^\s*>\s?/, '');
        currentLines.push(contentLine);
        rawLines.push(line);
        continue;
      } else {
        // Fin del bloque callout
        callouts.push({
          id: currentCallout.id || `callout-${calloutIndex++}`,
          type: currentCallout.type || 'info',
          title: currentCallout.title || '',
          fold: currentCallout.fold || null,
          content: currentLines.join('\n').trim(),
          raw: rawLines.join('\n'),
          isDmOnly: (currentCallout.type || '').toLowerCase() === 'dm'
        });
        currentCallout = null;
        currentLines = [];
        rawLines = [];
      }
    }
  }

  // Guardar si terminó al final del archivo
  if (currentCallout) {
    callouts.push({
      id: currentCallout.id || `callout-${calloutIndex++}`,
      type: currentCallout.type || 'info',
      title: currentCallout.title || '',
      fold: currentCallout.fold || null,
      content: currentLines.join('\n').trim(),
      raw: rawLines.join('\n'),
      isDmOnly: (currentCallout.type || '').toLowerCase() === 'dm'
    });
  }

  return callouts;
}

export interface MarkdownSegment {
  type: 'markdown' | 'callout';
  content: string;
  callout?: CalloutBlock;
}

/**
 * Segmenta un documento Markdown en bloques ordenados de texto estándar y callouts estructurados.
 */
export function segmentMarkdownByCallouts(markdown: string): MarkdownSegment[] {
  const lines = markdown.split(/\r?\n/);
  const segments: MarkdownSegment[] = [];

  let markdownLines: string[] = [];
  let inCallout = false;
  let currentCallout: Partial<CalloutBlock> | null = null;
  let calloutContentLines: string[] = [];
  let calloutRawLines: string[] = [];
  let calloutIndex = 0;

  function flushMarkdown() {
    if (markdownLines.length > 0) {
      segments.push({
        type: 'markdown',
        content: markdownLines.join('\n')
      });
      markdownLines = [];
    }
  }

  function flushCallout() {
    if (currentCallout) {
      segments.push({
        type: 'callout',
        content: calloutContentLines.join('\n').trim(),
        callout: {
          id: currentCallout.id || `callout-${calloutIndex++}`,
          type: currentCallout.type || 'info',
          title: currentCallout.title || '',
          fold: currentCallout.fold || null,
          content: calloutContentLines.join('\n').trim(),
          raw: calloutRawLines.join('\n'),
          isDmOnly: (currentCallout.type || '').toLowerCase() === 'dm'
        }
      });
      currentCallout = null;
      calloutContentLines = [];
      calloutRawLines = [];
      inCallout = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const headerMatch = trimmed.match(CALLOUT_HEADER_REGEX);

    if (headerMatch) {
      flushMarkdown();
      if (inCallout) flushCallout();

      inCallout = true;
      const type = headerMatch[1].toLowerCase() as CalloutType;
      const foldSymbol = headerMatch[2] as '+' | '-' | '';
      const fold: CalloutFold = foldSymbol === '+' ? '+' : foldSymbol === '-' ? '-' : null;
      const title = (headerMatch[3] || '').trim();

      currentCallout = {
        id: `callout-${calloutIndex++}`,
        type,
        fold,
        title: title || capitalize(type)
      };
      calloutRawLines.push(line);
      continue;
    }

    if (inCallout) {
      if (trimmed.startsWith('>')) {
        const contentLine = line.replace(/^\s*>\s?/, '');
        calloutContentLines.push(contentLine);
        calloutRawLines.push(line);
        continue;
      } else {
        flushCallout();
      }
    }

    markdownLines.push(line);
  }

  if (inCallout) flushCallout();
  flushMarkdown();

  return segments;
}

function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
