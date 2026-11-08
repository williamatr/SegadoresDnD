#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';

console.log('🛡️  [SegadoresDnD Pre-Commit] Ejecutando auditoría de seguridad, PII (emails/rutas/hardware), tamaños, sintaxis y secretos...');

// 1. Obtener lista de archivos preparados en el stage (staged)
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' }).trim();
  if (output) {
    stagedFiles = output.split('\n').filter(Boolean);
  }
} catch (err) {
  console.error('❌ Error al obtener archivos staged de Git:', err.message);
  process.exit(1);
}

if (stagedFiles.length === 0) {
  console.log('ℹ️  No hay archivos en stage para verificar.');
  process.exit(0);
}

let violations = [];

// ==============================================================================
// 2. Auditoría de Nombres de Archivo y Extensiones Prohibidas
// ==============================================================================
const FORBIDDEN_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,               // .env, .env.local, .env.production
  /.*system_specs.*/i,             // Reportes de hardware local
  /.*specs_report.*/i,
  /.*personal.*/i,                 // Archivos personales
  /.*\.pem$/i,                     // Claves privadas
  /.*\.key$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /.*credentials.*/i,
  /serviceAccount.*\.json$/i,      // Credenciales de Google / Firebase
  /\.(bash|zsh)_history$/i,        // Historiales de terminal
  /\.(dump|rdb|bak|tmp|swp)$/i     // Volcados de memoria y archivos temporales
];

const ALLOWED_EXCEPTIONS = [
  '.env.example'
];

// Límite de tamaño máximo por archivo: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

for (const file of stagedFiles) {
  if (ALLOWED_EXCEPTIONS.includes(file)) continue;

  // A. Nombres prohibidos
  for (const pattern of FORBIDDEN_FILE_PATTERNS) {
    if (pattern.test(file)) {
      violations.push({
        file,
        reason: `Archivo sensible prohibido en el repositorio (patrón: ${pattern})`
      });
    }
  }

  // B. Archivos SQL fuera de scripts/sql/ (previene volcados accidentales tipo dump.sql)
  if (file.toLowerCase().endsWith('.sql') && !file.startsWith('scripts/sql/')) {
    violations.push({
      file,
      reason: 'Los archivos SQL solo están permitidos dentro de la carpeta "scripts/sql/".'
    });
  }

  // C. Prohibición estricta de PDFs (derechos de autor D&D y límites de almacenamiento)
  if (file.toLowerCase().endsWith('.pdf')) {
    violations.push({
      file,
      reason: 'Prohibición estricta de subir PDFs al repositorio (excede límites de Git y viola derechos de autor).'
    });
  }

  // D. Control de Tamaño de Archivo (> 10 MB)
  if (existsSync(file)) {
    try {
      const stats = statSync(file);
      if (stats.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
        violations.push({
          file,
          reason: `El archivo supera el límite de 10 MB (${sizeMb} MB). GitHub rechaza archivos grandes.`
        });
      }
    } catch (e) {
      // Ignorar errores de lectura de stats
    }
  }
}

// ==============================================================================
// 3. Validador de Sintaxis JSON (Previene fallos de build en Vercel)
// ==============================================================================
for (const file of stagedFiles) {
  if (file.toLowerCase().endsWith('.json') && existsSync(file)) {
    try {
      const content = readFileSync(file, 'utf8');
      JSON.parse(content);
    } catch (err) {
      violations.push({
        file,
        reason: `Sintaxis JSON inválida o corrupta: ${err.message}`
      });
    }
  }
}

// ==============================================================================
// 4. Auditoría Anti-Fugas de Lore Confidencial en Mocks Públicos (Anti-Metajuego)
// ==============================================================================
for (const file of stagedFiles) {
  if (file.startsWith('content/mocks/') && file.toLowerCase().endsWith('.md') && existsSync(file)) {
    try {
      const content = readFileSync(file, 'utf8');
      if (/#dm-only/i.test(content) || /visibility:\s*['"]?dm['"]?/i.test(content) || />\s*\[!dm\]/i.test(content)) {
        violations.push({
          file,
          reason: 'Detectadas marcas de contenido privado (#dm-only o > [!dm]) dentro de content/mocks/ público.'
        });
      }
    } catch (e) {
      // Ignorar
    }
  }
}

// ==============================================================================
// 5. Escaneo de Secretos y Credenciales en el Diff (Líneas añadidas)
// ==============================================================================
let diffOutput = '';
try {
  diffOutput = execSync('git diff --cached -U0', { encoding: 'utf8' });
} catch (err) {
  console.error('❌ Error al inspeccionar diff de Git:', err.message);
  process.exit(1);
}

const SECRET_REGEXES = [
  { name: 'GitHub Personal Access Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/ },
  { name: 'Supabase JWT / Service Role Token', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/ },
  { name: 'Cadena de conexión con contraseña', regex: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^:\s]+:\d+\/[^\s"']+/i },
  { name: 'Clave privada RSA/SSH/PGP', regex: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/ },
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Vercel API Token', regex: /\bvercel_[a-zA-Z0-9]{24,}\b/ }
];

// Dominios seguros de prueba permitidos para documentación y ejemplos (RFC 2606 / RFC 6761)
const SAFE_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'ejemplo.com',
  'ejemplo.org',
  'ejemplo.net',
  'test.com',
  'domain.com',
  'localhost',
  'users.noreply.github.com'
]);
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;

// Expresiones regulares para detección de rutas absolutas locales y datos de máquina/PII
const LOCAL_PATH_REGEX = /\b(?:\/home\/(?!runner|node|app)[a-zA-Z0-9_-]+|\/Users\/(?!runner)[a-zA-Z0-9_-]+|[A-Za-z]:\\Users\\[a-zA-Z0-9_-]+)\b/;
const HARDWARE_PII_REGEX = /\b(?:i7-4790|TU116|BlackWidow|Basilisk|Ultimate 2C|NEXIGO)\b/i;
const PHONE_REGEX = /(?:\+57\s?)?\b3\d{2}[-.\s]?\d{3}[-.\s]?\d{4}\b/;

const lines = diffOutput.split('\n');
let currentFile = '';

for (const line of lines) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.replace('+++ b/', '').trim();
    continue;
  }

  if (line.startsWith('+') && !line.startsWith('+++')) {
    const text = line.substring(1).trim();

    if (currentFile === '.env.example' || currentFile.endsWith('verify-secrets.mjs')) {
      continue;
    }

    // A. Escaneo de secretos conocidos
    for (const { name, regex } of SECRET_REGEXES) {
      if (regex.test(text)) {
        violations.push({
          file: currentFile,
          reason: `Detectado patrón sospechoso: ${name}`,
          snippet: text.substring(0, 80) + '...'
        });
      }
    }

    // B. Escaneo de correos electrónicos personales / reales (Protección de Privacidad y PII)
    EMAIL_REGEX.lastIndex = 0;
    let emailMatch;
    while ((emailMatch = EMAIL_REGEX.exec(text)) !== null) {
      const fullEmail = emailMatch[0];
      const domain = emailMatch[1].toLowerCase();

      if (!SAFE_EMAIL_DOMAINS.has(domain)) {
        violations.push({
          file: currentFile,
          reason: `Detectado correo electrónico personal/real (${fullEmail}). Solo se permiten dominios de prueba (ej. @ejemplo.com o @example.com) para salvaguardar la privacidad de jugadores y DM.`,
          snippet: text.substring(0, 80) + '...'
        });
      }
    }

    // C. Escaneo de rutas absolutas locales del usuario (/home/william/..., /Users/..., etc.)
    if (LOCAL_PATH_REGEX.test(text)) {
      violations.push({
        file: currentFile,
        reason: 'Detectada ruta absoluta local del sistema operativo (/home/<usuario> o /Users/<usuario>). Usa rutas relativas o variables de entorno para no exponer tu nombre de usuario ni carpetas locales.',
        snippet: text.substring(0, 80) + '...'
      });
    }

    // D. Escaneo de especificaciones de hardware personal
    if (HARDWARE_PII_REGEX.test(text)) {
      violations.push({
        file: currentFile,
        reason: 'Detectadas especificaciones o periféricos del sistema personal (hardware PII). Esta información debe permanecer privada.',
        snippet: text.substring(0, 80) + '...'
      });
    }

    // E. Escaneo de números telefónicos personales
    if (PHONE_REGEX.test(text)) {
      violations.push({
        file: currentFile,
        reason: 'Detectado posible número telefónico personal. Protege la información de contacto personal.',
        snippet: text.substring(0, 80) + '...'
      });
    }
  }
}

// ==============================================================================
// 6. Reporte y Bloqueo
// ==============================================================================
if (violations.length > 0) {
  console.error('\n🚨 [BLOQUEO DE COMMIT] Se han detectado riesgos de seguridad o integridad en los archivos preparados:\n');
  for (const v of violations) {
    console.error(`  ❌ Archivo: ${v.file}`);
    console.error(`     Motivo:  ${v.reason}`);
    if (v.snippet) {
      console.error(`     Muestra: ${v.snippet}`);
    }
    console.error('');
  }
  console.error('⛔ El commit ha sido CANCELADO para proteger tu repositorio.');
  console.error('💡 Corrige los archivos afectados, sácalos del stage con "git restore --staged <archivo>" y vuelve a intentarlo.\n');
  process.exit(1);
}

console.log('✅ [SegadoresDnD Pre-Commit] Auditoría superada: Cero secretos, sintaxis JSON válida y límites respetados. Commit autorizado.\n');
process.exit(0);
