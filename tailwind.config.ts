// ─────────────────────────────────────────────
//  F3 — Tailwind Configuration
//  Design tokens for the Cyberpunk Fitness OS
// ─────────────────────────────────────────────

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ── Theme ──────────────────────────────────
  theme: {
    extend: {

      // ── Brand Colors ───────────────────────
      colors: {
        // Primary — purple
        'f3-purple': {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#581c87',
        },
        // Accent — cyan
        'f3-cyan': {
          DEFAULT: '#00ffc8',
          dim:     '#6ee7c8',
          dark:    '#0891b2',
        },
        // Accent — pink/magenta
        'f3-pink': {
          DEFAULT: '#f472b6',
          dim:     '#f9a8d4',
          dark:    '#db2777',
        },
        // EXP / gold
        'f3-gold': {
          DEFAULT: '#fbbf24',
          dim:     '#fde68a',
          dark:    '#d97706',
        },
        // Backgrounds
        'f3-bg': {
          deep:   '#060612',
          dark:   '#0d0820',
          mid:    '#140a2e',
          base:   '#0a0a1a',
        },
        // Stat colors
        'f3-will':     '#a855f7',  // Will Power — purple
        'f3-strength': '#00ffc8',  // Strength   — cyan
        'f3-vitality': '#f472b6',  // Vitality   — pink
      },

      // ── Typography ─────────────────────────
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['"Courier New"', 'Courier', 'monospace'], // intentional — whole app uses mono
      },
      fontSize: {
        'f3-xs':  ['12px', { letterSpacing: '0.05em' }],
        'f3-sm':  ['14px', { letterSpacing: '0.04em' }],
        'f3-md':  ['17px', { lineHeight: '1.6'       }],
        'f3-lg':  ['22px', { letterSpacing: '0.1em'  }],
        'f3-xl':  ['28px', { fontWeight: '700'       }],
        'f3-2xl': ['37px', { letterSpacing: '0.2em'  }],
        'f3-hero':['90px', { letterSpacing: '0.3em'  }],
      },

      // ── Spacing ────────────────────────────
      spacing: {
        'f3-xs':  '6px',
        'f3-sm':  '9px',
        'f3-md':  '12px',
        'f3-lg':  '14px',
        'f3-xl':  '20px',
        'f3-2xl': '32px',
        'sidebar': '230px',
      },

      // ── Border Radius ──────────────────────
      borderRadius: {
        'f3-sm': '4px',
        'f3-md': '7px',
        'f3-lg': '10px',
      },

      // ── Box Shadows / Glows ─────────────────
      boxShadow: {
        'f3-purple':   '0 0 10px rgba(168,85,247,0.3)',
        'f3-purple-lg':'0 0 20px rgba(168,85,247,0.5)',
        'f3-cyan':     '0 0 10px rgba(0,255,200,0.3)',
        'f3-cyan-lg':  '0 0 20px rgba(0,255,200,0.5)',
        'f3-pink':     '0 0 10px rgba(244,114,182,0.3)',
        'f3-gold':     '0 0 10px rgba(251,191,36,0.3)',
        'f3-glass':    '0 4px 24px rgba(0,0,0,0.4)',
      },

      // ── Backgrounds ────────────────────────
      backgroundImage: {
        'f3-gradient':      'linear-gradient(135deg, #060612 0%, #0d0820 40%, #140a2e 70%, #0a0a1a 100%)',
        'f3-glass':         'rgba(255,255,255,0.035)',
        'f3-exp-bar':       'linear-gradient(90deg, #6d28d9, #a855f7, #00ffc8)',
        'f3-will-bar':      'linear-gradient(90deg, #a855f7, #c084fc)',
        'f3-strength-bar':  'linear-gradient(90deg, #00ffc8, #6ee7c8)',
        'f3-vitality-bar':  'linear-gradient(90deg, #f472b6, #f9a8d4)',
        'f3-top-line':      'linear-gradient(90deg, transparent, #a855f7, #00ffc8, #a855f7, transparent)',
      },

      // ── Animations ─────────────────────────
      keyframes: {
        // Neon glow pulse on F3 logo
        purpleGlow: {
          '0%, 100%': {
            textShadow: '0 0 10px #a855f7, 0 0 24px #7c3aed, 0 0 48px #6d28d9',
          },
          '50%': {
            textShadow: '0 0 20px #c084fc, 0 0 48px #a855f7, 0 0 96px #7c3aed',
          },
        },
        // Ice sheen across glass cards
        iceSheen: {
          '0%':   { transform: 'translateX(-120%) skewX(-20deg)', opacity: '0'   },
          '10%':  { opacity: '0.9'                                                },
          '90%':  { opacity: '0.9'                                                },
          '100%': { transform: 'translateX(230%) skewX(-20deg)',  opacity: '0'   },
        },
        // EXP bar pulse
        expPulse: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(168,85,247,0.4)'                },
          '50%':      { boxShadow: '0 0 16px rgba(168,85,247,0.8), 0 0 32px rgba(168,85,247,0.3)' },
        },
        // Glitch — red layer
        glitchR: {
          '0%,100%': { clipPath: 'none',                  transform: 'translate(0)',      color: '#ff2a6d' },
          '5%':      { clipPath: 'inset(20% 0 60% 0)',    transform: 'translate(-4px,1px)'               },
          '15%':     { clipPath: 'inset(60% 0 20% 0)',    transform: 'translate(4px,-1px)'               },
          '30%':     { clipPath: 'inset(75% 0 10% 0)',    transform: 'translate(5px,2px)'                },
          '50%':     { clipPath: 'inset(45% 0 45% 0)',    transform: 'translate(5px,-2px)'               },
          '75%':     { clipPath: 'none',                  transform: 'translate(0)'                      },
        },
        // Glitch — blue layer
        glitchB: {
          '0%,100%': { clipPath: 'none',                  transform: 'translate(0)',      color: '#05d9e8' },
          '5%':      { clipPath: 'inset(50% 0 30% 0)',    transform: 'translate(4px,-1px)'               },
          '15%':     { clipPath: 'inset(10% 0 70% 0)',    transform: 'translate(-4px,1px)'               },
          '45%':     { clipPath: 'inset(25% 0 60% 0)',    transform: 'translate(-5px,-1px)'              },
          '60%':     { clipPath: 'inset(55% 0 30% 0)',    transform: 'translate(4px,2px)'                },
          '85%':     { clipPath: 'inset(35% 0 50% 0)',    transform: 'translate(-3px,1px)'               },
        },
        // Gentle float
        float: {
          '0%, 100%': { transform: 'translateY(0)'    },
          '50%':      { transform: 'translateY(-5px)' },
        },
        // ISSA seal glow
        sealGlow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 6px rgba(251,191,36,0.3))'  },
          '50%':      { filter: 'brightness(1.12) drop-shadow(0 0 14px rgba(251,191,36,0.6))' },
        },
        // Fade in up
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
      },

      animation: {
        'purple-glow': 'purpleGlow 3s ease-in-out infinite',
        'ice-sheen':   'iceSheen 6s ease-in-out infinite',
        'exp-pulse':   'expPulse 2s ease-in-out infinite',
        'glitch-r':    'glitchR 0.18s steps(1) infinite',
        'glitch-b':    'glitchB 0.18s steps(1) infinite 0.06s',
        'float':       'float 3s ease-in-out infinite',
        'seal-glow':   'sealGlow 2s ease-in-out infinite',
        'fade-in-up':  'fadeInUp 0.3s ease-out forwards',
      },
    },
  },

  plugins: [],
};

export default config;