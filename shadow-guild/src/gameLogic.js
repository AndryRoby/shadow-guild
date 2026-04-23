// SHADOW_GUILD — Game Logic
// Pure functions only. No React imports.
// CITY_MAP, zone definitions, and EFFECTS are imported from CITY_MAP.js.

import { CITY_MAP as AETHERIA_MAP, DISTRICTS as AETHERIA_DISTRICTS } from '../CITY_MAP.js';

// ── DEV MODE ─────────────────────────────────────────────────────────────────
export const DEV_MODE = false;

const DARK_MARKET_CD  = DEV_MODE ? 30  : 7200;
const RUNNER_SR_CYCLE = DEV_MODE ? 5   : 30;
const RUNNER_DT_CYCLE = DEV_MODE ? 10  : 120;
const RUNNER_IF_CYCLE = DEV_MODE ? 15  : 900;
const RUNNER_FX_CYCLE = DEV_MODE ? 20  : 3600;
const RUNNER_SB_CYCLE = DEV_MODE ? 30  : 7200;

const SCAN_INTERVAL_MIN = DEV_MODE ? 30  : 900;   // 15 min
const SCAN_INTERVAL_MAX = DEV_MODE ? 60  : 1800;  // 30 min
const SCAN_DURATION     = DEV_MODE ? 10  : 15;

// ── LOOT TABLES ──────────────────────────────────────────────────────────────

export const STANDARD_LOOT = [
  { id: 'DATA_CHIP',          gold: 5,   xp: 8,   weight: 40,  cooldown: 45   }, // Bolo 180
  { id: 'CREDIT_CHIP',        gold: 12,  xp: 15,  weight: 28,  cooldown: 90   }, // Bolo 180
  { id: 'ACCESS_CARD',        gold: 28,  xp: 25,  weight: 16,  cooldown: 180  }, // Bolo 300
  { id: 'ENCRYPTED_DRIVE',    gold: 50,  xp: 40,  weight: 10,  cooldown: 300  },
  { id: 'BIOMETRIC_KEY',      gold: 95,  xp: 70,  weight: 4,   cooldown: 600  },
  { id: 'CORP_BADGE',         gold: 180, xp: 110, weight: 1.5, cooldown: 900  },
  { id: 'NEURAL_TOKEN',       gold: 350, xp: 180, weight: 0.5, cooldown: 1800 },
];

export const PREMIUM_LOOT = [
  { id: 'SECURE_TERMINAL',    gold: 80,  xp: 60,  weight: 40, cooldown: 300 },
  { id: 'CLASSIFIED_DOSSIER', gold: 150, xp: 100, weight: 35, cooldown: 480 },
  { id: 'CORP_BLUEPRINT',     gold: 280, xp: 160, weight: 15, cooldown: 600 },
  { id: 'EXECUTIVE_KEYCARD',  gold: 500, xp: 250, weight: 10, cooldown: 900 },
];

const DEEP_SIPHON_LOOT = [
  { id: 'ACCESS_CARD',     gold: 28,  xp: 25,  weight: 35, cooldown: 300  },
  { id: 'ENCRYPTED_DRIVE', gold: 50,  xp: 40,  weight: 30, cooldown: 300  },
  { id: 'BIOMETRIC_KEY',   gold: 95,  xp: 70,  weight: 20, cooldown: 600  },
  { id: 'CORP_BADGE',      gold: 180, xp: 110, weight: 10, cooldown: 900  },
  { id: 'NEURAL_TOKEN',    gold: 350, xp: 180, weight: 5,  cooldown: 1800 },
];

export const VAULT_LOOT = [
  { id: 'CRYPTO_WALLET',                    gold: 400,  xp: 200, weight: 40, cooldown: 900  },
  { id: 'CORP_RESERVE',                     gold: 800,  xp: 350, weight: 35, cooldown: 1800 },
  { id: 'MASTER_ACCESS_CODE',               gold: 1500, xp: 600, weight: 25, cooldown: 3600 },
  { id: 'ENCRYPTED_BIOWEAPON_SCHEMATICS',   gold: 800,  xp: 350, weight: 5,  cooldown: 1800 },
  { id: 'CEO_NEURAL_BACKUP',                gold: 1200, xp: 500, weight: 3,  cooldown: 2400 },
  { id: 'AETHER_BIOTECH_MASTER_KEY',        gold: 1500, xp: 600, weight: 2,  cooldown: 3000 },
  { id: 'THE_EYE_SOURCE_CODE',              gold: 2000, xp: 800, weight: 1,  cooldown: 3600 },
];

export const ITEM_FLAVOR = {
	DATA_CHIP:                      'Encrypted medical records. Untraceable.',
	CREDIT_CHIP:                    'Anonymous funds. No origin data.',
	ACCESS_CARD:                    'Low-tier clearance. Still opens doors.',
	ENCRYPTED_DRIVE:                "Corporate R&D. Someone's looking for this.",
	BIOMETRIC_KEY:                  'Unlocks more than locks.',
	CORP_BADGE:                     'Identity is a vulnerability.',
	NEURAL_TOKEN:                   'The mind is the last firewall.',
	SECURE_TERMINAL:                'Direct line to the corp intranet.',
	CLASSIFIED_DOSSIER:             'Names. Locations. Leverage.',
	CORP_BLUEPRINT:                 'They never meant for this to leave the vault.',
	EXECUTIVE_KEYCARD:              'C-suite access. One door from everything.',
	CRYPTO_WALLET:                  'Cold storage. No transaction history.',
	CORP_RESERVE:                   'Reserve funds. Never supposed to exist.',
	MASTER_ACCESS_CODE:             'Root override. Use once.',
	ENCRYPTED_BIOWEAPON_SCHEMATICS: "Aether-Biotech's deniable research.",
	CEO_NEURAL_BACKUP:              'A mind in a file. Dangerous.',
	AETHER_BIOTECH_MASTER_KEY:      'One key. Every door.',
	THE_EYE_SOURCE_CODE:            'This is what they use to watch you.',
};

// ── LOOT PREFIXES (20% drop chance) ──────────────────────────────────────────

const LOOT_PREFIXES = [
	{ id: 'MILITARY',  creditMult: 1.5, heatMult: 1.25, xpMult: 1.0, cooldownMult: 1.0 },
	{ id: 'QUANTUM',   creditMult: 2.0, heatMult: 1.0,  xpMult: 1.5, cooldownMult: 2.0 },
	{ id: 'CORRUPTED', creditMult: 0.8, heatMult: 1.0,  xpMult: 1.0, cooldownMult: 0.8 },
];

// ── OPERATION PROTOCOLS ───────────────────────────────────────────────────────

export const PROTOCOL_DEFS = {
	NIGHT_STALKER: {
		label: 'NIGHT_STALKER',
		desc:  '+50% Credits · 2.0x Heat',
		creditMult:       1.5,
		heatMult:         2.0,
		xpMult:           1.0,
		staminaRegenMult: 1.0,
		successRateMod:   0,
		color:            '#ef4444',
	},
	GHOST_CODE: {
		label: 'GHOST_CODE',
		desc:  '-30% Heat · 0.5x XP',
		creditMult:       1.0,
		heatMult:         0.7,
		xpMult:           0.5,
		staminaRegenMult: 1.0,
		successRateMod:   0,
		color:            '#22c55e',
	},
	SILENT_RUN: {
		label: 'SILENT_RUN',
		desc:  '+25% STA Regen · -20% Success',
		creditMult:       1.0,
		heatMult:         1.0,
		xpMult:           1.0,
		staminaRegenMult: 1.25,
		successRateMod:   -0.20,
		color:            '#00d4ff',
	},
};

// IDs that trigger a heat spike (tier 3+ loot)
const HIGH_VALUE_IDS = new Set([
  'BIOMETRIC_KEY', 'CORP_BADGE', 'NEURAL_TOKEN',
  'SECURE_TERMINAL', 'CLASSIFIED_DOSSIER', 'CORP_BLUEPRINT', 'EXECUTIVE_KEYCARD',
  'CRYPTO_WALLET', 'CORP_RESERVE', 'MASTER_ACCESS_CODE',
  'ENCRYPTED_BIOWEAPON_SCHEMATICS', 'CEO_NEURAL_BACKUP', 'AETHER_BIOTECH_MASTER_KEY', 'THE_EYE_SOURCE_CODE',
]);

export const CHALLENGE_DEFS = [
  { type: 'SIPHON_COUNT', desc: 'Execute 20 successful siphons',       target: 20,   reward: { rep: 50, gold: 0   } },
  { type: 'BREACH_COUNT', desc: 'Complete 10 breaches',                target: 10,   reward: { rep: 30, gold: 500 } },
  { type: 'SELL_VALUE',   desc: 'Sell items worth 1000 CR total',      target: 1000, reward: { rep: 40, gold: 0   } },
  { type: 'SURVIVE_HEAT', desc: 'Reach heat 80 without getting busted',target: 80,   reward: { rep: 25, gold: 300 } },
  { type: 'COMBO_REACH',  desc: 'Reach combo x10',                     target: 10,   reward: { rep: 20, gold: 200 } },
];

export const ACHIEVEMENT_DEFS = [
  { id: 'GHOST',        desc: '50 siphons without getting busted',             reward: { rep: 25  } },
  { id: 'UNTOUCHABLE',  desc: 'Reach Level 5 without getting busted this run', reward: { rep: 50  } },
  { id: 'COMBO_KING',   desc: 'Reach combo x15',                               reward: { gold: 200 } },
  { id: 'FIRST_BLOOD',  desc: 'Land your first critical strike',               reward: { gold: 100 } },
  { id: 'DATA_HOARDER', desc: 'Fill inventory to maximum capacity',            reward: { rep: 10  } },
];

// ── PRESTIGE PERK TREE ────────────────────────────────────────────────────────

export const PRESTIGE_PERK_DEFS = [
	{ id: 'GHOST_STEP',     branch: 'GHOST',     reqLevel: 1, cost: 1,desc: 'Siphon stamina cost reduced from 10 to 8',           effect: 'SIPHON costs 8 STA instead of 10'          },
	{ id: 'GHOST_AIM',      branch: 'GHOST',     reqLevel: 5, cost: 3,desc: 'Siphon / Deep Siphon success rate permanently +10%', effect: '+10% siphon/deep-siphon success rate'       },
	{ id: 'GUILD_MASTER',   branch: 'OVERLORD',  reqLevel: 1, cost: 1,desc: 'All runners generate +25% credits per cycle',        effect: 'Runner income x1.25'                        },
	{ id: 'FAST_FENCE',     branch: 'OVERLORD',  reqLevel: 5, cost: 3,desc: 'Auto-Fencer triggers every 15s instead of 30s',      effect: 'Auto-Fencer CD: 15s'                        },
	{ id: 'INTEL_DISCOUNT', branch: 'ARCHITECT', reqLevel: 1, cost: 1,desc: 'Intel upgrade REP costs reduced by 20%',             effect: 'Intel Upgrades -20% REP cost'               },
	{ id: 'PROXY_OVERLOAD', branch: 'ARCHITECT', reqLevel: 5, cost: 3,desc: 'Effective Proxy Server count +2 levels',             effect: 'Bust threshold +20 (2 virtual proxy levels)' },
	{ id: 'EYE_REVEAL',     branch: 'ARCHITECT', reqLevel: 1, cost: 1,desc: 'Reveals exact countdown to next Police Raid',        effect: 'Raid timer always visible in OPS'           },
];

// ── PROGRESSIVE DISCLOSURE ────────────────────────────────────────────────────

export function isUnlocked(state, feature) {
  const lvl = state.level ?? 1;
  switch (feature) {
    // Always visible from level 1
    case 'siphon':     return true;
    case 'gold':       return true;
    case 'log':        return true;
    case 'stamina':    return true;
    // Level 2
    case 'breach':     return lvl >= 2;
    case 'xp':         return lvl >= 2;
    // Level 3
    case 'upgrades_tab': return lvl >= 3;
    case 'heat':         return true;
    case 'runners':      return lvl >= 3;
    // Level 4
    case 'rep':          return lvl >= 4;
    case 'dark_market':  return lvl >= 4;
    case 'barter':       return lvl >= 4;
    case 'intel':        return lvl >= 4;
    // Level 5
    case 'district':      return lvl >= 5;
    case 'daily':         return lvl >= 5;
    // Level 6
    case 'deep_siphon':  return lvl >= 6;
    case 'manual_cool':  return lvl >= 6;
    case 'ai_subroutine':return lvl >= 6;
    // Level 4 + 50 REP
    case 'protocol':     return lvl >= 4 && (state.reputation ?? 0) >= 50;
    // Level 8
    case 'mainframe':    return lvl >= 8;
    default:             return true;
  }
}

export function setProtocol(state, protocol) {
	const next = (state.activeProtocol === protocol) ? 'NONE' : protocol;
	if (next !== 'NONE' && !PROTOCOL_DEFS[next]) return state;
	let s = {
		...state,
		activeProtocol: next,
		log: addLog(state.log, next === 'NONE'
			? ':: PROTOCOL DEACTIVATED'
			: `:: PROTOCOL ACTIVATED :: ${next}`),
	};
	if (next === 'NIGHT_STALKER') s = addZero(s, 'night_stalker_active');
	return s;
}

const BARTER_CD      = DEV_MODE ? 10   : 300;
const ENC_KEY_CHANCE = 0.03; // 3% per successful action
const ENC_KEY_IDS    = ['KEY_ALPHA', 'KEY_BETA', 'KEY_GAMMA', 'KEY_DELTA', 'KEY_EPSILON'];
const AI_SUBROUTINE_CYCLE = DEV_MODE ? 30  : 3600;
const RAID_CD_MIN    = DEV_MODE ? 60   : 480;   // 8 min
const RAID_CD_MAX    = DEV_MODE ? 60   : 900;   // 15 min
const RAID_DURATION  = DEV_MODE ? 15   : 60;

function randomRaidInterval() {
  return RAID_CD_MIN + Math.floor(Math.random() * (RAID_CD_MAX - RAID_CD_MIN + 1));
}

function randomScanInterval() {
	return SCAN_INTERVAL_MIN + Math.floor(Math.random() * (SCAN_INTERVAL_MAX - SCAN_INTERVAL_MIN + 1));
}

const RUNNER_LABELS = {
  streetRunner: 'STREET_RUNNER', dataThief: 'DATA_THIEF', infiltrator: 'INFILTRATOR',
  fixer: 'FIXER', shadowBroker: 'SHADOW_BROKER',
};

// ── DISTRICTS ─────────────────────────────────────────────────────────────────

// ── ZONE PROPERTIES ───────────────────────────────────────────────────────────
// Maps CITY_MAP.js zone IDs (Z1-Z7) to game-mechanical properties.
// state.district is now one of these keys.

export const DISTRICTS = {
	Z1: { id: 'Z1', name: 'NEON_CORE',      color: '#ffc174', desc: 'High tech, high risk. Heart of Aetheria.', lootMultiplier: 4.0, heatDecayBase: 0.1 },
	Z2: { id: 'Z2', name: 'INDUSTRIAL_WASTES', color: '#ff6b35', desc: 'Raw resources. Gold focus. Toxic.', lootMultiplier: 2.0, heatDecayBase: 0.2 },
	Z3: { id: 'Z3', name: 'EASTERN_TECH',      color: '#00d4ff', desc: 'Encryption and security complexes.', lootMultiplier: 2.5, heatDecayBase: 0.15 },
	Z4: { id: 'Z4', name: 'WESTERN_SLUMS',     color: '#b347ff', desc: 'Stealth and black market networks.', lootMultiplier: 1.0, heatDecayBase: 0.3 },
	Z5: { id: 'Z5', name: 'CORP_CITADEL',      color: '#ff2244', desc: 'Endgame zone. GID controlled.', lootMultiplier: 8.0, heatDecayBase: 0.05 },
	Z6: { id: 'Z6', name: 'THE_UNDERBELLY',    color: '#22ff88', desc: 'Hidden. Accessed via Subway Nexus.', lootMultiplier: 3.0, heatDecayBase: 0.4 },
	Z7: { id: 'Z7', name: 'BUFFER_DISTRICTS',  color: '#888899', desc: 'Transition zones. Contested.', lootMultiplier: 1.5, heatDecayBase: 0.2 },
};

// ── CANONICAL HEX MAP (from CITY_MAP.js) ──────────────────────────────────────
// CITY_MAP  — full 28-hex Aetheria grid  (id, q, r, connections, effectHooks…)
// CITY_ZONES — zone palette + metadata  (Z1-Z7 colors and descriptions)

export const CITY_MAP   = AETHERIA_MAP;
export const CITY_ZONES = AETHERIA_DISTRICTS;

// ── MAP LOGIC ─────────────────────────────────────────────────────────────────

// Returns true if hexId is adjacent to at least one PLAYER-owned hex.
export function canCapture(state, hexId) {
	const hex = CITY_MAP[hexId];
	if (!hex) return false;
	const owned = state.capturedHexes ?? ['H00'];
	if (owned.includes(hexId)) return false;
	return hex.connections.some(id => owned.includes(id));
}

// Captures a hex: adds it to capturedHexes, reveals neighbors in mapDiscovery.
export function captureHex(state, hexId) {
	if (!canCapture(state, hexId)) return state;
	const hex        = CITY_MAP[hexId];
	const zoneName   = CITY_ZONES[hex.districtId]?.name ?? hex.districtId;
	const captured   = [...(state.capturedHexes ?? []), hexId];
	const discovered = [...new Set([
		...(state.mapDiscovery ?? []),
		hexId,
		...hex.connections.filter(id => CITY_MAP[id]),
	])];
	return {
		...state,
		capturedHexes: captured,
		mapDiscovery:  discovered,
		log: addLog(state.log, `:: NODE_CAPTURED :: ${hex.label} :: ${zoneName}`),
	};
}

// Aggregates all passive modifiers from currently owned hex effectHooks.
// effectHooks is an array of { type, value } objects (CITY_MAP.js format).
// goldMult / runner_speed are compound-multiplicative; all others additive.
export function calculateMapModifiers(state) {
	const owned  = state.capturedHexes ?? [];
	const result = {
		heatDecayBonus:       0,
		goldMult:             1,
		passiveGold:          0,
		siphonSuccessBonus:   0,
		bustThresholdBonus:   0,
		raidPenaltyReduction: 0,
		staminaRegen:         0,
		xpBoost:              0,
		runnerSpeedMult:      1,
		critChanceBonus:      0,
		repBoost:             0,
	};
	for (const id of owned) {
		const hex = CITY_MAP[id];
		if (!hex || hex.type === 'empty_block') continue;
		const hooks = Array.isArray(hex.effectHooks) ? hex.effectHooks : [];
		for (const h of hooks) {
			if (!h || h.type === 'none') continue;
			switch (h.type) {
				case 'heat_decay':      result.heatDecayBonus       += h.value; break;
				case 'gold_mult':       result.goldMult             *= (1 + h.value); break;
				case 'siphon_rate':     result.siphonSuccessBonus   += h.value; break;
				case 'bust_threshold':  result.bustThresholdBonus   += h.value; break;
				case 'stamina_regen':   result.staminaRegen         += h.value; break;
				case 'xp_boost':        result.xpBoost              += h.value; break;
				case 'runner_speed':    result.runnerSpeedMult      *= (1 + h.value); break;
				case 'crit_chance':     result.critChanceBonus      += h.value; break;
				case 'rep_boost':       result.repBoost             += h.value; break;
				// passiveGold / raidPenaltyReduction — no direct CITY_MAP.js type
				default: break;
			}
		}
	}
	return result;
}

// Returns the initial mapDiscovery: starting hex + its immediate neighbors.
export function getInitialDiscovery() {
	const start = 'western_warpgate';
	// Filter: Na začiatku uvidíš len susedov, ktorí sú v rovnakom distrikte (Z4)
	const neighbors = (CITY_MAP[start]?.connections ?? [])
		.filter(connId => CITY_MAP[connId]?.districtId === 'Z4');
	
	return [start, ...neighbors];
}
// Returns a flat array ready for rendering — pixel coords, owner color, status.
// HEX_SIZE is the pointy-top flat radius in SVG units.
export function getMapDataForVis(state, HEX_SIZE = 24) {
	const sqrt3    = Math.sqrt(3);
	const captured = new Set(state.capturedHexes ?? []);
	const district = state.district;

	// Zone color palette mirrors CITY_MAP.js DISTRICTS colors
	const zoneColor = {
		Z1: '#ffc174',
		Z2: '#ff6b35',
		Z3: '#00d4ff',
		Z4: '#b347ff',
		Z5: '#ff2244',
		Z6: '#22ff88',
		Z7: '#888899',
	};

	return Object.values(CITY_MAP).map(hex => {
		// Axial → pixel (flat-top orientation)
		const px = HEX_SIZE * (sqrt3 * hex.q + (sqrt3 / 2) * hex.r);
		const py = HEX_SIZE * (1.5 * hex.r);

		const isOwned  = captured.has(hex.id);
		const isActive = hex.districtId === district;
		const faction  = hex.faction;

		let ownerColor;
		if (isOwned)            ownerColor = 'var(--amber)';
		else if (faction === 'GID' || faction === 'OMNIGUARD') ownerColor = '#ef4444';
		else if (faction === 'ZERO')                           ownerColor = '#22ff88';
		else                    ownerColor = zoneColor[hex.districtId] ?? '#444';

		return {
			id:          hex.id,
			label:       hex.label,
			icon:        hex.icon,
			type:        hex.type,
			districtId:  hex.districtId,
			faction:     faction ?? 'NEUTRAL',
			q:           hex.q,
			r:           hex.r,
			px, py,
			isOwned,
			isActive,
			ownerColor,
			captureTime: hex.captureTime,
			lootMult:    hex.lootMultiplier ?? 1,
		};
	});
}

// ── UPGRADE DEFINITIONS ───────────────────────────────────────────────────────

export const UPGRADE_DEFS = [
  { key: 'ghostProtocol',  label: 'GHOST_PROTOCOL',  baseCost: 50,  max: 10, effect: 'Siphon success +2% / lvl'      },
  { key: 'neuralBoost',    label: 'NEURAL_BOOST',    baseCost: 80,  max: 15, effect: 'Max stamina +10 / lvl'         },
  { key: 'signalDampener', label: 'SIGNAL_DAMPENER', baseCost: 120, max: 8,  effect: 'Heat generated -10% / lvl'     },
  { key: 'stimPack',       label: 'STIM_PACK',       baseCost: 200, max: 10, effect: 'Stamina regen +0.5/s / lvl'    },
  { key: 'traceEraser',    label: 'TRACE_ERASER',    baseCost: 150, max: 6,  effect: 'Heat decay +0.1/s / lvl'       },
  { key: 'iceBreaker',     label: 'ICE_BREAKER',     baseCost: 350, max: 5,  effect: 'Bust lockout -1s / lvl'        },
  { key: 'darkChannel',    label: 'DARK_CHANNEL',    baseCost: 200, max: 8,  effect: 'Item cooldown -30s / lvl'      },
  { key: 'voidDrive', label: 'VOID_DRIVE', baseCost: 500, max: 10, effect: 'Inventory +2 slots / lvl' },
  { key: 'proxyServers',     label: 'PROXY_SERVERS',     baseCost: 400, max: 5, effect: 'Bust threshold +10 / lvl (default 100)' },
  { key: 'quantumEncryption',label: 'QUANTUM_ENCRYPTION',baseCost: 800, max: 1, effect: 'On BUSTED: save 20% of inventory'        },
  { key: 'safehouse',      label: 'SAFEHOUSE_NETWORK',  baseCost: 1500, max: 6, effect: 'Offline cap +2 hours / lvl' },
  { key: 'xpBoost',       label: 'NEURAL_TRAINING',   baseCost: 2000, max: 5, effect: 'Action XP +20% / lvl' },
  { key: 'runnerStealth', label: 'SYNDICATE_STEALTH', baseCost: 3500, max: 4, effect: 'Runner Heat -25% / lvl' },
  { key: 'autoFencer',       label: 'AUTO_FENCER',       baseCost: 500, max: 1, effect: 'Auto-sell cold items every 30s'          },
  { key: 'aiSubroutine',    label: 'AI_SUBROUTINE',     baseCost: 600,  max: 1, effect: 'Every 60min: auto-reduce heat by 25'       },
  { key: 'hwOverclock',     label: 'HW_OVERCLOCK',      baseCost: 1000, max: 3, effect: 'Runners +15% speed · Heat x1.5/cycle / lvl' },
];

export const INTEL_UPGRADE_DEFS = [
  { key: 'netScanner',   label: 'NET_SCANNER',   repCost: 25,  max: 1, effect: 'Show effective success rate on actions' },
  { key: 'corpMole',     label: 'CORP_MOLE',     repCost: 50,  max: 1, effect: 'Heat decay 2x faster'                  },
  { key: 'deepSource',   label: 'DEEP_SOURCE',   repCost: 100, max: 1, effect: 'Loot value +10%'                       },
  { key: 'darkExchange', label: 'DARK_EXCHANGE', repCost: 200, max: 1, effect: 'Dark Market cooldown -30min'           },
];

// ── LORE MESSAGES ─────────────────────────────────────────────────────────────

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MSG = {
  siphonSuccess: (id) => randomPick([
    `Intercepted Aether-Biotech data packet :: [${id}] secured`,
    `Ghost protocol successful :: [${id}] extracted`,
    `The Eye didn't see this :: [${id}] acquired`,
  ]),
  siphonFail: () => randomPick([
    'TARGET_TRACED :: Aether-Biotech firewall triggered',
    'Signal detected :: abort abort abort',
    'THE_EYE is watching :: connection severed',
  ]),
  breachSuccess: (id) => randomPick([
    `Vault compromised :: [${id}] extracted`,
    `Security overridden :: [${id}] belongs to us now`,
  ]),
  breachFail: () => randomPick([
    'BREACH_FAILED :: alarm triggered :: evacuating',
    'Security ICE blocked the breach :: retreat',
  ]),
  deepSiphonSuccess: (id) => randomPick([
    `Deep channel secured :: [${id}] exfiltrated`,
    `Penetrated secondary firewall :: [${id}] lifted`,
  ]),
  deepSiphonFail: () => randomPick([
    'DEEP_TRACE detected :: connection severed',
    'Anomaly flagged in subsystem :: aborting',
  ]),
  mainframeSuccess: (id) => randomPick([
    `Mainframe cracked :: [${id}] transferred`,
    `Root access achieved :: [${id}] exfiltrated`,
  ]),
  mainframeFail: () => randomPick([
    'BLACK_ICE activated :: connection terminated',
    'Mainframe defense grid triggered :: abort',
  ]),
  busted: () => randomPick([
    'SYSTEM COMPROMISED :: THE_EYE found you',
    'Identity flagged :: Aether-Biotech response team dispatched',
  ]),
};

// ── ZERO MESSAGES ─────────────────────────────────────────────────────────────

const ZERO = {
	first_siphon:         "Terminal active. Extract what you can.",
	level_2:              "Neural link stabilizing. Breach protocol unlocked.",
	level_3:              "You need help. I know people.",
	level_4:              "The underground economy is open to you now.",
	level_5:              "The city is starting to notice you. Switch protocols wisely.",
	level_6:              "Deep channels accessible. Stay off the grid.",
	level_8:              "Mainframe is exposed. One shot.",
	first_busted:         "They caught you. But you're still alive. That means something.",
	first_runner:         "You're building something. THE EYE doesn't like that.",
	first_prestige:       "New iteration. Same city. You remember more than you should.",
	gold_10k:             "Money means nothing here. REP means everything.",
	betrayal:             "Someone talked. Check your roster.",
	enc_key_set:          "Collect all five. What they unlock will change everything.",
	bounty:               "They put a price on your head. Lay low.",
	night_stalker_active: "Going loud? I'll have the getaway car ready, just in case.",
	quantum_drop:         "That chip... it's shifting frequencies. Be careful who you sell it to.",
};

function addZero(state, key) {
  const zm = state.zeroMessages ?? [];
  if (zm.includes(key) || !ZERO[key]) return state;
  return {
    ...state,
    zeroMessages: [...zm, key],
    log: addLog(state.log, `[ZERO >>] ${ZERO[key]}`),
  };
}

// ── ENCRYPTION KEY HELPERS ────────────────────────────────────────────────────

// Returns updated state after potentially dropping a random enc key (3% chance)
function tryDropEncKey(state) {
  if (Math.random() >= ENC_KEY_CHANCE) return state;
  const existing = (state.encKeys ?? []);
  const missing  = ENC_KEY_IDS.filter(k => !existing.includes(k));
  if (missing.length === 0) return state; // all keys already owned
  const key      = missing[Math.floor(Math.random() * missing.length)];
  const newKeys  = [...existing, key];
  const uniqueCount = newKeys.length;
  let next = {
    ...state,
    encKeys: newKeys,
    log: addLog(state.log, `:: ENCRYPTION_KEY :: ${key} acquired :: [${uniqueCount}/5 unique]`),
  };
  // Hint ZERO message when first key or when all 5 collected
  if (uniqueCount === 1) next = addZero(next, 'enc_key_set');
  return next;
}

export function decrypt(state) {
  const keys = state.encKeys ?? [];
  if (ENC_KEY_IDS.some(k => !keys.includes(k))) return state; // not all 5
  const income = applyIncome(state, 500);
  let next = {
    ...state,
    encKeys:    [],
    gold:       income.gold,
    totalGoldEarned: income.totalGoldEarned,
    runGoldEarned:   income.runGoldEarned,
    reputation: state.reputation + 20,
    log: addLog(state.log, ':: DECRYPT :: ALL KEYS CONSUMED :: +500 CR :: +20 REP'),
  };
  next = addZero(next, 'enc_key_set');
  return next;
}

// ── DAILY CHALLENGE HELPERS ───────────────────────────────────────────────────

function pickNewChallenge(nowMs) {
  const def = CHALLENGE_DEFS[Math.floor(Math.random() * CHALLENGE_DEFS.length)];
  return { type: def.type, target: def.target, current: 0, reward: def.reward, completed: false, lastReset: nowMs };
}

// For COMBO_REACH and SURVIVE_HEAT: progress = max(current, value).
// For all others: progress = current + value (additive, capped at target).
function updateDailyChallenge(state, eventType, value) {
  const dc = state.dailyChallenge;
  if (!dc || dc.completed || dc.type !== eventType) return state;
  const isMax     = eventType === 'COMBO_REACH' || eventType === 'SURVIVE_HEAT';
  const newCurrent = isMax
    ? Math.max(dc.current, value)
    : Math.min(dc.target, dc.current + value);
  if (newCurrent < dc.target) {
    return { ...state, dailyChallenge: { ...dc, current: newCurrent } };
  }
  // Challenge complete
  const repReward  = dc.reward.rep  ?? 0;
  const goldReward = dc.reward.gold ?? 0;
  let next = {
    ...state,
    reputation:    state.reputation + repReward,
    dailyChallenge: { ...dc, current: newCurrent, completed: true },
    dailyFeedback:  { ts: Date.now() },
    log: addLog(state.log,
      `:: [DAILY COMPLETE] ${dc.type} :: +${repReward} REP${goldReward > 0 ? ` :: +${goldReward.toLocaleString()} CR` : ''}`),
  };
  if (goldReward > 0) {
    const income = applyIncome(next, goldReward);
    next = { ...next, gold: income.gold, totalGoldEarned: income.totalGoldEarned, runGoldEarned: income.runGoldEarned };
  }
  return next;
}

// ── COST FORMULAS ─────────────────────────────────────────────────────────────

export function getUpgradeCost(baseCost, currentLevel) {
  return Math.floor(baseCost * Math.pow(1.15, currentLevel));
}

export function getRunnerCost(baseCost, count) {
  return Math.floor(baseCost * Math.pow(1.3, count));
}

// ── PURE HELPERS ──────────────────────────────────────────────────────────────

export function getRandomLoot(table) {
  const total = table.reduce((sum, item) => sum + item.weight, 0);
  let rand = Math.random() * total;
  for (const item of table) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return table[table.length - 1];
}

export function xpRequired(level) {
  return Math.floor(100 * Math.pow(2.2, level - 1));
}

export function heatStatus(heat) {
  if (heat >= 81) return 'CRITICAL';
  if (heat >= 61) return 'HOT';
  if (heat >= 31) return 'WATCHED';
  return 'CLEAR';
}

export function effectiveSuccessRate(baseRate, level, levelBonus, heat, ghostProtocol = 0, bountyActive = false) {
  const heatPenalty =
    heat >= 81 ? 0.40 :
    heat >= 61 ? 0.25 :
    heat >= 31 ? 0.10 : 0;
  const gp          = (baseRate === 0.70 || baseRate === 0.65) ? ghostProtocol * 0.02 : 0;
  const bountyPen   = bountyActive ? 0.20 : 0;
  return Math.min(0.95, Math.max(0.05, baseRate + (level - 1) * levelBonus + gp - heatPenalty - bountyPen));
}

// ── PRIVATE HELPERS ───────────────────────────────────────────────────────────

function addLog(log, message) {
	const d = new Date();
	const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	return [`[${t}] ${message}`, ...log].slice(0, 50);
}

// Compact batched action logger — returns { log, logBatch } to spread into state.
// Same type + within 3s + log[0] still matches batch entry → merge instead of prepend.
function addActionLog(state, type, { item = null, xp = 0, heat = 0, critical = false } = {}) {
	const now = Date.now();
	const d = new Date();
	const ts = `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}]`;
	const batch = state.logBatch ?? null;

	function buildEntry(count, items, totalXp, totalHeat, hasCrit) {
		const icon = hasCrit ? '!!' : '✓';
		const itemCounts = {};
		for (const id of items) itemCounts[id] = (itemCounts[id] || 0) + 1;
		const itemStr = Object.keys(itemCounts).length > 0
			? ' · ' + Object.entries(itemCounts).map(([id, c]) => c > 1 ? `${id} x${c}` : id).join(' ')
			: '';
		const countStr  = count    > 1 ? ` x${count}`       : '';
		const xpStr     = totalXp  > 0 ? ` · +${totalXp}XP` : '';
		const heatStr   = totalHeat > 0 ? ` · HEAT+${totalHeat}` : '';
		return `${ts} ${icon} ${type}${countStr}${itemStr}${xpStr}${heatStr}`;
	}

	if (batch && batch.type === type && (now - batch.ts) < 3000 && state.log[0] === batch.entry) {
		const newCount = batch.count + 1;
		const newItems = item ? [...batch.items, item] : batch.items;
		const newXp    = batch.xp   + xp;
		const newHeat  = batch.heat + heat;
		const hasCrit  = batch.hasCrit || critical;
		const newEntry = buildEntry(newCount, newItems, newXp, newHeat, hasCrit);
		return {
			log:      [newEntry, ...state.log.slice(1)].slice(0, 50),
			logBatch: { type, ts: batch.ts, count: newCount, items: newItems, xp: newXp, heat: newHeat, hasCrit, entry: newEntry },
		};
	}

	const newItems = item ? [item] : [];
	const newEntry = buildEntry(1, newItems, xp, heat, critical);
	return {
		log:      [newEntry, ...state.log].slice(0, 50),
		logBatch: { type, ts: now, count: 1, items: newItems, xp, heat, hasCrit: critical, entry: newEntry },
	};
}

function getMaxInventory(upgrades) {
  // Základ je 20 slotov. Každý lvl VOID_DRIVE pridá 5 ďalších.
  return 12 + (upgrades.voidDrive ?? 0) * 2; 
}

function makeItem(template, districtMult = 1, upgrades = {}, intelUpgrades = {}) {
	const deepSourceBonus      = (intelUpgrades.deepSource ?? 0) >= 1 ? 1.10 : 1;
	const darkChannelReduction = (upgrades.darkChannel ?? 0) * 30;
	let item = {
		...template,
		gold:              Math.round(template.gold * districtMult * deepSourceBonus),
		instanceId:        `${template.id}_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
		isHot:             true,
		cooldownRemaining: Math.max(30, template.cooldown - darkChannelReduction),
		prefixId:          null,
		prefixHeatMult:    1,
		prefixXpMult:      1,
		isQuantum:         false,
	};
	if (Math.random() < 0.20) {
		const prefix = LOOT_PREFIXES[Math.floor(Math.random() * LOOT_PREFIXES.length)];
		item = {
			...item,
			id:                `${prefix.id}_${item.id}`,
			gold:              Math.round(item.gold * prefix.creditMult),
			cooldownRemaining: Math.max(30, Math.round(item.cooldownRemaining * prefix.cooldownMult)),
			prefixId:          prefix.id,
			prefixHeatMult:    prefix.heatMult,
			prefixXpMult:      prefix.xpMult,
			isQuantum:         prefix.id === 'QUANTUM',
		};
	}
	return item;
}

function applyBustedCheck(state) {
  const mapBustBonus  = calculateMapModifiers(state).bustThresholdBonus;
  const bustThreshold = 100 + (state.upgrades?.proxyServers ?? 0) * 10 + ((state.prestigePerks?.PROXY_OVERLOAD) ? 20 : 0) + mapBustBonus;
  if (state.heat < bustThreshold) return state;
  const iceBreakerLvl  = state.upgrades?.iceBreaker ?? 0;
  const lockout        = Math.max(1, 10 - iceBreakerLvl);
  const hasQE          = (state.upgrades?.quantumEncryption ?? 0) >= 1;
  const savedInventory = hasQE && state.inventory.length > 0
    ? (() => {
        const shuffled = [...state.inventory].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.max(1, Math.floor(state.inventory.length * 0.2)));
      })()
    : [];
  const invMsg = hasQE && savedInventory.length > 0
    ? `:: ${savedInventory.length} ITEM(S) ENCRYPTED — RECOVERED`
    : ':: INVENTORY LOST';
  let next = {
    ...state,
    heat:              0,
    inventory:         savedInventory,
    layLowActive:      false,
    layLowTimer:       0,
    comboCount:        0,
    heatSpikeTimer:    0,
    bountyActive:      false,
    bustedLockout:     lockout,
    siphonsWithoutBust: 0,
    everBustedThisRun:  true,
    feedback:          { type: 'BUSTED', ts: Date.now() },
    log: addLog(state.log, `:: [BUSTED] ${MSG.busted()} ${invMsg} :: ${lockout}s LOCKOUT`),
  };
  next = addZero(next, 'first_busted');
  return next;
}

function checkLevelUp(state) {
  const needed = xpRequired(state.level);
  if (state.xp < needed) return state;
  let next = {
    ...state,
    level: state.level + 1,
    xp:    state.xp - needed,
    log:   addLog(state.log, `:: LEVEL UP → LEVEL ${state.level + 1}`),
  };
  if (next.level === 2) next = addZero(next, 'level_2');
  if (next.level === 3) next = addZero(next, 'level_3');
  if (next.level === 4) next = addZero(next, 'level_4');
  if (next.level === 5) {
    next = addZero(next, 'level_5');
    if (!(next.everBustedThisRun ?? false)) next = checkAchievement(next, 'UNTOUCHABLE');
  }
  if (next.level === 6) next = addZero(next, 'level_6');
  if (next.level === 8) next = addZero(next, 'level_8');
  return checkLevelUp(next);
}

function applyIncome(state, amount) {
  const mult   = state.prestigeMultiplier ?? 1;
  const earned = Math.round(amount * mult);
  return {
    gold:            state.gold + earned,
    totalGoldEarned: (state.totalGoldEarned ?? 0) + earned,
    runGoldEarned:   (state.runGoldEarned   ?? 0) + earned,
    _earned:         earned,
  };
}

function checkAchievement(state, id) {
  if ((state.achievements ?? {})[id]) return state;
  const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
  if (!def) return state;
  let s = { ...state, achievements: { ...(state.achievements ?? {}), [id]: true } };
  if (def.reward.rep) s = { ...s, reputation: s.reputation + def.reward.rep };
  if (def.reward.gold) {
    const inc = applyIncome(s, def.reward.gold);
    s = { ...s, gold: inc.gold, totalGoldEarned: inc.totalGoldEarned, runGoldEarned: inc.runGoldEarned };
  }
  const rewardStr = def.reward.rep ? `+${def.reward.rep} REP` : `+${def.reward.gold} CR`;
  s = {
    ...s,
    log:                 addLog(s.log, `:: ACHIEVEMENT UNLOCKED :: ${id} :: ${rewardStr}`),
    achievementFeedback: { id, ts: Date.now() },
  };
  return s;
}

// Applies combo + critical multipliers to a raw item
function applyComboAndCrit(rawItem, state) {
  const comboCount = state.comboCount ?? 0;
  const comboMult  = 1 + Math.min(comboCount * 0.01, 0.20);
  const isCritical = Math.random() < 0.05;
  const finalGold  = isCritical
    ? Math.round(rawItem.gold * comboMult * 10)
    : Math.round(rawItem.gold * comboMult);
  const newCombo = comboCount + (isCritical ? 5 : 1);
  return { item: { ...rawItem, gold: finalGold }, isCritical, newCombo };
}

// ── PLAYER ACTIONS ────────────────────────────────────────────────────────────

export function siphon(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                return state;
  if (state.layLowActive)                     return state;
  if (state.inventory.length >= maxInventory) return state;
  const siphonCost  = (state.prestigePerks ?? {}).GHOST_STEP ? 8 : 10;
  if (state.stamina < siphonCost) {
    return { ...state, log: addLog(state.log, ':: SIPHON ABORTED — INSUFFICIENT_STAMINA') };
  }

  const distMult        = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty     = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const bountyPen       = (state.bountyActive ?? false) ? 0.20 : 0;
  const proto           = PROTOCOL_DEFS[state.activeProtocol ?? 'NONE'] ?? {};
  const protoHeatMult   = proto.heatMult    ?? 1;
  const protoSuccessMod = proto.successRateMod ?? 0;
  const protoCreditMult = proto.creditMult  ?? 1;
  const protoXpMult     = proto.xpMult      ?? 1;
  const ghostAimBonus   = (state.prestigePerks?.GHOST_AIM) ? 0.10 : 0;
  const mapSuccessBonus = calculateMapModifiers(state).siphonSuccessBonus;
  const successRate = Math.min(0.95, Math.max(0.05,
    0.70 + (state.level - 1) * 0.03 + (state.upgrades.ghostProtocol ?? 0) * 0.02 - heatPenalty - bountyPen + protoSuccessMod + ghostAimBonus + mapSuccessBonus));
  const newStamina  = state.stamina - siphonCost;
  const heatFail    = Math.round(10 * heatMult * protoHeatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, '!! COMBO BREAK');
    nextLog = addLog(nextLog, `✗ SIPHON · HEAT+${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      logBatch:   null,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot         = getRandomLoot(STANDARD_LOOT);
  const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
  const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
  const heatOk       = Math.round(5 * heatMult * protoHeatMult * prefixHeatMult);
  const xpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
  const finalXp = Math.round(loot.xp * protoXpMult * prefixXpMult * xpBonus);
  const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
  const protoRawItem = protoCreditMult !== 1
    ? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
    : rawItem;
  const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

  const ar = addActionLog(state, 'SIPHON', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

  let next = checkLevelUp({
    ...state,
    stamina:            newStamina,
    heat:               Math.min(100, state.heat + heatOk),
    xp:                 state.xp + finalXp,
    reputation:         state.reputation + 1,
    comboCount:         newCombo,
    heatSpikeTimer:     isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    siphonsWithoutBust: (state.siphonsWithoutBust ?? 0) + 1,
    inventory:          [...state.inventory, item],
    feedback:           { type: 'SUCCESS', gold: item.gold, item: rawItem.id, critical: isCritical, ts: Date.now() },
    log:                ar.log,
    logBatch:           ar.logBatch,
  });
  next = applyBustedCheck(next);
  next = addZero(next, 'first_siphon');
  if (rawItem.isQuantum) next = addZero(next, 'quantum_drop');
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'SIPHON_COUNT', 1);
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
  next = tryDropEncKey(next);
  // achievements
  if ((next.siphonsWithoutBust ?? 0) >= 50) next = checkAchievement(next, 'GHOST');
  if (isCritical)  next = checkAchievement(next, 'FIRST_BLOOD');
  if (newCombo >= 15) next = checkAchievement(next, 'COMBO_KING');
  if (next.inventory.length >= getMaxInventory(next.upgrades)) next = checkAchievement(next, 'DATA_HOARDER');
  return next;
}

export function breach(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                return state;
  if (state.layLowActive)                     return state;
  if (state.inventory.length >= maxInventory) return state;
  if (state.level < 2) {
    return { ...state, log: addLog(state.log, ':: BREACH REQUIRES LEVEL 2') };
  }
  if (state.stamina < 25) {
    return { ...state, log: addLog(state.log, ':: BREACH ABORTED — INSUFFICIENT_STAMINA') };
  }

  const distMult        = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty     = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const bountyPen       = (state.bountyActive ?? false) ? 0.20 : 0;
  const proto           = PROTOCOL_DEFS[state.activeProtocol ?? 'NONE'] ?? {};
  const protoHeatMult   = proto.heatMult    ?? 1;
  const protoSuccessMod = proto.successRateMod ?? 0;
  const protoCreditMult = proto.creditMult  ?? 1;
  const protoXpMult     = proto.xpMult      ?? 1;
  const successRate = Math.min(0.95, Math.max(0.05, 0.55 + (state.level - 1) * 0.04 - heatPenalty - bountyPen + protoSuccessMod));
  const newStamina  = state.stamina - 25;
  const heatFail    = Math.round(20 * heatMult * protoHeatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, '!! COMBO BREAK');
    nextLog = addLog(nextLog, `✗ BREACH · HEAT+${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      logBatch:   null,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot         = getRandomLoot(PREMIUM_LOOT);
  const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
  const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
  const heatOk       = Math.round(15 * heatMult * protoHeatMult * prefixHeatMult);
  const xpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
  const finalXp = Math.round(loot.xp * protoXpMult * prefixXpMult * xpBonus);
  const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
  const protoRawItem = protoCreditMult !== 1
    ? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
    : rawItem;
  const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

  const ar = addActionLog(state, 'BREACH', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + finalXp,
    reputation:     state.reputation + 3,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: rawItem.id, critical: isCritical, ts: Date.now() },
    log:            ar.log,
    logBatch:       ar.logBatch,
  });
  next = applyBustedCheck(next);
  if (rawItem.isQuantum) next = addZero(next, 'quantum_drop');
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'BREACH_COUNT', 1);
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
  next = tryDropEncKey(next);
  if (isCritical)  next = checkAchievement(next, 'FIRST_BLOOD');
  if (newCombo >= 15) next = checkAchievement(next, 'COMBO_KING');
  if (next.inventory.length >= getMaxInventory(next.upgrades)) next = checkAchievement(next, 'DATA_HOARDER');
  return next;
}

export function deepSiphon(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                return state;
  if (state.layLowActive)                     return state;
  if (state.inventory.length >= maxInventory) return state;
  if (state.level < 5) {
    return { ...state, log: addLog(state.log, ':: DEEP_SIPHON REQUIRES LEVEL 5') };
  }
  if (state.stamina < 15) {
    return { ...state, log: addLog(state.log, ':: DEEP_SIPHON ABORTED — INSUFFICIENT_STAMINA') };
  }

  const distMult        = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty     = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const bountyPen       = (state.bountyActive ?? false) ? 0.20 : 0;
  const proto           = PROTOCOL_DEFS[state.activeProtocol ?? 'NONE'] ?? {};
  const protoHeatMult   = proto.heatMult    ?? 1;
  const protoSuccessMod = proto.successRateMod ?? 0;
  const protoCreditMult = proto.creditMult  ?? 1;
  const protoXpMult     = proto.xpMult      ?? 1;
  const ghostAimBonus   = (state.prestigePerks?.GHOST_AIM) ? 0.10 : 0;
  const mapSuccessBonus = calculateMapModifiers(state).siphonSuccessBonus;
  const successRate = Math.min(0.95, Math.max(0.05, 0.65 + (state.level - 1) * 0.03 - heatPenalty - bountyPen + protoSuccessMod + ghostAimBonus + mapSuccessBonus));
  const newStamina  = state.stamina - 15;
  const heatFail    = Math.round(12 * heatMult * protoHeatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, '!! COMBO BREAK');
    nextLog = addLog(nextLog, `✗ DEEP_SIPHON · HEAT+${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      logBatch:   null,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot         = getRandomLoot(DEEP_SIPHON_LOOT);
  const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
  const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
  const heatOk       = Math.round(8 * heatMult * protoHeatMult * prefixHeatMult);
  const xpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
  const finalXp = Math.round(loot.xp * protoXpMult * prefixXpMult * xpBonus);
  const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
  const protoRawItem = protoCreditMult !== 1
    ? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
    : rawItem;
  const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

  const ar = addActionLog(state, 'DEEP_SIPHON', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + finalXp,
    reputation:     state.reputation + 2,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: rawItem.id, critical: isCritical, ts: Date.now() },
    log:            ar.log,
    logBatch:       ar.logBatch,
  });
  next = applyBustedCheck(next);
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
  if (rawItem.isQuantum) next = addZero(next, 'quantum_drop');
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = tryDropEncKey(next);
  if (isCritical)  next = checkAchievement(next, 'FIRST_BLOOD');
  if (newCombo >= 15) next = checkAchievement(next, 'COMBO_KING');
  if (next.inventory.length >= getMaxInventory(next.upgrades)) next = checkAchievement(next, 'DATA_HOARDER');
  return next;
}

export function mainframeHack(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                return state;
  if (state.layLowActive)                     return state;
  if (state.inventory.length >= maxInventory) return state;
  if (state.level < 8) {
    return { ...state, log: addLog(state.log, ':: MAINFRAME_HACK REQUIRES LEVEL 8') };
  }
  if (state.stamina < 40) {
    return { ...state, log: addLog(state.log, ':: MAINFRAME_HACK ABORTED — INSUFFICIENT_STAMINA') };
  }

  const distMult        = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty     = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const bountyPen       = (state.bountyActive ?? false) ? 0.20 : 0;
  const proto           = PROTOCOL_DEFS[state.activeProtocol ?? 'NONE'] ?? {};
  const protoHeatMult   = proto.heatMult    ?? 1;
  const protoSuccessMod = proto.successRateMod ?? 0;
  const protoCreditMult = proto.creditMult  ?? 1;
  const protoXpMult     = proto.xpMult      ?? 1;
  const mapSuccessBonus = calculateMapModifiers(state).siphonSuccessBonus;
  const successRate = Math.min(0.95, Math.max(0.05, 0.35 + (state.level - 1) * 0.03 - heatPenalty - bountyPen + protoSuccessMod + mapSuccessBonus));
  const newStamina  = state.stamina - 40;
  const heatFail    = Math.round(35 * heatMult * protoHeatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, '!! COMBO BREAK');
    nextLog = addLog(nextLog, `✗ MAINFRAME · HEAT+${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      logBatch:   null,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot         = getRandomLoot(VAULT_LOOT);
  const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
  const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
  const heatOk       = Math.round(25 * heatMult * protoHeatMult * prefixHeatMult);
  const xpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
  const finalXp = Math.round(loot.xp * protoXpMult * prefixXpMult * xpBonus);
  const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
  const protoRawItem = protoCreditMult !== 1
    ? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
    : rawItem;
  const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

  const ar = addActionLog(state, 'MAINFRAME', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + finalXp,
    reputation:     state.reputation + 8,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: rawItem.id, critical: isCritical, ts: Date.now() },
    log:            ar.log,
    logBatch:       ar.logBatch,
  });
  next = applyBustedCheck(next);
  if (rawItem.isQuantum) next = addZero(next, 'quantum_drop');
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
  next = tryDropEncKey(next);
  if (isCritical)  next = checkAchievement(next, 'FIRST_BLOOD');
  if (newCombo >= 15) next = checkAchievement(next, 'COMBO_KING');
  if (next.inventory.length >= getMaxInventory(next.upgrades)) next = checkAchievement(next, 'DATA_HOARDER');
  return next;
}

export function layLow(state) {
  if (state.bustedLockout > 0)  return state;
  if (state.layLowActive)       return state;
  // During an active raid, bypass the cooldown so the player can always respond
  if (state.layLowCooldown > 0 && !(state.raidActive ?? false)) return state;
  let log = addLog(state.log, ':: LAY_LOW ACTIVATED :: HEAT DISPERSAL IN PROGRESS');
  let extra = {};
  if (state.raidActive) {
    log   = addLog(log, ':: RAID EVADED :: LAY LOW successful');
    extra = { raidActive: false, raidTimer: 0, nextRaidIn: randomRaidInterval() };
  }
  return { ...state, ...extra, layLowActive: true, layLowTimer: 30, log };
}

export function sellCooledItems(state) {
  const cold = state.inventory.filter(i => !i.isHot);
  if (cold.length === 0) {
    return { ...state, log: addLog(state.log, ':: SELL FAILED — NO COOLED ITEMS IN INVENTORY') };
  }
  const raw    = cold.reduce((sum, i) => sum + i.gold, 0);
  const income = applyIncome(state, raw);
  let next = {
    ...state,
    gold:            income.gold,
    totalGoldEarned: income.totalGoldEarned,
    runGoldEarned:   income.runGoldEarned,
    inventory:       state.inventory.filter(i => i.isHot),
    log: addLog(state.log, `:: SOLD ${cold.length} ITEM(S) :: +${income._earned.toLocaleString()} CR`),
  };
  next = updateDailyChallenge(next, 'SELL_VALUE', income._earned);
  return next;
}

export function manualCool(state) {
  const hotItems = state.inventory.filter(i => i.isHot);
  if (hotItems.length === 0) return state;
  if (state.stamina < 5) {
    return { ...state, log: addLog(state.log, ':: MANUAL_COOL ABORTED — INSUFFICIENT_STAMINA') };
  }
  // Find the item with the most remaining cooldown (hottest)
  const target = hotItems.reduce((a, b) => a.cooldownRemaining > b.cooldownRemaining ? a : b);
  const newInventory = state.inventory.map(item => {
    if (item.instanceId !== target.instanceId) return item;
    const rem = Math.max(0, item.cooldownRemaining - 15);
    return { ...item, cooldownRemaining: rem, isHot: rem > 0 };
  });
  return {
    ...state,
    stamina:   state.stamina - 5,
    inventory: newInventory,
    log: addLog(state.log, `:: MANUAL_COOL :: [${target.id}] :: -15s`),
  };
}

export function darkMarket(state) {
  if (state.level < 4 || state.reputation < 50) return state;
  if (state.darkMarketCooldown > 0)              return state;
  if (state.inventory.length === 0) {
    return { ...state, log: addLog(state.log, ':: DARK_MARKET — NO ITEMS TO SELL') };
  }
  const raw    = Math.floor(state.inventory.reduce((sum, i) => sum + i.gold, 0) * 0.6);
  const income = applyIncome(state, raw);
  const darkExchangeReduction = ((state.intelUpgrades?.darkExchange ?? 0) >= 1) ? 1800 : 0;
  const cd     = Math.max(0, DARK_MARKET_CD - darkExchangeReduction);
  const cdLabel = DEV_MODE ? `${cd}s [DEV]` : cd < 7200 ? `${Math.floor(cd / 60)}m` : '2H';
  let next = {
    ...state,
    gold:               income.gold,
    totalGoldEarned:    income.totalGoldEarned,
    runGoldEarned:      income.runGoldEarned,
    inventory:          [],
    darkMarketCooldown: cd,
    log: addLog(state.log, `:: DARK_MARKET :: ALL SOLD (60%) :: +${income._earned.toLocaleString()} CR :: CD ${cdLabel}`),
  };
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'SELL_VALUE', income._earned);
  return next;
}

export function barter(state) {
  if ((state.barterCooldown ?? 0) > 0) return state;
  const chips = state.inventory.filter(i => i.id === 'DATA_CHIP');
  if (chips.length < 10) {
    return { ...state, log: addLog(state.log, ':: BARTER FAILED — NEED 10x DATA_CHIP') };
  }
  let removed = 0;
  const newInventory = state.inventory.filter(i => {
    if (i.id === 'DATA_CHIP' && removed < 10) { removed++; return false; }
    return true;
  });
  let barterLog = addLog(state.log, ':: BARTER :: 10x DATA_CHIP liquidated :: +1 REP');
  barterLog = addLog(barterLog, ':: REP +1 :: BARTER complete');
  return {
    ...state,
    inventory:      newInventory,
    reputation:     state.reputation + 1,
    barterCooldown: BARTER_CD,
    log: barterLog,
  };
}

export function buyUpgrade(state, upgradeKey) {
  const def = UPGRADE_DEFS.find(u => u.key === upgradeKey);
  if (!def) return state;
  const currentLevel = state.upgrades[upgradeKey] ?? 0;
  if (currentLevel >= def.max) return state;
  const cost = getUpgradeCost(def.baseCost, currentLevel);
  if (state.gold < cost) return state;
  return {
    ...state,
    gold:     state.gold - cost,
    upgrades: { ...state.upgrades, [upgradeKey]: currentLevel + 1 },
    feedback: { type: 'UPGRADE', label: def.label, ts: Date.now() },
    log: addLog(state.log, `:: UPGRADE: [${def.label}] LVL ${currentLevel + 1} :: -${cost.toLocaleString()} CR`),
  };
}

export function buyIntelUpgrade(state, upgradeKey) {
	const def = INTEL_UPGRADE_DEFS.find(u => u.key === upgradeKey);
	if (!def) return state;
	const currentLevel = (state.intelUpgrades ?? {})[upgradeKey] ?? 0;
	if (currentLevel >= def.max) return state;
	const discountMult   = (state.prestigePerks?.INTEL_DISCOUNT) ? 0.8 : 1;
	const effectiveCost  = Math.round(def.repCost * discountMult);
	if (state.reputation < effectiveCost) return state;
	return {
		...state,
		reputation:    state.reputation - effectiveCost,
		intelUpgrades: { ...(state.intelUpgrades ?? {}), [upgradeKey]: currentLevel + 1 },
		feedback: { type: 'UPGRADE', label: def.label, ts: Date.now() },
		log: addLog(state.log, `:: INTEL: [${def.label}] UNLOCKED :: -${effectiveCost} REP${discountMult < 1 ? ' [DISCOUNTED]' : ''}`),
	};
}

export function hireRunner(state, runnerType) {
  const configs = {
    streetRunner: { level: 3, baseCost: 300,   requiresPrestige: 0, label: 'STREET_RUNNER'  },
    dataThief:    { level: 5, baseCost: 800,   requiresPrestige: 0, label: 'DATA_THIEF'     },
    infiltrator:  { level: 7, baseCost: 2500,  requiresPrestige: 0, label: 'INFILTRATOR'    },
    fixer:        { level: 9, baseCost: 8000,  requiresPrestige: 0, label: 'FIXER'          },
    shadowBroker: { level: 1, baseCost: 25000, requiresPrestige: 1, label: 'SHADOW_BROKER'  },
  };
  const cfg = configs[runnerType];
  if (!cfg) return state;
  if (state.level < cfg.level)                      return state;
  if ((state.prestige ?? 0) < cfg.requiresPrestige) return state;
  const count = state.runners[runnerType] ?? 0;
  if (count >= 5) return state;

  const perksUsed = state.prestigePerksUsed ?? [];
  let cost      = getRunnerCost(cfg.baseCost, count);
  let perkId    = null;
  let perkLabel = null;

  if (runnerType === 'streetRunner' && count === 0 && (state.prestige ?? 0) >= 1 && !perksUsed.includes('FREE_STREET_RUNNER')) {
    cost = 0; perkId = 'FREE_STREET_RUNNER'; perkLabel = 'STREET_RUNNER';
  } else if (runnerType === 'dataThief' && count === 0 && (state.prestige ?? 0) >= 2 && !perksUsed.includes('FREE_DATA_THIEF')) {
    cost = 0; perkId = 'FREE_DATA_THIEF'; perkLabel = 'DATA_THIEF';
  }

  if (state.gold < cost) return state;

  let next = {
    ...state,
    gold:              state.gold - cost,
    runners:           { ...state.runners, [runnerType]: count + 1 },
    prestigePerksUsed: perkId ? [...perksUsed, perkId] : perksUsed,
    log: addLog(state.log, `:: ${cfg.label} HIRED (${count + 1}/5) :: -${cost.toLocaleString()} CR`),
  };
  if (perkId) next = { ...next, log: addLog(next.log, `:: PRESTIGE PERK :: First ${perkLabel} recruited free`) };
  const totalRunners = Object.values(next.runners).reduce((s, n) => s + n, 0);
  if (totalRunners === 1) next = addZero(next, 'first_runner');
  return next;
}

export function setDistrict(state, district) {
  if (!DISTRICTS[district]) return state;
  const dist = DISTRICTS[district];
  if (dist.unlockLevel > state.level)                        return state;
  if ((dist.requiresPrestige ?? 0) > (state.prestige ?? 0)) return state;
  if (state.district === district)                           return state;
  return {
    ...state,
    district: district,
    log: addLog(state.log, `:: DISTRICT → ${dist.label}`),
  };
}

// ── PRESTIGE ──────────────────────────────────────────────────────────────────

export function prestige(state) {
  if (state.level < 10 || (state.runGoldEarned ?? 0) < 100000) return state;
  
  // Výpočet bodov podľa celkového zárobku (odmocninová krivka)
  // 100k = 1 bod, 400k = 2 body, 900k = 3 body, 1.6M = 4 body...
  const pointsEarned = Math.max(1, Math.floor(Math.sqrt((state.runGoldEarned ?? 0) / 100000)));
  
  const newPrestige = (state.prestige ?? 0) + 1;
  const mult        = 1 + newPrestige * 0.25;
  
  let next = {
    // Reset
    gold:               0,
    level:              1,
    xp:                 0,
    inventory:          [],
    upgrades: {
      ghostProtocol: 0, neuralBoost: 0, signalDampener: 0,
      stimPack: 0, traceEraser: 0, iceBreaker: 0, darkChannel: 0,
      voidDrive: 0, proxyServers: 0, quantumEncryption: 0, autoFencer: 0, aiSubroutine: 0, hwOverclock: 0,
    },
    runners:            { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: state.runners?.shadowBroker ?? 0 },
    runnerTick:         { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
    autoFencerTick:     0,
    aiSubroutineTick:   0,
    heat:               0,
    stamina:            100,
    layLowActive:       false,
    layLowTimer:        0,
    layLowCooldown:     0,
    bustedLockout:      0,
    darkMarketCooldown: 0,
    comboCount:         0,
    heatSpikeTimer:     0,
    barterCooldown:     0,
    raidActive:         false,
    raidTimer:          0,
    nextRaidIn:         randomRaidInterval(),
    bountyActive:       false,
    feedback:           null,
    dailyFeedback:      null,
    lastTickTime:       Date.now(),
    runGoldEarned:       0,
    district:            'Z4',
    siphonsWithoutBust:  0,
    everBustedThisRun:   false,
    achievementFeedback: null,
    prestigePerksUsed:   [],
    // Keep
    encKeys:            state.encKeys ?? [],
    prestige:           newPrestige,
    prestigeMultiplier: mult,
    reputation:         state.reputation,
    totalGoldEarned:    state.totalGoldEarned ?? 0,
    offlineAccrualCap:  state.offlineAccrualCap,
    intelUpgrades:      state.intelUpgrades ?? {},
    zeroMessages:       state.zeroMessages ?? [],
    achievements:       state.achievements ?? {},
    prestigePerks:      state.prestigePerks ?? {},
    prestigePoints:     (state.prestigePoints ?? 0) + pointsEarned,
    activeProtocol:     state.activeProtocol ?? 'NONE',
    log: addLog([], `>> PRESTIGE ACTIVATED :: RUN #${newPrestige} :: MULTIPLIER x${mult.toFixed(2)} :: +${pointsEarned} PERK POINT(S)`),
  };
  next = addZero(next, 'first_prestige');
  return next;
}

export function buyPrestigePerk(state, perkId) {
	const def = PRESTIGE_PERK_DEFS.find(d => d.id === perkId);
	if (!def) return state;
	const cost = def.cost ?? 1; // Pridaj túto premennú
	if ((state.prestigePoints ?? 0) < cost) return state; // Zmeň < 1 na < cost
	if ((state.prestigePerks ?? {})[perkId]) return state;
	if ((def.reqLevel ?? 1) > (state.level ?? 1)) return state;
	return {
		...state,
		prestigePoints: (state.prestigePoints ?? 0) - cost, // Zmeň - 1 na - cost
		prestigePerks:  { ...(state.prestigePerks ?? {}), [perkId]: true },
		log: addLog(state.log, `:: PRESTIGE PERK ACTIVATED :: ${perkId} :: ${def.effect}`),
	};
}

// ── OFFLINE PROGRESS ──────────────────────────────────────────────────────────

export function calculateOfflineProgress(state, nowMs) {
  const rawElapsed = (nowMs - (state.lastTickTime ?? nowMs)) / 1000;
  // ZMENENÝ RIADOK: Základ sú 4 hodiny (14400s) + každá úroveň Safehouse pridá 2 hodiny (7200s)
  const maxOffline = 14400 + ((state.upgrades?.safehouse ?? 0) * 7200);
  const elapsed    = Math.min(rawElapsed, maxOffline);
  
  if (elapsed < 60) return null;

  const mult   = state.prestigeMultiplier ?? 1;
  const r      = state.runners ?? {};
  const srRate = ((r.streetRunner  ?? 0) * 2)   / (DEV_MODE ? RUNNER_SR_CYCLE : 30);
  const dtRate = ((r.dataThief     ?? 0) * 8)   / (DEV_MODE ? RUNNER_DT_CYCLE : 120);
  const ifRate = ((r.infiltrator   ?? 0) * 35)  / (DEV_MODE ? RUNNER_IF_CYCLE : 900);
  const fxRate = ((r.fixer         ?? 0) * 150) / (DEV_MODE ? RUNNER_FX_CYCLE : 3600);
  const sbRate = ((r.shadowBroker  ?? 0) * 600) / (DEV_MODE ? RUNNER_SB_CYCLE : 7200);
  const rawGold    = (srRate + dtRate + ifRate + fxRate + sbRate) * elapsed;
  const earnedGold = Math.floor(rawGold * 0.6 * mult);

  const distDecay    = DISTRICTS[state.district]?.heatDecayBase ?? 0.2;
  const traceBonus   = (state.upgrades?.traceEraser ?? 0) * 0.1;
  const corpMoleMult = (state.intelUpgrades?.corpMole ?? 0) >= 1 ? 2 : 1;
  const heatAfter    = Math.max(0, parseFloat((state.heat - (distDecay + traceBonus) * corpMoleMult * elapsed).toFixed(2)));

  const heatDecayed = Math.round(Math.max(0, state.heat - heatAfter));
  return { elapsed, earnedGold, heatAfter, heatDecayed };
}

// ── WARP TIME (DEV) ───────────────────────────────────────────────────────────

export function warpTime(state) {
  if (!DEV_MODE) return state;
  const mult     = state.prestigeMultiplier ?? 1;
  const r        = state.runners;
  const srIncome = Math.floor((r.streetRunner  ?? 0) * 2   * Math.floor(3600 / RUNNER_SR_CYCLE) * mult);
  const dtIncome = Math.floor((r.dataThief     ?? 0) * 8   * Math.floor(3600 / RUNNER_DT_CYCLE) * mult);
  const ifIncome = Math.floor((r.infiltrator   ?? 0) * 35  * Math.floor(3600 / RUNNER_IF_CYCLE) * mult);
  const fxIncome = Math.floor((r.fixer         ?? 0) * 150 * Math.floor(3600 / RUNNER_FX_CYCLE) * mult);
  const sbIncome = Math.floor((r.shadowBroker  ?? 0) * 600 * Math.floor(3600 / RUNNER_SB_CYCLE) * mult);
  const total    = srIncome + dtIncome + ifIncome + fxIncome + sbIncome;
  return {
    ...state,
    gold:               state.gold + total,
    totalGoldEarned:    (state.totalGoldEarned ?? 0) + total,
    runGoldEarned:      (state.runGoldEarned   ?? 0) + total,
    darkMarketCooldown: 0,
    layLowCooldown:     0,
    layLowTimer:        0,
    layLowActive:       false,
    bustedLockout:      0,
    runnerTick:         { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
    inventory:          state.inventory.map(i => ({ ...i, isHot: false, cooldownRemaining: 0 })),
    log: addLog(state.log, `>> DEV: TIME WARPED +3600s :: +${total.toLocaleString()} CR :: COOLDOWNS RESET`),
  };
}

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────

export const SAVE_KEY = 'shadow_guild_save_v1';

export function exportSave(state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  return btoa(String.fromCharCode(...bytes));
}

export function importSave(encoded) {
  try {
    const binary = atob(encoded.trim());
    const bytes  = Uint8Array.from(binary, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// ── GAME TICK (1s interval) ───────────────────────────────────────────────────

export function tick(state) {
  let next = { ...state };
  const nowMs = Date.now();

  // ── 1. MISIE / CHECK COMPLETED INFILTRATIONS ─────────────────────
  next = checkMissions(next);

  // ── 2. LOG BATCH EXPIRY (3 sekundy) ────────────────────────────────
  if ((next.logBatch ?? null) && (nowMs - next.logBatch.ts) > 3000) {
    next = { ...next, logBatch: null };
  }

  // ── 3. DAILY CHALLENGE RESET (každých 24h) ─────────────────────────
  const dc = next.dailyChallenge;
  if (!dc || !dc.type || (nowMs - (dc.lastReset ?? 0)) >= 86400000) {
    next = { ...next, dailyChallenge: pickNewChallenge(nowMs) };
  }

  // ── STAMINA REGEN + PROTOCOL MULTIPLIER ────────────────────────────
  const effectiveMaxStamina = 100 + (next.upgrades.neuralBoost ?? 0) * 10;
  const baseRegen = 2 + (next.upgrades.stimPack ?? 0) * 0.5;
  const protoStaminaMult = PROTOCOL_DEFS[next.activeProtocol ?? 'NONE']?.staminaRegenMult ?? 1;
  const effectiveRegen = (next.layLowActive ? baseRegen + 2 : baseRegen) * protoStaminaMult;

  next = {
    ...next,
    stamina: Math.min(effectiveMaxStamina, next.stamina + effectiveRegen)
  };

  // ── BUSTED LOCKOUT ─────────────────────────────────────────────────
  if (next.bustedLockout > 0) {
    return { ...next, bustedLockout: next.bustedLockout - 1, lastTickTime: nowMs };
  }

  // ── HEAT MANAGEMENT ────────────────────────────────────────────────
  if ((next.heatSpikeTimer ?? 0) > 0) {
    next = { ...next, heatSpikeTimer: next.heatSpikeTimer - 1 };
    if (next.layLowActive) {
      next = { ...next, heat: Math.max(0, parseFloat((next.heat - 2).toFixed(2))) };
    } else {
      next = { ...next, heat: Math.min(100, parseFloat((next.heat + 1.5).toFixed(2))) };
    }
  } else {
    const distDecayBase = DISTRICTS[next.district]?.heatDecayBase ?? 0.2;
    const traceBonus = (next.upgrades.traceEraser ?? 0) * 0.1;
    const corpMoleMult = (next.intelUpgrades?.corpMole ?? 0) >= 1 ? 2 : 1;
    const mapHeatBonus = calculateMapModifiers(next).heatDecayBonus ?? 0;
    const heatDecay = next.layLowActive
      ? 2
      : (distDecayBase + traceBonus + mapHeatBonus) * corpMoleMult;

    next = { ...next, heat: Math.max(0, parseFloat((next.heat - heatDecay).toFixed(2))) };
  }

  // ── DAILY CHALLENGE: SURVIVE_HEAT ──────────────────────────────────
  if (next.heat >= 80) {
    next = updateDailyChallenge(next, 'SURVIVE_HEAT', next.heat);
  }

  // ── BOUNTY SYSTEM ──────────────────────────────────────────────────
  if (!(next.bountyActive ?? false) && next.heat >= 80) {
    next = {
      ...next,
      bountyActive: true,
      log: addLog(next.log, ':: BOUNTY ISSUED :: Aether-Biotech has flagged your signature')
    };
    next = addZero(next, 'bounty');
  } else if ((next.bountyActive ?? false) && next.heat < 40) {
    next = {
      ...next,
      bountyActive: false,
      log: addLog(next.log, ':: BOUNTY CLEARED :: signature lost')
    };
  }

  // ── ITEM COOLDOWNS (2x rýchlejšie pri LAY LOW) ─────────────────────
  const cdTick = next.layLowActive ? 2 : 1;
  next = {
    ...next,
    inventory: next.inventory.map(item => {
      if (!item.isHot) return item;
      const rem = item.cooldownRemaining - cdTick;
      return { ...item, cooldownRemaining: Math.max(0, rem), isHot: rem > 0 };
    })
  };

  // ── DEFINÍCIA runnerTick FUNKCIE ───────────────────────────────────
  function runnerTick(cur, runnerKey, crPerCycle, cycle, heatPerCycle) {
    const count = cur.runners?.[runnerKey] ?? 0;
    let newTick = (cur.runnerTick?.[runnerKey] ?? 0) + 1;

    if (count === 0 || newTick < cycle) {
      return {
        ...cur,
        runnerTick: { ...(cur.runnerTick ?? {}), [runnerKey]: newTick }
      };
    }

    // Plná logika runnera (z tvojho pôvodného kódu)
    const spec = (cur.runnerSpec ?? {})[runnerKey];
    const synergyMult = count >= 5 ? 1.20 : 1;
    const guildMult = (cur.prestigePerks ?? {}).GUILD_MASTER ? 1.25 : 1;
    const specGoldMult = spec === 'GREEDY' ? 1.5 : 1;
    const specHeatMult = spec === 'SHADOW' ? 0.5 : 1;

    const income = applyIncome(cur, count * crPerCycle * synergyMult * guildMult * specGoldMult);
    const stealthMult = 1 - (cur.upgrades?.runnerStealth ?? 0) * 0.25;
    const heat = DEV_MODE ? 0 : count * heatPerCycle * specHeatMult * stealthMult;

    let result = {
      ...cur,
      gold: income.gold,
      totalGoldEarned: income.totalGoldEarned,
      runGoldEarned: income.runGoldEarned,
      heat: Math.min(100, cur.heat + heat),
      runnerTick: { ...(cur.runnerTick ?? {}), [runnerKey]: 0 },
      log: addLog(cur.log, `:: ${runnerKey.toUpperCase().replace('RUNNER','_RUNNER').replace('BROKER','_BROKER')} x${count} :: +${income._earned.toLocaleString()} CR${heat > 0 ? ` :: HEAT +${heat}` : ''}${spec && spec !== 'PENDING' ? ` [${spec}]` : ''}`),
    };

    if (!DEV_MODE) result = applyBustedCheck(result);

    // Runner XP
    const prevXp = (cur.runnerXp ?? {})[runnerKey] ?? 0;
    if (prevXp < 100) {
      const newXp = prevXp + 1;
      if (newXp >= 100 && !((cur.runnerSpec ?? {})[runnerKey])) {
        result = {
          ...result,
          runnerXp: { ...(result.runnerXp ?? {}), [runnerKey]: 100 },
          runnerSpec: { ...(result.runnerSpec ?? {}), [runnerKey]: 'PENDING' },
          log: addLog(result.log, `:: RUNNER LVL UP :: ${runnerKey.toUpperCase()} :: SPECIALIZATION AVAILABLE`),
        };
      } else {
        result = { ...result, runnerXp: { ...(result.runnerXp ?? {}), [runnerKey]: newXp } };
      }
    }

    return result;
  }

  // ── RUNNER TICK SYSTEM (s HW_OVERCLOCK) ───────────────────────────
  const hwLvl = next.upgrades.hwOverclock ?? 0;
  const hwSpeedMult = Math.pow(0.85, hwLvl);
  const hwHeatMult = 1 + hwLvl * 0.5;

  function adjCycle(base) {
    return Math.max(1, Math.round(base * hwSpeedMult));
  }

  next = runnerTick(next, 'streetRunner', 2,   adjCycle(RUNNER_SR_CYCLE), 1 * hwHeatMult);
  next = runnerTick(next, 'dataThief',    8,   adjCycle(RUNNER_DT_CYCLE), 2 * hwHeatMult);
  next = runnerTick(next, 'infiltrator',  35,  adjCycle(RUNNER_IF_CYCLE), 3 * hwHeatMult);
  next = runnerTick(next, 'fixer',        150, adjCycle(RUNNER_FX_CYCLE), 1 * hwHeatMult);
  next = runnerTick(next, 'shadowBroker', 600, adjCycle(RUNNER_SB_CYCLE), 0);

  // ── MAP PASSIVE GOLD ───────────────────────────────────────────────
  const mapPassiveGold = calculateMapModifiers(next).passiveGold;
  if (mapPassiveGold > 0) {
    const inc = applyIncome(next, mapPassiveGold);
    next = {
      ...next,
      gold: inc.gold,
      totalGoldEarned: inc.totalGoldEarned,
      runGoldEarned: inc.runGoldEarned
    };
  }

  // ── AUTO FENCER ────────────────────────────────────────────────────
  if (next.upgrades.autoFencer >= 1) {
    const fencerCd = (next.prestigePerks ?? {}).FAST_FENCE ? 15 : 30;
    const newAutoTick = (next.autoFencerTick ?? 0) + 1;

    if (newAutoTick >= fencerCd) {
      const cold = next.inventory.filter(i => !i.isHot);
      if (cold.length > 0) {
        const income = applyIncome(next, cold.reduce((sum, i) => sum + i.gold, 0));
        next = {
          ...next,
          gold: income.gold,
          totalGoldEarned: income.totalGoldEarned,
          runGoldEarned: income.runGoldEarned,
          inventory: next.inventory.filter(i => i.isHot),
          autoFencerTick: 0,
          log: addLog(next.log, `:: AUTO_FENCER :: SOLD ${cold.length} ITEM(S) :: +${income._earned.toLocaleString()} CR`)
        };
      } else {
        next = { ...next, autoFencerTick: 0 };
      }
    } else {
      next = { ...next, autoFencerTick: newAutoTick };
    }
  }

  // ── COOLDOWN TICKY ─────────────────────────────────────────────────
  if (next.darkMarketCooldown > 0) next = { ...next, darkMarketCooldown: next.darkMarketCooldown - 1 };
  if ((next.barterCooldown ?? 0) > 0) next = { ...next, barterCooldown: next.barterCooldown - 1 };

  // ── LAY LOW TIMER ──────────────────────────────────────────────────
  if (next.layLowActive) {
    const remaining = next.layLowTimer - 1;
    if (remaining <= 0) {
      next = {
        ...next,
        layLowActive: false,
        layLowTimer: 0,
        layLowCooldown: 60,
        log: addLog(next.log, ':: LAY_LOW COMPLETE :: cooldowns accelerated')
      };
    } else {
      next = { ...next, layLowTimer: remaining };
    }
  } else if (next.layLowCooldown > 0) {
    next = { ...next, layLowCooldown: next.layLowCooldown - 1 };
  }

  // ── RAID SYSTEM ────────────────────────────────────────────────────
  if (!(next.raidActive ?? false)) {
    const newNextRaid = ((next.nextRaidIn ?? randomRaidInterval()) - 1);
    if (newNextRaid <= 0) {
      const cdWasActive = (next.layLowCooldown ?? 0) > 0;
      let raidLog = addLog(next.log, `:: POLICE RAID INCOMING :: LAY LOW IN ${RAID_DURATION}s OR LOSE 30% CR`);
      if (cdWasActive) raidLog = addLog(raidLog, ':: RAID ALERT :: LAY_LOW cooldown cleared');

      next = {
        ...next,
        raidActive: true,
        raidTimer: RAID_DURATION,
        nextRaidIn: randomRaidInterval(),
        layLowCooldown: 0,
        layLowActive: false,
        layLowTimer: 0,
        log: raidLog
      };
    } else {
      next = { ...next, nextRaidIn: newNextRaid };
    }
  } else {
    const newTimer = (next.raidTimer ?? 0) - 1;
    if (newTimer <= 0) {
      const raidReduction = Math.min(0.25, calculateMapModifiers(next).raidPenaltyReduction);
      const goldLost = Math.floor(next.gold * Math.max(0.05, 0.30 - raidReduction));
      next = {
        ...next,
        raidActive: false,
        raidTimer: 0,
        nextRaidIn: randomRaidInterval(),
        gold: Math.max(0, next.gold - goldLost),
        log: addLog(next.log, `:: RAID :: CREDITS SEIZED :: -${goldLost.toLocaleString()} CR`)
      };
    } else {
      next = { ...next, raidTimer: newTimer };
    }
  }

  // ── BETRAYAL ───────────────────────────────────────────────────────
  const totalRunners = Object.values(next.runners ?? {}).reduce((sum, c) => sum + c, 0);
  if (next.heat >= 70 && totalRunners > 0) {
    const perRunnerChance = DEV_MODE ? 0.005 : 0.0005;
    if (Math.random() < totalRunners * perRunnerChance) {
      const types = Object.entries(next.runners ?? {}).filter(([, c]) => c > 0);
      let r = Math.random() * types.reduce((sum, [, c]) => sum + c, 0);
      let betrayer = types[0][0];
      for (const [type, c] of types) { r -= c; if (r <= 0) { betrayer = type; break; } }

      const goldLost = Math.floor(next.gold * 0.15);
      next = {
        ...next,
        gold: Math.max(0, next.gold - goldLost),
        heat: Math.min(100, next.heat + 20),
        log: addLog(next.log, `:: BETRAYAL :: ${RUNNER_LABELS[betrayer] ?? betrayer.toUpperCase()} sold your location :: -${goldLost.toLocaleString()} CR :: HEAT +20`),
      };
      next = applyBustedCheck(next);
      next = addZero(next, 'betrayal');
    }
  }

  // ── AI_SUBROUTINE ──────────────────────────────────────────────────
  if ((next.upgrades.aiSubroutine ?? 0) >= 1) {
    const newAiTick = (next.aiSubroutineTick ?? 0) + 1;
    if (newAiTick >= AI_SUBROUTINE_CYCLE) {
      next = {
        ...next,
        heat: Math.max(0, next.heat - 25),
        aiSubroutineTick: 0,
        log: addLog(next.log, ':: AI_SUBROUTINE :: heat suppressed :: -25 HEAT')
      };
    } else {
      next = { ...next, aiSubroutineTick: newAiTick };
    }
  }

  // ── SYSTEM SCAN ────────────────────────────────────────────────────
  if (!(next.systemScan?.active ?? false)) {
    const nextIn = ((next.systemScan?.nextIn) ?? randomScanInterval()) - 1;
    if (nextIn <= 0) {
      next = {
        ...next,
        systemScan: { active: true, timer: SCAN_DURATION, nextIn: randomScanInterval() },
        log: addLog(next.log, '!! SYSTEM_SCAN DETECTED :: PURGE LOCAL LOGS IMMEDIATELY'),
      };
    } else {
      next = { ...next, systemScan: { ...(next.systemScan ?? {}), active: false, nextIn } };
    }
  } else {
    const scanTimer = (next.systemScan.timer ?? 0) - 1;
    if (scanTimer <= 0) {
      const goldLost = Math.floor(next.gold * 0.20);
      next = {
        ...next,
        gold: Math.max(0, next.gold - goldLost),
        heat: Math.min(100, next.heat + 40),
        systemScan: { active: false, timer: 0, nextIn: randomScanInterval() },
        log: addLog(next.log, `:: SCAN COMPLETE :: TRACED :: -${goldLost.toLocaleString()} CR :: HEAT +40`),
      };
      next = applyBustedCheck(next);
    } else {
      next = { ...next, systemScan: { ...next.systemScan, timer: scanTimer } };
    }
  }

  return { ...next, lastTickTime: nowMs };
}

export function checkMissions(state) {
  if (!state.activeMissions || state.activeMissions.length === 0) return state;

  let next = { ...state };
  const now = Date.now();

  const finished = next.activeMissions.filter(m => now >= m.endTime);
  if (finished.length === 0) return next;

  finished.forEach(m => {
    const hex = AETHERIA_MAP[m.hexId];
    if (!hex) return;

    // Návrat runnera do aktívnej služby
    next.runners = { 
      ...next.runners, 
      [m.runnerType]: (next.runners[m.runnerType] || 0) + 1 
    };
   
    // Masívny XP bonus za misiu
    const currentXp = next.runnerXp[m.runnerType] || 0;
    next.runnerXp = { 
      ...next.runnerXp, 
      [m.runnerType]: Math.min(100, currentXp + 20) 
    };

    // Ak uzol ešte nevlastníme, pripíšeme odmeny + missionSplash
    if (!(next.capturedHexes || []).includes(m.hexId)) {
      const mult = hex.lootMultiplier || 1;
      const goldReward = Math.floor((Math.random() * 5000 + 5000) * mult);
      const xpReward = Math.floor(1500 * mult);

      next.gold += goldReward;
      next.xp += xpReward;

      next.capturedHexes = [...(next.capturedHexes || []), m.hexId];
      next.mapDiscovery = [...new Set([
        ...(next.mapDiscovery || []), 
        m.hexId, 
        ...(hex.connections || [])
      ])];

      // === NOVÁ SPLASH SCREEN LOGIKA ===
      next.missionSplash = {
        label: hex.label || hex.name || 'UNKNOWN_NODE',
        runnerType: m.runnerType,
        gold: goldReward,
        xp: xpReward,
        timestamp: Date.now()
      };

      const t = new Date().toLocaleTimeString('en-US', { hour12: false });

      next.log = [
        `[${t}] :: MISSION_SUCCESS :: ${hex.label} SECURED`,
        `[${t}] :: REWARD :: +${goldReward.toLocaleString()} CR | +${xpReward} XP | +20 SPEC_XP`,
        ...(next.log || [])
      ].slice(0, 50);
    }
  });

  // Odstránime dokončené misie
  next.activeMissions = next.activeMissions.filter(m => now < m.endTime);

  return next;
}

// ── SYSTEM SCAN ───────────────────────────────────────────────────────────────

export function purgeLogs(state) {
	if (!(state.systemScan?.active ?? false)) return state;
	return {
		...state,
		systemScan: { active: false, timer: 0, nextIn: randomScanInterval() },
		log: addLog(state.log, ':: LOCAL_LOGS PURGED :: SCAN EVADED'),
	};
}

export function counterHack(state) {
	if (!(state.systemScan?.active ?? false)) return state;
	if (state.stamina < 50) {
		return { ...state, log: addLog(state.log, ':: COUNTER-HACK FAILED — INSUFFICIENT STAMINA (50 REQ)') };
	}

	const newStamina = state.stamina - 50;

	// 70% šanca na kruté zlyhanie
	if (Math.random() > 0.30) {
		let next = {
			...state,
			stamina:    newStamina,
			heat:       100, // Okamžitý Bust
			systemScan: { active: false, timer: 0, nextIn: randomScanInterval() },
			log:        addLog(state.log, '!! COUNTER-HACK FAILED !! THE EYE HAS TRACED YOU !!'),
		};
		next = applyBustedCheck(next);
		// Dvojitý trest za aroganciu
		next.bustedLockout = (next.bustedLockout || 10) * 2; 
		return next;
	}

	// 30% šanca na masívny úspech
	const reward = 5000;
	const income = applyIncome(state, reward);
	return {
		...state,
		stamina:         newStamina,
		heat:            0,
		gold:            income.gold,
		totalGoldEarned: income.totalGoldEarned,
		runGoldEarned:   income.runGoldEarned,
		systemScan:      { active: false, timer: 0, nextIn: randomScanInterval() },
		log:             addLog(state.log, `:: COUNTER-HACK SUCCESS :: TRACE OVERRIDDEN :: +${income._earned.toLocaleString()} CR :: HEAT ZEROED`),
	};
}

// ── RUNNER SPECIALIZATION ─────────────────────────────────────────────────────

export function setRunnerSpec(state, runnerType, spec) {
	if (!['SHADOW', 'GREEDY'].includes(spec)) return state;
	if ((state.runnerSpec ?? {})[runnerType] !== 'PENDING') return state;
	const specLabel = spec === 'SHADOW' ? '-50% heat/cycle' : '+50% gold/cycle';
	return {
		...state,
		runnerSpec: { ...(state.runnerSpec ?? {}), [runnerType]: spec },
		log: addLog(state.log, `:: SPEC :: ${RUNNER_LABELS[runnerType] ?? runnerType.toUpperCase()} → ${spec} :: ${specLabel}`),
	};
}