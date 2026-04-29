// ─────────────────────────────────────────────
//  F3 — Shared Input Styles
//  Import these instead of defining locally.
// ─────────────────────────────────────────────

import type { CSSProperties } from 'react';

export const inputStyle: CSSProperties = {
  background:   'rgba(0,0,0,.45)',
  border:       '1px solid rgba(168,85,247,.25)',
  color:        '#e0d8ff',
  fontFamily:   'Courier New, monospace',
  fontSize:     '14px',
  borderRadius: '6px',
  padding:      '8px 11px',
  outline:      'none',
  width:        '100%',
  transition:   'border-color .18s ease, box-shadow .18s ease',
};

export const inputFocusStyle: CSSProperties = {
  borderColor: '#a855f7',
  boxShadow:   '0 0 0 2px rgba(168,85,247,.18), 0 0 10px rgba(168,85,247,.22)',
};

export const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize:    'vertical',
  minHeight: '80px',
};

export const inputClientStyle: CSSProperties = {
  ...inputStyle,
  border:    '1px solid rgba(0,255,200,.25)',
  color:     '#a7f3d0',
};

export const inputClientFocusStyle: CSSProperties = {
  borderColor: '#00ffc8',
  boxShadow:   '0 0 0 2px rgba(0,255,200,.15), 0 0 10px rgba(0,255,200,.2)',
};