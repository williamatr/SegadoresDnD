'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  type SpecificTheme,
  type Theme,
  type ResolvedTheme,
  type ThemeOption,
  THEME_OPTIONS,
  resolveSpecificTheme,
  isDarkTheme
} from './theme-constants';

export type { SpecificTheme, Theme, ResolvedTheme, ThemeOption };
export { THEME_OPTIONS, resolveSpecificTheme, isDarkTheme };

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  activeTheme: SpecificTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'segadores_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  const [systemDark, setSystemDark] = useState(false);

  // 1. Inicialización en el cliente respetando localStorage o preferencia del sistema
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (
        savedTheme &&
        (savedTheme === 'parchment-royal' ||
          savedTheme === 'parchment-classic' ||
          savedTheme === 'grimoire-blood' ||
          savedTheme === 'grimoire-abyssal' ||
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'system')
      ) {
        setThemeState(savedTheme);
      }
    } catch {
      // Ignorar fallo de acceso a localStorage en entornos restringidos
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);
    setMounted(true);
  }, []);

  const activeTheme = useMemo(
    () => resolveSpecificTheme(theme, systemDark),
    [theme, systemDark]
  );

  const isDark = useMemo(() => isDarkTheme(activeTheme), [activeTheme]);
  const resolvedTheme: ResolvedTheme = isDark ? 'dark' : 'light';

  // 2. Efecto para aplicar/remover '.dark' y 'data-theme' en <html>
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.setAttribute('data-theme', activeTheme);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mounted, activeTheme, isDark]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignorar excepciones de cuota de almacenamiento
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Si estamos en cualquier tema oscuro, conmutamos a parchment-royal; si estamos en claro, a grimoire-blood
    const nextTheme: Theme = isDark ? 'parchment-royal' : 'grimoire-blood';
    setTheme(nextTheme);
  }, [isDark, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      activeTheme,
      setTheme,
      toggleTheme
    }),
    [theme, resolvedTheme, activeTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'system',
      resolvedTheme: 'dark',
      activeTheme: 'grimoire-blood',
      setTheme: () => {},
      toggleTheme: () => {}
    };
  }
  return context;
}
