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
      <header className="border-b-2 border-[#c29b38]/60 bg-[#1c130e] text-[#fdf6ea] sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Heráldico de Campaña */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-sm bg-[#58180D] border border-[#c29b38] flex items-center justify-center shadow-md shadow-black/40 group-hover:scale-105 transition-transform">
              <Swords className="w-5 h-5 text-[#c29b38]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-wider text-[#fdf6ea] font-dnd-title block leading-tight">
                Segadores
              </span>
              <span className="text-[9px] text-[#c29b38] font-dnd-title uppercase tracking-widest block">
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
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-dnd-title font-semibold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-[#58180D] text-[#fdf6ea] border border-[#c29b38]/60 shadow-sm'
                      : 'text-[#d4c2a5] hover:text-[#fdf6ea] hover:bg-[#2c1e18]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#c29b38]" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-dnd-title font-semibold uppercase tracking-wider text-[#d4c2a5] hover:text-[#fdf6ea] hover:bg-[#2c1e18] transition"
            >
              <Info className="w-3.5 h-3.5 text-[#c29b38]" />
              Acerca de
            </button>
          </nav>

          {/* Botón Sello Portal de Campaña */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#58180D] hover:bg-[#7a2021] text-[#fdf6ea] border-2 border-[#c29b38] text-xs font-dnd-title font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition"
            >
              <Shield className="w-3.5 h-3.5 text-[#c29b38]" />
              Portal de Campaña
            </Link>
          </div>

          {/* Botón Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-sm text-[#d4c2a5] hover:text-[#fdf6ea] hover:bg-[#2c1e18] transition border border-transparent hover:border-[#c29b38]/40"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#c29b38]/40 bg-[#241711] px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-dnd-title font-semibold uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#58180D] text-[#fdf6ea] border border-[#c29b38]/60 shadow-xs'
                      : 'text-[#d4c2a5] hover:bg-[#2c1e18]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#c29b38]" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAboutOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-dnd-title font-semibold uppercase tracking-wider text-[#d4c2a5] hover:bg-[#2c1e18] text-left"
            >
              <Info className="w-4 h-4 text-[#c29b38]" />
              Acerca de
            </button>

            <div className="pt-2 border-t border-[#c29b38]/30">
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#58180D] hover:bg-[#7a2021] text-[#fdf6ea] border-2 border-[#c29b38] text-xs font-dnd-title font-bold uppercase tracking-wider"
              >
                <Shield className="w-4 h-4 text-[#c29b38]" />
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
