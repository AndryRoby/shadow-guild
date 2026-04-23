// OPS tab: target briefing, protocol selector, combo display, action grid.
// System log is in a separate file (SystemLog.jsx, added in phase 4.3b).

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Zap, Shield, Eye, Coins, Flame, Package, Activity,
  ChevronLeft, ChevronRight, Lock, Cpu, Target,
} from 'lucide-react';

import { Panel, Tag, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import { getDistrictData } from '../selectors.js';
import {
  isUnlocked,
  effectiveSuccessRate,
  PROTOCOL_DEFS,
} from '../gameLogic.js';
import {
  DISTRICTS as AETHERIA_DISTRICTS,
  CITY_MAP,
} from '../../CITY_MAP.js';
import { SystemLog } from './SystemLog.jsx';

// ─── Main ──────────────────────────────────────────────────────────────────
export function OpsTab({ state, dispatchWithSound }) {
  const district = getDistrictData(state);

  // Which districts are unlocked (based on captured hexes)
  const unlockedDistricts = useMemo(() => {
    const ids = new Set();
    (state.capturedHexes ?? []).forEach(hexId => {
      const hex = CITY_MAP[hexId];
      if (hex?.districtId) ids.add(hex.districtId);
    });
    return Array.from(ids);
  }, [state.capturedHexes]);

  const districtAvailable = unlockedDistricts.length > 0;

  const changeDistrict = (dir) => {
    if (unlockedDistricts.length < 2) return;
    const currentIdx = unlockedDistricts.indexOf(state.district);
    const nextIdx = (currentIdx + dir + unlockedDistricts.length) % unlockedDistricts.length;
    dispatchWithSound({ type: 'SET_DISTRICT', district: unlockedDistricts[nextIdx] });
  };

  // Busted lockout check
  const isBlocked = (state.bustedLockout ?? 0) > 0 || state.layLowActive;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: 14,
      height: '100%',
      overflowY: 'auto',
      paddingRight: 4,
    }}>
        {/* ─── TARGET BRIEFING ───────────────────────── */}
        {districtAvailable ? (
          <TargetBriefing
            district={district}
            currentId={state.district}
            unlockedDistricts={unlockedDistricts}
            onPrev={() => changeDistrict(-1)}
            onNext={() => changeDistrict(1)}
          />
        ) : (
          <LockedBriefing />
        )}

        {/* ─── PROTOCOL SELECTOR ─────────────────────── */}
        {isUnlocked(state, 'protocol') && (
          <ProtocolSelector
            activeProtocol={state.activeProtocol ?? 'NONE'}
            onSelect={(p) => dispatchWithSound({ type: 'SET_PROTOCOL', protocol: p })}
          />
        )}

        {/* ─── COMBO DISPLAY ─────────────────────────── */}
        {isUnlocked(state, 'combo') && (
          <ComboDisplay
            combo={state.comboCount ?? 0}
            comboTimer={state.comboTimer ?? 0}
            shatterKey={state.comboShatterKey ?? 0}
          />
        )}

        {/* ─── PRIMARY ACTIONS ───────────────────────── */}
        <PrimaryActionGrid
          state={state}
          dispatchWithSound={dispatchWithSound}
          isBlocked={isBlocked}
          combo={state.comboCount ?? 0}
        />

        {/* ─── SECONDARY ACTIONS ─────────────────────── */}
        <SecondaryActionGrid
          state={state}
          dispatchWithSound={dispatchWithSound}
          isBlocked={isBlocked}
        />

        {/* ─── SYSTEM LOG ────────────────────────────── */}
        <SystemLog state={state} />
      </div>
  );
}

// ─── TARGET BRIEFING ───────────────────────────────────────────────────────
function TargetBriefing({ district, currentId, unlockedDistricts, onPrev, onNext }) {
  const canNavigate = unlockedDistricts.length > 1;

  return (
    <Panel
      accent={district.color}
      title="TARGET_BRIEFING"
      right={canNavigate && (
        <div style={{ display: 'flex', gap: 6 }}>
          <BBtn size="sm" variant="ghost" onClick={onPrev}>
            <ChevronLeft size={11} style={{ verticalAlign: 'middle' }} /> PREV
          </BBtn>
          <BBtn size="sm" variant="ghost" onClick={onNext}>
            NEXT <ChevronRight size={11} style={{ verticalAlign: 'middle' }} />
          </BBtn>
        </div>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.25em' }}>
            DISTRICT_{currentId}
          </div>
          <div style={{
            fontSize: 32, fontWeight: 800, color: district.color,
            letterSpacing: '-0.01em', lineHeight: 1.05, marginTop: 2,
            textShadow: `0 0 24px ${district.color}33`,
          }}>
            {district.name}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Tag color={COLORS.green}>
              <Coins size={9} style={{ display: 'inline', marginRight: 2 }} />
              LOOT x{district.mult.toFixed(1)}
            </Tag>
            <Tag color={COLORS.red}>
                <Flame size={9} style={{ display: 'inline', marginRight: 2 }} />
                COOL {district.heatDecay.toFixed(2)}/s
            </Tag>
            {district.xpMult > 1 && (
              <Tag color={COLORS.purple}>
                <Activity size={9} style={{ display: 'inline', marginRight: 2 }} />
                XP x{district.xpMult.toFixed(1)}
              </Tag>
            )}
          </div>
          {district.desc && (
            <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 10, fontStyle: 'italic', lineHeight: 1.4 }}>
              {district.desc}
            </div>
          )}
        </div>

        {/* Decorative ASCII bars — normalized to 1-6 range */}
        {(() => {
        // Each metric has different natural range; normalize to 1-6 bars
        const bar = (filled) => '▓'.repeat(filled) + '░'.repeat(6 - filled);

        // LOOT: range 1.0-8.0 → scale to 1-6
        const lootBars = Math.min(6, Math.max(1, Math.round(district.mult * 0.75)));
        // HEAT RISK: range 2.5-20 (inverse of decay) → scale to 1-6
        const heatBars = Math.min(6, Math.max(1, Math.round((district.heat - 2) / 3)));
        // XP: range 1.0-4.0 → scale to 1-6
        const xpBars = Math.min(6, Math.max(1, Math.round(district.xpMult * 1.5)));

        return (
            <div style={{
            fontFamily: 'inherit', fontSize: 10,
            color: COLORS.amberDim, textAlign: 'right', lineHeight: 1.3,
            opacity: 0.6,
            }}>
            <div>{bar(lootBars)}</div>
            <div>{bar(heatBars)}</div>
            <div>{bar(xpBars)}</div>
            </div>
        );
        })()}
      </div>
    </Panel>
  );
}

function LockedBriefing() {
  return (
    <div style={{
      padding: 20,
      border: `1px dashed ${COLORS.amberLine}`,
      background: COLORS.surface,
      textAlign: 'center',
    }}>
      <Lock size={18} color={COLORS.amberDim} style={{ display: 'inline-block', marginBottom: 8 }} />
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.amberDim, letterSpacing: '0.2em' }}>
        :: NO_NETWORK_ACCESS
      </div>
      <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 6, opacity: 0.7 }}>
        Capture your first node to select a district.
      </div>
    </div>
  );
}

// ─── PROTOCOL SELECTOR ─────────────────────────────────────────────────────
function ProtocolSelector({ activeProtocol, onSelect }) {
  return (
    <Panel accent={COLORS.cyan} title="OPERATION_PROTOCOL" dense>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {Object.entries(PROTOCOL_DEFS).map(([key, def]) => {
          const active = activeProtocol === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                background: active ? `${def.color}22` : 'transparent',
                border: `1px solid ${active ? def.color : COLORS.amberLine}`,
                color: active ? def.color : COLORS.amberDim,
                padding: '8px 6px',
                fontSize: 10,
                fontFamily: 'inherit',
                fontWeight: 800,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 120ms',
                boxShadow: active ? `0 0 12px ${def.color}44` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = def.color;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = COLORS.amberDim;
              }}
            >
              {active ? '▶ ' : ''}{def.label}
              <div style={{ fontSize: 8, marginTop: 4, opacity: 0.8, letterSpacing: '0.05em', fontWeight: 400 }}>
                {def.desc}
              </div>
            </button>
          );
        })}
      </div>
      {activeProtocol !== 'NONE' && (
        <button
          onClick={() => onSelect('NONE')}
          style={{
            marginTop: 8,
            width: '100%',
            background: 'transparent',
            border: `1px dashed ${COLORS.red}`,
            color: COLORS.red,
            padding: '4px 0',
            fontSize: 9,
            fontFamily: 'inherit',
            letterSpacing: '0.2em',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ✕ DEACTIVATE
        </button>
      )}
    </Panel>
  );
}

// ─── COMBO DISPLAY ─────────────────────────────────────────────────────────
// Shows active combo or brief shatter on expiration.
// `lastShatterTime` is tracked per-mount to avoid showing x0 on tab remount.
function ComboDisplay({ combo, comboTimer, shatterKey }) {
    const [showShatter, setShowShatter] = useState(false);
    const prevShatterKey = useRef(shatterKey);
    const mountedAt = useRef(Date.now());
  
    useEffect(() => {
      // Only show shatter if key actually changed after mount (not on initial render)
      if (shatterKey !== prevShatterKey.current && Date.now() - mountedAt.current > 500) {
        setShowShatter(true);
        const t = setTimeout(() => setShowShatter(false), 600);
        prevShatterKey.current = shatterKey;
        return () => clearTimeout(t);
      }
      prevShatterKey.current = shatterKey;
    }, [shatterKey]);
  
    const comboPct = Math.min(100, (comboTimer / 4000) * 100);
  
    const comboColor =
      combo >= 15 ? '#ffffff' :
      combo >= 10 ? COLORS.gold :
      combo >= 5  ? '#ffdf8a' :
      combo > 0   ? COLORS.amber :
      COLORS.amberDim;
  
    return (
      <div style={{
        textAlign: 'center',
        minHeight: 56,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        overflow: 'hidden', // prevents scale() animation from overflowing
        position: 'relative',
      }}>
        {combo > 0 ? (
          <>
            <div style={{
              fontSize: 32,
              fontWeight: 800,
              color: comboColor,
              letterSpacing: '0.02em',
              lineHeight: 1,
              textShadow: `0 0 ${8 + combo * 1.5}px ${comboColor}`,
              fontVariantNumeric: 'tabular-nums',
            }}>
              x{combo}
              {(() => {
                const bonus = Math.round(Math.min(combo * 0.02, 0.40) * 100);
                return (
                    <span style={{
                    fontSize: 10, color: comboColor, letterSpacing: '0.2em',
                    marginLeft: 12, opacity: 0.85, fontWeight: 600,
                    }}>
                    +{bonus}% VALUE{combo >= 20 ? ' [MAX]' : ''}
                    </span>
                );
              })()}
            </div>
            <div style={{
              width: 220, margin: '6px auto 0',
              height: 2, background: COLORS.surfaceHigh,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                width: `${comboPct}%`,
                height: '100%',
                background: comboColor,
                boxShadow: `0 0 ${3 + combo}px ${comboColor}`,
                transition: 'width 200ms linear',
              }} />
            </div>
            {combo >= 20 && (
              <div style={{
                marginTop: 4, fontSize: 10, color: COLORS.zeroMessage,
                fontWeight: 500, letterSpacing: '0.3em',
                textShadow: `0 0 10px ${COLORS.zeroMessage}`,
              }}>
                [ZERO &gt;&gt;] Push further.
              </div>
            )}
          </>
        ) : showShatter ? (
          <div
            key={shatterKey}
            style={{
              fontSize: 32, fontWeight: 800, color: COLORS.amberDim,
              letterSpacing: '0.02em',
              animation: 'shatter 500ms ease-out both',
              lineHeight: 1,
              transformOrigin: 'center',
            }}
          >
            x0
          </div>
        ) : (
          <div style={{ fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.3em', opacity: 0.6 }}>
            :: CHAIN_IDLE ::
          </div>
        )}
      </div>
    );
  }

// ─── PRIMARY ACTIONS ───────────────────────────────────────────────────────
function PrimaryActionGrid({ state, dispatchWithSound, isBlocked, combo }) {
  const heat = Math.round(state.heat);
  const ghostProtocol = state.upgrades?.ghostProtocol ?? 0;
  const hasNetScanner = (state.intelUpgrades?.netScanner ?? 0) >= 1;
  const siphonCost = (state.prestigePerks ?? {}).GHOST_STEP ? 8 : 10;

  const maxInv = 12 + (state.upgrades?.voidDrive ?? 0) * 2;
  const invFull = state.inventory.length >= maxInv;

  const actions = [
    {
      id: 'SIPHON',
      label: 'SIPHON',
      icon: Zap,
      cost: siphonCost,
      desc: 'Extract data from low-tier grid',
      color: COLORS.amber,
      primary: true,
      unlocked: true,
      chance: hasNetScanner ? Math.round(effectiveSuccessRate(0.70, state.level, 0.03, heat, ghostProtocol) * 100) : null,
      canRun: !isBlocked && state.stamina >= siphonCost && !invFull,
      lockReason: isBlocked ? 'LOCKED' : state.stamina < siphonCost ? 'LOW_STA' : invFull ? 'INV_FULL' : null,
    },
    {
      id: 'BREACH',
      label: 'BREACH',
      icon: Shield,
      cost: 25,
      desc: 'Crack premium vault — higher value',
      color: COLORS.red,
      unlocked: isUnlocked(state, 'breach'),
      chance: hasNetScanner ? Math.round(effectiveSuccessRate(0.55, state.level, 0.04, heat) * 100) : null,
      canRun: !isBlocked && state.stamina >= 25 && !invFull,
      lockReason: isBlocked ? 'LOCKED' : state.stamina < 25 ? 'LOW_STA' : invFull ? 'INV_FULL' : null,
    },
    {
      id: 'DEEP_SIPHON',
      label: 'DEEP_SIPHON',
      icon: Eye,
      cost: 15,
      desc: 'Penetrate secondary firewall',
      color: COLORS.cyan,
      unlocked: isUnlocked(state, 'deep_siphon'),
      chance: hasNetScanner ? Math.round(effectiveSuccessRate(0.65, state.level, 0.03, heat) * 100) : null,
      canRun: !isBlocked && state.stamina >= 15 && !invFull,
      lockReason: isBlocked ? 'LOCKED' : state.stamina < 15 ? 'LOW_STA' : invFull ? 'INV_FULL' : null,
    },
    {
      id: 'MAINFRAME_HACK',
      label: 'MAINFRAME',
      icon: Cpu,
      cost: 40,
      desc: 'The ultimate heist',
      color: COLORS.purple,
      unlocked: isUnlocked(state, 'mainframe'),
      chance: hasNetScanner ? Math.round(effectiveSuccessRate(0.35, state.level, 0.03, heat) * 100) : null,
      canRun: !isBlocked && state.stamina >= 40 && !invFull,
      lockReason: isBlocked ? 'LOCKED' : state.stamina < 40 ? 'LOW_STA' : invFull ? 'INV_FULL' : null,
    },
  ];

  const gridPulse = combo >= 10;

  return (
    <div style={{
      padding: gridPulse ? 4 : 0,
      animation: gridPulse ? 'borderPulseGold 1.6s ease-in-out infinite' : 'none',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {actions.filter(a => a.unlocked).map(action => (
          <ActionButton
            key={action.id}
            action={action}
            onClick={() => dispatchWithSound({ type: action.id })}
          />
        ))}
      </div>
    </div>
  );
}

function ActionButton({ action, onClick }) {
  const { icon: Icon } = action;
  const canRun = action.canRun;
  const [hover, setHover] = useState(false);

  const hovered = hover && canRun;
  const padding = action.primary ? '18px' : '14px';

  // Color logic — clean state table, no opacity stacking
  const textColor = hovered
    ? '#000'                              // hover on ready button: black
    : canRun
      ? action.color                      // ready: full color
      : COLORS.amberDim;                  // locked: 50% amber (readable)
  const borderColor = canRun ? action.color : COLORS.amberLine;
  const bg = hovered ? action.color : 'transparent';

  return (
    <button
      onClick={canRun ? onClick : undefined}
      disabled={!canRun}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: bg,
        color: textColor,
        border: `${action.primary ? 2 : 1}px ${canRun ? 'solid' : 'dashed'} ${borderColor}`,
        padding,
        textAlign: 'left',
        cursor: canRun ? 'pointer' : 'not-allowed',
        opacity: canRun ? 1 : 0.7,
        fontFamily: 'inherit',
        transition: 'background 120ms, color 120ms, box-shadow 120ms',
        position: 'relative',
        boxShadow: hovered ? `0 0 22px ${action.color}88` : 'none',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: action.primary ? 22 : 17,
          fontWeight: 800,
          letterSpacing: '0.08em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon size={action.primary ? 18 : 14} />
          {action.label}
        </span>
        {action.chance !== null && action.chance !== undefined && (
          <span style={{ fontSize: 10, letterSpacing: '0.15em', opacity: hovered ? 0.95 : 0.85 }}>
            {action.chance}%
          </span>
        )}
      </div>
      <div style={{
        fontSize: 10,
        marginTop: 6,
        opacity: hovered ? 0.95 : 0.8,
        letterSpacing: '0.05em',
      }}>
        {action.desc}
      </div>
      <div style={{
        marginTop: 10,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, letterSpacing: '0.2em',
        opacity: hovered ? 0.95 : 0.9,
        fontWeight: 600,
      }}>
        <span>COST: {action.cost} STA</span>
        <span>[{action.lockReason ?? 'READY'}]</span>
      </div>
    </button>
  );
}

// ─── SECONDARY ACTIONS ─────────────────────────────────────────────────────
function SecondaryActionGrid({ state, dispatchWithSound, isBlocked }) {
  const coldItems = state.inventory.filter(i => !i.isHot);
  const coldValue = coldItems.reduce((s, i) => s + i.gold, 0);
  const hotItems = state.inventory.filter(i => i.isHot);
  const coolTarget = hotItems.length > 0
    ? [...hotItems].sort((a, b) => (b.gold - a.gold) || (a.cooldownRemaining - b.cooldownRemaining))[0]
    : null;

  const dmUnlocked = isUnlocked(state, 'dark_market');
  const dmBusy = (state.darkMarketCooldown ?? 0) > 0;

  const dataChipCount = state.inventory.filter(i => i.id === 'DATA_CHIP').length;
  const barterReady = dataChipCount >= 10 && (state.barterCooldown ?? 0) === 0;

  const encKeys = state.encKeys ?? [];
  const ENC_IDS = ['KEY_ALPHA', 'KEY_BETA', 'KEY_GAMMA', 'KEY_DELTA', 'KEY_EPSILON'];
  const canDecrypt = ENC_IDS.every(k => encKeys.includes(k));

  const secondary = [
    {
      id: 'LAY_LOW',
      label: 'LAY_LOW',
      icon: Shield,
      color: state.layLowActive ? COLORS.green : COLORS.amber,
      unlocked: true,
      canRun: (state.bustedLockout ?? 0) === 0
            && ((state.layLowCooldown ?? 0) === 0 || state.raidActive),
      active: state.layLowActive,
      status: state.layLowActive
        ? `${state.layLowTimer}s ACTIVE`
        : (state.layLowCooldown ?? 0) > 0
          ? `CD ${state.layLowCooldown}s`
          : 'READY',
    },
    {
      id: 'SELL_COOLED_ITEMS',
      label: 'SELL_COLD',
      icon: Coins,
      color: COLORS.green,
      unlocked: true,
      canRun: coldItems.length > 0,
      status: coldItems.length > 0 ? `+${fmt(coldValue)} CR` : 'NO_COLD',
    },
    {
      id: 'MANUAL_COOL',
      label: 'COOL_DOWN',
      icon: Eye,
      color: COLORS.cyan,
      unlocked: isUnlocked(state, 'manual_cool'),
      canRun: !!coolTarget && state.stamina >= 5,
      status: coolTarget ? `-15 S · ${coolTarget.id}` : 'NO_TARGET',
      payload: { targetId: coolTarget?.instanceId },
    },
    {
      id: 'DARK_MARKET',
      label: 'DARK_MARKET',
      icon: Package,
      color: COLORS.purple,
      unlocked: dmUnlocked,
      canRun: dmUnlocked && !dmBusy && !isBlocked && state.inventory.length > 0,
      status: !dmUnlocked ? 'LOCKED'
            : dmBusy ? `CD ${Math.floor(state.darkMarketCooldown / 60)}m`
            : state.inventory.length === 0 ? 'NO_ITEMS'
            : `+${fmt(Math.floor(state.inventory.reduce((s, i) => s + i.gold, 0) * 0.6))} CR`,
    },
    {
      id: 'BARTER',
      label: 'BARTER',
      icon: Package,
      color: COLORS.purple,
      unlocked: isUnlocked(state, 'barter'),
      canRun: barterReady && !isBlocked,
      status: dataChipCount < 10 ? `${dataChipCount}/10 CHIPS` : barterReady ? '10 CHIPS → +1 REP' : 'CD',
    },
    {
      id: 'DECRYPT',
      label: 'DECRYPT',
      icon: Activity,
      color: COLORS.gold,
      unlocked: canDecrypt || encKeys.length > 0,
      canRun: canDecrypt,
      status: `${encKeys.length}/5 KEYS`,
    },
  ];

  const visible = secondary.filter(a => a.unlocked);
  if (visible.length === 0) return null;

  return (
    <Panel accent={COLORS.amberDim} title="SECONDARY_OPS" dense>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {visible.map(action => {
          const { icon: Icon } = action;
          return (
            <button
              key={action.id}
              onClick={action.canRun ? () => {
                if (action.payload) {
                  // For MANUAL_COOL we pass targetId directly as action
                  // (reducer receives action object with spread)
                  // But since original reducer uses action.type only for MANUAL_COOL,
                  // we dispatch a clean action:
                  dispatchWithSound({ type: action.id, ...action.payload });
                } else {
                  dispatchWithSound({ type: action.id });
                }
              } : undefined}
              disabled={!action.canRun}
              style={{
                background: action.active ? `${action.color}22` : 'transparent',
                border: `1px ${action.canRun ? 'solid' : 'dashed'} ${action.color}${action.canRun ? '' : '55'}`,
                color: action.canRun ? action.color : `${action.color}88`,
                padding: '8px 6px',
                fontSize: 9,
                fontFamily: 'inherit',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: action.canRun ? 'pointer' : 'not-allowed',
                opacity: action.canRun ? 1 : 0.55,
                textAlign: 'left',
                transition: 'all 120ms',
              }}
              onMouseEnter={(e) => {
                if (action.canRun) {
                  e.currentTarget.style.boxShadow = `0 0 12px ${action.color}66`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon size={10} />
                {action.label}
              </div>
              <div style={{
                fontSize: 8, marginTop: 4, opacity: 0.75,
                letterSpacing: '0.05em', fontWeight: 400,
                lineHeight: 1.3,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                }}>
                {action.status}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}