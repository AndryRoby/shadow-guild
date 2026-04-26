// Left sidebar: Dashboard with operative ID, vitals, grid status, flow rates.

import {
  Coins, Flame, Zap, Activity, ShieldOff, TrendingUp,
  Cpu, Users, Star,
} from 'lucide-react';
import { useState } from 'react';
import { Panel, Row, Tag, DataBar, BBtn, MiniStat, fmt, COLORS } from '../design/primitives.jsx';
import { isUnlocked, xpRequired  } from '../gameLogic.js';
import { DISTRICTS as AETHERIA_DISTRICTS } from '../../CITY_MAP.js';
import { getFlowRates, getBandwidth, getMapModifiers, getCurrentObjective, getEventTimeline, getUIVisibility } from '../selectors.js';
import { NorthStar } from './NorthStar.jsx';
import { NodeDecayWarning } from './NodeDecayWarning.jsx';
import { ComboStateBadge } from './ComboStateBadge.jsx';
import { HexFeed } from './HexFeed.jsx';
import { NeuralLink } from './NeuralLink.jsx';
import { audioManager } from '../audio/AudioManager.js';

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
function OperativeIdCard({ prestige, level, districtName, runTime }) {
  const [collapsed, setCollapsed] = useState(true);

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
      onClick={() => {
        setCollapsed(c => !c);
        audioManager.tab(); // Pridaný zvuk
      }}
    >
      {!collapsed && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 60, height: 60,
          opacity: 0.2,
          pointerEvents: 'none',
          borderRight: `1px solid ${COLORS.amber}`,
          borderTop: `1px solid ${COLORS.amber}`,
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
              fontSize: 24, lineHeight: 1, fontWeight: 800, color: COLORS.amber,
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
            {runTime !== undefined && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 4,
                fontSize: 9, letterSpacing: '0.2em',
              }}>
                <span style={{ color: COLORS.amberDim }}>UPTIME</span>
                <span style={{ color: COLORS.amber, fontVariantNumeric: 'tabular-nums' }}>{runTime}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function fmtTime(sec) {
  sec = Math.floor(sec || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function Sidebar({ state, dispatchWithSound }) {
  const ui = getUIVisibility(state);
  const flow = getFlowRates(state);
  const objective = getCurrentObjective(state);
  const bw = getBandwidth(state);
  const mods = getMapModifiers(state);

  const maxStamina = 100 + (state.upgrades?.neuralBoost ?? 0) * 10;

  const xpNeeded = xpRequired(state.level);

  const heat = Math.round(state.heat ?? 0);
  const heatCriticalZone = heat >= 90;

  // Proxy resist chance (info display)
  const proxyResist = Math.min(80,
    (state.upgrades?.proxyServers ?? 0) * 10
    + (state.prestigePerks?.PROXY_OVERLOAD ? 20 : 0)
  );
  const heatColor =
    heat >= 81 ? COLORS.red :
    heat >= 61 ? COLORS.orange :
    heat >= 31 ? '#facc15' :
    COLORS.amber;
  const heatPulse = heat >= 80;
  const heatSpike = (state.heatSpikeTimer ?? 0) > 0;

  const districtName = AETHERIA_DISTRICTS[state.district]?.name ?? 'UNKNOWN';

  function SidebarTimeline({ state }) {
      const events = getEventTimeline(state);
      if (events.length === 0) return null;

      const fmtSec = (sec) => {
        if (sec <= 0) return '0s';
        if (sec < 60) return `${sec}s`;
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
      };

      return (
        <div style={{
          padding: '8px 10px',
          borderLeft: `3px solid ${COLORS.cyan}`,
          background: `${COLORS.cyan}0a`,
        }}>
          <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.25em', marginBottom: 4 }}>
            :: TIMELINE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.slice(0, 4).map((ev, i) => (
              <div
                key={`${ev.type}-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 9,
                  letterSpacing: '0.05em',
                  opacity: ev.hidden ? 0.5 : 1,
                }}
              >
                <span style={{ color: ev.color, fontSize: 10, minWidth: 10 }}>{ev.icon}</span>
                <span style={{
                  color: ev.color, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums', minWidth: 42,
                }}>
                 {ev.hidden ? '???' : fmtSec(ev.seconds)}
                </span>
                <span style={{
                  color: COLORS.amberDim,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {ev.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

  return (
    <div className="sg-sidebar" style={{
      width: 260, minWidth: 260,
      background: COLORS.bg,
      borderRight: `1px solid ${COLORS.amberLine}`,
      height: '100%',
      maxHeight: '100vh',
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxSizing: 'border-box',
    }}>
      {/* ─── NEURAL LINK :: STICKY TOP ───────────────────────── */}
        {/* Sticky so it stays visible even when sidebar scrolls. */}
        <div style={{
          position: 'sticky',
          top: -14,            // negate sidebar padding
          marginTop: -14,
          marginLeft: -14,
          marginRight: -14,
          padding: '14px 14px 0',
          background: COLORS.bg,
          zIndex: 5,
        }}>
          <NeuralLink
            lastMessage={state.zeroLastMessage}
            history={state.zeroHistory}
          />
        </div>

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
              ★
              <Tag color={COLORS.gold} filled>P {state.prestige}</Tag>
            </span>
          )}
        </div>
      </div>

      
      {/* ─── IDLE MODE BADGE ──────────────────────── */}
      {state.isIdle && (
        <div style={{
          padding: '6px 10px',
          border: `1px solid ${COLORS.amberDim}`,
          background: 'rgba(255,193,116,0.05)',
          fontSize: 9, letterSpacing: '0.25em',
          color: COLORS.amberDim, fontWeight: 700,
          textAlign: 'center',
        }}>
          :: IDLE_MODE · INCOME -40%
        </div>
      )}

      {/* ─── IDLE FOCUS BONUS ──────────────────────── */}
      {flow.idleFocusBonus > 1 && !state.isIdle && (
        <div style={{
          padding: '6px 10px',
          border: `1px solid ${COLORS.gold}`,
          background: `${COLORS.gold}15`,
          fontSize: 9, letterSpacing: '0.15em',
          color: COLORS.gold, fontWeight: 800,
          textAlign: 'center',
          boxShadow: `0 0 12px ${COLORS.gold}44`,
        }}>
          ◆ FOCUS · ×{flow.idleFocusBonus.toFixed(2)} INCOME · {flow.secSinceClick}s
        </div>
      )}

      {/* ─── TIMELINE ─────────────────────────────── */}
      {ui.eventTimeline && <SidebarTimeline state={state} />}

      {/* ─── NORTH STAR (endgame target, after first capture) ─── */}
      {ui.northStar && <NorthStar state={state} />}

      {/* ─── COMBO STATE (only when combo active) ─── */}
      <ComboStateBadge comboCount={state.comboCount ?? 0} />

      {/* ─── NODE DECAY WARNING (owned nodes losing stability) ─── */}
      <NodeDecayWarning state={state} />

      {/* ─── HUNTER TRACKER ────────────────────────── */}
      {ui.hunterTracker && ((state.hunterProgress ?? 0) > 0 || state.hunterActive) && (
        <div style={{
          padding: '8px 10px',
          borderLeft: `3px solid ${COLORS.red}`,
          background: `${COLORS.red}0a`,
          animation: state.hunterActive ? 'pulseHeatNew 1.3s ease-in-out infinite' : undefined,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: COLORS.red, letterSpacing: '0.25em', fontWeight: 800 }}>
              {state.silenceActive ? ':: SILENCE_ACTIVE' : state.hunterActive ? ':: HUNTER_DEPLOYED' : ':: HUNTER_INBOUND'}
            </span>
            {!state.hunterActive && (
              <span style={{ fontSize: 9, color: COLORS.red, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.1em' }}>
                {state.hunterProgress}/60
              </span>
            )}
          </div>
          {!state.hunterActive ? (
            <DataBar value={state.hunterProgress} max={60} color={COLORS.red} height={3} glow />
          ) : (() => {
            const hasScanner = (state.intelUpgrades?.netScanner ?? 0) >= 1;
            if (state.silenceActive && !hasScanner) {
              return (
                <div style={{ fontSize: 9, color: COLORS.red, fontStyle: 'italic', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                  Signal anomaly detected. Source: unknown.
                </div>
              );
            }
            return (
              <div style={{ fontSize: 9, color: COLORS.amber, letterSpacing: '0.05em', lineHeight: 1.4 }}>
                Deployed in {state.hunterLocation}. Drop heat below 60% to escape.
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── ACTIVE OBJECTIVE ─────────────────────── */}
      {ui.currentObjective && (
      <div style={{
        padding: '8px 10px',
        borderLeft: `3px solid ${COLORS.cyan}`,
        background: `${COLORS.cyan}0a`,
      }}>
        <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.25em', marginBottom: 3 }}>
          :: CURRENT_OBJECTIVE
        </div>
        <div style={{
          fontSize: 11, color: COLORS.cyan, fontWeight: 700,
          letterSpacing: '0.02em', lineHeight: 1.35,
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          <span style={{ color: COLORS.cyan, fontSize: 13 }}>{objective.icon}</span>
          <span>{objective.text}</span>
        </div>
        {objective.progress !== undefined && objective.progress > 0 && objective.progress < 1 && (
          <div style={{ marginTop: 6 }}>
            <DataBar value={objective.progress * 100} max={100} color={COLORS.cyan} height={2} />
          </div>
        )}
        {/* HexFeed integrácia */}
        <div style={{ marginTop: 8}}>
          <HexFeed lines={1} bytesPerLine={8} color={COLORS.cyan} interval={800} />
        </div>
      </div>
      )}

      {/* ─── OPERATIVE ID (collapsible) ───────────────── */}
      {ui.operativeId && (
      <OperativeIdCard
        prestige={state.prestige ?? 0}
        level={state.level ?? 1}
        districtName={districtName}
        runTime={fmtTime(state.runPlayTime)}
      />
      )}

      {/* ─── VITALS ───────────────────────────────────── */}
      {(ui.creditsRow || ui.heatRow || ui.staminaRow || ui.xpLvlRow) && (
      <div>
        <div style={{ fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.25em', marginBottom: 6 }}>
          :: VITALS
        </div>

        {/* Credits */}
        {ui.creditsRow && (
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
          {(state.peakGold ?? 0) > state.gold && (
            <div style={{
              fontSize: 8, color: COLORS.amberDim,
              letterSpacing: '0.15em', marginTop: 2,
              opacity: 0.6,
            }}>
              ★ PEAK {fmt(state.peakGold)}
            </div>
          )}
        </div>
        )}

        {/* REP */}
        {ui.repRow && isUnlocked(state, 'rep') && (
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
        {ui.heatRow && (
        <div style={{ marginBottom: 10 }}>
          <Row
            label={<LabelWithIcon icon={Flame} color={heatColor}>HEAT</LabelWithIcon>}
            value={
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5 }}>
                {heatSpike && (
                  <span className="blink" style={{ fontSize: 8, color: COLORS.red, letterSpacing: '0.15em', fontWeight: 800 }}>
                    ▲ SPIKE
                  </span>
                )}
                {heat >= 100 ? (
                  <span className="blink" style={{ fontSize: 10, color: COLORS.red, letterSpacing: '0.1em', fontWeight: 800 }}>
                    BUSTING · {proxyResist}% RESIST
                  </span>
                ) : heatCriticalZone ? (
                  <span className="blink" style={{ fontSize: 10, color: COLORS.red, letterSpacing: '0.1em', fontWeight: 800 }}>
                    {heat}% · DANGER
                  </span>
                ) : (
                  <span>{heat}%</span>
                )}
              </span>
            }
            color={heatColor}
          />
          <div
            key={heatSpike ? `spike-${state.heatSpikeTimer}` : 'calm'}
            className={heatSpike ? 'heat-flash' : ''}
            style={{ marginTop: 4, animation: heatPulse ? 'pulseHeatNew 0.9s ease-in-out infinite' : undefined }}
          >
            <DataBar
              value={heat}
              max={100}
              gradient="heat"
              glow={heatPulse || heatSpike}
              color={heatColor}
              height={heatSpike ? 6 : 4}
            />
          </div>
        </div>
        )}

        {/* Stamina */}
        {ui.staminaRow && (
        <div style={{ marginBottom: 10 }}>
          <Row
            label={<LabelWithIcon icon={Zap} color={COLORS.amber}>STAMINA</LabelWithIcon>}
            value={`${Math.floor(state.stamina)}/${maxStamina}`}
          />
          <div style={{ marginTop: 4 }}>
            <DataBar value={state.stamina} max={maxStamina} color={COLORS.amber} height={4} />
          </div>
        </div>
        )}

        {/* XP */}
        {ui.xpLvlRow && (
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
        )}
      </div>
      )}

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
          value={
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              {flow.cps > 0 ? `+${fmt(flow.cps * 60)}` : '—'}
              {flow.idleFocusBonus > 1 && (
                <span style={{ fontSize: 8, color: COLORS.gold, letterSpacing: '0.1em', fontWeight: 800 }}>
                  ×{flow.idleFocusBonus.toFixed(1)}
                </span>
              )}
            </span>
          }
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