import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/character-sheet/*.{ts,tsx}',
    '../../packages/character-sheet/src/**/*.{ts,tsx}',
    '../../packages/obsidian-engine/*.{ts,tsx}',
    '../../packages/obsidian-engine/src/**/*.{ts,tsx}',
    '../../packages/ui/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
          // Paleta Editorial de Imprenta D&D 5e (Inspirada en PHB 2024, Monster Manual y Hojas Oficiales)
          parchment: '#fdf6ea',
          'parchment-dark': '#f4ebe1',
          'parchment-contrast': '#ede2cb',
          crimson: '#58180D',
          'crimson-hover': '#7a2021',
          terracotta: '#c45b1d',
          gold: '#c29b38',
          'gold-light': '#e5b960',
          ink: '#242528',
          'ink-muted': '#58544d',
          'border-antique': '#d4c2a5',
          leather: '#2c1e18',
          'leather-dark': '#1b120e',

          // Colores de soporte / legado (compatibilidad transicional)
          dark: '#0c0e12',
          surface: '#151921',
          card: '#1b202b',
          border: '#2c3345',
          red: '#991b1b',
          'red-bright': '#ef4444',
          arcane: '#6366f1'
        }
      },
      fontFamily: {
        'dnd-title': ['var(--font-cinzel)', 'Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        'dnd-body': ['var(--font-spectral)', 'Spectral', 'Crimson Pro', 'Georgia', 'serif'],
        fantasy: ['var(--font-cinzel)', 'Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
