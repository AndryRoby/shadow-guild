// NodeDecayWarning — sidebar alert when owned nodes are losing stability.
// Shows the worst-affected nodes so player knows to MAINTAIN them.
//
// Visible when at least 1 owned node has stability < 70%.

import { COLORS } from '../design/colors.js';
import { CITY_MAP } from '../../CITY_MAP.js';

export function NodeDecayWarning({ state }) {
  const stability = state.nodeStability ?? {};
  const owned = state.capturedHexes ?? [];

  // Find owned nodes with concerning stability (skip player base / warpgates)
  const decaying = owned
    .filter(id => CITY_MAP[id] && CITY_MAP[id].type !== 'warpgate')
    .map(id => ({
      id,
      label: CITY_MAP[id]?.label ?? id,
      stab: stability[id] ?? 100,
    }))
    .filter(n => n.stab < 70)
    .sort((a, b) => a.stab - b.stab);

  if (decaying.length === 0) return null;

  const worst = decaying[0];
  const critical = decaying.filter(n => n.stab < 30).length;
  const accentColor = critical > 0 ? COLORS.red : COLORS.orange;

  return (
    <div style={{
      padding: '8px 10px',
      borderLeft: `3px solid ${accentColor}`,
      background: `${accentColor}0a`,
      animation: critical > 0 ? 'pulseHeatNew 1.6s ease-in-out infinite' : undefined,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 8, color: accentColor, letterSpacing: '0.25em', fontWeight: 800,
        }}>
          :: NODE_DECAY{critical > 0 ? ' // CRITICAL' : ''}
        </span>
        <span style={{
          fontSize: 9, color: accentColor, fontVariantNumeric: 'tabular-nums', fontWeight: 700,
        }}>
          {decaying.length}
        </span>
      </div>

      {/* Worst node */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontSize: 10, marginBottom: 3,
      }}>
        <span style={{
          color: COLORS.amber, fontWeight: 700, letterSpacing: '0.04em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
        }}>
          {worst.label}
        </span>
        <span style={{ color: accentColor, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
          {Math.round(worst.stab)}%
        </span>
      </div>

      {decaying.length > 1 && (
        <div style={{ fontSize: 9, color: COLORS.amberDim, fontStyle: 'italic', letterSpacing: '0.04em' }}>
          + {decaying.length - 1} more · MAINTAIN in NETWORK tab
        </div>
      )}
    </div>
  );
}