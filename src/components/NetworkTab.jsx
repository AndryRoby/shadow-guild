// NETWORK tab: node management, missions, infiltrations.

import { useState, useMemo, useEffect } from 'react';
import {
  Activity, Shield, Zap, Cpu, Coins,
  AlertTriangle, Lock, Target, Link, Power,
  TrendingUp, Flame, Eye, Radio,
} from 'lucide-react';

import { Panel, Tag, DataBar, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import {
  getNodesByDistrict,
  getActiveMissions,
  getBandwidth,
} from '../selectors.js';
import { DISTRICTS as AETHERIA_DISTRICTS } from '../../CITY_MAP.js';

// District order for display
const DISTRICT_ORDER = ['Z4', 'Z7', 'Z2', 'Z3', 'Z6', 'Z1', 'Z5'];

const ROLE_LABELS = {
  streetRunner: 'ST_RUN',
  dataThief: 'D_THIEF',
  infiltrator: 'INFILTR',
  fixer: 'FIXER',
  shadowBroker: 'S_BROKER',
};

// ─── Main ──────────────────────────────────────────────────────────────────
export function NetworkTab({ state, dispatchWithSound }) {
  const nodesByDistrict = getNodesByDistrict(state);
  const missions = getActiveMissions(state);
  const bandwidth = getBandwidth(state);

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

  // Counts for header
  const ownedCount = Object.values(nodesByDistrict).reduce((n, d) => n + d.owned.length, 0);
  const availableCount = Object.values(nodesByDistrict).reduce((n, d) => n + d.available.filter(a => a.canHack).length, 0);

  // No operatives warning
  const noAgents = activeAgents.length === 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: 14,
      height: '100%',
      overflowY: 'auto',
      paddingRight: 4,
    }}>
      {/* ─── HEADER ────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 10, borderBottom: `1px solid ${COLORS.amberLine}`,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.amber, letterSpacing: '0.15em' }}>
            CITY_NETWORK
          </div>
          <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 3, letterSpacing: '0.1em' }}>
            {ownedCount} nodes secured · {availableCount} hackable
          </div>
        </div>

        {/* Bandwidth status */}
        <BandwidthDisplay bw={bandwidth} />
      </div>

      {/* ─── NO OPERATIVES WARNING ─────────────────── */}
      {noAgents && (
        <div style={{
          padding: 12,
          border: `1px dashed ${COLORS.orange}`,
          background: `${COLORS.orange}11`,
          textAlign: 'center',
        }}>
          <AlertTriangle size={14} color={COLORS.orange} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          <span style={{ fontSize: 11, color: COLORS.orange, letterSpacing: '0.2em', fontWeight: 700 }}>
            NO_ACTIVE_OPERATIVES
          </span>
          <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 4, letterSpacing: '0.05em' }}>
            Recruit runners in AGENCY to hack nodes.
          </div>
        </div>
      )}

      {/* ─── ACTIVE MISSIONS ───────────────────────── */}
      {missions.length > 0 && (
        <Panel
            accent={COLORS.cyan}
            title="ACTIVE_INFILTRATIONS"
            dense
            right={
            <Tag color={missions.length >= bandwidth.max ? COLORS.red : COLORS.cyan}>
                {missions.length} / {bandwidth.max} CHANNELS
            </Tag>
            }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {missions.map(m => <MissionRow key={m.id} mission={m} />)}
          </div>
        </Panel>
      )}

      {/* ─── DISTRICTS ─────────────────────────────── */}
      {DISTRICT_ORDER.map(districtId => {
        const district = AETHERIA_DISTRICTS[districtId];
        const bucket = nodesByDistrict[districtId];
        if (!district || !bucket) return null;
        if (bucket.owned.length === 0 && bucket.available.length === 0) return null;

        return (
          <DistrictSection
            key={districtId}
            districtId={districtId}
            district={district}
            owned={bucket.owned}
            available={bucket.available}
            state={state}
            activeAgents={activeAgents}
            bandwidth={bandwidth}
            dispatchWithSound={dispatchWithSound}
          />
        );
      })}
    </div>
  );
}

// ─── Bandwidth display ─────────────────────────────────────────────────────
function BandwidthDisplay({ bw }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontSize: 20, fontWeight: 800,
          color: bw.isOverloaded ? COLORS.red : COLORS.cyan,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {bw.used}<span style={{ color: COLORS.amberDim, fontSize: 14 }}>/{bw.max}</span>
        </span>
        <span style={{ fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.15em' }}>
          Hz BANDWIDTH
        </span>
      </div>
      <div style={{ width: 140, marginTop: 4, marginLeft: 'auto' }}>
        <DataBar
          value={bw.used}
          max={bw.max}
          color={bw.isOverloaded ? COLORS.red : COLORS.cyan}
          glow={bw.isOverloaded}
          height={3}
        />
      </div>
      {bw.isOverloaded && (
        <div style={{
          fontSize: 9, color: COLORS.red,
          letterSpacing: '0.15em', marginTop: 4, fontWeight: 700,
        }} className="blink">
          [!] OVERLOAD +{bw.overload}
        </div>
      )}
    </div>
  );
}

// ─── Mission row ───────────────────────────────────────────────────────────
function MissionRow({ mission }) {
  const secsLeft = Math.max(0, Math.round(mission.timer / 1000));
  const pct = mission.duration > 0
    ? 100 - Math.min(100, (mission.timer / mission.duration) * 100)
    : 100;

  const roleLabel = ROLE_LABELS[mission.runnerType] ?? mission.runnerType?.toUpperCase();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      alignItems: 'center', gap: 12,
      padding: '8px 10px',
      background: COLORS.bg,
      borderLeft: `2px solid ${COLORS.cyan}`,
    }}>
      <div style={{
        width: 32, height: 32,
        border: `1px solid ${COLORS.cyan}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: COLORS.cyan, fontWeight: 800,
      }}>
        {mission.agentAvatar}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 11, color: COLORS.amber, fontWeight: 700,
          letterSpacing: '0.05em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {mission.agent} <span style={{ color: COLORS.amberDim }}>→</span> {mission.target}
        </div>
        <div style={{ marginTop: 4, fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.1em' }}>
          [{roleLabel}] · {mission.chance}% success
        </div>
        <div style={{ marginTop: 3 }}>
          <DataBar value={pct} max={100} color={COLORS.cyan} height={2} />
        </div>
      </div>
      <div style={{
        textAlign: 'right',
        fontSize: 12, color: secsLeft > 0 ? COLORS.cyan : COLORS.green,
        fontWeight: 800, fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.05em',
      }}>
        {secsLeft > 0 ? `T-${secsLeft}s` : 'EXTRACT'}
      </div>
    </div>
  );
}

// ─── District section ──────────────────────────────────────────────────────
function DistrictSection({ districtId, district, owned, available, state, activeAgents, bandwidth, dispatchWithSound }) {
  const color = district.color;
  const capturedCount = owned.length;
  const totalCount = owned.length + available.length;

  return (
    <div>
      {/* District header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px',
        background: `${color}11`,
        borderLeft: `4px solid ${color}`,
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 800, color,
          letterSpacing: '0.2em',
        }}>
          :: {district.name}
        </span>
        <span style={{
          fontSize: 9, color: COLORS.amberDim,
          letterSpacing: '0.08em', fontStyle: 'italic', opacity: 0.7,
        }}>
          {district.desc}
        </span>
        <span style={{ flex: 1 }} />
        <Tag color={color}>
          {capturedCount}/{totalCount}
        </Tag>
      </div>

      {/* Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {owned.map(node => (
          <OwnedNodeCard
            key={node.id}
            node={node}
            state={state}
            dispatchWithSound={dispatchWithSound}
          />
        ))}
        {available.map(node => (
          <AvailableNodeCard
            key={node.id}
            node={node}
            state={state}
            activeAgents={activeAgents}
            bandwidth={bandwidth}
            dispatchWithSound={dispatchWithSound}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Owned node card ───────────────────────────────────────────────────────
function OwnedNodeCard({ node, state, dispatchWithSound }) {
  const stabColor = node.stability < 30 ? COLORS.red
                  : node.stability < 60 ? COLORS.orange
                  : node.stability < 90 ? COLORS.amber
                  : COLORS.green;

  const canMaintain = state.stamina >= 15 && node.stability < 95 && !node.isAnchor;
  const canDisconnect = !node.isAnchor && (state.capturedHexes?.length ?? 0) > 1;
  const canSecure = node.reclaiming && state.reputation >= 25;

  return (
    <div style={{
      background: COLORS.surface,
      borderLeft: `3px solid ${node.reclaiming ? COLORS.red : node.districtColor}`,
      padding: 10,
      animation: node.reclaiming ? 'pulseHeatNew 1.2s ease-in-out infinite' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 12, fontWeight: 800, color: node.districtColor,
            letterSpacing: '0.05em',
          }}>
            {node.icon && <span style={{ marginRight: 4 }}>{node.icon}</span>}
            {node.name}
            {node.isAnchor && (
              <span style={{ fontSize: 8, color: COLORS.amberDim, marginLeft: 8, letterSpacing: '0.15em' }}>
                ◆ ANCHOR
              </span>
            )}
          </div>
          <div style={{ fontSize: 9, color: COLORS.green, letterSpacing: '0.15em', marginTop: 2, fontWeight: 700 }}>
            SECURED · +{node.yieldCr}/min
          </div>
        </div>
      </div>

      {/* Stability */}
      {!node.isAnchor && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, letterSpacing: '0.1em' }}>
            <span style={{ color: COLORS.amberDim }}>STABILITY</span>
            <span style={{ color: stabColor, fontWeight: 700 }}>{node.stability}%</span>
          </div>
          <div style={{ marginTop: 2 }}>
            <DataBar
              value={node.stability}
              max={100}
              color={stabColor}
              glow={node.stability < 30}
              height={3}
            />
          </div>
        </div>
      )}

      {/* Reclaim warning */}
      {node.reclaiming && (
        <div style={{
          marginTop: 8,
          border: `1px solid ${COLORS.red}`,
          background: `${COLORS.red}11`,
          padding: '6px 8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 9, color: COLORS.red, letterSpacing: '0.2em', fontWeight: 800 }} className="blink">
              ⚠ {node.reclaimStage === 'BREACH' ? 'BREACH_IMMINENT' : 'TRACE_DETECTED'}
            </span>
            <span style={{ fontSize: 9, color: COLORS.red, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(node.reclaimProgress)}%
            </span>
          </div>
          <div style={{ marginTop: 4 }}>
            <DataBar value={node.reclaimProgress} max={100} color={COLORS.red} glow height={2} />
          </div>
          <BBtn
            size="sm"
            variant="danger"
            full
            disabled={!canSecure}
            onClick={() => dispatchWithSound({ type: 'SECURE_NODE', hexId: node.id })}
            style={{ marginTop: 6 }}
          >
            SECURE (25 REP)
          </BBtn>
        </div>
      )}

      {/* Actions */}
      {!node.reclaiming && !node.isAnchor && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <BBtn
            size="sm"
            variant="success"
            onClick={() => dispatchWithSound({ type: 'MAINTAIN_NODE', hexId: node.id })}
            disabled={!canMaintain}
            full
          >
            MAINTAIN (15 STA)
          </BBtn>
          <BBtn
            size="sm"
            variant="danger"
            onClick={() => dispatchWithSound({ type: 'SEVER_CONNECTION', hexId: node.id })}
            disabled={!canDisconnect}
            full
          >
            DISCONNECT
          </BBtn>
        </div>
      )}
    </div>
  );
}

// ─── Available (hackable or locked) node card ─────────────────────────────
function AvailableNodeCard({ node, state, activeAgents, bandwidth, dispatchWithSound }) {
  const [showDeploy, setShowDeploy] = useState(false);

  const isBlocked = bandwidth.used >= bandwidth.max;
  const canDeploy = node.canHack && !isBlocked && activeAgents.length > 0;

  const borderColor = node.inProgress ? COLORS.cyan
                    : node.canHack ? COLORS.amber
                    : COLORS.amberLine;

  return (
    <div style={{
      background: COLORS.surface,
      borderLeft: `3px solid ${borderColor}`,
      padding: 10,
      opacity: node.canHack || node.inProgress ? 1 : 0.5,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: node.canHack ? node.districtColor : COLORS.amberDim,
            letterSpacing: '0.05em',
          }}>
            {node.icon && <span style={{ marginRight: 4 }}>{node.icon}</span>}
            {node.name}
            {node.faction && node.faction !== 'neutral' && (
              <span style={{ fontSize: 8, color: COLORS.red, marginLeft: 8, letterSpacing: '0.15em' }}>
                [{node.faction}]
              </span>
            )}
          </div>
          <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 2, letterSpacing: '0.08em' }}>
            {node.canHack ? 'READY_TO_HACK' : node.inProgress ? 'INFILTRATING...' : 'NOT_ADJACENT'}
            <span style={{ marginLeft: 8 }}>· T~{node.captureTime}s</span>
            <span style={{ marginLeft: 8 }}>· LOOT x{node.lootMult.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Effect hooks preview */}
      {node.effectHooks.length > 0 && node.canHack && (
        <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 6, fontStyle: 'italic', opacity: 0.8 }}>
          › {node.effectHooks.map(h => h.desc).filter(Boolean).join(' · ')}
        </div>
      )}

      {/* Deploy section */}
      {node.canHack && (
        <div style={{ marginTop: 8 }}>
          {!showDeploy ? (
            <BBtn
              size="sm"
              variant={canDeploy ? 'default' : 'ghost'}
              full
              disabled={!canDeploy}
              onClick={() => setShowDeploy(true)}
            >
              <Target size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              {isBlocked ? '[BANDWIDTH_FULL]'
                : activeAgents.length === 0 ? '[NO_AGENTS]'
                : 'DEPLOY AGENT'}
            </BBtn>
          ) : (
            <DeployMenu
              node={node}
              activeAgents={activeAgents}
              state={state}
              onCancel={() => setShowDeploy(false)}
              onDeploy={(agentId) => {
                dispatchWithSound({ type: 'DEPLOY_RUNNER', hexId: node.id, agentId });
                setShowDeploy(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Deploy menu ───────────────────────────────────────────────────────────
function DeployMenu({ node, activeAgents, state, onCancel, onDeploy }) {
  const zoneScales = { Z4: 1, Z7: 2, Z2: 3, Z3: 4, Z6: 6, Z1: 8, Z5: 15 };
  const zoneMult = zoneScales[node.districtId] ?? 1;
  const opCost = Math.floor(2000 * zoneMult);
  const canAfford = state.gold >= opCost;

  // Sort agents by role preference for this node, then by fatigue (lowest first)
  const sorted = [...activeAgents].sort((a, b) => {
    return (a.fatigue ?? 0) - (b.fatigue ?? 0);
  });

  return (
    <div style={{
      border: `1px solid ${COLORS.cyan}`,
      background: `${COLORS.cyan}0a`,
      padding: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: COLORS.cyan, letterSpacing: '0.2em', fontWeight: 700 }}>
          :: SELECT_OPERATIVE
        </span>
        <span style={{ fontSize: 10, color: canAfford ? COLORS.amber : COLORS.red, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          COST: {fmt(opCost)} CR
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
        {sorted.map(agent => {
          const role = ROLE_LABELS[agent.role] ?? agent.role;
          const fatColor = agent.fatigue > 70 ? COLORS.red : agent.fatigue > 40 ? COLORS.orange : COLORS.green;
          return (
            <button
              key={agent.id}
              disabled={!canAfford}
              onClick={() => onDeploy(agent.id)}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.amberLine}`,
                color: COLORS.amber,
                padding: '6px 8px',
                fontFamily: 'inherit',
                fontSize: 10,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                opacity: canAfford ? 1 : 0.5,
                textAlign: 'left',
                letterSpacing: '0.05em',
                transition: 'all 120ms',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                if (canAfford) e.currentTarget.style.background = `${COLORS.cyan}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>
                <strong>{agent.name}</strong>
                <span style={{ color: COLORS.amberDim, marginLeft: 6 }}>[{role}]</span>
              </span>
              <span style={{ color: fatColor, fontSize: 9, letterSpacing: '0.1em' }}>
                FTG {agent.fatigue}%
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        <BBtn size="sm" variant="ghost" full onClick={onCancel}>
          CANCEL
        </BBtn>
      </div>
    </div>
  );
}