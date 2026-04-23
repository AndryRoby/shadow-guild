// AGENCY tab: recruit operatives, manage training, heal, assign specializations.

import { useMemo } from 'react';
import {
  Users, Coins, Zap, Shield, Brain, Heart,
  ShieldOff, Activity, AlertTriangle, Cpu,
  User, Eye, Star, MessageSquare, Flame,
} from 'lucide-react';

import { Panel, Tag, DataBar, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import { isUnlocked, getRunnerCost } from '../gameLogic.js';

// ─── Configuration ─────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  streetRunner: {
    label: 'STREET_RUNNER',
    level: 3,
    baseCost: 300,
    passive: '+2 CR/30s',
    icon: Zap,
    color: COLORS.amber,
  },
  dataThief: {
    label: 'DATA_THIEF',
    level: 5,
    baseCost: 800,
    passive: '+8 CR/2min',
    icon: Eye,
    color: COLORS.cyan,
  },
  infiltrator: {
    label: 'INFILTRATOR',
    level: 7,
    baseCost: 2500,
    passive: '+35 CR/15min',
    icon: Shield,
    color: COLORS.purple,
  },
  fixer: {
    label: 'FIXER',
    level: 9,
    baseCost: 8000,
    passive: '+150 CR/hr',
    icon: Brain,
    color: COLORS.gold,
  },
};

const TRAIT_CONFIG = {
  GREEDY:    { icon: Coins,         color: COLORS.gold,    desc: '+30% income' },
  PARANOID:  { icon: Eye,           color: COLORS.red,     desc: '+0.5 heat/cycle' },
  LOYAL:     { icon: Shield,        color: COLORS.green,   desc: 'no loyalty decay' },
  UNSTABLE:  { icon: Flame,         color: COLORS.orange,  desc: 'random outcomes' },
  CYNIC:     { icon: MessageSquare, color: COLORS.amberDim, desc: '+10% CR, -1 REP' },
  IDEALIST:  { icon: Star,          color: COLORS.purple,  desc: 'refuses corp ops' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function getHealCostLocal(agent) {
  if (!agent) return 0;
  const base = agent.role === 'streetRunner' ? 150 :
               agent.role === 'dataThief' ? 600 :
               agent.role === 'infiltrator' ? 2000 : 6000;
  return Math.max(50, Math.floor(base * ((agent.fatigue || 0) / 100)));
}

function getStatColor(value) {
  if (value >= 70) return COLORS.green;
  if (value >= 40) return COLORS.amber;
  return COLORS.red;
}

// ─── Main ──────────────────────────────────────────────────────────────────
export function AgencyTab({ state, dispatchWithSound }) {
  const agents = state.agents ?? [];

  const trainees = useMemo(
    () => agents.filter(a => a.status === 'TRAINING'),
    [agents]
  );
  const injured = useMemo(
    () => agents.filter(a => a.fatigue > 0 && a.status !== 'ON_MISSION' && a.status !== 'CAPTURED'),
    [agents]
  );

  const neuralDrain = trainees.length * 15;
  const totalHealCost = injured.reduce((sum, a) => sum + getHealCostLocal(a), 0);

  const byRole = useMemo(() => {
    const map = {};
    for (const role of Object.keys(ROLE_CONFIG)) {
      map[role] = agents.filter(a => a.role === role);
    }
    return map;
  }, [agents]);

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
            SYNDICATE_ROSTER
          </div>
          <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 3, letterSpacing: '0.1em' }}>
            {agents.length} operatives under command
          </div>
        </div>

        {/* Bulk actions */}
        {injured.length > 0 && (
          <BBtn
            variant="success"
            onClick={() => dispatchWithSound({ type: 'HEAL_ALL_INJURED' })}
            disabled={state.gold < totalHealCost}
          >
            <Heart size={11} style={{ display: 'inline', marginRight: 4 }} />
            HEAL ALL ({injured.length}) — {fmt(totalHealCost)} CR
          </BBtn>
        )}
      </div>

      {/* ─── NEURAL SIM BANNER ──────────────────────── */}
      {trainees.length > 0 && (
        <Panel
          accent={COLORS.purple}
          title="NEURAL_SIM_ACTIVE"
          dense
          right={<Tag color={COLORS.red}>-{neuralDrain} CR/s</Tag>}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 24, color: COLORS.purple, fontWeight: 800,
                letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
              }}>
                {trainees.length}
                <span style={{ fontSize: 11, color: COLORS.amberDim, letterSpacing: '0.2em', marginLeft: 8 }}>
                  IN_SIM
                </span>
              </div>
              <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 4, letterSpacing: '0.05em' }}>
                Training drains credits, accelerates XP gain.
              </div>
            </div>
            <div style={{
              fontFamily: 'inherit', fontSize: 9,
              color: COLORS.purple, opacity: 0.7,
              textAlign: 'right', lineHeight: 1.4,
            }}>
              <div>┌── SYNC ──┐</div>
              <div>│ {'◆'.repeat(Math.min(4, trainees.length))}{'◇'.repeat(Math.max(0, 4 - trainees.length))} │</div>
              <div>└──────────┘</div>
            </div>
          </div>
        </Panel>
      )}

      {/* ─── RECRUITMENT ────────────────────────────── */}
      <Panel accent={COLORS.amber} title="RECRUITMENT_TERMINAL" dense>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
            const count = byRole[role]?.length ?? 0;
            const locked = state.level < cfg.level;
            const maxed = count >= 5;
            const cost = getRunnerCost(cfg.baseCost, count);
            const canAfford = !locked && !maxed && state.gold >= cost;

            return (
              <RecruitCell
                key={role}
                role={role}
                config={cfg}
                count={count}
                cost={cost}
                locked={locked}
                maxed={maxed}
                canAfford={canAfford}
                playerLevel={state.level}
                onHire={() => dispatchWithSound({ type: 'HIRE_RUNNER', runnerType: role })}
              />
            );
          })}
        </div>
      </Panel>

      {/* ─── ROSTER ─────────────────────────────────── */}
      {agents.length === 0 ? (
        <EmptyRoster />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(byRole).map(([role, roleAgents]) => {
            if (roleAgents.length === 0) return null;
            const cfg = ROLE_CONFIG[role];
            return (
              <RoleSection
                key={role}
                role={role}
                config={cfg}
                agents={roleAgents}
                state={state}
                dispatchWithSound={dispatchWithSound}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Recruit cell ──────────────────────────────────────────────────────────
function RecruitCell({ role, config, count, cost, locked, maxed, canAfford, playerLevel, onHire }) {
  const { icon: Icon, color } = config;

  const borderColor = locked ? COLORS.amberLine
                    : maxed ? COLORS.green
                    : canAfford ? color
                    : COLORS.amberLine;

  return (
    <button
      onClick={canAfford && !locked && !maxed ? onHire : undefined}
      disabled={locked || maxed || !canAfford}
      style={{
        background: 'transparent',
        border: `1px ${locked ? 'dashed' : 'solid'} ${borderColor}`,
        padding: 10,
        fontFamily: 'inherit',
        textAlign: 'left',
        cursor: (canAfford && !locked && !maxed) ? 'pointer' : 'not-allowed',
        opacity: locked ? 0.5 : 1,
        transition: 'all 120ms',
      }}
      onMouseEnter={(e) => {
        if (canAfford && !locked && !maxed) {
          e.currentTarget.style.boxShadow = `0 0 16px ${color}66`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: icon + label + count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 800, color: locked ? COLORS.amberDim : color,
          letterSpacing: '0.1em',
        }}>
          <Icon size={12} />
          {config.label}
        </span>
        <Tag color={maxed ? COLORS.green : COLORS.amberDim}>
          {count}/5
        </Tag>
      </div>

      {/* Passive yield */}
      <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 4, letterSpacing: '0.05em' }}>
        {config.passive}
      </div>

      {/* Cost / state */}
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>
        {locked ? (
          <span style={{ color: COLORS.red }}>LVL {config.level} REQ</span>
        ) : maxed ? (
          <span style={{ color: COLORS.green }}>◆ MAX_CAPACITY</span>
        ) : (
          <span style={{ color: canAfford ? color : COLORS.red }}>
            {fmt(cost)} CR
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Role section ──────────────────────────────────────────────────────────
function RoleSection({ role, config, agents, state, dispatchWithSound }) {
  const { icon: Icon, color } = config;
  const active = agents.filter(a => a.status === 'ACTIVE').length;
  const training = agents.filter(a => a.status === 'TRAINING').length;
  const onMission = agents.filter(a => a.status === 'ON_MISSION').length;
  const down = agents.filter(a => ['EXHAUSTED','INJURED','CAPTURED'].includes(a.status)).length;

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 0', marginBottom: 8,
        borderBottom: `1px solid ${color}33`,
      }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.18em' }}>
          {config.label}
        </span>
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {active > 0 && <Tag color={COLORS.green}>{active} ACTIVE</Tag>}
          {training > 0 && <Tag color={COLORS.purple}>{training} SIM</Tag>}
          {onMission > 0 && <Tag color={COLORS.cyan}>{onMission} DEPLOY</Tag>}
          {down > 0 && <Tag color={COLORS.red}>{down} DOWN</Tag>}
        </div>
      </div>

      {/* Agent grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            gold={state.gold}
            dispatchWithSound={dispatchWithSound}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Agent card ────────────────────────────────────────────────────────────
function AgentCard({ agent, gold, dispatchWithSound }) {
  const cfg = ROLE_CONFIG[agent.role] ?? { color: COLORS.amber, icon: User };
  const isPending = agent.spec === 'PENDING';
  const isTraining = agent.status === 'TRAINING';
  const isActive = agent.status === 'ACTIVE';
  const isOnMission = agent.status === 'ON_MISSION';
  const isExhausted = agent.status === 'EXHAUSTED';
  const isInjured = agent.status === 'INJURED';
  const isCaptured = agent.status === 'CAPTURED';
  const isDown = isExhausted || isInjured || isCaptured;

  const healCost = getHealCostLocal(agent);
  const canHeal = gold >= healCost && agent.fatigue > 0 && !isOnMission && !isCaptured;

  const xpNeeded = (agent.level || 1) * 1000;
  const xpPct = ((agent.xp || 0) / xpNeeded) * 100;

  const loyalty = agent.loyalty ?? 50;
  const loyaltyColor = loyalty < 30 ? COLORS.red : loyalty < 60 ? COLORS.orange : COLORS.purple;
  const doubting = loyalty < 30;

  // Status label + color
  let statusLabel, statusColor;
  if (isCaptured)      { statusLabel = 'M.I.A.';       statusColor = COLORS.red; }
  else if (isInjured)   { statusLabel = 'INJURED';      statusColor = COLORS.red; }
  else if (isExhausted) { statusLabel = 'EXHAUSTED';    statusColor = COLORS.orange; }
  else if (isOnMission) { statusLabel = 'ON_MISSION';   statusColor = COLORS.cyan; }
  else if (isTraining)  { statusLabel = 'IN_SIM';       statusColor = COLORS.purple; }
  else                   { statusLabel = 'ACTIVE';       statusColor = COLORS.green; }

  // Avatar (2-letter)
  const avatar = agent.name?.split('_')[0]?.slice(0, 2).toUpperCase() ?? 'A?';

  const borderColor = isPending ? COLORS.amber
                    : isCaptured ? COLORS.red
                    : isTraining ? COLORS.purple
                    : isActive ? cfg.color
                    : COLORS.amberLine;

  return (
    <div style={{
      background: COLORS.surface,
      borderLeft: `4px solid ${borderColor}`,
      padding: 10,
      display: 'flex', flexDirection: 'column', gap: 8,
      animation: isPending ? 'borderPulseAmber 1.4s ease-in-out infinite' : 'none',
    }}>
      {/* ─── Top row: avatar + name + status ─── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          border: `1px solid ${cfg.color}`,
          color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, letterSpacing: '0.05em',
          position: 'relative',
          background: `repeating-linear-gradient(135deg, transparent 0 4px, ${cfg.color}11 4px 5px)`,
        }}>
          {avatar}
          {isTraining && (
            <span style={{
              position: 'absolute', top: -3, right: -3,
              width: 7, height: 7, background: COLORS.purple,
              boxShadow: `0 0 6px ${COLORS.purple}`,
            }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: COLORS.amber,
              letterSpacing: '0.03em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {agent.name}
            </span>
            {agent.spec && agent.spec !== 'PENDING' && (
              <span style={{
                fontSize: 8,
                color: agent.spec === 'SHADOW' ? COLORS.purple : COLORS.gold,
                letterSpacing: '0.15em', fontWeight: 800,
                flexShrink: 0,
              }}>
                ◆ {agent.spec}
              </span>
            )}
          </div>
          <div style={{
            fontSize: 9, color: statusColor, letterSpacing: '0.18em',
            marginTop: 2, fontWeight: 700,
          }} className={doubting || isCaptured ? 'blink' : ''}>
            {statusLabel} · LVL {agent.level || 1}
          </div>
        </div>
      </div>

      {/* ─── Traits ─── */}
      {agent.traits && agent.traits.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {agent.traits.map(t => {
            const traitCfg = TRAIT_CONFIG[t];
            if (!traitCfg) return null;
            const { icon: TIcon, color } = traitCfg;
            return (
              <span key={t} style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                border: `1px solid ${color}44`,
                padding: '1px 5px',
                fontSize: 8,
                color,
                letterSpacing: '0.1em',
                fontWeight: 700,
              }} title={traitCfg.desc}>
                <TIcon size={8} />
                {t}
              </span>
            );
          })}
        </div>
      )}

      {/* ─── Stats grid ─── */}
      {agent.stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          <StatCell label="STL" value={agent.stats.stealth ?? 50} />
          <StatCell label="SPD" value={agent.stats.speed ?? 50} />
          <StatCell label="INT" value={agent.stats.intel ?? 50} />
        </div>
      )}

      {/* ─── Fatigue bar ─── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.1em' }}>
          <span>FATIGUE</span>
          <span style={{ color: agent.fatigue > 70 ? COLORS.red : agent.fatigue > 40 ? COLORS.orange : COLORS.green, fontWeight: 700 }}>
            {agent.fatigue}%
          </span>
        </div>
        <div style={{ marginTop: 2 }}>
          <DataBar value={agent.fatigue} max={100} gradient="heat" height={3} />
        </div>
      </div>

      {/* ─── Loyalty bar ─── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, letterSpacing: '0.1em' }}>
          <span style={{ color: COLORS.amberDim }}>LOYALTY</span>
          <span style={{ color: loyaltyColor, fontWeight: 700 }}>
            {loyalty}%
            {doubting && <span className="blink" style={{ marginLeft: 6 }}>⚠ DOUBTING</span>}
          </span>
        </div>
        <div style={{ marginTop: 2 }}>
          <DataBar value={loyalty} max={100} color={loyaltyColor} height={2} />
        </div>
      </div>

      {/* ─── XP bar (only for assigned specs) ─── */}
      {!isPending && agent.spec && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.1em' }}>
            <span>XP</span>
            <span>{agent.xp || 0}/{xpNeeded}</span>
          </div>
          <div style={{ marginTop: 2 }}>
            <DataBar value={agent.xp || 0} max={xpNeeded} color={COLORS.purple} height={2} />
          </div>
        </div>
      )}

      {/* ─── Actions ─── */}
      <div style={{ marginTop: 2 }}>
        {isCaptured ? (
          <BBtn
            size="sm" variant="danger" full
            onClick={() => dispatchWithSound({ type: 'RANSOM_AGENT', agentId: agent.id })}
            disabled={gold < 15000}
          >
            RANSOM 15K
          </BBtn>
        ) : isPending ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 9, color: COLORS.amber, letterSpacing: '0.25em', textAlign: 'center' }} className="blink">
              :: SPEC_REQUIRED ::
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <BBtn
                size="sm" variant="purple"
                onClick={() => dispatchWithSound({ type: 'SET_RUNNER_SPEC', runnerType: agent.role, spec: 'SHADOW' })}
              >
                SHADOW -50% HEAT
              </BBtn>
              <BBtn
                size="sm" variant="gold"
                onClick={() => dispatchWithSound({ type: 'SET_RUNNER_SPEC', runnerType: agent.role, spec: 'GREEDY' })}
              >
                GREEDY +50% CR
              </BBtn>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4 }}>
            {canHeal && (
              <BBtn
                size="sm" variant="success"
                onClick={() => dispatchWithSound({ type: 'HEAL_AGENT', agentId: agent.id })}
                disabled={gold < healCost}
                full
              >
                HEAL {fmt(healCost)}
              </BBtn>
            )}
            {isActive && !agent.fatigue && (
              <BBtn
                size="sm" variant="purple"
                onClick={() => dispatchWithSound({ type: 'ASSIGN_TRAINING', agentId: agent.id })}
                full
              >
                ▶ TRAIN
              </BBtn>
            )}
            {isTraining && (
              <BBtn
                size="sm" variant="danger"
                onClick={() => dispatchWithSound({ type: 'STOP_TRAINING', agentId: agent.id })}
                full
              >
                ◼ STOP SIM
              </BBtn>
            )}
            {isOnMission && (
              <div style={{
                padding: '6px', width: '100%',
                textAlign: 'center',
                fontSize: 10, color: COLORS.cyan,
                border: `1px dashed ${COLORS.cyan}`,
                letterSpacing: '0.15em',
              }}>
                :: DEPLOYED ::
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat cell ─────────────────────────────────────────────────────────────
function StatCell({ label, value }) {
  const color = getStatColor(value);
  return (
    <div style={{
      border: `1px solid ${COLORS.amberFaint}`,
      padding: '4px 2px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.15em' }}>{label}</div>
      <div style={{ fontSize: 13, color, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
        {value}
      </div>
    </div>
  );
}

// ─── Empty roster ──────────────────────────────────────────────────────────
function EmptyRoster() {
  return (
    <div style={{
      flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      padding: 40,
      textAlign: 'center',
      color: COLORS.amberDim,
      gap: 14,
    }}>
      <pre style={{ fontSize: 10, opacity: 0.4, lineHeight: 1.2, fontFamily: 'inherit', margin: 0 }}>
{String.raw`
     o
    /|\
    / \
`}
      </pre>
      <div style={{ fontSize: 11, letterSpacing: '0.25em' }}>
        :: NO_OPERATIVES_ASSIGNED ::
      </div>
      <div style={{ fontSize: 9, opacity: 0.6, maxWidth: 300, lineHeight: 1.5 }}>
        The city won't liberate itself. Recruit your first operative above.
      </div>
    </div>
  );
}