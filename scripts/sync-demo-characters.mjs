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

const files = readdirSync(demoDir).filter(f => f.endsWith('.md')).sort();
console.log(`📁 Encontradas ${files.length} plantillas de clase de prueba:\n`);

const HIT_DIE_BY_CLASS = {
  barbaro: 'd12',
  guerrero: 'd10',
  paladin: 'd10',
  explorador: 'd10',
  bardo: 'd8',
  clerigo: 'd8',
  druida: 'd8',
  monje: 'd8',
  picaro: 'd8',
  brujo: 'd8',
  hechicero: 'd6',
  mago: 'd6'
};

const SPELL_ABILITY_BY_CLASS = {
  bardo: 'CAR',
  brujo: 'CAR',
  hechicero: 'CAR',
  paladin: 'CAR',
  clerigo: 'SAB',
  druida: 'SAB',
  explorador: 'SAB',
  mago: 'INT'
};

const parsedDemoCharacters = [];

for (const file of files) {
  const filePath = join(demoDir, file);
  const rawContent = readFileSync(filePath, 'utf8');

  const classNameRaw = basename(file, '.md');
  const headerMatch = rawContent.match(/^#\s+([^-–\n\r]+?)\s*[-–]\s*Nivel\s+(\d+)/m);
  const className = headerMatch ? headerMatch[1].trim() : classNameRaw.charAt(0).toUpperCase() + classNameRaw.slice(1);
  const level = headerMatch ? parseInt(headerMatch[2], 10) : 8;
  const slug = `demo-${classNameRaw}`;

  // 1. Extraer Atributos
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

  const mod = (score) => Math.floor((score - 10) / 2);

  // 2. Extraer CA, HP, Velocidad, Iniciativa y Bono de Competencia
  const acMatch = rawContent.match(/Clase de Armadura\s*\(CA\):\*?\*?\s*(\d+)/i);
  const armorClass = acMatch ? parseInt(acMatch[1], 10) : 10;

  const hpMatch = rawContent.match(/Puntos de Golpe\s*\((?:PG|HP)\):\*?\*?\s*(\d+)/i);
  const maxHp = hpMatch ? parseInt(hpMatch[1], 10) : 10;

  const speedMatch = rawContent.match(/Velocidad:\*?\*?\s*(\d+)/i);
  const speed = speedMatch ? parseInt(speedMatch[1], 10) : 30;

  const initMatch = rawContent.match(/Iniciativa:\*?\*?\s*\+?(-?\d+)/i);
  const initiativeModifier = initMatch ? parseInt(initMatch[1], 10) : mod(abilityScores.dex);

  const profMatch = rawContent.match(/Bono de Competencia:\*?\*?\s*\+?(\d+)/i);
  const profBonus = profMatch ? parseInt(profMatch[1], 10) : 3;

  // 3. Extraer Salvaciones y Habilidades Sugeridas
  const savesProf = [];
  const savesLine = rawContent.match(/Tiradas de Salvaci[oó]n:\*?\*?\s*([^\n\r]+)/i);
  if (savesLine) {
    const sText = savesLine[1];
    if (/Fuerza/i.test(sText)) savesProf.push('FUE');
    if (/Destreza/i.test(sText)) savesProf.push('DES');
    if (/Constituci[oó]n/i.test(sText)) savesProf.push('CON');
    if (/Inteligencia/i.test(sText)) savesProf.push('INT');
    if (/Sabidur[ií]a/i.test(sText)) savesProf.push('SAB');
    if (/Carisma/i.test(sText)) savesProf.push('CAR');
  }

  const skills = {};
  const skillsLine = rawContent.match(/Habilidades Sugeridas:\*?\*?\s*([^\n\r]+)/i);
  if (skillsLine) {
    const attrKeyMap = { FUE: 'str', DES: 'dex', CON: 'con', INT: 'int', SAB: 'wis', CAR: 'cha' };
    const entries = skillsLine[1].split(',');
    for (const entry of entries) {
      const m = entry.trim().match(/^([^(]+)\(([A-Z]{3})\)/i);
      if (m) {
        const sName = m[1].trim();
        const aCode = m[2].toUpperCase();
        const aScore = abilityScores[attrKeyMap[aCode] || 'int'] || 10;
        const sBonus = mod(aScore) + profBonus;
        skills[sName] = { bonus: sBonus, base_bonus: sBonus, proficiency: 'proficient' };
      }
    }
  }

  // 4. Extraer Subclase del encabezado ## Rasgos de Clase (...)
  const subclassMatch = rawContent.match(/##\s+Rasgos de Clase\s*\(([^)]+)\)/i);
  const subclass = subclassMatch ? subclassMatch[1].trim() : undefined;

  // 5. Extraer Espacios de Conjuro y Hechizos
  const spellSlots = {};
  const slotsMatch = rawContent.match(/Espacios:\*?\*?\s*([^\n\r]+)/i);
  if (slotsMatch) {
    const slotsLine = slotsMatch[1];
    const slotPairs = slotsLine.matchAll(/Nivel\s+(\d+)\s*\((\d+)\)/gi);
    for (const m of slotPairs) {
      spellSlots[m[1]] = { total: parseInt(m[2], 10), used: 0 };
    }
  }

  const cantrips = [];
  const cantripsMatch = rawContent.match(/Trucos(?:\s*\(\d+\))?:\*?\*?\s*([^\n\r]+)/i);
  if (cantripsMatch) {
    for (const c of cantripsMatch[1].split(',')) {
      const cleaned = c.trim().replace(/\.$/, '');
      if (cleaned) cantrips.push(cleaned);
    }
  }

  const preparedSpells = [];
  const spellsMatch = rawContent.match(/(?:Sugeridos|Conjuros de Dominio|Conjuros de Juramento|Conocidos Sugeridos):\*?\*?\s*([^\n\r]+)/i);
  if (spellsMatch) {
    for (const s of spellsMatch[1].split(',')) {
      const cleaned = s.trim().replace(/\.$/, '');
      if (cleaned) preparedSpells.push(cleaned);
    }
  }

  const knownSpells = [...cantrips, ...preparedSpells];

  // 6. Aptitud Mágica si aplica
  const spellAbil = SPELL_ABILITY_BY_CLASS[classNameRaw] || null;
  const attrKeyForSpell = spellAbil === 'INT' ? 'int' : spellAbil === 'SAB' ? 'wis' : spellAbil === 'CAR' ? 'cha' : null;
  const spellMod = attrKeyForSpell ? mod(abilityScores[attrKeyForSpell]) : 0;
  const spellSaveDc = spellAbil ? 8 + profBonus + spellMod : null;
  const spellAttackBonus = spellAbil ? profBonus + spellMod : null;
  const spellcastingStats = spellAbil
    ? [{
        source: className,
        ability: spellAbil,
        ability_en: spellAbil === 'SAB' ? 'WIS' : spellAbil === 'CAR' ? 'CHA' : 'INT',
        save_dc: spellSaveDc,
        attack_bonus: spellAttackBonus
      }]
    : [];

  // 7. Trasfondo sugerido
  const bgMatch = rawContent.match(/\*\*Trasfondo:\*\*.*ej\.\s*([^\]\n\r]+)/i);
  const background = bgMatch ? bgMatch[1].trim() : 'Aventurero';

  const hitDie = HIT_DIE_BY_CLASS[classNameRaw] || 'd8';
  const hasPerceptionProf = Object.keys(skills).some(k => /Percepci[oó]n/i.test(k));
  const passivePerception = 10 + mod(abilityScores.wis) + (hasPerceptionProf ? profBonus : 0);

  const demoChar = {
    name: `${className} (Nivel ${level})`,
    slug,
    character_class: subclass ? `${className} (${subclass})` : className,
    level,
    race: 'Humano (Estándar SRD)',
    background,
    alignment: 'Neutral Bueno',
    experience_points: 34000,
    max_hp: maxHp,
    current_hp: maxHp,
    temp_hp: 0,
    hit_dice_total: `${level}${hitDie}`,
    hit_dice_current: level,
    armor_class: armorClass,
    speed,
    proficiency_bonus: profBonus,
    passive_perception: passivePerception,
    initiative_modifier: initiativeModifier,
    spellcasting_ability: spellAbil,
    spell_save_dc: spellSaveDc,
    spell_attack_bonus: spellAttackBonus,
    spellcasting_stats: spellcastingStats,
    ability_scores: abilityScores,
    spell_slots: spellSlots,
    prepared_spells: preparedSpells,
    known_spells: knownSpells,
    inventory: [
      { slug: 'mochila-de-aventurero', name: 'Mochila de aventurero', category: 'gear', qty: 1, equipped: true, requires_attunement: false, attuned: false, notes: 'Equipo estándar de exploración' },
      { slug: 'pocion-de-curacion', name: 'Poción de curación (2d4+2)', category: 'magic_item', qty: 2, equipped: false, requires_attunement: false, attuned: false, notes: 'Acción adicional para beber' },
      { slug: 'raciones-de-viaje', name: 'Raciones de viaje (días)', category: 'gear', qty: 5, equipped: false, requires_attunement: false, attuned: false, notes: '' }
    ],
    currency: { cp: 0, sp: 25, ep: 0, gp: 150, pp: 0 },
    active_effects: [],
    class_resources: [],
    personality: {
      traits: 'Siempre listo para probar mis habilidades ante cualquier desafío.',
      ideals: 'Honor y compañerismo en la aventura.',
      bonds: 'Proteger a mi grupo en las tierras salvajes.',
      flaws: 'A veces subestimo el peligro de una mazmorra desconocida.'
    },
    appearance: `Aventurero arquetípico de clase ${className} equipado para la exploración.`,
    backstory: 'Plantilla canónica de clase del SRD 5.1/5.2 para pruebas interactivas en la Demo Pública.',
     player_notes: '',
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    skills,
    saving_throws_prof: savesProf,
    multiclass: [{ class: className, ...(subclass ? { subclass } : {}), level }],
    attunement_slots: 3
  };

  parsedDemoCharacters.push(demoChar);
  console.log(`✅ [${demoChar.slug}] ${demoChar.name} — ${demoChar.character_class}`);
  console.log(`   CA: ${demoChar.armor_class} | HP: ${demoChar.max_hp} (${demoChar.hit_dice_total}) | Vel: ${demoChar.speed}ft | Prof: +${demoChar.proficiency_bonus}`);
  console.log(`   Salvaciones: [${demoChar.saving_throws_prof.join(', ')}] | Habilidades: ${Object.keys(demoChar.skills).join(', ')}`);
  if (Object.keys(spellSlots).length || knownSpells.length) {
    console.log(`   Magia (${spellAbil || '-'}): ${knownSpells.length} conjuros | Ranuras: ${JSON.stringify(spellSlots)}`);
  }
  console.log('');
}

// Enviar a Supabase REST API si hay credenciales
if (supabaseUrl && supabaseKey && !process.argv.includes('--dry-run')) {
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
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Error de red:', err.message);
    process.exitCode = 1;
  }
} else if (process.argv.includes('--dry-run')) {
  console.log('🧪 [Dry Run] Validación de las 12 plantillas demo completada sin conexión a red.');
}
