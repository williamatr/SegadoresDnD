import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Carga segura de variables de entorno desde la raíz del monorepo (.env.local)
try {
  const require = createRequire(import.meta.url);
  const nextPath = require.resolve('next/package.json');
  const nextRequire = createRequire(nextPath);
  const { loadEnvConfig } = nextRequire('@next/env');
  const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  loadEnvConfig(projectDir);
} catch (err) {
  // Degradación elegante si no se puede resolver en ciertos entornos
  console.warn('[next.config.mjs] Aviso: Carga de .env de la raíz omitida:', err?.message || err);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@segadores/character-sheet',
    '@segadores/dnd-core',
    '@segadores/obsidian-engine',
    '@segadores/ui'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
