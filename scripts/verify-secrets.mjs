#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

console.log('🛡️  [SegadoresDnD Pre-Commit] Escaneando archivos en stage en busca de credenciales y secretos...');

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

// 2. Patrones de archivos prohibidos en Git
const FORBIDDEN_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,               // .env, .env.local, .env.production (excepto .env.example)
  /SYSTEM_SPECS\.md$/i,            // Reportes de hardware local
  /.*\.pem$/i,                     // Claves privadas
  /.*\.key$/i,
  /id_rsa/i,
  /.*credentials.*/i
];

const ALLOWED_EXCEPTIONS = [
  '.env.example'
];

let violations = [];

for (const file of stagedFiles) {
  if (ALLOWED_EXCEPTIONS.includes(file)) continue;

  for (const pattern of FORBIDDEN_FILE_PATTERNS) {
    if (pattern.test(file)) {
      violations.push({
        file,
        reason: `Archivo sensible prohibido en el repositorio (coincide con patrón: ${pattern})`
      });
    }
  }
}

// 3. Obtener el diff completo de lo que se va a commitear para buscar patrones de secretos en el texto
let diffOutput = '';
try {
  diffOutput = execSync('git diff --cached -U0', { encoding: 'utf8' });
} catch (err) {
  console.error('❌ Error al inspeccionar diff de Git:', err.message);
  process.exit(1);
}

// Patrones de cadenas secretas en líneas añadidas (+)
const SECRET_REGEXES = [
  { name: 'GitHub Personal Access Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/ },
  { name: 'Supabase JWT / Service Role Token', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/ },
  { name: 'Cadena de conexión con contraseña', regex: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^:\s]+:\d+\/[^\s"']+/i },
  { name: 'Clave privada RSA/SSH/PGP', regex: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/ },
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Vercel API Token', regex: /\bvercel_[a-zA-Z0-9]{24,}\b/ }
];

const lines = diffOutput.split('\n');
let currentFile = '';

for (const line of lines) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.replace('+++ b/', '').trim();
    continue;
  }

  // Solo analizar líneas añadidas en el commit (+), ignorando borrados (-) o metadatos (+++)
  if (line.startsWith('+') && !line.startsWith('+++')) {
    const text = line.substring(1).trim();

    // Ignorar si es un archivo de ejemplo o documentación de reglas
    if (currentFile === '.env.example' || currentFile.endsWith('verify-secrets.mjs')) {
      continue;
    }

    for (const { name, regex } of SECRET_REGEXES) {
      if (regex.test(text)) {
        violations.push({
          file: currentFile,
          reason: `Detectado patrón sospechoso: ${name}`,
          snippet: text.substring(0, 80) + '...'
        });
      }
    }
  }
}

// 4. Reporte y Bloqueo
if (violations.length > 0) {
  console.error('\n🚨 [BLOQUEO DE COMMIT] Se han detectado riesgos de seguridad en los archivos preparados:\n');
  for (const v of violations) {
    console.error(`  ❌ Archivo: ${v.file}`);
    console.error(`     Motivo:  ${v.reason}`);
    if (v.snippet) {
      console.error(`     Muestra: ${v.snippet}`);
    }
    console.error('');
  }
  console.error('⛔ El commit ha sido CANCELADO para proteger tu seguridad y privacidad.');
  console.error('💡 Corrige los archivos afectados, sácalos del stage con "git restore --staged <archivo>" y vuelve a intentarlo.\n');
  process.exit(1);
}

console.log('✅ [SegadoresDnD Pre-Commit] Cero secretos o credenciales detectadas. Commit autorizado.\n');
process.exit(0);
