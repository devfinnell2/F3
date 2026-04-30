// ─────────────────────────────────────────────
//  F3 — Animated Flame Icon
//  From brand-iconography design system
// ─────────────────────────────────────────────

'use client';

export default function FlameIcon({ size = 22 }: { size?: number }) {
  return (
    <>
      <style>{`
        @keyframes flick1 {
          0%,100% { transform:translateY(0) scale(1);    opacity:.95 }
          25%      { transform:translateY(-1px) scale(1.02); opacity:1   }
          50%      { transform:translateY(.5px) scale(.98);  opacity:.9  }
          75%      { transform:translateY(-.5px) scale(1.01);opacity:.97 }
        }
        @keyframes flick2 {
          0%,100% { transform:translateY(0) scale(1);     opacity:.85 }
          33%      { transform:translateY(-1.5px) scale(1.03);opacity:.95 }
          66%      { transform:translateY(1px) scale(.97);   opacity:.8  }
        }
        @keyframes spark {
          0%   { transform:translateY(0);    opacity:0 }
          20%  { opacity:1 }
          100% { transform:translateY(-18px);opacity:0 }
        }
        .f3-f-outer { animation:flick1 1.4s ease-in-out infinite; transform-origin:50% 100%; }
        .f3-f-mid   { animation:flick2  .9s ease-in-out infinite; transform-origin:50% 100%; }
        .f3-f-core  { animation:flick1  .6s ease-in-out infinite; transform-origin:50% 100%; }
        .f3-f-sp1   { animation:spark  1.6s ease-out infinite; }
        .f3-f-sp2   { animation:spark  1.6s ease-out  .4s infinite; }
        .f3-f-sp3   { animation:spark  1.6s ease-out  .9s infinite; }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <linearGradient id="fO" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#f472b6" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#a855f7"/>
            <stop offset="100%" stopColor="#f472b6" stopOpacity=".2"/>
          </linearGradient>
          <linearGradient id="fM" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#f472b6"/>
            <stop offset="60%"  stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="fC" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#fff"/>
            <stop offset="70%"  stopColor="#00ffc8"/>
            <stop offset="100%" stopColor="#00ffc8" stopOpacity="0"/>
          </linearGradient>
          <filter id="fGlow">
            <feGaussianBlur stdDeviation="1.1"/>
          </filter>
        </defs>

        {/* Outer flame */}
        <path className="f3-f-outer" filter="url(#fGlow)" fill="url(#fO)"
          d="M20 36 C10 34 6 26 9 18 C10 15 12 14 13 16 C13 12 15 8 20 3 C20 10 26 11 27 17 C28 15 30 15 31 18 C34 26 30 34 20 36 Z"/>
        {/* Mid flame */}
        <path className="f3-f-mid" filter="url(#fGlow)" fill="url(#fM)"
          d="M20 34 C14 33 11 28 13 22 C14 20 15 20 15 22 C15 17 18 13 20 9 C20 15 24 16 24 21 C25 20 26 21 27 23 C29 28 26 33 20 34 Z"/>
        {/* Core flame */}
        <path className="f3-f-core" fill="url(#fC)"
          d="M20 32 C17 31 16 28 17 25 C18 23 19 22 19 24 C19 20 20 17 20 14 C20 19 22 21 22 25 C22 29 22 31 20 32 Z"/>

        {/* Sparks */}
        <circle className="f3-f-sp1" cx="14" cy="22" r="0.8" fill="#f472b6"/>
        <circle className="f3-f-sp2" cx="26" cy="24" r="0.7" fill="#fbbf24"/>
        <circle className="f3-f-sp3" cx="20" cy="20" r="0.6" fill="#00ffc8"/>
      </svg>
    </>
  );
}