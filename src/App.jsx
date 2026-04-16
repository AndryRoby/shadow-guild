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
  canCapture, captureHex, calculateMapModifiers, getInitialDiscovery, getMapDataForVis, getIntelUpgradeCost, severConnection,
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

// Helper pre CSS triedy
const cn = (...classes) => classes.filter(Boolean).join(' ');

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const FRESH_STATE = {
  gold:               100000,
  reputation:         10000,
  heat:               0,
  stamina:            100,
  level:              10,
  xp:                 0,
  prestige:           0,
  prestigeMultiplier: 1.0,
  totalGoldEarned:    100000,
  runGoldEarned:      100000000,
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
		case 'SET_PROTOCOL':      return setProtocol(state, action.protocol);
		case 'PURGE_LOGS':        return purgeLogs(state);
		case 'COUNTER_HACK':      return counterHack(state);
		
		case 'SET_RUNNER_SPEC': {
			const { runnerType, spec } = action;
			let promotedCount = 0;

			// Povýšime všetkých agentov daného typu, ktorí majú status PENDING
			const updatedAgents = (state.agents || []).map(a => {
				if (a.role === runnerType && a.spec === 'PENDING') {
					promotedCount++;
					return { ...a, spec: spec, xp: 0, level: a.level + 1 };
				}
				return a;
			});

			// Ak nikto nečakal na povýšenie, neurobíme nič
			if (promotedCount === 0) return state;

			const t = new Date().toLocaleTimeString('en-US', { hour12: false });
			return {
				...state,
				agents: updatedAgents,
				// Legacy properties update pre istotu
				runnerXp: { ...(state.runnerXp || {}), [runnerType]: 0 }, 
				runnerSpec: { ...(state.runnerSpec || {}), [runnerType]: spec },
				reputation: (state.reputation || 0) + (50 * promotedCount),
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
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
    
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
      const cost = Math.max(100, Math.floor(5000 * (agent.fatigue / 100)));
      if (state.gold < cost) return state;
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      return {
        ...state,
        gold: state.gold - cost,
        agents: state.agents.map(a => a.id === action.agentId ? { ...a, fatigue: 0, status: 'ACTIVE' } : a),
        log: [`[${t}] :: MEDICAL :: ${agent.name} fully recovered. -${cost} CR`, ...(state.log || [])].slice(0, 50)
      };
    }
		
		case 'RANSOM_AGENT': {
			if (state.gold < 15000) return state;
			return {
				...state,
				gold: state.gold - 15000,
				agents: state.agents.map(a => a.id === action.agentId ? { ...a, status: 'ACTIVE', fatigue: 50 } : a),
				log: [`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] :: NEGOTIATION :: Ransom paid. Operative returned from custody.`, ...(state.log || [])].slice(0, 50)
			};
		}

    case 'MAINTAIN_NODE': {
      const { hexId } = action;
      const cost = 15;
      const currentStab = state.nodeStability?.[hexId] ?? 100;
      
      // 🔥 PEKNÝ NÁZOV UZLA
      const nodeDef = AETHERIA_MAP[hexId];
      const nodeName = nodeDef ? nodeDef.label : hexId;
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      
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
        const t = new Date().toLocaleTimeString('en-US', { hour12: false });
        return {
          ...state,
          log: [`[${t}] :: OVERCLOCK_UNAVAILABLE :: System cooling down (${Math.ceil(state.overclockCooldown / 60)}m ${state.overclockCooldown % 60}s remaining).`, ...(state.log || [])].slice(0, 50)
        };
      }
      
      const newState = !state.overclockActive;
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      
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
			const t = new Date().toLocaleTimeString('en-US', { hour12: false });

			return {
				...state,
				reclaiming: newReclaiming,
				log: [`[${t}] :: OVERRIDE_SUCCESS :: Connection severed with intruder on ${nodeName}.`, ...(state.log || [])].slice(0, 50)
			};
		}

		case 'DEPLOY_RUNNER': {
			const { hexId, agentId } = action;
			const hex = AETHERIA_MAP[hexId];
			
			if (!hex) return state;
			
			// 1. Nájdi konkrétneho agenta
			const agent = (state.agents || []).find(a => a.id === agentId);
			if (!agent || agent.status !== 'ACTIVE') return state;
			
			// 2. SIGNAL CHANNELS LIMIT (Miesto Bandwidthu)
			const activeMissionsCount = (state.activeMissions || []).length;
			const maxMissions = 2 + Math.floor((state.level || 1) / 5); // Základ 2, rastie levelom
			
			if (activeMissionsCount >= maxMissions) {
				return {
					...state,
					log: [`[!] :: SIGNAL_LIMIT :: Max ${maxMissions} concurrent infiltrations allowed.`, ...(state.log || [])].slice(0, 50)
				};
			}
			
			// 3. NÁKLADY (Pôvodná logika: 2000 CR * ZoneMult)
			const zoneScales = { Z4: 1, Z7: 2, Z2: 3, Z3: 4, Z6: 6, Z1: 8, Z5: 15 };
      const zoneMult = zoneScales[hex.districtId] || 1;
      const opCost = Math.floor(2000 * zoneMult);
    
      if (state.gold < opCost) {
        return {
          ...state,
          log: [`[!] :: INSUFFICIENT_FUNDS :: Need ${opCost.toLocaleString()} CR to deploy`, ...(state.log || [])].slice(0, 50)
        };
      }
    
      // 4. VÝPOČET ČASU A ÚSPORNOSTI (Novinka: Fatigue Penalty)
      const speedMods = {
        streetRunner: 1.5, dataThief: 1.0, infiltrator: 0.5,
        fixer: 0.8, shadowBroker: 0.3
      };
    
      const baseTime = hex.captureTime || 45;
      
      // Novinka: Unavený agent je pomalší (1% únavy = +0.5% času)
      const fatiguePenalty = 1 + (agent.fatigue * 0.005);
      
      // Výpočet finálneho času: (Base * Zone * Speed * Fatigue) + Heat
      const finalSeconds = Math.round(
        (baseTime * zoneMult) * (speedMods[agent.role] || 1) * fatiguePenalty + (state.heat * 0.7)
      );
    
      const baseChance = 80;
      const heatPenalty = Math.floor(state.heat / 5);
      const successChance = Math.max(10, baseChance - heatPenalty);
    
      // 5. ZMENA STAVU: Odpočítanie peňazí, nastavenie agenta na ON_MISSION
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
            agentId, // Ukladáme ID agenta, nie len typ
            runnerType: agent.role,
            endTime: Date.now() + (finalSeconds * 1000),
            startTime: Date.now(),
            successChance,
            label: hex.label,
            opCost
          }
        ],
        // Heat spike pri nasadení (pôvodná logika)
        heat: Math.min(100, state.heat + Math.round(zoneMult * 2.5)),
        log: [
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] :: DEPLOYED ${agent.name} [${agent.role.toUpperCase()}] → ${hex.label} [-${opCost} CR | ${finalSeconds}s | ${successChance}%]`,
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

    case 'USER_ACTIVE': {
      // Ak sa prebúdza z Idle, zaznamenáme to
      if (state.isIdle || state.idlePromptActive) {
        const t = new Date().toLocaleTimeString('en-US', { hour12: false });
        return {
          ...state,
          lastInteractionTime: Date.now(),
          isIdle: false,
          idlePromptActive: false,
          log: state.isIdle 
            ? [`[${t}] :: SYSTEM WAKING UP :: ACTIVE MODE ENGAGED`, ...(state.log || [])].slice(0, 50) 
            : state.log
        };
      }
      return { ...state, lastInteractionTime: Date.now() };
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
              {value} {unit && <span className="text-[10px] opacity-50">{unit}</span>}
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

function Tab({ label, active, onClick }) {
  return (
      <button 
          onClick={onClick} 
          className={cn('tab', active && 'tab-active')}
      >
          {label}
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

function UpgradeRow({ def, level, gold, dispatch }) {
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
						{cost.toLocaleString()} <span className="text-xs opacity-50">CR</span>
					</span>
					<BuyBtn
						canAfford={canAfford}
						maxed={false}
						onClick={() => dispatch({ type: 'BUY_UPGRADE', key: def.key })}
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

function RunnerCard({ runnerType, label, count, gold, level, unlockLevel, requiresPrestige, prestige, baseCost, cycleSeconds, crPerRunner, heatPerRunner, agents = [], cycleTotal, dispatch, setSpecModal }) {
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
              locked && "opacity-50 grayscale"
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
                  <span>+{cycleTotal.toLocaleString()} <span className="text-xs opacity-50">CR</span></span>
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
                      {cost.toLocaleString()} <span className="text-xs opacity-50">CR</span>
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
                          onClick={() => dispatch({ type: 'HIRE_RUNNER', runnerType })} 
                      />
                  )}
              </div>
          </div>
      </div>
  );
}

// ── NETWORK INFILTRATION MANAGER ──
function NetworkManager({ state, dispatch }) {
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
              <div className="flex-between font-bold text-[10px] tracking-widest border-b border-current pb-2 mb-8" style={{ color: isOverloaded ? 'var(--red)' : 'var(--cyan)', borderColor: isOverloaded ? 'var(--red)' : 'var(--cyan)' }}>
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
                          className="text-[11px] font-bold tracking-widest mb-10 border-b-4 pb-4 uppercase"
                          style={{ color: district.color, borderColor: district.color }}
                      >
                          :: {district?.name || dId} 
                          <span className="ml-4 opacity-60 font-normal">{district?.desc}</span>
                          <span className="float-right text-[10px] opacity-80">[{districtCaptured}/{districtTotal}]</span>
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
                                  !isOwned && !activeMission && !canHack && 'opacity-50 grayscale'
                              )} style={{ 
                                  background: nodeStyle.bg, 
                                  borderLeftColor: nodeStyle.border 
                              }}>
                                  {/* NODE HEADER */}
                                  <div className="flex-between items-center mb-4">
                                      <span className={cn("font-bold text-md uppercase tracking-wider", `text-[${nodeStyle.text}]`)} style={{color: nodeStyle.text}}>
                                          <span className="mr-6 opacity-50">{node.icon}</span> 
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
                                                    onClick={() => dispatch({ type: 'MAINTAIN_NODE', hexId: node.id })}
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
                                                      onClick={() => dispatch({ type: 'SEVER_CONNECTION', hexId: node.id })} 
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
                                              onClick={() => state.reputation >= 25 && dispatch({ type: 'SECURE_NODE', hexId: node.id })}
                                              disabled={state.reputation < 25}
                                              className="btn btn-xs btn-danger w-full mt-8 font-black"
                                          >
                                              EXECUTE COUNTER-MEASURE (25 REP)
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
                                                      onClick={() => dispatch({ type: 'DEPLOY_RUNNER', hexId: node.id, agentId: bestAgent.id })}
                                                      className={cn(
                                                          "btn p-6 flex flex-col items-start text-left",
                                                          disabled ? 'btn-disabled opacity-50' : 'btn-amber'
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
          [ZERO &gt;&gt;] The city didn't stop while you were gone.
        </div>

        <button onClick={onDismiss} className="btn btn-amber w-full text-center">
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

  // ── KONTROLA PRE LAST STAND EVENT ──
	const lastStandEntry = Object.entries(state.reclaiming || {}).find(([id, r]) => r.stage === 'LAST_STAND');
	const lastStandNodeId = lastStandEntry?.[0];
	const lastStandTimer = lastStandEntry?.[1]?.timer;

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

  useEffect(() => {
    const loadedState = INITIAL_STATE; 
    const lastLogin = localStorage.getItem('shadow_guild_last_login');
    const today = new Date().toDateString();
  
    if (lastLogin !== today) {
      const bonus = 1000 * (loadedState.level || 1) * ((loadedState.prestige || 0) + 1);
      
      dispatch({ type: 'DAILY_BONUS', amount: bonus });
      
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      dispatch({ type: 'ADD_LOG', text: `[${t}] :: DAILY_CONNECTION_BONUS: +${bonus.toLocaleString()} CR` });
      
      localStorage.setItem('shadow_guild_last_login', today);
    }
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

  // ── ACTIVITY TRACKER (AFK DETECTION) ──
  useEffect(() => {
    let lastCall = 0;
    const handleActivity = () => {
      const now = Date.now();
      // Pošle signál o aktivite maximálne raz za 5 sekúnd
      if (now - lastCall > 5000) {
        lastCall = now;
        dispatch({ type: 'USER_ACTIVE' });
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [dispatch]);


  // Nájdi uzly s kritickou stabilitou (pod 30%)
  const criticalNodesCount = Object.entries(state.nodeStability || {})
  .filter(([hexId, stability]) => stability < 30 && hexId !== 'western_warpgate')
  .length;

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
    // Bezpečne získa reťazec z logu (či už je to string alebo objekt s textom)
    const getLogString = (entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && entry.text) return entry.text;
      return '';
    };
    
    const zeroCount = state.log.filter(e => getLogString(e).includes('[ZERO >>]')).length;
    if (zeroCount > prevZeroCount.current) {
      setLogGlitch(true);
      setTimeout(() => setLogGlitch(false), 600);
    }
    prevZeroCount.current = zeroCount;
  }, [state.log.length]); // eslint-disable-line react-hooks/exhaustive-deps // eslint-disable-line react-hooks/exhaustive-deps

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

  {/* ── PRIDAJ TÝCHTO PÁR RIADKOV PRED RETURN ── */}
  const usedBw = (state.capturedHexes?.length || 0) + (state.activeMissions?.length || 0);
  const overclockBonus = state.overclockActive ? 2 : 0;
  const maxBw = 1 + (state.intelUpgrades?.serverRacks || 0) + overclockBonus;
  const overload = Math.max(0, usedBw - maxBw);

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

  const SORT_MODES = ['TIME', 'VALUE', 'COLD'];
  const sortedInventory = [...state.inventory].sort((a, b) => {
    if (inventorySort === 'VALUE')    return b.gold - a.gold;
    if (inventorySort === 'COLD') {
      if (a.isHot !== b.isHot) return a.isHot ? 1 : -1;
      return a.cooldownRemaining - b.cooldownRemaining;
    }
    if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
    return a.cooldownRemaining - b.cooldownRemaining;
  });

  // ── POMOCNÍK PRE VÝPOČET PRESNÉHO ZISKU RUNNEROV ──
	const calculateCycleTotal = (runnerKey) => {
		const activeAgents = (state.agents || []).filter(a => a.role === runnerKey && a.status === 'ACTIVE');
		if (activeAgents.length === 0) return 0;

		const baseIncome = {
			streetRunner: 2,
			dataThief: 8,
			infiltrator: 35,
			fixer: 150,
			shadowBroker: 600
		}[runnerKey];

		const synergyMult = activeAgents.length >= 5 ? 1.2 : 1;
		const guildMult = state.prestigePerks?.GUILD_MASTER ? 1.25 : 1;
		const idleMult = state.isIdle ? 0.6 : 1.0;

		let total = 0;
		activeAgents.forEach(a => {
			const specMult = a.spec === 'GREEDY' ? 1.5 : 1;
			total += baseIncome * specMult * synergyMult * guildMult * idleMult;
		});
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

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div 
      className={`game-root ${heatGlitchClass} ${heatDangerClass}`.trim()}
      style={{ filter: heatFilter, ...dynamicThemeStyle }}
    >
    
    {/* ── SCANLINE OVERLAY (Refaktorované na CSS class) ── */}
        <div className="scanline" />

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
                      onClick={() => dispatch({ type: 'PURGE_LOGS' })}
                      className="btn btn-danger animate-raid text-center"
                      style={{ width: '100%' }}
                  >
                      [ PURGE_LOCAL_LOGS ]
                  </button>
                  
                  <button
                      onClick={() => dispatch({ type: 'COUNTER_HACK' })}
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
                      onClick={() => dispatch({ type: 'CLEAR_OFFLINE_REPORT' })} 
                      className="btn btn-amber"
                      style={{ border: 'none' }} // btn má border, tu chceme plný button
                  >
                      [ ACKNOWLEDGE ]
                  </button>
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
                          dispatch({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'SHADOW' });
                          setSpecModal(null); 
                      }}
                      className="btn btn-purple mb-4"
                  >
                      [ SHADOW_PROTOCOL ]<br/>
                      <span className="text-[10px] font-normal text-muted">[ HEAT_GEN -50% ]</span>
                  </button>
                  
                  <button
                      onClick={() => {
                          dispatch({ type: 'SET_RUNNER_SPEC', runnerType: specModal, spec: 'GREEDY' });
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
                          className={cn("overlay-float", sizeClass, colorClass, "font-bold tracking-wider")}
                          style={{
                              top: o.critical ? '30%' : '36%',
                              left: '74%',
                              animationDuration: o.critical ? '2s' : '1.5s',
                              textShadow: o.critical 
                                  ? '0 0 10px rgba(255,224,102,0.8)' 
                                  : o.type === 'BUSTED' 
                                      ? '0 0 10px rgba(239,68,68,0.8)' 
                                      : 'none'
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

      {/* ── HEADER ── */}
      <div className="game-header">
          <div className="flex items-center gap-4">
              <span className="header-title text-amber-dark">SHADOW_GUILD_V1.0.0</span>
              {DEV_MODE && (
                  <span className="badge badge-green text-[9px] border border-green">DEV</span>
              )}
              {(state.prestige ?? 0) > 0 && (
                  <span className="text-xs tracking-wider ml-4 text-orange border border-orange px-1" style={{ paddingTop: 1, paddingBottom: 1 }}>
                      ◆ PRESTIGE {state.prestige}
                  </span>
              )}
          </div>
          <div className="flex gap-8 items-center">
              {state.bustedLockout > 0 && (
                  <span className="text-red text-xs font-bold tracking-widest">
                      [BUSTED :: {state.bustedLockout}s]
                  </span>
              )}
              <span className="text-muted text-sm">OPERATIVE_01</span>
          </div>
      </div>

      {/* ── MOBILE TAB BAR ── */}
      {isMobile && (
        <div className="flex bg-surface-low border-b-2 border-surface-high sticky top-[44px] z-10">
          {[
            { id: 'DASH', label: 'DASH' }, 
            { id: 'OPS', label: 'OPS' }, 
            { id: 'AGENCY', label: isUnlocked(state, 'agency') ? 'AGN' : 'AGN [3]' },
            { id: 'UPGRADES', label: isUnlocked(state, 'upgrades_tab') ? 'UPG' : 'UPG [3]' }, 
            { id: 'NET', label: isUnlocked(state, 'district') ? 'NET' : 'NET [5]' }, 
            { id: 'SETTINGS', label: 'SYS' }
          ].map(t => {
            const isLocked = (t.id === 'AGENCY' && !isUnlocked(state, 'agency')) ||
                            (t.id === 'UPGRADES' && !isUnlocked(state, 'upgrades_tab')) ||
                            (t.id === 'NET' && !isUnlocked(state, 'district'));

            return (
              <button 
                key={t.id} 
                onClick={() => {
                  if (isLocked) return;
                  setMobileTab(t.id);
                  if (t.id !== 'DASH') {
                    const targetTab = t.id === 'OPS' ? 'OPERATIONS' : (t.id === 'NET' ? 'NETWORK' : t.id);
                    setActiveTab(targetTab);
                  }
                }}
                className={cn(
                  "tab", 
                  mobileTab === t.id && "tab-active",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                {t.label}
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
          {/* Hlavný Grid */}
          <div className={isMobile ? "game-grid-mobile" : "game-grid"}>

          {/* ── LEFT COL: DASHBOARD ── */}
          {(!isMobile || mobileTab === 'DASH') && (
            // Na mobile vypneme overflow-y-auto, nech to riadi parent vyššie
            <div className={cn("game-col", isMobile && "h-auto overflow-visible p-0 bg-transparent border-none")}>
                  
                  {/* ── SLEEK OPERATIVE HEADER ── */}
                  <div className="mb-20">
                      <div className="text-[10px] text-amber tracking-[0.4rem] font-extrabold text-center mb-6 opacity-80">
                          SYSTEM_ACCESS // ACTIVE
                      </div>
                      
                      <div className="card-bordered relative w-full h-[90px] flex items-center justify-center border-amber">
                          {/* Corner decorations */}
                          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber"></div>
                          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber"></div>
                          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber"></div>
                          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber"></div>
                          
                          <div className="text-center">
                              <div className="text-[9px] text-muted tracking-[0.2rem]">OPERATIVE_ID</div>
                              <div className="text-[32px] text-amber font-black leading-none">01</div>
                          </div>
                      </div>
                  </div>

                  {/* GLOBAL INTRUSION WARNING */}
                  {Object.keys(state.reclaiming || {}).length > 0 && (
                      <div className="intrusion-alert mb-6">
                          !!! SYSTEM INTRUSION DETECTED !!!
                      </div>
                  )}

                  {/* CRITICAL DECAY WARNING */}
                  {criticalNodesCount > 0 && (
                      <div className="warning-box mb-6">
                          [!] SIGNAL DEGRADATION: {criticalNodesCount} NODE(S) FAILING
                      </div>
                  )}

                  <span className="panel-header">:: OPERATIVE_STATUS</span>

                  {/* LEGACY STATS */}
                  {state.prestige > 0 && (
                      <div className="card-info mt-10 mb-10 p-6">
                          <div className="text-xs text-cyan tracking-[0.15rem] mb-4 font-bold">
                              :: LEGACY_DATA
                          </div>
                          <div className="stat-row">
                              <span className="stat-key">AWAKENING_LVL</span>
                              <span className="stat-val text-cyan">{state.prestige}</span>
                          </div>
                          <div className="stat-row">
                              <span className="stat-key">RUN_EARNED</span>
                              <span className="stat-val">{Math.floor(state.runGoldEarned || 0).toLocaleString()} CR</span>
                          </div>
                          <div className="stat-row">
                              <span className="stat-key">LIFETIME_CR</span>
                              <span className="stat-val">{Math.floor(state.totalGoldEarned || 0).toLocaleString()} CR</span>
                          </div>
                      </div>
                  )}

                  {/* OPERATIVE STATS */}
                  <div className="stat-row">
                      <span className="stat-key"><Icon component={Coins} />GOLD</span>
                      <span 
                          key={`g${goldPulseKey}`} 
                          className={cn("stat-val", goldPulseKey > 0 && "animate-gold")}
                      >
                          {state.gold.toLocaleString()} CR
                          {mods.goldMult > 1 && (
                              <span className="text-green text-xs ml-2 tracking-wide">
                                  [+{Math.round((mods.goldMult - 1) * 100)}%]
                              </span>
                          )}
                      </span>
                  </div>

                  {isUnlocked(state, 'rep') && (
                      <div className="stat-row">
                          <span className="stat-key"><Icon component={ShieldOff} />REP</span>
                          <span 
                              key={repPulseKey} 
                              className={cn("stat-val", repPulseKey > 0 && "animate-gold")}
                          >
                              {state.reputation.toLocaleString()}
                              {mods.repBoost > 0 && (
                                  <span className="text-green text-xs ml-2 tracking-wide">
                                      [+{Math.round(mods.repBoost * 100)}%]
                                  </span>
                              )}
                          </span>
                      </div>
                  )}

                  <div className="stat-row">
                      <span className="stat-key"><Icon component={Activity} />LEVEL</span>
                      <span className="stat-val">{state.level}</span>
                  </div>

                  {isUnlocked(state, 'xp') && (
                      <>
                          <div className="stat-row">
                              <span className="stat-key"><Icon component={TrendingUp} />XP</span>
                              <span className="stat-val">{state.xp.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
                          </div>
                          <Bar pct={xpPct} variant="xp" />
                      </>
                  )}

                  {isUnlocked(state, 'stamina') && (
                      <>
                          <div className="stat-row">
                              <span className="stat-key"><Icon component={Zap} />STAMINA</span>
                              <span className="stat-val">{state.stamina} / {effectiveMaxStamina}</span>
                          </div>
                          <Bar pct={staminaPct} variant="default" />
                      </>
                  )}

                  {isUnlocked(state, 'heat') && (
                      <>
                          <div className="stat-row">
                              <span className="stat-key"><Icon component={Flame} color={heatColor} />HEAT</span>
                              <span className="stat-val" style={{ color: heatColor }}>
                                  {heatRound}% [{heatStat}]
                                  {(state.heatSpikeTimer ?? 0) > 0 && <span className="ml-2 text-xs text-red">SPIKE [{state.heatSpikeTimer}s]</span>}
                              </span>
                          </div>
                          {/* Heat bar uses FTG gradient (Amber -> Red) */}
                          <Bar pct={heatRound} variant="ftg" />
                      </>
                  )}

                  {/* RUNNERS STATUS */}
                  {(state.agents || []).filter(a => a.status === 'ACTIVE').length > 0 && (
                      <div className="mt-6 pt-6 border-t border-surface-high">
                          {['streetRunner', 'dataThief', 'infiltrator', 'fixer', 'shadowBroker'].map(role => {
                              const activeAgents = (state.agents || []).filter(a => a.role === role && a.status === 'ACTIVE');
                              if (activeAgents.length === 0) return null;
                              
                              const roleLabels = { streetRunner: 'S_RUN', dataThief: 'D_THIEF', infiltrator: 'INF', fixer: 'FIX', shadowBroker: 'S_BRKR' };
                              const baseCycles = { streetRunner: DEV_MODE ? 5 : 30, dataThief: DEV_MODE ? 10 : 120, infiltrator: DEV_MODE ? 15 : 900, fixer: DEV_MODE ? 20 : 3600, shadowBroker: DEV_MODE ? 30 : 7200 };
                              
                              const hwLvl = state.upgrades?.hwOverclock ?? 0;
                              const hwSpeedMult = Math.pow(0.85, hwLvl);
                              const targetCycle = Math.max(1, Math.round(baseCycles[role] * hwSpeedMult));
                              
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

                  {/* PERSISTENT NETWORK STATS */}
                  <div className="bandwidth-panel">
                      <div className="text-md text-muted tracking-widest mb-4 border-b border-muted pb-2 font-extrabold">
                          :: GRID_STATUS
                      </div>
                      
                      <div className="flex flex-col gap-6">
                          {/* BANDWIDTH SECTION */}
                          <div className="pb-6 border-b border-amber/10">
                              <div className="flex-between text-sm mb-2">
                                  <span className="text-muted tracking-wide">BANDWIDTH_LOAD</span>
                                  <span className={cn("font-black", overload > 0 ? "text-red" : "text-amber")}>
                                      {usedBw} / {maxBw} Hz
                                  </span>
                              </div>
                              
                              {state.overclockActive && (
                                  <div className="mb-4">
                                      <span className="text-[10px] text-red font-bold animate-pulse">
                                          [OVERRIDE_ACTIVE]
                                      </span>
                                  </div>
                              )}
                              
                              <Bar 
                                    pct={(usedBw / maxBw) * 100} 
                                    // Ak je overload, pouzi gradient FTG (Amber -> Red), inak default Amber alebo Cyan podla stavu
                                    variant={overload > 0 ? "ftg" : "default"} 
                                    // Explicitna farba pre pripad, kedy nechceme variant
                                    color={state.overclockActive ? '#ff2244' : '#00d4ff'} 
                              />

                              {overload > 0 && (
                                  <div className="card-alert-reclaim mt-8 p-6 text-left">
                                      <div className="font-bold mb-2 text-xs">[!] CRITICAL_OVERLOAD: +{overload} Hz</div>
                                      <div>&gt; DECAY_MULTIPLIER: {100 + (overload * 300)}%</div>
                                      <div>&gt; HEAT_LEAK: +{overload * 0.8}/sec</div>
                                  </div>
                              )}
                          </div>

                          {/* OTHER STATS GRID */}
                          <div className="grid grid-3 gap-2">
                              <div>
                                  <div className="text-[10px] text-muted">REVENUE</div>
                                  <div className="text-sm text-green font-bold">+{Math.round((mods.goldMult - 1) * 100)}%</div>
                              </div>
                              <div>
                                  <div className="text-[10px] text-muted">XP_GAIN</div>
                                  <div className="text-sm text-cyan font-bold">+{Math.round((mods.xpBoost ?? 0) * 100)}%</div>
                              </div>
                              <div>
                                  <div className="text-[10px] text-muted">SIPHON</div>
                                  <div className="text-sm text-purple font-bold">+{Math.round(mods.siphonSuccessBonus ?? 0)}%</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* SYSTEM OVERRIDE PROTOCOL (OVERCLOCK) */}
                  <div className={cn(
                      "mt-10 mb-10 p-10 border transition-all",
                      state.overclockActive ? "overclock-active" : "overclock-inactive"
                  )}>
                      <div className={cn(
                          "text-md tracking-widest mb-6 font-bold",
                          state.overclockActive ? "text-red" : "text-muted"
                      )}>
                          :: OVERRIDE_PROTOCOL
                      </div>
                      
                      <div className="text-[10px] text-muted mb-12 leading-relaxed">
                          Force inject +2 temporary Bandwidth to bypass network limits.
                          <br/>
                          <span className="text-red font-bold">WARNING:</span> 
                          <br/>• HEAT_LEAK: +0.8/s per overload level
                          <br/>• DECAY_MULTIPLIER: +300% per overload level
                          <br/>• Use only for rapid tactical captures. Disable ASAP.
                      </div>

                      <button 
                        onClick={() => dispatch({ type: 'TOGGLE_OVERCLOCK' })}
                        disabled={state.overclockCooldown > 0 && !state.overclockActive}
                        className={cn(
                          "btn-override w-full py-2 text-xs font-black tracking-wider uppercase transition-all duration-300",
                          state.overclockActive && "btn-override-active",
                          (state.overclockCooldown > 0 && !state.overclockActive) && "btn-override-disabled"
                        )}
                      >
                        {state.overclockActive 
                          ? '[!] CANCEL OVERRIDE [!]' 
                          : state.overclockCooldown > 0 
                            ? `SYS_COOLING: ${Math.floor(state.overclockCooldown / 60)}m ${state.overclockCooldown % 60}s` 
                            : 'INITIATE OVERRIDE'
                        }
                      </button>
                  </div>

                  {/* OFFLINE WARNING */}
                  {state.isIdle && (
                      <div className="warning-box">
                          [ SYSTEM IDLE :: INCOME REDUCED TO 60% ]
                      </div>
                  )}

                  {/* RUNNER ECONOMY OVERVIEW */}
                  <div className="card-bordered mb-10">
                      <div className="text-md text-muted tracking-widest mb-6 border-b border-muted pb-4">
                          :: OPERATIVE_YIELD
                      </div>
                      <div className="flex-between">
                          <span className="text-xl text-amber">TOTAL ACTIVE:</span>
                          <span className="text-xl font-bold">{Object.values(state.runners || {}).reduce((a, b) => a + b, 0)}</span>
                      </div>
                      <div className="text-[10px] text-muted mt-6 leading-relaxed">
                          Active operatives generate passive CR based on their spec and current cycle time. Idle mode restricts total output.
                      </div>
                  </div>

                  {/* QUEUED SPECIALIZATIONS */}
                  {pendingSpecs.length > 0 && (
                      <div className="card-info mb-10">
                          <div className="text-xs text-cyan font-bold tracking-widest mb-6">
                              :: {pendingSpecs.length} OPERATIVE(S) AWAITING SPECIALIZATION ::
                          </div>
                          <div className="flex flex-wrap gap-4">
                              {pendingSpecs.map(runner => (
                                  <button 
                                      key={runner} 
                                      onClick={() => setSpecModal(runner)} 
                                      className="btn btn-cyan text-center"
                                      style={{ width: 'auto', margin: 0 }}
                                  >
                                      [ PROMOTE {runner.replace('Runner', '').toUpperCase()} ]
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  {isMobile && (
                    <div className="mt-20">
                      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-md text-muted tracking-widest uppercase">:: INVENTORY</span>
                          <span className={cn("text-md", invFull ? "text-red" : "text-muted")}>
                            {state.inventory.length}/{maxInventory}
                          </span>
                        </div>
                        {state.inventory.length > 0 && (
                          <button 
                            onClick={() => setInventorySort(m => {
                              const idx = SORT_MODES.indexOf(m);
                              return SORT_MODES[(idx + 1) % SORT_MODES.length];
                            })}
                            className="bg-transparent border border-muted-full text-amber px-2 py-1 text-xs tracking-wider"
                          >
                            SORT: [{inventorySort}]
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {sortedInventory.map(item => {
                          const rarityColor = item.isQuantum ? 'var(--gold)' 
                            : item.gold > 300 ? 'var(--gold)'
                            : item.gold > 100 ? 'var(--purple)'
                            : item.gold > 20 ? 'var(--cyan)'
                            : 'var(--amber)';
                          const baseItemId = item.id.replace(/^(MILITARY|QUANTUM|CORRUPTED)_/, '');
                          const coolPct = item.isHot && item.cooldown
                            ? Math.max(0, Math.min(100, (1 - item.cooldownRemaining / item.cooldown) * 100))
                            : 100;

                          return (
                            <div key={item.instanceId} className="bg-surface-low p-8">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold" style={{ color: rarityColor }}>
                                  {item.id}
                                </span>
                                <Icon component={Cpu} size={10} color={item.isHot ? 'var(--orange)' : 'var(--green)'} />
                              </div>
                              {ITEM_FLAVOR[baseItemId] && (
                                <div className="text-xs text-muted mb-4 leading-relaxed">
                                  {ITEM_FLAVOR[baseItemId]}
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted">{item.gold} CR</span>
                                <span className={cn("text-xs font-bold", item.isHot ? "text-orange" : "text-green")}>
                                  {item.isHot ? fmtCooldown(item.cooldownRemaining) : 'COLD'}
                                </span>
                              </div>
                              {item.isHot && (
                                <div className="w-full h-1 bg-bg mt-4">
                                  <div className="h-full bg-orange transition-all duration-1000" style={{ width: `${coolPct}%` }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
          )}

          
          {/* ── CENTER COL: TABS ── */}
          {(!isMobile || mobileTab === 'OPS' || mobileTab === 'AGENCY' || mobileTab === 'NET' || mobileTab === 'UPGRADES' || mobileTab === 'SETTINGS') && (
            <div className="game-col-center h-auto overflow-visible">
              
              {/* TABS HEADER */}
              {!isMobile && (
                <div className="flex gap-2 mb-14">
                  <Tab label="OPS" active={activeTab === 'OPERATIONS'} onClick={() => setActiveTab('OPERATIONS')} />
                  <Tab 
                    label={isUnlocked(state, 'agency') ? 'AGENCY' : 'AGN [LVL 3]'}
                    active={activeTab === 'AGENCY'} 
                    onClick={() => isUnlocked(state, 'agency') && setActiveTab('AGENCY')} 
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
                  <Tab label="SETTINGS" active={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')} />
                </div>
              )}

              {/* ── NETWORK TAB ── */}
              {activeTab === 'NETWORK' && isUnlocked(state, 'district') && (
                <div className="flex-1 min-h-0 flex flex-col">
                  <NetworkManager state={state} dispatch={dispatch} />
                </div>
              )}

              
            {/* ── 2. OPS TAB ── */}
            {activeTab === 'OPERATIONS' && (
              <div className="flex-1 flex flex-col overflow-y-auto gap-6 scroll-none">
                
                {/* ── SECTION 1: TARGET BRIEFING ── */}
                <div 
                  className="card-bordered relative overflow-hidden flex-shrink-0"
                  style={{ borderColor: AETHERIA_DISTRICTS[state.district]?.color || 'var(--muted)' }}
                >
                  {/* Dekoratívne pozadie */}
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

                  {/* District Buttons */}
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {[...new Set((state.capturedHexes || []).map(id => AETHERIA_MAP[id]?.districtId).filter(Boolean))].map(dId => (
                      <button
                        key={dId}
                        onClick={() => dispatch({ type: 'SET_DISTRICT', district: dId })}
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

                {/* ── SECTION 2: PROTOCOLS ── */}
                {isUnlocked(state, 'protocol') && (
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
                            onClick={() => dispatch({ type: 'SET_PROTOCOL', protocol: key })}
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
                        onClick={() => dispatch({ type: 'SET_PROTOCOL', protocol: 'NONE' })}
                        className="btn btn-danger w-full mt-4"
                      >
                        DEACTIVATE_PROTOCOL
                      </button>
                    )}
                  </div>
                )}

                {/* ── SECTION 3: COMBO + ACTIONS ── */}
                <div className="flex-shrink-0">
                  {/* Combo Meter */}
                  <div className={cn(
                    "combo-meter",
                    comboCount > 0 && "combo-meter-active",
                    comboHigh && "combo-meter-high"
                  )}>
                    {comboCount > 0 && (
                      <>
                        <span className={cn("text-sm font-bold tracking-widest", comboHigh ? "text-amber" : "text-muted")}>
                          COMBO x{comboCount}
                        </span>
                        <span className="text-sm text-muted">
                          [+{Math.round(comboPct * 100)}% VALUE]
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'SIPHON', label: `SIPHON_ [${siphonCost} STA]`, chance: siphonChance, disabled: isBlocked || state.stamina < siphonCost || invFull },
                      { id: 'BREACH', label: 'BREACH_ [25 STA]', chance: breachChance, disabled: isBlocked || state.stamina < 25 || invFull, cond: isUnlocked(state, 'breach') },
                      { id: 'DEEP_SIPHON', label: 'DEEP_SIPHON_ [15 STA]', chance: deepSiphonChance, disabled: isBlocked || state.stamina < 15 || invFull, cond: isUnlocked(state, 'deep_siphon') },
                      { id: 'MAINFRAME_HACK', label: 'MAINFRAME_HACK_ [40 STA]', chance: mainframeChance, disabled: isBlocked || state.stamina < 40 || invFull, cond: isUnlocked(state, 'mainframe') },
                      { id: 'LAY_LOW', label: `LAY_LOW_ ${state.layLowActive ? `[${state.layLowTimer}s]` : ''}`, disabled: state.bustedLockout > 0 || (state.layLowCooldown > 0 && !state.raidActive), active: state.layLowActive },
                      { id: 'SELL_COOLED_ITEMS', label: 'SELL_COOLED_ITEMS_', disabled: coldCount === 0, extra: coldCount > 0 ? <span className="text-green">[+{coldValue.toLocaleString()} CR]</span> : <span className="text-muted">[WAIT FOR COLD]</span> },
                      { id: 'MANUAL_COOL', label: 'COOL_DOWN_ [-15s · 5 STA]', disabled: hotItems.length === 0 || state.stamina < 5, cond: isUnlocked(state, 'manual_cool') },
                      { id: 'DARK_MARKET', label: 'DARK_MARKET_', disabled: dmDisabled, cond: isUnlocked(state, 'dark_market') },
                      { id: 'BARTER', label: 'BARTER_ [10x DATA_CHIP → +1 REP]', disabled: barterDisabled, cond: isUnlocked(state, 'barter') },
                    ].filter(btn => btn.cond !== false).map(btn => (
                      <ProtoBtn
                        key={btn.id}
                        onClick={() => dispatch({ type: btn.id })}
                        disabled={btn.disabled}
                        active={btn.active}
                        className="flex-[1_1_calc(50%-6px)] min-h-[38px] justify-center"
                      >
                        {btn.label}
                        {btn.chance !== null && btn.chance !== undefined && <span className="ml-2 opacity-60 text-xs">[{btn.chance}%]</span>}
                        {btn.extra}
                        
                        {/* DARK MARKET Specifics */}
                        {btn.id === 'DARK_MARKET' && !dmUnlocked && (
                          <span className="ml-2 text-red text-xs">[LOCKED: LVL 4 + 50 REP]</span>
                        )}
                        {btn.id === 'DARK_MARKET' && dmUnlocked && dmBusy && (
                          <span className="ml-2 text-muted text-xs">
                            [CD: {fmtDuration(state.darkMarketCooldown)}]
                            {(() => {
                              const mapMods = calculateMapModifiers(state);
                              const cdReduction = mapMods.darkMarketCd || 0;
                              const intelReduction = ((state.intelUpgrades?.darkExchange ?? 0) >= 1) ? 1800 : 0;
                              return (
                                <>
                                  {cdReduction < 0 && <span className="text-green ml-1">[{-cdReduction / 60}m NODE]</span>}
                                  {intelReduction > 0 && <span className="text-green ml-1">[-30m INTEL]</span>}
                                </>
                              );
                            })()}
                          </span>
                        )}
                        {btn.id === 'DARK_MARKET' && dmUnlocked && !dmBusy && state.inventory.length > 0 && (
                          <span className="ml-2 text-green text-xs">[+{Math.floor(state.inventory.reduce((sum, i) => sum + i.gold, 0) * 0.6).toLocaleString()} CR]</span>
                        )}
                        {btn.id === 'DARK_MARKET' && dmUnlocked && !dmBusy && state.inventory.length === 0 && (
                          <span className="ml-2 text-muted text-xs">[NO ITEMS]</span>
                        )}
                                                        
                        {btn.id === 'BARTER' && (state.barterCooldown ?? 0) > 0 && <span className="ml-2 text-muted text-xs">[CD]</span>}
                      </ProtoBtn>
                    ))}
                  </div>
                </div>

                {/* ── SECTION 4: SYSTEM LOGS ── */}
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

                  <div className="system-log-content">
                    {state.log.length === 0 ? (
                      <div className="text-center py-10 opacity-30 text-xs">
                        ... AWAITING_PROTOCOL ...
                      </div>
                    ) : (
                      state.log.map((entry, i) => {
                        const upper = entry.toUpperCase();
                        let colorClass = 'text-muted';
                        if (upper.includes('[BUSTED]') || upper.includes('RAID') || upper.includes('SEIZED') || upper.includes('LOSE')) colorClass = 'text-red';
                        else if (upper.includes('WARNING') || upper.includes('BOUNTY') || upper.includes('ABORTED')) colorClass = 'text-orange';
                        else if (upper.includes('SUCCESS') || upper.includes('CAPTURED') || upper.includes('SOLD') || upper.includes('RESTORED') || upper.includes('CLEARED')) colorClass = 'text-green';
                        else if (upper.includes('LEVEL UP') || upper.includes('PROTOCOL') || upper.includes('RECOVERED')) colorClass = 'text-cyan';
                        else if (entry.includes('[ZERO >>]')) colorClass = 'text-green'; // Special case

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
            )}

            {/* ── AGENCY TAB ── */}
            {activeTab === 'AGENCY' && isUnlocked(state, 'agency') && (() => {
              
              const getHealCost = (fatigue) => Math.max(100, Math.floor(5000 * ((fatigue || 0) / 100)));

              // AgentCard Component
              const AgentCard = ({ agent }) => {
                const isPending = agent.spec === 'PENDING';
                const isTraining = agent.status === 'TRAINING';
                const isActive = agent.status === 'ACTIVE';
                const isTired = agent.fatigue > 0;
                const healCost = getHealCost(agent.fatigue);
                const xpNeeded = (agent.level || 1) * 1000;
                const xpPercent = ((agent.xp || 0) / xpNeeded) * 100;
                
                // Status color mapping
                let statusColorClass = 'text-muted';
                if (isActive) statusColorClass = 'text-green';
                else if (isTraining) statusColorClass = 'text-purple';
                else if (agent.status === 'ON_MISSION') statusColorClass = 'text-cyan';
                else if (agent.status === 'EXHAUSTED' || agent.status === 'INJURED') statusColorClass = 'text-red';

                return (
                  <div className="card agent-card p-12">
                    {/* Header */}
                    <div className="flex-between items-start mb-12">
                      <div className="overflow-hidden pr-8">
                        <div 
                          className={cn("text-lg font-bold", isPending ? "text-muted" : "text-white")}
                          style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                        >
                          {agent.name}
                        </div>
                        <div className={cn("text-sm font-bold mt-2", statusColorClass)}>
                          [{agent.status}]
                        </div>
                      </div>
                      <div className="badge badge-amber font-bold flex-shrink-0">LVL {agent.level || 1}</div>
                    </div>

                          {/* Bars - používame jednotný Bar komponent */}
                          <div className="mb-8">
                            {/* FTG Bar */}
                            <div className="mb-6">
                              <div className="flex-between text-xs mb-2">
                                <span className={agent.fatigue > 70 ? 'text-red font-bold' : 'text-muted'}>FTG</span>
                                <span className={agent.fatigue > 70 ? 'text-red' : 'text-muted'}>{agent.fatigue || 0} / 100</span>
                              </div>
                              <Bar pct={agent.fatigue || 0} variant={agent.fatigue > 70 ? "ftg" : "default"}/>
                            </div>
                            
                            {/* XP Bar */}
                            <div className="mb-6">
                              <div className="flex-between text-xs mb-2">
                                <span className="text-muted">XP</span>
                                <span className="text-muted">{agent.xp || 0} / {xpNeeded}</span>
                              </div>
                              <Bar pct={xpPercent} variant="xp"/>
                            </div>
                          </div>

                    {/* Actions */}
                    {!isPending && (
                      <div className="flex gap-6 mt-12 pt-12" style={{ borderTop: '1px solid var(--surface-low)' }}>
                        {isTired && agent.status !== 'ON_MISSION' && (
                          <button 
                            onClick={() => dispatch({ type: 'HEAL_AGENT', agentId: agent.id })}
                            disabled={state.gold < healCost}
                            className={cn("btn btn-xs flex-1 text-center", state.gold >= healCost ? "btn-danger" : "btn-disabled")}
                            style={{ margin: 0 }}
                          >
                            HEAL ({healCost} CR)
                          </button>
                        )}
                        {isActive && !isTired && (
                          <button 
                            onClick={() => dispatch({ type: 'ASSIGN_TRAINING', agentId: agent.id })}
                            className="btn btn-xs btn-purple flex-1 text-center"
                            style={{ margin: 0 }}
                          >
                            TRAIN
                          </button>
                        )}
                        {isTraining && (
                          <button 
                            onClick={() => dispatch({ type: 'STOP_TRAINING', agentId: agent.id })}
                            className="btn btn-xs btn-danger flex-1 text-center"
                            style={{ margin: 0 }}
                          >
                            HALT
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              const traineesCount = state.agents?.filter(a => a.status === 'TRAINING').length || 0;

              return (
                <div className="flex-1 p-16 overflow-y-auto scroll-none">
                  
                  {/* HEADER & NEURAL SIM DASHBOARD */}
                  <div className="flex flex-wrap justify-between items-end gap-16 mb-24 pb-16 border-muted">
                    <div>
                      <div className="text-3xl font-bold text-amber tracking-widest">SYNDICATE_ROSTER</div>
                      <div className="text-md text-muted mt-4">Manage recruitment, training, and recovery.</div>
                    </div>

                    {/* NEURAL SIM BANNER */}
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
                        <div className={cn("text-md font-bold", traineesCount > 0 ? "text-red" : "text-muted")}>-{traineesCount * 15} CR/t</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RECRUITMENT TERMINAL */}
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
                            onClick={() => dispatch({ type: 'HIRE_RUNNER', runnerType: runner.id })} 
                            className={cn(
                              "flex flex-col gap-6 p-12 text-left transition-all card", 
                              isLocked ? "opacity-50" : canAfford ? "cursor-pointer hover:bg-surface-high" : "cursor-not-allowed"
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

                  {/* ROSTER */}
                  {(state.agents || []).length === 0 ? (
                    <div className="p-32 text-center text-muted card border-dashed">No operatives found. Access the Recruitment Network above.</div>
                  ) : (
                    <div className="flex flex-col gap-24">
                      {['streetRunner', 'dataThief', 'infiltrator', 'fixer'].map(roleType => {
                        const roleAgents = state.agents.filter(a => a.role === roleType);
                        if (roleAgents.length === 0) return null;
                        return (
                          <div key={roleType}>
                            <div className="text-sm text-muted tracking-widest uppercase mb-12">[ {roleType}s ]</div>
                            <div className="grid grid-auto gap-12">
                              {roleAgents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── UPGRADES TAB ── */}
            {activeTab === 'UPGRADES' && (
              <div className="flex-1 min-h-0 overflow-y-auto scroll-none">
                
                {/* CREDIT UPGRADES (Gold) */}
                <div className="border-b border-amber mb-12">
                  <span className="panel-header text-amber tracking-widest uppercase">
                    :: OPERATIVE_UPGRADES [CR]
                  </span>
                </div>
                
                {UPGRADE_DEFS.map(def => (
                  <UpgradeRow 
                    key={def.key} 
                    def={def} 
                    level={state.upgrades[def.key] ?? 0} 
                    gold={state.gold} 
                    dispatch={dispatch} 
                  />
                ))}

                {/* INTEL UPGRADES (Purple) */}
                {isUnlocked(state, 'intel') && (
                  <>
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
                          {/* Ľavá strana: Názov a Popis */}
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

                          {/* Pravá strana: Cena a Tlačidlo */}
                          {!maxed && (
                            <div className="flex items-center gap-12">
                              <span className={cn('font-black text-lg', canAfford ? 'text-purple' : 'text-red')}>
                                {dynamicCost.toLocaleString()} <span className="text-xs opacity-50">REP</span>
                              </span>
                              <BuyBtn
                                canAfford={canAfford}
                                maxed={false}
                                label="ACQUIRE"
                                onClick={() => dispatch({ type: 'BUY_INTEL_UPGRADE', key: def.key })}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* HIRED RUNNERS (Green) */}
                {isUnlocked(state, 'runners') && (
                  <>
                    <div className="border-b border-green mt-10 mb-6">
                      <span className="panel-header text-green tracking-widest uppercase">
                        :: HIRED_RUNNERS [ASSETS]
                      </span>
                    </div>

                    <RunnerCard runnerType="streetRunner" label="STREET_RUNNER"
                      count={(state.agents || []).filter(a => a.role === 'streetRunner').length} 
                      agents={(state.agents || []).filter(a => a.role === 'streetRunner')}
                      gold={state.gold} level={state.level} unlockLevel={3} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={300} cycleSeconds={srCycle} crPerRunner={2} heatPerRunner={1}
                      cycleTotal={calculateCycleTotal('streetRunner')} dispatch={dispatch} setSpecModal={setSpecModal} />

                    <RunnerCard runnerType="dataThief" label="DATA_THIEF"
                      count={(state.agents || []).filter(a => a.role === 'dataThief').length} 
                      agents={(state.agents || []).filter(a => a.role === 'dataThief')}
                      gold={state.gold} level={state.level} unlockLevel={5} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={800} cycleSeconds={dtCycle} crPerRunner={8} heatPerRunner={2}
                      cycleTotal={calculateCycleTotal('dataThief')} dispatch={dispatch} setSpecModal={setSpecModal} />

                    <RunnerCard runnerType="infiltrator" label="INFILTRATOR"
                      count={(state.agents || []).filter(a => a.role === 'infiltrator').length} 
                      agents={(state.agents || []).filter(a => a.role === 'infiltrator')}
                      gold={state.gold} level={state.level} unlockLevel={7} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={2500} cycleSeconds={ifCycle} crPerRunner={35} heatPerRunner={3}
                      cycleTotal={calculateCycleTotal('infiltrator')} dispatch={dispatch} setSpecModal={setSpecModal} />

                    <RunnerCard runnerType="fixer" label="FIXER"
                      count={(state.agents || []).filter(a => a.role === 'fixer').length} 
                      agents={(state.agents || []).filter(a => a.role === 'fixer')}
                      gold={state.gold} level={state.level} unlockLevel={9} requiresPrestige={0} prestige={state.prestige ?? 0}
                      baseCost={8000} cycleSeconds={fxCycle} crPerRunner={150} heatPerRunner={1}
                      cycleTotal={calculateCycleTotal('fixer')} dispatch={dispatch} setSpecModal={setSpecModal} />

                    <RunnerCard runnerType="shadowBroker" label="SHADOW_BROKER"
                      count={(state.agents || []).filter(a => a.role === 'shadowBroker').length} 
                      agents={(state.agents || []).filter(a => a.role === 'shadowBroker')}
                      gold={state.gold} level={state.level} unlockLevel={1} requiresPrestige={1} prestige={state.prestige ?? 0}
                      baseCost={25000} cycleSeconds={sbCycle} crPerRunner={600} heatPerRunner={0}
                      cycleTotal={calculateCycleTotal('shadowBroker')} dispatch={dispatch} setSpecModal={setSpecModal} />
                  </>
                )}
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'SETTINGS' && (
              <div className="flex-1 min-h-0 overflow-y-auto scroll-none">

                {/* ACHIEVEMENTS */}
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

                {/* PRESTIGE PERK TREE */}
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
                                    onClick={() => canBuy && dispatch({ type: 'BUY_PRESTIGE_PERK', perkId: def.id })}
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

                {/* PRESTIGE CARD IN SETTINGS */}
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
                  
                  <div className="bg-surface-low p-8 mb-8 border border-surface-high text-md font-mono">
                    <div className="flex-between mb-4">
                      <span className="text-amber">Level Status:</span>
                      <span className={state.level >= 10 ? 'text-green' : 'text-amber'}>{state.level}/10</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-amber">Run Yield:</span>
                      <span className={runGoldEarned >= 100000 ? 'text-green' : 'text-amber'}>
                        {runGoldEarned.toLocaleString()} / 100k CR
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!canPrestige}
                    onClick={() => dispatch({ type: 'SHOW_PRESTIGE_MODAL' })}
                    className={cn('btn w-full font-black text-center', canPrestige ? 'btn-amber animate-pulse' : 'btn-disabled')}
                    style={canPrestige ? { borderColor: 'var(--yellow)', color: 'var(--yellow)' } : {}}
                  >
                    {canPrestige 
                      ? `PRESTIGE → RUN #${(state.prestige ?? 0) + 1} [x${(1 + ((state.prestige ?? 0) + 1) * 0.25).toFixed(2)}]` 
                      : 'PRESTIGE [LOCKED]'}
                  </button>
                </div>

                {/* SAVE */}
                <span className="panel-header mt-14 mb-8">SAVE_SYSTEM</span>

                {/* Export */}
                <div className="card">
                  <div className="text-sm font-bold mb-6">EXPORT_SAVE</div>
                  <button
                    onClick={() => {
                      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* quota */ }
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

                {/* Import */}
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

                {/* Hard reset */}
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
                          localStorage.removeItem(SAVE_KEY);
                          dispatch({ type: 'HARD_RESET' });
                          setResetConfirm(false);
                          setExportString('');
                        }} 
                        className="btn btn-danger flex-1 text-center"
                        style={{ background: 'var(--red)', color: '#fff' }}
                      >
                        CONFIRM
                      </button>
                      <button onClick={() => setResetConfirm(false)} className="btn flex-1 text-center">
                        CANCEL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* ── RIGHT COL: INVENTORY ── */}
          {(!isMobile && mobileTab === 'DASH') && (
            <div className="game-col-right" style={{ width: '320px', height: '100%', overflowY: 'auto' }}>
                <div className="bg p-16">
                    
                    {state.inventory.some(i => i.isQuantum) && (
                        <div className="text-sm font-bold bg-surface-low tracking-widest text-gold mb-10 p-6 bg-gold/10 border-l-4 border-r-4 border-gold text-center animate-gold">
                            :: QUANTUM CORE DETECTED ::
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-md text-amber tracking-widest uppercase">:: INVENTORY</span>
                            <span className={cn("text-md", invFull ? "text-red" : "text-amber-dark")}>
                                {state.inventory.length}/{maxInventory}
                            </span>
                        </div>
                        
                        {state.inventory.length > 0 && (
                            <button 
                                onClick={() => setInventorySort(m => {
                                    const idx = SORT_MODES.indexOf(m);
                                    return SORT_MODES[(idx + 1) % SORT_MODES.length];
                                })}
                                className="bg-surface-high border text-amber px-2 py-1 text-xs tracking-wider hover:border-amber hover:text-amber"
                            >
                                SORT: [{inventorySort}]
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {sortedInventory.map(item => {
                            const rarityColor = item.isQuantum ? 'var(--gold)' 
                                : item.gold > 300 ? 'var(--gold)'
                                : item.gold > 100 ? 'var(--purple)'
                                : item.gold > 20 ? 'var(--cyan)'
                                : 'var(--amber)';
                            
                            const baseItemId = item.id.replace(/^(MILITARY|QUANTUM|CORRUPTED)_/, '');
                            const coolPct = item.isHot && item.cooldown
                                ? Math.max(0, Math.min(100, (1 - item.cooldownRemaining / item.cooldown) * 100))
                                : 100;

                            return (
                                <div key={item.instanceId} className="bg-surface-high p-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold" style={{ color: rarityColor }}>
                                            {item.id}
                                        </span>
                                        <Icon component={Cpu} size={10} color={item.isHot ? 'var(--orange)' : 'var(--green)'} />
                                    </div>
                                    
                                    {ITEM_FLAVOR[baseItemId] && (
                                        <div className="text-xs text-muted mb-4 leading-relaxed">
                                            {ITEM_FLAVOR[baseItemId]}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-amber">{item.gold} CR</span>
                                        <span className={cn("text-xs font-bold", item.isHot ? "text-orange" : "text-green")}>
                                            {item.isHot ? fmtCooldown(item.cooldownRemaining) : 'COLD'}
                                        </span>
                                    </div>
                                    
                                    {item.isHot ? (
                                      <Bar pct={coolPct} variant="ftg"/>
                                    ) : (
                                      // Voliteľné: Ak chceš vidieť prázdny bar aj pre cold items
                                      // <Bar pct={0} thin />
                                      null // Ak nechceš žiaden bar pre cold items
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
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>FUNDS_EXTRACTED</div>
                        <div style={{ fontSize: 16, color: '#ffc174', fontWeight: 700 }}>+{state.missionSplash.gold.toLocaleString()} CR</div>
                      </div>
                      <div style={{ background: 'var(--surface-high)', padding: '10px', border: '1px solid #22c55e' }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>EXP_GAINED</div>
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

              {/* ── AFK PROMPT (Si tu?) ── */}
              {state.idlePromptActive && createPortal(
                <div className="idle-prompt">
                  <div className="modal-content modal-content-red text-center">
                    <div className="text-base text-red font-bold tracking-widest mb-10">
                      :: INACTIVITY DETECTED ::
                    </div>
                    <div className="text-md text-muted mb-20 leading-relaxed">
                      No operator input registered. <br/>
                      Entering Power-Saving Mode in <span className="text-red font-bold">
                        {Math.max(0, Math.round(((state.idlePromptTimestamp + (DEV_MODE ? 10000 : 60000)) - Date.now()) / 1000))}s
                      </span>.<br/>
                      Hostile operations will be paused. Output reduced to 60%.
                    </div>
                    <button 
                      onClick={() => dispatch({ type: 'USER_ACTIVE' })} 
                      className="btn btn-danger-center w-full text-center"
                    >
                      [ OVERRIDE: I AM HERE ]
                    </button>
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
                        onClick={() => dispatch({ type: 'EXECUTE_LAST_STAND', hexId: lastStandNodeId })}
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
                        dispatch({ type: 'PRESTIGE' });
                        dispatch({ type: 'HIDE_PRESTIGE_MODAL' });
                      }} 
                      className="btn btn-danger w-full mb-8 font-black tracking-widest text-center"
                    >
                      [ INITIATE {(state.prestige || 0) === 0 ? 'FIRST' : ''} AWAKENING ]
                    </button>
                    
                    <button 
                      onClick={() => dispatch({ type: 'HIDE_PRESTIGE_MODAL' })} 
                      className="btn w-full font-bold text-center border-muted text-muted hover:text-white"
                    >
                      [ ABORT SEQUENCE ]
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