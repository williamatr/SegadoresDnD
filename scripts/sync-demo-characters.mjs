#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';

// Cargar variables de entorno desde .env.local
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

console.log('🎲 [SegadoresDnD] Iniciando ingesta de Personajes Demo de Prueba (Obsidian -> Supabase)...\n');

const demoDir = resolve(process.cwd(), 'content/wiki/personaje_de_prueba');

if (!existsSync(demoDir)) {
  console.error(`❌ No se encontró el directorio en: ${demoDir}`);
  process.exit(1);
}

const files = readdirSync(demoDir).filter(f => f.endsWith('.md'));
console.log(`📁 Encontradas ${files.length} plantillas de clase de prueba:\n`);

const parsedDemoCharacters = [];

for (const file of files) {
  const filePath = join(demoDir, file);
  const rawContent = readFileSync(filePath, 'utf8');

  const classNameRaw = basename(file, '.md');
  const className = classNameRaw.charAt(0).toUpperCase() + classNameRaw.slice(1);
  const slug = `demo-${classNameRaw}`;

  // 1. Extraer Nivel del encabezado # Clase - Nivel X
  const levelMatch = rawContent.match(/#\s+.*Nivel\s+(\d+)/i);
  const level = levelMatch ? parseInt(levelMatch[1], 10) : 8;

  // 2. Extraer Atributos
  const parseAttr = (code) => {
    const match = rawContent.match(new RegExp(`\\*?\\*?.*\\(${code}\\):\\*?\\*?\\s*(\\d+)`, 'i'));
    return match ? parseInt(match[1], 10) : 10;
  };

  const abilityScores = {
    str: parseAttr('FUE'),
    dex: parseAttr('DES'),
    con: parseAttr('CON'),
    int: parseAttr('INT'),
    wis: parseAttr('SAB'),
    cha: parseAttr('CAR')
  };

  // 3. Extraer CA
  const acMatch = rawContent.match(/Clase de Armadura\s*\(CA\):\*?\*?\s*(\d+)/i);
  const armorClass = acMatch ? parseInt(acMatch[1], 10) : 10;

  // 4. Extraer HP
  const hpMatch = rawContent.match(/Puntos de Golpe\s*\((?:PG|HP)\):\*?\*?\s*(\d+)/i);
  const maxHp = hpMatch ? parseInt(hpMatch[1], 10) : 10;

  // 5. Extraer Velocidad
  const speedMatch = rawContent.match(/Velocidad:\*?\*?\s*(\d+)/i);
  const speed = speedMatch ? parseInt(speedMatch[1], 10) : 30;

  // 6. Extraer Bono de Competencia
  const profMatch = rawContent.match(/Bono de Competencia:\*?\*?\s*\+?(\d+)/i);
  const profBonus = profMatch ? parseInt(profMatch[1], 10) : 3;

  // 7. Extraer Espacios de Conjuro si existen
  const spellSlots = {};
  const slotsMatch = rawContent.match(/Espacios:\s*([^\n\r]+)/i);
  if (slotsMatch) {
    const slotsLine = slotsMatch[1];
    const slotPairs = slotsLine.matchAll(/Nivel\s+(\d+)\s*\((\d+)\)/gi);
    for (const m of slotPairs) {
      spellSlots[m[1]] = { total: parseInt(m[2], 10), used: 0 };
    }
  }

  // 8. Extraer Hechizos sugeridos si existen
  let preparedSpells = [];
  const spellsMatch = rawContent.match(/Sugeridos:\s*([^\n\r]+)/i);
  if (spellsMatch) {
    preparedSpells = spellsMatch[1].split(',').map(s => s.trim().replace(/\.$/, ''));
  }

  const demoChar = {
    name: `${className} (Nivel ${level})`,
    slug,
    character_class: className,
    level,
    race: 'Humano / Estándar',
    max_hp: maxHp,
    current_hp: maxHp,
    armor_class: armorClass,
    speed,
    proficiency_bonus: profBonus,
    ability_scores: abilityScores,
    spell_slots: spellSlots,
    prepared_spells: preparedSpells,
    inventory: [
      { name: 'Mochila de aventurero', qty: 1 },
      { name: 'Raciones (días)', qty: 5 }
    ]
  };

  parsedDemoCharacters.push(demoChar);
  console.log(`✅ [${demoChar.slug}] ${demoChar.name}`);
  console.log(`   CA: ${demoChar.armor_class} | HP: ${demoChar.max_hp} | Vel: ${demoChar.speed}ft | Prof: +${demoChar.proficiency_bonus}`);
  console.log(`   Atributos: FUE ${abilityScores.str}, DES ${abilityScores.dex}, CON ${abilityScores.con}, INT ${abilityScores.int}, SAB ${abilityScores.wis}, CAR ${abilityScores.cha}`);
  if (Object.keys(spellSlots).length) {
    console.log(`   Ranuras: ${JSON.stringify(spellSlots)}`);
  }
  console.log('');
}

// 9. Enviar a Supabase REST API si hay credenciales
if (supabaseUrl && supabaseKey) {
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Prefer': 'resolution=merge-duplicates,return=representation'
  };

  console.log(`🌐 Insertando las 12 plantillas demo en public.demo_characters (${baseUrl})...`);
  try {
    const res = await fetch(`${baseUrl}/rest/v1/demo_characters?on_conflict=slug`, {
      method: 'POST',
      headers,
      body: JSON.stringify(parsedDemoCharacters)
    });

    if (res.ok) {
      const inserted = await res.json();
      console.log(`🎉 ¡Éxito! ${inserted.length} personajes demo guardados en la tabla public.demo_characters.`);
    } else {
      console.warn(`⚠️ Error al enviar a Supabase (${res.status}): ${await res.text()}`);
    }
  } catch (err) {
    console.error('❌ Error de red:', err.message);
  }
}
