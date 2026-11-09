'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, Sparkles, Dices, Shield, Menu, X, Info } from 'lucide-react';
import { AboutProjectModal } from '../landing/about-project-modal';
import { ThemeToggle } from '../theme/theme-toggle';

export function Header() {
  const pathname = usePathname();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Swords },
    { href: '/demo', label: 'Demo Pública', icon: Dices }
  ];

  return (
    <>
      <header className="border-b-2 border-dnd-border-antique bg-dnd-leather-dark text-dnd-ink sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Heráldico de Campaña */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-sm bg-dnd-crimson border border-dnd-gold flex items-center justify-center shadow-md shadow-black/40 group-hover:scale-105 transition-transform">
              <Swords className="w-5 h-5 text-dnd-gold" />
            </div>
            <div>
              <span className="text-base font-bold tracking-wider text-dnd-ink font-dnd-title block leading-tight">
                Segadores
              </span>
              <span className="text-[9px] text-dnd-gold font-dnd-title uppercase tracking-widest block">
                D&D 5.5e Companion
              </span>
            </div>
          </Link>

          {/* Navegación Desktop con Cinta de Manual */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-dnd-title font-semibold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-dnd-crimson text-white border border-dnd-gold shadow-sm'
                      : 'text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment-contrast'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-dnd-gold" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-dnd-title font-semibold uppercase tracking-wider text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment-contrast transition"
            >
              <Info className="w-3.5 h-3.5 text-dnd-gold" />
              Acerca de
            </button>
          </nav>

          {/* Botón Sello Portal de Campaña y Selector de Modo Claro/Oscuro */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle size="sm" showLabel={true} />
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white border border-dnd-gold text-xs font-dnd-title font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition"
            >
              <Shield className="w-3.5 h-3.5 text-dnd-gold" />
              Portal de Campaña
            </Link>
          </div>

          {/* Botón Mobile Menu y Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-sm text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment-contrast transition border border-transparent hover:border-dnd-gold/40"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dnd-border-antique bg-dnd-leather px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-dnd-title font-semibold uppercase tracking-wider ${
                    isActive
                      ? 'bg-dnd-crimson text-white border border-dnd-gold shadow-xs'
                      : 'text-dnd-ink-muted hover:bg-dnd-parchment-contrast'
                  }`}
                >
                  <Icon className="w-4 h-4 text-dnd-gold" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAboutOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-dnd-title font-semibold uppercase tracking-wider text-dnd-ink-muted hover:bg-dnd-parchment-contrast text-left"
            >
              <Info className="w-4 h-4 text-dnd-gold" />
              Acerca de
            </button>

            <div className="pt-2 border-t border-dnd-border-antique/40">
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white border border-dnd-gold text-xs font-dnd-title font-bold uppercase tracking-wider shadow-sm"
              >
                <Shield className="w-4 h-4 text-dnd-gold" />
                Acceder al Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modal Acerca del Proyecto */}
      <AboutProjectModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
