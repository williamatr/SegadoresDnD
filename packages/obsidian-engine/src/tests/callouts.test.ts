import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractCallouts, segmentMarkdownByCallouts } from '../parser/callouts.ts';

describe('@segadores/obsidian-engine - Callouts Parser', () => {
  it('extrae callouts simples de un texto Markdown', () => {
    const markdown = `# Título
> [!info] Mecánica del Conjuro
> Creas tres dardos de energía.
> Cada dardo causa 1d4 + 1.

Texto intermedio.

> [!warning] Peligro Inminente
> El daño no se puede reducir.`;

    const callouts = extractCallouts(markdown);
    assert.equal(callouts.length, 2);

    assert.equal(callouts[0].type, 'info');
    assert.equal(callouts[0].title, 'Mecánica del Conjuro');
    assert.ok(callouts[0].content.includes('Creas tres dardos'));
    assert.ok(callouts[0].content.includes('1d4 + 1'));
    assert.equal(callouts[0].fold, null);

    assert.equal(callouts[1].type, 'warning');
    assert.equal(callouts[1].title, 'Peligro Inminente');
    assert.equal(callouts[1].isDmOnly, false);
  });

  it('detecta callouts colapsables con + y -', () => {
    const markdown = `> [!statblock]+ Estadísticas del Monstruo
> CA: 15
> PG: 45

> [!todo]- Tareas Pendientes
> - Revisar dados`;

    const callouts = extractCallouts(markdown);
    assert.equal(callouts.length, 2);

    assert.equal(callouts[0].type, 'statblock');
    assert.equal(callouts[0].fold, '+');

    assert.equal(callouts[1].type, 'todo');
    assert.equal(callouts[1].fold, '-');
  });

  it('detecta callouts secretos para el DM con isDmOnly: true', () => {
    const markdown = `> [!dm] Tesoro Oculto
> Cofre con 100 po bajo la losa.`;

    const callouts = extractCallouts(markdown);
    assert.equal(callouts.length, 1);
    assert.equal(callouts[0].type, 'dm');
    assert.equal(callouts[0].isDmOnly, true);
  });

  it('segmenta un documento alternando texto y callouts ordenadamente', () => {
    const doc = `Introducción al capítulo.

> [!tip] Consejo Táctico
> Mantén la distancia.

Conclusión de la sección.`;

    const segments = segmentMarkdownByCallouts(doc);
    assert.equal(segments.length, 3);
    assert.equal(segments[0].type, 'markdown');
    assert.ok(segments[0].content.includes('Introducción al capítulo.'));

    assert.equal(segments[1].type, 'callout');
    assert.equal(segments[1].callout?.type, 'tip');
    assert.equal(segments[1].callout?.content, 'Mantén la distancia.');

    assert.equal(segments[2].type, 'markdown');
    assert.ok(segments[2].content.includes('Conclusión de la sección.'));
  });
});
