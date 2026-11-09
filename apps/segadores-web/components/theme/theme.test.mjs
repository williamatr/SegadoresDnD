import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveSpecificTheme,
  isDarkTheme,
  THEME_OPTIONS
} from './theme-constants.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Motor de 4 Temas Dinámicos D&D 5.5e (SegadoresDnD)', () => {
  it('contiene las 4 opciones canónicas con su metadata editorial completa', () => {
    assert.equal(THEME_OPTIONS.length, 4);

    const ids = THEME_OPTIONS.map(opt => opt.id);
    assert.deepEqual(ids, [
      'parchment-royal',
      'parchment-classic',
      'grimoire-blood',
      'grimoire-abyssal'
    ]);

    const royal = THEME_OPTIONS.find(o => o.id === 'parchment-royal');
    assert.equal(royal?.shortName, 'Real 5.5e');
    assert.equal(royal?.isDark, false);
    assert.equal(royal?.icon, '📜');

    const classic = THEME_OPTIONS.find(o => o.id === 'parchment-classic');
    assert.equal(classic?.shortName, 'Clásico');
    assert.equal(classic?.isDark, false);
    assert.equal(classic?.icon, '📖');

    const blood = THEME_OPTIONS.find(o => o.id === 'grimoire-blood');
    assert.equal(blood?.shortName, 'Grimorio');
    assert.equal(blood?.isDark, true);
    assert.equal(blood?.icon, '🩸');

    const abyssal = THEME_OPTIONS.find(o => o.id === 'grimoire-abyssal');
    assert.equal(abyssal?.shortName, 'Abisal');
    assert.equal(abyssal?.isDark, true);
    assert.equal(abyssal?.icon, '🔮');
  });

  it('resuelve alias legados ("light" -> "parchment-royal", "dark" -> "grimoire-blood")', () => {
    assert.equal(resolveSpecificTheme('light', false), 'parchment-royal');
    assert.equal(resolveSpecificTheme('light', true), 'parchment-royal');
    assert.equal(resolveSpecificTheme('dark', false), 'grimoire-blood');
    assert.equal(resolveSpecificTheme('dark', true), 'grimoire-blood');
  });

  it('resuelve "system" adecuadamente según la preferencia del sistema operativo', () => {
    assert.equal(resolveSpecificTheme('system', false), 'parchment-royal');
    assert.equal(resolveSpecificTheme('system', true), 'grimoire-blood');
  });

  it('preserva las 4 variantes temáticas específicas intactas', () => {
    assert.equal(resolveSpecificTheme('parchment-royal', false), 'parchment-royal');
    assert.equal(resolveSpecificTheme('parchment-classic', false), 'parchment-classic');
    assert.equal(resolveSpecificTheme('grimoire-blood', true), 'grimoire-blood');
    assert.equal(resolveSpecificTheme('grimoire-abyssal', true), 'grimoire-abyssal');
  });

  it('evalúa correctamente si un tema es oscuro para la clase .dark en <html>', () => {
    assert.equal(isDarkTheme('parchment-royal'), false);
    assert.equal(isDarkTheme('parchment-classic'), false);
    assert.equal(isDarkTheme('grimoire-blood'), true);
    assert.equal(isDarkTheme('grimoire-abyssal'), true);
  });

  it('valida la presencia de las variables semánticas de los 4 temas en globals.css', () => {
    const cssPath = path.resolve(__dirname, '../../app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Comprobar selectores temáticos
    assert.ok(cssContent.includes('[data-theme="parchment-royal"]'));
    assert.ok(cssContent.includes('[data-theme="parchment-classic"]'));
    assert.ok(cssContent.includes('[data-theme="grimoire-blood"]'));
    assert.ok(cssContent.includes('[data-theme="grimoire-abyssal"]'));

    // Tokens Parchment Royal
    assert.ok(cssContent.includes('#F3EDE0'));
    assert.ok(cssContent.includes('#FBF8F3'));
    assert.ok(cssContent.includes('#1E2024'));
    assert.ok(cssContent.includes('#6E140E'));

    // Tokens Parchment Classic
    assert.ok(cssContent.includes('#E9DAC2'));
    assert.ok(cssContent.includes('#F7ECDA'));
    assert.ok(cssContent.includes('#231D18'));
    assert.ok(cssContent.includes('#58180D'));

    // Tokens Grimoire Blood
    assert.ok(cssContent.includes('#090A0F'));
    assert.ok(cssContent.includes('#12141D'));
    assert.ok(cssContent.includes('#ECE8DF'));
    assert.ok(cssContent.includes('#F87171'));
    assert.ok(cssContent.includes('#991B1B')); // crimson-btn

    // Tokens Grimoire Abyssal
    assert.ok(cssContent.includes('#090810'));
    assert.ok(cssContent.includes('#13111F'));
    assert.ok(cssContent.includes('#EAE6F5'));
    assert.ok(cssContent.includes('#C084FC'));
    assert.ok(cssContent.includes('#6D28D9')); // crimson-btn

    // Botones con texto contrastado y fondo
    assert.ok(cssContent.includes('--dnd-crimson-btn'));
    assert.ok(cssContent.includes('--dnd-crimson-fg'));
  });
});
