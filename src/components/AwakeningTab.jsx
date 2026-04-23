// AWAKENING tab: prestige mechanic + permanent perk tree.

import { useMemo } from 'react';
import {
  Star, Zap, Shield, Cpu, Eye,
  Coins, TrendingUp, Lock, Activity,
} from 'lucide-react';

import { Panel, Tag, DataBar, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import { PRESTIGE_PERK_DEFS } from '../gameLogic.js';

// ─── Branch configuration ──────────────────────────────────────────────────
const BRANCHES = {
  GHOST: {
    label: 'GHOST',
    desc: 'Stealth and efficiency — spend less, succeed more.',
    color: COLORS.cyan,
    icon: Eye,
  },
  OVERLORD: {
    label: 'OVERLORD',
    desc: 'Scale operations — income and agent bonuses.',
    color: COLORS.gold,
    icon: Star,
  },
  ARCHITECT: {
    label: 'ARCHITECT',
    desc: 'Information warfare — intel, detection, control.',
    color: COLORS.purple,
    icon: Cpu,
  },
};

// ─── Flavor messages based on prestige count ──────────────────────────────
function getFlavorText(prestige) {
  if (prestige === 0) return '"The first time is always the hardest. You will forget parts of yourself."';
  if (prestige === 1) return '"You are beginning to see the pattern. The city remembers less than you do."';
  if (prestige < 5)   return '"Each cycle loosens another thread. Zero grows quieter."';
  if (prestige < 10)  return '"You no longer age. The city no longer surprises you."';
  if (prestige < 20)  return '"There are things Zero refuses to tell you now. Maybe it never knew."';
  return '"You have been doing this longer than anyone alive. Why are you still here?"';
}

// ─── Main ──────────────────────────────────────────────────────────────────
export function AwakeningTab({ state, dispatchWithSound }) {
  const prestige = state.prestige ?? 0;
  const prestigePoints = state.prestigePoints ?? 0;
  const prestigeMult = state.prestigeMultiplier ?? 1;
  const runGold = state.runGoldEarned ?? 0;

  // Requirements
  const levelReq = 10;
  const goldReq = 100000;
  const levelMet = state.level >= levelReq;
  const goldMet = runGold >= goldReq;
  const canAwaken = levelMet && goldMet;

  // Rewards preview
  const perkPointsEarned = Math.max(1, Math.floor(Math.sqrt(runGold / 100000)));
  const nextPrestige = prestige + 1;
  const nextMult = 1 + nextPrestige * 0.25;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: 20,
      height: '100%',
      overflowY: 'auto',
      paddingRight: 4,
    }}>
      {/* ─── CYCLE HEADER ──────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          fontSize: 9, color: COLORS.amberDim,
          letterSpacing: '0.4em',
        }}>
          :: CYCLE_{String(prestige).padStart(2, '0')} ::
        </div>
        <div style={{
          fontSize: 48, fontWeight: 800, color: COLORS.gold,
          letterSpacing: '0.04em', lineHeight: 1,
          marginTop: 8,
          textShadow: `0 0 32px ${COLORS.gold}55`,
        }}>
          AWAKENING
        </div>
        <div style={{
          fontSize: 11, color: COLORS.amberDim,
          marginTop: 10, letterSpacing: '0.05em',
          fontStyle: 'italic',
          maxWidth: 520, margin: '10px auto 0',
        }}>
          {getFlavorText(prestige)}
        </div>

        {/* Current multiplier badge */}
        {prestige > 0 && (
          <div style={{
            display: 'inline-flex', gap: 14, marginTop: 14,
            padding: '6px 16px',
            border: `1px solid ${COLORS.gold}`,
            background: `${COLORS.gold}0a`,
          }}>
            <span style={{ fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.2em' }}>
              CURRENT
            </span>
            <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 800, letterSpacing: '0.1em' }}>
              ★ P{prestige} · x{prestigeMult.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* ─── REQUIREMENTS ──────────────────────────── */}
      <Panel accent={canAwaken ? COLORS.gold : COLORS.amber} title="PATH_TO_AWAKENING">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BigBar
            icon={Activity}
            label="LEVEL PROGRESS"
            value={state.level}
            max={levelReq}
            color={COLORS.purple}
            met={levelMet}
          />
          <BigBar
            icon={Coins}
            label="RUN YIELD"
            value={runGold}
            max={goldReq}
            color={COLORS.amber}
            met={goldMet}
            formatValue={(v, m) => `${fmt(v)} / ${fmt(m)} CR`}
          />
        </div>
      </Panel>

      {/* ─── INITIATE BUTTON ───────────────────────── */}
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <button
          disabled={!canAwaken}
          onClick={() => dispatchWithSound({ type: 'SHOW_PRESTIGE_MODAL' })}
          style={{
            background: 'transparent',
            border: `2px solid ${canAwaken ? COLORS.gold : COLORS.amberLine}`,
            color: canAwaken ? COLORS.gold : COLORS.amberDim,
            padding: '18px 48px',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '0.3em',
            fontFamily: 'inherit',
            cursor: canAwaken ? 'pointer' : 'not-allowed',
            opacity: canAwaken ? 1 : 0.5,
            animation: canAwaken ? 'pulseGold 1.6s ease-in-out infinite' : 'none',
            textShadow: canAwaken ? `0 0 18px ${COLORS.gold}` : 'none',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            if (canAwaken) {
              e.currentTarget.style.background = COLORS.gold;
              e.currentTarget.style.color = '#000';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = COLORS.gold;
          }}
        >
          ★ INITIATE_AWAKENING ★
        </button>
        {!canAwaken && (
          <div style={{
            marginTop: 10, fontSize: 9, color: COLORS.red,
            letterSpacing: '0.25em', fontWeight: 700,
          }}>
            REQUIREMENTS_UNMET — CONTINUE_OPS
          </div>
        )}
      </div>

      {/* ─── REWARDS PREVIEW ───────────────────────── */}
      {canAwaken && (
        <Panel accent={COLORS.gold} title="AWAKENING_REWARDS" dense>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <RewardCell
              icon={Star}
              label="PRESTIGE"
              value={`P${nextPrestige}`}
              color={COLORS.purple}
            />
            <RewardCell
              icon={TrendingUp}
              label="MULTIPLIER"
              value={`x${nextMult.toFixed(2)}`}
              color={COLORS.gold}
            />
            <RewardCell
              icon={Zap}
              label="PERK POINTS"
              value={`+${perkPointsEarned}`}
              color={COLORS.cyan}
            />
          </div>
          <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 10, letterSpacing: '0.1em', textAlign: 'center' }}>
            KEPT: Reputation · Intel upgrades · Achievements · Perks
          </div>
        </Panel>
      )}

      {/* ─── PERK TREE ─────────────────────────────── */}
      {prestige >= 1 && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingBottom: 8, borderBottom: `1px solid ${COLORS.amberLine}`,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.amber, letterSpacing: '0.15em' }}>
                LEGACY_PERKS
              </div>
              <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 2, letterSpacing: '0.1em' }}>
                Permanent bonuses carried across all cycles
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 18, fontWeight: 800,
                color: prestigePoints > 0 ? COLORS.gold : COLORS.amberDim,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {prestigePoints}
              </div>
              <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.15em' }}>
                POINTS_AVAILABLE
              </div>
            </div>
          </div>

          {Object.entries(BRANCHES).map(([branchKey, branch]) => (
            <PerkBranch
              key={branchKey}
              branchKey={branchKey}
              branch={branch}
              state={state}
              dispatchWithSound={dispatchWithSound}
            />
          ))}
        </>
      )}

      {/* ─── NO PRESTIGE YET ───────────────────────── */}
      {prestige === 0 && canAwaken && (
        <div style={{
          padding: 14,
          border: `1px dashed ${COLORS.cyan}`,
          background: `${COLORS.cyan}0a`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: COLORS.cyan, letterSpacing: '0.2em', fontWeight: 700 }}>
            FIRST_AWAKENING_AVAILABLE
          </div>
          <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 6, lineHeight: 1.5 }}>
            After your first cycle, permanent perks unlock here.<br/>
            Choose your path: GHOST, OVERLORD, or ARCHITECT.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Big progress bar ──────────────────────────────────────────────────────
function BigBar({ icon: Icon, label, value, max, color, met, formatValue }) {
  const pct = Math.min(100, (value / max) * 100);
  const displayValue = formatValue
    ? formatValue(value, max)
    : `${value} / ${max}`;

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 6,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.2em',
        }}>
          <Icon size={11} color={met ? color : COLORS.amberDim} />
          {label}
        </span>
        <span style={{
          fontSize: 13, color: met ? color : COLORS.amber,
          fontWeight: 800, fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.03em',
        }}>
          {displayValue}
          {met && <span style={{ marginLeft: 6, color: COLORS.green }}>◆</span>}
        </span>
      </div>
      <div style={{
        height: 14, background: COLORS.bg,
        border: `1px solid ${COLORS.amberLine}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}44, ${color})`,
          boxShadow: met ? `0 0 14px ${color}` : 'none',
          transition: 'width 500ms ease',
        }} />
        {[25, 50, 75].map(p => (
          <span
            key={p}
            style={{
              position: 'absolute', top: 0, bottom: 0, left: `${p}%`,
              width: 1, background: 'rgba(0,0,0,0.5)',
            }}
          />
        ))}
      </div>
      <div style={{
        textAlign: 'right', marginTop: 3,
        fontSize: 9, color: met ? color : COLORS.amberDim,
        letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums',
      }}>
        {pct.toFixed(1)}%
      </div>
    </div>
  );
}

// ─── Reward cell ───────────────────────────────────────────────────────────
function RewardCell({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      padding: 10,
      border: `1px solid ${color}44`,
      background: `${color}0a`,
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.2em',
      }}>
        <Icon size={11} color={color} />
        {label}
      </div>
      <div style={{
        fontSize: 18, color, fontWeight: 800,
        letterSpacing: '0.05em', marginTop: 4,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  );
}

// ─── Perk branch ───────────────────────────────────────────────────────────
function PerkBranch({ branchKey, branch, state, dispatchWithSound }) {
  const { icon: Icon, color } = branch;
  const prestigePoints = state.prestigePoints ?? 0;
  const owned = state.prestigePerks ?? {};
  const perks = PRESTIGE_PERK_DEFS.filter(d => d.branch === branchKey);

  const ownedCount = perks.filter(p => owned[p.id]).length;

  return (
    <div>
      {/* Branch header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px',
        background: `${color}11`,
        borderLeft: `4px solid ${color}`,
        marginBottom: 4,
      }}>
        <Icon size={14} color={color} />
        <span style={{
          fontSize: 12, fontWeight: 800, color,
          letterSpacing: '0.2em',
        }}>
          :: {branch.label}
        </span>
        <span style={{
          fontSize: 9, color: COLORS.amberDim,
          letterSpacing: '0.05em', fontStyle: 'italic', opacity: 0.7,
        }}>
          {branch.desc}
        </span>
        <span style={{ flex: 1 }} />
        <Tag color={color}>
          {ownedCount}/{perks.length}
        </Tag>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {perks.map(def => (
          <PerkRow
            key={def.id}
            def={def}
            isOwned={!!owned[def.id]}
            canAfford={prestigePoints >= (def.cost ?? 1)}
            levelMet={state.level >= (def.reqLevel ?? 1)}
            playerLevel={state.level}
            color={color}
            onBuy={() => dispatchWithSound({ type: 'BUY_PRESTIGE_PERK', perkId: def.id })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Perk row ──────────────────────────────────────────────────────────────
function PerkRow({ def, isOwned, canAfford, levelMet, playerLevel, color, onBuy }) {
  const canBuy = !isOwned && canAfford && levelMet;
  const cost = def.cost ?? 1;

  const borderColor = isOwned ? color
                    : canBuy ? COLORS.amber
                    : COLORS.amberFaint;

  return (
    <div style={{
      padding: 10,
      background: isOwned ? `${color}0a` : 'transparent',
      borderLeft: `3px solid ${borderColor}`,
      borderBottom: `1px solid ${COLORS.amberFaint}`,
      opacity: levelMet ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: isOwned ? color : COLORS.amber,
            letterSpacing: '0.05em',
          }}>
            {def.id}
            {def.reqLevel > 1 && (
              <span style={{
                fontSize: 8, color: levelMet ? COLORS.green : COLORS.red,
                marginLeft: 8, letterSpacing: '0.15em', fontWeight: 800,
              }}>
                [LVL {def.reqLevel}]
              </span>
            )}
          </div>
          <div style={{
            fontSize: 10, color: COLORS.amberDim,
            marginTop: 3, lineHeight: 1.4,
          }}>
            {def.desc}
          </div>
          <div style={{
            fontSize: 9, color, marginTop: 3,
            fontStyle: 'italic', opacity: 0.8, letterSpacing: '0.03em',
          }}>
            › {def.effect}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {isOwned ? (
            <div style={{
              fontSize: 10, color, letterSpacing: '0.2em', fontWeight: 800,
              padding: '4px 10px',
              border: `1px solid ${color}`,
              background: `${color}11`,
            }}>
              ◆ ACTIVE
            </div>
          ) : !levelMet ? (
            <div style={{
              fontSize: 9, color: COLORS.red,
              letterSpacing: '0.2em', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <Lock size={10} /> LOCKED
            </div>
          ) : (
            <BBtn
              size="sm"
              variant={canAfford ? 'default' : 'ghost'}
              disabled={!canBuy}
              onClick={onBuy}
            >
              {canAfford ? `SELECT (${cost}pt)` : `NEED ${cost - (def.cost ?? 0)} PT`}
            </BBtn>
          )}
        </div>
      </div>
    </div>
  );
}