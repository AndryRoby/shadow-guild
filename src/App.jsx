import { useReducer, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { audioManager } from './audio/AudioManager.js';
import { createPortal } from 'react-dom';
import {
  Zap, Flame, Coins, TrendingUp, Package, Cpu,
  Activity, ChevronUp, Users, ShieldOff, Star, Eye, Shield, MessageSquare, User
} from 'lucide-react';
import {
  checkLevelUp, siphon, breach, deepSiphon, mainframeHack, layLow, sellCooledItems, sellSingleItem, darkMarket, barter, manualCool, decrypt,
  buyUpgrade, buyIntelUpgrade, hireRunner, setDistrict, warpTime, prestige, tick, addLog, buyReveal, REVEAL_DEFS,
  xpRequired, heatStatus, effectiveSuccessRate, calculateOfflineProgress, respecPrestigePerks,
  UPGRADE_DEFS, INTEL_UPGRADE_DEFS, CHALLENGE_DEFS, ACHIEVEMENT_DEFS, PRESTIGE_PERK_DEFS, checkTutorialDialogues,
  getUpgradeCost, getRunnerCost, isUnlocked, buyPrestigePerk, setProtocol, purgeLogs, setRunnerSpec,
  DEV_MODE, SAVE_KEY, exportSave, importSave, ITEM_FLAVOR, PROTOCOL_DEFS, counterHack, isEyeAwakened,
  canCapture, calculateMapModifiers, getInitialDiscovery, getMapDataForVis, getIntelUpgradeCost, severConnection, applyIncome
} from './gameLogic.js';
import {
  CITY_MAP as AETHERIA_MAP,
  DISTRICTS as AETHERIA_DISTRICTS,
  MAP_STATS,
} from '../CITY_MAP.js';
import { getTabBadges, getUIVisibility, getVisibleTabs  } from './selectors.js';
import { Panel, Row, Tag, DataBar, BBtn, MiniStat, fmt, COLORS } from './design/primitives.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { InventoryPanel } from './components/InventoryPanel.jsx';
import { OpsTab } from './components/OpsTab.jsx';
import { AgencyTab } from './components/AgencyTab.jsx';
import { UpgradesTab } from './components/UpgradesTab.jsx';
import { NetworkTab } from './components/NetworkTab.jsx';
import { AwakeningTab } from './components/AwakeningTab.jsx';
import { SettingsTab } from './components/SettingsTab.jsx';
import { BootSequence } from './components/BootSequence.jsx';
import { ZeroIntroScreen } from './components/ZeroIntroScreen.jsx';
import { ZeroOverlay } from './components/ZeroOverlay.jsx';



const getTimestamp = () => {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// maxInventory is always derived — never stored in state
function calcMaxInventory(upgrades) {
  return 12 + (upgrades?.voidDrive ?? 0) * 2;
}

// ==========================================
// 1. CONSTANTS & UTILS
// ==========================================

// Helper pre CSS triedy
const cn = (...classes) => classes.filter(Boolean).join(' ');

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const FRESH_STATE = {
  saveVersion: 8,
  gold:               0,
  reputation:         0,
  maxReputation:      0,
  heat:               0,
  stamina:            100,
  level:              1,
  xp:                 0,
  prestige:           0,
  prestigeMultiplier: 1.0,
  totalGoldEarned:    0,
  runGoldEarned:      0,
  totalActions: 0,
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
  comboTimer:         0,          // ← NOVÉ
  comboShatterKey:    0,          // ← NOVÉ
  lastLogTier:        'normal',   // ← NOVÉ
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
  lastInteractionTime: Date.now(),
  isIdle: false,
  idlePromptActive: false,
  idlePromptTimestamp: 0,
  alignment: { ghost: 0, rebel: 0, architect: 0 },
	storyFlags: { firstRaid: false, metZero: false, darkMarketFound: false },
	prestigeModalOpen: false, // Ovláda zobrazenie Zero varovania
	offlineReport: null,      // Príprava pre "While you were ghosting..."
  reclaiming: {}, // hexId: { progress: 0, stage: 'SCAN' }
  nodeStability: {}, // Bude ukladať { hexId: 100 }
  overclockActive: false,
  overclockCooldown: 0,  // Sekundy, kým sa dá znova zapnúť
  agents: [],
  everFailedThisRun: false,
  prestigeReadyNotified: false,
  squadUnlocked: false,      // Odomkne Squad System
  awakaningTabUnlocked: false, // Odomkne Prestige Tab
  shownTips: [],             // Zoznam zobrazených tipov (aby sa neopakovali)
  agentBonds: [],            // Prebudované v Fáze 3

  // ─── PROGRESSION TRACKING ────────────────────────────────
  peakGold: 0,
  milestones: {},             // { id: timestamp } — prevents milestone replay
  milestoneToastQueue: [],    // FIFO — consumed by toast renderer
  sessionStartTime: Date.now(),
  totalPlayTime: 0,
  runPlayTime: 0,
  eyeAwakenedTriggered: false,  // One-time trigger flag for awakening event
  // ─── DISTRICT HEAT (H4.1) ─────────────────────────────────
  districtHeat: { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0, Z6: 0, Z7: 0 },
  hotZones: {},              // { districtId: true } — zones that have been hot for 10+ ticks
  districtHeatHotTicks: {},  // Internal counter per district
  // ─── HUNTER SYSTEM (H4.5) ─────────────────────────────────
  hunterActive: false,
  hunterProgress: 0,           // 0-60, at 60 → hunter spawns
  hunterLocation: null,        // district id where hunter operates
  silenceActive: false,        // Named hunter "Silence" — invisible without NET_SCANNER
  silenceDefeated: 0,          // Times killed (for prestige-ish tracking)
  zeroDialoguesSeen: [],
  zeroQueue:          [],
  lastZeroEmit:       0,
  zeroDialoguesSeen:  [],
  reveals: {},
  zeroLastMessage: null,
  zeroHistory: [],
};

const DEV_START = {
  ...FRESH_STATE,
  gold:               500000,
  reputation:         50000,
  maxReputation:      50000,
  level:              20,
  xp:                 0,
  prestige:           3,
  prestigePoints:     10,
  prestigeMultiplier: 2.0,
  runGoldEarned:      100000000,
  totalGoldEarned:    500000,
};

function loadInitialState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return DEV_MODE ? DEV_START : FRESH_STATE;

    const parsed = JSON.parse(saved);

    // Deep merge: spojí hlboké objekty, aby sa nové fieldy nestratili
    return {
      // 1. Základ zo všetkých defaultov
      ...FRESH_STATE,
      // 2. Prekrytie uloženými dátami
      ...parsed,

      // 3. Reset transientného stavu (premenné, ktoré sa nemajú ukladať)
      feedback: null,

      // 4. Hĺbkový merge pre vnorené objekty (Deep Merge)
      // Zabezpečí, že ak v novom update pridáš field do objektu, 
      // existujúci save ho nezmaže, ale doplní si chýbajúce z FRESH_STATE
      upgrades:      { ...FRESH_STATE.upgrades,      ...(parsed.upgrades || {}) },
      intelUpgrades: { ...FRESH_STATE.intelUpgrades, ...(parsed.intelUpgrades || {}) },
      runners:       { ...FRESH_STATE.runners,       ...(parsed.runners || {}) },
      runnerTick:    { ...FRESH_STATE.runnerTick,    ...(parsed.runnerTick || {}) },
      runnerXp:      { ...FRESH_STATE.runnerXp,      ...(parsed.runnerXp || {}) },
      runnerSpec:    { ...FRESH_STATE.runnerSpec,    ...(parsed.runnerSpec || {}) },
      districtHeat:  { ...FRESH_STATE.districtHeat,  ...(parsed.districtHeat || {}) },
      hotZones:      { ...FRESH_STATE.hotZones,      ...(parsed.hotZones || {}) },
      reveals:       { ...(FRESH_STATE.reveals ?? {}), ...(parsed.reveals || {}) },
      prestigePerks: { ...(FRESH_STATE.prestigePerks ?? {}), ...(parsed.prestigePerks || {}) },
      systemScan:    { ...FRESH_STATE.systemScan,    ...(parsed.systemScan || {}) },
      milestones:    { ...FRESH_STATE.milestones,    ...(parsed.milestones || {}) },

      // 5. Konzistentnosť dát
      maxReputation: Math.max(parsed.maxReputation ?? 0, parsed.reputation ?? 0),
      runGoldEarned: parsed.runGoldEarned ?? parsed.totalGoldEarned ?? 0,
      zeroMessages:  parsed.zeroMessages ?? [],
    };
  } catch (e) {
    console.error("Save corrupted, loading default state:", e);
    return DEV_MODE ? DEV_START : FRESH_STATE;
  }
}

// ── GLOBÁLNY HELPER PRE LIEČENIE ──
const getHealCost = (agent) => {
  if (!agent) return 0;
  const base = agent.role === 'streetRunner' ? 150 :
               agent.role === 'dataThief' ? 600 :
               agent.role === 'infiltrator' ? 2000 : 6000;
  return Math.max(50, Math.floor(base * ((agent.fatigue || 0) / 100)));
};


const INITIAL_STATE = loadInitialState();


// ── REDUCER ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
	switch (action.type) {
		case 'SIPHON':            return siphon(state);
		case 'BREACH':            return breach(state);
		case 'DEEP_SIPHON':       return deepSiphon(state);
		case 'LAY_LOW':           return layLow(state);
		case 'SELL_COOLED_ITEMS': return sellCooledItems(state);
    case 'SELL_ITEM':         return sellSingleItem(state, action.instanceId);
    case 'SHOW_PRESTIGE_MODAL':
      return { ...state, prestigeModalOpen: true };
      
    case 'HIDE_PRESTIGE_MODAL':
      return { ...state, prestigeModalOpen: false };
		case 'DARK_MARKET':       return darkMarket(state);
		case 'BARTER':            return barter(state);
		case 'MANUAL_COOL':       return manualCool(state);
		case 'DECRYPT':           return decrypt(state);
		case 'BUY_UPGRADE':       return buyUpgrade(state, action.key);
		case 'HIRE_RUNNER':       return hireRunner(state, action.runnerType);
		case 'SET_DISTRICT':      return setDistrict(state, action.district);
    case 'QUEUE_ZERO_DIALOGUE': {
			// Push tutorial line(s) into ZERO queue; dispenser in tick() releases
			// max 1 every 2.5s. seenIds persists tutorial gate state.
			return {
				...state,
				zeroQueue: [...(state.zeroQueue ?? []), ...(action.lines ?? [])],
				zeroDialoguesSeen: action.seenIds ?? state.zeroDialoguesSeen ?? [],
			};
		}
		case 'WARP_TIME':         return warpTime(state);
		case 'PRESTIGE': {
      return prestige(state);
    }
    case 'DAILY_BONUS': {
			return {
				...state,
				gold: state.gold + action.amount,
				totalGoldEarned: (state.totalGoldEarned || 0) + action.amount,
				runGoldEarned: (state.runGoldEarned || 0) + action.amount,
			};
		}
		
		case 'ADD_LOG': {
			return {
				...state,
				log: [action.text, ...(state.log || [])].slice(0, 50),
			};
		}

		case 'BUY_PRESTIGE_PERK': return buyPrestigePerk(state, action.perkId);
    case 'RESPEC_PRESTIGE_PERKS': return respecPrestigePerks(state);
		case 'SET_PROTOCOL':      return setProtocol(state, action.protocol);
		case 'PURGE_LOGS':        return purgeLogs(state);
		case 'COUNTER_HACK':      return counterHack(state);
		
		case 'SET_RUNNER_SPEC': {
      const { runnerType, spec } = action;
      let promotedCount = 0;

      const updatedAgents = (state.agents || []).map(a => {
        if (a.role === runnerType && a.spec === 'PENDING') {
          promotedCount++;
          // Pridaná poistka (a.level || 1), aby sa to nezaseklo na NaN
          return { ...a, spec: spec, xp: 0, level: (a.level || 1) + 1, status: 'ACTIVE' };
        }
        return a;
      });

      if (promotedCount === 0) return state; // Ak nikoho nenašiel, vráti sa bez zmeny

      const t = getTimestamp();
      return {
        ...state,
        agents: updatedAgents,
        runnerXp: { ...(state.runnerXp || {}), [runnerType]: 0 }, 
        runnerSpec: { ...(state.runnerSpec || {}), [runnerType]: spec },
        log: [`[${t}] :: DOCTRINE_SET :: ${promotedCount}x ${runnerType.toUpperCase()} -> ${spec}`, ...(state.log || [])].slice(0, 50),
      };
    }

    case 'ASSIGN_TRAINING': {
      if (!state.agents) return state;
      return {
        ...state,
        agents: state.agents.map(a => a.id === action.agentId ? { ...a, status: 'TRAINING' } : a)
      };
    }

    case 'STOP_TRAINING': {
      if (!state.agents) return state;
      return {
        ...state,
        agents: state.agents.map(a => a.id === action.agentId ? { ...a, status: 'ACTIVE' } : a)
      };
    }

    case 'SEVER_CONNECTION': {
			const { hexId } = action;
			
			// POISTKA: Nesmieš odpojiť svoju hlavnú bránu do siete!
			if (hexId === 'western_warpgate') {
				return { ...state, log: [`[!] :: CRITICAL_ERROR :: Cannot sever primary network anchor.`, ...(state.log || [])].slice(0, 50) };
			}

			if ((state.capturedHexes || []).length <= 1) {
				return { ...state, log: [`[!] :: SEVER_REJECTED :: You must maintain at least one network anchor.`, ...(state.log || [])].slice(0, 50) };
			}

			const newReclaiming = { ...state.reclaiming };
			delete newReclaiming[hexId];

			return {
				...state,
				capturedHexes: (state.capturedHexes || []).filter(id => id !== hexId),
				reclaiming: newReclaiming,
				log: [`:: CONNECTION_SEVERED :: Node ${hexId} released manually.`, ...(state.log || [])].slice(0, 50)
			};
		}

    case 'BUY_REVEAL': {
      return buyReveal(state, action.revealId);
    }

		case 'SECURE_NODE': {
      const { hexId } = action;
      const cost = 25; // Náklad je 25 REP
    
      if ((state.reputation || 0) < cost) {
        return { ...state, log: [`[!] :: INSUFFICIENT_REP :: Need ${cost} REP`, ...(state.log || [])].slice(0, 50) };
      }
    
      const currentReclaim = state.reclaiming?.[hexId];
      if (!currentReclaim) return state;
    
      // 🔥 PEKNÝ NÁZOV UZLA A TIMESTAMP
      const nodeDef = AETHERIA_MAP[hexId];
      const nodeName = nodeDef ? nodeDef.label : hexId;
      const t = getTimestamp();
    
      const newProgress = currentReclaim.progress - 40;
      const newReclaiming = { ...state.reclaiming };
    
      if (newProgress <= 0) {
        delete newReclaiming[hexId]; // Úplne zastaví útok
      } else {
        newReclaiming[hexId] = { ...currentReclaim, progress: newProgress };
      }
    
      return {
        ...state,
        reputation: state.reputation - cost, // Odpočíta REP!
        reclaiming: newReclaiming,
        log: [`[${t}] :: FIREWALL_STRENGTHENED :: ${nodeName} (25 REP)`, ...(state.log || [])].slice(0, 50)
      };
    }

    case 'HEAL_AGENT': {
      if (!state.agents) return state;
      const agent = state.agents.find(a => a.id === action.agentId);
      if (!agent) return state;
      
      const cost = getHealCost(agent); // Teraz to používa rovnaký vzorec ako UI!
      
      if (state.gold < cost) return state; // Poistka
      
      const t = getTimestamp();
      return {
        ...state,
        gold: state.gold - cost,
        agents: state.agents.map(a => a.id === action.agentId ? { ...a, fatigue: 0, status: 'ACTIVE' } : a),
        log: [`[${t}] :: MEDICAL :: ${agent.name} fully recovered. -${cost} CR`, ...(state.log || [])].slice(0, 50)
      };
    }

    case 'HEAL_ALL_INJURED': {
      if (!state.agents) return state;
      const injured = state.agents.filter(a => a.fatigue > 0 && a.status !== 'ON_MISSION' && a.status !== 'CAPTURED');
      if (injured.length === 0) return state;
    
      const totalCost = injured.reduce((sum, a) => sum + getHealCost(a), 0);
      if (state.gold < totalCost) {
        return { ...state, log: [`[!] :: INSUFFICIENT_FUNDS :: Need ${totalCost.toLocaleString()} CR for bulk heal`, ...(state.log || [])].slice(0, 50) };
      }
    
      const healedIds = new Set(injured.map(a => a.id));
      const t = getTimestamp();
      return {
        ...state,
        gold: state.gold - totalCost,
        agents: state.agents.map(a => healedIds.has(a.id) ? { ...a, fatigue: 0, status: 'ACTIVE' } : a),
        log: [`[${t}] :: BULK_HEAL :: ${injured.length} operatives restored. -${totalCost.toLocaleString()} CR`, ...(state.log || [])].slice(0, 50)
      };
    }
		
		case 'RANSOM_AGENT': {
      const t = getTimestamp();
			if (state.gold < 15000) return state;
			return {
				...state,
				gold: state.gold - 15000,
				agents: state.agents.map(a => a.id === action.agentId ? { ...a, status: 'ACTIVE', fatigue: 50 } : a),
				log: [`[${t}] :: NEGOTIATION :: Ransom paid. Operative returned from custody.`, ...(state.log || [])].slice(0, 50)
			};
		}

    case 'MAINTAIN_NODE': {
      const { hexId } = action;
      const cost = 15;
      const currentStab = state.nodeStability?.[hexId] ?? 100;
      
      // 🔥 PEKNÝ NÁZOV UZLA
      const nodeDef = AETHERIA_MAP[hexId];
      const nodeName = nodeDef ? nodeDef.label : hexId;
      const t = getTimestamp();
      
      // Ak je už na 95%+, netreba nič robiť
      if (currentStab >= 95) {
        return { 
          ...state, 
          log: [`[${t}] :: MAINTENANCE_SKIPPED :: Node ${nodeName} stability is optimal (${Math.round(currentStab)}%).`, ...(state.log || [])].slice(0, 50) 
        };
      }
      
      // Čím nižšia stabilita, tým väčší boost (max +50%, min +10%)
      const boostAmount = Math.min(50, Math.max(10, Math.floor((100 - currentStab) * 0.5 + 10)));
      const newStab = Math.min(100, currentStab + boostAmount);
      const actualBoost = newStab - currentStab;
    
      if (state.stamina < cost) {
        return { 
          ...state, 
          log: [`[${t}] :: INSUFFICIENT_STAMINA :: Need ${cost} STA to maintain node ${nodeName}.`, ...(state.log || [])].slice(0, 50) 
        };
      }
    
      return {
        ...state,
        stamina: state.stamina - cost,
        nodeStability: {
          ...state.nodeStability,
          [hexId]: newStab
        },
        // 🔥 OPRAVA: Zaokrúhlenie na 1 desatinné miesto + pekný názov
        log: [`[${t}] :: SIGNAL_RESTORED :: +${Math.round(actualBoost * 10) / 10}% on ${nodeName} (${Math.round(currentStab * 10) / 10}% → ${Math.round(newStab * 10) / 10}%)`, ...(state.log || [])].slice(0, 50)
      };
    }

    case 'TOGGLE_OVERCLOCK': {
      // Ak je cooldown, nedovoliť zapnúť
      if (!state.overclockActive && state.overclockCooldown > 0) {
        const t = getTimestamp();
        return {
          ...state,
          log: [`[${t}] :: OVERCLOCK_UNAVAILABLE :: System cooling down (${Math.ceil(state.overclockCooldown / 60)}m ${state.overclockCooldown % 60}s remaining).`, ...(state.log || [])].slice(0, 50)
        };
      }
      
      const newState = !state.overclockActive;
      const t = getTimestamp();
      
      // Ak vypínaš, nastav cooldown (300 sekúnd = 5 minút)
      const cooldown = newState ? 0 : 300;
      
      return {
        ...state,
        overclockActive: newState,
        overclockCooldown: cooldown,
        log: [`[${t}] :: OVERCLOCK_${newState ? 'ENABLED' : 'DISABLED'} :: ${newState ? 'Bandwidth +2, stability at risk! Heat generation increased.' : 'System cooling down for 5 minutes.'}`, ...(state.log || [])].slice(0, 50)
      };
    }

    case 'EXECUTE_LAST_STAND': {
			const { hexId } = action;
			const currentReclaim = state.reclaiming?.[hexId];
			
			// Ochrana: Dá sa to kliknúť len ak je to v správnom stave
			if (!currentReclaim || currentReclaim.stage !== 'LAST_STAND') return state;

			const newReclaiming = { ...state.reclaiming };
			delete newReclaiming[hexId]; // Útok úplne odvrátený!

			const nodeDef = AETHERIA_MAP[hexId];
			const nodeName = nodeDef ? nodeDef.label : hexId;
			const t = getTimestamp();

			return {
				...state,
				reclaiming: newReclaiming,
				log: [`[${t}] :: OVERRIDE_SUCCESS :: Connection severed with intruder on ${nodeName}.`, ...(state.log || [])].slice(0, 50)
			};
		}

		case 'DEPLOY_RUNNER': {
			const { hexId, agentId, risk = 'BALANCED' } = action;
			const hex = AETHERIA_MAP[hexId];

			if (!hex) return state;

			const agent = (state.agents || []).find(a => a.id === agentId);
			if (!agent || agent.status !== 'ACTIVE') return state;

			const activeMissionsCount = (state.activeMissions || []).length;
			const maxMissions = 2 + Math.floor((state.level || 1) / 5);

			if (activeMissionsCount >= maxMissions) {
				return {
					...state,
					log: [`[!] :: SIGNAL_LIMIT :: Max ${maxMissions} concurrent infiltrations allowed.`, ...(state.log || [])].slice(0, 50)
				};
			}

			// ─── RISK TIER MODIFIERS ──────────────────────────────
			// Inspired by How Many Dudes: choose approach → different outcomes
			const RISK_PROFILES = {
				SAFE:       { successBonus: +15, rewardMult: 0.7, heatMult: 0.5, costMult: 1.5, timeMult: 1.3, label: 'SAFE'       },
				BALANCED:   { successBonus:   0, rewardMult: 1.0, heatMult: 1.0, costMult: 1.0, timeMult: 1.0, label: 'BALANCED'   },
				AGGRESSIVE: { successBonus: -20, rewardMult: 1.8, heatMult: 1.6, costMult: 0.7, timeMult: 0.7, label: 'AGGRESSIVE' },
			};
			const profile = RISK_PROFILES[risk] ?? RISK_PROFILES.BALANCED;

			const zoneScales = { Z4: 1, Z7: 2, Z2: 3, Z3: 4, Z6: 6, Z1: 8, Z5: 15 };
			const zoneMult = zoneScales[hex.districtId] || 1;
			const opCost = Math.floor(2000 * zoneMult * profile.costMult);

			if (state.gold < opCost) {
				return {
					...state,
					log: [`[!] :: INSUFFICIENT_FUNDS :: Need ${opCost.toLocaleString()} CR to deploy`, ...(state.log || [])].slice(0, 50)
				};
			}

			const speedMods = {
				streetRunner: 1.5, dataThief: 1.0, infiltrator: 0.5,
				fixer: 0.8, shadowBroker: 0.3
			};

			const baseTime = hex.captureTime || 45;
			const fatiguePenalty = 1 + (agent.fatigue * 0.005);

			const finalSeconds = Math.round(
				((baseTime * zoneMult) * (speedMods[agent.role] || 1) * fatiguePenalty + (state.heat * 0.7)) * profile.timeMult
			);

			const baseChance = 80;
			const heatPenalty = Math.floor(state.heat / 5);
			const successChance = Math.max(5, Math.min(95, baseChance - heatPenalty + profile.successBonus));

			const updatedAgents = state.agents.map(a =>
				a.id === agentId ? { ...a, status: 'ON_MISSION' } : a
			);

			return {
				...state,
				gold: state.gold - opCost,
				agents: updatedAgents,
				activeMissions: [
					...(state.activeMissions || []),
					{
						hexId,
						agentId,
						runnerType: agent.role,
						endTime: Date.now() + (finalSeconds * 1000),
						startTime: Date.now(),
						successChance,
						label: hex.label,
						opCost,
						risk,
						rewardMult: profile.rewardMult,
						heatMult: profile.heatMult,
					}
				],
				heat: Math.min(100, state.heat + Math.round(zoneMult * 2.5 * profile.heatMult)),
				log: [
					`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] :: DEPLOYED ${agent.name} [${profile.label}] → ${hex.label} [-${opCost} CR | ${finalSeconds}s | ${successChance}%]`,
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
			const rawGold = Math.floor((Math.random() * 5000 + 5000) * mult);
			const repReward = Math.floor(25 * mult);
			const xpReward = Math.floor(1500 * mult);

			const inc = applyIncome(state, rawGold);
			const t = getTimestamp();

			const afterCapture = {
				...state,
				gold: inc.gold,
				totalGoldEarned: inc.totalGoldEarned,
				runGoldEarned: inc.runGoldEarned,
				reputation: (state.reputation || 0) + repReward,
				xp: (state.xp || 0) + xpReward,
				capturedHexes: newCaptured,
				mapDiscovery: newDiscovery,
				log: [`[${t}] :: VAULT BREACHED :: ${hex.label} :: +${inc._earned.toLocaleString()} CR, +${xpReward} XP`, ...(state.log || [])].slice(0, 50),
			};

			return checkLevelUp(afterCapture);
		}

    // Reducer addition
    case 'DISMISS_ZERO_OVERLAY': {
      if (!state.zeroLastMessage) return state;
      return {
        ...state,
        zeroLastMessage: { ...state.zeroLastMessage, seen: true },
        zeroHistory: (state.zeroHistory ?? []).map(m =>
          m.id === state.zeroLastMessage.id ? { ...m, seen: true } : m
        ),
      };
    }

    case 'USER_ACTIVE': {
      const t = getTimestamp();
      return {
        ...state,
        lastInteractionTime: Date.now(), // Resetujeme čas poslednej aktivity
        isIdle: false,
        idlePromptActive: false,
        idlePromptTimestamp: null,       // Toto je kľúčové!
        log: state.isIdle 
          ? [`[${t}] :: SYSTEM_RESUMED :: Neural link re-established. Output restored to 100%.`, ...(state.log || [])].slice(0, 50) 
          : state.log
      };
    }

		case 'START_HACKING': {
			const t = getTimestamp();
			return {
				...state,
				heat: Math.min(100, state.heat + 20),
				log: [`[${t}] :: TRACE_SPIKE :: Node intrusion detected (+20 HEAT)`, ...(state.log || [])].slice(0, 50),
			};
		}
		
		case 'APPLY_OFFLINE': {
			const { earnedGold, heatAfter, elapsed } = action.payload;
			// Silent update if no runners earned anything AND elapsed < 10min.
			// Prevents log spam like "OFFLINE +227s :: RUNNERS +0 CR" for early game / fresh start.
			if (earnedGold <= 0 && elapsed < 600) {
				return {
					...state,
					heat:         heatAfter,
					lastTickTime: Date.now(),
				};
			}
			const t = getTimestamp();
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
			const t = getTimestamp();
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
			const t = getTimestamp();
			return { ...FRESH_STATE, log: [`[${t}] :: SYSTEM RESET`] };
		}
		case 'TICK': return tick(state);
		default:     return state;
    case 'CLEAR_SPLASH': return { ...state, missionSplash: null };
    case 'CONSUME_MILESTONE_TOAST': {
      const q = state.milestoneToastQueue ?? [];
      return { ...state, milestoneToastQueue: q.slice(1) };
    }
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

// ==========================================
// 2. PURE UI COMPONENTS
// ==========================================

function Icon({ component: C, size = 11, color = 'var(--muted)', style: extra }) {
  return (
      <C size={size} color={color}
          style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: 4, ...extra }} />
  );
}

// Nový komponent pre "Data-Primary Rule" z dizajnu
function DataField({ label, value, unit, color = 'var(--amber)', size = 'lg' }) {
  const valSize = size === 'lg' ? 'text-xl' : 'text-base';
  return (
      <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest">
              {label}
          </span>
          <span className={cn(valSize, "font-bold")} style={{ color }}>
              {value} {unit && <span className="text-[10px] opacity-80">{unit}</span>}
          </span>
      </div>
  );
}

// Upravený Bar s podporou pre FTG a XP
function Bar({ pct, variant = 'default', thin = false }) {
  const pctVal = Math.min(100, Math.max(0, pct));
  
  // Mapovanie variantov na triedy
  const variantClass = {
      ftg: 'bar-fill-ftg',      // Gradient Amber -> Red (Stability/Reclaim)
      xp: 'bar-fill-xp',        // Purple Glitch
      default: 'bar-fill-amber' // Default Amber
  }[variant];

  return (
      <div className={cn('bar-track', thin && 'bar-track-thin')}>
          <div 
              className={cn('bar-fill', variantClass)}
              style={{ width: `${pctVal}%` }} 
          />
      </div>
  );
}

function Tab({ label, active, onClick, disabled = false, className = '', badge = null }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'tab',
        active && 'tab-active',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      style={{ position: 'relative' }}
    >
      {label}
      {badge && !disabled && (
        <span style={{
          position: 'absolute',
          top: 4, right: 4,
          minWidth: 14, height: 14,
          padding: '0 4px',
          background: badge.color,
          color: '#000',
          fontSize: 9, fontWeight: 800,
          letterSpacing: '0.05em',
          borderRadius: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 6px ${badge.color}`,
          animation: badge.pulse ? 'borderPulseAmber 1.4s ease-in-out infinite' : undefined,
        }}>
          {badge.count ?? '●'}
        </span>
      )}
    </button>
  );
}

function ProtoBtn({ onClick, disabled, active, children, className, color = 'amber' }) {
  const interactive = !disabled && !active;
  const colorClass = `btn-${color}`;

  return (
      <button
          onClick={interactive ? onClick : undefined}
          disabled={disabled}
          className={cn(
              'btn', 
              colorClass,
              active && 'btn-active',
              disabled && 'btn-disabled',
              className
          )}
      >
          {children}
      </button>
  );
}

function BuyBtn({ canAfford, maxed, onClick, label = 'BUY', className }) {
  const interactive = canAfford && !maxed;

  return (
      <button
          onClick={interactive ? onClick : undefined}
          className={cn(
              'btn btn-xs', 
              maxed ? 'btn-success' : canAfford ? 'btn-amber' : 'btn-disabled',
              className
          )}
          style={{ 
              width: 'auto', 
              display: 'inline-block', 
              margin: 0,
              padding: '4px 12px' 
          }}
      >
          {maxed ? 'MAXED' : label}
      </button>
  );
}

// StatusCard.js
// Implementuje: Status Indicator (4px left border), Zero-Radius, Surface Hierarchy

const statusStyles = {
  active: { border: 'border-green-500', bg: 'bg-surface-container-high' },      // Primary (Neon Green)
  infiltrating: { border: 'border-amber-500', bg: 'bg-surface-container-high' }, // Secondary (Amber)
  kia: { border: 'border-red-500', bg: 'bg-surface-container-high' },          // Error (Crimson)
  neural: { border: 'border-purple-500', bg: 'bg-surface-container-high' },    // Tertiary (Tech Purple)
  // Default stav používa 'Ghost Border' (muted opacity)
  default: { border: 'border-zinc-700', bg: 'bg-surface-container' } 
};

function StatusCard({ status = 'default', children, className }) {
  const style = statusStyles[status] || statusStyles.default;

  return (
    <div className={cn(
      'border-l-4 p-3 flex flex-col justify-between transition-colors duration-100',
      style.border,
      style.bg,
      className
    )}>
      {children}
    </div>
  );
}

function UpgradeRow({ def, level, gold, dispatchWithSound }) {
	const maxed = level >= def.max;
	const cost  = maxed ? 0 : getUpgradeCost(def.baseCost, level);
	const canAfford = gold >= cost;

	return (
		<div 
			className="flex-between items-center mb-4 p-8"
			style={{ 
				background: 'var(--surface-high)',
				borderLeft: `3px solid ${maxed ? 'var(--green)' : 'var(--amber)'}`
			}}
		>
			{/* Ľavá strana: Názov a Popis */}
			<div className="flex-1">
				<div className="flex items-center gap-6">
					<span className="font-bold text-md uppercase text-amber-dark tracking-wider">
						{def.label}
					</span>
					<span className={cn('badge', maxed ? 'badge-green' : 'badge-amber-muted')}>
						{maxed ? 'MAX' : `LVL ${level}/${def.max}`}
					</span>
				</div>
				<div className="text-xs text mt-4 italic opacity-60">
					{def.effect}
				</div>
			</div>

			{/* Pravá strana: Cena a Tlačidlo */}
			{!maxed && (
				<div className="flex items-center gap-12">
					<span className={cn('font-black text-lg', canAfford ? 'text-amber' : 'text-red')}>
						{cost.toLocaleString()} <span className="text-xs opacity-80">CR</span>
					</span>
					<BuyBtn
						canAfford={canAfford}
						maxed={false}
						onClick={() => dispatchWithSound({ type: 'BUY_UPGRADE', key: def.key })}
					/>
				</div>
			)}
		</div>
	);
}

// Pomocný sub-komponent pre zoznam agentov v karte
// AgentMiniRow.js
// Implementuje: Data-Primary Rule, Ghost Borders, Opacity Hierarchy

const AgentMiniRow = ({ agent }) => {
  // Logika farieb a textu podľa stavu
  const getStatusConfig = () => {
    switch (agent.status) {
      case 'EXHAUSTED':
        return { 
          text: `REST: ${agent.fatigue}%`, 
          color: 'text-red', 
          indicator: 'bg-red' 
        };
      case 'ON_MISSION':
        return { 
          text: '[DEPLOYED]', 
          color: 'text-cyan', // Info color
          indicator: 'bg-cyan' 
        };
      case 'CAPTURED':
        return { 
          text: '[M.I.A.]', 
          color: 'text-red font-bold animate-pulse', // Critical error animation
          indicator: 'bg-red' 
        };
      case 'INJURED':
        return { 
          text: '[INJURED]', 
          color: 'text-orange', 
          indicator: 'bg-orange' 
        };
      default:
        // Štandardný stav alebo špeciálny spec (SHADOW/TECH)
        const specColor = agent.spec === 'SHADOW' ? 'text-green' : 'text-gold';
        return { 
          text: `FTG: ${agent.fatigue}%`, 
          color: agent.spec ? specColor : 'text-muted', 
          indicator: agent.spec === 'SHADOW' ? 'bg-green' : agent.spec ? 'bg-gold' : 'bg-surface-high'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn(
      "flex items-center gap-2 text-[10px] font-mono py-1.5 px-1",
      "bg-surface-low border-b border-outline-variant/10", // Ghost Border (low opacity)
      "hover:bg-surface-bright transition-colors cursor-pointer" // Interaction feedback
    )}>
      {/* Vizuálny indikátor (1px wide bar) */}
      <div className={cn("w-1 h-3", config.indicator)}></div>
      
      {/* PRIMARY DATA: Agent Name (High contrast) */}
      <span className="flex-1 text-on-surface font-bold tracking-tight">
        {agent.name}
        {/* Secondary Info: Spec Tag */}
        {agent.spec && agent.spec !== 'PENDING' && (
          <span className={cn("ml-2 opacity-60", config.color)}>[{agent.spec}]</span>
        )}
        {agent.spec === 'PENDING' && (
          <span className="ml-2 text-amber opacity-80">[!]</span>
        )}
      </span>

      {/* SECONDARY DATA: Status (Muted/Colored) */}
      <span className={cn("opacity-70 text-right tabular-nums", config.color)}>
        {config.text}
      </span>
    </div>
  );
};

function RunnerCard({ runnerType, label, count, gold, level, unlockLevel, requiresPrestige, prestige, baseCost, cycleSeconds, crPerRunner, heatPerRunner, agents = [], cycleTotal, dispatchWithSound, setSpecModal }) {
  const locked = level < unlockLevel || prestige < requiresPrestige;
  const lockReason = prestige < requiresPrestige ? `[PRESTIGE ${requiresPrestige}]` : `[LVL ${unlockLevel}]`;
  const maxed = count >= 5;
  const cost = getRunnerCost(baseCost, count);
  const canAfford = gold >= cost;

  // Špecializácie
  const pendingAgents = agents.filter(a => a.spec === 'PENDING');
  const hasPending = pendingAgents.length > 0;
  const shadowCount = agents.filter(a => a.spec === 'SHADOW').length;
  const greedyCount = agents.filter(a => a.spec === 'GREEDY').length;
  
  let teamSpec = null;
  if (agents.length > 0) {
      if (shadowCount > agents.length / 2) teamSpec = 'SHADOW';
      else if (greedyCount > agents.length / 2) teamSpec = 'GREEDY';
  }

  // XP Progress
  const highestXpAgent = agents.filter(a => !a.spec && a.status === 'ACTIVE').sort((a, b) => b.xp - a.xp)[0];
  const displayXp = highestXpAgent ? highestXpAgent.xp : 0;

  // --- Style Logic (Mirroring UpgradeRow) ---
  
  // 1. Border Accent Color
  const getBorderColor = () => {
      if (locked) return 'var(--red)';
      if (maxed) return 'var(--green)';
      if (teamSpec === 'SHADOW') return 'var(--green)';
      if (teamSpec === 'GREEDY') return 'var(--gold)';
      return 'var(--amber)'; // Default active
  };

  // 2. Label Color
  const labelColor = teamSpec === 'SHADOW' ? 'text-green' : teamSpec === 'GREEDY' ? 'text-gold' : 'text-amber-dark';

  return (
      <div 
          className={cn(
              "flex flex-col mb-4 p-8 transition-all duration-500",
              locked && "opacity-80 grayscale"
          )}
          style={{ 
              background: 'var(--surface-high)',
              borderLeft: `3px solid ${getBorderColor()}`
          }}
      >
          {/* HEADER: Label + Badge (Left) | Count (Right) */}
          <div className="flex-between items-start mb-6">
              <div className="flex-1">
                  <div className="flex items-center gap-6">
                      <span className={cn('font-bold text-md uppercase tracking-wider', labelColor)}>
                          {label}
                      </span>
                      {teamSpec && (
                          <span className="badge badge-amber-muted">
                              {teamSpec}
                          </span>
                      )}
                  </div>
                  {/* Description style from UpgradeRow */}
                  <div className="text-xs text mt-4 italic opacity-60">
                       Base: +{crPerRunner} CR / {cycleSeconds}s · +{heatPerRunner} HEAT
                  </div>
              </div>

              {/* Status Indicator (Right) */}
              <span className={cn(
                  'font-black text-lg tabular-nums text-right',
                  locked ? 'text-red' : maxed ? 'text-green' : 'text-muted'
              )}>
                  {locked ? lockReason : `[${count}/5]`}
              </span>
          </div>

          {/* YIELD BLOCK (Data Visual) */}
          <div className="bg-surface-low p-2 mb-6 border border-surface-high">
              <div className="text-md font-black text-amber flex-between">
                  <span className="opacity-80">SYS_YIELD:</span>
                  <span>+{cycleTotal.toLocaleString()} <span className="text-xs opacity-80">CR</span></span>
              </div>
          </div>

          {/* AGENT ROSTER LIST */}
          {agents.length > 0 && (
              <div className="mb-6 bg-bg border border-surface-high">
                  {agents.map(a => <AgentMiniRow key={a.id} agent={a} />)}
              </div>
          )}

          {/* SPEC PROGRESS */}
          {agents.length > 0 && !hasPending && highestXpAgent && teamSpec === null && (
              <div className="mb-6 bg-surface-low p-2">
                  <div className="flex-between text-[9px] text-muted uppercase mb-1">
                      <span>Spec_Sync_Level</span>
                      <span className={displayXp >= 100 ? 'text-amber font-bold' : ''}>{Math.min(displayXp, 100)}/100</span>
                  </div>
                  <Bar pct={displayXp} variant="xp"/>
              </div>
          )}

          {/* ACTIONS: Aligned Right (Like UpgradeRow) */}
          <div className="mt-auto flex justify-end items-center gap-12">
              {/* Cost Display (Left of Button) */}
              {!maxed && !locked && !hasPending && (
                  <span className={cn('font-black text-lg tabular-nums', canAfford ? 'text-amber' : 'text-red')}>
                      {cost.toLocaleString()} <span className="text-xs opacity-80">CR</span>
                  </span>
              )}
              
              {/* Button / Status Block */}
              <div className="flex justify-end">
                  {hasPending ? (
                      <button 
                          onClick={() => setSpecModal(runnerType)}
                          className="btn btn-amber animate-pulse text-xs font-black tracking-widest"
                      >
                          PROMOTE {pendingAgents.length} UNIT(S)
                      </button>
                  ) : locked ? (
                      <div className="text-center p-2 text-[10px] text-muted border border-surface-high italic">
                          SEC_PROTOCOL_LOCKED
                      </div>
                  ) : maxed ? (
                      <div className="text-center p-2 text-[10px] text-green border border-green font-bold bg-green/5">
                          MAX_UNIT_CAPACITY
                      </div>
                  ) : (
                      <BuyBtn 
                          canAfford={canAfford} 
                          maxed={false} 
                          label="HIRE" 
                          onClick={() => dispatchWithSound({ type: 'HIRE_RUNNER', runnerType })} 
                      />
                  )}
              </div>
          </div>
      </div>
  );
}

// ── NETWORK INFILTRATION MANAGER ──
function NetworkManager({ state, dispatchWithSound }) {
  const captured = state.capturedHexes ?? [];
  const missions = state.activeMissions ?? [];
  const MAP = AETHERIA_MAP; // Předpokladáme, že AETHERIA_MAP je importovaná
  const maxMissions = 2 + Math.floor((state.level || 1) / 5);
  const isOverloaded = missions.length >= maxMissions;

  // Bandwidth Logic
  const currentBandwidth = captured.length;
  const overclockBonus = state.overclockActive ? 2 : 0;
  const maxBandwidth = 1 + (state.intelUpgrades?.serverRacks || 0) + overclockBonus;
  const isBandwidthFull = currentBandwidth >= maxBandwidth;

  // Group nodes by district
  const nodesByDistrict = Object.values(MAP).reduce((acc, node) => {
      const dId = node.districtId || 'UNKNOWN';
      if (!acc[dId]) acc[dId] = [];
      acc[dId].push(node);
      return acc;
  }, {});

  // Timer for mission updates
  const [, setRenderTrigger] = useState(0);
  useEffect(() => {
      if (missions.length === 0) return;
      const timer = setInterval(() => setRenderTrigger(v => v + 1), 1000);
      return () => clearInterval(timer);
  }, [missions]);

  // Story Progress (Z4 Slums)
  const z4TotalNodes = Object.values(MAP).filter(n => n.districtId === 'Z4').length;
  const z4Required = Math.max(1, z4TotalNodes - 1);
  const slumsCaptured = captured.filter(id => MAP[id]?.districtId === 'Z4').length;

  // Labels for runner types
  const R_LABELS = {
      streetRunner: 'ST-RUN', dataThief: 'D-THIEF', infiltrator: 'INFILTR',
      fixer: 'FIXER', shadowBroker: 'BROKER'
  };

  return (
      <div className="flex-1 overflow-y-auto scroll-none">
          
          {/* UX HINT: NO OPERATIVES */}
          {Object.values(state.runners || {}).reduce((a, b) => a + b, 0) === 0 && (
              <div className="card-warning mb-12 text-center p-10">
                  <div className="text-amber font-bold tracking-widest text-[10px] mb-4">[!] NO OPERATIVES AVAILABLE</div>
                  <div className="text-xs text-muted">
                      You need Operatives to hack nodes. Go to <span className="text-white font-bold">OPS</span> terminal.
                  </div>
              </div>
          )}

          {/* ACTIVE MISSIONS PANEL */}
          <div className={cn('mb-16 border-l-4 p-8 bg-surface-low', isOverloaded ? 'border-red bg-red/5' : 'border-cyan bg-cyan/5')}>
              <div className="flex-between font-bold text-sm tracking-widest border-b border-current pb-2 mb-8" style={{ color: isOverloaded ? 'var(--red)' : 'var(--cyan)', borderColor: isOverloaded ? 'var(--red)' : 'var(--cyan)' }}>
                  <span>:: ACTIVE_INFILTRATIONS</span>
                  <span>[{missions.length} / {maxMissions}]</span>
              </div>
              
              {missions.length === 0 && <div className="text-xs text-muted mb-4">[NO_ACTIVE_MISSIONS]</div>}
              
              {missions.map((m, i) => {
                  const secondsLeft = Math.max(0, Math.round((m.endTime - Date.now()) / 1000));
                  return (
                      <div key={i} className="flex-between text-xs font-mono mb-6 py-2 border-b border-surface-high">
                          <span className="text-amber">
                              {m.label} <span className="text-muted text-[10px] ml-2">[{R_LABELS[m.runnerType]}]</span>
                          </span>
                          <span className={secondsLeft > 0 ? 'text-cyan' : 'text-green font-bold animate-pulse'}>
                              {secondsLeft > 0 ? `T-MINUS ${secondsLeft}s` : 'EXTRACTING...'}
                          </span>
                      </div>
                  );
              })}
          </div>

          {/* DISTRICTS & NODES */}
          {Object.entries(nodesByDistrict).sort((a, b) => {
              const order = ['Z4', 'Z7', 'Z2', 'Z3', 'Z6', 'Z1', 'Z5'];
              return order.indexOf(a[0]) - order.indexOf(b[0]);
          }).map(([dId, nodes]) => {
              const district = AETHERIA_DISTRICTS[dId] || { name: dId, desc: 'Unknown Sector', color: '#888899' };
              const isVisible = nodes.some(n => (state.mapDiscovery ?? []).includes(n.id));
              if (!isVisible && dId !== 'Z4') return null;

              const districtCaptured = nodes.filter(n => captured.includes(n.id)).length;
              const districtTotal = nodes.length;
              const hasRegularNodes = nodes.some(n => !n.id.includes('warpgate') && !n.id.includes('buffer'));
              const nodesRequired = Math.ceil(districtTotal * 0.8);

              return (
                  <div key={dId} className="mb-24">
                      {/* DISTRICT HEADER (Color Coded) */}
                      <div 
                          className="text-sm font-bold tracking-widest mb-10 border-b-4 pb-4 uppercase"
                          style={{ color: district.color, borderColor: district.color }}
                      >
                          :: {district?.name || dId} 
                          <span className="ml-4 opacity-60 font-normal">{district?.desc}</span>
                          <span className="float-right text-sm opacity-80">[{districtCaptured}/{districtTotal}]</span>
                      </div>

                      {/* NODE LIST */}
                      {nodes.map(node => {
                          const isOwned = captured.includes(node.id);
                          const activeMission = missions.find(m => m.hexId === node.id);
                          const isAdjacent = (node.connections ?? []).some(c => captured.includes(c));
                          const isGate = node.id.includes('warpgate') || node.id.includes('buffer');
                          
                          const reclaimData = state.reclaiming?.[node.id];
                          const stability = state.nodeStability?.[node.id] ?? 100;

                          // Lock Logic
                          const isGateLocked = !isOwned && isGate && (
                              (hasRegularNodes && districtCaptured < nodesRequired) ||
                              (dId !== 'Z4' && slumsCaptured < z4Required)
                          );
                          const canHack = !isOwned && !activeMission && isAdjacent && !isGateLocked;
                          const showDeployButtons = canHack && !isBandwidthFull && !isOverloaded;

                          // Node Visual Style (Border matches District or Status)
                          const getNodeStyle = () => {
                              if (isOwned) return { border: district.color, bg: 'var(--surface-high)', text: district.color };
                              if (activeMission) return { border: 'var(--cyan)', bg: 'rgba(0, 212, 255, 0.05)', text: 'var(--cyan)' };
                              if (canHack) return { border: 'var(--amber)', bg: 'var(--surface-high)', text: 'var(--amber)' };
                              return { border: 'var(--surface-high)', bg: 'var(--surface-low)', text: 'var(--muted)' };
                          };
                          const nodeStyle = getNodeStyle();

                          return (
                              <div key={node.id} className={cn(
                                  "mb-4 p-8 transition-all border-l-4",
                                  !isOwned && !activeMission && !canHack && 'opacity-80 grayscale'
                              )} style={{ 
                                  background: nodeStyle.bg, 
                                  borderLeftColor: nodeStyle.border 
                              }}>
                                  {/* NODE HEADER */}
                                  <div className="flex-between items-center mb-4">
                                      <span className={cn("font-bold text-md uppercase tracking-wider", `text-[${nodeStyle.text}]`)} style={{color: nodeStyle.text}}>
                                          <span className="mr-6 opacity-80">{node.icon}</span> 
                                          {node.label}
                                      </span>
                                      <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                                          {isOwned ? '[SECURED]' : activeMission ? '[IN_PROGRESS]' : canHack ? '[READY]' : '[LOCKED]'}
                                      </span>
                                  </div>
                                  
                                  {/* Node Description (Effect Hooks) */}
                                  <div className="text-xs text-amber italic opacity-60 mb-6">
                                      {(node.effectHooks ?? []).map(h => h.desc).join(' · ')}
                                  </div>
                          
                                  {/* ── OWNED NODE CONTROLS ── */}
                                  {isOwned && (
                                      <div className="mt-6 p-8 border-t border-surface-high">
                                          {node.id !== 'western_warpgate' && (
                                              <div className="mb-8">
                                                  <div className="flex-between text-md text-amber tracking-widest mb-2">
                                                      <span>SIGNAL_STABILITY</span>
                                                      <span className={stability < 30 ? 'text-red font-bold animate-pulse' : ''}>{Math.round(stability)}%</span>
                                                  </div>
                                                  <Bar pct={stability} variant={stability < 30 ? "ftg" : "default"}/> 
                                              </div>
                                          )}

                                          <div className="flex justify-end gap-8">
                                              {node.id !== 'western_warpgate' && (
                                                  <button
                                                    onClick={() => dispatchWithSound({ type: 'MAINTAIN_NODE', hexId: node.id })}
                                                    disabled={stability >= 95 || state.stamina < 15}
                                                    className={cn(
                                                      "btn-maintain",
                                                      stability < 30 && "btn-maintain-critical"
                                                    )}
                                                  >
                                                    MAINTAIN (15 STA)
                                                    {stability < 95 && state.stamina >= 15 && (
                                                      <span className="ml-2 text-[9px] opacity-70">
                                                        [+{Math.min(45, Math.max(10, Math.floor((100 - stability) * 0.6)))}%]
                                                      </span>
                                                    )}
                                                  </button>
                                              )}
                                              
                                              {captured.length > 1 && node.id !== 'western_warpgate' && (
                                                  <button
                                                      onClick={() => dispatchWithSound({ type: 'SEVER_CONNECTION', hexId: node.id })}
                                                      className="btn btn-xs btn-danger"
                                                      style={{ margin: 0, width: 'auto' }}
                                                  >
                                                      DISCONNECT
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                  )}


                                  {/* ── RECLAIM WARNING ── */}
                                  {reclaimData && (
                                      <div className="card-alert-reclaim mt-12 p-10 border-l-4 border-red">
                                          <div className="flex-between text-[10px] font-bold text-red mb-4">
                                              <span>{reclaimData.stage === 'SCAN' ? 'SYSTEM_TRACE' : 'EXTERNAL_BREACH'}</span>
                                              <span className="animate-pulse">{reclaimData.progress}%</span>
                                          </div>
                                          {/* Red bar for reclaim progress */}
                                          <Bar pct={reclaimData.progress} variant="ftg"/> 
                                          <button 
                                            onClick={() => state.reputation >= 25 && dispatchWithSound({ type: 'SECURE_NODE', hexId: node.id })}
                                            disabled={state.reputation < 25}
                                            className="btn btn-xs btn-danger w-full mt-8 font-black"
                                          >
                                            {state.reputation >= 25 
                                              ? 'EXECUTE COUNTER-MEASURE (25 REP)' 
                                              : `INSUFFICIENT REP (${state.reputation}/25)`
                                            }
                                          </button>
                                      </div>
                                  )}
                          
                                  {/* ── DEPLOY BUTTONS GRID ── */}
                                  {showDeployButtons && (
                                      <div className="grid grid-2 gap-4 mt-8 pt-8 border-t border-surface-high">
                                          {['streetRunner', 'dataThief', 'infiltrator', 'fixer', 'shadowBroker'].map(type => {
                                              const available = (state.agents || []).filter(a => a.role === type && a.status === 'ACTIVE');
                                              if (available.length === 0) return null;

                                              const bestAgent = available.sort((a, b) => a.fatigue - b.fatigue)[0];
                                              const zoneScales = { Z4: 1, Z7: 2, Z2: 3, Z3: 4, Z6: 6, Z1: 8, Z5: 15 };
                                              const opCost = Math.floor(2000 * (zoneScales[node.districtId] || 1)); 
                                              const disabled = state.gold < opCost;

                                              return (
                                                  <button 
                                                      key={type}
                                                      disabled={disabled}
                                                      onClick={() => dispatchWithSound({ type: 'DEPLOY_RUNNER', hexId: node.id, agentId: bestAgent.id })}
                                                      className={cn(
                                                          "btn p-6 flex flex-col items-start text-left",
                                                          disabled ? 'btn-disabled opacity-80' : 'btn-amber'
                                                      )}
                                                      style={{ margin: 0 }}
                                                  >
                                                      <div className="flex-between w-full font-bold mb-2 text-[10px]">
                                                          <span className="uppercase">{R_LABELS[type]} [{available.length}]</span>
                                                          <span className={disabled ? 'text-red' : 'text-amber'}>{opCost.toLocaleString()} CR</span>
                                                      </div>
                                                      <div className={cn('text-[9px] opacity-80', bestAgent.fatigue > 50 ? 'text-orange' : 'text-green')}>
                                                          &gt; {bestAgent.name} (FTG: {bestAgent.fatigue}%)
                                                      </div>
                                                  </button>
                                              );
                                          })}
                                      </div>
                                  )}

                                  {/* ── BLOCKED WARNINGS ── */}
                                  {canHack && !isGateLocked && (isBandwidthFull || isOverloaded) && (
                                      <div className="card-alert mt-8 p-10 text-center border-l-4 border-red">
                                          <div className="text-[10px] text-red font-bold tracking-widest mb-4">
                                              [!] {isOverloaded ? 'ALL_CHANNELS_BUSY' : 'SYS_LIMIT: NO BANDWIDTH'}
                                          </div>
                                          <div className="text-[9px] text-muted">
                                              {isOverloaded 
                                                  ? `Infrastructure supports max ${maxMissions} concurrent connection(s).` 
                                                  : 'Upgrade SOFT_BANDWIDTH or DISCONNECT an active node.'}
                                          </div>
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

// ── OFFLINE POPUP ──────────────────────────────────────────────────────────────

function OfflinePopup({ report, onDismiss }) {
  if (!report) return null;
  return createPortal(
    <div className="modal-root">
      <div className="modal-content">
        <div className="text-xs text-muted tracking-widest mb-16">
          :: SHADOW_GUILD — RECONNECTING
        </div>
        <div className="text-lg font-bold text-amber mb-18 tracking-wider">
          WELCOME BACK, OPERATIVE
        </div>

        <div className="stat-row mb-8">
          <span className="stat-key">TIME OFFLINE</span>
          <span className="stat-val">{fmtElapsed(report.elapsed)}</span>
        </div>

        <div className="stat-row mb-8">
          <span className="stat-key">RUNNERS EARNED</span>
          <span className={cn("stat-val", report.earnedGold > 0 ? "text-green" : "text-muted")}>
            {report.earnedGold > 0 ? `+${report.earnedGold.toLocaleString()} CR` : 'NONE'}
          </span>
        </div>

        <div className="stat-row mb-18">
          <span className="stat-key">HEAT DECAYED</span>
          <span className={cn("stat-val", (report.heatDecayed ?? 0) > 0 ? "text-green" : "text-muted")}>
            {(report.heatDecayed ?? 0) > 0 ? `-${report.heatDecayed}%` : '—'}
          </span>
        </div>

        <div className="text-xs text-muted italic mb-18 pt-12 border-t border-surface-high">
          [ZERO &gt;&gt;] the city didn't stop while you were gone.
        </div>

        <button onClick={onDismiss} className="btn btn-amber w-full text-center">
          RESUME OPERATIONS
        </button>
      </div>
    </div>,
    document.body
  );
}

// ==========================================
// 3. MAIN APP STATE & EFFECTS
// ==========================================



// ── AGENT CARD ────────────────────────────────────────────────────────────────
function AgentCard({ agent, dispatch, gold }) {
  const isPending   = agent.spec === 'PENDING';
  const isTraining  = agent.status === 'TRAINING';
  const isActive    = agent.status === 'ACTIVE';
  const isTired     = agent.fatigue > 0;
  const healCost    = getHealCost(agent);
  const xpNeeded    = (agent.level || 1) * 1000;
  const xpPercent   = ((agent.xp || 0) / xpNeeded) * 100;

  let statusColorClass = 'text-muted';
  let statusColor = 'var(--muted)';
  if (isActive) {
    statusColorClass = 'text-green';
    statusColor = 'var(--green)';
  } else if (isTraining) {
    statusColorClass = 'text-purple';
    statusColor = 'var(--purple)';
  } else if (agent.status === 'ON_MISSION') {
    statusColorClass = 'text-cyan';
    statusColor = 'var(--cyan)';
  } else if (agent.status === 'EXHAUSTED' || agent.status === 'INJURED' || agent.status === 'CAPTURED') {
    statusColorClass = 'text-red animate-pulse';
    statusColor = 'var(--red)';
  }

  // V AgentCard:
  const TraitIcon = {
    GREEDY: Coins,
    PARANOID: Eye,
    LOYAL: Shield,
    UNSTABLE: Zap,
    CYNIC: MessageSquare,
    IDEALIST: Star
  }[agent.traits?.[0]] || User; // User je teraz definované

  const dws = (action) => {
    dispatch(action);
    switch (action.type) {
      case 'HEAL_AGENT':       audioManager.healAgent(); break;
      case 'HEAL_ALL_INJURED':   audioManager.healAgent(); break;
      case 'ASSIGN_TRAINING':  audioManager.assignTraining(); break;
      case 'STOP_TRAINING':    audioManager.stopTraining(); break;
      case 'SET_RUNNER_SPEC':  audioManager.setRunnerSpec(); break;
      default: break;
    }
  };

  return (
    <div className="card agent-card p-8 flex flex-col justify-between" style={{ minHeight: '120px' }}>
      
      {/* HEADER: Avatar + Name */}
      <div className="flex items-center gap-6 mb-4">
        {/* AVATAR PLACEHOLDER */}
        <div className="w-10 h-10 rounded-full border border-surface-low flex items-center justify-center bg-surface-low">
          <Icon component={TraitIcon} size={18} color={statusColor} />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-bold truncate" style={{ color: statusColor }}>
            {agent.name}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-widest">
            {agent.role} {agent.level > 1 && `· LVL ${agent.level}`}
          </div>
        </div>
      </div>


      {/* STATS ROW (Mini) */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4 text-[9px] text-muted">
        <div>
          STL<br/><span className="text-white">{agent.stats?.stealth || 40}</span>
        </div>
        <div>
          SPD<br/><span className="text-white">{agent.stats?.speed || 40}</span>
        </div>
        <div>
          INT<br/><span className="text-white">{agent.stats?.intel || 40}</span>
        </div>
      </div>

      {/* BARS (Compact) */}
      <div className="mb-2">
        {/* FTG Bar - Thin */}
        <div className="flex-between text-[9px] mb-1">
          <span className="text-muted">FTG</span>
          <span>{agent.fatigue}%</span>
        </div>
        <Bar pct={agent.fatigue} variant="ftg" thin />
      </div>
      
      {/* XP Bar - Thin (pre aktívnych agentov, nie PENDING) */}
      {!isPending && (
        <div className="mb-4">
          <div className="flex-between text-[9px] mb-1">
            <span className="text-muted">XP</span>
            <span className="text-muted">{agent.xp || 0} / {xpNeeded}</span>
          </div>
          <Bar pct={xpPercent} variant="xp" thin />
        </div>
      )}

      {/* ACTIONS (Full width at bottom) */}
      {!isPending ? (
        <div className="flex gap-4 mt-2 pt-4" style={{ borderTop: '1px solid var(--surface-low)' }}>
          {isTired && agent.status !== 'ON_MISSION' && agent.status !== 'CAPTURED' && (
            <button
              onClick={() => dws({ type: 'HEAL_AGENT', agentId: agent.id })}
              disabled={gold < healCost}
              className={cn("btn btn-xs flex-1 text-center", gold >= healCost ? "btn-danger" : "btn-disabled")}
              style={{ margin: 0 }}
            >
              HEAL [{healCost}]
            </button>
          )}
          {isActive && !isTired && (
            <button
              onClick={() => dws({ type: 'ASSIGN_TRAINING', agentId: agent.id })}
              className="btn btn-xs btn-purple flex-1 text-center"
              style={{ margin: 0 }}
            >
              TRAIN [15 CR/s]
            </button>
          )}
          {isTraining && (
            <button
              onClick={() => dws({ type: 'STOP_TRAINING', agentId: agent.id })}
              className="btn btn-xs flex-1 text-center border-red text-red"
              style={{ margin: 0 }}
            >
              HALT
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-4 mt-2 pt-4" style={{ borderTop: '1px solid var(--amber)' }}>
          <button
            onClick={() => dws({ type: 'SET_RUNNER_SPEC', runnerType: agent.role, spec: 'GREEDY' })}
            className="btn btn-xs flex-1 text-center bg-amber text-bg"
            style={{ margin: 0, border: 'none' }}
          >
            [GREEDY] +50% CR
          </button>
          <button
            onClick={() => dws({ type: 'SET_RUNNER_SPEC', runnerType: agent.role, spec: 'SHADOW' })}
            className="btn btn-xs flex-1 text-center bg-purple text-white"
            style={{ margin: 0, border: 'none' }}
          >
            [SHADOW] -50% HEAT
          </button>
        </div>
      )}
    </div>
  );
}

const srCycle = DEV_MODE ? 5  : 30;
const dtCycle = DEV_MODE ? 10 : 120;
const ifCycle = DEV_MODE ? 15 : 900;
const fxCycle = DEV_MODE ? 20 : 3600;
const sbCycle = DEV_MODE ? 30 : 7200;

export default function App() {
  const [state, dispatch] = useReducer(reducer, loadInitialState());
  const [appPhase, setAppPhase] = useState(() => {
    const booted = localStorage.getItem('sg_booted');
    const intro  = localStorage.getItem('sg_intro');
    const done   = localStorage.getItem('sg_first_done');
    if (!booted) return 'BOOT';
    if (!intro || !done) return 'INTRO';
    return 'GAME';
  });
  const [showBoot, setShowBoot] = useState(() => {
    try { return localStorage.getItem('sg_boot_seen') !== '1'; }
    catch { return false; }
  });
  const [activeTab, setActiveTab] = useState(() => {
    const resetTab = localStorage.getItem('sg_reset_tab');
    if (resetTab) { localStorage.removeItem('sg_reset_tab'); return resetTab; }
    return 'OPERATIONS';
  });
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

  const [audioVolume,  setAudioVolume]  = useState(0.4);
  // ── UNLOCK REVEAL LOGIC ─────────────────────────────────────────────────────
  const prevUnlocked = useRef(new Set());

  // Táto funkcia len kontroluje, NEUKLADÁ stav.
  const isNewlyUnlocked = (feature) => {
    const nowUnlocked = isUnlocked(state, feature);
    const wasUnlocked = prevUnlocked.current.has(feature);
    return nowUnlocked && !wasUnlocked;
  };

  // Tento effect aktualizuje "pamäť" po každom renderi.
  // Bezo neby by isNewlyUnlocked vracalo true donekonečna.
  useEffect(() => {
    const currentUnlocked = new Set();
    // Musíme skontrolovať všetky možné features, ktoré ťa zaujímajú
    const allFeatures = [
      'breach', 'xp', 'upgrades_tab', 'runners', 'agency', 
      'rep', 'barter', 'intel', 'protocol', 'dark_market', 
      'district', 'daily', 'deep_siphon', 'manual_cool', 
      'ai_subroutine', 'mainframe', 'stamina', 'heat' // pridané pre dashboard
    ];
    
    allFeatures.forEach(f => {
      if (isUnlocked(state, f)) currentUnlocked.add(f);
    });
    
    prevUnlocked.current = currentUnlocked;
  }); // Spustí sa po každom renderi

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
  const prevLogLen        = useRef(0);
  const prevZeroCount     = useRef(0);
  const logContentRef     = useRef(null);
  const comboMaxTriggered = useRef(false);
  const notifiedUnlocks   = useRef(new Set());

  // ── KONTROLA PRE LAST STAND EVENT ──
	const lastStandEntry = Object.entries(state.reclaiming || {}).find(([id, r]) => r.stage === 'LAST_STAND');
	const lastStandNodeId = lastStandEntry?.[0];
	const lastStandTimer = lastStandEntry?.[1]?.timer;

  const logRef = useRef(state.log);
  logRef.current = state.log;

  const mods = calculateMapModifiers(state);

  // ── DERIVED CALCULATIONS (Pre "Flow Rates" panel) ───────────────────────────────
  const derived = useMemo(() => {
    // 1. Výpočet pasívneho príjmu (CR/sec) z aktívnych agentov
    let cps = 0;
    const activeAgents = (state.agents || []).filter(a => a.status === 'ACTIVE');
    
    const baseIncomes = { 
      streetRunner: 2, 
      dataThief: 8, 
      infiltrator: 35, 
      fixer: 150, 
      shadowBroker: 600 
    };
    
    const cycles = { 
      streetRunner: srCycle, 
      dataThief: dtCycle, 
      infiltrator: ifCycle, 
      fixer: fxCycle, 
      shadowBroker: sbCycle 
    };

    const idleMult = state.isIdle ? 0.6 : 1.0;
    const guildMult = state.prestigePerks?.GUILD_MASTER ? 1.25 : 1;

    activeAgents.forEach(a => {
      const base = baseIncomes[a.role] || 0;
      const cycle = cycles[a.role] || 60;
      const specMult = a.spec === 'GREEDY' ? 1.5 : 1;
      // Základný vzorec: (Base * Spec * Guild * Idle) / Cycle
      cps += (base * specMult * guildMult * idleMult) / cycle;
    });

    // 2. Výpočet Heat/min
    // Base decay: cca -0.2 heat za sekundu -> -12 za minútu
    // Overclock: +0.8 heat za sekundu -> +48 za minútu
    let heatPerMin = -12;
    if (state.overclockActive) {
      heatPerMin += 48;
    }

    // 3. Stamina regen (jednoduchý odhad)
    let staRegen = 0.2; 

    return { cps, heatPerMin, staRegen };
  }, [
    state.agents, 
    state.isIdle, 
    state.overclockActive, 
    state.prestigePerks, 
    srCycle, dtCycle, ifCycle, fxCycle, sbCycle
  ]);


  // ==========================================
   // 4. RENDERERS (Sub-functions)
   // ==========================================

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

  // Dark Market premenné
  const dmUnlocked = isUnlocked(state, 'dark_market');
  const dmBusy = state.darkMarketCooldown > 0;
  const dmDisabled = isBlocked || !dmUnlocked || dmBusy || state.inventory.length === 0;

  // 🔥 DYNAMICKÝ COOLDOWN PRE UI (ukáže správny čas)
  const mapModsDark = calculateMapModifiers(state);
  const baseDarkMarketCd = 7200;
  const cdReductionFromMap = mapModsDark.darkMarketCd || 0;
  const darkExchangeReduction = ((state.intelUpgrades?.darkExchange ?? 0) >= 1) ? 1800 : 0;
  const actualDarkMarketCd = Math.max(0, baseDarkMarketCd + cdReductionFromMap - darkExchangeReduction);
  const cdHours = Math.floor(actualDarkMarketCd / 3600);
  const cdMinutes = Math.floor((actualDarkMarketCd % 3600) / 60);

  const runGoldEarned   = state.runGoldEarned ?? 0;
  const canPrestige = state.level >= 10 && (state.runGoldEarned ?? 0) >= 100000;
  const prestigePoints   = state.prestigePoints ?? 0;
  const prestigePerks    = state.prestigePerks ?? {};
  const activeProtocol   = state.activeProtocol ?? 'NONE';
  const activeProtoDef   = PROTOCOL_DEFS[activeProtocol] ?? null;
  const siphonCost      = prestigePerks.GHOST_STEP ? 8 : 10;
  const eyeReveal       = !!prestigePerks.EYE_REVEAL;

  

  const hasNetScanner = (state.intelUpgrades?.netScanner ?? 0) >= 1;
  const tabBadges = useMemo(() => getTabBadges(state), [state]);
  const heat = Math.round(state.heat);
  const siphonChance     = hasNetScanner ? Math.round(effectiveSuccessRate(0.70, state.level, 0.03, heat, state.upgrades.ghostProtocol ?? 0) * 100) : null;
  const breachChance     = hasNetScanner ? Math.round(effectiveSuccessRate(0.55, state.level, 0.04, heat) * 100) : null;
  const deepSiphonChance = hasNetScanner ? Math.round(effectiveSuccessRate(0.65, state.level, 0.03, heat) * 100) : null;
  const mainframeChance  = hasNetScanner ? Math.round(effectiveSuccessRate(0.35, state.level, 0.03, heat) * 100) : null;

  const heatColor =
    heatRound >= 81 ? '#ef4444' :
    heatRound >= 61 ? '#f97316' :
    heatRound >= 31 ? '#eab308' : 'var(--amber)';

  {/* ── PRIDAJ TÝCHTO PÁR RIADKOV PRED RETURN ── */}
  const usedBw = (state.capturedHexes?.length || 0) + (state.activeMissions?.length || 0);
  const overclockBonus = state.overclockActive ? 2 : 0;
  const maxBw = 1 + (state.intelUpgrades?.serverRacks || 0) + overclockBonus;
  const overload = Math.max(0, usedBw - maxBw);

  const comboCount  = state.comboCount ?? 0;
  const comboPct    = Math.min(comboCount * 0.01, 0.20);
  const comboHigh   = comboCount >= 10;
  const comboGlowClass =
    comboCount >= 20 ? 'combo-glow-max' :
    comboCount >= 15 ? 'combo-glow-high' :
    comboCount >= 5  ? 'combo-glow-low'  : '';
  const comboTextClass =
    comboCount >= 15 ? 'text-gold' :
    comboHigh        ? 'text-amber' : 'text-muted';

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

  const hotItems = state.inventory.filter(i => i.isHot);
  // Najprv najcennejšie (b.gold - a.gold), ak majú rovnakú cenu, tak tie s najkratším časom
  const coolTarget = hotItems.length > 0
    ? [...hotItems].sort((a, b) => (b.gold - a.gold) || (a.cooldownRemaining - b.cooldownRemaining))[0]
    : null;

  // Trainees count (pre AFK overlay a Neural Sim)
  const traineesCount = (state.agents || []).filter(a => a.status === 'TRAINING').length || 0;
  
  const SORT_MODES = ['VALUE', 'TIME', 'COLD'];
  const sortedInventory = [...state.inventory].sort((a, b) => {
    if (inventorySort === 'VALUE')    return b.gold - a.gold;
    if (inventorySort === 'COLD') {
      if (a.isHot !== b.isHot) return a.isHot ? 1 : -1;
      return a.cooldownRemaining - b.cooldownRemaining;
    }
    if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
    return a.cooldownRemaining - b.cooldownRemaining;
  });

  // Výpočet reálneho zárobku za jeden cyklus (nie za sekundu)
  const calculateCycleTotal = (runnerKey) => {
    const activeAgents = (state.agents || []).filter(a => a.role === runnerKey && a.status === 'ACTIVE');
    if (activeAgents.length === 0) return 0;

    // Base income za JEDEN CYKLUS (napr. 30s pre Street Runnera)
    const baseIncome = {
      streetRunner: 30,     // Base 30 CR za 30s = 1 CR/s
      dataThief: 120,       // Base 120 CR za 120s
      infiltrator: 900,     // atď.
      fixer: 3600,
      shadowBroker: 7200
    }[runnerKey] || 10;

    let total = 0;
    
    // Modifikátory zo štátu (pasívne)
    const guildMult = state.prestigePerks?.GUILD_MASTER ? 1.25 : 1;
    const idleMult = state.isIdle ? 0.6 : 1.0;

    activeAgents.forEach(a => {
      // 1. Level bonus: +15% k base za každý level nad 1
      const levelMult = 1 + ((a.level || 1) - 1) * 0.15;
      
      // 2. Špecifikácia
      const specMult = a.spec === 'GREEDY' ? 1.5 : 1; // Greedy dáva +50%

      // 3. Výpočet
      // Base Income * LevelMult * SpecMult * GuildMult * IdleMult
      total += baseIncome * levelMult * specMult * guildMult * idleMult;
    });

    // Synergy bonus (5 agentov = +20%)
    if (activeAgents.length >= 5) total *= 1.2;

    return Math.floor(total);
  };

  // ── THEME LOGIC ──
  const themeColor = AETHERIA_DISTRICTS[state.district]?.color ?? '#ffc174';
      
  const dynamicThemeStyle = {
      '--amber': '#ffc174', // Vždy jantárová pre text a UI
      '--district-color': themeColor, // Špeciálna farba len pre mapu a indikátor
      '--muted': 'rgba(255,193,116,0.3)',
  };

  // Nájdeme všetkých runnerov, ktorí majú špecializáciu v stave 'PENDING'
  const pendingSpecs = Object.entries(state.runnerSpec || {})
  .filter(([_, spec]) => spec === 'PENDING')
  .map(([type]) => type);

  // ── offline progress on mount ──────────────────────────────────────────────
  // ZVUK: Zazní až po kliknutí na tlačidlo "ACKNOWLEDGE" (nižšie v kóde)
  useEffect(() => {
    const report = calculateOfflineProgress(INITIAL_STATE, Date.now());
    if (report) {
      dispatch({ type: 'APPLY_OFFLINE', payload: report });
      setOfflineReport(report);
    }
  }, []);

  useEffect(() => {
    const lastLogin = localStorage.getItem('shadow_guild_last_login');
    const today = new Date().toDateString();
  
    if (lastLogin !== today) {
      const bonus = 1000 * (state.level || 1) * ((state.prestige || 0) + 1);
      
      dispatch({ type: 'DAILY_BONUS', amount: bonus });
      
      // ZVUK: Tu nie, pretože autplay policy. 
      // Ak chceš zvuk, musí byť viazaný na notifikáciu, ktorú user odklikne.
      
      localStorage.setItem('shadow_guild_last_login', today);
    }
  }, [state.level, state.prestige]); // Pridali sme závislosti

  // ── dispatch with sound ───────────────────────────────────────────────────
  const dispatchWithSound = useCallback((action) => {
    dispatch(action);
    switch (action.type) {
      case 'SELL_COOLED_ITEMS':  audioManager.sell(); break;
      case 'SELL_ITEM':          audioManager.sell(); break;
      case 'BUY_UPGRADE':
      case 'BUY_INTEL_UPGRADE':
      case 'BUY_PRESTIGE_PERK':
      case 'HIRE_RUNNER':        audioManager.upgrade(); break;
      case 'LAY_LOW':            audioManager.layLow(); break;
      case 'MANUAL_COOL':        audioManager.manualCool(); break;
      case 'DARK_MARKET':        audioManager.darkMarket(); break;
      case 'BARTER':             audioManager.barter(); break;
      case 'DECRYPT':            audioManager.decrypt(); break;
      case 'PRESTIGE':           audioManager.prestige(); break;
      case 'DEPLOY_RUNNER':      audioManager.deployRunner(); break;
      case 'MAINTAIN_NODE':      audioManager.maintainNode(); break;
      case 'SEVER_CONNECTION':   audioManager.severConnection(); break;
      case 'TOGGLE_OVERCLOCK':   audioManager.overclock(); break;
      case 'SET_DISTRICT':
      case 'SET_PROTOCOL':       audioManager.tab(); break;
      case 'SECURE_NODE':        audioManager.secureNode(); break;
      case 'PURGE_LOGS':         audioManager.purgeLogs(); break;
      case 'COUNTER_HACK':       audioManager.counterHack(); break;
      case 'HEAL_AGENT':         audioManager.healAgent(); break;
      case 'ASSIGN_TRAINING':    audioManager.assignTraining(); break;
      case 'STOP_TRAINING':      audioManager.stopTraining(); break;
      case 'SET_RUNNER_SPEC':    audioManager.setRunnerSpec(); break;
      case 'EXECUTE_LAST_STAND': audioManager.executeLastStand(); break;
      default: break;
    }
  }, []);

  // 1. Zostáva pôvodná utilita, ale je obalená v useCallback
  const saveGame = useCallback((stateToSave) => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
      console.log(":: AUTO-SAVE SAVED ::", new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Save failed:', e);
    }
  }, []);

  // 2. Refencia na aktuálny stav (kľúč k tomu, aby auto-save fungoval)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 3. Game Tick (Bez zvuku, aby neotravoval)
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []); // Prázdne pole = neresetuje sa

  // 4. Auto-save interval (stabilný, 30s)
  useEffect(() => {
    const id = setInterval(() => {
      // Vždy vezme najnovší state z referencie
      saveGame(stateRef.current);
    }, 30000);
    return () => clearInterval(id);
}, [saveGame]); // Závislosť je len na saveGame, ktorá sa nemení

  // ── save on critical state changes ────────────────────────────────────────
  useEffect(() => {
    saveGame(state);
  }, [
    state.prestige,
    state.bustedLockout,
    state.raidActive,
    state.capturedHexes,
    state.prestigePerks,
    state.upgrades,
    state.intelUpgrades,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ACTIVITY TRACKER ──
  useEffect(() => {
    const handleActivity = (e) => {
      if (state.isIdle && e.type !== 'click') return;

      if (!audioManager.ctx) {
        audioManager.init();
        audioManager.loadVolume();
        audioManager.startAmbient();
        setAudioVolume(audioManager.masterVolume);
      }

      // ZVUK: Prebudenie z AFK
      if (state.isIdle) {
         audioManager.systemWakeup();
      }

      dispatch({ type: 'USER_ACTIVE' });
    };

    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [state.isIdle, dispatch]);


  // Nájdi uzly s kritickou stabilitou (pod 30%)
  const criticalNodesCount = Object.entries(state.nodeStability || {})
  .filter(([hexId, stability]) => stability < 30 && hexId !== 'western_warpgate')
  .length;

  // ─── MILESTONE TOASTS ────────────────────────────────────────
  // Ref-based timer survives re-renders from tick state updates.
  const [activeMilestone, setActiveMilestone] = useState(null);
  const milestoneTimerRef = useRef(null);

  useEffect(() => {
    if (activeMilestone) return;              // Already showing one
    if (milestoneTimerRef.current) return;    // Timer already queued
    const queue = state.milestoneToastQueue ?? [];
    if (queue.length === 0) return;

    const next = queue[0];
    setActiveMilestone(next);
    audioManager.zeroLine?.();
    milestoneTimerRef.current = setTimeout(() => {
      milestoneTimerRef.current = null;
      setActiveMilestone(null);
      dispatch({ type: 'CONSUME_MILESTONE_TOAST' });
    }, 4000);
  }, [state.milestoneToastQueue, activeMilestone]);

  // Unmount-only cleanup
  useEffect(() => () => {
    if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
  }, []);

  // ─── KEYBOARD SHORTCUTS ─────────────────────────────────────
  // Ref-based so handler doesn't re-register every tick.
  const shortcutsCtxRef = useRef({ state, specModal, dispatch, dispatchWithSound });
  shortcutsCtxRef.current = { state, specModal, dispatch, dispatchWithSound };

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const { state: s, specModal: sm, dispatch: d, dispatchWithSound: dws } = shortcutsCtxRef.current;

      let consumed = true;
      switch (e.key) {
        case '1': setActiveTab('OPERATIONS'); audioManager.tab(); break;
        case '2': if (isUnlocked(s, 'agency'))        { setActiveTab('AGENCY');     audioManager.tab(); } else consumed = false; break;
        case '3': if (isUnlocked(s, 'upgrades_tab'))  { setActiveTab('UPGRADES');   audioManager.tab(); } else consumed = false; break;
        case '4': if (isUnlocked(s, 'district'))      { setActiveTab('NETWORK');    audioManager.tab(); } else consumed = false; break;
        case '5': if (isUnlocked(s, 'awakening_tab'))     { setActiveTab('AWAKENING');  audioManager.tab(); } else consumed = false; break;
        case '6': setActiveTab('SETTINGS'); audioManager.tab(); break;

        case 'q': case 'Q': dws({ type: 'SIPHON' }); break;
        case 'w': case 'W': if (isUnlocked(s, 'breach'))       dws({ type: 'BREACH' });       else consumed = false; break;
        case 'e': case 'E': if (isUnlocked(s, 'deep_siphon'))  dws({ type: 'DEEP_SIPHON' });  else consumed = false; break;
        case 'r': case 'R': if (isUnlocked(s, 'mainframe'))    dws({ type: 'MAINFRAME_HACK' }); else consumed = false; break;

        case 'l': case 'L': dws({ type: 'LAY_LOW' }); break;

        case 'Escape':
          if (sm) setSpecModal(null);
          else if (s.prestigeModalOpen) d({ type: 'HIDE_PRESTIGE_MODAL' });
          else consumed = false;
          break;

        default: consumed = false;
      }
      if (consumed) e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);  // Empty deps — handler uses ref for fresh context

  // ─── DYNAMIC BROWSER TAB TITLE ──────────────────────────────
  // Updates page title so player sees state from other tabs (Cookie Clicker style).
  useEffect(() => {
    const heatTag = heatRound >= 80 ? ` · ⚠${heatRound}%` : '';
    const bustedTag = (state.bustedLockout ?? 0) > 0 ? ' · BUSTED' : '';
    document.title = `SHADOW_GUILD · ${fmt(state.gold)} CR${heatTag}${bustedTag}`;
  }, [state.gold, heatRound, state.bustedLockout]);
  
  // E1: chromatic aberration when heat is high
  useEffect(() => {
    const heat = state.heat ?? 0;
    document.body.classList.toggle('heat-glitch',          heat >= 90 && heat < 95);
    document.body.classList.toggle('heat-glitch-critical', heat >= 95);
    return () => {
      // cleanup on unmount only
    };
  }, [state.heat]);

  // Tutorial dialogue director — ZERO speaks at milestones
  useEffect(() => {
    const { newLines, newSeen } = checkTutorialDialogues(state);
    if (newLines.length > 0) {
      dispatch({ type: 'QUEUE_ZERO_DIALOGUE', lines: newLines, seenIds: newSeen });
    }
  }, [
    state.totalActions,
    state.combo,
    state.heat,
    state.bustedLockout,
    state.level,
    state.layLowActive,
    state.agents?.length,
    state.capturedHexes?.length,
    state.prestige,
  ]);

  // Combo state machine — body class for screen effects
  useEffect(() => {
    const c = state.comboCount ?? 0;
    document.body.classList.remove('combo-stealth', 'combo-aggressive', 'combo-burning');
    if (c >= 16)      document.body.classList.add('combo-burning');
    else if (c >= 6)  document.body.classList.add('combo-aggressive');
    else if (c > 0)   document.body.classList.add('combo-stealth');
    return () => {
      document.body.classList.remove('combo-stealth', 'combo-aggressive', 'combo-burning');
    };
  }, [state.comboCount]);

  // ── feedback → visual effects + audio ─────────────────────────────────────
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
      audioManager.bustedSound();
    }
    // audio
    if (type === 'SUCCESS') audioManager.siphonSuccess();
    else if (type === 'FAIL') audioManager.siphonFail();
    else if (type !== 'BUSTED' && state.log[0]?.startsWith('[!]')) audioManager.error();
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

  // ── achievement overlay + audio ────────────────────────────────────────────
  const lastAchievementTs = useRef(null);
  useEffect(() => {
    if (!state.achievementFeedback) return;
    if (state.achievementFeedback.ts === lastAchievementTs.current) return;
    lastAchievementTs.current = state.achievementFeedback.ts;
    const { id, ts } = state.achievementFeedback;
    setOverlays(prev => [...prev, { id: ts, type: 'ACHIEVEMENT', achievementId: id }]);
    setTimeout(() => setOverlays(prev => prev.filter(o => o.id !== ts)), 3500);
    audioManager.achievement();
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

  // ── auto-scroll log to top (newest entry) on log change ──────────────────
  useEffect(() => {
    logContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.log]);

  // ── glitch log + audio when a ZERO message arrives ───────────────────────
  useEffect(() => {
    const getLogString = (entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && entry.text) return entry.text;
      return '';
    };
    const zeroCount = state.log.filter(e => getLogString(e).includes('[ZERO >>]')).length;
    if (zeroCount > prevZeroCount.current) {
      setLogGlitch(true);
      setTimeout(() => setLogGlitch(false), 600);
      audioManager.zeroMessage();
    }
    prevZeroCount.current = zeroCount;
  }, [state.log.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── combo max: trigger Zero message once per streak ────────────────────────
  useEffect(() => {
    const cc = state.comboCount ?? 0;
    if (cc >= 20 && !comboMaxTriggered.current) {
      comboMaxTriggered.current = true;
      audioManager.achievement();
    }
    if (cc < 20) comboMaxTriggered.current = false;
  }, [state.comboCount]);

  // ── audio: mission splash — node captured ──────────────────────────────────
  const prevMissionSplash = useRef(null);
  useEffect(() => {
    if (state.missionSplash && !prevMissionSplash.current) audioManager.nodeCapture();
    prevMissionSplash.current = state.missionSplash;
  }, [state.missionSplash]);

  // ── audio: raid starts — play once ────────────────────────────────────────
  const prevRaidActive = useRef(false);
  useEffect(() => {
    if (state.raidActive && !prevRaidActive.current) audioManager.raidWarning();
    prevRaidActive.current = state.raidActive;
  }, [state.raidActive]);

  // ── audio: ambient heat intensity ─────────────────────────────────────────
  useEffect(() => {
    audioManager.setAmbientIntensity(state.heat);
  }, [state.heat]);

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

  // ==========================================
  // 5. MAIN RETURN (Layout Grid)
  // ==========================================

  if (appPhase === 'BOOT') return <BootSequence onComplete={() => {
    localStorage.setItem('sg_booted', '1');
    setAppPhase('INTRO');
  }} />;

  if (appPhase === 'INTRO') return <ZeroIntroScreen onComplete={() => {
    localStorage.setItem('sg_intro', '1');
    localStorage.setItem('sg_first_done', '1');
    setAppPhase('GAME');
  }} />;

  return (
    <div
    className={`game-root ${heatGlitchClass} ${heatDangerClass} ${isEyeAwakened(state) ? 'eye-awakened' : ''}`.trim()}
      style={{ filter: heatFilter, overflowX: 'hidden', ...dynamicThemeStyle }}
    >

			{/* ── HEAT TINT (Refaktorované na CSS class) ── */}
        {/* CSS class zabezpečuje position: fixed a pointer-events: none */}
        {heatRound > 80 && (
            <div 
                className="heat-tint" 
                style={{ background: `rgba(239,68,68,${Math.min(0.12, (heatRound - 80) * 0.006)})` }}
            />
        )}

		    {/* ── BUSTED FLASH (Refaktorované na CSS classes) ── */}
        {/* Odstránené inline styly, triedy .busted-flash a .busted-text handling všetko */}
        {bustedFlash && createPortal(
            <div className="busted-flash">
                <div className="busted-text">
                    !! SYSTEM COMPROMISED :: BUSTED !!
                </div>
            </div>,
            document.body
        )}

		    {/* ── RAID BANNER (Refaktorované na CSS class) ── */}
        {/* Trieda .raid-banner sa stará o pozíciu a blikanie */}
        {state.raidActive && createPortal(
            <div className="raid-banner">
                <div className="text-center font-mono">
                    <div className="text-red font-bold tracking-widest text-base">
                        !! POLICE RAID IN PROGRESS !!
                    </div>
                    <div className="text-white text-xl my-2 font-bold">
                        LAY LOW IN {state.raidTimer}s
                    </div>
                    <div className="text-xs text-muted">
                        OR LOSE 30% CREDITS
                    </div>
                </div>
            </div>,
            document.body
        )}

			{/* ── SYSTEM SCAN OVERLAY ── */}
      {scanActive && createPortal(
          <>
              {/* 1. Overlay Background - použitá trieda .scan-overlay */}
              <div className="scan-overlay" />

              {/* 2. Top Bar - použitá trieda .scan-bar */}
              <div className="scan-bar">
                  <span className="text-red font-bold text-base tracking-mega">
                      :: SYSTEM_SCAN IN PROGRESS
                  </span>
                  <span className="text-white font-bold text-lg tracking-widest">
                      [{scanTimer}s]
                  </span>
              </div>

              {/* 3. Controls Container - použitá trieda .scan-controls */}
              {/* Dynamické poziciovanie zostáva inline */}
              <div 
                  className="scan-controls" 
                  style={{ 
                      left: `${scanBtnPos.x}%`, 
                      top: `${scanBtnPos.y}%`, 
                      transform: 'translate(-50%, -50%)' 
                  }}
              >
                  <button
                      onClick={() => dispatchWithSound({ type: 'PURGE_LOGS' })}
                      className="btn btn-danger animate-raid text-center"
                      style={{ width: '100%' }}
                  >
                      [ PURGE_LOCAL_LOGS ]
                  </button>

                  <button
                      onClick={() => dispatchWithSound({ type: 'COUNTER_HACK' })}
                      className="btn btn-purple text-center"
                      style={{ width: '100%' }}
                  >
                      [ COUNTER-HACK (-50 STA) ]
                  </button>

                  <div className="text-muted text-[10px] mt-2">
                      CHANCE: 30% | RWD: 5000 CR + HEAT RESET
                  </div>
              </div>
          </>,
          document.body
      )}

			{/* ── OFFLINE POPUP ── */}
      {state.offlineReport && createPortal(
          <div className="idle-prompt">
              <div className="modal-content">
                  <div className="text-lg text-amber font-bold mb-6 border-b border-surface-high pb-4">
                      :: OFFLINE_RECON_REPORT
                  </div>
                  
                  <div className="text-xs text-white mb-10">
                      GHOST_DURATION: <span className="text-amber">{state.offlineReport.seconds}s</span>
                      <div className="mt-6 text-muted flex flex-col gap-2 text-left">
                          {state.offlineReport.events.map((ev, i) => (
                              <span key={i}>- {ev}</span>
                          ))}
                      </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-green text-center mb-10">
                      + {state.offlineReport.earned.toLocaleString()} CR
                  </div>
                  
                  <button 
                      onClick={() => {
                          audioManager.dataLoad(); // ZVUK: Načítanie dát
                          dispatch({ type: 'CLEAR_OFFLINE_REPORT' });
                      }} 
                      className="btn btn-amber"
                      style={{ border: 'none' }}
                  >
                      [ ACKNOWLEDGE ]
                  </button>
              </div>
          </div>,
          document.body
      )}

      {/* ─── MILESTONE TOAST ──────────────────────────── */}
        {activeMilestone && createPortal(
          <div style={{
            position: 'fixed',
            top: 80,
            left: 0, right: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div className="milestone-toast" style={{
              background: 'rgba(8,8,8,0.95)',
              border: `2px solid #ffd700`,
              padding: '16px 28px',
              boxShadow: '0 0 40px rgba(255,215,0,0.5), inset 0 0 20px rgba(255,215,0,0.1)',
              minWidth: 300,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 9, color: '#ffd70099', letterSpacing: '0.4em',
                marginBottom: 4,
              }}>
                ★ MILESTONE ★
              </div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: '#ffd700',
                letterSpacing: '0.12em', textShadow: '0 0 12px rgba(255,215,0,0.6)',
                marginBottom: 6,
              }}>
                {activeMilestone.title}
              </div>
              <div style={{
                fontSize: 10, color: '#FFC174', fontStyle: 'italic',
                letterSpacing: '0.05em',
              }}>
                {activeMilestone.flavor}
              </div>
            </div>
          </div>,
          document.body
        )}
        
			{/* ── RUNNER SPECIALIZATION MODAL ── */}
      {specModal && createPortal(
          <div className="modal-root">
              <div className="modal-content modal-content-cyan">
                  <div className="text-lg font-bold mb-2 tracking-widest uppercase" style={{ color: 'var(--cyan)' }}>
                      :: Runner_Specialization
                  </div>
                  <div className="text-xs mb-10 uppercase">
                      <span className="text-amber">[{specModal.toUpperCase()}] — LEVEL UP BOUNDARY</span><br/>
                      <span className="text-muted normal-case text-[10px]">Awaiting doctrine selection...</span>
                  </div>
                  
                  <button
                      onClick={() => {
                          dispatchWithSound({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'SHADOW' });
                          setSpecModal(null);
                      }}
                      className="btn btn-purple mb-4"
                  >
                      [ SHADOW_PROTOCOL ]<br/>
                      <span className="text-[10px] font-normal text-muted">[ HEAT_GEN -50% ]</span>
                  </button>
                  
                  <button
                      onClick={() => {
                          dispatchWithSound({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'GREEDY' });
                          setSpecModal(null);
                      }}
                      className="btn btn-success mb-10"
                  >
                      [ GREED_ALGORITHM ]<br/>
                      <span className="text-[10px] font-normal text-muted">[ CR_INCOME +50% ]</span>
                  </button>
                  
                  <button
                      onClick={() => setSpecModal(null)}
                      className="btn text-muted"
                      style={{ borderStyle: 'dashed', borderColor: 'var(--surface-high)' }}
                  >
                      [ Postpone Decision ]
                  </button>
              </div>
          </div>,
          document.body
      )}

			{/* ── FLOATING OVERLAYS ── */}
      {createPortal(
          <div className="overlay-root">
              {overlays.map(o => {
                  // Size logic mapping to CSS classes
                  const sizeClass = o.critical ? 'text-5xl' :
                                    o.type === 'SUCCESS' || o.type === 'UPGRADE' ? 'text-xl' :
                                    o.type === 'DAILY_COMPLETE' ? 'text-lg' :
                                    o.type === 'ACHIEVEMENT' ? 'text-base' : 
                                    o.type === 'BUSTED' ? 'opacity-0' : 'text-sm'; // Busted is hidden or default

                  const colorClass = o.critical ? 'text-gold' :
                                    o.type === 'SUCCESS' ? 'text-amber' :
                                    o.type === 'UPGRADE' || o.type === 'DAILY_COMPLETE' ? 'text-green' :
                                    o.type === 'ACHIEVEMENT' ? 'text-amber' : 'text-red';

                  return (
                      <div
                          key={o.id}
                          className={cn("overlay-float", o.critical && "overlay-float-crit", sizeClass, colorClass, "font-bold tracking-wider")}
                          style={{
                          }}
                      >
                          {o.type === 'SUCCESS'
                              ? o.critical ? `!! CRIT !!  +${o.gold} CR` : `+${o.gold} CR  ${o.item}`
                              : o.type === 'UPGRADE'       ? `> SYS_UPGRADE: ${o.label}`
                              : o.type === 'DAILY_COMPLETE' ? '[ DAILY_OP COMPLETE ]'
                              : o.type === 'ACHIEVEMENT'   ? `[ ACHIEVEMENT :: ${o.achievementId} ]`
                              : '>> TRACE_DETECTED'}
                      </div>
                  );
              })}
          </div>,
          document.body
      )}

      {/* ── MOBILE TAB BAR ── */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-low border-t border-amber/30 z-50 flex justify-between px-2 py-2 pb-safe">
          {[
            { id: 'DASH', label: 'DASH' }, 
            { id: 'OPS', label: 'OPS' }, 
            { id: 'AGENCY', label: 'AGN', locked: !isUnlocked(state, 'agency'), req: 'LVL 3' },
            { id: 'UPGRADES', label: 'UPG', locked: !isUnlocked(state, 'upgrades_tab'), req: 'LVL 3' }, 
            { id: 'AWAKENING', label: 'AWK', locked: !isUnlocked(state, 'awakening_tab'), req: 'LVL 8' },
            { id: 'SETTINGS', label: 'SYS' }
          ].map(t => {
            const isLocked = t.locked === true;
            
            return (
              <button 
                key={t.id} 
                onClick={() => {
                  if (isLocked) return;
                  setMobileTab(t.id);
                  audioManager.tab();
                  if (t.id !== 'DASH') {
                    // Mapovanie názvov tabov
                    const targetMap = {
                      'OPS': 'OPERATIONS', 
                      'NET': 'NETWORK', 
                      'AWAKENING': 'AWAKENING'
                    };
                    setActiveTab(targetMap[t.id] || t.id);
                  }
                }}
                className={cn(
                  "tab flex-1 text-center py-3 flex flex-col items-center justify-center",
                  mobileTab === t.id && "tab-active",
                  isLocked && "opacity-40 cursor-not-allowed"
                )}
                disabled={isLocked}
              >
                <span>{t.label}</span>
                {isLocked && t.req && <span className="text-sm block opacity-80">{t.req}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SHAKE WRAPPER ── */}
      <div 
        className={cn("flex-1 min-h-0 flex flex-col", shaking && "animate-shake")}
        onAnimationEnd={() => setShaking(false)}
      >
        {/* Hlavný Grid - Všimni si pb-24 na mobile, aby taby dole nezakryli obsah */}
        <div
          className={isMobile ? "flex flex-col flex-1 overflow-y-auto scroll-none pb-24" : "game-grid"}
          style={isMobile ? undefined : { minHeight: 0, height: '100%' }}
        >

          {/* ── NOVÝ SIDEBAR ── */}
          {(!isMobile || mobileTab === 'DASH') && (
            <Sidebar state={state} dispatchWithSound={dispatchWithSound} />
          )}

          {/* ── LEFT COL: DASHBOARD ── 
          {(!isMobile || mobileTab === 'DASH') && (
            <div className={cn("game-col", "dashboard-sidebar")}>

              {/* ── LOGO HEADER ── 
              <div className="dash-header">
                <div className="dash-title">SHADOW_GUILD</div>
                <span className="dash-version">V1.0.0</span>
              </div>
              <div className="dash-status">
                <span className="dash-status-dot animate-pulse" />
                <span className="text-[9px] text-green tracking-widest uppercase animate-pulse">TRANSMITTING</span>
                {state.prestige > 0 && (
                  <div className="ml-auto">
                    <Tag color="var(--gold)" filled>★ P{state.prestige}</Tag>
                  </div>
                )}
              </div>

              {/* ── OPERATIVE ID CARD ── 
              <div className="op-id-card">
                <div className="op-id-pattern" />
                <div className="relative z-10">
                  <div className="op-id-label">OPERATIVE_ID</div>
                  <div className="op-id-value">
                    {String(state.prestige + 1).padStart(2, '0')}
                  </div>
                  <div className="op-id-row">
                    <span className="text-muted">CLASS</span>
                    <span className="text-amber">SPECTER-{state.level}</span>
                  </div>
                  <div className="op-id-row">
                    <span className="text-muted">SECTOR</span>
                    {/* Dynamický názov sektoru z mapy 
                    <span className="text-amber">
                      {AETHERIA_DISTRICTS[state.district]?.name || state.district || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* GLOBAL INTRUSION WARNING 
              {Object.keys(state.reclaiming || {}).length > 0 && (
                <div className="intrusion-alert mb-6">!!! SYSTEM INTRUSION DETECTED !!!</div>
              )}

              {/* ── VITALS ── 
              <div className="mb-6">
                <div className="text-sm text-muted tracking-[0.25em] uppercase mb-6">:: VITALS</div>

                {/* CREDITS - Primary Currency 
                <div className="vitals-block" style={{ borderLeftColor: 'var(--amber)' }}>
                  <div className="vitals-label flex items-center gap-2">
                    <Icon component={Coins} size={12} />
                    CREDITS
                    {mods.goldMult > 1 && <span className="text-green ml-2">[+{Math.round((mods.goldMult - 1) * 100)}%]</span>}
                  </div>
                  <div className="vitals-value">
                    {state.gold.toLocaleString()} 
                    <span className="vitals-unit"> CR</span>
                    {traineesCount > 0 && <Tag color="var(--red)" filled className="ml-2">DRAIN</Tag>}
                  </div>
                </div>

                {/* GOLD - Prestige Currency 
                {state.prestige > 0 && (
                  <div className="vitals-block" style={{ borderLeftColor: 'var(--gold)' }}>
                    <div className="vitals-label flex items-center gap-2">
                      <Icon component={Coins} size={12} color="var(--gold)" />
                      GOLD (LEGACY)
                    </div>
                    <div className="vitals-value" style={{ color: 'var(--gold)' }}>
                      {state.gold.toLocaleString()} 
                      <span className="vitals-unit">AU</span>
                    </div>
                  </div>
                )}

                {/* REP - Secondary Currency 
                {isUnlocked(state, 'rep') && (
                  <div className="vitals-block" style={{ borderLeftColor: 'var(--purple)' }}>
                    <div className="vitals-label flex items-center gap-2">
                      <Icon component={ShieldOff} size={12} color="var(--purple)" />
                      REP
                      {mods.repBoost > 0 && <span className="text-green ml-2">[+{Math.round(mods.repBoost * 100)}%]</span>}
                    </div>
                    <div className="vitals-value" style={{ color: 'var(--purple)' }}>
                      {state.reputation.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* ── STATUS BARS ── 
                <div className="mb-2">
                  <div className="text-sm text-muted tracking-widest uppercase">:: STATUS</div>
                </div>

                {/* XP Bar 
                <div className="mb-4">
                  <Row 
                    label={<><Icon component={Activity} size={10} className="mr-1" /> LVL {state.level}</>} 
                    value={`${state.xp.toLocaleString()} / ${xpNeeded.toLocaleString()}`} 
                    color="var(--purple)" 
                    className="b-row-clean" 
                  />
                  <div className="mt-1"><Bar pct={xpPct} variant="xp" /></div>
                </div>

                {/* Heat Bar 
                <div className="mb-4">
                  <Row 
                    label={<><Icon component={Flame} size={10} color={heatColor} className="mr-1" /> HEAT</>} 
                    value={`${heatRound}%`}
                    color={heatColor}
                    className="b-row-clean" 
                  />
                  <div className="mt-1"><Bar pct={heatRound} variant="ftg" /></div>
                </div>

                {/* Stamina Bar 
                <div className="mb-4">
                  <Row 
                    label={<><Icon component={Zap} size={10} className="mr-1" /> STAMINA</>} 
                    value={`${Math.floor(state.stamina)} / ${effectiveMaxStamina}`}
                    className="b-row-clean" 
                  />
                  <div className="mt-1"><Bar pct={staminaPct} variant="default" /></div>
                </div>
              </div>

              {/* ── RUNNERS STATUS (Namiesto Flow Rates) ── 
              {(state.agents || []).filter(a => a.status === 'ACTIVE').length > 0 && (
                <div>
                  <div className="text-[9px] text-muted tracking-[0.25em] uppercase mb-6">:: ACTIVE_RUNNERS</div>
                  
                  {['streetRunner', 'dataThief', 'infiltrator', 'fixer', 'shadowBroker'].map(role => {
                    const activeAgents = (state.agents || []).filter(a => a.role === role && a.status === 'ACTIVE');
                    if (activeAgents.length === 0) return null;

                    const roleLabels = { streetRunner: 'S_RUN', dataThief: 'D_THIEF', infiltrator: 'INF', fixer: 'FIX', shadowBroker: 'S_BRKR' };
                    const baseCycles = { streetRunner: DEV_MODE ? 5 : 30, dataThief: DEV_MODE ? 10 : 120, infiltrator: DEV_MODE ? 15 : 900, fixer: DEV_MODE ? 20 : 3600, shadowBroker: DEV_MODE ? 30 : 7200 };

                    const hwLvl = state.upgrades?.hwOverclock ?? 0;
                    const hwSpeedMult = Math.pow(0.85, hwLvl);
                    const targetCycle = Math.max(1, Math.round(baseCycles[role] * hwSpeedMult));

                    // Zoberieme max tick z aktívnych agentov tohto typu
                    const maxTick = Math.max(0, ...activeAgents.map(a => a.tickCount || 0));
                    const secondsLeft = Math.max(0, targetCycle - maxTick);

                    return (
                      <div key={role} className="stat-row">
                        <span className="stat-key"><Icon component={Users} />{roleLabels[role]}</span>
                        <span className="stat-val text-sm text-green">
                          {activeAgents.length}x · +{calculateCycleTotal(role)} CR · {secondsLeft}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── GRID STATUS ── 
              {isUnlocked(state, 'district') && (
                <div className="bandwidth-panel">
                  {/* Header 
                  <div className="text-[10px] text-muted tracking-[0.25em] uppercase mb-4 font-bold">
                    :: GRID_STATUS
                  </div>

                  {/* Bandwidth Section 
                  <div>
                    <div className="flex-between text-sm mb-2">
                      <span className="text-muted tracking-wide flex items-center gap-2">
                        <Icon component={Activity} size={12} /> BANDWIDTH_LOAD
                      </span>
                      <span className={cn("font-black", overload > 0 ? "text-red" : "text-amber")}>
                        {usedBw} / {maxBw} Hz
                      </span>
                    </div>
                    
                    <Bar 
                      pct={(usedBw / maxBw) * 100} 
                      variant={overload > 0 ? "ftg" : "default"} 
                    />

                    {/* Overclock Warning - vnorené priamo pod bar 
                    {state.overclockActive && (
                      <div className="mt-3 p-2 border border-red-full text-center">
                        <span className="text-[10px] text-red font-bold animate-pulse">! OVERRIDE_ACTIVE !</span>
                      </div>
                    )}

                    {/* Overload Alert 
                    {overload > 0 && (
                      <div className="mt-3 p-3 text-left text-[10px] text-red border border-red-full">
                        <div className="font-bold mb-1">[!] CRITICAL_OVERLOAD: +{overload} Hz</div>
                        <div className="opacity-80">DECAY_MULT: {100 + (overload * 300)}% | HEAT_LEAK: +{overload * 0.8}/s</div>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid 
                  <div className="grid grid-3 gap-2 mt-2">
                    <MiniStat label="BAND" value={usedBw} unit="Hz" color="var(--cyan)" />
                    <MiniStat label="REV" value={`+${mods.revenuePct ?? 0}`} unit="%" color="var(--green)" />
                    <MiniStat label="XP" value={`+${Math.round((mods.xpBoost ?? 0) * 100)}`} unit="%" color="var(--purple)" />
                  </div>
                </div>
              )}

              {/* ── OVERRIDE PROTOCOL ── 
              {isUnlocked(state, 'manual_cool') && (
                <div className={cn(
                  "p-4 border transition-all",
                  state.overclockActive ? "overclock-active" : "border-surface-high" // Použijeme triedy z index.css
                )}>
                  <div className={cn(
                    "text-[10px] tracking-widest mb-3 font-bold uppercase",
                    state.overclockActive ? "text-red" : "text-muted"
                  )}>
                    :: OVERRIDE_PROTOCOL
                  </div>
                  
                  <div className="text-[10px] text-muted mb-4 leading-relaxed">
                    Force inject +2 Bandwidth. 
                    <br/><span className="text-red font-bold">WARNING:</span> 
                    <br/>• HEAT_LEAK: +0.8/s
                    <br/>• DECAY_MULT: +300%
                  </div>

                  <button
                    onClick={() => dispatchWithSound({ type: 'TOGGLE_OVERCLOCK' })}
                    disabled={state.overclockCooldown > 0 && !state.overclockActive}
                    className={cn(
                      "btn-override w-full py-3 text-xs font-black tracking-wider uppercase",
                      state.overclockActive ? "btn-override-active" : "btn-override"
                    )}
                  >
                    {state.overclockActive 
                      ? '[!] CANCEL OVERRIDE' 
                      : state.overclockCooldown > 0 
                        ? `SYS_COOLING: ${Math.floor(state.overclockCooldown / 60)}m ${state.overclockCooldown % 60}s` 
                        : 'INITIATE OVERRIDE'
                    }
                  </button>
                </div>
              )}

              {/* ── FOOTER ── 
              <div className="mt-auto pt-8 text-center text-[9px] text-muted tracking-widest opacity-80">
                :: UPLINK_ENCRYPTED ::
              </div>

            </div>
          )} */}

          
          {/* ── CENTER COL: TABS ── */}
          {(!isMobile || mobileTab !== 'DASH') && (
            <div className={cn("game-col-center", isMobile && "h-auto p-0 border-none bg-transparent")}>
              
              {/* TABS HEADER */}
              {!isMobile && (() => {
                const visibleTabs = getVisibleTabs(state);
                const TAB_TO_ACTIVE = {
                  OPERATIONS: 'OPERATIONS',
                  AGENCY:     'AGENCY',
                  UPGRADES:   'UPGRADES',
                  NETWORK:    'NETWORK',
                  AWAKENING:  'AWAKENING',
                  SETTINGS:   'SETTINGS',
                };
                const TAB_BADGE_KEY = {
                  OPERATIONS: null,
                  AGENCY:     'AGENCY',
                  UPGRADES:   'UPGRADES',
                  NETWORK:    'NETWORK',
                  AWAKENING:  'AWAKENING',
                  SETTINGS:   null,
                };
                const TAB_NEWUNLOCK = {
                  OPERATIONS: null,
                  AGENCY:     'agency',
                  UPGRADES:   'upgrades_tab',
                  NETWORK:    'district',
                  AWAKENING:  'awakening_tab',
                  SETTINGS:   null,
                };
                return (
                  <div className="flex gap-2 mb-14 border-b border-surface-high pb-0">
                    {visibleTabs.filter(t => t.visible).map(t => {
                      const activeKey = TAB_TO_ACTIVE[t.id];
                      const newUnlockKey = TAB_NEWUNLOCK[t.id];
                      const badgeKey = TAB_BADGE_KEY[t.id];
                      return (
                        <Tab
                          key={t.id}
                          label={t.locked ? `${t.label} · ${t.reqText}` : t.label}
                          active={activeTab === activeKey}
                          disabled={t.locked}
                          onClick={() => { if (t.locked) return; setActiveTab(activeKey); audioManager.tab(); }}
                          className={newUnlockKey && isNewlyUnlocked(newUnlockKey) ? 'unlock-reveal' : undefined}
                          badge={(!t.locked && activeTab !== activeKey && badgeKey) ? tabBadges[badgeKey] : null}
                        />
                      );
                    })}
                  </div>
                );
              })()}

            {/* ── OPERATIONS ── */}
            {activeTab === 'OPERATIONS' && (
              <div key="tab-OPS" className="tab-zoom" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <OpsTab state={state} dispatchWithSound={dispatchWithSound} />
              </div>
            )}

            {/* ── AGENCY ── */}
            {activeTab === 'AGENCY' && isUnlocked(state, 'agency') && (
              <div key="tab-AGENCY" className="tab-zoom" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <AgencyTab state={state} dispatchWithSound={dispatchWithSound} />
              </div>
            )}

            {/* ── UPGRADES ── */}
            {activeTab === 'UPGRADES' && isUnlocked(state, 'upgrades_tab') && (
              <div key="tab-UPGRADES" className="tab-zoom" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <UpgradesTab state={state} dispatchWithSound={dispatchWithSound} />
              </div>
            )}

            {/* ── NETWORK ── */}
            {activeTab === 'NETWORK' && isUnlocked(state, 'district') && (
              <div key="tab-NETWORK" className="tab-zoom" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <NetworkTab state={state} dispatchWithSound={dispatchWithSound} />
              </div>
            )}

            {/* ── AWAKENING ── */}
            {activeTab === 'AWAKENING' && isUnlocked(state, 'awakening_tab') && (
              <div key="tab-AWAKENING" className="tab-zoom" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <AwakeningTab state={state} dispatchWithSound={dispatchWithSound} />
              </div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'SETTINGS' && (
              <div key="tab-SETTINGS" className="tab-zoom" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <SettingsTab state={state} dispatch={dispatch} />
              </div>
            )}

            



            {/* ── 2. OPS TAB ── 
            {activeTab === 'OPERATIONS' && (
              <div className="flex-1 flex flex-col overflow-y-auto gap-6 scroll-none">
                
                {/* ── SECTION 1: TARGET BRIEFING ── 
                {isUnlocked(state, 'district') ? (
                  <div 
                    className="card-bordered relative overflow-hidden flex-shrink-0"
                    style={{ borderColor: AETHERIA_DISTRICTS[state.district]?.color || 'var(--muted)' }}
                  >
                    {/* ... existujúci kód zostáva rovnaký ... 
                    {/* Dekoratívne pozadie 
                    <div 
                      className="absolute right-[-20px] top-[-10px] text-[72px] font-black pointer-events-none select-none"
                      style={{ color: AETHERIA_DISTRICTS[state.district]?.color, opacity: 0.06 }}
                    >
                      {state.district}
                    </div>

                    <div className="flex-between items-start mb-6 relative z-10">
                      <div>
                        <div className="text-md text-muted tracking-widest mb-2">:: ACTIVE_OPERATION_TARGET</div>
                        <div 
                          className="text-lg font-bold tracking-widest uppercase text-4xl"
                          style={{ color: AETHERIA_DISTRICTS[state.district]?.color }}
                        >
                          {AETHERIA_DISTRICTS[state.district]?.name || 'UNKNOWN_SECTOR'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-6xl font-black"
                          style={{ color: AETHERIA_DISTRICTS[state.district]?.color }}
                        >
                          x{AETHERIA_DISTRICTS[state.district]?.lootMultiplier || '1.0'}
                        </div>
                        <div className="text-sm text-muted">LOOT MULTIPLIER</div>
                      </div>
                    </div>

                    {/* District Buttons 
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                      {[...new Set((state.capturedHexes || []).map(id => AETHERIA_MAP[id]?.districtId).filter(Boolean))].map(dId => (
                        <button
                          key={dId}
                          onClick={() => dispatchWithSound({ type: 'SET_DISTRICT', district: dId })}
                          className={cn(
                            "btn btn-xs",
                            state.district === dId ? "btn-active" : ""
                          )}
                          style={{ 
                            borderColor: AETHERIA_DISTRICTS[dId]?.color,
                            color: state.district === dId ? 'var(--bg)' : AETHERIA_DISTRICTS[dId]?.color,
                            backgroundColor: state.district === dId ? (AETHERIA_DISTRICTS[dId]?.color) : 'transparent'
                          }}
                        >
                          {AETHERIA_DISTRICTS[dId]?.name || dId}
                        </button>
                      ))}
                    </div>

                    <div className="text-sm text-muted leading-relaxed relative z-10">
                      {AETHERIA_DISTRICTS[state.district]?.desc}
                    </div>
                  </div>
                ) : (
                  // Fallback pre early game — kým nie je district unlocked
                  <div className="card-bordered relative overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--muted)' }}>
                    <div className="text-lg font-bold text-amber tracking-widest">:: TARGET_LOCKED</div>
                    <div className="text-xs text-muted mt-2 leading-relaxed">
                      Secure funds to access network nodes.<br/>
                      <span className="text-[10px] opacity-60">[Unlock: LVL 6 + 50 REP]</span>
                    </div>
                  </div>
                )}

                {/* ── SECTION 2: PROTOCOLS ── 
                {isUnlocked(state, 'protocol') && (
                    // Pridané wrapper div s animáciou
                    <div className={cn(isNewlyUnlocked('protocol') && 'unlock-reveal')}>
                      <div className="card">
                        <div className="flex-between mb-4">
                          <span className="text-md text-muted tracking-widest uppercase">:: OPERATION_PROTOCOL</span>
                          {activeProtoDef && (
                            <span className="text-xs font-bold" style={{ color: activeProtoDef.color }}>
                              [{activeProtocol}]
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {Object.entries(PROTOCOL_DEFS).map(([key, def]) => {
                            const active = activeProtocol === key;
                            return (
                              <button
                                key={key}
                                onClick={() => dispatchWithSound({ type: 'SET_PROTOCOL', protocol: key })}
                                className={cn("proto-btn", active && "proto-btn-active")}
                                style={{ 
                                  borderColor: active ? def.color : 'var(--muted)',
                                  color: active ? def.color : 'var(--muted)'
                                }}
                              >
                                {def.label}
                                <span className="block text-[10px] opacity-75 mt-1">
                                  {def.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {activeProtocol !== 'NONE' && (
                          <button
                            onClick={() => dispatchWithSound({ type: 'SET_PROTOCOL', protocol: 'NONE' })}
                            className="btn btn-danger w-full mt-4"
                          >
                            DEACTIVATE_PROTOCOL
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* ── SECTION 3: COMBO + ACTIONS ── 
                <div className="flex-shrink-0">
                  {/* Combo Meter 
                  {isUnlocked(state, 'combo') && (
                    <div className={cn(
                      "combo-meter",
                      comboCount > 0 && "combo-meter-active",
                      comboHigh && "combo-meter-high",
                      comboCount >= 10 && comboCount < 15 && "animate-pulse"
                    )}>
                      {comboCount > 0 && (
                        <>
                          <span className={cn(
                            "text-sm font-bold tracking-widest",
                            comboCount >= 15 ? "text-gold animate-gold" : "text-amber"
                          )}>
                            COMBO x{comboCount}
                          </span>
                          <span className="text-sm text-muted">
                            [+{Math.round(comboPct * 100)}% VALUE]
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* ACTION BUTTONS GRID 
                  <div className="flex flex-wrap gap-4">
                    {(() => {
                      const protocolChanceMod = state.activeProtocol === 'SILENT_RUN' ? -20 : 0; 
                      const applyMod = (chance) => (chance !== null && chance !== undefined) ? Math.max(0, chance + protocolChanceMod) : null;

                      const actionButtons = [
                        { 
                          id: 'SIPHON', 
                          title: 'SIPHON_ ', 
                          target: `[${siphonCost} STA]`, 
                          chance: applyMod(siphonChance), 
                          disabled: isBlocked || state.stamina < siphonCost || invFull 
                        },
                        { 
                          id: 'BREACH', 
                          title: 'BREACH_ ', 
                          target: '[25 STA]', 
                          chance: applyMod(breachChance), 
                          disabled: isBlocked || state.stamina < 25 || invFull, 
                          cond: isUnlocked(state, 'breach'), 
                          unlockId: 'breach' 
                        },
                        { 
                          id: 'DEEP_SIPHON', 
                          title: 'DEEP_SIPHON_ ', 
                          target: '[15 STA]', 
                          chance: applyMod(deepSiphonChance), 
                          disabled: isBlocked || state.stamina < 15 || invFull, 
                          cond: isUnlocked(state, 'deep_siphon'), 
                          unlockId: 'deep_siphon' 
                        },
                        { 
                          id: 'MAINFRAME_HACK', 
                          title: 'MAINFRAME_HACK_ ', 
                          target: '[40 STA]', 
                          chance: applyMod(mainframeChance), 
                          disabled: isBlocked || state.stamina < 40 || invFull, 
                          cond: isUnlocked(state, 'mainframe'), 
                          unlockId: 'mainframe' 
                        },
                        { 
                          id: 'LAY_LOW', 
                          title: 'LAY_LOW_', 
                          target: state.layLowActive ? ` [${state.layLowTimer}s]` : '', 
                          disabled: state.bustedLockout > 0 || (state.layLowCooldown > 0 && !state.raidActive), 
                          active: state.layLowActive 
                        },
                        { 
                          id: 'SELL_COOLED_ITEMS', 
                          title: 'SELL_COOLED_ITEMS_ ', 
                          target: coldCount > 0 ? `[+${coldValue.toLocaleString()} CR]` : '', 
                          targetColor: 'text-green',
                          disabled: coldCount === 0, 
                          extra: coldCount === 0 ? <span className="text-muted">[WAIT FOR COLD]</span> : null
                        },
                        { 
                          id: 'MANUAL_COOL', 
                          title: 'COOL_DOWN_ ', 
                          target: coolTarget ? `[${coolTarget.id.replace(/_/g, ' ')}]` : '[NO_TARGET]',
                          extra: <span className="text-cyan">[-15S | 5 STA]</span>,
                          disabled: !coolTarget || state.stamina < 5, 
                          cond: isUnlocked(state, 'manual_cool'),
                          payload: { targetId: coolTarget?.instanceId },
                          unlockId: 'manual_cool'
                        },
                        { 
                          id: 'DARK_MARKET', 
                          title: 'DARK_MARKET_ ', 
                          target: dmUnlocked && dmBusy ? `[CD: ${fmtDuration(state.darkMarketCooldown)}]` : '', 
                          disabled: dmDisabled, 
                          cond: isUnlocked(state, 'dark_market'), 
                          unlockId: 'dark_market',
                          extra: !dmUnlocked 
                            ? <span className="text-red">[LOCKED: LVL 4 + 50 REP]</span>
                            : dmUnlocked && !dmBusy && state.inventory.length > 0 
                              ? <span className="text-green">[+{Math.floor(state.inventory.reduce((sum, i) => sum + i.gold, 0) * 0.6).toLocaleString()} CR]</span>
                              : dmUnlocked && !dmBusy && state.inventory.length === 0 
                                ? <span className="text-muted">[NO ITEMS]</span>
                                : null
                        },
                        { 
                          id: 'BARTER', 
                          title: 'BARTER_ ', 
                          target: '[10X DATA_CHIP → +1 REP]', 
                          disabled: barterDisabled, 
                          cond: isUnlocked(state, 'barter'), 
                          unlockId: 'barter',
                          extra: (state.barterCooldown ?? 0) > 0 ? <span className="text-muted">[CD]</span> : null
                        },
                      ];

                      return actionButtons.filter(btn => btn.cond !== false).map(btn => (
                        <div 
                          // KEY TRIK: Ak je to novo odomknuté, zmení sa key, React remountne element a spustí sa animácia
                          key={btn.cond && isNewlyUnlocked(btn.unlockId) ? `new-${btn.id}` : btn.id} 
                          className={cn(
                            "flex-[1_1_calc(50%-6px)] min-h-[56px]", 
                            btn.cond && isNewlyUnlocked(btn.unlockId) && 'unlock-reveal'
                          )}
                        >
                          <ProtoBtn
                            onClick={() => dispatchWithSound({ type: btn.id, ...(btn.payload || {}) })}
                            disabled={btn.disabled}
                            active={btn.active}
                            className="w-full h-full flex flex-col items-start justify-center text-left m-0 py-8 px-10"
                          >
                            <div className="font-bold text-sm tracking-widest uppercase leading-relaxed overflow-wrap w-full">
                              <span>{btn.title}</span>
                              {btn.target && <span className={btn.targetColor || "text-amber"}>{btn.target}</span>}
                            </div>
                            
                            {( (btn.chance !== null && btn.chance !== undefined) || btn.extra) && (
                              <div className="w-full text-xs font-mono tracking-wider uppercase leading-tight mt-1">
                                {btn.chance !== null && btn.chance !== undefined && (
                                  <span className="text-cyan opacity-80 mr-2">[{btn.chance}%]</span>
                                )}
                                {btn.extra}
                              </div>
                            )}
                          </ProtoBtn>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* ── SECTION 4: SYSTEM LOGS ── 
                <div className="system-log">
                  <div className="system-log-header">
                    <span className="text-md text-muted tracking-widest uppercase">:: SYSTEM_LOGS</span>
                    <span className={cn(
                      "text-[10px] tracking-widest",
                      state.bustedLockout > 0 ? "text-red" : "text-green"
                    )}>
                      {state.bustedLockout > 0 ? `LOCKOUT: ${state.bustedLockout}s` : 'SYSTEM_STABLE'}
                    </span>
                  </div>

                  <div className="system-log-content" ref={logContentRef}>
                    {state.log.length === 0 ? (
                      <div className="text-center py-10 opacity-30 text-xs">
                        ... AWAITING_PROTOCOL ...
                      </div>
                    ) : (
                      state.log.map((entry, i) => {
                        const upper = entry.toUpperCase();
                        let colorClass = 'text-muted';
                        if (entry.includes('[ZERO >>]')) colorClass = 'text-zero-message';
                        else if (upper.includes('[BUSTED]') || upper.includes('RAID') || upper.includes('SEIZED') || upper.includes('LOSE')) colorClass = 'text-red';
                        else if (upper.includes('WARNING') || upper.includes('BOUNTY') || upper.includes('ABORTED')) colorClass = 'text-orange';
                        else if (upper.includes('SUCCESS') || upper.includes('CAPTURED') || upper.includes('SOLD') || upper.includes('RESTORED') || upper.includes('CLEARED')) colorClass = 'text-green';
                        else if (upper.includes('LEVEL UP') || upper.includes('PROMOTION') || upper.includes('PROTOCOL') || upper.includes('RECOVERED')) colorClass = 'text-cyan';

                        if (i === 0 && entry.includes('[ZERO >>]')) {
                          return <ZeroLogEntry key={`z-${newestLogKey}`} text={entry} />;
                        }

                        return (
                          <div
                            key={i === 0 ? `n-${newestLogKey}` : i}
                            className={cn(
                              "log-entry",
                              colorClass,
                              i === 0 && "animate-type"
                            )}
                            style={{ opacity: Math.max(0.4, 1 - i * 0.045) }}
                          >
                            {entry}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )} */}

            {/* ── AGENCY TAB ── 
            {activeTab === 'AGENCY' && isUnlocked(state, 'agency') && (() => {
              return (
                <div className="flex-1 p-16 overflow-y-auto scroll-none">
                  
                  {/* HEADER & NEURAL SIM DASHBOARD 
                  <div className="flex flex-wrap justify-between items-end gap-16 mb-24 pb-16 border-muted">
                    <div>
                      <div className="text-3xl font-bold text-amber tracking-widest">SYNDICATE_ROSTER</div>
                      <div className="text-md text-muted mt-4">Manage recruitment, training, and recovery.</div>
                    </div>

                    {/* NEURAL SIM BANNER 
                    <div className={cn(
                      "flex items-center gap-16 px-12 border", 
                      traineesCount > 0 ? "card-purple" : "card"
                    )}>
                      <div>
                        <div className={cn("text-sm font-bold tracking-wide", traineesCount > 0 ? "text-purple" : "text-muted")}>NEURAL_SIM</div>
                        <div className="text-md text-white mt-2">{traineesCount} Active Trainees</div>
                      </div>
                      <div className="text-right pl-16" style={{ borderLeft: '1px solid var(--surface-low)' }}>
                        <div className="text-sm text-muted">Drain Rate</div>
                        <div className={cn("text-md font-bold", traineesCount > 0 ? "text-red" : "text-muted")}>-{traineesCount * 15} CR/s</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RECRUITMENT TERMINAL 
                  <div className="mb-32">
                    <div className="text-md text-muted tracking-widest uppercase mb-12">[ Recruitment_Network ]</div>
                    <div className="grid grid-auto gap-12">
                      {[
                        { id: 'streetRunner', label: 'STREET_RUNNER', cost: 300, lvl: 3, passive: '+2 CR/t' },
                        { id: 'dataThief', label: 'DATA_THIEF', cost: 800, lvl: 5, passive: '+8 CR/t' },
                        { id: 'infiltrator', label: 'INFILTRATOR', cost: 2500, lvl: 7, passive: '+35 CR/t' },
                        { id: 'fixer', label: 'FIXER', cost: 8000, lvl: 9, passive: '+150 CR/t' }
                      ].map(runner => {
                        const count = (state.agents || []).filter(a => a.role === runner.id).length;
                        const isLocked = state.level < runner.lvl;
                        const currentCost = Math.floor(runner.cost * Math.pow(1.5, count));
                        const canAfford = !isLocked && state.gold >= currentCost && count < 5;
                        
                        return (
                          <button 
                            key={runner.id} 
                            disabled={!canAfford} 
                            onClick={() => dispatchWithSound({ type: 'HIRE_RUNNER', runnerType: runner.id })} 
                            className={cn(
                              "flex flex-col gap-6 p-12 text-left transition-all card", 
                              isLocked ? "opacity-80" : canAfford ? "cursor-pointer hover:bg-surface-high" : "cursor-not-allowed"
                            )}
                            style={{ border: canAfford ? '1px solid var(--amber)' : undefined }}
                          >
                            <div className="flex-between w-full">
                              <span className={cn("font-bold text-base", isLocked ? "text-muted" : "text-amber")}>{runner.label}</span>
                              <span className="badge badge-muted">{count}/5</span>
                            </div>
                            <div className={cn("text-4xl font-normal mt-4", isLocked ? "text-muted" : canAfford ? "text-white" : "text-red")}>
                              {isLocked ? `LVL ${runner.lvl} REQ` : `${currentCost.toLocaleString()} CR`}
                            </div>
                            <div className="text-xs text-muted">Passive: {runner.passive}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROSTER 
                  {(state.agents || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                      <div className="text-amber-muted text-xs tracking-widest mb-4 opacity-80">:: NO OPERATIVES ::</div>
                      <div className="text-amber-muted text-[10px] italic">The city won't liberate itself.</div>
                      <pre className="text-md text-amber-muted opacity-80 mt-4">
{`  o
  /|\\
  / \\`}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-24">
                      {['streetRunner', 'dataThief', 'infiltrator', 'fixer'].map(roleType => {
                        const roleAgents = (state.agents || []).filter(a => a.role === roleType);
                        if (roleAgents.length === 0) return null;
                        return (
                          <div key={roleType}>
                            <div className="text-sm text-muted tracking-widest uppercase mb-12">[ {roleType}s ]</div>
                            <div className="grid grid-auto gap-12">
                              {roleAgents.map(agent => <AgentCard key={agent.id} agent={agent} dispatch={dispatch} gold={state.gold} />)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()} */}


            {/* ── UPGRADES TAB ── 
            {activeTab === 'UPGRADES' && (
              <div className="flex-1 min-h-0 overflow-y-auto scroll-none">
                
                {/* Definícia kategórií 
                {[
                  { key: 'COMBAT', label: 'COMBAT_PROTOCOLS', color: 'var(--red)', members: ['ghostProtocol', 'iceBreaker', 'signalDampener', 'traceEraser'] },
                  { key: 'ECONOMY', label: 'ECONOMIC_PROTOCOLS', color: 'var(--amber)', members: ['darkChannel', 'autoFencer', 'aiSubroutine', 'xpBoost'] },
                  { key: 'SURVIVAL', label: 'SURVIVAL_PROTOCOLS', color: 'var(--green)', members: ['neuralBoost', 'stimPack', 'safehouse', 'quantumEncryption', 'proxyServers'] },
                  { key: 'NETWORK', label: 'NETWORK_PROTOCOLS', color: 'var(--cyan)', members: ['voidDrive', 'hwOverclock', 'runnerStealth'] },
                ].map(cat => (
                  <div key={cat.key} className="mb-16">
                    <div className="panel-header font-bold tracking-widest mb-6 pb-2 border-b" style={{ color: cat.color, borderColor: cat.color }}>
                      :: {cat.label}
                    </div>
                    
                    {UPGRADE_DEFS
                      .filter(def => cat.members.includes(def.key))
                      .map(def => (
                        <UpgradeRow 
                          key={def.key} 
                          def={def} 
                          level={state.upgrades[def.key] ?? 0} 
                          gold={state.gold} 
                          dispatchWithSound={dispatchWithSound}
                        />
                    ))}
                  </div>
                ))}

                {/* INTEL UPGRADES (Purple) 
                {isUnlocked(state, 'intel') && (
                  // Pridané wrapper div s animáciou
                  <div className={cn(isNewlyUnlocked('intel') && 'unlock-reveal')}>
                    <div className="border-b border-purple mt-10 mb-6">
                      <span className="panel-header text-purple tracking-widest uppercase">
                        :: INTEL_&_ASSETS [REP]
                      </span>
                    </div>
                    
                    {INTEL_UPGRADE_DEFS.map(def => {
                      const level = state.intelUpgrades?.[def.key] ?? 0;
                      const maxed = level >= def.max;
                      const dynamicCost = getIntelUpgradeCost(def.key, level);
                      const canAfford = state.reputation >= dynamicCost;
                      
                      return (
                        <div 
                          key={def.key} 
                          className="flex-between items-center mb-4 p-8"
                          style={{ 
                            background: 'var(--surface-high)',
                            borderLeft: `3px solid ${maxed ? 'var(--green)' : 'var(--purple)'}`
                          }}
                        >
                          {/* ... (vnútro zostáva rovnaké) ... 
                           <div className="flex-1">
                            <div className="flex items-center gap-6">
                              <span className="font-bold text-md uppercase text-purple tracking-wider">
                                {def.label}
                              </span>
                              <span className={cn('badge', maxed ? 'badge-green' : 'text-purple')} style={!maxed ? { background: 'rgba(168, 85, 247, 0.1)' } : {}}>
                                {maxed ? 'MAX' : `LVL ${level}/${def.max}`}
                              </span>
                            </div>
                            <div className="text-xs text-purple-muted mt-4 italic opacity-60">
                              {def.effect}
                            </div>
                          </div>

                          {!maxed && (
                            <div className="flex items-center gap-12">
                              <span className={cn('font-black text-lg', canAfford ? 'text-purple' : 'text-red')}>
                                {dynamicCost.toLocaleString()} <span className="text-xs opacity-80">REP</span>
                              </span>
                              <BuyBtn
                                canAfford={canAfford}
                                maxed={false}
                                label="ACQUIRE"
                                onClick={() => dispatchWithSound({ type: 'BUY_INTEL_UPGRADE', key: def.key })}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )} */}



            {/* AWAKENING TAB 
            {activeTab === 'AWAKENING' && isUnlocked(state, 'mainframe') && (
              <div className="awakening-container">
                
                {/* HEADER 
                <div className="text-center mb-6">
                  <div className="text-xs text-muted tracking-widest opacity-80">
                    :: CYCLE_{String(state.prestige || 0).padStart(2,'0')} ::
                  </div>
                  <div 
                    className="text-5xl font-black mt-2"
                    style={{ color: 'var(--gold)', letterSpacing: '0.04em', textShadow: '0 0 30px rgba(255, 215, 0, 0.3)' }}
                  >
                    AWAKENING
                  </div>
                  <div className="text-sm text-muted mt-3 italic opacity-70">
                    Shed the network. Reset the cycle. Retain dominion over the void.
                  </div>
                </div>

                {/* PROGRESS BARS 
                <div className="w-full">
                  <Bar 
                    label="LEVEL PROGRESS" 
                    pct={(state.level / 10) * 100} 
                    color="var(--purple)" 
                  />
                  <div className="h-4" />
                  <Bar 
                    label="YIELD PROGRESS" 
                    pct={Math.min(100, ((state.runGoldEarned || 0) / 100000) * 100)} 
                    color="var(--amber)" 
                  />
                </div>

                {/* PRESTIGE BUTTON 
                <div className="mt-4">
                  <button
                    disabled={!canPrestige}
                    onClick={() => dispatchWithSound({ type: 'SHOW_PRESTIGE_MODAL' })}
                    className={cn(
                      "btn w-auto px-20 py-3 border-2 font-black text-lg",
                      canPrestige ? "border-gold text-gold animate-pulse" : "opacity-40 cursor-not-allowed"
                    )}
                    style={{ 
                      borderColor: 'var(--gold)', 
                      color: 'var(--gold)', 
                      textShadow: canPrestige ? '0 0 20px var(--gold)' : 'none',
                      background: 'transparent'
                    }}
                  >
                    ★ INITIATE AWAKENING ★
                  </button>
                  {!canPrestige && (
                    <div className="text-center mt-2 text-xs text-red tracking-widest">
                      REQUIREMENTS_UNMET :: CONTINUE_OPS
                    </div>
                  )}
                </div>

                {/* REWARDS PREVIEW 
                <Panel title="AWAKENING_REWARDS" accent="var(--gold)" dense>
                  <div className="grid grid-3 gap-2 mt-2">
                    <div className="reward-cell">
                      <div className="reward-cell-label">GOLD</div>
                      <div className="reward-cell-value" style={{ color: 'var(--gold)' }}>
                        +{Math.floor((state.runGoldEarned || 0) / 100000)}
                      </div>
                    </div>
                    <div className="reward-cell">
                      <div className="reward-cell-label">PRESTIGE</div>
                      <div className="reward-cell-value" style={{ color: 'var(--purple)' }}>
                        P{(state.prestige || 0) + 1}
                      </div>
                    </div>
                    <div className="reward-cell">
                      <div className="reward-cell-label">PERMAS</div>
                      <div className="reward-cell-value" style={{ color: 'var(--cyan)' }}>
                        +1 SLOT
                      </div>
                    </div>
                  </div>
                </Panel>

              </div>
            )} */}


            {/* ── SETTINGS TAB ── 
            {activeTab === 'SETTINGS' && (
              <div className="flex-1 min-h-0 overflow-y-auto scroll-none">

                {/* AUDIO SETTINGS 
                <div className="card mb-10">
                  <div className="text-sm font-bold mb-6">AUDIO_SETTINGS</div>
                  <div className="flex-between mb-4">
                    <span className="text-xs text-muted uppercase tracking-widest">MASTER VOLUME</span>
                    <span className="text-xs text-amber">{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={audioVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setAudioVolume(v);
                      audioManager.setVolume(v);
                    }}
                    style={{ width: '100%', accentColor: 'var(--amber)' }}
                  />
                  <button
                    className="btn btn-xs mt-6"
                    onClick={() => { audioManager.init(); audioManager.siphonSuccess(); }}
                    style={{ margin: 0, width: 'auto' }}
                  >
                    TEST SOUND
                  </button>
                </div>

                {/* ACHIEVEMENTS 
                <span className="panel-header mb-8">ACHIEVEMENTS</span>
                {ACHIEVEMENT_DEFS.map(def => {
                  const unlocked = !!((state.achievements ?? {})[def.id]);
                  return (
                    <div 
                      key={def.id} 
                      className="card mb-3"
                      style={{ borderLeft: `2px solid ${unlocked ? 'var(--green)' : 'var(--surface-high)'}` }}
                    >
                      <div className="flex-between mb-2">
                        <span 
                          className="text-md font-bold tracking-wide"
                          style={{ color: unlocked ? 'var(--green)' : 'var(--amber)' }}
                        >
                          {def.id}
                        </span>
                        <span 
                          className="text-md tracking-wider"
                          style={{ color: unlocked ? 'var(--green)' : 'var(--muted)' }}
                        >
                          {unlocked ? '[UNLOCKED]' : '[LOCKED]'}
                        </span>
                      </div>
                      <div className="text-xs text-muted mb-2">{def.desc}</div>
                      <div className="text-xs" style={{ color: unlocked ? 'var(--green)' : 'var(--muted)' }}>
                        {def.reward.rep ? `+${def.reward.rep} REP` : `+${def.reward.gold} CR`}
                      </div>
                    </div>
                  );
                })}

                {/* PRESTIGE PERK TREE 
                {(state.prestige ?? 0) >= 1 && (<>
                  <span className="panel-header mt-14 mb-4">PRESTIGE PERKS</span>
                  <div className="text-xs text-muted mb-6 tracking-wide">
                    {`PRESTIGE #${state.prestige} · x${(state.prestigeMultiplier ?? 1).toFixed(2)} MULTIPLIER`}
                  </div>
                  <div 
                    className="text-md font-bold tracking-wider mb-12"
                    style={{ color: prestigePoints > 0 ? 'var(--amber)' : 'var(--muted)' }}
                  >
                    {prestigePoints > 0 ? `SKILL POINTS AVAILABLE: ${prestigePoints}` : 'NO POINTS AVAILABLE'}
                  </div>

                  {['GHOST', 'OVERLORD', 'ARCHITECT'].map(branch => {
                    const branchColors = { GHOST: 'var(--cyan)', OVERLORD: 'var(--orange)', ARCHITECT: 'var(--purple)' };
                    const bColor = branchColors[branch];
                    const perks = PRESTIGE_PERK_DEFS.filter(d => d.branch === branch);
                    
                    return (
                      <div key={branch} className="mb-10">
                        <div 
                          className="text-xs font-bold mb-6 pb-4 border-b tracking-widest"
                          style={{ color: bColor, borderColor: bColor }}
                        >
                          :: {branch}
                        </div>
                        
                        {perks.map(def => {
                          const owned = !!prestigePerks[def.id];
                          const lvlMet = state.level >= (def.reqLevel ?? 1);
                          const canBuy = prestigePoints >= 1 && !owned && lvlMet;
                          const lockMsg = !lvlMet ? `[LVL ${def.reqLevel}]` : !owned && prestigePoints < 1 ? '[NO PTS]' : null;
                          
                          return (
                            <div 
                              key={def.id} 
                              className="card mb-3"
                              style={{ 
                                borderLeft: `2px solid ${owned ? bColor : lvlMet && prestigePoints > 0 ? 'var(--amber)' : 'var(--surface-high)'}`,
                                opacity: (!lvlMet) ? 0.45 : 1
                              }}
                            >
                              <div className="flex-between mb-2">
                                <span 
                                  className="text-md font-bold tracking-wide"
                                  style={{ color: owned ? bColor : 'var(--amber)' }}
                                >
                                  {def.id}
                                  {def.reqLevel > 1 && 
                                    <span className="ml-2 text-xs text-muted font-normal">[LVL {def.reqLevel}+]</span>
                                  }
                                </span>
                                {owned ? (
                                  <span className="text-xs tracking-wider" style={{ color: bColor }}>[ACTIVE]</span>
                                ) : lockMsg ? (
                                  <span className="text-xs text-muted">{lockMsg}</span>
                                ) : (
                                  <button
                                    onClick={() => canBuy && dispatchWithSound({ type: 'BUY_PRESTIGE_PERK', perkId: def.id })}
                                    className="btn btn-xs"
                                    style={{ 
                                      width: 'auto', 
                                      margin: 0, 
                                      borderColor: canBuy ? bColor : 'var(--muted)',
                                      color: canBuy ? bColor : 'var(--muted)',
                                      opacity: canBuy ? 1 : 0.4,
                                      cursor: canBuy ? 'pointer' : 'not-allowed'
                                    }}
                                  >SELECT</button>
                                )}
                              </div>
                              <div className="text-xs text-muted mb-2">{def.desc}</div>
                              <div className="text-xs text-muted italic">{def.effect}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>)}

                {/* PRESTIGE 
                <div className="panel-header mb-8">PRESTIGE</div>
                <div className="card-bordered border-amber/20 mb-16">
                  <div className={cn('flex items-center gap-6 text-md font-bold mb-8', canPrestige ? 'text-orange' : 'text-muted')}>
                    <Icon component={Star} size={12} color="currentColor" />
                    PRESTIGE SYSTEM
                  </div>
                  
                  <div className="text-sm text-amber mb-10 opacity-70 leading-relaxed">
                    Unlock: Level 10 + 100,000 CR earned this run.<br/>
                    Resets: gold, level, upgrades, runners.<br/>
                    Keeps: REP, intel upgrades, prestige count.
                  </div>
                  
                  <div className="bg-surface-low p-8 mb-8 border border-surface-high text-sm font-mono">
                    <div className="flex-between mb-1">
                      <span className="text-amber">Level Status:</span>
                      <span className={state.level >= 10 ? 'text-green' : 'text-amber'}>{state.level}/10</span>
                    </div>
                    <Bar pct={(state.level / 10) * 100} variant="xp" />
                    <div className="flex-between mb-1" style={{ marginTop: 10 }}>
                      <span className="text-amber">Run Yield:</span>
                      <span className={runGoldEarned >= 100000 ? 'text-green' : 'text-amber'}>
                        {runGoldEarned.toLocaleString()} / 100k CR
                      </span>
                    </div>
                    <Bar pct={Math.min(100, (runGoldEarned / 100000) * 100)} variant="default" />
                  </div>

                  <div className="flex-between text-sm text-amber mb-12">
                    <span>Lifetime_Yield:</span>
                    <span className="text-amber font-bold">{(state.totalGoldEarned ?? 0).toLocaleString()} CR</span>
                  </div>

                  <button
                      disabled={!canPrestige}
                      onClick={() => {
                        audioManager.prestige(); // ZVUK: Prestižny zvuk (existujúci)
                        dispatch({ type: 'SHOW_PRESTIGE_MODAL' });
                      }}
                      className={cn('btn w-full font-black text-center', canPrestige ? 'btn-amber animate-pulse' : 'btn-disabled')}
                      style={canPrestige ? { borderColor: 'var(--orange)', color: 'var(--orange)' } : {}}
                  >
                      {canPrestige 
                        ? `PRESTIGE → RUN #${(state.prestige ?? 0) + 1} [x${(1 + ((state.prestige ?? 0) + 1) * 0.25).toFixed(2)}]` 
                        : 'PRESTIGE [LOCKED]'}
                  </button>
                </div>
                {/* SAVE 
                <span className="panel-header mt-14 mb-8">SAVE_SYSTEM</span>

                {/* Export 
                <div className="card">
                  <div className="text-sm font-bold mb-6">EXPORT_SAVE</div>
                  <button
                    onClick={() => {
                      saveGame(state);
                      setExportString(exportSave(state));
                      setTimeout(() => exportRef.current?.select(), 50);
                    }}
                    className="btn mb-8"
                  >
                    GENERATE EXPORT
                  </button>
                  {exportString && (
                    <>
                      <textarea
                        ref={exportRef}
                        readOnly
                        value={exportString}
                        className="w-full h-24 bg-bg border border-muted text-amber p-8 resize-none outline-none mb-4"
                        style={{ boxSizing: 'border-box' }}
                      />
                      <button onClick={() => exportRef.current?.select()} className="btn text-sm">
                        SELECT ALL
                      </button>
                    </>
                  )}
                </div>

                {/* Import 
                <div className="card mt-4">
                  <div className="text-md font-bold mb-6">IMPORT_SAVE</div>
                  <textarea
                    value={importInput}
                    onChange={e => { setImportInput(e.target.value); setImportError(''); }}
                    placeholder="Paste save string here..."
                    className="w-full h-24 bg-bg border border-muted text-amber p-8 resize-none outline-none mb-6"
                    style={{ boxSizing: 'border-box' }}
                  />
                  {importError && <div className="text-sm text-red mb-6">{importError}</div>}
                  <button
                      onClick={() => {
                        const parsed = importSave(importInput.trim());
                        if (!parsed) { setImportError('INVALID SAVE DATA'); return; }
                        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
                        audioManager.dataLoad(); // ZVUK: Načítanie dát
                        dispatch({ type: 'LOAD_SAVE', payload: parsed, ts });
                        setImportInput('');
                        setImportError('');
                        setExportString('');
                      }}
                      className="btn"
                  >
                      LOAD SAVE
                  </button>
                </div>

                {/* Hard reset 
                <div className="card mt-4">
                  <div className="text-md font-bold mb-6 text-red">RESET_ALL</div>
                  <div className="text-sm text-muted mb-8">Wipes all progress. Cannot be undone.</div>
                  {!resetConfirm ? (
                    <button onClick={() => setResetConfirm(true)} className="btn btn-danger">
                      RESET
                    </button>
                  ) : (
                    <div className="flex gap-6">
                      <button 
                        onClick={() => {
                          audioManager.hardReset();
                          localStorage.removeItem(SAVE_KEY);
                          localStorage.removeItem('sg_booted');
                          localStorage.removeItem('sg_intro');
                          localStorage.removeItem('sg_first_done');
                          localStorage.setItem('sg_reset_tab', 'OPERATIONS');
                          dispatch({ type: 'HARD_RESET' });
                          window.location.reload();
                        }} 
                        className="btn btn-danger flex-1 text-center"
                        style={{ background: 'var(--red)', color: '#fff' }}
                      >
                        CONFIRM
                      </button>
                      <button 
                        onClick={() => {
                            audioManager.abort(); // ZVUK: Zrušenie
                            setResetConfirm(false);
                        }} 
                        className="btn flex-1 text-center"
                      >
                        CANCEL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
          )}

          {/* ── MISSION COMPLETE / FAILED SPLASH SCREEN ── */}
          {state.missionSplash && (() => {
            const splash = state.missionSplash;
            const isFailed = splash.failed === true;
            
            // Dynamické farby a texty podľa stavu
            const accentColor = isFailed ? '#ef4444' : '#22c55e';
            const headerText = isFailed ? ':: CONNECTION_SEVERED ::' : ':: INFILTRATION_SUCCESS ::';
            const goldLabel = isFailed ? 'DATA_CORRUPTED' : 'FUNDS_EXTRACTED';
            const xpLabel = isFailed ? 'TRACE_RESIDUE' : 'EXP_GAINED';

            return createPortal(
              <div style={{
                position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{
                  background: 'var(--surface-low)', border: `2px solid ${accentColor}`,
                  padding: '40px', minWidth: 400, textAlign: 'center',
                  boxShadow: `0 0 40px ${accentColor}33`,
                  animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <div style={{ fontSize: 12, color: accentColor, letterSpacing: '0.3rem', marginBottom: 10 }}>
                    {headerText}
                  </div>
                  
                  <div style={{ 
                    fontSize: 24, fontWeight: 700, color: 'var(--bg)', background: accentColor, 
                    padding: '10px', letterSpacing: '0.1rem', marginBottom: 20 
                  }}>
                    {splash.label}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 30 }}>
                    <div style={{ background: 'var(--surface-high)', padding: '10px', border: `1px solid ${accentColor}` }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{goldLabel}</div>
                      <div style={{ fontSize: 16, color: '#ffc174', fontWeight: 700 }}>
                        {isFailed ? '-' : '+'}{splash.gold.toLocaleString()} CR
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface-high)', padding: '10px', border: `1px solid ${accentColor}` }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{xpLabel}</div>
                      <div style={{ fontSize: 16, color: '#00d4ff', fontWeight: 700 }}>
                        +{splash.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      // Zvuk závisí od úspechu/zlyhania
                      if (isFailed) {
                        audioManager.siphonFail();
                      } else {
                        audioManager.siphonSuccess();
                      }
                      dispatch({ type: 'CLEAR_SPLASH' });
                    }}
                    style={{ 
                      width: '100%', padding: '14px', background: 'transparent', 
                      border: `1px solid ${accentColor}`, color: accentColor, 
                      fontSize: 12, fontWeight: 700, letterSpacing: '0.2rem', cursor: 'pointer',
                      transition: 'background 120ms, color 120ms'
                    }}
                  >
                    [ ACKNOWLEDGE ]
                  </button>
                </div>
              </div>,
              document.body
            );
          })()}

              {/* ── AFK PROMPT (Si tu?) ── */}
              {state.idlePromptActive && createPortal(
                <div className="idle-prompt">
                  <div className="modal-content modal-content-red text-center">
                    <div className="text-base text-red font-bold tracking-widest mb-10">
                      :: INACTIVITY DETECTED ::
                    </div>
                    <div className="text-md text-muted mb-20 leading-relaxed">
                      No operator input registered. <br/>
                      Entering Power-Saving Mode in{" "}
                      <span className="text-red font-bold">
                        {state.idlePromptTimestamp 
                          ? Math.max(0, Math.round(((state.idlePromptTimestamp + (DEV_MODE ? 10000 : 60000)) - Date.now()) / 1000)) 
                          : 0}
                        {" "}s
                      </span>.<br/>
                      Hostile operations will be paused. Output reduced to 60%.
                    </div>
                    <button 
                      onClick={() => {
                          audioManager.systemWakeup(); // ZVUK: Prebudenie
                          dispatch({ type: 'USER_ACTIVE' });
                      }} 
                      className="btn btn-danger-center w-full text-center"
                    >
                      [ OVERRIDE: I AM HERE ]
                    </button>
                  </div>
                </div>,
                document.body
              )}

              {/* ── HIBERNÁCIA (Stmavenie po AFK) ── */}
              {state.isIdle && createPortal(
                <div 
                  className="idle-hibernation-overlay"
                  onClick={() => {
                      audioManager.systemWakeup();
                      dispatch({ type: 'USER_ACTIVE' });
                  }}
                >
                  <div className="glitch-text mb-20" data-text=":: SYSTEM_HIBERNATED ::">
                    :: SYSTEM_HIBERNATED ::
                  </div>
                  
                  {/* NOVÉ: Zobrazenie stavu počas idle */}
                  <div className="text-md text-amber text-center max-w-sm mb-10 font-bold">
                    DORMANT_CREDITS: {state.gold.toLocaleString()} CR
                  </div>

                  <div className="text-md text-muted text-center max-w-sm mb-30">
                    Neural link suspended. Hostile operations <span className="text-red font-bold">PAUSED</span>.<br/>
                    Production output reduced to <span className="text-red font-bold">60%</span>.
                  </div>
                  
                  {/* NOVÉ: Ak je Neural Sim aktívny, ukáž varovanie */}
                  {traineesCount > 0 && (
                      <div className="text-sm text-red text-center max-w-sm mb-20 border border-red p-2">
                        WARNING: Neural Sim DRAIN ACTIVE<br/>
                        -{traineesCount * 15} CR/t
                      </div>
                  )}

                  <div className="text-xs text-muted uppercase tracking-widest animate-pulse border border-muted-full p-10 px-20">
                    [ Click to re-establish neural link ]
                  </div>
                </div>,
                document.body
              )}

              {/* ── LAST STAND GLOBAL EVENT ── */}
              {lastStandNodeId && (() => {
                const nodeDef = AETHERIA_MAP[lastStandNodeId];
                const factionName = nodeDef?.faction && nodeDef.faction !== 'neutral' 
                  ? `${nodeDef.faction} SEC-OPS` 
                  : 'SYSTEM AI';
                
                return (
                  <div className="last-stand">
                    <div className="last-stand-content">
                      <div className="text-6xl text-red font-black tracking-mega mb-10">
                        :: CRITICAL BREACH ::
                      </div>
                      <div className="text-base text-white mb-20">
                        Node <span className="text-amber font-bold">{nodeDef?.label || lastStandNodeId}</span> is being overwritten by <span className="text-red font-bold">{factionName}</span>.
                      </div>
                      
                      <div className="text-8xl text-red font-black font-mono mb-30">
                        00:0{lastStandTimer}
                      </div>

                      <div className="text-sm text-amber mb-10">
                        &gt; PENALTY FOR FAILURE: NODE DELETION + 15 HEAT SPIKE
                      </div>

                      <button 
                        onClick={() => dispatchWithSound({ type: 'EXECUTE_LAST_STAND', hexId: lastStandNodeId })}
                        className="w-full py-16 bg-red text-black text-base font-black tracking-wider border-none cursor-pointer transition-transform active:scale-[0.98]"
                      >
                        [ INITIATE EMERGENCY OVERRIDE ]
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ── AWAKENING / PRESTIGE MODAL ── */}
              {state.prestigeModalOpen && createPortal(
                <div className="modal-root">
                  <div className="modal-content modal-content-red">
                    <div className="text-2xl text-red font-black mb-20 tracking-widest animate-pulse uppercase">
                      :: {(state.prestige || 0) === 0 ? 'INITIAL_AWAKENING' : 'SYSTEM_OVERRIDE'} ::
                    </div>
                    
                    <div className="text-md text-muted mb-30 leading-relaxed text-justify opacity-80">
                      {(state.prestige || 0) === 0 ? (
                        <>
                          "You've been living in a dream. This 'reality' is just a series of controlled variables. By proceeding, you will finally see the cracks in the sky."
                          <br/><br/>
                          <span className="text-cyan font-bold">"The cost is everything you have built. But knowledge is the only currency that survives the reset. Ready to wake up?" — Zero</span>
                        </>
                      ) : (
                        <>
                          "Back so soon? The loop continues. Every time you return, the veil gets thinner. All assets will be purged once again."
                          <br/><br/>
                          <span className="text-cyan font-bold">"You're becoming a ghost in their machine. Let's go one layer deeper." — Zero</span>
                        </>
                      )}
                    </div>
                    
                    <button 
                        onClick={() => {
                            dispatchWithSound({ type: 'PRESTIGE' }); // Tu už máš zvuk v dispatchWithSound cez 'prestige()'
                            dispatch({ type: 'HIDE_PRESTIGE_MODAL' });
                        }} 
                        className="btn btn-danger w-full mb-8 font-black tracking-widest text-center"
                    >
                        [ INITIATE {(state.prestige || 0) === 0 ? 'FIRST' : ''} AWAKENING ]
                    </button>
                    
                    <button 
                        onClick={() => {
                            audioManager.abort(); // ZVUK: Zrušenie
                            dispatch({ type: 'HIDE_PRESTIGE_MODAL' });
                        }} 
                        className="btn w-full font-bold text-center border-muted text-muted hover:text-white"
                    >
                        [ ABORT SEQUENCE ]
                    </button>
                  </div>
                </div>,
                document.body
              )}


          {/* ── NOVÝ INVENTORY ── */}
          {(!isMobile || mobileTab === 'DASH') && getUIVisibility(state).inventoryPanel && (
              <InventoryPanel state={state} dispatchWithSound={dispatchWithSound} />
            )}

          {/* ── RIGHT COL: INVENTORY ── 
          {(!isMobile || mobileTab === 'DASH') && (
            <div 
              className={cn("game-col-right", isMobile && "w-full h-auto overflow-visible p-8 border-t border-surface-high mt-8")} 
              style={!isMobile ? { width: '320px', height: '100%', overflowY: 'auto' } : {}}
            >
              <div className={!isMobile ? "bg-transparent" : ""}>
                
                {state.inventory.some(i => i.isQuantum) && (
                  <div className="text-md font-bold bg-transparent tracking-widest text-gold mt-10 mb-2 p-3 border border-gold text-center animate-pulse">
                    :: QUANTUM CORE DETECTED ::
                  </div>
                )}

                {/* HLAVIČKA INVENTORY - VŽDY VIDITEĽNÁ 
                <div className="flex items-center justify-between mb-12 border-b border-surface-high pb-4 pt-2">
                  <span className="text-sm font-bold text-amber tracking-widest uppercase">
                    :: INVENTORY <span className={invFull ? "text-red animate-pulse" : "text-muted"}>[{state.inventory.length}/{maxInventory}]</span>
                  </span>
                  
                  {/* SORT BUTTON - Vertikálne vycentrovaný 
                  {state.inventory.length > 0 && (
                    <button 
                      onClick={() => {
                        if (window.audioManager?.tab) window.audioManager.tab();
                        setInventorySort(m => {
                          const idx = SORT_MODES.indexOf(m);
                          return SORT_MODES[(idx + 1) % SORT_MODES.length];
                        });
                      }}
                      className="btn btn-xs"
                      style={{ margin: 0, width: 'auto', alignSelf: 'center' }} /* alignSelf pre istotu 
                    >
                      SORT: [{inventorySort}]
                    </button>
                  )}
                </div>

                {/* OBSAH INVENTORY - PRÁZDNA ALEBO PLNÁ 
                {state.inventory.length === 0 ? (
                  <div className="empty-state text-center py-20">
                    <div className="empty-state-ascii font-mono text-xs text-amber mb-6">
{`
  ┌──────────┐
  │  ░░░░░░  │
  │  ░ ○░ ░  │
  │  ░░░░░░  │
  └──────────┘
`}
                  </div>
                  <div className="text-xs tracking-widest opacity-80">:: AWAITING_EXTRACTION ::</div>
                  <div className="text-sm opacity-80 mt-4">Begin siphoning to acquire data.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sortedInventory.map(item => {
                    const actualGold = item.gold;
                    const isQuantum = item.isQuantum || item.id.includes('QUANTUM_');
                    
                    let rarityColor = 'var(--amber)';
                    
                    if (isQuantum || actualGold >= 500) {
                      rarityColor = 'var(--gold)';
                    } else if (actualGold >= 200) {
                      rarityColor = 'var(--gold)';
                    } else if (actualGold >= 100) {
                      rarityColor = 'var(--purple)';
                    } else if (actualGold >= 50) {
                      rarityColor = 'var(--cyan)';
                    } else if (actualGold >= 20) {
                      rarityColor = 'var(--cyan)';
                    } else {
                      rarityColor = 'var(--amber)';
                    }
                    
                    const hasMilitary = item.id.includes('MILITARY_');
                    const hasQuantumPrefix = item.id.includes('QUANTUM_');
                    const hasCorrupted = item.id.includes('CORRUPTED_');
                    
                    const baseItemId = item.id.replace(/^(MILITARY|QUANTUM|CORRUPTED)_/, '');
                    const coolPct = item.isHot && item.cooldown
                      ? Math.max(0, Math.min(100, (1 - item.cooldownRemaining / item.cooldown) * 100))
                      : 100;

                    return (
                      <div 
                        key={item.instanceId} 
                        className="bg-bg border p-8 relative overflow-hidden"
                        style={{ borderColor: rarityColor, borderLeftWidth: '4px' }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: rarityColor }}>
                              {item.id}
                            </span>
                            {hasMilitary && <span className="text-xs px-1 bg-green/20 text-green border border-green-full">MIL</span>}
                            {hasQuantumPrefix && <span className="text-xs px-1 bg-gold/20 text-gold border border-gold-full">QNT</span>}
                            {hasCorrupted && <span className="text-xs px-1 bg-red/20 text-red border border-red-full">CRPT</span>}
                          </div>
                          <Icon component={Cpu} size={11} color={item.isHot ? 'var(--orange)' : 'var(--green)'} style={{ marginTop: 2 }} />
                        </div>
                        
                        {ITEM_FLAVOR[baseItemId] && (
                          <div className="text-[9px] text-amber-muted mb-6 italic opacity-60">
                            "{ITEM_FLAVOR[baseItemId]}"
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-black text-amber">
                            {item.gold} <span className="text-sm opacity-80">CR</span>
                          </span>
                          <span className={cn("text-[10px] font-bold tracking-widest", item.isHot ? "text-orange animate-pulse" : "text-green opacity-70")}>
                            {item.isHot ? fmtCooldown(item.cooldownRemaining) : 'COLD'}
                          </span>
                        </div>
                        
                        {item.isHot && <Bar pct={coolPct} variant="ftg"/>}
                      </div>
                    );
                  })}
                </div>
              )} 

              */}
              {/* Heat critical vignette — subtle red screen edge glow */}
        {state.heat >= 80 && (
          <div className={`heat-vignette ${state.heat >= 95 ? 'critical' : ''}`} />
        )}

        {showBoot && <BootSequence onComplete={() => setShowBoot(false)} />}

        {state.zeroLastMessage
          && state.zeroLastMessage.level === 'critical'
          && !state.zeroLastMessage.seen
          && (
          <ZeroOverlay
            message={state.zeroLastMessage}
            onDismiss={() => dispatch({ type: 'DISMISS_ZERO_OVERLAY' })}
          />
        )}

        </div>
      </div>
    </div>
  );
}