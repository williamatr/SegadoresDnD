import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpellNote, parseItemNote, loadCompendium } from '../parser/compendium-extractor.ts';
import path from 'node:path';

describe('@segadores/obsidian-engine - Compendium Extractor', () => {
  it('parsea un conjuro con frontmatter YAML (formato mock SRD)', () => {
    const raw = `---
title: Proyectil Mágico
type: hechizo
nivel: 1
escuela: Evocación
clases:
  - Mago
  - Hechicero
tiempo_lanzamiento: 1 acción
alcance: 120 pies
componentes: V, S
duracion: Instantánea
tags:
  - dnd/hechizo
  - srd
---

# Proyectil Mágico
> [!info] Mecánica
> Creas tres dardos brillantes.`;

    const spell = parseSpellNote(raw, 'content/mocks/Hechizos/Proyectil_Magico.md');
    assert.equal(spell.slug, 'proyectil-magico');
    assert.equal(spell.name, 'Proyectil Mágico');
    assert.equal(spell.level, 1);
    assert.equal(spell.levelLabel, 'Nivel 1');
    assert.equal(spell.school, 'Evocación');
    assert.deepEqual(spell.classes, ['Mago', 'Hechicero']);
    assert.equal(spell.castingTime, '1 acción');
    assert.equal(spell.range, '120 pies');
    assert.equal(spell.components.verbal, true);
    assert.equal(spell.components.somatic, true);
    assert.equal(spell.components.material, false);
    assert.equal(spell.concentration, false);
  });

  it('parsea un conjuro con metadatos inline (formato Obsidian Wiki)', () => {
    const raw = `# Acelerar
*Nivel 3 - Transmutación*

- **Clases:** Hechicero, Mago
- **Tiempo de Lanzamiento:** Acción
- **Alcance:** ['30 pies', '9 m']
- **Componentes:** V, S, M (Una ralladura de raíz de regaliz.)
- **Duración:** Concentración, Hasta 1 minuto

## Descripción
Elige a una criatura voluntaria que puedas ver dentro del alcance.`;

    const spell = parseSpellNote(raw, 'content/wiki/Acelerar.md');
    assert.equal(spell.slug, 'acelerar');
    assert.equal(spell.name, 'Acelerar');
    assert.equal(spell.level, 3);
    assert.equal(spell.levelLabel, 'Nivel 3');
    assert.equal(spell.school, 'Transmutación');
    assert.deepEqual(spell.classes, ['Hechicero', 'Mago']);
    assert.equal(spell.castingTime, 'Acción');
    assert.equal(spell.range, '30 pies');
    assert.equal(spell.components.verbal, true);
    assert.equal(spell.components.somatic, true);
    assert.equal(spell.components.material, true);
    assert.equal(spell.components.materialDescription, 'Una ralladura de raíz de regaliz.');
    assert.equal(spell.concentration, true);
    assert.ok(spell.description.includes('Elige a una criatura voluntaria'));
  });

  it('parsea un objeto mágico con sintonización y propiedades', () => {
    const raw = `# Aerasúl, Trueno de Gorthok
*Arma (espada larga), muy rara (requiere sincronización / sintonización)*
*Propiedades: Versátil (1d8 cortante a una mano / 1d10 a dos manos)*

## Descripción
Una espada rúnica de hoja afilada y oscura envuelta en ráfagas de viento.`;

    const item = parseItemNote(raw, 'content/wiki/Aerasul.md');
    assert.equal(item.slug, 'aerasul-trueno-de-gorthok');
    assert.equal(item.name, 'Aerasúl, Trueno de Gorthok');
    assert.equal(item.category, 'weapon');
    assert.equal(item.rarity, 'muy rara');
    assert.equal(item.requiresAttunement, true);
    assert.ok(item.description.includes('Una espada rúnica'));
  });

  it('carga compendio completo desde la wiki local sin errores', async () => {
    const rootDir = process.cwd().includes('packages/obsidian-engine')
      ? path.resolve(process.cwd(), '../..')
      : process.cwd();
    const wikiDir = path.resolve(rootDir, 'content/wiki');
    const mockDir = path.resolve(rootDir, 'content/mocks');
    const compendium = await loadCompendium(wikiDir, mockDir);

    assert.ok(compendium.totalSpells > 0);
    assert.ok(compendium.totalItems > 0);
    assert.equal(compendium.isFallback, false);

    // Comprobar que algún conjuro conocido está presente
    const acelerar = compendium.spells.find(s => s.slug === 'acelerar');
    assert.ok(acelerar);
    assert.equal(acelerar.school, 'Transmutación');
  });

  it('carga compendio en modo fallback usando mocks SRD cuando la wiki privada no existe', async () => {
    const rootDir = process.cwd().includes('packages/obsidian-engine')
      ? path.resolve(process.cwd(), '../..')
      : process.cwd();
    const mockDir = path.resolve(rootDir, 'content/mocks');
    const compendium = await loadCompendium('/directorio/inexistente', mockDir);

    assert.equal(compendium.isFallback, true);
    assert.ok(compendium.totalSpells >= 1);
    assert.ok(compendium.totalItems >= 1);

    const projectile = compendium.spells.find(s => s.slug === 'proyectil-magico');
    assert.ok(projectile);
    assert.equal(projectile.level, 1);

    const potion = compendium.items.find(i => i.slug === 'pocion-de-curacion');
    assert.ok(potion);
    assert.equal(potion.category, 'consumable');
  });
});
