// ─────────────────────────────────────────────
//  F3 — Root Layout
// ─────────────────────────────────────────────
import type { Metadata } from 'next';
import { Chakra_Petch, JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/layout/Providers';
import './globals.css';

const chakra = Chakra_Petch({
  subsets:  ['latin'],
  weight:   ['400', '600', '700'],
  variable: '--font-chakra',
  display:  'swap',
});

const jetbrains = JetBrains_Mono({
  subsets:  ['latin'],
  weight:   ['400', '700'],
  variable: '--font-mono',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'F3 — From Fat to Fit',
  description: 'AI-powered fitness platform for ISSA-certified trainers and their clients.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${chakra.variable} ${jetbrains.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}