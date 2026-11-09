import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';

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
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Anti-FOUC Script Síncrono (0ms) para inicialización del motor de 4 temas D&D */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('segadores_theme');
                var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var resolved = t;
                if (!resolved || resolved === 'system') {
                  resolved = d ? 'grimoire-blood' : 'parchment-royal';
                } else if (resolved === 'dark') {
                  resolved = 'grimoire-blood';
                } else if (resolved === 'light') {
                  resolved = 'parchment-royal';
                }
                document.documentElement.setAttribute('data-theme', resolved);
                if (resolved === 'grimoire-blood' || resolved === 'grimoire-abyssal') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`
          }}
        />
      </head>
      <body className="bg-dnd-canvas text-dnd-ink font-sans transition-colors duration-200 antialiased selection:bg-dnd-gold/30 selection:text-dnd-gold-light min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
