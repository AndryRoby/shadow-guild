// Forward-looking event timeline — one-line strategic planning aid.
// Inspired by How Many Dudes / Swarm Simulator.

import { Panel, COLORS } from '../design/primitives.jsx';
import { getEventTimeline } from '../selectors.js';

function fmtTime(sec) {
  if (sec <= 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function EventTimeline({ state }) {
  const events = getEventTimeline(state);

  if (events.length === 0) {
    return null;
  }

  return (
    <Panel accent={COLORS.cyan} title="TIMELINE" dense>
      <div style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        overflow: 'hidden',
      }}>
        {events.map((ev, i) => (
          <div
            key={`${ev.type}-${i}`}
            style={{
              padding: '4px 8px',
              border: `1px solid ${ev.color}`,
              background: `${ev.color}0a`,
              fontSize: 9,
              letterSpacing: '0.08em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              opacity: ev.hidden ? 0.5 : 1,
            }}
            title={ev.label}
          >
            <span style={{ color: ev.color, fontSize: 10 }}>{ev.icon}</span>
            <span style={{
              color: ev.color,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 30,
            }}>
              {fmtTime(ev.seconds)}
            </span>
            <span style={{
              color: COLORS.amberDim,
              textTransform: 'uppercase',
              fontSize: 8,
            }}>
              {ev.label.length > 20 ? ev.label.slice(0, 18) + '…' : ev.label}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}