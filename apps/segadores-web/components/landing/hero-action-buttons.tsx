'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Dices, Info } from 'lucide-react';
import { AboutProjectModal } from './about-project-modal';

export function HeroActionButtons() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/portal"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-dnd-gold to-amber-600 text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-amber-950/40"
        >
          <Shield className="w-4 h-4" />
          Ingresar al Portal
        </Link>

        <Link
          href="/demo"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-dnd-card border border-dnd-border text-slate-200 font-semibold hover:bg-dnd-surface hover:border-dnd-gold/50 transition"
        >
          <Dices className="w-4 h-4 text-dnd-gold" />
          Explorar Demo (12 Clases)
        </Link>

        <button
          onClick={() => setIsAboutOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-dnd-surface border border-slate-800 text-slate-300 font-medium hover:text-slate-100 hover:border-slate-700 transition"
        >
          <Info className="w-4 h-4 text-dnd-gold" />
          Acerca de la Compañía
        </button>
      </div>

      <AboutProjectModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
