#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
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

console.log('⚔️  [SegadoresDnD] Iniciando sincronización de Campaña y Personajes (Obsidian -> Supabase)...\n');

const charactersDir = resolve(process.cwd(), 'content/wiki/Personajes_Jugadores');

if (!existsSync(charactersDir)) {
  console.error(`❌ No se encontró el directorio de personajes en: ${charactersDir}`);
  process.exit(1);
}

const files = readdirSync(charactersDir).filter(f => f.endsWith('.md'));
console.log(`📁 Encontrados ${files.length} archivos de personaje en Obsidian:\n`);

const parsedCharacters = [];

for (const file of files) {
  const filePath = join(charactersDir, file);
  const rawContent = readFileSync(filePath, 'utf8');

  // Normalizar contenido eliminando prefijos de callouts de Obsidian ("> ")
  const cleanContent = rawContent
    .split('\n')
    .map(line => line.replace(/^>\s?/, ''))
    .join('\n');

  // 1. Extraer Frontmatter
  const frontmatterMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const frontmatter = {};
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    for (const l of lines) {
      const [k, ...v] = l.split(':');
      if (k && v.length) {
        frontmatter[k.trim()] = v.join(':').trim();
      }
    }
  }

  // 2. Extraer Nombre del encabezado # Nombre
  const nameMatch = rawContent.match(/^#\s+(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : basename(file, '.md');
  const slug = basename(file, '.md').toLowerCase();

  // 3. Extraer CA (Clase de Armadura)
  const acMatch = cleanContent.match(/Clase de Armadura\s*\(CA\):\*?\*?\s*(\d+)/i);
  const armorClass = acMatch ? parseInt(acMatch[1], 10) : 10;

  // 4. Extraer Puntos de Golpe (HP)
  const hpMatch = cleanContent.match(/Puntos de Golpe:\*?\*?\s*(\d+)/i);
  const maxHp = hpMatch ? parseInt(hpMatch[1], 10) : 10;

  // 5. Extraer Dados de Golpe
  const hitDiceMatch = cleanContent.match(/Dados de Golpe:\*?\*?\s*([^\n\r]+)/i);
  const hitDice = hitDiceMatch ? hitDiceMatch[1].trim().replace(/\*\*/g, '') : '1d8';

  // 6. Extraer Velocidad
  const speedMatch = cleanContent.match(/Velocidad:\*?\*?\s*(\d+)/i);
  const speed = speedMatch ? parseInt(speedMatch[1], 10) : 30;

  // 7. Extraer Bonificador de Competencia
  const profMatch = cleanContent.match(/Bonificador de Competencia:\*?\*?\s*\+?(\d+)/i);
  const profBonus = profMatch ? parseInt(profMatch[1], 10) : 2;

  // 8. Extraer Atributos de la tabla Markdown: | FUE | DES | CON | INT | SAB | CAR |
  const abilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const tableRegex = /\|\s*FUE\s*\|\s*DES\s*\|\s*CON\s*\|\s*INT\s*\|\s*SAB\s*\|\s*CAR\s*\|\s*\r?\n\|[\s:|-]+\|\s*\r?\n\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|/i;
  const tableMatch = cleanContent.match(tableRegex);

  if (tableMatch) {
    const parseScore = (str) => {
      const numMatch = str.match(/\b(\d+)\b/);
      return numMatch ? parseInt(numMatch[1], 10) : 10;
    };
    abilityScores.str = parseScore(tableMatch[1]);
    abilityScores.dex = parseScore(tableMatch[2]);
    abilityScores.con = parseScore(tableMatch[3]);
    abilityScores.int = parseScore(tableMatch[4]);
    abilityScores.wis = parseScore(tableMatch[5]);
    abilityScores.cha = parseScore(tableMatch[6]);
  }

  // 9. Extraer Aptitud Mágica
  const spellAbilityMatch = cleanContent.match(/Aptitud Mágica\s*\(([A-Z]{3})\)/i);
  const spellcastingAbility = spellAbilityMatch ? spellAbilityMatch[1].toUpperCase() : null;

  const dcMatch = cleanContent.match(/CD de salvaci[oó]n(?: de conjuros)?:\s*\*?\*?(\d+)/i);
  const spellSaveDc = dcMatch ? parseInt(dcMatch[1], 10) : null;

  const spellAttackMatch = cleanContent.match(/Bonificador de ataque de conjuro:\s*\*?\*?\+?(\d+)/i);
  const spellAttackBonus = spellAttackMatch ? parseInt(spellAttackMatch[1], 10) : null;

  // Sanitizar alineamiento (si tiene notas largas como en Solaria)
  let alignment = (frontmatter.alineamiento || 'Neutral').trim();
  if (alignment.startsWith('[') || alignment.length > 50) {
    alignment = 'Pendiente';
  }

  const charRecord = {
    name,
    slug,
    character_class: frontmatter.clase || 'Desconocida',
    level: parseInt(frontmatter.nivel || '1', 10),
    race: frontmatter.raza || 'Desconocida',
    alignment: alignment,
    max_hp: maxHp,
    current_hp: maxHp,
    temp_hp: 0,
    hit_dice_total: hitDice.slice(0, 50),
    hit_dice_current: parseInt(frontmatter.nivel || '1', 10),
    armor_class: armorClass,
    speed,
    proficiency_bonus: profBonus,
    spellcasting_ability: spellcastingAbility,
    spell_save_dc: spellSaveDc,
    spell_attack_bonus: spellAttackBonus,
    ability_scores: abilityScores,
    source_file: `Personajes_Jugadores/${file}`
  };

  parsedCharacters.push(charRecord);
  console.log(`✅ [${charRecord.slug}] ${charRecord.name}`);
  console.log(`   Clase: ${charRecord.character_class} (Nivel ${charRecord.level}) | Raza: ${charRecord.race}`);
  console.log(`   CA: ${charRecord.armor_class} | HP: ${charRecord.current_hp}/${charRecord.max_hp} | Prof: +${charRecord.proficiency_bonus} | Vel: ${charRecord.speed}ft`);
  console.log(`   Atributos: FUE ${abilityScores.str}, DES ${abilityScores.dex}, CON ${abilityScores.con}, INT ${abilityScores.int}, SAB ${abilityScores.wis}, CAR ${abilityScores.cha}`);
  if (spellcastingAbility) {
    console.log(`   Magia (${spellcastingAbility}): CD ${spellSaveDc} | Ataque +${spellAttackBonus}`);
  }
  console.log('');
}

// 10. Conexión a Supabase para Campaña, Personajes, Vault y Vínculo N:M
if (supabaseUrl && supabaseKey) {
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Prefer': 'resolution=merge-duplicates,return=representation'
  };

  console.log(`🌐 Conectando a Supabase REST API (${baseUrl})...\n`);

  try {
    // A. Asegurar Campaña "Segadores de Orcos" (SEG-001)
    console.log('📌 1. Registrando Campaña "Segadores de Orcos" (código: SEG-001)...');
    const campRes = await fetch(`${baseUrl}/rest/v1/campaigns?on_conflict=code`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{
        code: 'SEG-001',
        name: 'Segadores de Orcos',
        description: 'Campaña principal de la compañía de aventureros Segadores de Orcos',
        status: 'active'
      }])
    });

    if (!campRes.ok) {
      throw new Error(`Fallo al registrar campaña: ${await campRes.text()}`);
    }
    const [campaign] = await campRes.json();
    console.log(`   ✅ Campaña ID: ${campaign.id}`);

    // B. Asegurar Baúl de Campaña (campaign_vault)
    console.log('📌 2. Inicializando Baúl de la Campaña (Pertenencias Comunes)...');
    await fetch(`${baseUrl}/rest/v1/campaign_vault?on_conflict=campaign_id`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{
        campaign_id: campaign.id,
        currency: { cp: 0, sp: 0, ep: 0, gp: 500, pp: 0 },
        items: [
          { name: 'Carromato de viaje', qty: 1 },
          { name: 'Tienda de campaña grande', qty: 2 },
          { name: 'Raciones de viaje (días)', qty: 30 }
        ],
        notes: 'Fondo común de la compañía mercenaria'
      }])
    });
    console.log('   ✅ Baúl de campaña verificado.');

    // C. Upsert de Personajes
    console.log('📌 3. Sincronizando fichas en public.characters...');
    const charRes = await fetch(`${baseUrl}/rest/v1/characters?on_conflict=slug`, {
      method: 'POST',
      headers,
      body: JSON.stringify(parsedCharacters)
    });

    if (!charRes.ok) {
      throw new Error(`Fallo al sincronizar personajes: ${await charRes.text()}`);
    }
    const insertedChars = await charRes.json();
    console.log(`   ✅ ${insertedChars.length} personajes guardados en public.characters.`);

    // D. Vincular Personajes a la Campaña en la tabla intermedia N:M (campaign_characters)
    console.log('📌 4. Asociando personajes a la Campaña SEG-001 (N:M)...');
    const links = insertedChars.map(char => ({
      campaign_id: campaign.id,
      character_id: char.id,
      is_active: true
    }));

    const linkRes = await fetch(`${baseUrl}/rest/v1/campaign_characters?on_conflict=campaign_id,character_id`, {
      method: 'POST',
      headers,
      body: JSON.stringify(links)
    });

    if (!linkRes.ok) {
      throw new Error(`Fallo al vincular personajes: ${await linkRes.text()}`);
    }
    console.log('   ✅ Vínculos N:M confirmados en public.campaign_characters.');

    console.log('\n🎉 ¡Sincronización completa con éxito! Puedes consultar todas las tablas en DataGrip.');
  } catch (err) {
    console.error('❌ Error durante la sincronización:', err.message);
  }
} else {
  console.log('ℹ️  No se detectaron SUPABASE_URL o SUPABASE_KEY en .env.local.');
}
