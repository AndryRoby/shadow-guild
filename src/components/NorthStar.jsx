// NorthStar — distant endgame target widget for sidebar.
// Shows AETHERIA_SPIRE as a perpetual goal so the player understands
// the long-arc objective from the very first session (C&C lesson).
//
// Visible from action #1. State: locked → preparing → ready.

import { COLORS } from '../design/colors.js';

function getStage(state) {
  const captured = state.capturedHexes?.length ?? 0;
  const prestige = state.prestige ?? 0;
  const level = state.level ?? 1;

  // Already taken? (player captured aetheria_spire)
  if (state.capturedHexes?.includes('aetheria_spire')) {
    return { stage: 'taken', label: 'AETHERIA_SPIRE // TAKEN', sub: 'The city is yours.', color: COLORS.gold, pct: 100 };
  }

  if (prestige >= 3) {
    return { stage: 'ready', label: 'AETHERIA_SPIRE // BREACH READY', sub: 'All conditions met. Strike now.', color: COLORS.red, pct: 100 };
  }

  if (prestige >= 1) {
    return {
      stage: 'closing',
      label: 'AETHERIA_SPIRE // CLOSING IN',
      sub: `Prestige ${prestige}/3 · Captures ${captured}/15`,
      color: COLORS.orange,
      pct: Math.min(95, ((prestige / 3) * 60 + (Math.min(captured, 15) / 15) * 35)),
    };
  }

  if (captured >= 1) {
    return {
      stage: 'preparing',
      label: 'AETHERIA_SPIRE // SCANNING',
      sub: `Network nodes ${captured} captured · Awakening locked`,
      color: COLORS.amber,
      pct: Math.min(50, captured * 4 + level * 1.5),
    };
  }

  return {
    stage: 'distant',
    label: 'AETHERIA_SPIRE // DISTANT',
    sub: 'Siphon. Capture. Ascend.',
    color: COLORS.amberDim,
    pct: Math.min(8, level * 0.8),
  };
}

export function NorthStar({ state, compact = false }) {
  const s = getStage(state);
  const isReady = s.stage === 'ready';
  const isTaken = s.stage === 'taken';

  return (
    <div style={{
      padding: compact ? '8px 10px' : '10px 12px',
      background: COLORS.surface,
      borderLeft: `3px solid ${s.color}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header label — distinguishes this from TIMELINE / CURRENT_OBJECTIVE */}
      <div style={{
        fontSize: 8,
        color: COLORS.amberDim,
        letterSpacing: '0.25em',
        marginBottom: 5,
      }}>
        :: ENDGAME_TARGET
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Distant pulsing dot */}
        <div style={{
          width: 8, height: 8,
          background: s.color,
          boxShadow: `0 0 ${isReady ? 12 : 6}px ${s.color}`,
          flexShrink: 0,
          animation: isTaken ? 'none' : 'pulseHeatNew 2.4s ease-in-out infinite',
        }} />
        <div style={{
          fontSize: 9,
          color: s.color,
          letterSpacing: '0.18em',
          fontWeight: 700,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {s.label}
        </div>
      </div>

      {/* Sub-line */}
      <div style={{
        fontSize: 9,
        color: COLORS.amberDim,
        marginTop: 4,
        letterSpacing: '0.05em',
        fontStyle: 'italic',
        opacity: 0.8,
      }}>
        › {s.sub}
      </div>

      {/* Progress wire */}
      {!isTaken && (
        <div style={{
          marginTop: 6,
          height: 1,
          background: COLORS.surfaceHigh,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: 0, top: 0,
            width: `${s.pct}%`,
            height: '100%',
            background: s.color,
            boxShadow: `0 0 4px ${s.color}`,
            transition: 'width 600ms ease-out',
          }} />
        </div>
      )}

      {/* Background micro hex pattern at bottom for ambient sci-fi */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -2, right: -4,
          fontSize: 7,
          color: s.color,
          opacity: 0.12,
          letterSpacing: '0.4em',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          pointerEvents: 'none',
        }}
      >
        ◉◉◉
      </div>
    </div>
  );
}