import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPathRestrictedForPlayer,
  isNoteAccessible,
  purgeDmContent,
  filterNavigationTree
} from '../filters/anti-metagame.ts';

describe('@segadores/obsidian-engine - Filtro Anti-Metajuego (Player vs DM)', () => {
  it('detecta carpetas restringidas para jugadores', () => {
    assert.equal(isPathRestrictedForPlayer('content/wiki/Campañas predefinidas/Phandalin.md'), true);
    assert.equal(isPathRestrictedForPlayer('content/wiki/Bestiario/Orco Caudillo.md'), true);
    assert.equal(isPathRestrictedForPlayer('content/wiki/Notas del Máster/Secretos.md'), true);
    assert.equal(isPathRestrictedForPlayer('content/wiki/DnD wiki/Hechizos/Acelerar.md'), false);
    assert.equal(isPathRestrictedForPlayer('content/wiki/Personajes_Jugadores/Valeros.md'), false);
  });

  it('evalúa accesibilidad de notas según el rol', () => {
    // Nota pública
    const publicNote = { path: 'content/wiki/Hechizo.md', visibility: 'player' as const, tags: ['hechizo'] };
    assert.equal(isNoteAccessible(publicNote, 'player'), true);
    assert.equal(isNoteAccessible(publicNote, 'dm'), true);

    // Nota con visibility: dm
    const dmVisNote = { path: 'content/wiki/Nota.md', visibility: 'dm' as const };
    assert.equal(isNoteAccessible(dmVisNote, 'player'), false);
    assert.equal(isNoteAccessible(dmVisNote, 'dm'), true);

    // Nota con tag dm-only
    const dmTagNote = { path: 'content/wiki/Pistas.md', tags: ['dnd', 'dm-only'] };
    assert.equal(isNoteAccessible(dmTagNote, 'player'), false);
    assert.equal(isNoteAccessible(dmTagNote, 'dm'), true);

    // Nota en carpeta restringida
    const restrictedNote = { path: 'content/wiki/Bestiario/Dragon.md' };
    assert.equal(isNoteAccessible(restrictedNote, 'player'), false);
    assert.equal(isNoteAccessible(restrictedNote, 'dm'), true);
  });

  it('purga completamente bloques > [!dm] cuando el rol es player', () => {
    const markdown = `# La Cueva de los Ecos
Esta es una cueva misteriosa conocida por los aldeanos.

> [!dm] Secreto del DM: Tesoro Oculto
> Detrás de la cascada hay un cofre con 500 po y el diario del nigromante.
> Hay una trampa de veneno CD 14.

Los jugadores ven estalactitas colgando del techo.

> [!info] Información General
> La cueva tiene una temperatura baja.`;

    const playerView = purgeDmContent(markdown, 'player');

    // Cero texto del DM en playerView
    assert.equal(playerView.includes('Secreto del DM'), false);
    assert.equal(playerView.includes('nigromante'), false);
    assert.equal(playerView.includes('trampa de veneno'), false);

    // El contenido público debe seguir intacto
    assert.ok(playerView.includes('# La Cueva de los Ecos'));
    assert.ok(playerView.includes('Los jugadores ven estalactitas'));
    assert.ok(playerView.includes('> [!info] Información General'));

    // Vista DM debe conservar todo
    const dmView = purgeDmContent(markdown, 'dm');
    assert.ok(dmView.includes('Secreto del DM'));
    assert.ok(dmView.includes('trampa de veneno'));
  });

  it('filtra árboles de navegación respetando el rol', () => {
    const tree = [
      { path: 'content/wiki/Hechizos/Bola_Fuego.md', visibility: 'player' as const },
      { path: 'content/wiki/Bestiario/Goblin.md', visibility: 'dm' as const },
      { path: 'content/wiki/Campañas predefinidas/Acto1.md' }
    ];

    const playerTree = filterNavigationTree(tree, 'player');
    assert.equal(playerTree.length, 1);
    assert.equal(playerTree[0].path, 'content/wiki/Hechizos/Bola_Fuego.md');

    const dmTree = filterNavigationTree(tree, 'dm');
    assert.equal(dmTree.length, 3);
  });
});
