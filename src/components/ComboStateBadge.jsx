// ComboStateBadge — visual indicator of the combo state machine.
//   STEALTH:    grey/dim, no animation        — "you're invisible"
//   AGGRESSIVE: amber, building pulse          — "they're starting to notice"
//   BURNING:    red, shaking, danger            — "STOP OR YOU BURN"
//
// Auto-hides when combo = 0 (idle).
// Mounted into Sidebar above the heat row, so it's always in peripheral vision.

import { COLORS } from '../design/colors.js';
import { getComboState, getComboMult, getComboHeatPenalty } from '../gameLogic.js';

const STATE_META = {
  STEALTH: {
    label:    'STEALTH',
    color:    COLORS.green,
    bg:       `${COLORS.green}0a`,
    border:   `${COLORS.green}55`,
    desc:     'Invisible',
    riskText: 'safe',
  },
  AGGRESSIVE: {
    label:    'AGGRESSIVE',
    color:    COLORS.amber,
    bg:       `${COLORS.amber}11`,
    border:   `${COLORS.amber}88`,
    desc:     'They notice',
    riskText: '+0.5 heat / click',
  },
  BURNING: {
    label:    '! BURNING !',
    color:    COLORS.red,
    bg:       `${COLORS.red}22`,
    border:   COLORS.red,
    desc:     'STOP OR BURN',
    riskText: '+2.0 heat / click',
  },
};

export function ComboStateBadge({ comboCount }) {
  if ((comboCount ?? 0) === 0) return null;

  const state = getComboState(comboCount);
  const meta  = STATE_META[state];
  const mult  = getComboMult(comboCount).toFixed(1);

  // Risk progress bar — visualizes how deep into burning territory player is.
  // Caps at 30 combo (matches state.comboCount cap in applyComboAndCrit).
  const progressPct = Math.min(100, (comboCount / 30) * 100);

  return (
    <div style={{
      padding: '8px 10px',
      background: meta.bg,
      borderLeft: `3px solid ${meta.color}`,
      animation: state === 'BURNING'
        ? 'comboBurningPulse 0.4s ease-in-out infinite'
        : state === 'AGGRESSIVE'
          ? 'comboAggressivePulse 1.1s ease-in-out infinite'
          : undefined,
    }}>
      {/* Top: state label + multiplier */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 9,
          color: meta.color,
          letterSpacing: '0.25em',
          fontWeight: 800,
        }}>
          :: COMBO_{meta.label}
        </span>
        <span style={{
          fontSize: 12,
          color: meta.color,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textShadow: state === 'BURNING' ? `0 0 8px ${meta.color}` : 'none',
        }}>
          ×{mult}
        </span>
      </div>

      {/* Combo count + segmented bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 18,
          fontWeight: 800,
          color: meta.color,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 32,
          letterSpacing: '-0.01em',
        }}>
          {comboCount}
        </span>

        <div style={{ flex: 1, position: 'relative', height: 6 }}>
          {/* Background track */}
          <div style={{
            position: 'absolute', inset: 0,
            background: COLORS.bg,
            border: `1px solid ${meta.border}`,
          }} />
          {/* Filled portion */}
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${progressPct}%`,
            background: meta.color,
            transition: 'width 200ms ease-out',
            boxShadow: state === 'BURNING' ? `0 0 6px ${meta.color}` : 'none',
          }} />
          {/* State threshold ticks at 6 and 16 (visual reference) */}
          <div style={{
            position: 'absolute', top: -2, left: '20%',
            width: 1, height: 10,
            background: COLORS.amberLine,
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute', top: -2, left: '53%',
            width: 1, height: 10,
            background: COLORS.amberLine,
            opacity: 0.5,
          }} />
        </div>
      </div>

      {/* Risk text */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 8,
        color: meta.color,
        letterSpacing: '0.15em',
        fontStyle: state === 'STEALTH' ? 'italic' : 'normal',
        opacity: state === 'STEALTH' ? 0.65 : 1,
        fontWeight: state === 'BURNING' ? 800 : 500,
      }}>
        <span>{meta.desc}</span>
        <span>{meta.riskText}</span>
      </div>
    </div>
  );
}