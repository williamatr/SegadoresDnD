import React from 'react';
import type { Metadata } from 'next';
import path from 'node:path';
import fs from 'node:fs';
import { loadCompendium, type SpellEntry } from '@segadores/obsidian-engine';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SpellExplorer } from '@/components/spells/spell-explorer';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Buscador de Hechizos | Segadores de Orcos (D&D 5.5e)',
  description: 'Compendio interactivo de conjuros para D&D 5.5e con filtros por nivel, clase, escuela de magia, componentes y concentración.'
};

async function getSpellsData(): Promise<{ spells: SpellEntry[]; isFallback: boolean }> {
  const cwd = process.cwd();
  const candidateWiki = [
    path.resolve(cwd, 'content/wiki'),
    path.resolve(cwd, '../../content/wiki')
  ];
  const candidateMocks = [
    path.resolve(cwd, 'content/mocks'),
    path.resolve(cwd, '../../content/mocks')
  ];

  const wikiDir = candidateWiki.find(p => fs.existsSync(p)) || candidateWiki[0];
  const mockDir = candidateMocks.find(p => fs.existsSync(p)) || candidateMocks[0];

  const res = await loadCompendium(wikiDir, mockDir);
  return {
    spells: res.spells,
    isFallback: res.isFallback
  };
}

export default async function HechizosPage({
  searchParams
}: {
  searchParams?: { clase?: string };
}) {
  const { spells, isFallback } = await getSpellsData();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Encabezado de Sección */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/40 border border-sky-800/40 text-sky-300 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            Grimorio &bull; D&D 5.5e
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 font-fantasy">
            Compendio de Hechizos
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Explora y filtra en tiempo real los conjuros disponibles para tu personaje. Consulta escuelas arcanas, tiempos de lanzamiento, componentes verbales, somáticos o materiales y requisitos de concentración.
          </p>
        </section>

        {/* Explorador de Hechizos */}
        <SpellExplorer
          initialSpells={spells}
          isFallback={isFallback}
          initialClass={searchParams?.clase}
        />
      </main>

      <Footer />
    </div>
  );
}
