// ─────────────────────────────────────────────
//  F3 — GlassLink
//  LiquidGlassButton that navigates via <a>
//  Safe to use in server components
// ─────────────────────────────────────────────

'use client';

import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

type ButtonVariant = 'primary' | 'client' | 'admin' | 'ghost' | 'warning';

interface GlassLinkProps {
  href:      string;
  children:  React.ReactNode;
  variant?:  ButtonVariant;
  size?:     'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function GlassLink({
  href,
  children,
  variant   = 'primary',
  size      = 'md',
  fullWidth = false,
}: GlassLinkProps) {
  return (
    <a href={href} style={{ textDecoration: 'none' }}>
      <LiquidGlassButton variant={variant} size={size} fullWidth={fullWidth}>
        {children}
      </LiquidGlassButton>
    </a>
  );
}