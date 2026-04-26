// City map node detail side panel.
// Shown when player clicks a node in the city topology.
// Reuses existing DEPLOY_RUNNER / SECURE_NODE / SEVER_CONNECTION action API
// so it integrates with the rest of the game without backend changes.

import { useState, useEffect } from 'react';
import { Target, Shield, Zap, Lock, AlertTriangle, Clock, Cpu, Radio } from 'lucide-react';
import { COLORS, BBtn, Tag, DataBar, fmt } from '../design/primitives.jsx';
import { CITY_MAP, DISTRICTS } from '../../CITY_MAP.js';
import { getBandwidth, getActiveMissions, getMissionLimit } from '../selectors.js';

const RISK_PROFILES = {
  SAFE:       { successBonus: +15, rewardMult: 0.7, costMult: 1.5, timeMult: 1.3, label: 'SAFE',       color: COLORS.green, desc: '+15% success · 0.7x reward · 0.5x heat' },
  BALANCED:   { successBonus:   0, rewardMult: 1.0, costMult: 1.0, timeMult: 1.0, label: 'BALANCED',   color: COLORS.amber, desc: 'Standard infiltration' },
  AGGRESSIVE: { successBonus: -20, rewardMult: 1.8, costMult: 0.7, timeMult: 0.7, label: 'AGGRESSIVE', color: COLORS.red,   desc: '-20% success · 1.8x reward · 1.6x heat · 30% faster' },
};

const ZONE_SCALES = { Z4: 1, Z7: 2, Z2: 3, Z3: 4, Z6: 6, Z1: 8, Z5: 15 };

export function CityMapNodeDetail({ nodeId, state, dispatchWithSound, onClose }) {
  const [risk, setRisk] = useState('BALANCED');

  // Force 1Hz tick for live mission timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const nodeData = CITY_MAP[nodeId];
  if (!nodeData) return null;

  const district = DISTRICTS[nodeData.districtId];
  const owned = state.capturedHexes ?? [];
  const isOwned = owned.includes(nodeId);

  // Find active mission for this node — use raw activeMissions (has endTime, hexId, agentId)
  const rawMission = (state.activeMissions ?? []).find(m => m.hexId === nodeId);
  const inProgress = !!rawMission;

  const adjacent = (nodeData.connections ?? []).some(c => owned.includes(c));
  const canHack = !isOwned && !inProgress && adjacent;

  const stability = (state.nodeStability ?? {})[nodeId] ?? (isOwned ? 100 : 0);
  const activeAgents = (state.agents ?? []).filter(a => a.status === 'ACTIVE');
  const profile = RISK_PROFILES[risk];
  const zoneMult = ZONE_SCALES[nodeData.districtId] ?? 1;
  const opCost = Math.floor(2000 * zoneMult * profile.costMult);
  const canAfford = state.gold >= opCost;

  // Estimated time — match DEPLOY_RUNNER reducer formula EXACTLY (used to mismatch reality):
  //   finalSeconds = (baseTime * zoneMult * speedMod * fatiguePenalty + heat*0.7) * timeMult
  // We can't predict per-agent (user hasn't picked yet) — show range or use fastest agent.
  const baseTime = nodeData.captureTime ?? 45;
  const speedMods = { streetRunner: 1.5, dataThief: 1.0, infiltrator: 0.5, fixer: 0.8, shadowBroker: 0.3 };
  const fastestSpeed = activeAgents.length > 0
    ? Math.min(...activeAgents.map(a => speedMods[a.role] ?? 1))
    : 1;
  const avgFatigue = activeAgents.length > 0
    ? activeAgents.reduce((s, a) => s + (a.fatigue ?? 0), 0) / activeAgents.length
    : 0;
  const fatiguePenalty = 1 + (avgFatigue * 0.005);
  const heat = state.heat ?? 0;
  const estTime = Math.round(
    (baseTime * zoneMult * fastestSpeed * fatiguePenalty + heat * 0.7) * profile.timeMult
  );

  // Bandwidth gating
  const bandwidth = getBandwidth(state);
  const missionLimit = getMissionLimit(state);
  const bandwidthFull = bandwidth.used >= bandwidth.max;
  const missionsFull  = missionLimit.isFull;
  const noAgents = activeAgents.length === 0;

  const blockers = [];
  if (missionsFull)  blockers.push({ icon: Radio, text: `MISSION LIMIT (${missionLimit.used}/${missionLimit.max}) — recall first`, color: COLORS.red });
  if (bandwidthFull) blockers.push({ icon: Cpu, text: `BANDWIDTH FULL (${bandwidth.used}/${bandwidth.max} Hz) — sever a node`, color: COLORS.red });
  if (noAgents)      blockers.push({ icon: AlertTriangle, text: 'NO ACTIVE AGENTS — recruit in AGENCY', color: COLORS.orange });
  if (!canAfford)    blockers.push({ icon: AlertTriangle, text: `NEED ${fmt(opCost)} CR (have ${fmt(state.gold)})`, color: COLORS.red });
  const canDeploy = canHack && !bandwidthFull && !missionsFull && !noAgents && canAfford;

  const headerColor = isOwned ? (stability < 30 ? COLORS.red : stability < 60 ? COLORS.orange : COLORS.amber)
                    : inProgress ? COLORS.cyan
                    : canHack ? district?.color
                    : COLORS.amberDim;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 14, right: 14,
        width: 320,
        maxHeight: 'calc(100% - 28px)',
        overflowY: 'auto',
        background: `${COLORS.surface}f2`,
        border: `1px solid ${headerColor}`,
        boxShadow: `0 0 24px ${headerColor}33, inset 0 0 30px ${headerColor}08`,
        backdropFilter: 'blur(6px)',
        animation: 'snapIn 200ms ease-out',
        padding: '16px 16px 14px',
        zIndex: 2,
      }}
    >
      {/* Top bar — district + close */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 8, letterSpacing: '0.3em', color: `${headerColor}cc`,
        marginBottom: 6,
      }}>
        <span>:: {district?.name ?? nodeData.districtId}</span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.amberLine}`,
            color: COLORS.amberDim,
            fontSize: 9, padding: '2px 6px',
            fontFamily: 'inherit', cursor: 'pointer',
            letterSpacing: '0.2em',
          }}
        >
          ✕
        </button>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 16, fontWeight: 800,
        color: headerColor, letterSpacing: '0.04em',
        textShadow: `0 0 8px ${headerColor}55`,
        marginBottom: 4,
      }}>
        {nodeData.label}
      </div>
      <div style={{
        fontSize: 9, color: COLORS.amberDim,
        letterSpacing: '0.1em', marginBottom: 10,
      }}>
        {nodeData.role}
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <Pill color={headerColor} label={
          isOwned ? 'OWNED' : inProgress ? 'INFILTRATING' : canHack ? 'REACHABLE' : 'DISTANT'
        } />
        <Pill color={COLORS.amber} label={`LOOT x${nodeData.lootMultiplier?.toFixed(1) ?? '1.0'}`} />
        {nodeData.faction && nodeData.faction !== 'PLAYER' && nodeData.faction !== 'neutral' && (
          <Pill color={COLORS.red} label={nodeData.faction} />
        )}
      </div>

      {/* Owned: stability + actions */}
      {isOwned && (() => {
        const reclaim = (state.reclaiming ?? {})[nodeId];
        const isUnderAttack = !!reclaim;
        const stage = reclaim?.stage;  // SCAN | BREACH | LAST_STAND
        const isAnchor = nodeData.type === 'warpgate';
        const ownedCount = (state.capturedHexes ?? []).length;
        const maintainCost = 15;  // stamina
        const secureCost   = 25;  // rep
        const canMaintain  = !isAnchor && (state.stamina ?? 0) >= maintainCost && stability < 95;
        const canSecure    = isUnderAttack && (state.reputation ?? 0) >= secureCost && stage !== 'LAST_STAND';
        const canSever     = !isAnchor && ownedCount > 1;
        const stabColor    = stability < 30 ? COLORS.red : stability < 60 ? COLORS.orange : COLORS.green;

        // Yield calc: rough estimate matching tick payouts
        const yieldCr = Math.round((nodeData.lootMultiplier ?? 1) * 5);

        return (
          <>
            {/* Anchor — special status */}
            {isAnchor && (
              <Section label="ANCHOR_NODE">
                <div style={{
                  padding: 8, border: `1px solid ${COLORS.amber}`, background: `${COLORS.amber}11`,
                  fontSize: 10, color: COLORS.amber, letterSpacing: '0.05em', lineHeight: 1.5,
                }}>
                  <div style={{ fontWeight: 800, marginBottom: 3 }}>◆ PERMANENT ANCHOR</div>
                  <div style={{ color: COLORS.amberDim, fontStyle: 'italic' }}>
                    Cannot be severed or attacked. Your foothold in the network.
                  </div>
                </div>
              </Section>
            )}

            {/* Stability bar (skip for anchor) */}
            {!isAnchor && (
              <Section label="STABILITY">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: COLORS.amberDim, letterSpacing: '0.15em' }}>NODE_HEALTH</span>
                  <span style={{ color: stabColor, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                    {Math.round(stability)}%
                  </span>
                </div>
                <DataBar value={stability} max={100} color={stabColor} height={3} />
                <div style={{ fontSize: 9, color: COLORS.green, marginTop: 5, letterSpacing: '0.1em', fontWeight: 700 }}>
                  +{yieldCr} CR/min · passive yield
                </div>
              </Section>
            )}

            {/* RECLAIM stages — port from old NetworkTab */}
            {isUnderAttack && (
              <Section label={
                stage === 'LAST_STAND' ? 'EMERGENCY_OVERRIDE'
                : stage === 'BREACH'    ? 'BREACH_IMMINENT'
                : 'TRACE_DETECTED'
              }>
                <div style={{
                  padding: 8,
                  border: `1px solid ${COLORS.red}`,
                  background: `${COLORS.red}15`,
                  fontSize: 10,
                  animation: 'pulseHeatNew 1.2s ease-in-out infinite',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ color: COLORS.red, fontWeight: 800, letterSpacing: '0.15em' }} className="blink">
                      {stage === 'LAST_STAND' ? '⚠ NODE LOSS IMMINENT'
                       : stage === 'BREACH'    ? '⚠ FIREWALL BREACHED'
                       : '◯ INTRUSION DETECTED'}
                    </span>
                    <span style={{ color: COLORS.red, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                      {stage === 'LAST_STAND' ? `T-${reclaim.timer}s` : `${Math.round(reclaim.progress)}%`}
                    </span>
                  </div>
                  {stage !== 'LAST_STAND' && (
                    <DataBar value={reclaim.progress} max={100} color={COLORS.red} glow height={2} />
                  )}
                  <div style={{ fontSize: 9, color: COLORS.amberDim, fontStyle: 'italic', marginTop: 5, lineHeight: 1.4 }}>
                    {stage === 'LAST_STAND' ? 'Use EMERGENCY OVERRIDE in main view immediately.'
                     : stage === 'BREACH'    ? 'SECURE now or node will hit critical override stage.'
                     : 'Push back with SECURE or maintain stability.'}
                  </div>
                </div>
              </Section>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {!isAnchor && (
                <BBtn
                  size="sm" full
                  disabled={!canMaintain}
                  onClick={() => dispatchWithSound({ type: 'MAINTAIN_NODE', hexId: nodeId })}
                  title={stability >= 95 ? 'Stability already optimal' : `Costs ${maintainCost} stamina`}
                >
                  <Shield size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  MAINTAIN · {maintainCost} STA
                </BBtn>
              )}
              {isUnderAttack && stage !== 'LAST_STAND' && (
                <BBtn
                  size="sm" full variant="cyan"
                  disabled={!canSecure}
                  onClick={() => dispatchWithSound({ type: 'SECURE_NODE', hexId: nodeId })}
                >
                  ▲ SECURE · {secureCost} REP
                </BBtn>
              )}
              {!isAnchor && (
                <BBtn
                  size="sm" variant="danger" full
                  disabled={!canSever}
                  onClick={() => dispatchWithSound({ type: 'SEVER_CONNECTION', hexId: nodeId })}
                  title={!canSever ? 'Cannot sever last connection' : 'Disconnect this node'}
                >
                  SEVER CONNECTION
                </BBtn>
              )}
            </div>
          </>
        );
      })()}

      {/* In-progress: timer */}
      {rawMission && (() => {
        const m = rawMission;
        const now = Date.now();
        const totalSec     = Math.max(1, Math.ceil((m.endTime - m.startTime) / 1000));
        const remainingSec = Math.max(0, Math.ceil((m.endTime - now) / 1000));
        const elapsedSec   = totalSec - remainingSec;
        const agent = (state.agents ?? []).find(a => a.id === m.agentId);
        const agentName = agent ? (agent.name ?? agent.id) : (m.agentId ?? '?');
        return (
          <Section label="ACTIVE_INFILTRATION">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: COLORS.cyan, letterSpacing: '0.1em', fontWeight: 700 }}>
                <Clock size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                T-{remainingSec}s / {totalSec}s
              </span>
              <span style={{ color: COLORS.amberDim, letterSpacing: '0.05em' }}>
                {agentName} · {m.successChance ?? 50}%
              </span>
            </div>
            <DataBar value={elapsedSec} max={totalSec} color={COLORS.cyan} height={3} glow />
          </Section>
        );
      })()}

      {/* Reachable & not owned: deploy UI */}
      {canHack && (
        <>
          <Section label="EFFECT_FORECAST">
            {(nodeData.effectHooks ?? []).filter(h => h.desc).map((h, i) => (
              <div key={i} style={{ fontSize: 10, color: COLORS.amber, marginBottom: 2, lineHeight: 1.4 }}>
                ◆ {h.desc}
              </div>
            ))}
          </Section>

          <Section label="RISK_PROFILE">
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {Object.keys(RISK_PROFILES).map(k => (
                <button
                  key={k}
                  onClick={() => setRisk(k)}
                  style={{
                    flex: 1,
                    background: risk === k ? RISK_PROFILES[k].color : 'transparent',
                    color: risk === k ? '#000' : RISK_PROFILES[k].color,
                    border: `1px solid ${RISK_PROFILES[k].color}`,
                    padding: '5px 0',
                    fontSize: 9, letterSpacing: '0.15em',
                    fontFamily: 'inherit', fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {RISK_PROFILES[k].label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: COLORS.amberDim, fontStyle: 'italic', lineHeight: 1.4, marginBottom: 8 }}>
              {profile.desc}
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
              fontSize: 10, marginBottom: 8,
            }}>
              <Stat label="COST" value={`${fmt(opCost)} CR`} color={canAfford ? COLORS.amber : COLORS.red} />
              <Stat label="TIME" value={`~${estTime}s`} color={COLORS.cyan} />
            </div>
          </Section>

          {/* Blockers — show before agent list if can't deploy */}
          {blockers.length > 0 && (
            <Section label="BLOCKERS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {blockers.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 8px',
                      border: `1px dashed ${b.color}66`,
                      background: `${b.color}0a`,
                      fontSize: 10, color: b.color,
                      letterSpacing: '0.05em',
                    }}>
                      <Icon size={11} />
                      <span>{b.text}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section label="DEPLOY_AGENT">
            {noAgents ? (
              <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: '0.1em', padding: 8, border: `1px dashed ${COLORS.red}44`, textAlign: 'center' }}>
                No active operatives. Recruit in AGENCY.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activeAgents.map(a => {
                  const agentSpeed = speedMods[a.role] ?? 1;
                  const agentFatPenalty = 1 + ((a.fatigue ?? 0) * 0.005);
                  const agentTime = Math.round(
                    (baseTime * zoneMult * agentSpeed * agentFatPenalty + heat * 0.7) * profile.timeMult
                  );
                  const fatigueColor = (a.fatigue ?? 0) > 70 ? COLORS.red
                                     : (a.fatigue ?? 0) > 40 ? COLORS.orange : COLORS.green;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        dispatchWithSound({ type: 'DEPLOY_RUNNER', hexId: nodeId, agentId: a.id, risk });
                        onClose();
                      }}
                      disabled={!canDeploy}
                      style={{
                        background: canDeploy ? COLORS.surface : 'transparent',
                        border: `1px solid ${canDeploy ? COLORS.amberLine : COLORS.amberFaint}`,
                        color: canDeploy ? COLORS.amber : COLORS.amberDim,
                        padding: '6px 10px',
                        textAlign: 'left',
                        cursor: canDeploy ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit',
                        fontSize: 10,
                        letterSpacing: '0.04em',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontWeight: 700 }}>{a.name ?? a.id}</span>
                        <span style={{ fontSize: 9, color: COLORS.amberDim }}>~{agentTime}s</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.1em' }}>{a.role}</span>
                        <span style={{ fontSize: 8, color: fatigueColor, letterSpacing: '0.05em', fontWeight: 700 }}>
                          FTG {Math.round(a.fatigue ?? 0)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Distant: lock message */}
      {!isOwned && !inProgress && !canHack && (
        <div style={{
          padding: 10,
          border: `1px dashed ${COLORS.amberLine}`,
          fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.1em',
          textAlign: 'center', marginTop: 8,
        }}>
          <Lock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          NOT_ADJACENT — Capture connecting node first.
        </div>
      )}

      {/* Flavor at bottom */}
      {nodeData.flavor && (
        <div style={{
          marginTop: 14, paddingTop: 10,
          borderTop: `1px solid ${COLORS.amberLine}`,
          fontSize: 10, color: COLORS.amberDim,
          fontStyle: 'italic', lineHeight: 1.5, letterSpacing: '0.02em',
        }}>
          › {nodeData.flavor}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 8, letterSpacing: '0.3em', color: COLORS.amberDim, marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <span style={{
      fontSize: 8, letterSpacing: '0.18em',
      color, border: `1px solid ${color}66`,
      padding: '3px 6px', fontWeight: 700,
    }}>
      {label}
    </span>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{
      padding: '4px 6px',
      background: COLORS.bg,
      border: `1px solid ${COLORS.amberLine}`,
      fontVariantNumeric: 'tabular-nums',
    }}>
      <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.15em' }}>{label}</div>
      <div style={{ fontSize: 11, color: color || COLORS.amber, fontWeight: 700 }}>{value}</div>
    </div>
  );
}