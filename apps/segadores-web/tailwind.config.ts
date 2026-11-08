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
          dark: '#0c0e12',
          surface: '#151921',
          card: '#1b202b',
          border: '#2c3345',
          gold: '#c99a3e',
          'gold-light': '#e5b960',
          red: '#991b1b',
          'red-bright': '#ef4444',
          arcane: '#6366f1',
          parchment: '#f5ecd7',
          'parchment-dark': '#2a241b'
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
