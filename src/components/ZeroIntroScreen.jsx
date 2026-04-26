// ZERO intro phase. Mounts after BootSequence completes (appPhase 'INTRO').
// Same visual chrome as BootSequence so it feels like a continuation
// of the same terminal session rather than a separate screen.

import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../design/colors.js';

const INTRO_LINES = [
  { t: 200,  text: '> incoming transmission // unknown sender',           style: 'dim' },
  { t: 700,  text: '[OK] handshake accepted // routing through tor',      style: 'green' },
  { t: 1200, text: '',                                                     style: 'dim' },
  { t: 1500, text: '[ZERO >>] aether-biotech owns this city.',             style: 'zero' },
  { t: 3000, text: '[ZERO >>] every camera. every transaction. every breath.', style: 'zero' },
  { t: 4800, text: "[ZERO >>] you're the only one who sees it.",           style: 'zero' },
];

const TOTAL_BEFORE_BUTTON = 5800;

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

export function ZeroIntroScreen({ onComplete }) {
  const [shown, setShown] = useState([]);
  const [showBegin, setShowBegin] = useState(false);
  const [exiting, setExiting] = useState(false);
  const completedRef = useRef(false);

  // Schedule line reveals
  useEffect(() => {
    const timers = INTRO_LINES.map((line, i) =>
      setTimeout(() => setShown(prev => [...prev, i]), line.t)
    );
    const beginTimer = setTimeout(() => setShowBegin(true), TOTAL_BEFORE_BUTTON);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(beginTimer);
    };
  }, []);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setExiting(true);
    setTimeout(() => onComplete?.(), 350);
  };

  // Allow Enter / Space to confirm once button is visible
  useEffect(() => {
    if (!showBegin) return;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBegin]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#050505',
        overflow: 'hidden',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 350ms ease-out',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 56px',
      }}
    >
      {/* Top bar — identical to BootSequence */}
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
        <div style={{
          width: 6, height: 6,
          background: COLORS.zeroMessage,
          boxShadow: `0 0 8px ${COLORS.zeroMessage}`,
        }} />
        <span>:: SHADOW_GUILD // INCOMING_TRANSMISSION</span>
        <span style={{ flex: 1 }} />
        <span style={{ opacity: 0.6 }}>SECURE CHANNEL</span>
      </div>

      {/* Lines area */}
      <div
        style={{
          flex: 1,
          paddingTop: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontSize: 13,
          letterSpacing: '0.04em',
          lineHeight: 1.7,
          maxWidth: 880,
        }}
      >
        {shown.map(i => {
          const line = INTRO_LINES[i];
          return (
            <div
              key={i}
              className="boot-line"
              style={{
                color: colorFor(line.style),
                textShadow: line.style === 'zero' ? `0 0 10px ${COLORS.zeroMessage}66` : 'none',
                minHeight: 22,
                fontWeight: line.style === 'zero' ? 500 : 400,
              }}
            >
              {line.text}
            </div>
          );
        })}
        {!showBegin && shown.length > 0 && (
          <div style={{ color: COLORS.zeroMessage, marginTop: 8 }}>
            <span className="boot-cursor">▌</span>
          </div>
        )}

        {/* BEGIN button — appears after all lines shown */}
        {showBegin && (
          <div style={{ marginTop: 32, animation: 'snapIn 400ms ease-out' }}>
            <button
              onClick={finish}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.amber}`,
                color: COLORS.amber,
                padding: '12px 28px',
                fontFamily: 'inherit',
                fontSize: 12,
                letterSpacing: '0.4em',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 140ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.amber;
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.boxShadow = `0 0 18px ${COLORS.amber}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = COLORS.amber;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              [ BEGIN ]
            </button>
            <div style={{
              fontSize: 9,
              color: COLORS.amberDim,
              marginTop: 10,
              letterSpacing: '0.25em',
            }}>
              › press ENTER or click to acknowledge
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar — identical to BootSequence */}
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
        <span>SOURCE: CLASSIFIED // FREQ: ENCRYPTED</span>
        <span>UPLINK SECURE // 256-BIT</span>
      </div>
    </div>
  );
}