// ─────────────────────────────────────────────
//  F3 — Root Layout
//  Wraps entire app with SessionProvider
// ─────────────────────────────────────────────

import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

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
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}