// UPGRADES tab: buy permanent upgrades in 4 categories + intel upgrades (REP).

import { useMemo } from 'react';
import {
  Shield, Coins, Heart, Cpu, Eye,
  Lock, TrendingUp, Flame, Zap, Activity,
} from 'lucide-react';

import { Panel, Tag, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import {
  isUnlocked,
  getUpgradeCost,
  getIntelUpgradeCost,
  UPGRADE_DEFS,
  INTEL_UPGRADE_DEFS,
} from '../gameLogic.js';

// ─── Category configuration ────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'COMBAT',
    label: 'COMBAT_PROTOCOLS',
    desc: 'Increase success rates, reduce lockouts',
    color: COLORS.red,
    icon: Shield,
    members: ['ghostProtocol', 'iceBreaker', 'signalDampener', 'traceEraser'],
  },
  {
    id: 'ECONOMY',
    label: 'ECONOMIC_PROTOCOLS',
    desc: 'Boost credits, XP gain, automation',
    color: COLORS.amber,
    icon: Coins,
    members: ['darkChannel', 'autoFencer', 'aiSubroutine', 'xpBoost'],
  },
  {
    id: 'SURVIVAL',
    label: 'SURVIVAL_PROTOCOLS',
    desc: 'Stamina, heat management, safety nets',
    color: COLORS.green,
    icon: Heart,
    members: ['neuralBoost', 'stimPack', 'safehouse', 'quantumEncryption', 'proxyServers'],
  },
  {
    id: 'NETWORK',
    label: 'NETWORK_PROTOCOLS',
    desc: 'Inventory, runners, hardware',
    color: COLORS.cyan,
    icon: Cpu,
    members: ['voidDrive', 'hwOverclock', 'runnerStealth'],
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────
export function UpgradesTab({ state, dispatchWithSound }) {
  const upgrades = state.upgrades ?? {};
  const intelUpgrades = state.intelUpgrades ?? {};

  // Summary stats
  const summary = useMemo(() => {
    let totalLevels = 0;
    let maxLevels = 0;
    for (const def of UPGRADE_DEFS) {
      totalLevels += upgrades[def.key] ?? 0;
      maxLevels += def.max;
    }
    for (const def of INTEL_UPGRADE_DEFS) {
      totalLevels += intelUpgrades[def.key] ?? 0;
      maxLevels += def.max;
    }
    return { totalLevels, maxLevels, pct: Math.round((totalLevels / maxLevels) * 100) };
  }, [upgrades, intelUpgrades]);

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
            UPGRADE_MATRIX
          </div>
          <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 3, letterSpacing: '0.1em' }}>
            Permanent enhancements. Purchased levels carry across prestige.
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber, fontVariantNumeric: 'tabular-nums' }}>
            {summary.totalLevels}<span style={{ fontSize: 11, color: COLORS.amberDim, marginLeft: 4 }}>/{summary.maxLevels}</span>
          </div>
          <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.15em' }}>
            {summary.pct}% COMPLETE
          </div>
        </div>
      </div>

      {/* ─── CATEGORIES ────────────────────────────── */}
      {CATEGORIES.map(cat => {
        const catUpgrades = cat.members
          .map(key => UPGRADE_DEFS.find(u => u.key === key))
          .filter(Boolean);

        if (catUpgrades.length === 0) return null;

        return (
          <Category
            key={cat.id}
            category={cat}
            upgrades={catUpgrades}
            state={state}
            dispatchWithSound={dispatchWithSound}
          />
        );
      })}

      {/* ─── INTEL UPGRADES ─────────────────────────── */}
      {isUnlocked(state, 'intel') && (
        <IntelSection
          state={state}
          dispatchWithSound={dispatchWithSound}
        />
      )}
    </div>
  );
}

// ─── Category ──────────────────────────────────────────────────────────────
function Category({ category, upgrades, state, dispatchWithSound }) {
  const { icon: Icon, color } = category;

  // Count unlocked in this category
  const owned = upgrades.filter(u => (state.upgrades[u.key] ?? 0) > 0).length;

  return (
    <div>
      {/* Category header */}
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
          :: {category.label}
        </span>
        <span style={{
          fontSize: 9, color: COLORS.amberDim,
          letterSpacing: '0.08em', fontStyle: 'italic',
          opacity: 0.7,
        }}>
          {category.desc}
        </span>
        <span style={{ flex: 1 }} />
        <Tag color={color}>
          {owned}/{upgrades.length}
        </Tag>
      </div>

      {/* Upgrade list */}
      <div>
        {upgrades.map(def => (
          <UpgradeRow
            key={def.key}
            def={def}
            level={state.upgrades[def.key] ?? 0}
            gold={state.gold}
            accent={color}
            onBuy={() => dispatchWithSound({ type: 'BUY_UPGRADE', key: def.key })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Upgrade row ───────────────────────────────────────────────────────────
function UpgradeRow({ def, level, gold, accent, onBuy }) {
  const maxed = level >= def.max;
  const cost = maxed ? 0 : getUpgradeCost(def.baseCost, level);
  const canAfford = gold >= cost;

  const borderColor = maxed ? COLORS.green
                    : level > 0 ? accent
                    : COLORS.amberFaint;

  return (
    <button
      onClick={canAfford && !maxed ? onBuy : undefined}
      disabled={!canAfford || maxed}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 16,
        padding: '10px 14px',
        background: 'transparent',
        borderLeft: `3px solid ${borderColor}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: `1px solid ${COLORS.amberFaint}`,
        fontFamily: 'inherit',
        cursor: maxed ? 'default' : canAfford ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        transition: 'background 120ms',
      }}
      onMouseEnter={(e) => {
        if (canAfford && !maxed) {
          e.currentTarget.style.background = `${accent}0d`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Name + effect */}
      <div>
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: maxed ? COLORS.green : COLORS.amber,
          letterSpacing: '0.05em',
        }}>
          {def.label}
        </div>
        <div style={{
          fontSize: 10, color: COLORS.amberDim,
          fontStyle: 'italic', marginTop: 2, opacity: 0.8,
        }}>
          › {def.effect}
        </div>
      </div>

      {/* Level progress */}
      <LevelProgress level={level} max={def.max} color={maxed ? COLORS.green : accent} />

      {/* Cost */}
      <div style={{ textAlign: 'right', minWidth: 90 }}>
        {maxed ? (
          <div style={{
            fontSize: 10, color: COLORS.green,
            letterSpacing: '0.2em', fontWeight: 800,
          }}>
            ◆ MAXED
          </div>
        ) : (
          <>
            <div style={{
              fontSize: 13, fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: canAfford ? COLORS.amber : COLORS.red,
              letterSpacing: '0.03em',
            }}>
              {fmt(cost)} <span style={{ fontSize: 10, color: COLORS.amberDim }}>CR</span>
            </div>
            <div style={{
              fontSize: 8, color: canAfford ? COLORS.green : COLORS.red,
              letterSpacing: '0.2em', marginTop: 2, fontWeight: 700,
            }}>
              {canAfford ? '[BUY]' : '[LOCKED]'}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

// ─── Level progress (filled blocks) ────────────────────────────────────────
function LevelProgress({ level, max, color }) {
  const blocks = [];
  for (let i = 0; i < max; i++) {
    blocks.push(
      <span key={i} style={{
        width: 8, height: 12,
        background: i < level ? color : 'transparent',
        border: `1px solid ${i < level ? color : COLORS.amberLine}`,
        boxShadow: i < level ? `0 0 4px ${color}66` : 'none',
        transition: 'all 120ms',
      }} />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {blocks}
      </div>
      <div style={{
        fontSize: 8, color: COLORS.amberDim,
        letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums',
      }}>
        LV {level}/{max}
      </div>
    </div>
  );
}

// ─── Intel section (REP-based) ─────────────────────────────────────────────
function IntelSection({ state, dispatchWithSound }) {
  const rep = state.reputation ?? 0;

  return (
    <div style={{ marginTop: 8 }}>
      {/* Intel header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px',
        background: `${COLORS.purple}11`,
        borderLeft: `4px solid ${COLORS.purple}`,
        marginBottom: 4,
      }}>
        <Eye size={14} color={COLORS.purple} />
        <span style={{
          fontSize: 12, fontWeight: 800, color: COLORS.purple,
          letterSpacing: '0.2em',
        }}>
          :: INTEL_&_ASSETS
        </span>
        <span style={{
          fontSize: 9, color: COLORS.amberDim,
          letterSpacing: '0.08em', fontStyle: 'italic',
          opacity: 0.7,
        }}>
          Purchased with REP — intelligence network access
        </span>
        <span style={{ flex: 1 }} />
        <Tag color={COLORS.purple}>{fmt(rep)} REP</Tag>
      </div>

      <div>
        {INTEL_UPGRADE_DEFS.map(def => (
          <IntelRow
            key={def.key}
            def={def}
            level={state.intelUpgrades?.[def.key] ?? 0}
            rep={rep}
            hasDiscount={!!state.prestigePerks?.INTEL_DISCOUNT}
            onBuy={() => dispatchWithSound({ type: 'BUY_INTEL_UPGRADE', key: def.key })}
          />
        ))}
      </div>
    </div>
  );
}

function IntelRow({ def, level, rep, hasDiscount, onBuy }) {
  const maxed = level >= def.max;
  const baseCost = getIntelUpgradeCost(def.key, level);
  const cost = hasDiscount ? Math.round(baseCost * 0.8) : baseCost;
  const canAfford = rep >= cost;

  const borderColor = maxed ? COLORS.green
                    : level > 0 ? COLORS.purple
                    : COLORS.amberFaint;

  return (
    <button
      onClick={canAfford && !maxed ? onBuy : undefined}
      disabled={!canAfford || maxed}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 16,
        padding: '10px 14px',
        background: 'transparent',
        borderLeft: `3px solid ${borderColor}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: `1px solid ${COLORS.amberFaint}`,
        fontFamily: 'inherit',
        cursor: maxed ? 'default' : canAfford ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        transition: 'background 120ms',
      }}
      onMouseEnter={(e) => {
        if (canAfford && !maxed) {
          e.currentTarget.style.background = `${COLORS.purple}0d`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div>
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: maxed ? COLORS.green : COLORS.purple,
          letterSpacing: '0.05em',
        }}>
          {def.label}
        </div>
        <div style={{
          fontSize: 10, color: COLORS.amberDim,
          fontStyle: 'italic', marginTop: 2, opacity: 0.8,
        }}>
          › {def.effect}
        </div>
      </div>

      <LevelProgress level={level} max={def.max} color={maxed ? COLORS.green : COLORS.purple} />

      <div style={{ textAlign: 'right', minWidth: 90 }}>
        {maxed ? (
          <div style={{
            fontSize: 10, color: COLORS.green,
            letterSpacing: '0.2em', fontWeight: 800,
          }}>
            ◆ MAXED
          </div>
        ) : (
          <>
            <div style={{
              fontSize: 13, fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: canAfford ? COLORS.purple : COLORS.red,
              letterSpacing: '0.03em',
            }}>
              {fmt(cost)} <span style={{ fontSize: 10, color: COLORS.amberDim }}>REP</span>
              {hasDiscount && (
                <span style={{ fontSize: 8, color: COLORS.green, marginLeft: 4, letterSpacing: '0.15em' }}>
                  -20%
                </span>
              )}
            </div>
            <div style={{
              fontSize: 8, color: canAfford ? COLORS.green : COLORS.red,
              letterSpacing: '0.2em', marginTop: 2, fontWeight: 700,
            }}>
              {canAfford ? '[BUY]' : '[INSUFFICIENT_REP]'}
            </div>
          </>
        )}
      </div>
    </button>
  );
}