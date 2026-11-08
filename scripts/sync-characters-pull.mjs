#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';

// Cargar variables de entorno desde .env.local sin dependencias externas
const envPath = resolve(process.cwd(), '.env.local');
const env = {};
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
}

const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isDryRun = process.argv.includes('--dry-run');

console.log('📥 [SegadoresDnD] Iniciando volcado no destructivo (Supabase -> Obsidian Markdown)...\n');

const charactersDir = resolve(process.cwd(), 'content/wiki/Personajes_Jugadores');

if (!existsSync(charactersDir)) {
  console.error(`❌ No se encontró el directorio de personajes en: ${charactersDir}`);
  process.exit(1);
}

/**
 * Actualiza de forma quirúrgica y no destructiva los valores dinámicos de una hoja Markdown
 * preservando intactos los callouts ([!statblock], [!dnd-grid], [!info], [!todo]), wikilinks y lore.
 */
export function applyCharacterToMarkdown(rawContent, char) {
  let updated = rawContent;
  const changes = [];

  // 1. Actualizar nivel en Frontmatter si cambió
  if (typeof char.level === 'number') {
    updated = updated.replace(/^(---\r?\n[\s\S]*?\bnivel:\s*)(\d+)([\s\S]*?\r?\n---)/m, (full, pre, oldVal, post) => {
      if (parseInt(oldVal, 10) !== char.level) {
        changes.push(`Frontmatter nivel: ${oldVal} -> ${char.level}`);
        return `${pre}${char.level}${post}`;
      }
      return full;
    });
  }

  // 2. Actualizar Clase de Armadura (CA) preservando texto descriptivo posterior
  if (typeof char.armor_class === 'number') {
    updated = updated.replace(/(>\s*\*\*Clase de Armadura\s*\(CA\):\*\*\s*)(\d+)/i, (full, prefix, oldAc) => {
      if (parseInt(oldAc, 10) !== char.armor_class) {
        changes.push(`CA: ${oldAc} -> ${char.armor_class}`);
        return `${prefix}${char.armor_class}`;
      }
      return full;
    });
  }

  // 3. Actualizar Puntos de Golpe en [!statblock]
  if (typeof char.max_hp === 'number') {
    updated = updated.replace(/(>\s*\*\*Puntos de Golpe:\*\*\s*)(\d+)/i, (full, prefix, oldHp) => {
      if (parseInt(oldHp, 10) !== char.max_hp) {
        changes.push(`Puntos de Golpe (Max): ${oldHp} -> ${char.max_hp}`);
        return `${prefix}${char.max_hp}`;
      }
      return full;
    });
  }

  // 4. Actualizar Velocidad preservando notas entre paréntesis
  if (typeof char.speed === 'number') {
    updated = updated.replace(/(>\s*\*\*Velocidad:\*\*\s*)(\d+)/i, (full, prefix, oldSpd) => {
      if (parseInt(oldSpd, 10) !== char.speed) {
        changes.push(`Velocidad: ${oldSpd} -> ${char.speed}`);
        return `${prefix}${char.speed}`;
      }
      return full;
    });
  }

  // 5. Actualizar Bonificador de Competencia
  if (typeof char.proficiency_bonus === 'number') {
    updated = updated.replace(/(>\s*\*\*Bonificador de Competencia(?:\s*\(PB\))?:\*\*\s*\+?)(\d+)/i, (full, prefix, oldPb) => {
      if (parseInt(oldPb, 10) !== char.proficiency_bonus) {
        changes.push(`Bonificador de Competencia: +${oldPb} -> +${char.proficiency_bonus}`);
        return `${prefix}${char.proficiency_bonus}`;
      }
      return full;
    });
  }

  // 6. Actualizar Puntos de Experiencia (XP) si la línea existe en el statblock
  if (typeof char.experience_points === 'number' && char.experience_points > 0) {
    updated = updated.replace(/(>\s*\*\*Puntos de Experiencia\s*\(XP\):\*\*\s*)([\d.]+)/i, (full, prefix, oldXpRaw) => {
      const oldXp = parseInt(oldXpRaw.replace(/\./g, ''), 10);
      if (oldXp !== char.experience_points) {
        changes.push(`XP: ${oldXpRaw} -> ${char.experience_points}`);
        return `${prefix}${char.experience_points}`;
      }
      return full;
    });
  }

  return { updated, changes };
}

async function main() {
  const localFiles = readdirSync(charactersDir).filter(f => f.endsWith('.md'));
  const fileBySlug = new Map(localFiles.map(f => [basename(f, '.md').toLowerCase(), f]));

  if (!supabaseUrl || !supabaseKey || isDryRun) {
    console.log('🧪 [Modo Local / Dry-Run] Verificando motor de fusión no destructiva sobre archivos locales...');
    for (const [slug, file] of fileBySlug.entries()) {
      const filePath = join(charactersDir, file);
      const raw = readFileSync(filePath, 'utf8');
      const { updated, changes } = applyCharacterToMarkdown(raw, {});
      if (updated === raw && changes.length === 0) {
        console.log(`   ✅ [${slug}] ${file}: Estructura íntegra y lista para fusión no destructiva.`);
      }
    }
    console.log('\nℹ️  Para volcar desde Supabase en vivo, ejecuta `pnpm sync:pull` con credenciales activas.');
    return;
  }

  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };

  try {
    const res = await fetch(`${baseUrl}/rest/v1/characters?select=*&order=slug.asc`, { headers });
    if (!res.ok) {
      throw new Error(`Error al consultar public.characters (${res.status}): ${await res.text()}`);
    }

    const dbCharacters = await res.json();
    console.log(`🌐 Descargados ${dbCharacters.length} personajes desde Supabase.\n`);

    let updatedFilesCount = 0;

    for (const char of dbCharacters) {
      const targetFile = fileBySlug.get((char.slug || '').toLowerCase());
      if (!targetFile) {
        console.warn(`⚠️  No se encontró archivo Markdown local para slug "${char.slug}". Omitiendo.`);
        continue;
      }

      const filePath = join(charactersDir, targetFile);
      const rawContent = readFileSync(filePath, 'utf8');
      const { updated, changes } = applyCharacterToMarkdown(rawContent, char);

      if (changes.length > 0) {
        writeFileSync(filePath, updated, 'utf8');
        updatedFilesCount++;
        console.log(`📝 [${char.slug}] ${targetFile} actualizado (${changes.length} cambios):`);
        for (const c of changes) {
          console.log(`   - ${c}`);
        }
      } else {
        console.log(`⚪ [${char.slug}] ${targetFile}: Sin cambios respecto a la base de datos.`);
      }
    }

    console.log(`\n🎉 Volcado finalizado. Archivos actualizados: ${updatedFilesCount}/${dbCharacters.length}.`);
  } catch (err) {
    console.error('❌ Error durante sync:pull:', err.message);
    process.exitCode = 1;
  }
}

main();
