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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dnd-leather-dark text-slate-100 antialiased selection:bg-dnd-gold/30 selection:text-dnd-gold-light">
        {children}
      </body>
    </html>
  );
}
