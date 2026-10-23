#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const wikiDir = resolve(rootDir, 'content/wiki');
const mocksDir = resolve(rootDir, 'content/mocks');

console.log('\n🎲 [SegadoresDnD] Verificando sincronización del lore (Obsidian)...');

// Deshabilitar interacción interactiva de Git para evitar prompts de credenciales a terceros
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

try {
  execSync('git submodule update --init --remote content/wiki', {
    stdio: 'pipe',
    env,
  });
  console.log('✅ [SegadoresDnD] Submódulo privado (content/wiki) sincronizado exitosamente al último commit.\n');
} catch (error) {
  const isWikiEmpty = !existsSync(wikiDir) || readdirSync(wikiDir).length === 0;

  console.warn('\n⚠️  [SegadoresDnD] Aviso sobre el submódulo privado de lore:');
  console.warn('   No se pudo sincronizar el repositorio privado (content/wiki).');
  console.warn('   Esto es totalmente normal si eres un visitante explorando este proyecto como portafolio');
  console.warn('   o si estás ejecutando el entorno sin conexión a internet.');

  if (isWikiEmpty) {
    console.log('ℹ️  [SegadoresDnD] Activando contenido de respaldo público SRD 5.1/5.2 (content/mocks/).\n');
  } else {
    console.log('ℹ️  [SegadoresDnD] Conservando la copia local existente en content/wiki/.\n');
  }
}
