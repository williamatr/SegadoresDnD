import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, parseYaml, normalizeTags } from '../parser/frontmatter.ts';
import {
  extractWikilinks,
  transformWikilinks,
  slugifyWikilink,
  extractEmbeddedAssets
} from '../parser/wikilinks.ts';

describe('@segadores/obsidian-engine - Frontmatter & YAML Parser', () => {
  it('parsea frontmatter YAML estándar con escalares y listas', () => {
    const raw = `---
title: Proyectil Mágico
type: hechizo
nivel: 1
escuela: Evocación
clases:
  - Mago
  - Hechicero
tags:
  - dnd/hechizo
  - srd
visibility: player
---

# Proyectil Mágico
Cuerpo del conjuro.`;

    const parsed = parseFrontmatter(raw);
    assert.equal(parsed.title, 'Proyectil Mágico');
    assert.equal(parsed.metadata.nivel, 1);
    assert.equal(parsed.metadata.escuela, 'Evocación');
    assert.deepEqual(parsed.metadata.clases, ['Mago', 'Hechicero']);
    assert.deepEqual(parsed.tags, ['dnd/hechizo', 'srd']);
    assert.equal(parsed.visibility, 'player');
    assert.ok(parsed.content.includes('Cuerpo del conjuro.'));
  });

  it('extrae el título del encabezado `# Título` si no hay frontmatter', () => {
    const raw = `# Acelerar
*Nivel 3 - Transmutación*
- **Clases:** Hechicero, Mago`;

    const parsed = parseFrontmatter(raw);
    assert.equal(parsed.title, 'Acelerar');
    assert.equal(parsed.visibility, 'player');
  });

  it('detecta visibilidad dm si tiene tag #dm-only o visibility: dm', () => {
    const rawWithTag = `---
title: Nota Confidencial
tags:
  - secreto
  - dm-only
---
Información para el DM.`;

    const parsed1 = parseFrontmatter(rawWithTag);
    assert.equal(parsed1.visibility, 'dm');

    const rawWithMeta = `---
title: Plan de Asalto
visibility: dm
---
Texto`;
    const parsed2 = parseFrontmatter(rawWithMeta);
    assert.equal(parsed2.visibility, 'dm');
  });

  it('parsea arrays inline de YAML [a, b, c]', () => {
    const yml = parseYaml(`tags: [uno, dos, tres]
nivel: 5
activo: true`);
    assert.deepEqual(yml.tags, ['uno', 'dos', 'tres']);
    assert.equal(yml.nivel, 5);
    assert.equal(yml.activo, true);
  });
});

describe('@segadores/obsidian-engine - Wikilinks Parser & Transformer', () => {
  it('convierte texto en slugs URL válidos', () => {
    assert.equal(slugifyWikilink('Proyectil Mágico'), 'proyectil-magico');
    assert.equal(
      slugifyWikilink('Aerasúl, Trueno de Gorthok'),
      'aerasul-trueno-de-gorthok'
    );
  });

  it('extrae enlaces simples, con alias, con anclas e incrustaciones', () => {
    const text = `Consulta [[Mago]], o el arma [[Aerasúl, Trueno de Gorthok|Trueno]].
También mira [[Bestiario#Dragón Rojo]] y mira la imagen ![[Trueno de Gorthok_Front.png]].`;

    const links = extractWikilinks(text);
    assert.equal(links.length, 4);

    assert.equal(links[0].target, 'Mago');
    assert.equal(links[0].alias, undefined);
    assert.equal(links[0].isEmbed, false);

    assert.equal(links[1].target, 'Aerasúl, Trueno de Gorthok');
    assert.equal(links[1].alias, 'Trueno');

    assert.equal(links[2].target, 'Bestiario');
    assert.equal(links[2].heading, 'Dragón Rojo');

    assert.equal(links[3].target, 'Trueno de Gorthok_Front.png');
    assert.equal(links[3].isEmbed, true);
  });

  it('transforma wikilinks a enlaces markdown estándar', () => {
    const text = 'Usa [[Proyectil Mágico]] o [[Curar Heridas|Curación]].';
    const transformed = transformWikilinks(text);
    assert.equal(
      transformed,
      'Usa [Proyectil Mágico](/wiki/proyectil-magico) o [Curación](/wiki/curar-heridas).'
    );
  });

  it('extrae assets multimedia incrustados', () => {
    const text = '![[Arma.png]] y texto ![[Ficha.pdf]] y un enlace [[Guerrero]].';
    const assets = extractEmbeddedAssets(text);
    assert.deepEqual(assets, ['Arma.png', 'Ficha.pdf']);
  });
});
