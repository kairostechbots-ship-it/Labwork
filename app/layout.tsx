
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import { getLocale, getTranslations } from 'next-intl/server';

import 'leaflet/dist/leaflet.css';
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

/* ============================================================
   METADATOS DINÁMICOS
============================================================ */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

/* ============================================================
   ROOT LAYOUT
============================================================ */

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className="scroll-smooth"
    >
      <body
        className={`
          ${bodyFont.variable}
          ${displayFont.variable}
          font-body
          text-slate-800
          antialiased
          bg-white
        `}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
