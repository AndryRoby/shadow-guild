// NETWORK tab — node topology view.
// Replaced text district list with interactive SVG city map.
//
// Layout:
//   - Top bar: bandwidth, owned count, no-agents warning, view toggle
//   - Active missions (compact strip)
//   - Map canvas (CityMap) with overlay node detail panel
//   - "List" view fallback for accessibility / power users (toggle)

import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Map, List, Cpu } from 'lucide-react';

import { Tag, BBtn, COLORS } from '../design/primitives.jsx';
import { getActiveMissions, getBandwidth, getMissionLimit } from '../selectors.js';
import { CityMap } from './CityMap.jsx';
import { CityMapNodeDetail } from './CityMapNodeDetail.jsx';

export function NetworkTab({ state, dispatchWithSound }) {
  const missions = getActiveMissions(state);
  const bandwidth = getBandwidth(state);
  const missionLimit = getMissionLimit(state);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const activeAgents = useMemo(
    () => (state.agents ?? []).filter(a => a.status === 'ACTIVE'),
    [state.agents]
  );

  // Force re-render every second for mission timers
  const [, setTick] = useState(0);
  useEffect(() => {
    if (missions.length === 0) return;
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [missions.length]);

  const ownedCount = (state.capturedHexes ?? []).filter(id => !id.endsWith('_warpgate')).length;
  const noAgents = activeAgents.length === 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: 10,
      height: '100%',
      minHeight: 0,
    }}>
      {/* ─── HEADER ────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 8, borderBottom: `1px solid ${COLORS.amberLine}`,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.amber, letterSpacing: '0.15em' }}>
            CITY_NETWORK
          </div>
          <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 3, letterSpacing: '0.1em' }}>
            {ownedCount} nodes secured · click any visible node for details
          </div>
        </div>

        <BandwidthBadge bw={bandwidth} />
      </div>

      {/* ─── NO OPERATIVES WARNING ─────────────────── */}
      {noAgents && (
        <div style={{
          padding: 8,
          border: `1px dashed ${COLORS.orange}`,
          background: `${COLORS.orange}11`,
          fontSize: 10,
          letterSpacing: '0.15em',
          color: COLORS.orange,
          fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={12} />
          NO_ACTIVE_OPERATIVES — Recruit in AGENCY to deploy infiltrations.
        </div>
      )}

      {/* ─── ACTIVE MISSIONS PANEL ──────────────────── */}
      {missions.length > 0 && (
        <div style={{
          padding: '8px 10px',
          background: `${COLORS.cyan}0a`,
          borderLeft: `3px solid ${COLORS.cyan}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ color: COLORS.cyan, letterSpacing: '0.2em', fontWeight: 700, fontSize: 10 }}>
              :: ACTIVE_INFILTRATIONS
            </span>
            <Tag color={missionLimit.isFull ? COLORS.red : COLORS.cyan}>
              {missionLimit.used} / {missionLimit.max} MISSIONS
            </Tag>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {missions.map(m => {
              const total = Math.max(1, m.totalSeconds ?? 1);
              const remain = m.secondsLeft ?? 0;
              const pct = ((total - remain) / total) * 100;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedNodeId(m.hexId)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    alignItems: 'center', gap: 10,
                    background: 'transparent',
                    border: `1px solid ${COLORS.cyan}33`,
                    color: COLORS.cyan,
                    padding: '5px 9px',
                    fontFamily: 'inherit',
                    fontSize: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  title={`${m.agent} · ${m.chance}%`}
                >
                  <span style={{
                    color: COLORS.amber, fontWeight: 700, letterSpacing: '0.05em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {m.target}
                  </span>
                  <span style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.05em' }}>
                    {m.agent}
                  </span>
                  <span style={{
                    fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                    color: remain > 0 ? COLORS.cyan : COLORS.green,
                    minWidth: 56, textAlign: 'right',
                  }}>
                    {remain > 0 ? `T-${remain}s` : 'EXTRACT'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── MAP CANVAS ──────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: 0,
        position: 'relative',
        border: `1px solid ${COLORS.amberLine}`,
      }}>
        <CityMap
          state={state}
          onSelectNode={setSelectedNodeId}
          selectedNodeId={selectedNodeId}
        />

        {selectedNodeId && (
          <CityMapNodeDetail
            nodeId={selectedNodeId}
            state={state}
            dispatchWithSound={dispatchWithSound}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}

function BandwidthBadge({ bw }) {
  const overload = bw.used >= bw.max;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 10px',
      border: `1px solid ${overload ? COLORS.red : COLORS.cyan}`,
      background: overload ? `${COLORS.red}10` : `${COLORS.cyan}08`,
    }}>
      <Cpu size={12} color={overload ? COLORS.red : COLORS.cyan} />
      <div>
        <div style={{ fontSize: 8, letterSpacing: '0.25em', color: COLORS.amberDim }}>BANDWIDTH</div>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: overload ? COLORS.red : COLORS.cyan,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em',
        }}>
          {bw.used}<span style={{ fontSize: 9, color: COLORS.amberDim, marginLeft: 2 }}>/ {bw.max} Hz</span>
        </div>
      </div>
    </div>
  );
}