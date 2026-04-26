// Terminal boot sequence. Mounts on first session OR after hard reset.
// Skip on click anywhere. Auto-completes after ~3.5s.
//
// Mount in App.jsx top-level:
//   {showBoot && <BootSequence onComplete={() => setShowBoot(false)} />}
//
// Skip flag stored in localStorage as 'sg_boot_seen' so subsequent sessions
// in the same install skip it. Hard reset clears the flag.

import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../design/colors.js';

const LINES = [
  { t: 0,    text: '> initializing shadow_guild kernel v6.4.1',               style: 'dim' },
  { t: 600,  text: '[OK] memory map allocated // 0x00000000-0x7FFFFFFF',       style: 'green' },
  { t: 1200, text: '[OK] neural link established // latency 4ms',              style: 'green' },
  { t: 1800, text: '[..] decrypting credentials',                              style: 'amber' },
  { t: 2400, text: '[OK] credentials verified // operator class: GHOST',       style: 'green' },
  { t: 3000, text: '[..] establishing covert channel via tor exit node',       style: 'amber' },
  { t: 3600, text: '[OK] channel open // upstream: 0x4f.b3.2a.91',              style: 'green' },
  { t: 4200, text: '[..] scanning known network topology',                     style: 'amber' },
  { t: 4800, text: '[OK] 31 nodes detected // 8 hostile, 1 friendly, 22 unknown', style: 'green' },
  { t: 5400, text: '[!!] WARNING: surveillance grid active in your sector',    style: 'red' },
  { t: 6000, text: '[OK] heat sink calibrated // baseline thermal: nominal',    style: 'green' },
  { t: 6600, text: '[..] loading prestige cache',                              style: 'amber' },
  { t: 7200, text: '[OK] cache restored // continue from last extraction',      style: 'green' },
  { t: 7800, text: '',                                                         style: 'dim' },
  { t: 8200, text: '> shadow_guild ready.',                                    style: 'amber' },
  { t: 8800, text: "> you have one job. don't get caught.",                    style: 'amber' },
  { t: 9400, text: '',                                                         style: 'dim' },
  { t: 9800, text: '[ZERO >>] welcome back. they don\'t see you yet.',          style: 'zero' },
];

const TOTAL = 12000; // Zvýšený celkový čas pre hladký dobeh

function colorFor(style) {
  switch (style) {
    case 'green': return COLORS.green;
    case 'red':   return COLORS.red;
    case 'amber': return COLORS.amber;
    case 'zero':  return COLORS.zeroMessage;
    case 'dim':
    default:      return COLORS.amberDim;
  }
}
 
export function BootSequence({ onComplete }) {
  const [shown, setShown] = useState([]);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);
 
  // Schedule line reveals
  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => setShown(prev => [...prev, i]), line.t)
    );
    const finishTimer = setTimeout(() => setDone(true), TOTAL);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, []);
 
  // Auto-complete + click-to-skip handler — App.jsx handles persistence flag
  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  };
 
  useEffect(() => {
    if (done) {
      const t = setTimeout(finish, 700); // brief pause before fading
      return () => clearTimeout(t);
    }
  }, [done]);
 
  // Keyboard: any key skips
  useEffect(() => {
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  return (
    <div
      onClick={finish}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#050505',
        cursor: 'pointer',
        overflow: 'hidden',
        animation: done ? 'none' : undefined,
        opacity: done ? 0 : 1,
        transition: done ? 'opacity 500ms ease-out' : 'none',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 56px',
      }}
    >
      {/* Top bar — terminal chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 10,
          color: COLORS.amberDim,
          letterSpacing: '0.3em',
          paddingBottom: 12,
          borderBottom: `1px solid ${COLORS.amberLine}`,
        }}
      >
        <div style={{ width: 6, height: 6, background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
        <span>:: SHADOW_GUILD // BOOTLOADER</span>
        <span style={{ flex: 1 }} />
        <span style={{ opacity: 0.6 }}>PRESS ANY KEY TO SKIP</span>
      </div>
 
      {/* Scrolling lines */}
      <div
        style={{
          flex: 1,
          paddingTop: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontSize: 12,
          letterSpacing: '0.04em',
          lineHeight: 1.6,
          maxWidth: 880,
        }}
      >
        {shown.map(i => {
          const line = LINES[i];
          return (
            <div
              key={i}
              className="boot-line"
              style={{
                color: colorFor(line.style),
                textShadow: line.style === 'zero' ? `0 0 8px ${COLORS.zeroMessage}55` : 'none',
                minHeight: 18,
              }}
            >
              {line.text}
            </div>
          );
        })}
        {!done && shown.length > 0 && (
          <div style={{ color: COLORS.amber, marginTop: 4 }}>
            <span className="boot-cursor">▌</span>
          </div>
        )}
      </div>
 
      {/* Bottom version */}
      <div
        style={{
          fontSize: 9,
          color: COLORS.amberDim,
          letterSpacing: '0.4em',
          opacity: 0.5,
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.amberLine}`,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>SHADOW_GUILD v6.4.1 // BUILD 2026.04</span>
        <span>UPLINK SECURE // 256-BIT</span>
      </div>
    </div>
  );
}
