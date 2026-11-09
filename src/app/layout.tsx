import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ThemeStyles } from '@/seams/theme';

import './globals.css';

export const metadata: Metadata = {
  title: 'Café rota',
  description: 'The café’s weekly shifts, and swaps approved by the manager.',
  // A private preview link: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeStyles />
      </head>
      <body>{children}</body>
    </html>
  );
}
