// Reusable brutalist primitives.
// Import via: import { Panel, Row, Tag, DataBar, BBtn, MiniStat, FloatText, fmt } from './design/primitives.jsx';

import { useState, useEffect } from 'react';
import { COLORS } from './colors.js';

// ─── Number formatter ──────────────────────────────────────────────────────
export function fmt(n) {
  if (n == null || isNaN(n)) return '0';
  const useScientific = typeof window !== 'undefined' && localStorage.getItem('sg_scientific') === '1';
  if (useScientific && Math.abs(n) >= 1e6) {
    return n.toExponential(2).replace('+', '');
  }
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

// ─── Button ────────────────────────────────────────────────────────────────
export function BBtn({ children, onClick, disabled, variant = 'default', size = 'md', style, full, title }) {
  const [hover, setHover] = useState(false);
  const map = {
    default: { border: COLORS.amber,  text: COLORS.amber,  hoverBg: COLORS.amber,  hoverText: '#000' },
    danger:  { border: COLORS.red,    text: COLORS.red,    hoverBg: COLORS.red,    hoverText: '#000' },
    success: { border: COLORS.green,  text: COLORS.green,  hoverBg: COLORS.green,  hoverText: '#000' },
    cyan:    { border: COLORS.cyan,   text: COLORS.cyan,   hoverBg: COLORS.cyan,   hoverText: '#000' },
    purple:  { border: COLORS.purple, text: COLORS.purple, hoverBg: COLORS.purple, hoverText: '#000' },
    gold:    { border: COLORS.gold,   text: COLORS.gold,   hoverBg: COLORS.gold,   hoverText: '#000' },
    ghost:   { border: 'rgba(255,193,116,0.25)', text: COLORS.amberDim, hoverBg: 'rgba(255,193,116,0.1)', hoverText: COLORS.amber },
  };
  const c = map[variant] || map.default;
  const pad = size === 'sm' ? '6px 10px' : size === 'lg' ? '14px 18px' : '9px 14px';
  const fs = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: full ? '100%' : 'auto',
        background: disabled ? 'transparent' : hover ? c.hoverBg : 'transparent',
        color: disabled ? c.text : hover ? c.hoverText : c.text,
        border: `1px ${disabled ? 'dashed' : 'solid'} ${c.border}`,
        padding: pad,
        fontSize: fs,
        fontFamily: 'inherit',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        boxShadow: hover && !disabled ? `0 0 15px ${c.border}` : 'none',
        transition: 'background 120ms, box-shadow 120ms, color 120ms',
        borderRadius: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Data bar ──────────────────────────────────────────────────────────────
export function DataBar({ value, max = 100, color = COLORS.amber, height = 4, glow = false, label, gradient = null }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
  
    // Gradient mode: "heat" = amber→red, or pass custom [from, to]
    let fillBackground;
    if (gradient === 'heat') {
      fillBackground = `linear-gradient(90deg, ${COLORS.amber} 0%, ${COLORS.red} 100%)`;
    } else if (Array.isArray(gradient) && gradient.length === 2) {
      fillBackground = `linear-gradient(90deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
    } else {
      fillBackground = `linear-gradient(90deg, ${color}66, ${color})`;
    }
  
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: COLORS.amberDim, marginBottom: 3, letterSpacing: '0.12em' }}>
            <span>{label}</span>
            <span style={{ color }}>{Math.round(pct)}%</span>
          </div>
        )}
        <div style={{
          width: '100%',
          height,
          background: COLORS.surfaceHigh,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: fillBackground,
            boxShadow: glow ? `0 0 8px ${color}` : 'none',
            transition: 'width 260ms ease',
          }} />
        </div>
      </div>
    );
  }

// ─── Panel ─────────────────────────────────────────────────────────────────
export function Panel({ title, children, accent = COLORS.amber, right, style, dense }) {
  return (
    <div style={{
      background: COLORS.surfaceHigh,
      borderLeft: `4px solid ${accent}`,
      padding: dense ? '10px 12px' : '14px 16px',
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: dense ? 8 : 12,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: accent, fontWeight: 600,
          }}>
            :: {title}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Row ───────────────────────────────────────────────────────────────────
export function Row({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '4px 0',
      borderBottom: `1px dashed ${COLORS.amberFaint}`,
    }}>
      <span style={{ fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: color || COLORS.amber, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Tag ───────────────────────────────────────────────────────────────────
export function Tag({ children, color = COLORS.amber, filled = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      border: `1px solid ${color}`,
      background: filled ? color : 'transparent',
      color: filled ? '#000' : color,
      padding: '2px 6px',
      fontSize: 9,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}

// ─── Mini stat ─────────────────────────────────────────────────────────────
export function MiniStat({ label, value, unit, color }) {
  return (
    <div style={{
      background: COLORS.bg,
      padding: '6px 4px',
      textAlign: 'center',
      border: `1px solid ${COLORS.amberFaint}`,
    }}>
      <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.12em' }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 7, color: COLORS.amberDim, letterSpacing: '0.12em' }}>{unit}</div>
    </div>
  );
}

// ─── Float text (floating gain/loss animation) ─────────────────────────────
export function FloatText({ x, y, text, color }) {
  return (
    <div style={{
      position: 'fixed', left: x, top: y,
      color, fontWeight: 800, fontSize: 14,
      pointerEvents: 'none',
      textShadow: `0 0 10px ${color}`,
      animation: 'floatPop 900ms cubic-bezier(.2,.9,.2,1) both',
      zIndex: 100,
      letterSpacing: '0.08em',
    }}>
      {text}
    </div>
  );
}

// ─── Section divider ───────────────────────────────────────────────────────
export function Divider({ label, color = COLORS.amberDim }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      margin: '18px 0 10px 0',
    }}>
      <span style={{ fontSize: 10, color, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
        :: {label}
      </span>
      <span style={{ flex: 1, height: 1, background: `${color}33` }} />
    </div>
  );
}

// ─── Glow helpers ──────────────────────────────────────────────────────────
// Consistent glow intensity across the app. Use in hover/active states.
export const GLOW = {
  subtle:  (c) => `0 0 6px ${c}33`,
  medium:  (c) => `0 0 12px ${c}66`,
  strong:  (c) => `0 0 20px ${c}aa, 0 0 40px ${c}44`,
  inset:   (c) => `inset 0 0 12px ${c}22`,
};

// ─── Hex — hexagonal decoration (cyberpunk staple) ────────────────────────
export function Hex({ size = 16, color = COLORS.amber, filled = false, glow = false }) {
  const w = size;
  const h = size * 0.866;
  return (
    <svg width={w} height={h} viewBox="0 0 100 86.6" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon
        points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
        stroke={color}
        strokeWidth="3"
        fill={filled ? color : 'none'}
        style={{ filter: glow ? `drop-shadow(0 0 4px ${color})` : 'none' }}
      />
    </svg>
  );
}

// ─── Bracket — HUD corner bracket ─────────────────────────────────────────
export function HudBracket({ size = 8, color = COLORS.amber, position = 'tl' }) {
  const stroke = 1;
  const d = {
    tl: `M 0 ${size} L 0 0 L ${size} 0`,
    tr: `M ${size} ${size} L ${size} 0 L 0 0`,
    bl: `M 0 0 L 0 ${size} L ${size} ${size}`,
    br: `M 0 0 L ${size} 0 L ${size} ${size} L 0 ${size}`,
  }[position];
  return (
    <svg width={size} height={size} style={{ position: 'absolute', pointerEvents: 'none' }}>
      <path d={d} stroke={color} strokeWidth={stroke} fill="none" opacity="0.7" />
    </svg>
  );
}

export { COLORS } from './colors.js';