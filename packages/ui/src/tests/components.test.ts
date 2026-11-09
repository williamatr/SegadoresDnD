import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TaperedRule,
  ParchmentFrame,
  DropCap,
  HeraldicShield,
  DndBadge,
  DndTable,
} from '../index.ts';

describe('@segadores/ui - Componentes Anatómicos D&D 5e', () => {
  it('TaperedRule: genera el SVG cónico con el degradado carmesí por defecto', () => {
    const html = renderToStaticMarkup(React.createElement(TaperedRule));
    assert.ok(html.includes('<svg'));
    assert.ok(html.includes('id="tapered-grad-crimson"'));
    assert.ok(html.includes('#58180D'));
    assert.ok(html.includes('polygon points="0,4 250,1 500,4 250,7"'));
  });

  it('TaperedRule: soporta variante dorada de manual', () => {
    const html = renderToStaticMarkup(
      React.createElement(TaperedRule, { variant: 'gold' })
    );
    assert.ok(html.includes('id="tapered-grad-gold"'));
    assert.ok(html.includes('#c29b38'));
  });

  it('ParchmentFrame: aplica recorte biselado (notched) y estilos de pergamino', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ParchmentFrame,
        { notched: true, variant: 'card' },
        'Contenido Pergamino'
      )
    );
    assert.ok(html.includes('dnd-notched'));
    assert.ok(html.includes('bg-dnd-parchment'));
    assert.ok(html.includes('Contenido Pergamino'));
  });

  it('ParchmentFrame: soporta variante de tomo de cuero (leather)', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ParchmentFrame,
        { variant: 'leather' },
        'Portada de Cuero'
      )
    );
    assert.ok(html.includes('bg-dnd-leather'));
    assert.ok(html.includes('text-dnd-parchment'));
    assert.ok(html.includes('border-dnd-gold'));
  });

  it('DropCap: genera letra capitular iluminada con estilo de imprenta', () => {
    const html = renderToStaticMarkup(
      React.createElement(DropCap, { letter: 'e', variant: 'gold' })
    );
    assert.ok(html.includes('E'));
    assert.ok(html.includes('font-dnd-title'));
    assert.ok(html.includes('text-dnd-gold'));
  });

  it('HeraldicShield: genera el escudo medieval de CA con el valor y blasón', () => {
    const html = renderToStaticMarkup(
      React.createElement(HeraldicShield, {
        value: 18,
        label: 'CA',
        sublabel: 'Placas',
        size: 'md',
      })
    );
    assert.ok(html.includes('18'));
    assert.ok(html.includes('CA'));
    assert.ok(html.includes('Placas'));
    assert.ok(html.includes('d="M 10 10 Q 50 15 90 10 L 90 60 Q 90 100 50 115 Q 10 100 10 60 Z"'));
  });

  it('DndBadge: renderiza insignias con variantes de color y versalitas', () => {
    const html = renderToStaticMarkup(
      React.createElement(DndBadge, { variant: 'crimson' }, 'Evocación')
    );
    assert.ok(html.includes('Evocación'));
    assert.ok(html.includes('bg-dnd-crimson'));
    assert.ok(html.includes('font-dnd-title'));
  });

  it('DndTable: renderiza cabecera carmesí, caption y filas alternadas de pergamino', () => {
    const headers = ['Nivel', 'Bonificador', 'Rasgos'];
    const rows = [
      ['1º', '+2', 'Estilo de Combate, Recuperar el Aliento'],
      ['2º', '+2', 'Oleada de Acción (1 uso)'],
    ];
    const html = renderToStaticMarkup(
      React.createElement(DndTable, {
        caption: 'El Guerrero',
        headers,
        rows,
      })
    );
    assert.ok(html.includes('El Guerrero'));
    assert.ok(html.includes('bg-dnd-crimson'));
    assert.ok(html.includes('Oleada de Acción'));
    assert.ok(html.includes('bg-dnd-parchment'));
    assert.ok(html.includes('bg-dnd-parchment-contrast'));
  });
});
