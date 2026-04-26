// Live hex feed — ambient flicker of random hex bytes.
// Use as decoration in detail panels, modal sidebars, or anywhere
// you want the "live system" feel from packet sniffer aesthetics.
//
// Usage:
//   <HexFeed lines={4} bytesPerLine={8} color={COLORS.amberDim} />
//   <HexFeed lines={2} bytesPerLine={12} color={COLORS.cyan} interval={250} />

import { useEffect, useState } from 'react';
import { COLORS } from '../design/colors.js';

function randHexByte() {
  return Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
}

function genLine(bytes) {
  const arr = [];
  for (let i = 0; i < bytes; i++) arr.push(randHexByte());
  return arr.join(' ');
}

function genAddr() {
  return '0x' + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase();
}

export function HexFeed({
  lines = 3,
  bytesPerLine = 8,
  color = COLORS.amberDim,
  interval = 380,
  showAddr = true,
  fontSize = 8,
  letterSpacing = '0.1em',
  style,
}) {
  const [data, setData] = useState(() =>
    Array.from({ length: lines }, () => ({ addr: genAddr(), bytes: genLine(bytesPerLine) }))
  );

  useEffect(() => {
    const iv = setInterval(() => {
      setData(prev => {
        // Replace ~half lines per tick — others persist for that "feed" feel
        return prev.map(row =>
          Math.random() < 0.55
            ? { addr: genAddr(), bytes: genLine(bytesPerLine) }
            : row
        );
      });
    }, interval);
    return () => clearInterval(iv);
  }, [bytesPerLine, interval]);

  return (
    <div
      style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize,
        letterSpacing,
        color,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        opacity: 0.55,
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {data.map((row, i) => (
        <div
          key={i}
          className="hex-feed-line"
          style={{
            display: 'flex',
            gap: 8,
            animationDelay: `${(i * 240) % 1800}ms`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'clip',
          }}
        >
          {showAddr && <span style={{ color, opacity: 0.7 }}>{row.addr}</span>}
          <span>{row.bytes}</span>
        </div>
      ))}
    </div>
  );
}

// Single-line ticker variant — for sidebars / compact spaces
export function HexTicker({ length = 16, color = COLORS.cyan, interval = 200, style }) {
  const [val, setVal] = useState(() => genLine(length));
  useEffect(() => {
    const iv = setInterval(() => setVal(genLine(length)), interval);
    return () => clearInterval(iv);
  }, [length, interval]);
  return (
    <div
      style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 8,
        letterSpacing: '0.12em',
        color,
        opacity: 0.6,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        ...style,
      }}
    >
      {val}
    </div>
  );
}