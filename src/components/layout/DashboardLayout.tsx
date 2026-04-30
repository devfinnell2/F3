// ─────────────────────────────────────────────
//  F3 — DashboardLayout
//  Shared wrapper for all dashboard pages.
//  Handles mobile sidebar, background, scroll.
// ─────────────────────────────────────────────

import MobileSidebarWrapper from '@/components/ui/MobileSidebarWrapper';

const BG = 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)';

interface DashboardLayoutProps {
  sidebar:      React.ReactNode;
  children:     React.ReactNode;
  accentColor?: string;
  noPadding?:   boolean;
}

export default function DashboardLayout({
  sidebar,
  children,
  accentColor = '#a855f7',
  noPadding   = false,
}: DashboardLayoutProps) {
  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <MobileSidebarWrapper sidebar={sidebar} accentColor={accentColor}>
        <div
          className={noPadding ? '' : 'p-4 lg:p-6'}
          style={{ color: '#e0d8ff', fontFamily: 'var(--font-chakra, Courier New, monospace)' }}
        >
          {children}
        </div>
      </MobileSidebarWrapper>
    </div>
  );
}