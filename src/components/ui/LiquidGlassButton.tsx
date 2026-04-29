// ─────────────────────────────────────────────
//  F3 — LiquidGlassButton
//  Pure CSS — convex bevel + frosted glass
//  Matches the bamboo "Click Me" look
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';

type ButtonVariant = 'primary' | 'client' | 'admin' | 'ghost' | 'warning';

interface LiquidGlassButtonProps {
  children:   React.ReactNode;
  onClick?:   (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?:   ButtonVariant;
  size?:      'sm' | 'md' | 'lg';
  disabled?:  boolean;
  fullWidth?: boolean;
  type?:      'button' | 'submit' | 'reset';
  style?:     React.CSSProperties;
}

const VARIANTS: Record<ButtonVariant, {
  accent:     string;
  glow:       string;
  textColor:  string;
  textGlow:   string;
}> = {
  primary: {
    accent:    'rgba(168,85,247,.7)',
    glow:      '0 0 22px rgba(168,85,247,.6), 0 0 44px rgba(168,85,247,.28)',
    textColor: '#f0e8ff',
    textGlow:  '0 0 10px rgba(192,132,252,.95), 0 0 22px rgba(168,85,247,.6)',
  },
  client: {
    accent:    'rgba(0,255,200,.65)',
    glow:      '0 0 22px rgba(0,255,200,.55), 0 0 44px rgba(0,255,200,.25)',
    textColor: '#e0fff8',
    textGlow:  '0 0 10px rgba(0,255,200,.95), 0 0 22px rgba(0,255,200,.6)',
  },
  admin: {
    accent:    'rgba(244,114,182,.65)',
    glow:      '0 0 22px rgba(244,114,182,.55), 0 0 44px rgba(244,114,182,.25)',
    textColor: '#ffe4f0',
    textGlow:  '0 0 10px rgba(244,114,182,.95), 0 0 22px rgba(244,114,182,.6)',
  },
 ghost: {
    accent:    'rgba(168,85,247,.7)',
    glow:      '0 0 18px rgba(168,85,247,.55), 0 0 36px rgba(168,85,247,.25)',
    textColor: '#c084fc',
    textGlow:  '0 0 10px rgba(192,132,252,.95), 0 0 22px rgba(168,85,247,.6)',
  },
  warning: {
    accent:    'rgba(251,191,36,.65)',
    glow:      '0 0 22px rgba(251,191,36,.55), 0 0 44px rgba(251,191,36,.25)',
    textColor: '#fff8e0',
    textGlow:  '0 0 10px rgba(251,191,36,.95), 0 0 22px rgba(251,191,36,.6)',
  },
};

const SIZES = {
  sm: { padding: '7px 16px',  fontSize: '11px', borderRadius: '20px' },
  md: { padding: '10px 22px', fontSize: '13px', borderRadius: '24px' },
  lg: { padding: '13px 28px', fontSize: '15px', borderRadius: '28px' },
};

export default function LiquidGlassButton({
  children,
  onClick,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  fullWidth = false,
  type      = 'button',
  style,
}: LiquidGlassButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const v  = VARIANTS[variant];
  const sz = SIZES[size];

  return (
    <>
      <style>{`
        .f3-glass-lbl { position:relative; z-index:2; display:inline-block; }
        .f3-glass-lbl::before,
        .f3-glass-lbl::after {
          content: attr(data-text);
          position:absolute; left:0; top:0; width:100%;
          pointer-events:none; opacity:0; mix-blend-mode:screen;
        }
        .f3-glass-lbl::before { color:#00ffc8; text-shadow:0 0 4px #00ffc8; }
        .f3-glass-lbl::after  { color:#f472b6; text-shadow:0 0 4px #f472b6; }
        .f3-glass-btn:not(:disabled):hover .f3-glass-lbl::before { animation:f3GR .22s steps(2) 1; opacity:.9; }
        .f3-glass-btn:not(:disabled):hover .f3-glass-lbl::after  { animation:f3GB .22s steps(2) 1; opacity:.9; }
        .f3-glass-btn:not(:disabled):hover .f3-glass-lbl         { animation:f3GS .22s steps(2) 1; }
        .f3-glass-btn:not(:disabled):active .f3-glass-lbl::before { animation:f3GR .14s steps(2) 2; opacity:1; }
        .f3-glass-btn:not(:disabled):active .f3-glass-lbl::after  { animation:f3GB .14s steps(2) 2; opacity:1; }

        /* Glassmorphism frosted layer */
        .f3-glass-frost {
          position:absolute; inset:0; border-radius:inherit;
          backdrop-filter:blur(12px) saturate(1.8) brightness(1.15);
          -webkit-backdrop-filter:blur(12px) saturate(1.8) brightness(1.15);
          pointer-events:none; z-index:0;
        }
        /* Top specular highlight */
        .f3-glass-top {
          position:absolute; top:0; left:10%; right:10%;
          height:50%; border-radius:inherit;
          background:linear-gradient(180deg,
            rgba(255,255,255,.45) 0%,
            rgba(255,255,255,.18) 35%,
            transparent 100%);
          pointer-events:none; z-index:2;
        }

        /* Diagonal shine sweep */
        .f3-glass-shine {
          position:absolute; inset:0; border-radius:inherit;
          background:linear-gradient(
            115deg,
            transparent       20%,
            rgba(255,255,255,.06) 35%,
            rgba(255,255,255,.18) 45%,
            rgba(255,255,255,.06) 55%,
            transparent       70%
          );
          pointer-events:none; z-index:2;
        }

        /* Animated sweep on hover */
        @keyframes shineSweep {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform: translateX(200%) skewX(-15deg); opacity:0; }
        }
        .f3-glass-btn:not(:disabled):hover .f3-glass-sweep {
          animation: shineSweep .65s ease-in-out forwards;
        }
        .f3-glass-sweep {
          position:absolute; inset:0; border-radius:inherit;
          background:linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,.22) 48%,
            rgba(255,255,255,.35) 52%,
            transparent 70%
          );
          pointer-events:none; z-index:3;
          transform: translateX(-100%) skewX(-15deg);
        }

        /* Bottom shadow — completes the convex bevel */
        .f3-glass-bot {
          position:absolute; bottom:0; left:5%; right:5%;
          height:35%; border-radius:inherit;
          background:linear-gradient(0deg,
            rgba(0,0,0,.32) 0%,
            transparent 100%);
          pointer-events:none; z-index:1;
        }

        /* Scanlines */
        .f3-glass-scan {
          position:absolute; inset:0; border-radius:inherit;
          background:repeating-linear-gradient(0deg,
            transparent 0 2px,
            rgba(255,255,255,.022) 2px 3px);
          opacity:0; transition:opacity .18s;
          pointer-events:none; z-index:1;
        }
        .f3-glass-btn:not(:disabled):hover .f3-glass-scan { opacity:1; }

        @keyframes f3GR {
          0%  {transform:translate(0,0);    opacity:.9;clip-path:inset(10% 0 60% 0)}
          25% {transform:translate(-2px,1px);            clip-path:inset(45% 0 20% 0)}
          50% {transform:translate(1px,-1px);            clip-path:inset(70% 0 10% 0)}
          75% {transform:translate(-1px,1px);            clip-path:inset(5%  0 80% 0)}
          100%{transform:translate(0,0);    opacity:0;  clip-path:inset(30% 0 40% 0)}
        }
        @keyframes f3GB {
          0%  {transform:translate(0,0);   opacity:.9; clip-path:inset(65% 0 10% 0)}
          25% {transform:translate(2px,-1px);            clip-path:inset(25% 0 50% 0)}
          50% {transform:translate(-1px,1px);            clip-path:inset(5%  0 75% 0)}
          75% {transform:translate(1px,-1px);            clip-path:inset(55% 0 20% 0)}
          100%{transform:translate(0,0);   opacity:0;  clip-path:inset(40% 0 30% 0)}
        }
        @keyframes f3GS {
          0%,100%{transform:skewX(0)}
          20%    {transform:skewX(-2deg)}
          40%    {transform:skewX(1.5deg)}
          60%    {transform:skewX(-1deg)}
          80%    {transform:skewX(.5deg)}
        }
      `}</style>

      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        className="f3-glass-btn"
        style={{
          // Layout
          position:      'relative',
          overflow:      'hidden',
          display:       'inline-flex',
          alignItems:    'center',
          justifyContent:'center',
          width:         fullWidth ? '100%' : undefined,
          isolation:     'isolate',
          cursor:        disabled ? 'not-allowed' : 'pointer',
          opacity:       disabled ? 0.4 : 1,

          // Typography
          fontFamily:    'var(--font-chakra, Courier New, monospace)',
          fontWeight:    700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         v.textColor,
          textShadow:    hovered && !disabled ? v.textGlow : `0 1px 2px rgba(0,0,0,.5)`,

          // Glass base — frosted, semi-transparent
          backdropFilter:       'blur(14px) saturate(1.6) brightness(1.1)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.6) brightness(1.1)',
          background: pressed && !disabled
            ? 'rgba(168,85,247,.18)'
            : hovered && !disabled
            ? 'rgba(168,85,247,.28)'
            : 'rgba(168,85,247,.12)',
          // Convex bevel — the key to matching the bamboo button
          boxShadow: pressed && !disabled
            ? [
                // Pressed — flatten the bevel
                `inset 0 1px 0 rgba(255,255,255,.12)`,
                `inset 0 -1px 0 rgba(0,0,0,.25)`,
                `inset 0 2px 6px rgba(0,0,0,.2)`,
                `0 1px 4px rgba(0,0,0,.4)`,
              ].join(',')
            : hovered && !disabled
            ? [
                // Hovered — full convex bevel + outer glow
                `inset 0 1px 0 rgba(255,255,255,.5)`,
                `inset 0 -1px 0 rgba(0,0,0,.3)`,
                `inset 1px 0 0 rgba(255,255,255,.18)`,
                `inset -1px 0 0 rgba(255,255,255,.08)`,
                `0 8px 32px rgba(0,0,0,.35)`,
                `0 2px 8px rgba(0,0,0,.3)`,
                v.glow,
              ].join(',')
            : [
                // Resting — neon purple convex bevel
                `inset 0 1px 0 rgba(255,255,255,.35)`,
                `inset 0 -1px 0 rgba(0,0,0,.25)`,
                `inset 1px 0 0 rgba(255,255,255,.12)`,
                `inset -1px 0 0 rgba(255,255,255,.06)`,
                `0 4px 16px rgba(0,0,0,.25)`,
                `0 0 12px rgba(168,85,247,.35)`,
                `0 0 24px rgba(168,85,247,.15)`,
              ].join(','),

          // Border — accent tint
          border: `1px solid ${hovered && !disabled ? v.accent : 'rgba(255,255,255,.22)'}`,

          // Motion
          transform: pressed && !disabled
            ? 'translateY(1px) scale(0.98)'
            : hovered && !disabled
            ? 'translateY(-2px) scale(1.02)'
            : 'translateY(0) scale(1)',
          transition: 'transform .1s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease, text-shadow .15s ease',

          ...sz,
          ...style,
        }}
      >
       {/* Glassmorphism frost */}
        <span className="f3-glass-frost" aria-hidden />
        {/* Top specular — convex highlight */}
        <span className="f3-glass-top" aria-hidden />
        {/* Diagonal static shine */}
        <span className="f3-glass-shine" aria-hidden />
        {/* Animated sweep on hover */}
        <span className="f3-glass-sweep" aria-hidden />
        {/* Bottom shadow — convex depth */}
        <span className="f3-glass-bot" aria-hidden />
        {/* Scanlines on hover */}
        <span className="f3-glass-scan" aria-hidden />
        {/* Label + chromatic glitch */}
        <span
          className="f3-glass-lbl"
          data-text={typeof children === 'string' ? children : undefined}
        >
          {children}
        </span>
      </button>
    </>
  );
}