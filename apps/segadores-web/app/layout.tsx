import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Segadores de Orcos | D&D 5.5e Campaign Companion',
  description: 'Gestor interactivo de hojas de personaje, combate en vivo y compendio de reglas para la campaña Segadores de Orcos (D&D 5.5e).',
  robots: {
    index: false,
    follow: false,
    nocache: true
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-dnd-dark text-slate-100 antialiased selection:bg-dnd-gold/30 selection:text-dnd-gold-light">
        {children}
      </body>
    </html>
  );
}
