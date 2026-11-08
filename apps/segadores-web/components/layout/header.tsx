'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, Sparkles, Dices, Shield, Menu, X, Info } from 'lucide-react';
import { AboutProjectModal } from '../landing/about-project-modal';

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
      <header className="border-b border-dnd-border bg-dnd-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo y Nombre */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-dnd-gold to-amber-700 flex items-center justify-center shadow-md shadow-amber-950/30 group-hover:scale-105 transition-transform">
              <Swords className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wide text-slate-100 font-fantasy block leading-tight">
                Segadores
              </span>
              <span className="text-[10px] text-dnd-gold-light uppercase tracking-wider block">
                D&D 5.5e Companion
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-dnd-surface text-dnd-gold border border-dnd-gold/30'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-dnd-surface/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-dnd-surface/60 transition"
            >
              <Info className="w-3.5 h-3.5" />
              Acerca de
            </button>
          </nav>

          {/* Botón CTA Portal */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dnd-gold to-amber-600 text-slate-950 text-xs font-bold hover:brightness-110 shadow-md shadow-amber-950/20 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              Portal de Campaña
            </Link>
          </div>

          {/* Botón Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-dnd-surface transition"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dnd-border bg-dnd-surface px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-dnd-card text-dnd-gold border border-dnd-gold/40'
                      : 'text-slate-300 hover:bg-dnd-card/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAboutOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-dnd-card/50 text-left"
            >
              <Info className="w-4 h-4" />
              Acerca de
            </button>

            <div className="pt-2 border-t border-dnd-border/80">
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-dnd-gold to-amber-600 text-slate-950 text-xs font-bold"
              >
                <Shield className="w-4 h-4" />
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
