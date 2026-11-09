export type SpecificTheme =
  | 'parchment-royal'
  | 'parchment-classic'
  | 'grimoire-blood'
  | 'grimoire-abyssal';

export type Theme = SpecificTheme | 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeOption {
  id: SpecificTheme;
  name: string;
  shortName: string;
  icon: string;
  isDark: boolean;
  description: string;
  accentColor: string;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'parchment-royal',
    name: 'Pergamino Real 5.5e',
    shortName: 'Real 5.5e',
    icon: '📜',
    isDark: false,
    description: 'Edición oficial diurna con contraste AAA',
    accentColor: '#6E140E'
  },
  {
    id: 'parchment-classic',
    name: 'Pergamino Clásico',
    shortName: 'Clásico',
    icon: '📖',
    isDark: false,
    description: 'Tono cálido de códice tradicional',
    accentColor: '#58180D'
  },
  {
    id: 'grimoire-blood',
    name: 'Grimorio Sangre',
    shortName: 'Grimorio',
    icon: '🩸',
    isDark: true,
    description: 'Obsidiana y carmesí de mazmorra',
    accentColor: '#F87171'
  },
  {
    id: 'grimoire-abyssal',
    name: 'Tomo Abisal',
    shortName: 'Abisal',
    icon: '🔮',
    isDark: true,
    description: 'Púrpura arcano y nigromancia',
    accentColor: '#C084FC'
  }
] as const;

export function resolveSpecificTheme(
  theme: Theme,
  systemPrefersDark: boolean
): SpecificTheme {
  if (theme === 'system') {
    return systemPrefersDark ? 'grimoire-blood' : 'parchment-royal';
  }
  if (theme === 'light') return 'parchment-royal';
  if (theme === 'dark') return 'grimoire-blood';
  if (
    theme === 'parchment-royal' ||
    theme === 'parchment-classic' ||
    theme === 'grimoire-blood' ||
    theme === 'grimoire-abyssal'
  ) {
    return theme;
  }
  return 'parchment-royal';
}

export function isDarkTheme(theme: SpecificTheme): boolean {
  return theme === 'grimoire-blood' || theme === 'grimoire-abyssal';
}
