import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
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
          // Paleta Editorial Dinámica D&D 5.5e (Motor de 4 Temas)
          canvas: 'var(--dnd-canvas)',
          parchment: 'var(--dnd-parchment)',
          'parchment-dark': 'var(--dnd-parchment-dark)',
          'parchment-contrast': 'var(--dnd-parchment-contrast)',
          crimson: 'var(--dnd-crimson)',
          'crimson-btn': 'var(--dnd-crimson-btn, var(--dnd-crimson))',
          'crimson-btn-hover': 'var(--dnd-crimson-btn-hover, var(--dnd-crimson-hover))',
          'crimson-hover': 'var(--dnd-crimson-hover)',
          'crimson-surface': 'var(--dnd-crimson-surface)',
          'crimson-fg': 'var(--dnd-crimson-fg, #ffffff)',
          'on-crimson': 'var(--dnd-on-crimson, #ffffff)',
          terracotta: 'var(--dnd-terracotta)',
          gold: 'var(--dnd-gold)',
          'gold-light': 'var(--dnd-gold-light)',
          'gold-surface': 'var(--dnd-gold-surface)',
          ink: 'var(--dnd-ink)',
          'ink-muted': 'var(--dnd-ink-muted)',
          'ink-subtle': 'var(--dnd-ink-subtle)',
          'border-antique': 'var(--dnd-border-antique)',
          'border-strong': 'var(--dnd-border-strong)',
          leather: 'var(--dnd-leather)',
          'leather-dark': 'var(--dnd-leather-dark)',

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
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
