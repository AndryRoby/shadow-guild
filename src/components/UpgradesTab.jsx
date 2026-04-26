// UPGRADES tab: buy permanent upgrades in 4 categories + intel upgrades (REP).

import { useMemo, useState } from 'react';
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
  REVEAL_DEFS,
} from '../gameLogic.js';
import { audioManager } from '../audio/AudioManager.js';

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
  const [subTab, setSubTab] = useState('ENHANCEMENTS'); // ENHANCEMENTS | REVEALS
  const upgrades = state.upgrades ?? {};
  const intelUpgrades = state.intelUpgrades ?? {};
  const reveals = state.reveals ?? {};

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

  const revealsOwned = REVEAL_DEFS.filter(r => reveals[r.id]).length;

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
            {subTab === 'ENHANCEMENTS'
              ? 'Permanent enhancements. Purchased levels carry across prestige.'
              : 'Software modules. Reveal panels and unlock automation.'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          {subTab === 'ENHANCEMENTS' ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber, fontVariantNumeric: 'tabular-nums' }}>
                {summary.totalLevels}<span style={{ fontSize: 11, color: COLORS.amberDim, marginLeft: 4 }}>/{summary.maxLevels}</span>
              </div>
              <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.15em' }}>
                {summary.pct}% COMPLETE
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.cyan, fontVariantNumeric: 'tabular-nums' }}>
                {revealsOwned}<span style={{ fontSize: 11, color: COLORS.amberDim, marginLeft: 4 }}>/{REVEAL_DEFS.length}</span>
              </div>
              <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.15em' }}>
                MODULES INSTALLED
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── SUB-TAB PILLS ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 6 }}>
        <SubTabPill
          label="ENHANCEMENTS"
          color={COLORS.amber}
          active={subTab === 'ENHANCEMENTS'}
          onClick={() => { setSubTab('ENHANCEMENTS'); audioManager.tab(); }}
        />
        {(state.level ?? 1) >= 5 && (
          <SubTabPill
            label="REVEALS"
            color={COLORS.cyan}
            active={subTab === 'REVEALS'}
            onClick={() => { setSubTab('REVEALS'); audioManager.tab(); }}
            badge={revealsOwned < REVEAL_DEFS.length && REVEAL_DEFS.some(r => !reveals[r.id] && state.gold >= r.cost) ? '!' : null}
          />
        )}
      </div>

      {/* ─── CONTENT: ENHANCEMENTS ────────────────── */}
      {subTab === 'ENHANCEMENTS' && (
        <>
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

          {/* Intel sub-section */}
          {isUnlocked(state, 'intel') && (
            <IntelSection
              state={state}
              dispatchWithSound={dispatchWithSound}
            />
          )}
        </>
      )}

      {/* ─── CONTENT: REVEALS ────────────────────── */}
      {subTab === 'REVEALS' && (
        <RevealsSection
          state={state}
          dispatchWithSound={dispatchWithSound}
        />
      )}
    </div>
  );
}

// ─── Sub-tab pill ──────────────────────────────────────────────────────────
function SubTabPill({ label, color, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? color : 'transparent',
        color: active ? '#000' : color,
        border: `1px solid ${color}`,
        padding: '8px 14px',
        fontSize: 10,
        letterSpacing: '0.25em',
        fontWeight: 800,
        fontFamily: 'inherit',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 120ms',
      }}
    >
      {label}
      {badge && (
        <span style={{
          position: 'absolute',
          top: -4, right: -4,
          width: 14, height: 14,
          background: COLORS.red,
          color: '#fff',
          fontSize: 9,
          fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 6px ${COLORS.red}`,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── REVEALS section ───────────────────────────────────────────────────────
function RevealsSection({ state, dispatchWithSound }) {
  const reveals = state.reveals ?? {};
  const branches = ['INTEL', 'AUTO', 'TWEAK'];
  const branchMeta = {
    INTEL: { color: COLORS.cyan,   label: 'INTELLIGENCE',  desc: 'Reveal hidden information panels' },
    AUTO:  { color: COLORS.purple, label: 'AUTOMATION',    desc: 'Hands-off helpers' },
    TWEAK: { color: COLORS.gold,   label: 'GAMEPLAY_TWEAK', desc: 'Modify core mechanics' },
  };

  return (
    <>
      {branches.map(branchKey => {
        const meta = branchMeta[branchKey];
        const branchReveals = REVEAL_DEFS.filter(r => r.branch === branchKey);
        if (branchReveals.length === 0) return null;
        const owned = branchReveals.filter(r => reveals[r.id]).length;

        return (
          <div key={branchKey}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              background: `${meta.color}11`,
              borderLeft: `4px solid ${meta.color}`,
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, letterSpacing: '0.2em' }}>
                :: {meta.label}
              </span>
              <span style={{ flex: 1, fontSize: 9, color: COLORS.amberDim, fontStyle: 'italic' }}>
                {meta.desc}
              </span>
              <Tag color={meta.color}>{owned}/{branchReveals.length}</Tag>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {branchReveals.map(def => (
                <RevealRow
                  key={def.id}
                  def={def}
                  isOwned={!!reveals[def.id]}
                  canAfford={state.gold >= def.cost}
                  onBuy={() => {
                    audioManager.upgradeReveal(); // Pridaný špecifický zvuk pre Reveals
                    dispatchWithSound({ type: 'BUY_REVEAL', revealId: def.id });
                  }}
                  color={meta.color}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── Reveal row ────────────────────────────────────────────────────────────
function RevealRow({ def, isOwned, canAfford, onBuy, color }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: isOwned ? `${color}0a` : COLORS.surface,
      borderLeft: `2px solid ${isOwned ? color : COLORS.amberFaint}`,
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: isOwned ? 0.85 : 1,
    }}>
      <div style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}55`,
        color: isOwned ? color : COLORS.amberDim,
        fontSize: 16,
        flexShrink: 0,
        background: isOwned ? `${color}1a` : 'transparent',
      }}>
        {def.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: isOwned ? color : COLORS.amber, letterSpacing: '0.05em' }}>
            {def.label}
          </span>
          {isOwned && <Tag color={COLORS.green}>INSTALLED</Tag>}
        </div>
        <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 3, fontStyle: 'italic', lineHeight: 1.4 }}>
          {def.flavor}
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {isOwned ? (
          <span style={{ fontSize: 9, color: COLORS.green, letterSpacing: '0.2em', fontWeight: 700 }}>
            ◆ ACTIVE
          </span>
        ) : (
          <BBtn
            size="sm"
            variant={canAfford ? 'cyan' : 'ghost'}
            disabled={!canAfford}
            onClick={onBuy}
          >
            {fmt(def.cost)} CR
          </BBtn>
        )}
      </div>
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
  // Binary upgrades (max=1): clean owned/unowned badge
  if (max === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span style={{
          fontSize: 10,
          color: level > 0 ? color : COLORS.amberDim,
          letterSpacing: '0.18em', fontWeight: 800,
          padding: '2px 6px',
          border: `1px solid ${level > 0 ? color : COLORS.amberLine}`,
          boxShadow: level > 0 ? `0 0 6px ${color}66` : 'none',
        }}>
          {level > 0 ? '◆ OWNED' : '○ AVAIL'}
        </span>
      </div>
    );
  }

  // Compact progress bar for max > 8 (saves horizontal space)
  if (max > 8) {
    const pct = (level / max) * 100;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, minWidth: 70 }}>
        <div style={{
          width: 70, height: 6,
          background: COLORS.surfaceHigh,
          border: `1px solid ${COLORS.amberLine}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
            transition: 'width 200ms',
          }} />
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

  // Block display for max 2-8
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