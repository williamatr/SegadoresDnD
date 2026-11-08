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

const files = readdirSync(charactersDir).filter(f => f.endsWith('.md')).sort();
console.log(`📁 Encontrados ${files.length} archivos de personaje en content/wiki/Personajes_Jugadores:\n`);

export function parseCharacterMarkdown(rawContent, file) {
  // Normalizar contenido eliminando prefijos de callouts de Obsidian ("> ")
  const cleanContent = rawContent
    .split('\n')
    .map(line => line.replace(/^(?:>\s*)+/, ''))
    .join('\n');

  // 1. Extraer Frontmatter
  const frontmatterMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const frontmatter = {};
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    for (const l of lines) {
      if (l.trim().startsWith('-')) continue;
      const [k, ...v] = l.split(':');
      if (k && v.length) {
        frontmatter[k.trim()] = v.join(':').trim();
      }
    }
  }

  // 2. Extraer Nombre y Slug
  const nameMatch = rawContent.match(/^#\s+(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : basename(file, '.md');
  const slug = basename(file, '.md').toLowerCase();

  // 3. Extraer Trasfondo (background)
  let background = (frontmatter.trasfondo || '').trim();
  if (!background) {
    const bgHeaderMatch = cleanContent.match(/##\s+Personalidad y Trasfondo\s*\(([^)]+)\)/i);
    const bgBulletMatch = cleanContent.match(/-\s*\*\*Trasfondo:\*\*\s*([^\n\r]+)/i);
    if (bgBulletMatch) {
      background = bgBulletMatch[1].replace(/\*\*/g, '').replace(/\.$/, '').trim();
    } else if (bgHeaderMatch) {
      background = bgHeaderMatch[1].trim();
    }
  }

  // 4. Extraer CA, HP, Dados de Golpe, Velocidad, Competencia, XP y Sentidos
  const acMatch = cleanContent.match(/Clase de Armadura\s*\(CA\):\*?\*?\s*(\d+)/i);
  const armorClass = acMatch ? parseInt(acMatch[1], 10) : 10;

  const hpMatch = cleanContent.match(/Puntos de Golpe:\*?\*?\s*(\d+)/i);
  const maxHp = hpMatch ? parseInt(hpMatch[1], 10) : 10;

  const hitDiceMatch = cleanContent.match(/Dados de Golpe:\*?\*?\s*([^\n\r]+)/i);
  const hitDice = hitDiceMatch ? hitDiceMatch[1].trim().replace(/\*\*/g, '') : '1d8';

  const speedMatch = cleanContent.match(/Velocidad:\*?\*?\s*(\d+)/i);
  const speed = speedMatch ? parseInt(speedMatch[1], 10) : 30;

  const profMatch = cleanContent.match(/Bonificador de Competencia(?:\s*\(PB\))?:\*?\*?\s*\+?(\d+)/i);
  const profBonus = profMatch ? parseInt(profMatch[1], 10) : 2;

  const xpMatch = cleanContent.match(/Puntos de Experiencia\s*\(XP\):\*?\*?\s*([\d.]+)/i);
  const experiencePoints = xpMatch ? parseInt(xpMatch[1].replace(/\./g, ''), 10) : 0;

  const ppMatch = cleanContent.match(/Percepci[oó]n pasiva\s*(\d+)/i);

  // 5. Extraer Atributos: soporta tabla Markdown Y formato inline (**FUE** X | **DES** Y ...)
  const abilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const tableRegex = /\|\s*FUE\s*\|\s*DES\s*\|\s*CON\s*\|\s*INT\s*\|\s*SAB\s*\|\s*CAR\s*\|\s*\r?\n\|[\s:|-]+\|\s*\r?\n\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|\s*([^|\n\r]+)\|/i;
  const tableMatch = cleanContent.match(tableRegex);

  const parseFirstInt = (str) => {
    const m = str.match(/\b(\d+)\b/);
    return m ? parseInt(m[1], 10) : 10;
  };

  if (tableMatch) {
    abilityScores.str = parseFirstInt(tableMatch[1]);
    abilityScores.dex = parseFirstInt(tableMatch[2]);
    abilityScores.con = parseFirstInt(tableMatch[3]);
    abilityScores.int = parseFirstInt(tableMatch[4]);
    abilityScores.wis = parseFirstInt(tableMatch[5]);
    abilityScores.cha = parseFirstInt(tableMatch[6]);
  } else {
    const inlineMap = { str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
    for (const [key, label] of Object.entries(inlineMap)) {
      const m = cleanContent.match(new RegExp(`\\*\\*${label}\\*\\*\\s*(\\d+)`, 'i'));
      if (m) abilityScores[key] = parseInt(m[1], 10);
    }
  }

  // Iniciativa y Percepción Pasiva derivadas si no están explícitas
  const initMatch = cleanContent.match(/Iniciativa:\*?\*?\s*\+?(-?\d+)/i);
  const initiativeModifier = initMatch
    ? parseInt(initMatch[1], 10)
    : Math.floor((abilityScores.dex - 10) / 2);

  const passivePerception = ppMatch
    ? parseInt(ppMatch[1], 10)
    : 10 + Math.floor((abilityScores.wis - 10) / 2);

  // 6. Extraer Aptitud(es) Mágica(s) (soporta lanzadores simples y multiclase como Zuma)
  const spellcastingStats = [];
  const spellLineRegex = /\*\*Aptitud Mágica\s*\(([^)]+)\):?\*\*([^\n\r]+)/gi;
  let spMatch;
  while ((spMatch = spellLineRegex.exec(cleanContent)) !== null) {
    const headerInfo = spMatch[1].trim();
    const restLine = spMatch[2];
    const abilMatch = headerInfo.match(/\b(INT|SAB|WIS|CAR|CHA)\b/i);
    const rawAbil = abilMatch ? abilMatch[1].toUpperCase() : headerInfo.toUpperCase();
    const normalizedAbil = rawAbil === 'SAB' ? 'WIS' : rawAbil === 'CAR' ? 'CHA' : rawAbil;
    const sourceLabel = headerInfo.includes('-') ? headerInfo.split('-')[0].trim() : (frontmatter.clase || 'Principal');
    const dcM = restLine.match(/CD(?:\s+de\s+salvaci[oó]n(?:\s+de\s+conjuros)?)?:\s*\*?\*?(\d+)/i);
    const atkM = restLine.match(/(?:Bonificador\s+de\s+)?ataque(?:\s+de\s+conjuro)?:\s*\*?\*?\+?(-?\d+)/i);

    spellcastingStats.push({
      source: sourceLabel,
      ability: rawAbil,
      ability_en: normalizedAbil,
      save_dc: dcM ? parseInt(dcM[1], 10) : null,
      attack_bonus: atkM ? parseInt(atkM[1], 10) : null
    });
  }

  const primarySpell = spellcastingStats[0] || null;
  const spellcastingAbility = primarySpell ? primarySpell.ability : null;
  const spellSaveDc = primarySpell ? primarySpell.save_dc : null;
  const spellAttackBonus = primarySpell ? primarySpell.attack_bonus : null;

  // 7. Sanitizar alineamiento
  let alignment = (frontmatter.alineamiento || 'Neutral').trim();
  if (alignment.startsWith('[') || alignment.length > 50 || alignment.toLowerCase().includes('pendiente')) {
    alignment = 'Pendiente';
  }

  // 8. Extraer Competencias en Tiradas de Salvación
  const savesProf = [];
  const savesSectionMatch = cleanContent.match(/### Competencias \(Tiradas de Salvación\)([\s\S]*?)(?=###|##|---|$)/i);
  if (savesSectionMatch) {
    const saveLines = savesSectionMatch[1].split('\n');
    for (const sLine of saveLines) {
      if (/Fuerza/i.test(sLine)) savesProf.push('FUE');
      if (/Destreza/i.test(sLine)) savesProf.push('DES');
      if (/Constituci[oó]n/i.test(sLine)) savesProf.push('CON');
      if (/Inteligencia/i.test(sLine)) savesProf.push('INT');
      if (/Sabidur[ií]a/i.test(sLine)) savesProf.push('SAB');
      if (/Carisma/i.test(sLine)) savesProf.push('CAR');
    }
  }

  // 9. Extraer Habilidades (Proficiencias) - Soporta "- **Atletismo:** +8" y pericias
  const skills = {};
  const skillsSectionMatch = cleanContent.match(/### Habilidades \(Proficiencias\)([\s\S]*?)(?=###|##|---|$)/i);
  if (skillsSectionMatch) {
    const skillLines = skillsSectionMatch[1].split('\n');
    for (const skLine of skillLines) {
      if (/Herramientas/i.test(skLine)) continue;
      const skMatch = skLine.match(/^-\s*\*\*([^:*]+?)(?:\s*\([^)]+\))?:?\*\*:?\s*\+?(-?\d+)(.*)$/);
      if (skMatch) {
        const skillName = skMatch[1].trim();
        const baseBonus = parseInt(skMatch[2], 10);
        const extraText = skMatch[3] || '';
        const hasExpertise = /Pericia|Expertez/i.test(extraText);
        const expBonusMatch = extraText.match(/\+(\d+)\s*con\s*(?:Pericia|Expertez)/i);
        skills[skillName] = {
          bonus: expBonusMatch ? parseInt(expBonusMatch[1], 10) : baseBonus,
          base_bonus: baseBonus,
          proficiency: hasExpertise ? 'expertise' : 'proficient'
        };
      }
    }
  }

  // 10. Extraer Desglose de Clases / Multiclase desde el subtítulo o Dados de Golpe
  const multiclass = [];
  const subtitleMatch = rawContent.match(/^# .+\r?\n\*([^\n\r*]+)\*/m);
  if (subtitleMatch) {
    const subtitle = subtitleMatch[1];
    // Ej: "Alto Elfo, Guerrero (Nivel 7) / Paladín (Nivel 1) - Legal Malvado"
    // Ej: "Mediano (Piesligeros), Pícaro (Embaucador Arcano Nivel 7) / Bardo (Nivel 1) - Neutral Verdadero"
    const classMatches = subtitle.matchAll(/([A-Za-zÁ-ú]+)\s*\((?:([^)]*?)\s+)?Nivel\s+(\d+)\)/gi);
    for (const cm of classMatches) {
      const entry = {
        class: cm[1].trim(),
        level: parseInt(cm[3], 10)
      };
      if (cm[2] && cm[2].trim()) {
        entry.subclass = cm[2].trim();
      }
      multiclass.push(entry);
    }
  }
  if (multiclass.length === 0) {
    const rawClass = frontmatter.clase || 'Aventurero';
    const subMatch = rawClass.match(/^([^(]+)\(([^)]+)\)$/);
    multiclass.push({
      class: subMatch ? subMatch[1].trim() : rawClass.trim(),
      ...(subMatch ? { subclass: subMatch[2].trim() } : {}),
      level: parseInt(frontmatter.nivel || '1', 10)
    });
  } else if (multiclass.length === 1 && !multiclass[0].subclass) {
    const subMatch = (frontmatter.clase || '').match(/^([^(]+)\(([^)]+)\)$/);
    if (subMatch) {
      multiclass[0].subclass = subMatch[2].trim();
    }
  }

  // 11. Extraer Espacios de Conjuro (spell_slots)
  const spellSlots = {};
  const spellsSectionMatch = cleanContent.match(/## Conjuros y Espacios de Magia[\s\S]*?(?=\r?\n---\r?\n|$)/i);
  if (spellsSectionMatch) {
    const spSection = spellsSectionMatch[1] || spellsSectionMatch[0];
    // Caso 1: "- **Nivel 1:** 4 espacios"
    const stdSlots = spSection.matchAll(/-\s*\*\*Nivel\s+(\d+):\*\*\s*\*?\*?(\d+)\s*espacio/gi);
    for (const m of stdSlots) {
      const lvl = m[1];
      const count = parseInt(m[2], 10);
      spellSlots[lvl] = { total: count, used: 0 };
    }
    // Caso 2 (Zuma): "4 de nivel 1, 2 de nivel 2"
    if (Object.keys(spellSlots).length === 0) {
      const altSlots = spSection.matchAll(/(\d+)\s+de\s+nivel\s+(\d+)/gi);
      for (const m of altSlots) {
        const count = parseInt(m[1], 10);
        const lvl = m[2];
        if (!spellSlots[lvl]) spellSlots[lvl] = { total: 0, used: 0 };
        spellSlots[lvl].total += count;
      }
    }
  }
  if (Object.keys(spellSlots).length === 0) {
    const statSlotsLine = cleanContent.match(/\*\*Espacios de Conjuro:\*\*([^\n\r]+)/i);
    if (statSlotsLine) {
      for (const m of statSlotsLine[1].matchAll(/(\d+)\s+de\s+Nivel\s+(\d+)/gi)) {
        spellSlots[m[2]] = { total: parseInt(m[1], 10), used: 0 };
      }
    }
  }

  // 12. Extraer Conjuros Conocidos y Preparados desde [!dnd-grid]
  const preparedSpells = [];
  const knownSpells = [];
  const dndGridMatch = cleanContent.match(/\[!dnd-grid\]([\s\S]*?)(?=\r?\n---\r?\n|##\s+⚡|\[\!tip\]|\[\!todo\]|$)/i);
  if (dndGridMatch) {
    const gridLines = dndGridMatch[1].split('\n');
    let isCantripSection = false;
    for (const gLine of gridLines) {
      if (/###\s+Trucos/i.test(gLine)) {
        isCantripSection = true;
        continue;
      }
      if (/###\s+Nivel|###\s+Conjuros/i.test(gLine)) {
        isCantripSection = false;
        continue;
      }
      if (/Pendiente|Abierto\s*\/\s*Por asignar/i.test(gLine)) continue;
      const wikiMatch = gLine.match(/-\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      if (wikiMatch) {
        const spellName = (wikiMatch[2] || wikiMatch[1]).trim();
        knownSpells.push(spellName);
        if (!isCantripSection) {
          preparedSpells.push(spellName);
        }
      }
    }
  }

  // 13. Extraer Inventario (Armas, Armaduras, Objetos Mágicos, Mochila) y Monedero
  const inventory = [];
  const equipSectionMatch = cleanContent.match(/## Equipo y (?:Mochila|Pertenencias)([\s\S]*?)(?=## Rasgos|$)/i);
  if (equipSectionMatch) {
    const eqLines = equipSectionMatch[1].split('\n');
    let currentCategory = 'general';
    let inAttunedBlock = false;
    let inUnattunedReserve = false;

    for (const line of eqLines) {
      const trimmed = line.trim();
      if (/^###\s+Armas/i.test(trimmed)) { currentCategory = 'weapon'; inAttunedBlock = false; inUnattunedReserve = false; continue; }
      if (/^###\s+Armaduras/i.test(trimmed)) { currentCategory = 'armor'; inAttunedBlock = false; inUnattunedReserve = false; continue; }
      if (/^###\s+Objetos Mágicos/i.test(trimmed)) { currentCategory = 'magic_item'; inAttunedBlock = false; inUnattunedReserve = false; continue; }
      if (/^####\s+Objetos Mágicos Sintonizados Activamente/i.test(trimmed)) { currentCategory = 'magic_item'; inAttunedBlock = true; inUnattunedReserve = false; continue; }
      if (/^####\s+Objetos Mágicos de Reserva/i.test(trimmed)) { currentCategory = 'magic_item'; inAttunedBlock = false; inUnattunedReserve = true; continue; }
      if (/^####\s+Objetos Mágicos Sin Sintonización/i.test(trimmed)) { currentCategory = 'magic_item'; inAttunedBlock = false; inUnattunedReserve = false; continue; }
      if (/^###\s+(?:Equipo Común|Objetos y Curiosidades|Inventario)/i.test(trimmed)) { currentCategory = 'gear'; inAttunedBlock = false; inUnattunedReserve = false; continue; }
      if (/^###\s+Monedero/i.test(trimmed)) { currentCategory = 'currency'; continue; }
      if (!trimmed.startsWith('- ')) continue;
      if (/Sin objetos mágicos registrados/i.test(trimmed)) continue;

      const wikiItem = trimmed.match(/^-\s*(?:\*\*(\d+)\s+)?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\*?\*?(.*)$/);
      const boldItem = !wikiItem ? trimmed.match(/^-\s*\*\*([^*:]+?):?\*\*:?\s*(.*)$/) : null;

      if (wikiItem) {
        const qtyPrefix = wikiItem[1] ? parseInt(wikiItem[1], 10) : 1;
        const itemName = (wikiItem[3] || wikiItem[2]).trim();
        const desc = (wikiItem[4] || '').replace(/^[:\s]+/, '').trim();
        const qtyParen = desc.match(/\(x(\d+)\)/i);
        const qty = qtyParen ? parseInt(qtyParen[1], 10) : qtyPrefix;
        const requiresAttunement = (inAttunedBlock || inUnattunedReserve || /Requiere sintonizaci[oó]n|Sintonizado activamente/i.test(desc)) && !/No requiere sintonizaci[oó]n/i.test(desc);
        const isAttuned = inAttunedBlock || (/Sintonizado activamente/i.test(desc) && !inUnattunedReserve);

        // Evitar duplicar armas que también se listan en Objetos Mágicos
        const existingIdx = inventory.findIndex(it => it.name.toLowerCase() === itemName.toLowerCase());
        if (existingIdx !== -1) {
          if (requiresAttunement) inventory[existingIdx].requires_attunement = true;
          if (isAttuned) inventory[existingIdx].attuned = true;
        } else {
          inventory.push({
            slug: itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            name: itemName,
            category: currentCategory,
            qty,
            equipped: currentCategory === 'weapon' || currentCategory === 'armor' || isAttuned,
            requires_attunement: requiresAttunement,
            attuned: isAttuned,
            notes: desc.replace(/^\*\([^)]+\)\*:?\s*/, '')
          });
        }
      } else if (boldItem && currentCategory !== 'currency') {
        const itemName = boldItem[1].trim();
        const desc = boldItem[2].trim();
        inventory.push({
          slug: itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          name: itemName,
          category: currentCategory,
          qty: 1,
          equipped: currentCategory === 'weapon' || currentCategory === 'armor',
          requires_attunement: false,
          attuned: false,
          notes: desc
        });
      }
    }
  }

  // Monedero personal
  const currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  const gpMatch = cleanContent.match(/\*\*(\d+)\s+piezas de oro\s*\(po\)\*\*/i);
  const silverMatch = cleanContent.match(/\*\*(\d+)\s+piezas de plata\s*\(pp\)\*\*/i);
  if (gpMatch) currency.gp = parseInt(gpMatch[1], 10);
  if (silverMatch) currency.sp = parseInt(silverMatch[1], 10);

  // 14. Extraer Recursos de Clase por Descanso (class_resources)
  const classResources = [];
  if (slug === 'alizar') {
    classResources.push(
      { id: 'flash_of_genius', name: 'Destello de Genialidad (+4 Reacción)', max: 4, used: 0, recharge: 'long_rest' },
      { id: 'infused_items', name: 'Objetos Infundidos Activos', max: 3, used: 0, recharge: 'passive' },
      { id: 'experimental_elixir', name: 'Elixir Experimental Gratuito', max: 1, used: 0, recharge: 'long_rest' }
    );
  } else if (slug === 'eru') {
    classResources.push(
      { id: 'second_wind', name: 'Nuevas Energías (1d10+7 PG)', max: 1, used: 0, recharge: 'short_rest' },
      { id: 'action_surge', name: 'Acción Súbita', max: 1, used: 0, recharge: 'short_rest' },
      { id: 'lay_on_hands', name: 'Imposición de Manos (Reserva PG)', max: 5, used: 0, recharge: 'long_rest' },
      { id: 'divine_sense', name: 'Sentido Divino', max: 1, used: 0, recharge: 'long_rest' }
    );
  } else if (slug === 'honiel') {
    const monkEntry = multiclass.find(m => /monje/i.test(m.class));
    const kiMax = monkEntry && monkEntry.level >= 2 ? monkEntry.level : 0;
    classResources.push(
      { id: 'arcane_recovery', name: 'Recuperación Arcana (hasta Nv. 4)', max: 1, used: 0, recharge: 'long_rest' }
    );
    if (kiMax > 0) {
      classResources.push(
        { id: 'ki_points', name: 'Puntos de Concentración (Ki)', max: kiMax, used: 0, recharge: 'short_rest' },
        { id: 'uncanny_metabolism', name: 'Metabolismo Prodigioso', max: 1, used: 0, recharge: 'long_rest' }
      );
    }
  } else if (slug === 'solaria') {
    classResources.push(
      { id: 'wild_shape', name: 'Forma Salvaje / Entidad Simbiótica', max: 2, used: 0, recharge: 'short_rest' },
      { id: 'fungal_infestation', name: 'Infección Fúngica (Zombi 1 PG)', max: 5, used: 0, recharge: 'long_rest' }
    );
  } else if (slug === 'zuma') {
    classResources.push(
      { id: 'bardic_inspiration', name: 'Inspiración Bárdica (1d6)', max: 2, used: 0, recharge: 'long_rest' }
    );
  }

  // 15. Extraer Personalidad, Apariencia y Backstory
  const personality = { traits: '', ideals: '', bonds: '', flaws: '' };
  const persSectionMatch = cleanContent.match(/## Personalidad(?:,\s*Trasfondo\s*e\s*Historia|\s*y\s*Trasfondo)[\s\S]*?(?=\r?\n---\r?\n|## Equipo|$)/i);
  if (persSectionMatch) {
    const sanitizePersField = (regex) => {
      const m = persSectionMatch[0].match(regex);
      if (!m) return '';
      const val = m[1]
        .replace(/^\*\*:\s*/, '')
        .replace(/^\*\*\s*/, '')
        .replace(/^_?\[Pendiente[^\]]*\]_?/i, '')
        .trim();
      return val;
    };
    personality.traits = sanitizePersField(/Rasgos?\s+de\s+Personalidad:\*?\*?\s*([^\n\r]+)/i);
    personality.ideals = sanitizePersField(/Ideales:\*?\*?\s*([^\n\r]+)/i);
    personality.bonds = sanitizePersField(/V[ií]nculos:\*?\*?\s*([^\n\r]+)/i);
    personality.flaws = sanitizePersField(/Defectos:\*?\*?\s*([^\n\r]+)/i);
  }

  const appearanceMatch = rawContent.match(/\*\*Apariencia:\*\*\s*([^\n\r]+)/i);
  const appearanceText = appearanceMatch ? appearanceMatch[1].trim() : '';

  let backstoryText = '';
  const historyMatch = cleanContent.match(/### Historia y Origen\s*\r?\n([\s\S]*?)(?=\r?\n-\s*\*\*Rasgo|$)/i);
  const scarMatch = cleanContent.match(/-\s*\*\*(?:Cicatriz de Guerra|Corrupción Moral)[^*]*\*\*\s*([^\n\r]+)/i);
  if (historyMatch) {
    backstoryText = historyMatch[1].trim();
  } else if (scarMatch) {
    backstoryText = scarMatch[1].trim();
  } else {
    backstoryText = appearanceText;
  }

  const totalLevel = parseInt(frontmatter.nivel || '1', 10);

  return {
    name,
    slug,
    character_class: frontmatter.clase || 'Desconocida',
    level: totalLevel,
    race: frontmatter.raza || 'Desconocida',
    background,
    alignment,
    experience_points: experiencePoints,
    max_hp: maxHp,
    current_hp: maxHp,
    temp_hp: 0,
    hit_dice_total: hitDice.slice(0, 50),
    hit_dice_current: totalLevel,
    armor_class: armorClass,
    speed,
    proficiency_bonus: profBonus,
    passive_perception: passivePerception,
    initiative_modifier: initiativeModifier,
    spellcasting_ability: spellcastingAbility,
    spell_save_dc: spellSaveDc,
    spell_attack_bonus: spellAttackBonus,
    spellcasting_stats: spellcastingStats,
    ability_scores: abilityScores,
    saving_throws_prof: savesProf,
    skills,
    multiclass,
    spell_slots: spellSlots,
    prepared_spells: preparedSpells,
    known_spells: knownSpells,
    inventory,
    currency,
    class_resources: classResources,
    personality,
    appearance: appearanceText,
    backstory: backstoryText,
    active_effects: [],
    death_saves: { successes: 0, failures: 0 },
    inspiration: false,
    exhaustion: 0,
    concentrating_on: null,
    attunement_slots: (frontmatter.clase || '').toLowerCase().includes('artificiero') && totalLevel >= 10 ? 4 : 3,
    source_file: `Personajes_Jugadores/${file}`
  };
}

const parsedCharacters = [];

for (const file of files) {
  const filePath = join(charactersDir, file);
  const rawContent = readFileSync(filePath, 'utf8');
  const charRecord = parseCharacterMarkdown(rawContent, file);

  parsedCharacters.push(charRecord);
  console.log(`✅ [${charRecord.slug}] ${charRecord.name}`);
  console.log(`   Clase: ${charRecord.character_class} (Nivel ${charRecord.level}) | Raza: ${charRecord.race} | Trasfondo: ${charRecord.background || 'Pendiente'}`);
  console.log(`   Desglose Clases: ${JSON.stringify(charRecord.multiclass)}`);
  console.log(`   CA: ${charRecord.armor_class} | HP: ${charRecord.current_hp}/${charRecord.max_hp} | Prof: +${charRecord.proficiency_bonus} | Vel: ${charRecord.speed}ft | XP: ${charRecord.experience_points}`);
  console.log(`   Atributos: FUE ${charRecord.ability_scores.str}, DES ${charRecord.ability_scores.dex}, CON ${charRecord.ability_scores.con}, INT ${charRecord.ability_scores.int}, SAB ${charRecord.ability_scores.wis}, CAR ${charRecord.ability_scores.cha}`);
  console.log(`   Salvaciones: [${charRecord.saving_throws_prof.join(', ')}] | Habilidades (${Object.keys(charRecord.skills).length}): ${Object.keys(charRecord.skills).join(', ')}`);
  console.log(`   Inventario: ${charRecord.inventory.length} objetos | Conjuros conocidos: ${charRecord.known_spells.length} | Espacios: ${JSON.stringify(charRecord.spell_slots)}`);
  if (charRecord.spellcasting_stats.length > 0) {
    console.log(`   Aptitudes Mágicas: ${charRecord.spellcasting_stats.map(s => `${s.source} (${s.ability}: CD ${s.save_dc}, +${s.attack_bonus})`).join(' / ')}`);
  }
  console.log('');
}

// Conexión a Supabase para Campaña, Personajes, Vault y Vínculo N:M
if (supabaseUrl && supabaseKey && !process.argv.includes('--dry-run')) {
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
          { name: 'Carreta de la Compañía (tirada por Desayuno, Almuerzo, Cena y Postre)', qty: 1 },
          { name: 'Herraduras de céfiro (juego para los 4 jabalíes)', qty: 4 },
          { name: 'Botas de las tierras invernales (compartida)', qty: 1 },
          { name: 'Capa de arácnida (compartida)', qty: 1 },
          { name: 'Tienda de campaña grande', qty: 2 },
          { name: 'Raciones de viaje (días)', qty: 30 }
        ],
        notes: 'Carreta y fondo común de la compañía mercenaria Segadores de Orcos'
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
    process.exitCode = 1;
  }
} else if (process.argv.includes('--dry-run')) {
  console.log('🧪 [Dry Run] Validación de parseo completada sin conexión a red.');
} else {
  console.log('ℹ️  No se detectaron SUPABASE_URL o SUPABASE_KEY en .env.local.');
}
