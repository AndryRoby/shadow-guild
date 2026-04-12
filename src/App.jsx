import { useReducer, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap, Flame, Coins, TrendingUp, Package, Cpu,
  Activity, ChevronUp, Users, ShieldOff, Star,
} from 'lucide-react';
import {
  siphon, breach, deepSiphon, mainframeHack, layLow, sellCooledItems, darkMarket, barter, manualCool, decrypt,
  buyUpgrade, buyIntelUpgrade, hireRunner, setDistrict, warpTime, prestige, tick,
  xpRequired, heatStatus, effectiveSuccessRate, calculateOfflineProgress,
  UPGRADE_DEFS, INTEL_UPGRADE_DEFS, DISTRICTS, CHALLENGE_DEFS, ACHIEVEMENT_DEFS, PRESTIGE_PERK_DEFS,
  getUpgradeCost, getRunnerCost, isUnlocked, buyPrestigePerk, setProtocol, purgeLogs, setRunnerSpec,
  DEV_MODE, SAVE_KEY, exportSave, importSave, ITEM_FLAVOR, PROTOCOL_DEFS,
} from './gameLogic.js';

// maxInventory is always derived — never stored in state
function calcMaxInventory(upgrades) {
  return 12 + (upgrades?.voidDrive ?? 0) * 2;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const FRESH_STATE = {
  gold:               0,
  reputation:         0,
  heat:               0,
  stamina:            100,
  level:              1,
  xp:                 0,
  prestige:           0,
  prestigeMultiplier: 1.0,
  totalGoldEarned:    0,
  runGoldEarned:      0,
  inventory:          [],
  log:                [],
  lastTickTime:       Date.now(),
  offlineAccrualCap:  14400,
  layLowActive:       false,
  layLowTimer:        0,
  layLowCooldown:     0,
  bustedLockout:      0,
  feedback:           null,
  comboCount:         0,
  zeroMessages:       [],
  upgrades: {
    ghostProtocol: 0, neuralBoost: 0, signalDampener: 0,
    stimPack: 0, traceEraser: 0, iceBreaker: 0, darkChannel: 0,
    voidDrive: 0, proxyServers: 0, quantumEncryption: 0, autoFencer: 0, aiSubroutine: 0, hwOverclock: 0,
  },
  intelUpgrades:      { netScanner: 0, corpMole: 0, deepSource: 0, darkExchange: 0 },
  runners:            { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
  runnerTick:         { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
  autoFencerTick:     0,
  darkMarketCooldown: 0,
  district:           'neon_strip',
  heatSpikeTimer:     0,
  barterCooldown:     0,
  dailyChallenge:     null,
  dailyFeedback:      null,
  raidActive:         false,
  raidTimer:          0,
  nextRaidIn:         DEV_MODE ? 60 : 600,
  aiSubroutineTick:   0,
  encKeys:             [],
  bountyActive:        false,
  achievements:        {},
  siphonsWithoutBust:  0,
  everBustedThisRun:   false,
  achievementFeedback: null,
  prestigePerksUsed:   [],
  prestigePoints:      0,
  prestigePerks:       {},
  logBatch:            null,
  activeProtocol:      'NONE',
  systemScan:          { active: false, timer: 0, nextIn: DEV_MODE ? 45 : 1200 },
  runnerXp:            { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
  runnerSpec:          { streetRunner: null, dataThief: null, infiltrator: null, fixer: null, shadowBroker: null },
};

const DEV_START = { ...FRESH_STATE, gold: 50000, reputation: 50, level: 5, runGoldEarned: 50000, totalGoldEarned: 50000 };

function loadInitialState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...FRESH_STATE,
        ...parsed,
        feedback:      null,
        runGoldEarned:  parsed.runGoldEarned ?? parsed.totalGoldEarned ?? 0,
        zeroMessages:  parsed.zeroMessages ?? [],
        runners:       { ...FRESH_STATE.runners,    ...parsed.runners },
        runnerTick:    { ...FRESH_STATE.runnerTick, ...parsed.runnerTick },
        upgrades:      { ...FRESH_STATE.upgrades,   ...parsed.upgrades },
        intelUpgrades: { ...FRESH_STATE.intelUpgrades, ...parsed.intelUpgrades },
        runnerXp:      { ...FRESH_STATE.runnerXp,   ...parsed.runnerXp },
        runnerSpec:    { ...FRESH_STATE.runnerSpec,  ...parsed.runnerSpec },
        systemScan:    parsed.systemScan ?? FRESH_STATE.systemScan,
      };
    }
  } catch { /* corrupt */ }
  return DEV_MODE ? DEV_START : FRESH_STATE;
}

const INITIAL_STATE = loadInitialState();

// ── REDUCER ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'SIPHON':            return siphon(state);
    case 'BREACH':            return breach(state);
    case 'DEEP_SIPHON':       return deepSiphon(state);
    case 'LAY_LOW':           return layLow(state);
    case 'SELL_COOLED_ITEMS': return sellCooledItems(state);
    case 'DARK_MARKET':       return darkMarket(state);
    case 'BARTER':            return barter(state);
    case 'MANUAL_COOL':       return manualCool(state);
    case 'DECRYPT':           return decrypt(state);
    case 'BUY_UPGRADE':       return buyUpgrade(state, action.key);
    case 'HIRE_RUNNER':       return hireRunner(state, action.runnerType);
    case 'SET_DISTRICT':      return setDistrict(state, action.district);
    case 'WARP_TIME':         return warpTime(state);
    case 'PRESTIGE':          return prestige(state);
    case 'BUY_PRESTIGE_PERK': return buyPrestigePerk(state, action.perkId);
    case 'SET_PROTOCOL':      return setProtocol(state, action.protocol);
    case 'PURGE_LOGS':        return purgeLogs(state);
    case 'SET_RUNNER_SPEC':   return setRunnerSpec(state, action.runnerType, action.spec);
    case 'APPLY_OFFLINE': {
      const { earnedGold, heatAfter, elapsed } = action.payload;
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      return {
        ...state,
        gold:            state.gold + earnedGold,
        totalGoldEarned: (state.totalGoldEarned ?? 0) + earnedGold,
        runGoldEarned:   (state.runGoldEarned   ?? 0) + earnedGold,
        heat:            heatAfter,
        lastTickTime:    Date.now(),
        log: [`[${t}] :: OFFLINE +${Math.floor(elapsed)}s :: RUNNERS +${earnedGold.toLocaleString()} CR`, ...state.log].slice(0, 50),
      };
    }
    case 'MAINFRAME_HACK':    return mainframeHack(state);
    case 'BUY_INTEL_UPGRADE': return buyIntelUpgrade(state, action.key);
    case 'LOAD_SAVE': {
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      return {
        ...FRESH_STATE, ...action.payload, feedback: null,
        runGoldEarned:  action.payload.runGoldEarned ?? action.payload.totalGoldEarned ?? 0,
        runners:       { ...FRESH_STATE.runners,       ...action.payload.runners },
        runnerTick:    { ...FRESH_STATE.runnerTick,    ...action.payload.runnerTick },
        upgrades:      { ...FRESH_STATE.upgrades,      ...action.payload.upgrades },
        intelUpgrades: { ...FRESH_STATE.intelUpgrades, ...action.payload.intelUpgrades },
        log: [`[${t}] :: SAVE RESTORED :: ${action.ts}`, ...(action.payload.log ?? [])].slice(0, 50),
      };
    }
    case 'HARD_RESET': {
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      return { ...FRESH_STATE, log: [`[${t}] :: SYSTEM RESET`] };
    }
    case 'TICK': return tick(state);
    default:     return state;
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fmtCooldown(seconds) {
  if (seconds <= 0) return 'COLD';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── UI COMPONENTS ─────────────────────────────────────────────────────────────

function Icon({ component: C, size = 11, color = 'var(--muted)', style: extra }) {
  return (
    <C size={size} color={color}
       style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, ...extra }} />
  );
}

function Bar({ pct, color = 'var(--amber)' }) {
  return (
    <div style={S.track}>
      <div style={{ ...S.fill, width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1,
      background:    active ? 'var(--amber)' : 'var(--surface-high)',
      color:         active ? 'var(--bg)'    : 'var(--muted)',
      border:        'none',
      fontFamily:    '"JetBrains Mono", monospace',
      fontSize:      10,
      letterSpacing: '0.12rem',
      padding:       '8px 0',
      cursor:        'pointer',
      fontWeight:    active ? 700 : 400,
    }}>
      {label}
    </button>
  );
}

function ProtoBtn({ onClick, disabled, active, children }) {
  const interactive = !disabled && !active;
  return (
    <button
      onClick={interactive ? onClick : undefined}
      style={{
        ...S.btn,
        ...(active  ? { background: 'var(--amber)', color: 'var(--bg)' } : {}),
        ...(disabled && !active ? { opacity: 0.35, cursor: 'not-allowed', borderColor: 'var(--muted)' } : {}),
      }}
      onMouseEnter={e => { if (interactive) { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'var(--bg)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(255,193,116,0.45)'; } }}
      onMouseLeave={e => { if (interactive) { e.currentTarget.style.background = 'var(--surface-high)'; e.currentTarget.style.color = 'var(--amber)'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      {children}
    </button>
  );
}

function BuyBtn({ canAfford, maxed, onClick, label = 'BUY' }) {
  return (
    <button
      onClick={canAfford && !maxed ? onClick : undefined}
      style={{
        background:    'transparent',
        border:        `1px solid ${maxed ? '#22c55e' : canAfford ? 'var(--amber)' : 'var(--muted)'}`,
        color:         maxed ? '#22c55e' : canAfford ? 'var(--amber)' : 'var(--muted)',
        fontFamily:    '"JetBrains Mono", monospace',
        fontSize:      9,
        letterSpacing: '0.1rem',
        padding:       '5px 12px',
        cursor:        canAfford && !maxed ? 'pointer' : 'not-allowed',
        opacity:       canAfford || maxed ? 1 : 0.4,
      }}
      onMouseEnter={e => { if (canAfford && !maxed) { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'var(--bg)'; } }}
      onMouseLeave={e => { if (canAfford && !maxed) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--amber)'; } }}
    >
      {maxed ? 'MAXED' : label}
    </button>
  );
}

function UpgradeCard({ def, level, gold, dispatch }) {
  const maxed = level >= def.max;
  const cost  = maxed ? 0 : getUpgradeCost(def.baseCost, level);
  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07rem' }}>
          <Icon component={ChevronUp} size={10} color={maxed ? '#22c55e' : 'var(--amber)'} />
          {def.label}
        </span>
        <span style={{ fontSize: 10, color: maxed ? '#22c55e' : 'var(--muted)' }}>
          {maxed ? 'MAX' : `LVL ${level} / ${def.max}`}
        </span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', margin: '5px 0 8px' }}>{def.effect}</div>
      {!maxed && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: gold >= cost ? 'var(--amber)' : '#ef4444' }}>
            {cost.toLocaleString()} CR
          </span>
          <BuyBtn canAfford={gold >= cost} maxed={false}
            onClick={() => dispatch({ type: 'BUY_UPGRADE', key: def.key })} />
        </div>
      )}
    </div>
  );
}

function RunnerCard({ runnerType, label, count, gold, level, unlockLevel, requiresPrestige, prestige, baseCost, cycleSeconds, crPerRunner, heatPerRunner, runnerXp, runnerSpec, dispatch }) {
  const locked       = level < unlockLevel || prestige < requiresPrestige;
  const lockReason   = prestige < requiresPrestige ? `[PRESTIGE ${requiresPrestige}]` : `[LVL ${unlockLevel}]`;
  const maxed        = count >= 5;
  const cost         = getRunnerCost(baseCost, count);
  const canAfford    = gold >= cost;
  const incomePerMin = cycleSeconds > 0 ? Math.round((count * crPerRunner) / (cycleSeconds / 60)) : 0;
  const xp           = runnerXp ?? 0;
  const spec         = runnerSpec ?? null;
  const specColor    = spec === 'SHADOW' ? '#22c55e' : spec === 'GREEDY' ? '#ffd700' : null;

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07rem' }}>
          <Icon component={Users} size={10} color={locked ? 'var(--muted)' : 'var(--amber)'} />
          {label}
          {spec && spec !== 'PENDING' && (
            <span style={{ marginLeft: 6, fontSize: 9, color: specColor, letterSpacing: '0.06rem' }}>[{spec}]</span>
          )}
        </span>
        <span style={{ fontSize: 10, color: locked ? '#ef4444' : maxed ? '#22c55e' : 'var(--muted)' }}>
          {locked ? lockReason : `${count} / 5`}
          {maxed && <span style={{ marginLeft: 6, color: '#ffe066', fontSize: 9, letterSpacing: '0.08rem' }}>SYNERGY</span>}
        </span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', margin: '5px 0 4px' }}>
        +{crPerRunner} CR / {cycleSeconds}s · +{heatPerRunner} HEAT / runner / cycle
        {count > 0 && <span style={{ color: 'var(--amber)', marginLeft: 6 }}>→ ~{incomePerMin} CR/min</span>}
      </div>
      {count > 0 && !spec && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--muted)', marginBottom: 2 }}>
            <span>SPEC XP</span>
            <span style={{ color: xp >= 100 ? '#ffd700' : 'var(--muted)' }}>{Math.min(xp, 100)}/100</span>
          </div>
          <div style={{ width: '100%', height: 2, background: 'var(--bg)' }}>
            <div style={{ height: '100%', width: `${Math.min(xp, 100)}%`, background: xp >= 100 ? '#ffd700' : '#22c55e', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {locked ? (
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>LOCKED — REACH {lockReason}</span>
      ) : maxed ? (
        <span style={{ fontSize: 10, color: '#22c55e' }}>CAP REACHED (5/5)</span>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: canAfford ? 'var(--amber)' : '#ef4444' }}>
            {cost.toLocaleString()} CR
          </span>
          <BuyBtn canAfford={canAfford} maxed={false} label="HIRE"
            onClick={() => dispatch({ type: 'HIRE_RUNNER', runnerType })} />
        </div>
      )}
    </div>
  );
}

// ── OFFLINE POPUP ──────────────────────────────────────────────────────────────

function OfflinePopup({ report, onDismiss }) {
  if (!report) return null;
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface-low)',
        border: '1px solid var(--amber)',
        padding: '28px 32px',
        minWidth: 320, maxWidth: 420,
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14rem', marginBottom: 16 }}>
          :: SHADOW_GUILD — RECONNECTING
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08rem', marginBottom: 18 }}>
          WELCOME BACK, OPERATIVE
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--muted)' }}>TIME OFFLINE</span>
          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{fmtElapsed(report.elapsed)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--muted)' }}>RUNNERS EARNED</span>
          <span style={{ color: report.earnedGold > 0 ? '#22c55e' : 'var(--muted)', fontWeight: 700 }}>
            {report.earnedGold > 0 ? `+${report.earnedGold.toLocaleString()} CR` : 'NONE'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontSize: 12 }}>
          <span style={{ color: 'var(--muted)' }}>HEAT DECAYED</span>
          <span style={{ color: (report.heatDecayed ?? 0) > 0 ? '#22c55e' : 'var(--muted)', fontWeight: 700 }}>
            {(report.heatDecayed ?? 0) > 0 ? `-${report.heatDecayed}%` : '—'}
          </span>
        </div>

        <div style={{ fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 18, borderTop: '1px solid var(--surface-high)', paddingTop: 12 }}>
          [ZERO &gt;&gt;] The city didn't stop while you were gone.
        </div>

        <button onClick={onDismiss} style={{
          ...S.settingsBtn, display: 'block', width: '100%',
          background: 'var(--amber)', color: 'var(--bg)', fontWeight: 700, padding: '10px 0', textAlign: 'center',
          letterSpacing: '0.1rem', fontSize: 11,
        }}>
          RESUME OPERATIONS
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch]   = useReducer(reducer, INITIAL_STATE);
  const [activeTab,         setActiveTab]      = useState('OPERATIONS');
  const [importInput,       setImportInput]    = useState('');
  const [importError,       setImportError]    = useState('');
  const [resetConfirm,      setResetConfirm]   = useState(false);
  const [exportString,      setExportString]   = useState('');
  const [offlineReport,     setOfflineReport]  = useState(null);
  const [inventorySort,     setInventorySort]  = useState('TIME');
  const exportRef = useRef(null);

  const lastFeedbackTs = useRef(null);
  const prevGold       = useRef(0);
  const prevRep        = useRef(0);

  // ── visual effect state ────────────────────────────────────────────────────
  const [overlays,      setOverlays]      = useState([]);
  const [shaking,       setShaking]       = useState(false);
  const [bustedFlash,   setBustedFlash]   = useState(false);
  const [goldPulseKey,  setGoldPulseKey]  = useState(0);
  const [repPulseKey,   setRepPulseKey]   = useState(0);
  const [glitchedEntry, setGlitchedEntry] = useState(null);
  const [mobileTab,    setMobileTab]    = useState('OPS');
  const [windowWidth,  setWindowWidth]  = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [newestLogKey, setNewestLogKey] = useState(0);
  const [logGlitch,    setLogGlitch]    = useState(false);
  const [specModal,    setSpecModal]    = useState(null);   // runnerType key awaiting choice
  const [scanBtnPos,   setScanBtnPos]   = useState({ x: 35, y: 40 });
  const prevLogLen      = useRef(0);
  const logScrollRef    = useRef(null);
  const prevZeroCount   = useRef(0);

  const logRef = useRef(state.log);
  logRef.current = state.log;

  // ── offline progress on mount ──────────────────────────────────────────────
  useEffect(() => {
    const report = calculateOfflineProgress(INITIAL_STATE, Date.now());
    if (report) {
      dispatch({ type: 'APPLY_OFFLINE', payload: report });
      setOfflineReport(report);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── single game tick ───────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []);

  // ── auto-save every 30s ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* quota */ }
    }, 30000);
    return () => clearInterval(id);
  }, [state]);

  // ── feedback → visual effects ──────────────────────────────────────────────
  useEffect(() => {
    if (!state.feedback) return;
    if (state.feedback.ts === lastFeedbackTs.current) return;
    lastFeedbackTs.current = state.feedback.ts;
    const { type, gold, item, label, critical, ts } = state.feedback;
    setOverlays(prev => [...prev, { id: ts, type, gold, item, label, critical }]);
    setTimeout(() => setOverlays(prev => prev.filter(o => o.id !== ts)), critical ? 2000 : 1500);
    if (type === 'FAIL' || type === 'BUSTED') setShaking(true);
    if (type === 'BUSTED') {
      setBustedFlash(true);
      setTimeout(() => setBustedFlash(false), 3000);
    }
  }, [state.feedback]);

  // ── daily challenge complete overlay ──────────────────────────────────────
  const lastDailyTs = useRef(null);
  useEffect(() => {
    if (!state.dailyFeedback) return;
    if (state.dailyFeedback.ts === lastDailyTs.current) return;
    lastDailyTs.current = state.dailyFeedback.ts;
    const id = state.dailyFeedback.ts;
    setOverlays(prev => [...prev, { id, type: 'DAILY_COMPLETE' }]);
    setTimeout(() => setOverlays(prev => prev.filter(o => o.id !== id)), 2500);
  }, [state.dailyFeedback]);

  // ── achievement overlay ────────────────────────────────────────────────────
  const lastAchievementTs = useRef(null);
  useEffect(() => {
    if (!state.achievementFeedback) return;
    if (state.achievementFeedback.ts === lastAchievementTs.current) return;
    lastAchievementTs.current = state.achievementFeedback.ts;
    const { id, ts } = state.achievementFeedback;
    setOverlays(prev => [...prev, { id: ts, type: 'ACHIEVEMENT', achievementId: id }]);
    setTimeout(() => setOverlays(prev => prev.filter(o => o.id !== ts)), 3500);
  }, [state.achievementFeedback]);

  // ── gold pulse ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.gold > prevGold.current) setGoldPulseKey(k => k + 1);
    prevGold.current = state.gold;
  }, [state.gold]);

  // ── rep pulse ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.reputation > prevRep.current) setRepPulseKey(k => k + 1);
    prevRep.current = state.reputation;
  }, [state.reputation]);

  // ── window resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── typewriter: track newest log entry ─────────────────────────────────────
  useEffect(() => {
    if (state.log.length > prevLogLen.current) setNewestLogKey(k => k + 1);
    prevLogLen.current = state.log.length;
  }, [state.log.length]);

  // auto-scroll disabled: newest entries render at top, no scroll needed

  // ── glitch log container when a ZERO message arrives ──────────────────────
  useEffect(() => {
    const zeroCount = state.log.filter(e => e.includes('[ZERO >>]')).length;
    if (zeroCount > prevZeroCount.current) {
      setLogGlitch(true);
      setTimeout(() => setLogGlitch(false), 600);
    }
    prevZeroCount.current = zeroCount;
  }, [state.log.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── runner spec modal: open when any runner hits PENDING ──────────────────
  useEffect(() => {
    if (specModal) return; // already open
    const runnerSpec = state.runnerSpec ?? {};
    const pending = Object.keys(runnerSpec).find(k => runnerSpec[k] === 'PENDING');
    if (pending) setSpecModal(pending);
  }, [state.runnerSpec]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── randomize PURGE button position when scan activates ───────────────────
  const prevScanActive = useRef(false);
  useEffect(() => {
    const active = state.systemScan?.active ?? false;
    if (active && !prevScanActive.current) {
      setScanBtnPos({ x: 10 + Math.floor(Math.random() * 55), y: 20 + Math.floor(Math.random() * 45) });
    }
    prevScanActive.current = active;
  }, [state.systemScan?.active]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── heat glitch (>= 95): corrupt a random log entry briefly ───────────────
  useEffect(() => {
    if (state.heat < 95) { setGlitchedEntry(null); return; }
    const id = setInterval(() => {
      const log = logRef.current;
      if (log.length === 0) return;
      const idx = Math.floor(Math.random() * Math.min(log.length, 5));
      setGlitchedEntry(idx);
      setTimeout(() => setGlitchedEntry(null), 200);
    }, 3000);
    return () => clearInterval(id);
  }, [state.heat >= 95]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived ────────────────────────────────────────────────────────────────
  const effectiveMaxStamina = 100 + (state.upgrades.neuralBoost ?? 0) * 10;
  const maxInventory = calcMaxInventory(state.upgrades);
  const xpNeeded    = xpRequired(state.level);
  const xpPct       = (state.xp / xpNeeded) * 100;
  const staminaPct  = (state.stamina / effectiveMaxStamina) * 100;
  const heatRound   = Math.round(state.heat);
  const heatStat    = heatStatus(heatRound);
  const invFull     = state.inventory.length >= maxInventory;
  const isBlocked   = state.bustedLockout > 0 || state.layLowActive;

  const coldItems   = state.inventory.filter(i => !i.isHot);
  const coldCount   = coldItems.length;
  const coldValue   = coldItems.reduce((s, i) => s + i.gold, 0);
  const allValue    = Math.floor(state.inventory.reduce((s, i) => s + i.gold, 0) * 0.6);

  const dmLocked    = state.level < 4 || state.reputation < 50;
  const dmBusy      = state.darkMarketCooldown > 0;
  const dmDisabled  = isBlocked || dmLocked || dmBusy || state.inventory.length === 0;

  const runGoldEarned   = state.runGoldEarned ?? 0;
  const canPrestige     = state.level >= 10 && runGoldEarned >= 100000;
  const prestigePoints   = state.prestigePoints ?? 0;
  const prestigePerks    = state.prestigePerks ?? {};
  const activeProtocol   = state.activeProtocol ?? 'NONE';
  const activeProtoDef   = PROTOCOL_DEFS[activeProtocol] ?? null;
  const siphonCost      = prestigePerks.GHOST_STEP ? 8 : 10;
  const eyeReveal       = !!prestigePerks.EYE_REVEAL;

  const srCycle = DEV_MODE ? 5  : 30;
  const dtCycle = DEV_MODE ? 10 : 120;
  const ifCycle = DEV_MODE ? 15 : 900;
  const fxCycle = DEV_MODE ? 20 : 3600;
  const sbCycle = DEV_MODE ? 30 : 7200;

  const hasNetScanner = (state.intelUpgrades?.netScanner ?? 0) >= 1;
  const heat = Math.round(state.heat);
  const siphonChance     = hasNetScanner ? Math.round(effectiveSuccessRate(0.70, state.level, 0.03, heat, state.upgrades.ghostProtocol ?? 0) * 100) : null;
  const breachChance     = hasNetScanner ? Math.round(effectiveSuccessRate(0.55, state.level, 0.04, heat) * 100) : null;
  const deepSiphonChance = hasNetScanner ? Math.round(effectiveSuccessRate(0.65, state.level, 0.03, heat) * 100) : null;
  const mainframeChance  = hasNetScanner ? Math.round(effectiveSuccessRate(0.35, state.level, 0.03, heat) * 100) : null;

  const heatColor =
    heatRound >= 81 ? '#ef4444' :
    heatRound >= 61 ? '#f97316' :
    heatRound >= 31 ? '#eab308' : 'var(--amber)';

  const comboCount  = state.comboCount ?? 0;
  const comboPct    = Math.min(comboCount * 0.01, 0.20);
  const comboHigh   = comboCount >= 10;

  const heatGlitchClass = heatRound >= 95 ? 'heat-extreme' : heatRound >= 80 ? 'heat-critical' : '';
  const heatDangerClass = heatRound >= 90 ? 'heat-danger' : '';
  const isMobile   = windowWidth < 768;
  const heatFilter = heatRound >= 95 ? 'hue-rotate(8deg) saturate(1.8)' : 'none';
  const scanActive  = state.systemScan?.active ?? false;
  const scanTimer   = state.systemScan?.timer ?? 0;

  // daily challenge
  const dc             = state.dailyChallenge;
  const dcDef          = dc ? CHALLENGE_DEFS.find(d => d.type === dc.type) : null;
  const dcPct          = dc ? Math.min(100, (dc.current / dc.target) * 100) : 0;

  // barter
  const dataChipCount  = state.inventory.filter(i => i.id === 'DATA_CHIP').length;
  const barterReady    = dataChipCount >= 10 && (state.barterCooldown ?? 0) === 0;
  const barterDisabled = (state.barterCooldown ?? 0) > 0 || dataChipCount < 10 || isBlocked;

  // encryption keys
  const ENC_KEY_IDS  = ['KEY_ALPHA', 'KEY_BETA', 'KEY_GAMMA', 'KEY_DELTA', 'KEY_EPSILON'];
  const encKeys      = state.encKeys ?? [];
  const canDecrypt   = ENC_KEY_IDS.every(k => encKeys.includes(k));

  // AI subroutine countdown
  const aiCycleSecs    = DEV_MODE ? 30 : 3600;
  const aiRemaining    = aiCycleSecs - (state.aiSubroutineTick ?? 0);

  // manual cool target
  const hotItems       = state.inventory.filter(i => i.isHot);
  const coolTarget     = hotItems.length > 0
    ? hotItems.reduce((a, b) => a.cooldownRemaining > b.cooldownRemaining ? a : b)
    : null;

  // sorted inventory (display only — does not mutate state)
  const SORT_MODES = ['TIME', 'VALUE', 'HOT/COLD'];
  const sortedInventory = [...state.inventory].sort((a, b) => {
    if (inventorySort === 'VALUE')    return b.gold - a.gold;
    if (inventorySort === 'HOT/COLD') {
      if (a.isHot !== b.isHot) return a.isHot ? 1 : -1; // cold first
      return a.cooldownRemaining - b.cooldownRemaining;
    }
    // TIME: shortest cooldown first (closest to cold), cold items last
    if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
    return a.cooldownRemaining - b.cooldownRemaining;
  });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...S.root, filter: heatFilter }} className={`${heatGlitchClass} ${heatDangerClass}`.trim()}>

      {/* ── SCANLINE OVERLAY ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
        pointerEvents: 'none',
      }} />

      {/* ── HEAT TINT (heat > 80) ── */}
      {heatRound > 80 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2,
          background: `rgba(239,68,68,${Math.min(0.12, (heatRound - 80) * 0.006)})`,
          pointerEvents: 'none', transition: 'background 0.5s',
        }} />
      )}

      {/* ── BUSTED FLASH — rendered via portal, no parent clipping ── */}
      {bustedFlash && createPortal(
	        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'none',
            background: 'rgba(239,68,68,0.85)', // Trochu som ubral opacitu, aby to viac "glitchovalo"
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div style={{
            ...S.bustedText,
            animation: 'bustedIn 3s ease forwards', // Animácia len na texte
          }}>
            !! SYSTEM COMPROMISED<br />BUSTED !!
          </div>
        </div>,
        document.body
      )}

      {/* ── RAID BANNER ── */}
      {state.raidActive && createPortal(
        <div className="raid-blink" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
          background: '#450a0a', borderBottom: '2px solid #ef4444',
          padding: '7px 16px', display: 'flex', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
            color: '#fca5a5', letterSpacing: '0.12rem', fontWeight: 700,
          }}>
            !! POLICE RAID :: LAY LOW IN {state.raidTimer}s OR LOSE 30% CREDITS !!
          </span>
        </div>,
        document.body
      )}

      {/* ── SYSTEM SCAN OVERLAY ── */}
      {scanActive && createPortal(
        <>
          {/* Full-screen red pulse */}
          <div className="scan-alert" style={{
            position: 'fixed', inset: 0, zIndex: 9994, pointerEvents: 'none',
          }} />
          {/* Top warning banner */}
          <div style={{
            position: 'fixed', top: state.raidActive ? 34 : 0, left: 0, right: 0, zIndex: 9995,
            background: '#1a0505', borderBottom: '2px solid #ef4444',
            padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fca5a5', letterSpacing: '0.12rem', fontWeight: 700 }}>
              !! SYSTEM_SCAN IN PROGRESS
            </span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: '#ef4444', fontWeight: 700 }}>
              {scanTimer}s
            </span>
          </div>
          {/* Randomly positioned PURGE button */}
          <button
            onClick={() => dispatch({ type: 'PURGE_LOGS' })}
            style={{
              position: 'fixed',
              left: `${scanBtnPos.x}%`, top: `${scanBtnPos.y}%`,
              zIndex: 9996,
              background: '#0a0a0a', border: '2px solid #ef4444',
              color: '#ef4444', fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11, letterSpacing: '0.12rem', fontWeight: 700,
              padding: '9px 18px', cursor: 'pointer',
              boxShadow: '0 0 16px rgba(239,68,68,0.8), 0 0 32px rgba(239,68,68,0.4)',
              animation: 'raidBlink 0.9s ease infinite',
            }}
          >
            PURGE_LOCAL_LOGS
          </button>
        </>,
        document.body
      )}

      {/* ── OFFLINE POPUP ── */}
      <OfflinePopup
        report={offlineReport}
        onDismiss={() => setOfflineReport(null)}
      />

      {/* ── RUNNER SPEC MODAL ── */}
      {specModal && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9993,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface-low)', border: '1px solid var(--amber)',
            padding: '28px 32px', minWidth: 320, maxWidth: 420,
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14rem', marginBottom: 10 }}>
              :: RUNNER SPECIALIZATION
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08rem', marginBottom: 18 }}>
              {specModal.toUpperCase().replace('RUNNER','_RUNNER').replace('BROKER','_BROKER')} — LEVEL UP
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>
              Choose a permanent specialization for this runner type.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { dispatch({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'SHADOW' }); setSpecModal(null); }}
                style={{
                  flex: 1, background: 'transparent', border: '1px solid #22c55e', color: '#22c55e',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.1rem',
                  padding: '12px 0', cursor: 'pointer', fontWeight: 700,
                }}
              >
                SHADOW
                <span style={{ display: 'block', fontSize: 9, fontWeight: 400, marginTop: 6, opacity: 0.8 }}>
                  -50% Heat per cycle
                </span>
              </button>
              <button
                onClick={() => { dispatch({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'GREEDY' }); setSpecModal(null); }}
                style={{
                  flex: 1, background: 'transparent', border: '1px solid #ffd700', color: '#ffd700',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.1rem',
                  padding: '12px 0', cursor: 'pointer', fontWeight: 700,
                }}
              >
                GREEDY
                <span style={{ display: 'block', fontSize: 9, fontWeight: 400, marginTop: 6, opacity: 0.8 }}>
                  +50% Gold per cycle
                </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── FLOATING OVERLAYS ── */}
      {createPortal(
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          {overlays.map(o => (
            <div key={o.id} style={{
              position: 'absolute', top: o.critical ? '30%' : '36%', left: '74%',
              animation: `floatUp ${o.critical ? '2s' : '1.5s'} ease forwards`,
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              fontSize: o.type === 'BUSTED' ? 0 : o.critical ? 20 : o.type === 'DAILY_COMPLETE' ? 13 : o.type === 'ACHIEVEMENT' ? 12 : 14,
              letterSpacing: '0.06rem', whiteSpace: 'nowrap',
              color:
                o.critical                  ? '#ffe066' :
                o.type === 'SUCCESS'        ? 'var(--amber)' :
                o.type === 'UPGRADE'        ? '#22c55e' :
                o.type === 'DAILY_COMPLETE' ? '#22c55e' :
                o.type === 'ACHIEVEMENT'    ? 'var(--amber)' : '#ef4444',
              textShadow:
                o.critical                  ? '0 0 20px #ffe066, 0 0 40px rgba(255,224,102,0.6)' :
                o.type === 'SUCCESS'        ? '0 0 14px rgba(255,193,116,0.9)' :
                o.type === 'UPGRADE'        ? '0 0 14px rgba(34,197,94,0.9)' :
                o.type === 'DAILY_COMPLETE' ? '0 0 14px rgba(34,197,94,0.9)' :
                o.type === 'ACHIEVEMENT'    ? '0 0 16px rgba(255,193,116,0.8)' :
                '0 0 14px rgba(239,68,68,0.9)',
            }}>
              {o.type === 'SUCCESS'
                ? o.critical
                  ? `!! CRITICAL !!  +${o.gold} CR`
                  : `+${o.gold} CR  ${o.item}`
                : o.type === 'UPGRADE'       ? `+1 ${o.label}`
                : o.type === 'DAILY_COMPLETE' ? '[DAILY COMPLETE]'
                : o.type === 'ACHIEVEMENT'   ? `[ACHIEVEMENT :: ${o.achievementId}]`
                : '>> TRACED'}
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={S.headerTitle}>SHADOW_GUILD_V1.0.0</span>
          {DEV_MODE && (
            <span style={{ fontSize: 9, letterSpacing: '0.1rem', color: '#22c55e', border: '1px solid #22c55e', padding: '1px 5px' }}>
              DEV
            </span>
          )}
          {(state.prestige ?? 0) > 0 && (
            <span style={{ fontSize: 9, letterSpacing: '0.1rem', color: '#f97316', border: '1px solid #f97316', padding: '1px 5px' }}>
              ◆ PRESTIGE {state.prestige}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {state.bustedLockout > 0 && (
            <span style={{ color: '#ef4444', fontSize: 11, letterSpacing: '0.1rem', fontWeight: 700 }}>
              [BUSTED :: {state.bustedLockout}s]
            </span>
          )}
          <span style={S.muted}>OPERATIVE_01</span>
        </div>
      </div>

      {/* ── MOBILE TAB BAR ── */}
      {isMobile && (
        <div style={{ display: 'flex', background: 'var(--surface-low)', borderBottom: '2px solid var(--surface-high)', position: 'sticky', top: 44, zIndex: 10 }}>
          {['DASH', 'OPS', 'UPGRADES'].map(t => (
            <button key={t} onClick={() => setMobileTab(t)} style={{
              flex: 1, padding: '9px 0',
              background: mobileTab === t ? 'var(--amber)' : 'transparent',
              color: mobileTab === t ? 'var(--bg)' : 'var(--muted)',
              border: 'none', fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, letterSpacing: '0.12rem', cursor: 'pointer',
              fontWeight: mobileTab === t ? 700 : 400,
            }}>{t}</button>
          ))}
        </div>
      )}

      {/* ── SHAKE WRAPPER ── */}
      <div style={{ animation: shaking ? 'shake 0.45s ease' : 'none', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
           onAnimationEnd={() => setShaking(false)}>

        {/* ── CONSOLE GRID ── */}
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 2, padding: 2 } : S.consoleGrid}>

          {/* ── LEFT COL: STATUS ── */}
          {(!isMobile || mobileTab === 'DASH') && (
          <div style={S.colLeft}>
            {/* Operative portrait */}
            <div style={{
              position: 'relative', width: '100%', height: 96,
              background: 'var(--surface-high)', border: '1px solid var(--amber)',
              marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.14rem', marginBottom: 2 }}>[ OPERATIVE ]</div>
                <div style={{ fontSize: 20, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.05rem', lineHeight: 1 }}>01</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1rem', marginTop: 3 }}>SHADOW_GUILD</div>
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderTop: '2px solid var(--amber)', borderLeft: '2px solid var(--amber)' }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderTop: '2px solid var(--amber)', borderRight: '2px solid var(--amber)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 10, height: 10, borderBottom: '2px solid var(--amber)', borderLeft: '2px solid var(--amber)' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderBottom: '2px solid var(--amber)', borderRight: '2px solid var(--amber)' }} />
            </div>
            <span style={S.panelLabel}>:: OPERATIVE_STATUS</span>

            {/* GOLD */}
            <div style={S.statRow}>
              <span style={S.statKey}><Icon component={Coins} />GOLD</span>
              <span key={`g${goldPulseKey}`} style={{ ...S.statVal, animation: goldPulseKey > 0 ? 'goldPulse 0.55s ease' : 'none' }}>
                {state.gold.toLocaleString()} CR
              </span>
            </div>

            {isUnlocked(state, 'rep') && (
            <div style={S.statRow}>
              <span style={S.statKey}><Icon component={ShieldOff} />REP</span>
              <span key={repPulseKey} style={{
                ...S.statVal,
                animation: repPulseKey > 0 ? 'goldPulse 1s ease forwards' : 'none',
              }}>
                {state.reputation.toLocaleString()}
              </span>
            </div>
            )}
            {isUnlocked(state, 'rep') && (
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.04rem' }}>
                earn via: SIPHON +1 · BREACH +3 · HACK +8 · BARTER +1
              </div>
            )}

            <div style={S.statRow}>
              <span style={S.statKey}><Icon component={Activity} />LEVEL</span>
              <span style={S.statVal}>{state.level}</span>
            </div>

            {isUnlocked(state, 'xp') && (<>
            <div style={S.statRow}>
              <span style={S.statKey}><Icon component={TrendingUp} />XP</span>
              <span style={S.statVal}>{state.xp.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
            </div>
            <Bar pct={xpPct} />
            </>)}

            {isUnlocked(state, 'stamina') && (<>
            <div style={S.statRow}>
              <span style={S.statKey}><Icon component={Zap} />STAMINA</span>
              <span style={S.statVal}>{state.stamina} / {effectiveMaxStamina}</span>
            </div>
            <Bar pct={staminaPct} />
            </>)}

            {isUnlocked(state, 'heat') && (<>
            <div style={S.statRow}>
              <span style={S.statKey}><Icon component={Flame} color={heatColor} />HEAT</span>
              <span style={{ ...S.statVal, color: heatColor }}>
                {heatRound}% [{heatStat}]
                {(state.heatSpikeTimer ?? 0) > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 9, color: '#ef4444', letterSpacing: '0.06rem' }}>
                    SPIKE [{state.heatSpikeTimer}s]
                  </span>
                )}
              </span>
            </div>
            <Bar pct={heatRound} color={heatColor} />
            </>)}

            {(state.bountyActive ?? false) && isUnlocked(state, 'heat') && (
              <div style={{ fontSize: 9, color: '#ef4444', marginTop: 3, letterSpacing: '0.07rem', fontWeight: 700 }}>
                !! BOUNTY ACTIVE :: -20% SUCCESS
              </div>
            )}
            {(state.upgrades.aiSubroutine ?? 0) >= 1 && (
              <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.05rem' }}>
                AI_CLEAN :: [{fmtDuration(aiRemaining)}]
              </div>
            )}

            {/* District */}
            {isUnlocked(state, 'district') && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--surface-high)' }}>
              <div style={S.statRow}>
                <span style={S.statKey}>DISTRICT</span>
                <span style={{ ...S.statVal, fontSize: 11 }}>
                  {DISTRICTS[state.district]?.label}
                  {state.district !== 'neon_strip' && (
                    <span style={{ color: '#f97316', marginLeft: 6 }}>
                      x{DISTRICTS[state.district]?.lootMult}
                    </span>
                  )}
                </span>
              </div>
            </div>
            )}

            {/* Prestige */}
            {(state.prestige ?? 0) > 0 && (
              <div style={S.statRow}>
                <span style={S.statKey}><Icon component={Star} color="#f97316" />PRESTIGE</span>
                <span style={{ ...S.statVal, color: '#f97316', fontSize: 11 }}>
                  #{state.prestige} · x{(state.prestigeMultiplier ?? 1).toFixed(2)}
                </span>
              </div>
            )}

            {/* Runners */}
            {(state.runners.streetRunner > 0 || state.runners.dataThief > 0 || state.runners.infiltrator > 0 || state.runners.fixer > 0 || state.runners.shadowBroker > 0) && (
              <div style={{ marginTop: 6 }}>
                {state.runners.streetRunner > 0 && (
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Users} />S_RUN</span>
                    <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                      {state.runners.streetRunner}x · {srCycle - state.runnerTick.streetRunner}s
                    </span>
                  </div>
                )}
                {state.runners.dataThief > 0 && (
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Users} />D_THIEF</span>
                    <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                      {state.runners.dataThief}x · {dtCycle - state.runnerTick.dataThief}s
                    </span>
                  </div>
                )}
                {state.runners.infiltrator > 0 && (
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Users} />INFIL</span>
                    <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                      {state.runners.infiltrator}x · {ifCycle - state.runnerTick.infiltrator}s
                    </span>
                  </div>
                )}
                {state.runners.fixer > 0 && (
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Users} />FIXER</span>
                    <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                      {state.runners.fixer}x · {fxCycle - state.runnerTick.fixer}s
                    </span>
                  </div>
                )}
                {state.runners.shadowBroker > 0 && (
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Users} />S_BRKR</span>
                    <span style={{ ...S.statVal, fontSize: 11, color: '#f97316' }}>
                      {state.runners.shadowBroker}x · {sbCycle - state.runnerTick.shadowBroker}s
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* ── CENTER COL: TABS ── */}
          {(!isMobile || mobileTab === 'OPS' || mobileTab === 'UPGRADES') && (
          <div style={S.colCenter}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
              <Tab label="OPS"      active={activeTab === 'OPERATIONS'} onClick={() => setActiveTab('OPERATIONS')} />
              <Tab label={isUnlocked(state, 'upgrades_tab') ? 'UPGRADES' : 'UPGRADES [LVL 3]'}
                   active={activeTab === 'UPGRADES'}
                   onClick={() => isUnlocked(state, 'upgrades_tab') && setActiveTab('UPGRADES')} />
              <Tab label="SETTINGS" active={activeTab === 'SETTINGS'}   onClick={() => setActiveTab('SETTINGS')} />
            </div>

            {/* ── OPS TAB ── */}
            {activeTab === 'OPERATIONS' && (
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* ── natural height actions area ── */}
                <div style={{ flexShrink: 0, paddingBottom: 16 }}>
                {/* Raid alert */}
                {state.raidActive && (
                  <div className="raid-blink" style={{
                    marginBottom: 8, padding: '6px 10px',
                    background: '#450a0a', border: '1px solid #ef4444',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 10, color: '#fca5a5', fontWeight: 700, letterSpacing: '0.08rem' }}>
                      !! RAID ALERT
                    </span>
                    <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
                      [{state.raidTimer}s]
                    </span>
                  </div>
                )}

                {/* EYE_REVEAL: next raid countdown */}
                {eyeReveal && !state.raidActive && (
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.06rem' }}>
                    NEXT RAID IN: <span style={{ color: (state.nextRaidIn ?? 0) < 60 ? '#ef4444' : 'var(--amber)' }}>{fmtDuration(state.nextRaidIn ?? 0)}</span>
                  </div>
                )}

                {/* District selector */}
                {isUnlocked(state, 'district') && (
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {Object.entries(DISTRICTS).map(([key, dist]) => {
                    const levelLocked    = state.level < dist.unlockLevel;
                    const prestigeLocked = (dist.requiresPrestige ?? 0) > (state.prestige ?? 0);
                    const locked = levelLocked || prestigeLocked;
                    const active = state.district === key;
                    // Always show [LVL x] — prestige just adds the availability, but level is always required
                    const lockLabel = prestigeLocked && !levelLocked
                      ? `[P${dist.requiresPrestige}+LVL${dist.unlockLevel}]`
                      : `[LVL ${dist.unlockLevel}]`;
                    return (
                      <button key={key}
                        onClick={() => !locked && dispatch({ type: 'SET_DISTRICT', district: key })}
                        style={{
                          flex: 1, background: active ? 'var(--amber)' : 'var(--surface-high)',
                          color: active ? 'var(--bg)' : locked ? 'var(--muted)' : 'var(--amber)',
                          border: `1px solid ${active ? 'var(--amber)' : locked ? 'var(--muted)' : 'var(--amber)'}`,
                          fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                          letterSpacing: '0.06rem', padding: '6px 2px',
                          cursor: locked ? 'not-allowed' : 'pointer',
                          opacity: locked ? 0.4 : 1, textAlign: 'center',
                        }}>
                        {dist.label}
                        {locked && <span style={{ display: 'block', fontSize: 7, marginTop: 1 }}>{lockLabel}</span>}
                      </button>
                    );
                  })}
                </div>
                )}

                {/* ── PROTOCOL SELECTION ── */}
                {isUnlocked(state, 'protocol') && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1rem', marginBottom: 5 }}>
                      :: OPERATION PROTOCOL
                      {activeProtoDef && (
                        <span style={{ marginLeft: 8, color: activeProtoDef.color, fontWeight: 700 }}>
                          [{activeProtocol}]
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: activeProtocol !== 'NONE' ? 3 : 0 }}>
                      {Object.entries(PROTOCOL_DEFS).map(([key, def]) => {
                        const active = activeProtocol === key;
                        return (
                          <button key={key}
                            onClick={() => dispatch({ type: 'SET_PROTOCOL', protocol: key })}
                            className={active ? 'neon-active' : ''}
                            style={{
                              flex: 1, background: active ? 'rgba(0,0,0,0.5)' : 'var(--surface-high)',
                              border: `1px solid ${active ? def.color : 'var(--muted)'}`,
                              color: active ? def.color : 'var(--muted)',
                              fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                              letterSpacing: '0.05rem', padding: '5px 3px',
                              cursor: 'pointer', textAlign: 'center',
                              transition: 'border-color 0.15s',
                            }}
                          >
                            {def.label}
                            <span style={{ display: 'block', fontSize: 7, color: active ? def.color : 'var(--muted)', marginTop: 2, opacity: 0.85 }}>
                              {def.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {activeProtocol !== 'NONE' && (
                      <button
                        onClick={() => dispatch({ type: 'SET_PROTOCOL', protocol: activeProtocol })}
                        style={{
                          width: '100%', background: 'transparent',
                          border: '1px solid var(--muted)', color: 'var(--muted)',
                          fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                          letterSpacing: '0.08rem', padding: '3px', cursor: 'pointer',
                        }}
                      >
                        DEACTIVATE
                      </button>
                    )}
                  </div>
                )}

                {/* ── COMBO METER — fixed height so buttons never shift ── */}
                <div style={{
                  height: 28, marginBottom: 4, display: 'flex', alignItems: 'center',
                  padding: '0 10px', gap: 6,
                  background: comboCount > 0 ? 'var(--surface-high)' : 'transparent',
                  border: comboCount > 0 ? `1px solid ${comboHigh ? '#ffc174' : 'var(--muted)'}` : '1px solid transparent',
                  transition: 'border-color 0.15s',
                }}>
                  {comboCount > 0 && (<>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.1rem',
                      color: comboHigh ? '#ffc174' : 'var(--muted)',
                      animation: comboHigh ? 'goldPulse 1.2s ease infinite' : 'none',
                    }}>
                      COMBO x{comboCount}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                      [+{Math.round(comboPct * 100)}% VALUE]
                    </span>
                  </>)}
                </div>

                <ProtoBtn onClick={() => dispatch({ type: 'SIPHON' })}
                  disabled={isBlocked || state.stamina < siphonCost || invFull}>
                  SIPHON_ [{siphonCost} STA]{prestigePerks.GHOST_STEP ? <span style={{ marginLeft: 6, fontSize: 9, color: '#22c55e' }}>[GHOST_STEP]</span> : null}
                  {siphonChance !== null && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[{siphonChance}%]</span>}
                  {invFull && <span style={{ marginLeft: 8, fontSize: 10, color: '#ef4444' }}>[INV FULL]</span>}
                </ProtoBtn>

                {isUnlocked(state, 'breach') && (
                <ProtoBtn onClick={() => dispatch({ type: 'BREACH' })}
                  disabled={isBlocked || state.stamina < 25 || invFull}>
                  BREACH_ [25 STA]
                  {breachChance !== null && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[{breachChance}%]</span>}
                  {invFull && <span style={{ marginLeft: 8, fontSize: 10, color: '#ef4444' }}>[INV FULL]</span>}
                </ProtoBtn>
                )}

                {isUnlocked(state, 'deep_siphon') && (
                <ProtoBtn onClick={() => dispatch({ type: 'DEEP_SIPHON' })}
                  disabled={isBlocked || state.stamina < 15 || invFull}>
                  DEEP_SIPHON_ [15 STA]
                  {deepSiphonChance !== null && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[{deepSiphonChance}%]</span>}
                  {invFull && <span style={{ marginLeft: 8, fontSize: 10, color: '#ef4444' }}>[INV FULL]</span>}
                </ProtoBtn>
                )}

                {isUnlocked(state, 'mainframe') && (
                <ProtoBtn onClick={() => dispatch({ type: 'MAINFRAME_HACK' })}
                  disabled={isBlocked || state.stamina < 40 || invFull}>
                  MAINFRAME_HACK_ [40 STA]
                  {mainframeChance !== null && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[{mainframeChance}%]</span>}
                  {invFull && <span style={{ marginLeft: 8, fontSize: 10, color: '#ef4444' }}>[INV FULL]</span>}
                </ProtoBtn>
                )}

                <ProtoBtn onClick={() => dispatch({ type: 'LAY_LOW' })}
                  disabled={state.bustedLockout > 0 || (state.layLowCooldown > 0 && !state.raidActive)}
                  active={state.layLowActive}>
                  LAY_LOW_
                  {state.layLowActive && <span style={{ marginLeft: 8, fontSize: 11 }}>[{state.layLowTimer}s]</span>}
                  {state.layLowCooldown > 0 && !state.raidActive && <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 10 }}>[CD: {state.layLowCooldown}s]</span>}
                  {state.raidActive && state.layLowCooldown > 0 && <span style={{ marginLeft: 8, fontSize: 10, color: '#fca5a5' }}>[RAID: COOLDOWN BYPASSED]</span>}
                </ProtoBtn>

                <ProtoBtn onClick={() => dispatch({ type: 'SELL_COOLED_ITEMS' })}
                  disabled={coldCount === 0}>
                  SELL_COOLED_ITEMS_
                  {coldCount > 0
                    ? <span style={{ marginLeft: 8, fontSize: 11, color: '#22c55e' }}>[{coldCount} · +{coldValue.toLocaleString()} CR]</span>
                    : <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[WAIT FOR COLD]</span>
                  }
                </ProtoBtn>

                {isUnlocked(state, 'manual_cool') && (
                <ProtoBtn onClick={() => dispatch({ type: 'MANUAL_COOL' })}
                  disabled={hotItems.length === 0 || state.stamina < 5}>
                  COOL_DOWN_ [-15s · 5 STA]
                  {coolTarget
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>
                        COOLING: [{coolTarget.id}] [{fmtCooldown(coolTarget.cooldownRemaining)}]
                      </span>
                    : <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[NO HOT ITEMS]</span>
                  }
                </ProtoBtn>
                )}

                {isUnlocked(state, 'dark_market') && (
                <ProtoBtn onClick={() => dispatch({ type: 'DARK_MARKET' })} disabled={dmDisabled}>
                  DARK_MARKET_
                  {dmLocked
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: '#ef4444' }}>[50 REP]</span>
                    : dmBusy
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[CD: {fmtDuration(state.darkMarketCooldown)}]</span>
                    : state.inventory.length === 0
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[EMPTY]</span>
                    : <span style={{ marginLeft: 8, fontSize: 11, color: '#f97316' }}>[+{allValue.toLocaleString()} CR · 60%]</span>
                  }
                </ProtoBtn>
                )}

                {isUnlocked(state, 'barter') && (
                <ProtoBtn onClick={() => dispatch({ type: 'BARTER' })} disabled={barterDisabled}>
                  BARTER_ [10x DATA_CHIP → +1 REP]
                  {(state.barterCooldown ?? 0) > 0
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[CD: {fmtDuration(state.barterCooldown)}]</span>
                    : dataChipCount < 10
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)' }}>[{dataChipCount}/10 CHIPS]</span>
                    : barterReady
                    ? <span style={{ marginLeft: 8, fontSize: 10, color: '#22c55e' }}>[READY]</span>
                    : null
                  }
                </ProtoBtn>
                )}

                {/* ── DAILY CHALLENGE ── */}
                {isUnlocked(state, 'daily') && dc && (
                  <div style={{
                    marginTop: 10, padding: '8px 10px',
                    background: 'var(--surface-high)',
                    border: `1px solid ${dc.completed ? '#22c55e' : 'var(--muted)'}`,
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.08rem', color: 'var(--muted)', marginBottom: 4 }}>
                      DAILY CHALLENGE
                    </div>
                    <div style={{ fontSize: 11, color: dc.completed ? '#22c55e' : 'var(--amber)', marginBottom: 5 }}>
                      {dcDef?.desc ?? dc.type}
                    </div>
                    <div style={{ ...S.track, marginBottom: 5 }}>
                      <div style={{ ...S.fill, width: `${dcPct}%`, background: dc.completed ? '#22c55e' : 'var(--amber)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)' }}>
                      <span>
                        {dc.completed ? 'COMPLETE' : `${dc.type === 'SELL_VALUE' ? dc.current.toLocaleString() : dc.current} / ${dc.type === 'SELL_VALUE' ? dc.target.toLocaleString() : dc.target}`}
                      </span>
                      <span style={{ color: dc.completed ? '#22c55e' : 'var(--amber)' }}>
                        {dc.reward.rep > 0 ? `+${dc.reward.rep} REP` : ''}
                        {dc.reward.rep > 0 && dc.reward.gold > 0 ? ' · ' : ''}
                        {dc.reward.gold > 0 ? `+${dc.reward.gold} CR` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {DEV_MODE && (
                  <button onClick={() => dispatch({ type: 'WARP_TIME' })} style={{
                    marginTop: 8, background: 'transparent', border: '1px solid #22c55e',
                    color: '#22c55e', fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                    letterSpacing: '0.1rem', padding: '6px 12px', cursor: 'pointer',
                    width: '100%', textAlign: 'left',
                  }}>
                    [DEV] WARP +1H
                  </button>
                )}

                </div>{/* end scrollable actions */}

                {/* ── SYSTEM LOGS (center column bottom, flex-1) ── */}
                <div style={{ marginTop: 8, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={S.logsHeader}>
                    <span style={S.panelLabel}>:: SYSTEM_LOGS</span>
                    <span style={{ color: state.bustedLockout > 0 ? '#ef4444' : '#22c55e', fontSize: 11, letterSpacing: '0.1rem' }}>
                      {state.bustedLockout > 0 ? `LOCKOUT: ${state.bustedLockout}s` : 'STABLE'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 3,
                      flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative',
                      maskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
                      animation: logGlitch ? 'logGlitch 0.6s ease' : 'none',
                    }}
                  >
                    {state.log.length === 0
                      ? <span style={{ color: 'rgba(255,193,116,0.2)', fontSize: 11 }}>... AWAITING_PROTOCOL ...</span>
                      : state.log.map((entry, i) => {
                        const isZero   = entry.includes('[ZERO >>]');
                        const isGlitch = i === glitchedEntry;
                        const glitched = isGlitch
                          ? entry.replace(/[A-Z]/g, (c, ix) => ix % 7 === 0 ? '█' : c)
                          : entry;

                        if (isZero) {
                          return (
                            <div key={i === 0 ? `n-${newestLogKey}` : i} style={{
                              ...S.logEntry,
                              background: '#0a1a0a',
                              color: '#88ffaa',
                              padding: '2px 4px',
                              animation: i === 0 ? 'typewriter 1s steps(50) forwards' : 'none',
                            }}>
                              {glitched}
                            </div>
                          );
                        }

                        const color =
                          entry.includes('[BUSTED]')                               ? '#ef4444'      :
                          entry.includes('PRESTIGE')                               ? '#f97316'      :
                          entry.includes('LEVEL UP')                               ? 'var(--amber)' :
                          entry.includes('PROTOCOL')                               ? '#00d4ff'      :
                          entry.includes('SOLD')        || entry.includes('UPGRADE')  ||
                          entry.includes('HIRED')       || entry.includes('AUTO_FENCER') ||
                          entry.includes('INTEL')       || entry.includes('DEV:')   ? '#22c55e'      :
                          entry.includes('OFFLINE')     || entry.includes('RESTORED') ? 'var(--amber)' :
                          entry.includes('RESET')                                  ? '#ef4444'      :
                          entry.includes('RUNNER')      || entry.includes('THIEF') ||
                          entry.includes('INFILTRATOR') || entry.includes('FIXER') ||
                          entry.includes('BROKER')                                 ? '#f97316'      :
                          entry.includes('✗') || entry.includes('ABORTED')        ? '#f97316'      :
                          entry.includes('!!')                                     ? 'var(--amber)' :
                          'var(--muted)';

                        return (
                          <div key={i === 0 ? `n-${newestLogKey}` : i} style={{ ...S.logEntry, color, animation: i === 0 ? 'typeIn 0.3s ease' : 'none' }}>
                            {glitched}
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            )}

            {/* ── UPGRADES TAB ── */}
            {activeTab === 'UPGRADES' && (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <span style={{ ...S.panelLabel, marginBottom: 8 }}>OPERATIVE UPGRADES</span>
                {UPGRADE_DEFS.map(def => (
                  <UpgradeCard key={def.key} def={def}
                    level={state.upgrades[def.key] ?? 0}
                    gold={state.gold} dispatch={dispatch} />
                ))}

                {isUnlocked(state, 'runners') && <span style={{ ...S.panelLabel, marginTop: 14, marginBottom: 8 }}>HIRED RUNNERS</span>}
                {isUnlocked(state, 'runners') && (<>
                  <RunnerCard runnerType="streetRunner" label="STREET_RUNNER"
                    count={state.runners.streetRunner} gold={state.gold} level={state.level}
                    unlockLevel={3} requiresPrestige={0} prestige={state.prestige ?? 0}
                    baseCost={300} cycleSeconds={srCycle} crPerRunner={2} heatPerRunner={1}
                    runnerXp={state.runnerXp?.streetRunner ?? 0} runnerSpec={state.runnerSpec?.streetRunner ?? null}
                    dispatch={dispatch} />
                  <RunnerCard runnerType="dataThief" label="DATA_THIEF"
                    count={state.runners.dataThief} gold={state.gold} level={state.level}
                    unlockLevel={5} requiresPrestige={0} prestige={state.prestige ?? 0}
                    baseCost={800} cycleSeconds={dtCycle} crPerRunner={8} heatPerRunner={2}
                    runnerXp={state.runnerXp?.dataThief ?? 0} runnerSpec={state.runnerSpec?.dataThief ?? null}
                    dispatch={dispatch} />
                  <RunnerCard runnerType="infiltrator" label="INFILTRATOR"
                    count={state.runners.infiltrator} gold={state.gold} level={state.level}
                    unlockLevel={7} requiresPrestige={0} prestige={state.prestige ?? 0}
                    baseCost={2500} cycleSeconds={ifCycle} crPerRunner={35} heatPerRunner={3}
                    runnerXp={state.runnerXp?.infiltrator ?? 0} runnerSpec={state.runnerSpec?.infiltrator ?? null}
                    dispatch={dispatch} />
                  <RunnerCard runnerType="fixer" label="FIXER"
                    count={state.runners.fixer} gold={state.gold} level={state.level}
                    unlockLevel={9} requiresPrestige={0} prestige={state.prestige ?? 0}
                    baseCost={8000} cycleSeconds={fxCycle} crPerRunner={150} heatPerRunner={1}
                    runnerXp={state.runnerXp?.fixer ?? 0} runnerSpec={state.runnerSpec?.fixer ?? null}
                    dispatch={dispatch} />
                  <RunnerCard runnerType="shadowBroker" label="SHADOW_BROKER"
                    count={state.runners.shadowBroker} gold={state.gold} level={state.level}
                    unlockLevel={1} requiresPrestige={1} prestige={state.prestige ?? 0}
                    baseCost={25000} cycleSeconds={sbCycle} crPerRunner={600} heatPerRunner={0}
                    runnerXp={state.runnerXp?.shadowBroker ?? 0} runnerSpec={state.runnerSpec?.shadowBroker ?? null}
                    dispatch={dispatch} />
                </>)}

                {isUnlocked(state, 'intel') && <span style={{ ...S.panelLabel, marginTop: 14, marginBottom: 8 }}>INTEL UPGRADES <span style={{ color: 'var(--amber)', fontWeight: 400 }}>[REP COST]</span></span>}
                {isUnlocked(state, 'intel') && INTEL_UPGRADE_DEFS.map(def => {
                  const lvl     = (state.intelUpgrades?.[def.key] ?? 0);
                  const unlocked = lvl >= def.max;
                  const canAfford = state.reputation >= def.repCost;
                  return (
                    <div key={def.key} style={S.card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07rem' }}>
                          <Icon component={ChevronUp} size={10} color={unlocked ? '#22c55e' : 'var(--amber)'} />
                          {def.label}
                        </span>
                        <span style={{ fontSize: 10, color: unlocked ? '#22c55e' : 'var(--muted)' }}>
                          {unlocked ? 'ACTIVE' : `${def.repCost} REP`}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', margin: '5px 0 8px' }}>{def.effect}</div>
                      {!unlocked && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: canAfford ? 'var(--amber)' : '#ef4444' }}>
                            {state.reputation.toLocaleString()} / {def.repCost} REP
                          </span>
                          <BuyBtn canAfford={canAfford} maxed={false}
                            onClick={() => dispatch({ type: 'BUY_INTEL_UPGRADE', key: def.key })} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'SETTINGS' && (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

                {/* ACHIEVEMENTS */}
                <span style={{ ...S.panelLabel, marginBottom: 8 }}>ACHIEVEMENTS</span>
                {ACHIEVEMENT_DEFS.map(def => {
                  const unlocked = !!((state.achievements ?? {})[def.id]);
                  return (
                    <div key={def.id} style={{
                      ...S.card, marginBottom: 3,
                      borderLeft: `2px solid ${unlocked ? '#22c55e' : 'var(--surface-high)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: unlocked ? '#22c55e' : 'var(--amber)', letterSpacing: '0.07rem' }}>
                          {def.id}
                        </span>
                        <span style={{ fontSize: 9, color: unlocked ? '#22c55e' : 'var(--muted)', letterSpacing: '0.08rem' }}>
                          {unlocked ? '[UNLOCKED]' : '[LOCKED]'}
                        </span>
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>{def.desc}</div>
                      <div style={{ fontSize: 9, color: unlocked ? '#22c55e' : 'var(--muted)' }}>
                        {def.reward.rep ? `+${def.reward.rep} REP` : `+${def.reward.gold} CR`}
                      </div>
                    </div>
                  );
                })}

                {/* PRESTIGE PERK TREE */}
                {(state.prestige ?? 0) >= 1 && (<>
                  <span style={{ ...S.panelLabel, marginTop: 14, marginBottom: 4 }}>PRESTIGE PERKS</span>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.05rem' }}>
                    {`PRESTIGE #${state.prestige} · x${(state.prestigeMultiplier ?? 1).toFixed(2)} MULTIPLIER`}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.08rem', marginBottom: 12,
                    color: prestigePoints > 0 ? 'var(--amber)' : 'var(--muted)',
                  }}>
                    {prestigePoints > 0 ? `SKILL POINTS AVAILABLE: ${prestigePoints}` : 'NO POINTS AVAILABLE'}
                  </div>
                  {['GHOST', 'OVERLORD', 'ARCHITECT'].map(branch => {
                    const branchColors = { GHOST: '#00d4ff', OVERLORD: '#f97316', ARCHITECT: '#b347ff' };
                    const bColor = branchColors[branch];
                    const perks = PRESTIGE_PERK_DEFS.filter(d => d.branch === branch);
                    return (
                      <div key={branch} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, color: bColor, letterSpacing: '0.12rem', fontWeight: 700, marginBottom: 5, borderBottom: `1px solid ${bColor}`, paddingBottom: 3 }}>
                          :: {branch}
                        </div>
                        {perks.map(def => {
                          const owned     = !!prestigePerks[def.id];
                          const lvlMet    = state.level >= (def.reqLevel ?? 1);
                          const canBuy    = prestigePoints >= 1 && !owned && lvlMet;
                          const lockMsg   = !lvlMet ? `[LVL ${def.reqLevel}]` : !owned && prestigePoints < 1 ? '[NO PTS]' : null;
                          return (
                            <div key={def.id} style={{
                              ...S.card, marginBottom: 3,
                              borderLeft: `2px solid ${owned ? bColor : lvlMet && prestigePoints > 0 ? 'var(--amber)' : 'var(--surface-high)'}`,
                              opacity: (!lvlMet) ? 0.45 : 1,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07rem', color: owned ? bColor : 'var(--amber)' }}>
                                  {def.id}
                                  {def.reqLevel > 1 && <span style={{ marginLeft: 5, fontSize: 8, color: 'var(--muted)', fontWeight: 400 }}>[LVL {def.reqLevel}+]</span>}
                                </span>
                                {owned
                                  ? <span style={{ fontSize: 9, color: bColor, letterSpacing: '0.08rem' }}>[ACTIVE]</span>
                                  : lockMsg
                                  ? <span style={{ fontSize: 9, color: 'var(--muted)' }}>{lockMsg}</span>
                                  : <button
                                      onClick={() => canBuy && dispatch({ type: 'BUY_PRESTIGE_PERK', perkId: def.id })}
                                      style={{
                                        ...S.settingsBtn, padding: '3px 10px', width: 'auto',
                                        borderColor: canBuy ? bColor : 'var(--muted)',
                                        color: canBuy ? bColor : 'var(--muted)',
                                        opacity: canBuy ? 1 : 0.4,
                                        cursor: canBuy ? 'pointer' : 'not-allowed',
                                      }}
                                    >SELECT</button>
                                }
                              </div>
                              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>{def.desc}</div>
                              <div style={{ fontSize: 9, color: 'var(--muted)', fontStyle: 'italic' }}>{def.effect}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>)}

                {/* PRESTIGE */}
                <span style={{ ...S.panelLabel, marginBottom: 8 }}>PRESTIGE</span>
                <div style={S.card}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    <Icon component={Star} size={10} color={canPrestige ? '#f97316' : 'var(--muted)'} />
                    PRESTIGE SYSTEM
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
                    Unlock: Level 10 + 100,000 CR earned this run.
                    Resets: gold, level, upgrades, runners.
                    Keeps: REP, intel upgrades, prestige count.
                  </div>
                  <div style={{ fontSize: 10, padding: '3px 7px', marginBottom: 7, background: 'var(--surface-low)', borderLeft: '2px solid var(--amber)', letterSpacing: '0.05rem' }}>
                    <span style={{ color: state.level >= 10 ? '#22c55e' : 'var(--amber)' }}>Level: {state.level}/10</span>
                    {' · '}
                    <span style={{ color: runGoldEarned >= 100000 ? '#22c55e' : 'var(--amber)' }}>Run earned: {runGoldEarned.toLocaleString()}/100,000</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>
                    This run:{' '}
                    <span style={{ color: runGoldEarned >= 100000 ? '#22c55e' : 'var(--amber)' }}>
                      {runGoldEarned.toLocaleString()} / 100,000 CR
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
                    Lifetime:{' '}
                    <span style={{ color: 'var(--amber)' }}>
                      {(state.totalGoldEarned ?? 0).toLocaleString()} CR
                    </span>
                  </div>
                  <button
                    disabled={!canPrestige}
                    onClick={() => canPrestige && dispatch({ type: 'PRESTIGE' })}
                    style={{
                      ...S.settingsBtn,
                      borderColor: canPrestige ? '#f97316' : 'var(--muted)',
                      color:       canPrestige ? '#f97316' : 'var(--muted)',
                      opacity:     canPrestige ? 1 : 0.4,
                      cursor:      canPrestige ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {canPrestige ? `PRESTIGE → RUN #${(state.prestige ?? 0) + 1} [x${(1 + ((state.prestige ?? 0) + 1) * 0.25).toFixed(2)}]` : 'PRESTIGE [LOCKED]'}
                  </button>
                </div>

                {/* SAVE */}
                <span style={{ ...S.panelLabel, marginTop: 14, marginBottom: 8 }}>SAVE_SYSTEM</span>

                {/* Export */}
                <div style={S.card}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EXPORT_SAVE</div>
                  <button
                    onClick={() => {
                      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* quota */ }
                      setExportString(exportSave(state));
                      setTimeout(() => exportRef.current?.select(), 50);
                    }}
                    style={{ ...S.settingsBtn, marginBottom: 8 }}
                  >
                    GENERATE EXPORT
                  </button>
                  {exportString && (
                    <>
                      <textarea
                        ref={exportRef}
                        readOnly
                        value={exportString}
                        style={{
                          width: '100%', height: 54, background: 'var(--bg)',
                          border: '1px solid var(--muted)', color: 'var(--amber)',
                          fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                          padding: '5px', resize: 'none', outline: 'none',
                          boxSizing: 'border-box', marginBottom: 4,
                        }}
                      />
                      <button
                        onClick={() => exportRef.current?.select()}
                        style={{ ...S.settingsBtn, fontSize: 9 }}
                      >
                        SELECT ALL
                      </button>
                    </>
                  )}
                </div>

                {/* Import */}
                <div style={{ ...S.card, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>IMPORT_SAVE</div>
                  <textarea
                    value={importInput}
                    onChange={e => { setImportInput(e.target.value); setImportError(''); }}
                    placeholder="Paste save string here..."
                    style={{
                      width: '100%', height: 54, background: 'var(--bg)',
                      border: '1px solid var(--muted)', color: 'var(--amber)',
                      fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                      padding: '6px', resize: 'none', outline: 'none',
                      boxSizing: 'border-box', marginBottom: 6,
                    }}
                  />
                  {importError && <div style={{ fontSize: 10, color: '#ef4444', marginBottom: 6 }}>{importError}</div>}
                  <button
                    onClick={() => {
                      const parsed = importSave(importInput.trim());
                      if (!parsed) { setImportError('INVALID SAVE DATA'); return; }
                      const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
                      dispatch({ type: 'LOAD_SAVE', payload: parsed, ts });
                      setImportInput('');
                      setImportError('');
                      setExportString('');
                    }}
                    style={S.settingsBtn}
                  >
                    LOAD SAVE
                  </button>
                </div>

                {/* Hard reset */}
                <div style={{ ...S.card, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#ef4444' }}>RESET_ALL</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>Wipes all progress. Cannot be undone.</div>
                  {!resetConfirm ? (
                    <button onClick={() => setResetConfirm(true)} style={{ ...S.settingsBtn, borderColor: '#ef4444', color: '#ef4444' }}>
                      RESET
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => {
                        localStorage.removeItem(SAVE_KEY);
                        dispatch({ type: 'HARD_RESET' });
                        setResetConfirm(false);
                        setExportString('');
                      }} style={{ ...S.settingsBtn, flex: 1, background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}>
                        CONFIRM
                      </button>
                      <button onClick={() => setResetConfirm(false)} style={{ ...S.settingsBtn, flex: 1 }}>CANCEL</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* ── RIGHT COL: INVENTORY + LOGS ── */}
          {(!isMobile || mobileTab === 'DASH') && (
          <div style={S.colRight}>

            {/* ── INVENTORY ── */}
            <div style={{ background: 'var(--surface-low)', padding: 16, marginBottom: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sortedInventory.length ? 10 : 0 }}>
                <span style={{ ...S.panelLabel, display: 'inline', marginBottom: 0 }}>
                  <Icon component={Package} /> :: INVENTORY
                </span>
                <span style={{ fontSize: 11, color: invFull ? '#ef4444' : 'var(--muted)' }}>
                  {state.inventory.length}/{maxInventory}
                  {coldCount > 0 && <span style={{ color: '#22c55e', marginLeft: 6 }}>· {coldCount} COLD</span>}
                  {invFull && <span style={{ color: '#ef4444', marginLeft: 6 }}>[FULL]</span>}
                </span>
                {state.inventory.length > 0 && (
                  <button onClick={() => setInventorySort(m => {
                    const idx = SORT_MODES.indexOf(m);
                    return SORT_MODES[(idx + 1) % SORT_MODES.length];
                  })} style={{
                    marginLeft: 'auto', background: 'transparent',
                    border: '1px solid var(--muted)', color: 'var(--muted)',
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                    letterSpacing: '0.08rem', padding: '2px 6px', cursor: 'pointer',
                  }}>
                    SORT: [{inventorySort}]
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4 }}>
                {sortedInventory.map(item => {
                  const rarity = item.isQuantum
                              ? { label: 'QUANTUM',   color: '#ffd700', pulse: true }
                              : item.gold > 300 ? { label: 'LEGENDARY', color: '#ffd700', pulse: true }
                              : item.gold > 100 ? { label: 'RARE',      color: '#b347ff', pulse: false }
                              : item.gold > 20  ? { label: 'UNCOMMON',  color: '#00d4ff', pulse: false }
                              :                   { label: 'COMMON',    color: 'var(--amber)', pulse: false };
                  const baseItemId = item.id.replace(/^(MILITARY|QUANTUM|CORRUPTED)_/, '');
                  const coolPct = item.isHot && item.cooldown
                    ? Math.max(0, Math.min(100, (1 - item.cooldownRemaining / item.cooldown) * 100))
                    : 100;
                  
                  return (
                    <div key={item.instanceId} style={{ background: 'var(--surface-high)', padding: '8px 10px', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                        <span style={{
                          fontSize: 9, color: rarity.color, letterSpacing: '0.04rem', lineHeight: 1.3,
                          animation: rarity.pulse ? 'goldPulse 2s ease infinite' : 'none',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%'
                        }}>{item.id}</span>
                        <Icon component={Cpu} size={9} color={item.isHot ? '#f97316' : '#22c55e'} style={{ flexShrink: 0 }} />
                      </div>
                      {ITEM_FLAVOR[baseItemId] && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, lineHeight: 1.2, fontStyle: 'italic', opacity: 0.4, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          {ITEM_FLAVOR[baseItemId]}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: item.isHot ? 5 : 0 }}>
                        <span style={{ fontSize: 9, color: 'var(--muted)' }}>{item.gold} CR</span>
                        <span style={{ fontSize: 9, color: item.isHot ? '#f97316' : '#22c55e', fontWeight: 700 }}>
                          {item.isHot ? fmtCooldown(item.cooldownRemaining) : 'COLD'}
                        </span>
                      </div>
                      {item.isHot && (
                        <div style={{ width: '100%', height: 2, background: 'var(--bg)' }}>
                          <div style={{ height: '100%', width: `${coolPct}%`, background: '#f97316', transition: 'width 1s linear' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {state.inventory.length === 0 && (
                <span style={{ color: 'rgba(255,193,116,0.2)', fontSize: 11 }}>... INVENTORY EMPTY ...</span>
              )}

              {/* ── ENCRYPTION KEYS ── */}
              {encKeys.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--surface-high)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#ffd700', letterSpacing: '0.1rem', fontWeight: 700 }}>
                      ENCRYPTION KEYS [{encKeys.length}/5]
                    </span>
                    {canDecrypt && (
                      <button onClick={() => dispatch({ type: 'DECRYPT' })} style={{
                        background: '#ffd700', color: '#111', border: 'none',
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                        letterSpacing: '0.08rem', fontWeight: 700, padding: '3px 8px', cursor: 'pointer',
                      }}>
                        DECRYPT
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {ENC_KEY_IDS.map(kid => {
                      const owned = encKeys.includes(kid);
                      return (
                        <span key={kid} style={{
                          fontSize: 8, letterSpacing: '0.06rem', padding: '2px 5px',
                          border: `1px solid ${owned ? '#ffd700' : 'var(--muted)'}`,
                          color: owned ? '#ffd700' : 'var(--muted)',
                          background: owned ? 'rgba(255,215,0,0.08)' : 'transparent',
                          animation: owned && canDecrypt ? 'goldPulse 1.5s ease infinite' : 'none',
                        }}>
                          {kid.replace('KEY_', '')} {owned ? '✓' : '·'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
          )}

        </div>{/* end console grid */}

      </div>{/* end shake wrapper */}
    </div>
  );
}

// ── STYLE TOKENS ─────────────────────────────────────────────────────────────

const S = {
  root: {
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)',
    color: 'var(--amber)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--surface-low)', padding: '10px 16px',
    position: 'sticky', top: 0, zIndex: 20,
  },
  headerTitle: { fontWeight: 700, letterSpacing: '0.15rem', fontSize: 13 },
  muted:       { color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1rem' },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2 },
  consoleGrid: {
    display: 'grid', gridTemplateColumns: '260px 1fr 320px',
    gap: 2, padding: 2, flex: 1, overflow: 'hidden', alignItems: 'stretch',
  },
  colLeft:  { 
    background: 'var(--surface-low)', padding: 16, height: '100%', overflowY: 'auto', 
    boxSizing: 'border-box' 
  },
  colCenter: {
    background: 'var(--surface-low)', padding: 16,
    height: '100%', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxSizing: 'border-box'
  },
  colRight: {
    background: 'var(--surface-low)', padding: 0,
    height: '100%', overflowY: 'auto',
    width: '320px', flexShrink: 0,
    boxSizing: 'border-box'
  },
  panel:       { background: 'var(--surface-low)', padding: 16 },
  panelLabel: {
    display: 'block', color: 'var(--muted)', fontSize: 11,
    letterSpacing: '0.1rem', textTransform: 'uppercase', marginBottom: 14,
  },
  statRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  statKey:  { color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1rem', textTransform: 'uppercase' },
  statVal:  { color: 'var(--amber)', fontWeight: 700, fontSize: 13 },
  track:    { width: '100%', height: 2, background: 'var(--surface-high)', marginBottom: 12 },
  fill:     { height: '100%', background: 'var(--amber)' },
  btn: {
    display: 'block', width: '100%', background: 'var(--surface-high)',
    border: '1px solid var(--amber)', color: 'var(--amber)',
    fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: '0.1rem',
    textTransform: 'uppercase', textAlign: 'left', padding: '12px 14px',
    cursor: 'pointer', marginBottom: 7, borderRadius: 0,
    transition: 'background 0.08s, color 0.08s, box-shadow 0.12s',
  },
  card:    { background: 'var(--surface-high)', padding: '10px 12px', marginBottom: 4 },
  section: { background: 'var(--surface-low)', margin: 2, padding: 16 },
  itemRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 8px', background: 'var(--surface-high)', marginBottom: 3,
  },
  logsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logEntry:   { fontSize: 11, letterSpacing: '0.03rem' },
  bustedText: {
    color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '0.18rem',
    textAlign: 'center', lineHeight: 1.5, fontFamily: '"JetBrains Mono", monospace',
    textShadow: '0 0 30px rgba(255,255,255,0.5)',
  },
  settingsBtn: {
    background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)',
    fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.1rem',
    padding: '6px 14px', cursor: 'pointer', width: '100%', textAlign: 'left',
  },
};