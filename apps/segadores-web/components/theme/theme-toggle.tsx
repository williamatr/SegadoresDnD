'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, ChevronDown, Check } from 'lucide-react';
import { useTheme, THEME_OPTIONS } from './theme-provider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ThemeToggle({
  className = '',
  size = 'md',
  showLabel = false
}: ThemeToggleProps) {
  const { resolvedTheme, activeTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Evitar desajustes de hidratación antes del montaje
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar el selector de 4 temas al hacer clic fuera o pulsar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const currentTheme = mounted ? activeTheme : 'grimoire-blood';

  const buttonSizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const currentOption = THEME_OPTIONS.find(opt => opt.id === currentTheme) || THEME_OPTIONS[2];

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-flex items-center rounded-md border border-dnd-border-antique bg-dnd-parchment-contrast shadow-xs hover:border-dnd-gold/60 transition-colors ${className}`}
    >
      {/* Botón 1: Conmutador Rápido Diurno / Nocturno */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 rounded-l-md hover:bg-dnd-parchment text-dnd-ink font-dnd-title tracking-wider transition-colors duration-150 ${buttonSizeClasses}`}
        title={
          isDark
            ? 'Cambiar a Pergamino Diurno (Modo Claro)'
            : 'Cambiar a Códice Nocturno (Modo Oscuro)'
        }
        aria-label={
          isDark
            ? 'Activar modo claro de pergamino diurno'
            : 'Activar modo oscuro de códice nocturno'
        }
      >
        {isDark ? (
          <>
            <Moon className={`${iconSize} text-dnd-gold shrink-0 transition-transform hover:-rotate-12`} />
            {showLabel && (
              <span className="font-semibold text-xs tracking-normal">
                {currentOption.shortName}
              </span>
            )}
          </>
        ) : (
          <>
            <Sun className={`${iconSize} text-dnd-terracotta shrink-0 transition-transform hover:rotate-45`} />
            {showLabel && (
              <span className="font-semibold text-xs tracking-normal">
                {currentOption.shortName}
              </span>
            )}
          </>
        )}
      </button>

      {/* Separador vertical editorial sutil */}
      <div className="w-[1px] h-4 bg-dnd-border-antique/70" />

      {/* Botón 2: Selector de los 4 Temas */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Abrir selector de los 4 temas visuales"
        title="Elegir entre los 4 temas: Pergamino Real, Clásico, Grimorio Sangre o Tomo Abisal"
        className={`inline-flex items-center justify-center rounded-r-md px-1.5 py-1 text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment transition-colors ${
          size === 'sm' ? 'h-7' : 'h-8'
        }`}
      >
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-dnd-gold' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable con las 4 Variantes */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Temas visuales disponibles"
          className="absolute right-0 top-full mt-1.5 w-60 rounded-lg border border-dnd-border-antique bg-dnd-parchment text-dnd-ink shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2 py-1 border-b border-dnd-border-antique/60 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider">
              Tema Visual D&D
            </span>
            <span className="text-[10px] text-dnd-ink-subtle">4 variantes</span>
          </div>

          <div className="space-y-0.5">
            {THEME_OPTIONS.map(opt => {
              const isSelected = currentTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-dnd-parchment-contrast text-dnd-crimson font-semibold border border-dnd-gold/40'
                      : 'hover:bg-dnd-parchment-dark text-dnd-ink border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm shrink-0" role="img" aria-hidden="true">
                      {opt.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-dnd-title font-medium leading-tight">
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-dnd-ink-muted leading-tight font-sans">
                        {opt.description}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-dnd-gold shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
