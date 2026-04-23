// Left sidebar: Dashboard with operative ID, vitals, grid status, flow rates.

import {
    Coins, Flame, Zap, Activity, ShieldOff, TrendingUp,
    Cpu, Users, Star,
  } from 'lucide-react';
  import { useState } from 'react';
  import { Panel, Row, Tag, DataBar, BBtn, MiniStat, fmt, COLORS } from '../design/primitives.jsx';
  import { isUnlocked, xpRequired  } from '../gameLogic.js';
  import { DISTRICTS as AETHERIA_DISTRICTS } from '../../CITY_MAP.js';
  import { getFlowRates, getBandwidth, getMapModifiers } from '../selectors.js';
  
  // Small helper to render an icon with consistent styling inside Row labels.
  function LabelWithIcon({ icon: Icon, children, color }) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Icon size={10} color={color ?? COLORS.amberDim} style={{ display: 'inline-block' }} />
        <span>{children}</span>
      </span>
    );
  }

  // ─── Operative ID card (collapsible, persists per session) ───────────
function OperativeIdCard({ prestige, level, districtName }) {
    const [collapsed, setCollapsed] = useState(() => {
      // Auto-collapse if viewport is short
      return typeof window !== 'undefined' && window.innerHeight < 800;
    });
  
    return (
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.amberLine}`,
          padding: collapsed ? '8px 12px' : 14,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'padding 200ms',
        }}
        onClick={() => setCollapsed(c => !c)}
      >
        {!collapsed && (
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.08,
            backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.amber} 0, ${COLORS.amber} 1px, transparent 1px, transparent 6px)`,
            pointerEvents: 'none',
          }} />
        )}
  
        <div style={{ position: 'relative' }}>
          {collapsed ? (
            // Compact layout: single row
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 10,
            }}>
              <span style={{
                color: COLORS.amber, fontWeight: 800,
                letterSpacing: '0.1em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                ID_{String(prestige + 1).padStart(2, '0')}
                <span style={{ color: COLORS.amberDim, marginLeft: 8 }}>
                  SPECTER-{level}
                </span>
              </span>
              <span style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.12em' }}>
                ▼
              </span>
            </div>
          ) : (
            // Expanded layout
            <>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.25em' }}>
                  OPERATIVE_ID
                </div>
                <span style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.12em' }}>
                  ▲
                </span>
              </div>
              <div style={{
                fontSize: 56, lineHeight: 1, fontWeight: 800, color: COLORS.amber,
                letterSpacing: '-0.02em', marginTop: 4,
                textShadow: `0 0 18px rgba(255,193,116,0.3)`,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(prestige + 1).padStart(2, '0')}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 10,
                fontSize: 9, letterSpacing: '0.2em',
              }}>
                <span style={{ color: COLORS.amberDim }}>CLASS</span>
                <span style={{ color: COLORS.amber }}>SPECTER-{level}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 4,
                fontSize: 9, letterSpacing: '0.2em',
              }}>
                <span style={{ color: COLORS.amberDim }}>SECTOR</span>
                <span style={{ color: COLORS.amber }}>{districtName}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  
  export function Sidebar({ state, dispatchWithSound }) {
    const flow = getFlowRates(state);
    const bw = getBandwidth(state);
    const mods = getMapModifiers(state);
  
    const maxStamina = 100 + (state.upgrades?.neuralBoost ?? 0) * 10;
  
    const xpNeeded = xpRequired(state.level);
  
    const heat = Math.round(state.heat);
    const heatColor =
      heat >= 81 ? COLORS.red :
      heat >= 61 ? COLORS.orange :
      heat >= 31 ? '#facc15' :
      COLORS.amber;
    const heatPulse = heat >= 80;
  
    const districtName = AETHERIA_DISTRICTS[state.district]?.name ?? 'UNKNOWN';
  
    return (
      <div style={{
        width: 260, minWidth: 260,
        background: COLORS.bg,
        borderRight: `1px solid ${COLORS.amberLine}`,
        height: '100%',
        overflowY: 'auto',
        padding: 14,
        display: 'flex', flexDirection: 'column', gap: 12,
        boxSizing: 'border-box',
      }}>
        {/* ─── LOGO ─────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: COLORS.amber }}>
              SHADOW_GUILD
            </div>
            <span style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.12em' }}>V1.0.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{
              width: 6, height: 6,
              background: COLORS.green,
              display: 'inline-block',
              boxShadow: `0 0 8px ${COLORS.green}`,
            }} />
            <span style={{ fontSize: 9, color: COLORS.green, letterSpacing: '0.2em' }} className="blink">
              TRANSMITTING
            </span>
            {(state.prestige ?? 0) > 0 && (
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Star size={10} color={COLORS.gold} />
                <Tag color={COLORS.gold} filled>P {state.prestige}</Tag>
              </span>
            )}
          </div>
        </div>
  
        {/* ─── OPERATIVE ID (collapsible) ───────────────── */}
        <OperativeIdCard
            prestige={state.prestige ?? 0}
            level={state.level}
            districtName={districtName}
        />
  
        {/* ─── VITALS ───────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.25em', marginBottom: 6 }}>
            :: VITALS
          </div>
  
          {/* Credits */}
          <div style={{ borderLeft: `3px solid ${COLORS.amber}`, paddingLeft: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Coins size={10} color={COLORS.amber} />
              CREDITS
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: COLORS.amber,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
            }}>
              {fmt(state.gold)} <span style={{ fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.2em' }}>CR</span>
            </div>
          </div>
  
          {/* REP */}
          {isUnlocked(state, 'rep') && (
            <div style={{ borderLeft: `3px solid ${COLORS.purple}`, paddingLeft: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldOff size={10} color={COLORS.purple} />
                REP
              </div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: COLORS.purple,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmt(state.reputation ?? 0)}
              </div>
            </div>
          )}
  
          {/* Heat — amber→red gradient */}
          <div style={{ marginBottom: 10 }}>
            <Row
              label={<LabelWithIcon icon={Flame} color={heatColor}>HEAT</LabelWithIcon>}
              value={`${heat}%`}
              color={heatColor}
            />
            <div style={{ marginTop: 4, animation: heatPulse ? 'pulseHeatNew 0.9s ease-in-out infinite' : 'none' }}>
              <DataBar
                value={heat}
                max={100}
                gradient="heat"
                glow={heatPulse}
                color={heatColor}
                height={4}
              />
            </div>
          </div>
  
          {/* Stamina */}
          <div style={{ marginBottom: 10 }}>
            <Row
              label={<LabelWithIcon icon={Zap} color={COLORS.amber}>STAMINA</LabelWithIcon>}
              value={`${Math.floor(state.stamina)}/${maxStamina}`}
            />
            <div style={{ marginTop: 4 }}>
              <DataBar value={state.stamina} max={maxStamina} color={COLORS.amber} height={4} />
            </div>
          </div>
  
          {/* XP */}
          <div style={{ marginBottom: 10 }}>
            <Row
              label={<LabelWithIcon icon={Activity} color={COLORS.purple}>LVL {state.level}</LabelWithIcon>}
              value={`${fmt(state.xp)}/${fmt(xpNeeded)}`}
              color={COLORS.purple}
            />
            <div style={{ marginTop: 4 }}>
              <DataBar value={state.xp} max={xpNeeded} color={COLORS.purple} height={4} />
            </div>
          </div>
        </div>
  
        {/* ─── GRID STATUS ──────────────────────────────── */}
        {isUnlocked(state, 'district') && (
          <Panel title="GRID_STATUS" accent={COLORS.cyan} dense>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 2 }}>
              <MiniStat label="BAND" value={`${bw.used}/${bw.max}`} unit="Hz" color={bw.isOverloaded ? COLORS.red : COLORS.cyan} />
              <MiniStat label="REV" value={`+${Math.round((mods.goldMult - 1) * 100)}`} unit="%" color={COLORS.green} />
              <MiniStat label="XP" value={`+${Math.round((mods.xpBoost ?? 0) * 100)}`} unit="%" color={COLORS.purple} />
            </div>
  
            {bw.isOverloaded && (
              <div style={{
                marginTop: 10, padding: '6px 8px',
                border: `1px solid ${COLORS.red}`,
                color: COLORS.red,
                fontSize: 9, letterSpacing: '0.15em', fontWeight: 700,
                background: 'rgba(239,68,68,0.05)',
              }}>
                [!] OVERLOAD: +{bw.overload} Hz
                <div style={{ fontSize: 8, color: COLORS.amberDim, marginTop: 3, letterSpacing: '0.1em', fontWeight: 400 }}>
                  HEAT_LEAK: +{bw.heatLeakPerSec}/s<br/>
                  DECAY_MULT: {bw.decayMultiplier}%
                </div>
              </div>
            )}
  
            {state.overclockActive && (
              <div style={{
                marginTop: 10, padding: '6px 8px',
                border: `1px solid ${COLORS.red}`,
                color: COLORS.red,
                fontSize: 9, letterSpacing: '0.2em', fontWeight: 700,
                animation: 'pulseHeatNew 1.1s ease-in-out infinite',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Flame size={10} color={COLORS.red} />
                OVERCLOCK_ACTIVE
              </div>
            )}
          </Panel>
        )}
  
        {/* ─── FLOW RATES ───────────────────────────────── */}
        {isUnlocked(state, 'agency') && (
        <Panel title="FLOW_RATES" accent={COLORS.amber} dense>
            <Row
            label={<LabelWithIcon icon={TrendingUp} color={COLORS.green}>CR/MIN</LabelWithIcon>}
            value={flow.cps > 0 ? `+${fmt(flow.cps * 60)}` : '—'}
            color={flow.cps > 0 ? COLORS.green : COLORS.amberDim}
            />
            <Row
            label={<LabelWithIcon icon={Flame} color={flow.heatPerMin >= 0 ? COLORS.red : COLORS.green}>HEAT/MIN</LabelWithIcon>}
            value={`${flow.heatPerMin >= 0 ? '+' : ''}${flow.heatPerMin.toFixed(1)}`}
            color={flow.heatPerMin >= 0 ? COLORS.red : COLORS.green}
            />
            <Row
            label={<LabelWithIcon icon={Zap} color={COLORS.amber}>STA/SEC</LabelWithIcon>}
            value={`+${flow.staRegen.toFixed(1)}`}
            color={COLORS.amber}
            />
        </Panel>
        )}
  
        {/* ─── OVERRIDE PROTOCOL ────────────────────────── */}
        {isUnlocked(state, 'manual_cool') && (
          <div style={{
            padding: 12,
            border: `1px solid ${state.overclockActive ? COLORS.red : COLORS.amberLine}`,
            background: state.overclockActive ? 'rgba(239,68,68,0.05)' : 'transparent',
          }}>
            <div style={{
              fontSize: 9,
              color: state.overclockActive ? COLORS.red : COLORS.amberDim,
              letterSpacing: '0.2em',
              marginBottom: 8,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Cpu size={10} color={state.overclockActive ? COLORS.red : COLORS.amberDim} />
              :: OVERRIDE_PROTOCOL
            </div>
            <div style={{ fontSize: 9, color: COLORS.amberDim, marginBottom: 10, lineHeight: 1.5 }}>
              Force inject +2 Bandwidth.<br/>
              <span style={{ color: COLORS.red, fontWeight: 700 }}>WARNING:</span> HEAT_LEAK +0.8/s · DECAY +300%
            </div>
            <BBtn
              variant={state.overclockActive ? 'danger' : 'default'}
              full
              onClick={() => dispatchWithSound({ type: 'TOGGLE_OVERCLOCK' })}
              disabled={!state.overclockActive && (state.overclockCooldown ?? 0) > 0}
            >
              {state.overclockActive
                ? '[!] CANCEL OVERRIDE'
                : (state.overclockCooldown ?? 0) > 0
                  ? `COOLING: ${Math.floor(state.overclockCooldown / 60)}m ${state.overclockCooldown % 60}s`
                  : 'INITIATE OVERRIDE'
              }
            </BBtn>
          </div>
        )}
  
        {/* ─── FOOTER ───────────────────────────────────── */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 8,
          fontSize: 8, color: COLORS.amberDim,
          letterSpacing: '0.2em', textAlign: 'center',
        }}>
          :: UPLINK_ENCRYPTED ::
        </div>
      </div>
    );
  }