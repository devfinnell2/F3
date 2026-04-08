// ─────────────────────────────────────────────
//  F3 — Auth Layout
//  Shared wrapper for login + register pages
// ─────────────────────────────────────────────

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}