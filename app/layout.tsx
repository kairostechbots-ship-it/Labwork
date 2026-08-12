import type {Metadata} from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const displayFont = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Labwork Análisis Clínicos',
  description: 'Laboratorio de análisis clínicos. Solicita tu toma a domicilio o visita nuestras sucursales.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-body text-slate-800 antialiased bg-slate-50`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
