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
  UPGRADE_DEFS, INTEL_UPGRADE_DEFS, CHALLENGE_DEFS, ACHIEVEMENT_DEFS, PRESTIGE_PERK_DEFS,
  getUpgradeCost, getRunnerCost, isUnlocked, buyPrestigePerk, setProtocol, purgeLogs, setRunnerSpec,
  DEV_MODE, SAVE_KEY, exportSave, importSave, ITEM_FLAVOR, PROTOCOL_DEFS, counterHack,
  canCapture, captureHex, calculateMapModifiers, getInitialDiscovery, getMapDataForVis,
} from './gameLogic.js';
import {
  CITY_MAP as AETHERIA_MAP,
  DISTRICTS as AETHERIA_DISTRICTS,
  MAP_STATS,
} from '../CITY_MAP.js';

// maxInventory is always derived — never stored in state
function calcMaxInventory(upgrades) {
  return 12 + (upgrades?.voidDrive ?? 0) * 2;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const FRESH_STATE = {
  gold:               100000,
  reputation:         1000,
  heat:               0,
  stamina:            100,
  level:              10,
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
  district:           'Z4',
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
  capturedHexes:       ['western_warpgate'],
  mapDiscovery:        ['western_warpgate', 'slum_nexus', 'ghost_alley', 'black_den'],
  missionSplash: null,
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
        capturedHexes: parsed.capturedHexes ?? FRESH_STATE.capturedHexes,
        mapDiscovery:  parsed.mapDiscovery  ?? FRESH_STATE.mapDiscovery,
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
		case 'COUNTER_HACK':      return counterHack(state);
		
		case 'SET_RUNNER_SPEC': {
			const { runnerType, spec } = action;
			const xp = state.runnerXp?.[runnerType] || 0;
			if (xp < 100) return state;

			const t = new Date().toLocaleTimeString('en-US', { hour12: false });
			return {
				...state,
				runnerXp: { ...state.runnerXp, [runnerType]: 0 },
				runnerSpec: { ...state.runnerSpec, [runnerType]: spec },
				reputation: (state.reputation || 0) + 50,
				log: [`[${t}] :: DOCTRINE_SET :: ${runnerType.toUpperCase()} -> ${spec}`, ...(state.log || [])].slice(0, 50),
			};
		}

		case 'DEPLOY_RUNNER': {
      const { hexId, runnerType } = action;
      const hex = AETHERIA_MAP[hexId];
      
      if (!hex) return state;
      if (state.runners[runnerType] <= 0) return state;
    
      // LIMIT: Maximálne 2 aktívne misie naraz
      if ((state.activeMissions || []).length >= 2) {
        return {
          ...state,
          log: [`[!] :: NETWORK_OVERLOAD :: Only 2 concurrent connections allowed`, ...(state.log || [])].slice(0, 50)
        };
      }
    
      // === OPERÁCIA MÁ NÁKLADY ===
      const zoneScales = { Z4: 1, Z7: 2, Z2: 3, Z3: 4, Z6: 6, Z1: 8, Z5: 15 };
      const zoneMult = zoneScales[hex.districtId] || 1;
      const opCost = Math.floor(2000 * zoneMult); // Platíš za nasadenie
    
      if (state.gold < opCost) {
        return {
          ...state,
          log: [`[!] :: INSUFFICIENT_FUNDS :: Need ${opCost.toLocaleString()} CR to deploy`, ...(state.log || [])].slice(0, 50)
        };
      }
    
      // Rýchlostné multiplikátory runnerov
      const speedMods = {
        streetRunner: 1.5,
        dataThief: 1.0,
        infiltrator: 0.5,
        fixer: 0.8,
        shadowBroker: 0.3
      };
    
      const baseTime = hex.captureTime || 45;
      
      // Finálny čas misie (kombinácia oboch verzií)
      const finalSeconds = Math.round(
        (baseTime * zoneMult) * (speedMods[runnerType] || 1) + (state.heat * 0.7)
      );
    
      // Šanca na úspech
      const baseChance = 80;
      const heatPenalty = Math.floor(state.heat / 5);
      const successChance = Math.max(10, baseChance - heatPenalty);
    
      return {
        ...state,
        gold: state.gold - opCost,                    // Odpočítame cenu operácie
        runners: {
          ...state.runners,
          [runnerType]: state.runners[runnerType] - 1
        },
        activeMissions: [
          ...(state.activeMissions || []),
          {
            hexId,
            runnerType,
            endTime: Date.now() + (finalSeconds * 1000),
            startTime: Date.now(),
            successChance,
            label: hex.label,
            opCost                     // uložíme pre prípadné logovanie/štatistiky
          }
        ],
        // Heat penalty pri nasadení
        heat: Math.min(100, state.heat + Math.round(zoneMult * 2.5)),
    
        log: [
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] :: DEPLOYED ${runnerType.toUpperCase()} → ${hex.label} [-${opCost} CR | ${finalSeconds}s | ${successChance}%]`,
          ...(state.log || [])
        ].slice(0, 50)
      };
    }

		// (Pôvodný CAPTURE_HEX si necháme, použije ho 'tick' po dokončení misie)
		case 'CAPTURE_HEX': {
			const hexId = action.hexId;
			const hex = AETHERIA_MAP[hexId];
			if (!hex) return state;

			const newCaptured = [...(state.capturedHexes ?? []), hexId];
			const newDiscovery = [...new Set([...(state.mapDiscovery ?? []), hexId, ...(hex.connections ?? [])])];
			
			const mult = hex.lootMultiplier || 1;
			const goldReward = Math.floor((Math.random() * 5000 + 5000) * mult);
			const repReward = Math.floor(25 * mult);
			const xpReward = Math.floor(1500 * mult); 
			
			const t = new Date().toLocaleTimeString('en-US', { hour12: false });

			return {
				...state,
				gold: state.gold + goldReward,
				reputation: (state.reputation || 0) + repReward,
				xp: (state.xp || 0) + xpReward,
				capturedHexes: newCaptured,
				mapDiscovery: newDiscovery,
				log: [`[${t}] :: VAULT BREACHED :: ${hex.label} :: +${goldReward.toLocaleString()} CR, +${xpReward} XP`, ...(state.log || [])].slice(0, 50),
			};
		}

		case 'START_HACKING': {
			const t = new Date().toLocaleTimeString('en-US', { hour12: false });
			return {
				...state,
				heat: Math.min(100, state.heat + 20),
				log: [`[${t}] :: TRACE_SPIKE :: Node intrusion detected (+20 HEAT)`, ...(state.log || [])].slice(0, 50),
			};
		}
		
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
    case 'CLEAR_SPLASH': return { ...state, missionSplash: null };
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

function RunnerCard({ runnerType, label, count, gold, level, unlockLevel, requiresPrestige, prestige, baseCost, cycleSeconds, crPerRunner, heatPerRunner, runnerXp, runnerSpec, cycleTotal, dispatch, setSpecModal }) {
	const locked       = level < unlockLevel || prestige < requiresPrestige;
	const lockReason   = prestige < requiresPrestige ? `[PRESTIGE ${requiresPrestige}]` : `[LVL ${unlockLevel}]`;
	const maxed        = count >= 5;
	const cost         = getRunnerCost(baseCost, count);
	const canAfford    = gold >= cost;
	const xp           = runnerXp ?? 0;
	const spec         = runnerSpec ?? null;

	// Dynamické farby podľa doktríny
	const specBorder = spec === 'SHADOW' ? '1px solid #22c55e' : spec === 'GREEDY' ? '1px solid #ffd700' : '1px solid var(--surface-high)';
	const specBg = spec === 'SHADOW' ? 'rgba(34, 197, 94, 0.05)' : spec === 'GREEDY' ? 'rgba(255, 215, 0, 0.05)' : 'var(--surface-high)';

	return (
		<div style={{ ...S.card, border: specBorder, background: specBg, transition: 'all 0.4s', marginBottom: 6 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07rem', color: spec === 'SHADOW' ? '#22c55e' : spec === 'GREEDY' ? '#ffd700' : 'var(--amber)' }}>
					<Icon component={Users} size={10} />
					{label} {spec && `[${spec}]`}
				</span>
				<span style={{ fontSize: 10, color: locked ? '#ef4444' : maxed ? '#22c55e' : 'var(--muted)' }}>
					{locked ? lockReason : `${count} / 5`}
				</span>
			</div>
			
			<div style={{ fontSize: 10, color: 'var(--muted)', margin: '5px 0 4px' }}>
				+{crPerRunner} CR / {cycleSeconds}s · +{heatPerRunner} HEAT
				<div style={{ color: 'var(--amber)', fontWeight: 700, marginTop: 2 }}>
					TOTAL: +{cycleTotal} CR
				</div>
			</div>

			{/* XP Bar pre špecializáciu */}
			{count > 0 && !spec && (
				<div style={{ marginBottom: 8, marginTop: 4 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--muted)', marginBottom: 2 }}>
						<span>SPECIALIZATION_PROGRESS</span>
						<span style={{ color: xp >= 100 ? 'var(--amber)' : 'var(--muted)' }}>{Math.min(xp, 100)}/100</span>
					</div>
					<div style={{ width: '100%', height: 2, background: 'var(--bg)' }}>
						<div style={{ height: '100%', width: `${Math.min(xp, 100)}%`, background: xp >= 100 ? 'var(--amber)' : '#555', transition: 'width 0.5s' }} />
					</div>
				</div>
			)}

			{/* Tlačidlo na povýšenie (Promote) */}
			{xp >= 100 && !spec && count > 0 && (
				<button 
					onClick={() => setSpecModal(runnerType)}
					style={{ width: '100%', padding: '6px', marginBottom: 8, background: 'var(--amber)', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 9 }}
				>
					:: PROMOTE TO SPECIALIST ::
				</button>
			)}

			{locked ? (
				<span style={{ fontSize: 9, color: 'var(--muted)', opacity: 0.6 }}>LOCKED_BY_SEC_PROTOCOL</span>
			) : maxed ? (
				<span style={{ fontSize: 9, color: '#22c55e' }}>MAX_UNIT_CAPACITY</span>
			) : (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
					<span style={{ fontSize: 10, color: canAfford ? 'var(--amber)' : '#ef4444' }}>{cost.toLocaleString()} CR</span>
					<BuyBtn canAfford={canAfford} maxed={false} label="HIRE" onClick={() => dispatch({ type: 'HIRE_RUNNER', runnerType })} />
				</div>
			)}
		</div>
	);
}

// ── NETWORK INFILTRATION MANAGER ──
function NetworkManager({ state, dispatch }) {
  const captured = state.capturedHexes ?? [];
  const missions = state.activeMissions ?? [];
  const MAP = AETHERIA_MAP;
  const maxMissions = 2;
  const isOverloaded = missions.length >= maxMissions;

  const nodesByDistrict = Object.values(MAP).reduce((acc, node) => {
    const dId = node.districtId;
    if (!acc[dId]) acc[dId] = [];
    acc[dId].push(node);
    return acc;
  }, {});

  const [, setRenderTrigger] = useState(0);

  useEffect(() => {
    if (missions.length === 0) return;
    const timer = setInterval(() => setRenderTrigger(v => v + 1), 1000);
    return () => clearInterval(timer);
  }, [missions]);

  const R_LABELS = {
    streetRunner: 'ST-RUN',
    dataThief: 'D-THIEF',
    infiltrator: 'INFILTR',
    fixer: 'FIXER',
    shadowBroker: 'BROKER'
  };

  // === GLOBAL STORY PROGRESS (Z4 Slums requirement) ===
  const slumsCaptured = captured.filter(id => AETHERIA_MAP[id]?.districtId === 'Z4').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
      
      {/* PANEL AKTÍVNYCH MISIÍ */}
      <div style={{
        marginBottom: 16,
        padding: '10px',
        background: isOverloaded ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 212, 255, 0.05)',
        borderLeft: `2px solid ${isOverloaded ? '#ef4444' : '#00d4ff'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{
            fontSize: 9,
            color: isOverloaded ? '#ef4444' : '#00d4ff',
            letterSpacing: '0.1rem',
            fontWeight: 700
          }}>
            :: ACTIVE_INFILTRATIONS [{missions.length}/{maxMissions}]
          </span>
        </div>
        {missions.length === 0 && <div style={{ fontSize: 9, color: 'var(--muted)' }}>[NO_ACTIVE_MISSIONS]</div>}
        {missions.map((m, i) => {
          const secondsLeft = Math.max(0, Math.round((m.endTime - Date.now()) / 1000));
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace', marginBottom: 4 }}>
              <span style={{ color: 'var(--amber)' }}>
                {m.label} <span style={{ color: 'var(--muted)' }}>[{R_LABELS[m.runnerType]}]</span>
              </span>
              <span style={{ color: secondsLeft > 0 ? '#00d4ff' : '#22c55e' }}>
                {secondsLeft > 0 ? `T-MINUS ${secondsLeft}s` : 'EXTRACTING...'}
              </span>
            </div>
          );
        })}
      </div>

      {/* DISTRICTY + UZLY */}
      {Object.entries(nodesByDistrict).sort((a, b) => {
        const order = ['Z4', 'Z7', 'Z2', 'Z3', 'Z6', 'Z1', 'Z5'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      }).map(([dId, nodes]) => {
        const district = AETHERIA_DISTRICTS[dId];
        const isVisible = nodes.some(n => (state.mapDiscovery ?? []).includes(n.id));
        if (!isVisible && dId !== 'Z4') return null;

        // === GATEKEEPER LOGIKA ===
        const districtCaptured = nodes.filter(n => captured.includes(n.id)).length;
        const districtTotal = nodes.length;
        const hasRegularNodes = nodes.some(n => !n.id.includes('warpgate') && !n.id.includes('buffer'));
        const nodesRequired = Math.ceil(districtTotal * 0.8);

        return (
          <div key={dId} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10,
              color: district?.color || 'var(--amber)',
              fontWeight: 700,
              marginBottom: 10,
              borderBottom: '1px solid currentColor',
              opacity: 0.8,
              letterSpacing: '0.1rem'
            }}>
              :: {district?.name || dId} :: {district?.desc}
            </div>

            {nodes.map(node => {
              const isOwned = captured.includes(node.id);
              const activeMission = missions.find(m => m.hexId === node.id);
              const isAdjacent = (node.connections ?? []).some(c => captured.includes(c));
              const isGate = node.id.includes('warpgate') || node.id.includes('buffer');

              const canHack = !isOwned && !activeMission && isAdjacent;

              // === GATE LOCK LOGIKA - iba pre neowned uzly ===
              const isGateLocked = !isOwned && isGate && (
                (hasRegularNodes && districtCaptured < nodesRequired) ||
                (dId !== 'Z4' && slumsCaptured < 6)
              );

              // Výpočet zostávajúcich uzlov
              const remainingNeeded = dId === 'Z4'
                ? Math.max(0, nodesRequired - districtCaptured)
                : Math.max(0, 6 - slumsCaptured);

              return (
                <div key={node.id} style={{
                  padding: '10px',
                  background: isOwned ? 'rgba(255,193,116,0.04)' : activeMission ? 'rgba(0, 212, 255, 0.05)' : 'var(--surface-high)',
                  borderLeft: isOwned ? '2px solid var(--amber)' : activeMission ? '2px solid #00d4ff' : '2px solid transparent',
                  marginBottom: 6,
                  opacity: (isOwned || canHack || activeMission) ? 1 : 0.4,
                  borderRadius: '2px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isOwned ? 'var(--amber)' : activeMission ? '#00d4ff' : 'inherit'
                    }}>
                      {node.icon} {node.label}
                    </span>
                    
                    <span style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      color: isOwned ? 'var(--amber)' :
                            activeMission ? '#00d4ff' :
                            isGateLocked ? '#ef4444' : 'var(--muted)'
                    }}>
                      {isOwned ? '[SECURED]' :
                       activeMission ? '[IN_PROGRESS]' :
                       isGateLocked ? `[LOCKED: ${dId === 'Z4' ? districtCaptured : slumsCaptured}/${dId === 'Z4' ? nodesRequired : 6} REQ]` :
                       (canHack ? '[READY]' : '[ENCRYPTED]')}
                    </span>
                  </div>

                  {/* TLAČIDLÁ PRE NASADENIE RUNNEROV */}
                  {canHack && !isGateLocked && (
                    <div style={{ marginTop: 8 }}>
                      {isOverloaded ? (
                        <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>[SYS_OVERLOAD: ALL CHANNELS BUSY]</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {Object.entries(state.runners).map(([type, count]) => {
                            if (count <= 0) return null;
                            return (
                              <button
                                key={type}
                                onClick={() => dispatch({ type: 'DEPLOY_RUNNER', hexId: node.id, runnerType: type })}
                                style={{
                                  padding: '4px 7px',
                                  background: 'transparent',
                                  border: '1px solid var(--amber)',
                                  color: 'var(--amber)',
                                  fontSize: 8,
                                  cursor: 'pointer',
                                  fontFamily: 'monospace'
                                }}
                              >
                                DEPLOY {R_LABELS[type]} ({count})
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Zamknutá správa - iba ak nie je secured */}
                  {isGateLocked && !isOwned && (
                    <div style={{ marginTop: 6, fontSize: 8, color: '#ef4444', fontWeight: 500 }}>
                      [!] SECURE {remainingNeeded} MORE {dId === 'Z4' ? 'NODES' : 'Z4 NODES'} TO UNLOCK GATEWAY
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── NETWORK STATUS MODULE ──
function NetworkStatusModule({ state }) {
  const mods = calculateMapModifiers(state);
  const owned = (state.capturedHexes ?? []).length;
  const total = Object.keys(AETHERIA_MAP).length;

  const revenue = Math.round((mods.goldMult - 1) * 100);
  const xp = Math.round((mods.xpBoost ?? 0) * 100);
  const siphon = Math.round((mods.siphonSuccessBonus ?? 0) * 100);
  const heatDecay = mods.heatDecayBonus?.toFixed(2) ?? '0.00';
  const rep = Math.round((mods.repBoost ?? 0) * 100);

  const parts = [];
  if (revenue > 0) parts.push(`REV: +${revenue}%`);
  if (xp > 0) parts.push(`XP: +${xp}%`);
  if (siphon > 0) parts.push(`SIPHON: +${siphon}%`);
  if (rep > 0) parts.push(`REP: +${rep}%`);
  if (mods.heatDecayBonus > 0) parts.push(`STLTH: +${heatDecay}/s`);

  return (
    <div style={{
      padding: '9px 11px',
      marginBottom: 14,
      background: 'var(--surface-high)',
      borderLeft: '3px solid var(--amber)',
      fontSize: 9,
      letterSpacing: '0.05rem',
      borderRadius: '2px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 10 }}>
          NETWORK_STATUS [{owned}/{total}]
        </span>
        <span style={{ fontSize: 8, color: 'var(--muted)' }}>:: ACTIVE_BOOSTS</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {parts.length > 0 ? (
          parts.map((p, i) => (
            <span key={i} style={{ color: '#22c55e', fontWeight: 600 }}>
              [{p}]
            </span>
          ))
        ) : (
          <span style={{ color: 'var(--muted)', opacity: 0.6 }}>[NO_ACTIVE_NODES]</span>
        )}
      </div>
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
  const [specModal,    setSpecModal]    = useState(null);   
  const [scanBtnPos,   setScanBtnPos]   = useState({ x: 35, y: 40 });
  const prevLogLen      = useRef(0);
  const prevZeroCount   = useRef(0);

  const logRef = useRef(state.log);
  logRef.current = state.log;

  const mods = calculateMapModifiers(state);

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
    if (specModal) return; 
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

  const dc             = state.dailyChallenge;
  const dcDef          = dc ? CHALLENGE_DEFS.find(d => d.type === dc.type) : null;
  const dcPct          = dc ? Math.min(100, (dc.current / dc.target) * 100) : 0;

  const dataChipCount  = state.inventory.filter(i => i.id === 'DATA_CHIP').length;
  const barterReady    = dataChipCount >= 10 && (state.barterCooldown ?? 0) === 0;
  const barterDisabled = (state.barterCooldown ?? 0) > 0 || dataChipCount < 10 || isBlocked;

  const ENC_KEY_IDS  = ['KEY_ALPHA', 'KEY_BETA', 'KEY_GAMMA', 'KEY_DELTA', 'KEY_EPSILON'];
  const encKeys      = state.encKeys ?? [];
  const canDecrypt   = ENC_KEY_IDS.every(k => encKeys.includes(k));

  const aiCycleSecs    = DEV_MODE ? 30 : 3600;
  const aiRemaining    = aiCycleSecs - (state.aiSubroutineTick ?? 0);

  const hotItems       = state.inventory.filter(i => i.isHot);
  const coolTarget     = hotItems.length > 0
    ? hotItems.reduce((a, b) => a.cooldownRemaining > b.cooldownRemaining ? a : b)
    : null;

  const SORT_MODES = ['TIME', 'VALUE', 'HOT/COLD'];
  const sortedInventory = [...state.inventory].sort((a, b) => {
    if (inventorySort === 'VALUE')    return b.gold - a.gold;
    if (inventorySort === 'HOT/COLD') {
      if (a.isHot !== b.isHot) return a.isHot ? 1 : -1;
      return a.cooldownRemaining - b.cooldownRemaining;
    }
    if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
    return a.cooldownRemaining - b.cooldownRemaining;
  });

  // ── POMOCNÍK PRE VÝPOČET PRESNÉHO ZISKU RUNNEROV ──
  const calculateCycleTotal = (type) => {
		const count = state.runners[type] || 0;
		const spec = (state.runnerSpec || {})[type];
		const stats = {
			streetRunner:  { cr: 2 },
			dataThief:     { cr: 8 },
			infiltrator:   { cr: 35 },
			fixer:         { cr: 150 },
			shadowBroker:  { cr: 600 }
		};
		const cfg = stats[type];
		const synergyMult = count >= 5 ? 1.20 : 1;
		const guildMult = (state.prestigePerks?.GUILD_MASTER) ? 1.25 : 1;
		const specGoldMult = spec === 'GREEDY' ? 1.5 : 1;
		
		return Math.round(count * cfg.cr * synergyMult * guildMult * specGoldMult);
	};

  // ── THEME LOGIC ──
  const themeColor = AETHERIA_DISTRICTS[state.district]?.color ?? '#ffc174';
    
  const dynamicThemeStyle = {
    '--amber': '#ffc174', // VŽDY jantárová pre text a UI
    '--district-color': themeColor, // Špeciálna farba len pre mapu a indikátor
    '--muted': 'rgba(255,193,116,0.3)',
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div 
      style={{ ...S.root, filter: heatFilter, ...dynamicThemeStyle }} 
      className={`${heatGlitchClass} ${heatDangerClass}`.trim()}
    >

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

      {/* ── BUSTED FLASH ── */}
      {bustedFlash && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, pointerEvents: 'none', background: 'rgba(239,68,68,0.85)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ ...S.bustedText, animation: 'bustedIn 3s ease forwards' }}>
            !! SYSTEM COMPROMISED<br />BUSTED !!
          </div>
        </div>,
        document.body
      )}

      {/* ── RAID BANNER ── */}
      {state.raidActive && createPortal(
        <div className="raid-blink" style={{
          position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 9998,
          background: 'rgba(69, 10, 10, 0.95)', border: '2px solid #ef4444',
          padding: '16px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          pointerEvents: 'none', boxShadow: '0 0 40px rgba(239,68,68,0.6)',
        }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 16,
            color: '#fca5a5', letterSpacing: '0.15rem', fontWeight: 700, textAlign: 'center'
          }}>
            !! POLICE RAID IN PROGRESS !!<br />
            <span style={{color: '#ef4444', fontSize: 20}}>LAY LOW IN {state.raidTimer}s</span><br />
            <span style={{fontSize: 12, color: 'var(--muted)'}}>OR LOSE 30% CREDITS</span>
          </span>
        </div>,
        document.body
      )}

      {/* ── SYSTEM SCAN OVERLAY ── */}
      {scanActive && createPortal(
				<>
					{/* Full-screen red pulse - JEMNEJŠÍ EFEKT */}
					<div className="scan-alert" style={{
						position: 'fixed', inset: 0, zIndex: 9994, pointerEvents: 'none',
						background: 'rgba(239,68,68,0.15)', // Len jemný nádych
						animation: 'scanPulse 1.5s ease-in-out infinite'
					}} />
					
					{/* Top warning banner - PEVNEJŠIE POZADIE */}
					<div style={{
						position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9995,
						background: '#1a0505', borderBottom: '2px solid #ef4444',
						padding: '12px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
						pointerEvents: 'none', boxShadow: '0 4px 30px rgba(0,0,0,0.8)'
					}}>
						<span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#fca5a5', letterSpacing: '0.12rem', fontWeight: 700 }}>
							!! SYSTEM_SCAN IN PROGRESS
						</span>
						<span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#ef4444', fontWeight: 700 }}>
							{scanTimer}s
						</span>
					</div>

					{/* Action Container - TERAZ AKO PEVNÝ MODUL */}
					<div style={{
						position: 'fixed',
						left: `${scanBtnPos.x}%`, top: `${scanBtnPos.y}%`,
						transform: 'translate(-50%, -50%)',
						zIndex: 9996, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
						background: '#0a0a0a', padding: '15px', border: '1px solid rgba(239,68,68,0.3)',
						boxShadow: '0 0 50px rgba(0,0,0,0.9)' // Odreže to od pulzujúceho pozadia
					}}>
						<button
							onClick={() => dispatch({ type: 'PURGE_LOGS' })}
							style={{
								background: '#000', border: '2px solid #ef4444',
								color: '#ef4444', fontFamily: '"JetBrains Mono", monospace',
								fontSize: 12, letterSpacing: '0.12rem', fontWeight: 900,
								padding: '14px 28px', cursor: 'pointer',
								boxShadow: '0 0 16px rgba(239,68,68,0.4)',
								animation: 'raidBlink 0.9s ease infinite', width: '220px'
							}}
						>
							PURGE_LOCAL_LOGS
						</button>
						
						<button
							onClick={() => dispatch({ type: 'COUNTER_HACK' })}
							style={{
								background: '#120520', border: '2px solid #a855f7',
								color: '#d8b4fe', fontFamily: '"JetBrains Mono", monospace',
								fontSize: 11, letterSpacing: '0.08rem', fontWeight: 900,
								padding: '10px 20px', cursor: 'pointer',
								boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)', width: '220px'
							}}
						>
							COUNTER-HACK [50 STA]
						</button>

						<div style={{ fontSize: 9, color: '#a855f7', marginTop: 4, opacity: 0.8 }}>
							CHANCE: 30% | REWARD: 5000 CR + HEAT 0
						</div>
					</div>
				</>,
				document.body
			)}

      {/* ── OFFLINE POPUP ── */}
      <OfflinePopup report={offlineReport} onDismiss={() => setOfflineReport(null)} />

      {/* ── RUNNER SPEC MODAL ── */}
      {specModal && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9993, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface-low)', border: '1px solid var(--amber)',
            padding: '28px 32px', minWidth: 320, maxWidth: 420, fontFamily: '"JetBrains Mono", monospace',
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14rem', marginBottom: 10 }}>:: RUNNER SPECIALIZATION</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08rem', marginBottom: 18 }}>
              {specModal.toUpperCase().replace('RUNNER','_RUNNER').replace('BROKER','_BROKER')} — LEVEL UP
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>Choose a permanent specialization for this runner type.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { dispatch({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'SHADOW' }); setSpecModal(null); }}
                style={{
                  flex: 1, background: 'transparent', border: '1px solid #22c55e', color: '#22c55e',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.1rem', padding: '12px 0', cursor: 'pointer', fontWeight: 700,
                }}
              >
                SHADOW
                <span style={{ display: 'block', fontSize: 9, fontWeight: 400, marginTop: 6, opacity: 0.8 }}>-50% Heat per cycle</span>
              </button>
              <button
                onClick={() => { dispatch({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'GREEDY' }); setSpecModal(null); }}
                style={{
                  flex: 1, background: 'transparent', border: '1px solid #ffd700', color: '#ffd700',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.1rem', padding: '12px 0', cursor: 'pointer', fontWeight: 700,
                }}
              >
                GREEDY
                <span style={{ display: 'block', fontSize: 9, fontWeight: 400, marginTop: 6, opacity: 0.8 }}>+50% Gold per cycle</span>
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
              fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
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
                ? o.critical ? `!! CRITICAL !!  +${o.gold} CR` : `+${o.gold} CR  ${o.item}`
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
            <span style={{ fontSize: 9, letterSpacing: '0.1rem', color: '#22c55e', border: '1px solid #22c55e', padding: '1px 5px' }}>DEV</span>
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
					{[
						{ id: 'DASH', label: 'DASH' }, 
						{ id: 'OPS', label: 'OPS' }, 
						{ id: 'UPGRADES', label: isUnlocked(state, 'upgrades_tab') ? 'UPG' : 'UPG [3]' }, 
						{ id: 'NET', label: isUnlocked(state, 'district') ? 'NET' : 'NET [5]' }, 
						{ id: 'SETTINGS', label: 'SYS' }
					].map(t => (
						<button key={t.id} onClick={() => {
							if (t.id === 'UPGRADES' && !isUnlocked(state, 'upgrades_tab')) return;
							if (t.id === 'NET' && !isUnlocked(state, 'district')) return;
							
							setMobileTab(t.id);
							if (t.id !== 'DASH') {
								const targetTab = t.id === 'OPS' ? 'OPERATIONS' : (t.id === 'NET' ? 'NETWORK' : t.id);
								setActiveTab(targetTab);
							}
						}} style={{
							flex: 1, padding: '9px 0', background: mobileTab === t.id ? 'var(--amber)' : 'transparent',
							color: mobileTab === t.id ? 'var(--bg)' : 'var(--muted)', border: 'none', fontFamily: '"JetBrains Mono", monospace',
							fontSize: 10, letterSpacing: '0.1rem', cursor: 'pointer', fontWeight: mobileTab === t.id ? 700 : 400,
						}}>{t.label}</button>
					))}
				</div>
			)}

      {/* ── SHAKE WRAPPER ── */}
      <div style={{ animation: shaking ? 'shake 0.45s ease' : 'none', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
           onAnimationEnd={() => setShaking(false)}>

        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 12, padding: 8, flex: 1, overflowY: 'auto', minHeight: 0 } : S.consoleGrid}>

          {/* ── LEFT COL: DASHBOARD ── */}
          {(!isMobile || mobileTab === 'DASH') && (
            <div style={{ ...S.colLeft, height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto' }}>
              
              {/* OPERATIVE HEADER */}
              <div style={{
                position: 'relative', width: '100%', height: 96, background: 'var(--surface-high)', border: '1px solid var(--amber)',
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

              {/* OPERATIVE STATS */}
              <div style={S.statRow}>
                <span style={S.statKey}><Icon component={Coins} />GOLD</span>
                <span key={`g${goldPulseKey}`} style={{ ...S.statVal, animation: goldPulseKey > 0 ? 'goldPulse 0.55s ease' : 'none' }}>
                  {state.gold.toLocaleString()} CR
                  {mods.goldMult > 1 && (
                    <span style={{ color: '#22c55e', fontSize: 10, marginLeft: 8, letterSpacing: '0.05rem' }}>
                      [+{Math.round((mods.goldMult - 1) * 100)}%]
                    </span>
                  )}
                </span>
              </div>

              {isUnlocked(state, 'rep') && (
                <div style={S.statRow}>
                  <span style={S.statKey}><Icon component={ShieldOff} />REP</span>
                  <span key={repPulseKey} style={{ ...S.statVal, animation: repPulseKey > 0 ? 'goldPulse 1s ease forwards' : 'none' }}>
                    {state.reputation.toLocaleString()}
                    {mods.repBoost > 0 && (
                      <span style={{ color: '#22c55e', fontSize: 10, marginLeft: 8, letterSpacing: '0.05rem' }}>
                        [+{Math.round(mods.repBoost * 100)}%]
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div style={S.statRow}>
                <span style={S.statKey}><Icon component={Activity} />LEVEL</span>
                <span style={S.statVal}>{state.level}</span>
              </div>

              {isUnlocked(state, 'xp') && (
                <>
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={TrendingUp} />XP</span>
                    <span style={S.statVal}>{state.xp.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
                  </div>
                  <Bar pct={xpPct} />
                </>
              )}

              {isUnlocked(state, 'stamina') && (
                <>
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Zap} />STAMINA</span>
                    <span style={S.statVal}>{state.stamina} / {effectiveMaxStamina}</span>
                  </div>
                  <Bar pct={staminaPct} />
                </>
              )}

              {isUnlocked(state, 'heat') && (
                <>
                  <div style={S.statRow}>
                    <span style={S.statKey}><Icon component={Flame} color={heatColor} />HEAT</span>
                    <span style={{ ...S.statVal, color: heatColor }}>
                      {heatRound}% [{heatStat}]
                      {(state.heatSpikeTimer ?? 0) > 0 && <span style={{ marginLeft: 8, fontSize: 9, color: '#ef4444' }}>SPIKE [{state.heatSpikeTimer}s]</span>}
                    </span>
                  </div>
                  <Bar pct={heatRound} color={heatColor} />
                </>
              )}

              {/* RUNNERS STATUS */}
              {(state.runners.streetRunner > 0 || state.runners.dataThief > 0 || state.runners.infiltrator > 0 || state.runners.fixer > 0 || state.runners.shadowBroker > 0) && (
                <div style={{ marginTop: 14, paddingTop: 8, borderTop: '1px solid var(--surface-high)' }}>
                  {state.runners.streetRunner > 0 && (
                    <div style={S.statRow}>
                      <span style={S.statKey}><Icon component={Users} />S_RUN</span>
                      <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                        {state.runners.streetRunner}x · +{calculateCycleTotal('streetRunner')} CR · {Math.max(0, srCycle - state.runnerTick.streetRunner)}s
                      </span>
                    </div>
                  )}
                  {state.runners.dataThief > 0 && (
                    <div style={S.statRow}>
                      <span style={S.statKey}><Icon component={Users} />D_THIEF</span>
                      <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                        {state.runners.dataThief}x · +{calculateCycleTotal('dataThief')} CR · {Math.max(0, dtCycle - state.runnerTick.dataThief)}s
                      </span>
                    </div>
                  )}
                  {state.runners.infiltrator > 0 && (
                    <div style={S.statRow}>
                      <span style={S.statKey}><Icon component={Users} />INF</span>
                      <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                        {state.runners.infiltrator}x · +{calculateCycleTotal('infiltrator')} CR · {Math.max(0, ifCycle - state.runnerTick.infiltrator)}s
                      </span>
                    </div>
                  )}
                  {state.runners.fixer > 0 && (
                    <div style={S.statRow}>
                      <span style={S.statKey}><Icon component={Users} />FIX</span>
                      <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                        {state.runners.fixer}x · +{calculateCycleTotal('fixer')} CR · {Math.max(0, fxCycle - state.runnerTick.fixer)}s
                      </span>
                    </div>
                  )}
                  {state.runners.shadowBroker > 0 && (
                    <div style={S.statRow}>
                      <span style={S.statKey}><Icon component={Users} />S_BRKR</span>
                      <span style={{ ...S.statVal, fontSize: 11, color: '#22c55e' }}>
                        {state.runners.shadowBroker}x · +{calculateCycleTotal('shadowBroker')} CR · {Math.max(0, sbCycle - state.runnerTick.shadowBroker)}s
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── PERSISTENT NETWORK STATS (GRID_STATUS) ── */}
              <div style={{ 
                marginTop: 20, 
                marginBottom: 16, 
                padding: '12px', 
                background: 'rgba(255,193,116,0.03)', 
                border: '1px solid var(--muted)',
                borderRadius: '3px'
              }}>
                <div style={{ 
                  fontSize: 9, 
                  color: 'var(--muted)', 
                  letterSpacing: '0.15rem', 
                  marginBottom: 10, 
                  borderBottom: '1px solid var(--muted)', 
                  paddingBottom: 4 
                }}>
                  :: GRID_STATUS
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 8, color: 'var(--muted)' }}>REVENUE</div>
                    <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>
                      +{Math.round((calculateMapModifiers(state).goldMult - 1) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: 'var(--muted)' }}>XP_GAIN</div>
                    <div style={{ fontSize: 12, color: '#00d4ff', fontWeight: 700 }}>
                      +{Math.round((calculateMapModifiers(state).xpBoost ?? 0) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: 'var(--muted)' }}>ACTIVE_NODES</div>
                    <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>
                      {state.capturedHexes?.length || 0} / 31
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: 'var(--muted)' }}>SIPHON_RATE</div>
                    <div style={{ fontSize: 12, color: '#a855f7', fontWeight: 700 }}>
                      +{Math.round((calculateMapModifiers(state).siphonSuccessBonus ?? 0))}%
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── CENTER COL: TABS ── */}
          {(!isMobile || mobileTab === 'OPS' || mobileTab === 'NET' || mobileTab === 'UPGRADES' || mobileTab === 'SETTINGS' ) && (
            <div style={{ ...S.colCenter, height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'hidden' }}>
              
              {/* TABS HEADER */}
              {!isMobile && (
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  <Tab 
                    label="OPS" 
                    active={activeTab === 'OPERATIONS'} 
                    onClick={() => setActiveTab('OPERATIONS')} 
                  />
                  <Tab 
                    label={isUnlocked(state, 'upgrades_tab') ? 'UPGRADES' : 'UPG [LVL 3]'}
                    active={activeTab === 'UPGRADES'} 
                    onClick={() => isUnlocked(state, 'upgrades_tab') && setActiveTab('UPGRADES')} 
                  />
                  <Tab 
                    label={isUnlocked(state, 'district') ? 'NETWORK' : 'NET [LVL 5]'} 
                    active={activeTab === 'NETWORK'} 
                    onClick={() => isUnlocked(state, 'district') && setActiveTab('NETWORK')} 
                  />
                  <Tab 
                    label="SETTINGS" 
                    active={activeTab === 'SETTINGS'} 
                    onClick={() => setActiveTab('SETTINGS')} 
                  />
                </div>
              )}

              {/* ── NETWORK TAB ── */}
              {activeTab === 'NETWORK' && isUnlocked(state, 'district') && (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <NetworkManager state={state} dispatch={dispatch} />
                </div>
              )}

              
            {/* ── 2. OPS TAB (ULTRACLEAN + FULL SCROLL + ALL DETAILS) ── */}
            {activeTab === 'OPERATIONS' && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                paddingRight: 6,
                gap: 10,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>

                {/* ── SECTION 1: TARGET BRIEFING ── */}
                <div style={{
                  background: 'var(--surface-high)',
                  border: `1px solid ${AETHERIA_DISTRICTS[state.district]?.color || 'var(--muted)'}`,
                  padding: '12px',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '3px'
                }}>
                  {/* Dekoratívne pozadie */}
                  <div style={{
                    position: 'absolute', right: -20, top: -10, fontSize: 72, fontWeight: 900,
                    color: AETHERIA_DISTRICTS[state.district]?.color, opacity: 0.06,
                    pointerEvents: 'none', userSelect: 'none'
                  }}>
                    {state.district}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, zIndex: 1 }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.2rem' }}>:: ACTIVE_OPERATION_TARGET</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: AETHERIA_DISTRICTS[state.district]?.color, letterSpacing: '0.1rem' }}>
                        {AETHERIA_DISTRICTS[state.district]?.name || 'UNKNOWN_SECTOR'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, color: AETHERIA_DISTRICTS[state.district]?.color, fontWeight: 900 }}>
                        x{AETHERIA_DISTRICTS[state.district]?.lootMultiplier || '1.0'}
                      </div>
                      <div style={{ fontSize: 8, color: 'var(--muted)' }}>LOOT MULTIPLIER</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, zIndex: 1 }}>
                    {[...new Set((state.capturedHexes || []).map(id => AETHERIA_MAP[id]?.districtId).filter(Boolean))].map(dId => (
                      <button
                        key={dId}
                        onClick={() => dispatch({ type: 'SET_DISTRICT', district: dId })}
                        style={{
                          padding: '4px 10px',
                          fontSize: 10,
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          background: state.district === dId ? (AETHERIA_DISTRICTS[dId]?.color || 'var(--amber)') : 'transparent',
                          color: state.district === dId ? '#000' : (AETHERIA_DISTRICTS[dId]?.color || 'var(--amber)'),
                          border: `1px solid ${AETHERIA_DISTRICTS[dId]?.color || 'var(--amber)'}`,
                          fontWeight: state.district === dId ? 700 : 400,
                        }}
                      >
                        {AETHERIA_DISTRICTS[dId]?.name || dId}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.45, zIndex: 1 }}>
                    {AETHERIA_DISTRICTS[state.district]?.desc}
                  </div>
                </div>

                {/* ── SECTION 2: PROTOCOLS ── */}
                {isUnlocked(state, 'protocol') && (
                  <div style={{ padding: '10px', background: 'var(--surface-high)', border: '1px solid var(--surface-high)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1rem' }}>:: OPERATION_PROTOCOL</span>
                      {activeProtoDef && (
                        <span style={{ fontSize: 9, color: activeProtoDef.color, fontWeight: 700 }}>
                          [{activeProtocol}]
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 5 }}>
                      {Object.entries(PROTOCOL_DEFS).map(([key, def]) => {
                        const active = activeProtocol === key;
                        return (
                          <button
                            key={key}
                            onClick={() => dispatch({ type: 'SET_PROTOCOL', protocol: key })}
                            style={{
                              flex: 1,
                              background: active ? 'rgba(0,0,0,0.6)' : 'transparent',
                              border: `1px solid ${active ? def.color : 'var(--muted)'}`,
                              color: active ? def.color : 'var(--muted)',
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: 9.5,
                              padding: '9px 6px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              lineHeight: 1.2
                            }}
                          >
                            {def.label}
                            <span style={{ display: 'block', fontSize: 8, opacity: 0.75, marginTop: 2 }}>
                              {def.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {activeProtocol !== 'NONE' && (
                      <button
                        onClick={() => dispatch({ type: 'SET_PROTOCOL', protocol: 'NONE' })}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          fontFamily: 'monospace',
                          fontSize: 9,
                          padding: '5px',
                          cursor: 'pointer',
                          marginTop: 7
                        }}
                      >
                        DEACTIVATE_PROTOCOL
                      </button>
                    )}
                  </div>
                )}

                {/* ── SECTION 3: COMBO + ACTIONS ── */}
                <div style={{ flexShrink: 0 }}>
                  {/* Combo Meter */}
                  <div style={{
                    height: 26,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    background: comboCount > 0 ? 'var(--surface-high)' : 'transparent',
                    border: comboCount > 0 ? `1px solid ${comboHigh ? '#ffc174' : 'var(--muted)'}` : '1px solid transparent',
                  }}>
                    {comboCount > 0 && (
                      <>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.1rem',
                          color: comboHigh ? '#ffc174' : 'var(--muted)',
                          animation: comboHigh ? 'goldPulse 1.2s ease infinite' : 'none'
                        }}>
                          COMBO x{comboCount}
                        </span>
                        <span style={{ fontSize: 9, color: 'var(--muted)' }}>
                          [+{Math.round(comboPct * 100)}% VALUE]
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { id: 'SIPHON', label: `SIPHON_ [${siphonCost} STA]`, chance: siphonChance, disabled: isBlocked || state.stamina < siphonCost || invFull },
                      { id: 'BREACH', label: 'BREACH_ [25 STA]', chance: breachChance, disabled: isBlocked || state.stamina < 25 || invFull, cond: isUnlocked(state, 'breach') },
                      { id: 'DEEP_SIPHON', label: 'DEEP_SIPHON_ [15 STA]', chance: deepSiphonChance, disabled: isBlocked || state.stamina < 15 || invFull, cond: isUnlocked(state, 'deep_siphon') },
                      { id: 'MAINFRAME_HACK', label: 'MAINFRAME_HACK_ [40 STA]', chance: mainframeChance, disabled: isBlocked || state.stamina < 40 || invFull, cond: isUnlocked(state, 'mainframe') },
                      { id: 'LAY_LOW', label: `LAY_LOW_ ${state.layLowActive ? `[${state.layLowTimer}s]` : ''}`, disabled: state.bustedLockout > 0 || (state.layLowCooldown > 0 && !state.raidActive), active: state.layLowActive },
                      { id: 'SELL_COOLED_ITEMS', label: 'SELL_COOLED_ITEMS_', disabled: coldCount === 0, extra: coldCount > 0 ? <span style={{color: '#22c55e'}}>[+{coldValue.toLocaleString()} CR]</span> : <span style={{color: 'var(--muted)'}}>[WAIT FOR COLD]</span> },
                      { id: 'MANUAL_COOL', label: 'COOL_DOWN_ [-15s · 5 STA]', disabled: hotItems.length === 0 || state.stamina < 5, cond: isUnlocked(state, 'manual_cool') },
                      { id: 'DARK_MARKET', label: 'DARK_MARKET_', disabled: dmDisabled, cond: isUnlocked(state, 'dark_market') },
                      { id: 'BARTER', label: 'BARTER_ [10x DATA_CHIP → +1 REP]', disabled: barterDisabled, cond: isUnlocked(state, 'barter') },
                    ].filter(btn => btn.cond !== false).map(btn => (
                      <ProtoBtn
                        key={btn.id}
                        onClick={() => dispatch({ type: btn.id })}
                        disabled={btn.disabled}
                        active={btn.active}
                        style={{ flex: '1 1 calc(50% - 3px)', minHeight: 38, fontSize: 10, justifyContent: 'center' }}
                      >
                        {btn.label}
                        {btn.chance !== null && btn.chance !== undefined && <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 9 }}>[{btn.chance}%]</span>}
                        {btn.extra}
                        {btn.id === 'DARK_MARKET' && dmLocked && <span style={{marginLeft:8, color:'#ef4444', fontSize:9}}>[50 REP]</span>}
                        {btn.id === 'DARK_MARKET' && dmBusy && <span style={{marginLeft:8, color:'var(--muted)', fontSize:9}}>[CD: {fmtDuration(state.darkMarketCooldown)}]</span>}
                        {btn.id === 'BARTER' && (state.barterCooldown ?? 0) > 0 && <span style={{marginLeft:8, color:'var(--muted)', fontSize:9}}>[CD]</span>}
                      </ProtoBtn>
                    ))}
                  </div>
                </div>

                {/* ── SECTION 4: SYSTEM LOGS (zabera zvyšok miesta + scroll) ── */}
                <div style={{ 
                  flex: 1, 
                  minHeight: 350, 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid var(--surface-high)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 12px',
                    background: 'var(--surface-high)',
                    borderBottom: '1px solid var(--muted)',
                    flexShrink: 0 
                  }}>
                    <span style={S.panelLabel}>:: SYSTEM_LOGS</span>
                    <span style={{
                      color: state.bustedLockout > 0 ? '#ef4444' : '#22c55e',
                      fontSize: 10,
                      letterSpacing: '0.1rem'
                    }}>
                      {state.bustedLockout > 0 ? `LOCKOUT: ${state.bustedLockout}s` : 'SYSTEM_STABLE'}
                    </span>
                  </div>

                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    {state.log.length === 0 ? (
                      <span style={{ color: 'rgba(255,193,116,0.25)', fontSize: 11, padding: '30px 0', textAlign: 'center' }}>
                        ... AWAITING_PROTOCOL ...
                      </span>
                    ) : (
                      state.log.map((entry, i) => {
                        const upper = entry.toUpperCase();
                        let color = 'var(--muted)';
                        if (upper.includes('[BUSTED]') || upper.includes('RAID') || upper.includes('SEIZED') || upper.includes('LOSE')) color = '#ef4444';
                        else if (upper.includes('WARNING') || upper.includes('BOUNTY') || upper.includes('ABORTED')) color = '#f97316';
                        else if (upper.includes('SUCCESS') || upper.includes('CAPTURED') || upper.includes('SOLD') || upper.includes('CLEARED')) color = '#22c55e';
                        else if (upper.includes('LEVEL UP') || upper.includes('PROTOCOL')) color = '#00d4ff';
                        else if (entry.includes('[ZERO >>]')) color = '#88ffaa';

                        return (
                          <div
                            key={i === 0 ? `n-${newestLogKey}` : i}
                            style={{
                              fontSize: 10,
                              lineHeight: 1.45,
                              opacity: Math.max(0.4, 1 - i * 0.045),
                              color: color,
                              animation: i === 0 ? 'typeIn 0.3s ease' : 'none'
                            }}
                          >
                            {entry}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── UPGRADES TAB ── */}
            {activeTab === 'UPGRADES' && (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                
                {/* CREDIT UPGRADES (Zlatá) */}
                <div style={{ borderBottom: '1px solid var(--amber)', paddingBottom: 4, marginBottom: 12 }}>
                  <span style={{ ...S.panelLabel, color: 'var(--amber)', letterSpacing: '0.15rem' }}>
                    :: OPERATIVE_UPGRADES [CR]
                  </span>
                </div>
                
                {UPGRADE_DEFS.map(def => (
                  <UpgradeCard 
                    key={def.key} 
                    def={def} 
                    level={state.upgrades[def.key] ?? 0} 
                    gold={state.gold} 
                    dispatch={dispatch} 
                  />
                ))}

                {/* INTEL UPGRADES (Fialová) */}
                {isUnlocked(state, 'intel') && (
                  <>
                    <div style={{ borderBottom: '1px solid #a855f7', paddingBottom: 4, marginTop: 20, marginBottom: 12 }}>
                      <span style={{ ...S.panelLabel, color: '#a855f7', letterSpacing: '0.15rem' }}>
                        :: INTEL_&_ASSETS [REP]
                      </span>
                    </div>
                    {INTEL_UPGRADE_DEFS.map(def => {
                      const level = state.intelUpgrades?.[def.key] ?? 0;
                      const maxed = level >= def.max;
                      const canAfford = state.reputation >= def.repCost;
                      
                      return (
                        <div key={def.key} style={{ ...S.card, borderColor: maxed ? '#22c55e' : (canAfford ? '#a855f7' : 'var(--surface-high)'), background: maxed ? 'rgba(34,197,94,0.05)' : 'var(--surface-high)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: maxed ? '#22c55e' : '#d8b4fe' }}>
                              {def.label}
                            </span>
                            <span style={{ fontSize: 10, color: maxed ? '#22c55e' : 'var(--muted)', fontFamily: 'monospace' }}>
                              {maxed ? 'ACTIVE' : `LVL ${level} / ${def.max}`}
                            </span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', margin: '6px 0', lineHeight: 1.4 }}>{def.effect}</div>
                          {!maxed && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontSize: 10, color: canAfford ? '#a855f7' : '#ef4444', fontFamily: 'monospace' }}>
                                {state.reputation.toLocaleString()} / {def.repCost} REP
                              </span>
                              <BuyBtn 
                                canAfford={canAfford} maxed={maxed} label="ACQUIRE" 
                                onClick={() => dispatch({ type: 'BUY_INTEL_UPGRADE', key: def.key })} 
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* HIRED RUNNERS (Zelená) */}
                {isUnlocked(state, 'runners') && (
                  <>
                    <div style={{ borderBottom: '1px solid #22c55e', paddingBottom: 4, marginTop: 20, marginBottom: 12 }}>
                      <span style={{ ...S.panelLabel, color: '#22c55e', letterSpacing: '0.15rem' }}>
                        :: HIRED_RUNNERS [ASSETS]
                      </span>
                    </div>

                    <RunnerCard runnerType="streetRunner" label="STREET_RUNNER"
                      count={state.runners.streetRunner} gold={state.gold} level={state.level}
                      unlockLevel={3} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={300} cycleSeconds={srCycle} crPerRunner={2} heatPerRunner={1}
                      runnerXp={state.runnerXp?.streetRunner ?? 0} runnerSpec={state.runnerSpec?.streetRunner ?? null}
                      cycleTotal={calculateCycleTotal('streetRunner')} dispatch={dispatch} />

                    <RunnerCard runnerType="dataThief" label="DATA_THIEF"
                      count={state.runners.dataThief} gold={state.gold} level={state.level}
                      unlockLevel={5} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={800} cycleSeconds={dtCycle} crPerRunner={8} heatPerRunner={2}
                      runnerXp={state.runnerXp?.dataThief ?? 0} runnerSpec={state.runnerSpec?.dataThief ?? null}
                      cycleTotal={calculateCycleTotal('dataThief')} dispatch={dispatch} />

                    <RunnerCard runnerType="infiltrator" label="INFILTRATOR"
                      count={state.runners.infiltrator} gold={state.gold} level={state.level}
                      unlockLevel={7} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={2500} cycleSeconds={ifCycle} crPerRunner={35} heatPerRunner={3}
                      runnerXp={state.runnerXp?.infiltrator ?? 0} runnerSpec={state.runnerSpec?.infiltrator ?? null}
                      cycleTotal={calculateCycleTotal('infiltrator')} dispatch={dispatch} />

                    <RunnerCard runnerType="fixer" label="FIXER"
                      count={state.runners.fixer} gold={state.gold} level={state.level}
                      unlockLevel={9} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={8000} cycleSeconds={fxCycle} crPerRunner={150} heatPerRunner={1}
                      runnerXp={state.runnerXp?.fixer ?? 0} runnerSpec={state.runnerSpec?.fixer ?? null}
                      cycleTotal={calculateCycleTotal('fixer')} dispatch={dispatch} />

                    <RunnerCard runnerType="shadowBroker" label="SHADOW_BROKER"
                      count={state.runners.shadowBroker} gold={state.gold} level={state.level}
                      unlockLevel={1} requiresPrestige={1} prestige={state.prestige ?? 0}
                      baseCost={25000} cycleSeconds={sbCycle} crPerRunner={600} heatPerRunner={0}
                      runnerXp={state.runnerXp?.shadowBroker ?? 0} runnerSpec={state.runnerSpec?.shadowBroker ?? null}
                      cycleTotal={calculateCycleTotal('shadowBroker')} dispatch={dispatch} />
                  </>
                )}
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

          {/* ── RIGHT COL: INVENTORY ── */}
					{(!isMobile || mobileTab === 'DASH') && (
					<div style={{ ...S.colRight, width: isMobile ? '100%' : '320px', height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto' }}>
						<div style={{ background: 'var(--surface-low)', padding: 16, marginBottom: 2 }}>
							
							{state.inventory.some(i => i.isQuantum) && (
								<div style={{
									fontSize: 9, fontWeight: 700, letterSpacing: '0.15rem', color: '#ffd700',
									marginBottom: 10, padding: '6px 10px', background: 'rgba(255,215,0,0.08)',
									borderLeft: '3px solid #ffd700', borderRight: '3px solid #ffd700',
									animation: 'goldPulse 2s ease infinite', textAlign: 'center'
								}}>
									:: QUANTUM CORE DETECTED ::
								</div>
							)}

							<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sortedInventory.length ? 10 : 0 }}>
								<span style={{ ...S.panelLabel, display: 'inline', marginBottom: 0 }}><Icon component={Package} /> :: INVENTORY</span>
								<span style={{ fontSize: 11, color: invFull ? '#ef4444' : 'var(--muted)' }}>{state.inventory.length}/{maxInventory}</span>
								
								{/* VRÁTENÝ SORT BUTTON */}
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
											
											{typeof ITEM_FLAVOR !== 'undefined' && ITEM_FLAVOR[baseItemId] && (
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
              {/* ── MISSION COMPLETE SPLASH SCREEN ── */}
              {state.missionSplash && createPortal(
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{
                    background: 'var(--surface-low)', border: '2px solid #22c55e',
                    padding: '40px', minWidth: 400, textAlign: 'center',
                    boxShadow: '0 0 40px rgba(34, 197, 94, 0.2)',
                    animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}>
                    <div style={{ fontSize: 12, color: '#22c55e', letterSpacing: '0.3rem', marginBottom: 10 }}>:: INFILTRATION_SUCCESS ::</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--bg)', background: '#22c55e', padding: '10px', letterSpacing: '0.1rem', marginBottom: 20 }}>
                      {state.missionSplash.label}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 30 }}>
                      <div style={{ background: 'var(--surface-high)', padding: '10px', border: '1px solid #22c55e' }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>FUNDS_EXTRACTED</div>
                        <div style={{ fontSize: 16, color: '#ffc174', fontWeight: 700 }}>+{state.missionSplash.gold.toLocaleString()} CR</div>
                      </div>
                      <div style={{ background: 'var(--surface-high)', padding: '10px', border: '1px solid #22c55e' }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>EXP_GAINED</div>
                        <div style={{ fontSize: 16, color: '#00d4ff', fontWeight: 700 }}>+{state.missionSplash.xp.toLocaleString()} XP</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => dispatch({ type: 'CLEAR_SPLASH' })}
                      style={{ 
                        width: '100%', padding: '14px', background: 'transparent', 
                        border: '1px solid #22c55e', color: '#22c55e', 
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.2rem', cursor: 'pointer' 
                      }}
                    >
                      [ ACKNOWLEDGE ]
                    </button>
                  </div>
                </div>,
                document.body
              )}
						</div>
					</div>
					)}
        </div>
      </div>
    </div>
  );
}

// ── STYLE TOKENS ─────────────────────────────────────────────────────────────

const S = {
  root: { height: '100vh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--amber)', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-low)', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 20 },
  headerTitle: { fontWeight: 700, letterSpacing: '0.15rem', fontSize: 13 },
  muted:       { color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1rem' },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2 },
  consoleGrid: { display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: 2, padding: 2, flex: 1, overflow: 'hidden', alignItems: 'stretch' },
  colLeft:     { background: 'var(--surface-low)', padding: 16, height: '100%', overflowY: 'auto', boxSizing: 'border-box' },
  colCenter:   { background: 'var(--surface-low)', padding: 16, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  colRight:    { background: 'var(--surface-low)', padding: 0, height: '100%', overflowY: 'auto', width: '320px', flexShrink: 0, boxSizing: 'border-box' },
  panel:       { background: 'var(--surface-low)', padding: 16 },
  panelLabel:  { display: 'block', color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1rem', textTransform: 'uppercase', marginBottom: 14 },
  statRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  statKey:     { color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1rem', textTransform: 'uppercase' },
  statVal:     { color: 'var(--amber)', fontWeight: 700, fontSize: 13 },
  track:       { width: '100%', height: 2, background: 'var(--surface-high)', marginBottom: 12 },
  fill:        { height: '100%', background: 'var(--amber)' },
  btn:         { display: 'block', width: '100%', background: 'var(--surface-high)', border: '1px solid var(--amber)', color: 'var(--amber)', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: '0.1rem', textTransform: 'uppercase', textAlign: 'left', padding: '12px 14px', cursor: 'pointer', marginBottom: 7, borderRadius: 0, transition: 'background 0.08s, color 0.08s, box-shadow 0.12s' },
  card:        { background: 'var(--surface-high)', padding: '10px 12px', marginBottom: 4 },
  section:     { background: 'var(--surface-low)', margin: 2, padding: 16 },
  itemRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--surface-high)', marginBottom: 3 },
  logsHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logEntry:    { fontSize: 11, letterSpacing: '0.03rem' },
  bustedText:  { color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '0.18rem', textAlign: 'center', lineHeight: 1.5, fontFamily: '"JetBrains Mono", monospace', textShadow: '0 0 30px rgba(255,255,255,0.5)' },
  settingsBtn: { background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.1rem', padding: '6px 14px', cursor: 'pointer', width: '100%', textAlign: 'left' },
};