// ─────────────────────────────────────────────
//  F3 — Mobile Sidebar Wrapper
//  Hamburger toggle for mobile, always-visible
//  on desktop. Works with any sidebar content.
// ─────────────────────────────────────────────

'use client';

import { useState, useEffect } from 'react';

interface MobileSidebarWrapperProps {
  sidebar:   React.ReactNode;
  children:  React.ReactNode;
  accentColor?: string;
}

export default function MobileSidebarWrapper({
  sidebar,
  children,
  accentColor = '#a855f7',
}: MobileSidebarWrapperProps) {
  const [open, setOpen] = useState(false);

  // Close on route change / resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="flex min-h-screen w-full" style={{ position: 'relative' }}>

      {/* ── Desktop sidebar — always visible ── */}
      <div className="hidden lg:flex lg:flex-col shrink-0" style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {sidebar}
      </div>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(0,0,0,.65)',
            zIndex:     40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

     {/* ── Mobile sidebar drawer ── */}
      <div
        className="lg:hidden"
        style={{
          position:   'fixed',
          top:        0,
          left:       0,
          bottom:     0,
          width:      '240px',
          zIndex:     50,
          transform:  open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s ease',
          overflowY:  'auto',
          overflowX:  'hidden',
        }}
      >
        {sidebar}
      </div>

      {/* ── Mobile hamburger button ── */}
      <button
        className="lg:hidden"
        onClick={() => setOpen(prev => !prev)}
        style={{
          position:       'fixed',
          top:            '12px',
          left:           '12px',
          zIndex:         60,
          background:     `rgba(0,0,0,.6)`,
          border:         `1px solid ${accentColor}44`,
          borderRadius:   '8px',
          color:          accentColor,
          width:          '40px',
          height:         '40px',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '5px',
          cursor:         'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow:      `0 0 12px ${accentColor}33`,
        }}
      >
        <span style={{
          width:      '18px', height: '1.5px',
          background: accentColor,
          transition: 'all .2s',
          transform:  open ? 'rotate(45deg) translate(4px, 4px)' : 'none',
        }}/>
        <span style={{
          width:      '18px', height: '1.5px',
          background: accentColor,
          transition: 'all .2s',
          opacity:    open ? 0 : 1,
        }}/>
        <span style={{
          width:      '18px', height: '1.5px',
          background: accentColor,
          transition: 'all .2s',
          transform:  open ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
        }}/>
      </button>

      {/* ── Main content ── */}
      <main
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ paddingTop: 0 }}
      >
        {/* Mobile top padding so content clears the hamburger */}
        <div className="lg:hidden" style={{ height: '56px' }} />
        {children}
      </main>
    </div>
  );
}