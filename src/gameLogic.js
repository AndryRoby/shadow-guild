// SHADOW_GUILD — Game Logic
// Pure functions only. No React imports.

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
    // Level 2
    case 'breach':     return lvl >= 2;
    case 'stamina':    return lvl >= 2;
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

export const DISTRICTS = {
  neon_strip:   { label: 'NEON_STRIP',   lootMult: 1.0, heatDecayBase: 0.2,  unlockLevel: 1, requiresPrestige: 0, mapX: 50, mapY: 80 },
  corp_zone:    { label: 'CORP_ZONE',    lootMult: 1.5, heatDecayBase: 0.16, unlockLevel: 5, requiresPrestige: 0, mapX: 22, mapY: 44 },
  apex_citadel: { label: 'APEX_CITADEL', lootMult: 2.5, heatDecayBase: 0.1,  unlockLevel: 8, requiresPrestige: 0, mapX: 78, mapY: 42 },
  dark_net:     { label: 'DARK_NET',     lootMult: 3.5, heatDecayBase: 0.4,  unlockLevel: 8, requiresPrestige: 1, mapX: 50, mapY: 13 },
};

// ── CITY ZONES ────────────────────────────────────────────────────────────────

export const CITY_ZONES = {
	Z1: { label: 'SILENT SLUMS',   riskLevel: 1, theme: 'Start zone'        },
	Z2: { label: 'IRON WORKS',     riskLevel: 2, theme: 'Industrial'         },
	Z3: { label: 'NEON GARDENS',   riskLevel: 2, theme: 'Social/Reputation'  },
	Z4: { label: 'SILICON VALLEY', riskLevel: 3, theme: 'Tech/XP'            },
	Z5: { label: 'FINANCIAL HUB',  riskLevel: 3, theme: 'High Gold'          },
	Z6: { label: 'THE CITADEL',    riskLevel: 5, theme: 'Gov / GID HQ'       },
	Z7: { label: 'THE UNDERBELLY', riskLevel: 4, theme: 'Deep Web'           },
};

// ── CITY MAP ──────────────────────────────────────────────────────────────────
// 30 POI nodes (H00–H29) + 11 EMPTY_BLOCK buffers (E00–E10) = 41 hexes.
// Coordinate space: 900 × 1000.  Connections define the Lattice System.
// H00 is PLAYER-owned at start.  Zone 7 is reachable only via H25 → E10.

export const CITY_MAP = {

	// ── ZONE 1: SILENT SLUMS ─────────────────────────────────────────────────
	H00: {
		id: 'H00', label: 'QUANTUM_RELAY',    type: 'POI',        zoneId: 'Z1', icon: '[▲]',
		coords: { x: 200, y: 800 },
		connections: ['H01','H02','H03'],
		captureStatus: 'OWNED', faction: 'PLAYER',
		effectHooks: { heatDecayBonus: 0.05 },
	},
	H01: {
		id: 'H01', label: 'BACKUP_NODE',       type: 'POI',        zoneId: 'Z1', icon: '[▲]',
		coords: { x: 280, y: 760 },
		connections: ['H00','H03','E00','H25'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { bustThresholdBonus: 10 },
	},
	H02: {
		id: 'H02', label: 'ABANDONED_SECTOR',  type: 'POI',        zoneId: 'Z1', icon: '[⬡]',
		coords: { x: 120, y: 760 },
		connections: ['H00','H03'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { heatDecayBonus: 0.03 },
	},
	H03: {
		id: 'H03', label: 'ROOFTOP_NETWORK',   type: 'POI',        zoneId: 'Z1', icon: '[⬡]',
		coords: { x: 200, y: 720 },
		connections: ['H00','H01','H02','E01'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { goldMult: 1.03 },
	},
	H25: {
		id: 'H25', label: 'SUBWAY_NEXUS',      type: 'POI',        zoneId: 'Z1', icon: '[⬡]',
		coords: { x: 320, y: 800 },
		connections: ['H01','E00','E10'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	E00: {
		id: 'E00', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z1', icon: '[□]',
		coords: { x: 280, y: 840 },
		connections: ['H01','H25','E02'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},

	// ── ZONE 2: IRON WORKS ───────────────────────────────────────────────────
	E01: {
		id: 'E01', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z2', icon: '[□]',
		coords: { x: 160, y: 640 },
		connections: ['H03','H04','H05'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H04: {
		id: 'H04', label: 'GRID_OVERLOADER',   type: 'POI',        zoneId: 'Z2', icon: '[▲]',
		coords: { x: 80, y: 580 },
		connections: ['E01','H05','H06'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H05: {
		id: 'H05', label: 'DRONE_NEST',        type: 'POI',        zoneId: 'Z2', icon: '[✕]',
		coords: { x: 180, y: 560 },
		connections: ['E01','H04','H07'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { raidPenaltyReduction: 0.10 },
	},
	H06: {
		id: 'H06', label: 'TRAP_GRID',         type: 'POI',        zoneId: 'Z2', icon: '[✕]',
		coords: { x: 80, y: 500 },
		connections: ['H04','H07'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H07: {
		id: 'H07', label: 'CRYPTO_MINE',       type: 'POI',        zoneId: 'Z2', icon: '[◎]',
		coords: { x: 180, y: 460 },
		connections: ['H05','H06','E04'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { passiveGold: 3 },
	},

	// ── ZONE 3: NEON GARDENS ─────────────────────────────────────────────────
	E02: {
		id: 'E02', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z3', icon: '[□]',
		coords: { x: 440, y: 800 },
		connections: ['E00','H08','H09'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H08: {
		id: 'H08', label: 'AD_EXCHANGE_CORE',  type: 'POI',        zoneId: 'Z3', icon: '[◎]',
		coords: { x: 540, y: 800 },
		connections: ['E02','H09','H10'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { goldMult: 1.06 },
	},
	H09: {
		id: 'H09', label: 'IDENTITY_FORGE',    type: 'POI',        zoneId: 'Z3', icon: '[◈]',
		coords: { x: 620, y: 760 },
		connections: ['E02','H08','H10','H11','E03'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { siphonSuccessBonus: 0.05 },
	},
	H10: {
		id: 'H10', label: 'DEEPFAKE_STUDIO',   type: 'POI',        zoneId: 'Z3', icon: '[◈]',
		coords: { x: 540, y: 720 },
		connections: ['H08','H09'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { heatDecayBonus: 0.05 },
	},
	H11: {
		id: 'H11', label: 'SCANNER_DOME',      type: 'POI',        zoneId: 'Z3', icon: '[⬡]',
		coords: { x: 700, y: 800 },
		connections: ['H09'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},

	// ── ZONE 4: SILICON VALLEY ───────────────────────────────────────────────
	E03: {
		id: 'E03', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z4', icon: '[□]',
		coords: { x: 640, y: 640 },
		connections: ['H09','H12','H14'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H12: {
		id: 'H12', label: 'UPLINK_TOWER',      type: 'POI',        zoneId: 'Z4', icon: '[▲]',
		coords: { x: 740, y: 580 },
		connections: ['E03','H13','H14'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { goldMult: 1.05 },
	},
	H13: {
		id: 'H13', label: 'SIGNAL_SCRAMBLER',  type: 'POI',        zoneId: 'Z4', icon: '[▲]',
		coords: { x: 820, y: 540 },
		connections: ['H12','H14','H15'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { siphonSuccessBonus: 0.05 },
	},
	H14: {
		id: 'H14', label: 'DATA_HARBOR',       type: 'POI',        zoneId: 'Z4', icon: '[◎]',
		coords: { x: 740, y: 500 },
		connections: ['E03','H12','H13','H15','H16'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { passiveGold: 5 },
	},
	H15: {
		id: 'H15', label: 'GHOST_LAB',         type: 'POI',        zoneId: 'Z4', icon: '[◈]',
		coords: { x: 820, y: 460 },
		connections: ['H13','H14'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { heatDecayBonus: 0.08 },
	},
	H16: {
		id: 'H16', label: 'EMP_ARRAY',         type: 'POI',        zoneId: 'Z4', icon: '[✕]',
		coords: { x: 740, y: 420 },
		connections: ['H14','E06','E08'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { bustThresholdBonus: 10 },
	},

	// ── ZONE 5: FINANCIAL HUB ────────────────────────────────────────────────
	E04: {
		id: 'E04', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z5', icon: '[□]',
		coords: { x: 200, y: 400 },
		connections: ['H07','H19','E05'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	E05: {
		id: 'E05', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z5', icon: '[□]',
		coords: { x: 360, y: 420 },
		connections: ['E04','H20','E06'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	E06: {
		id: 'E06', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z5', icon: '[□]',
		coords: { x: 580, y: 400 },
		connections: ['H16','H20','E05'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H17: {
		id: 'H17', label: 'BLACK_VAULT',       type: 'POI',        zoneId: 'Z5', icon: '[◎]',
		coords: { x: 300, y: 300 },
		connections: ['H19','H18'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { passiveGold: 8 },
	},
	H18: {
		id: 'H18', label: 'DARK_AUCTION_HOUSE', type: 'POI',       zoneId: 'Z5', icon: '[◎]',
		coords: { x: 420, y: 260 },
		connections: ['H17','H20','E07'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { goldMult: 1.10 },
	},
	H19: {
		id: 'H19', label: 'HEAT_SINK_FACILITY', type: 'POI',       zoneId: 'Z5', icon: '[◈]',
		coords: { x: 220, y: 300 },
		connections: ['E04','H17','H20'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { heatDecayBonus: 0.12 },
	},
	H20: {
		id: 'H20', label: 'FIREWALL_FORTRESS', type: 'POI',        zoneId: 'Z5', icon: '[✕]',
		coords: { x: 380, y: 360 },
		connections: ['H18','H19','E05'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { bustThresholdBonus: 15 },
	},

	// ── ZONE 6: THE CITADEL ──────────────────────────────────────────────────
	// Two entry routes: Z5 → E07 → H21  and  Z4 → E08 → H24
	E07: {
		id: 'E07', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z6', icon: '[□]',
		coords: { x: 540, y: 240 },
		connections: ['H18','H21'],
		captureStatus: 'LOCKED', faction: 'GID',
		effectHooks: {},
	},
	E08: {
		id: 'E08', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z6', icon: '[□]',
		coords: { x: 740, y: 340 },
		connections: ['H16','H24'],
		captureStatus: 'LOCKED', faction: 'GID',
		effectHooks: {},
	},
	H21: {
		id: 'H21', label: 'CORPORATE_HQ',      type: 'POI',        zoneId: 'Z6', icon: '[⚠]',
		coords: { x: 660, y: 200 },
		connections: ['E07','H22','H23','H24'],
		captureStatus: 'LOCKED', faction: 'GID',
		effectHooks: { goldMult: 1.08 },
	},
	H22: {
		id: 'H22', label: 'HUNTER_KILLER_LAB', type: 'POI',        zoneId: 'Z6', icon: '[✕]',
		coords: { x: 760, y: 160 },
		connections: ['H21','H23'],
		captureStatus: 'LOCKED', faction: 'OMNIGUARD',
		effectHooks: {},
	},
	H23: {
		id: 'H23', label: 'ORBITAL_UPLINK',    type: 'POI',        zoneId: 'Z6', icon: '[⚠]',
		coords: { x: 640, y: 120 },
		connections: ['H21','H22'],
		captureStatus: 'LOCKED', faction: 'GID',
		effectHooks: { passiveGold: 12 },
	},
	H24: {
		id: 'H24', label: 'TIME_LOCK_SERVER',  type: 'POI',        zoneId: 'Z6', icon: '[⚠]',
		coords: { x: 760, y: 280 },
		connections: ['H21','E08'],
		captureStatus: 'LOCKED', faction: 'GID',
		effectHooks: { goldMult: 1.12 },
	},

	// ── ZONE 7: THE UNDERBELLY ───────────────────────────────────────────────
	// Entry: only via H25 (SUBWAY_NEXUS) → E10.  No other path in.
	E10: {
		id: 'E10', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z7', icon: '[□]',
		coords: { x: 300, y: 880 },
		connections: ['H25','H26','H27'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	E09: {
		id: 'E09', label: 'EMPTY_BLOCK',       type: 'EMPTY_BLOCK', zoneId: 'Z7', icon: '[□]',
		coords: { x: 460, y: 960 },
		connections: ['H26','H27','H28','H29'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
	H26: {
		id: 'H26', label: 'BLACK_ICE_LAB',     type: 'POI',        zoneId: 'Z7', icon: '[⚠]',
		coords: { x: 380, y: 920 },
		connections: ['E10','E09','H28'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { siphonSuccessBonus: 0.10 },
	},
	H27: {
		id: 'H27', label: 'AI_CORE_FRAGMENT',  type: 'POI',        zoneId: 'Z7', icon: '[⚠]',
		coords: { x: 300, y: 960 },
		connections: ['E10','E09','H29'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { goldMult: 1.15 },
	},
	H28: {
		id: 'H28', label: 'SURVEILLANCE_HIJACK_HUB', type: 'POI', zoneId: 'Z7', icon: '[◈]',
		coords: { x: 480, y: 900 },
		connections: ['H26','E09'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: { heatDecayBonus: 0.10 },
	},
	H29: {
		id: 'H29', label: 'ANOMALY_SITE',      type: 'POI',        zoneId: 'Z7', icon: '[⬡]',
		coords: { x: 400, y: 980 },
		connections: ['H27','E09'],
		captureStatus: 'LOCKED', faction: 'NEUTRAL',
		effectHooks: {},
	},
};

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
	const captured   = [...(state.capturedHexes ?? ['H00']), hexId];
	const discovered = [...new Set([
		...(state.mapDiscovery ?? ['H00']),
		hexId,
		...hex.connections.filter(id => CITY_MAP[id]),
	])];
	return {
		...state,
		capturedHexes: captured,
		mapDiscovery:  discovered,
		log: addLog(state.log, `:: NODE_CAPTURED :: ${hex.label} :: ${CITY_ZONES[hex.zoneId]?.label ?? hex.zoneId}`),
	};
}

// Aggregates all passive modifiers from currently owned POI hexes.
// goldMult is compound-multiplicative; all others are additive sums.
export function calculateMapModifiers(state) {
	const owned  = state.capturedHexes ?? ['H00'];
	const result = {
		heatDecayBonus:       0,
		goldMult:             1,
		passiveGold:          0,
		siphonSuccessBonus:   0,
		bustThresholdBonus:   0,
		raidPenaltyReduction: 0,
	};
	for (const id of owned) {
		const hex = CITY_MAP[id];
		if (!hex || hex.type === 'EMPTY_BLOCK') continue;
		const h = hex.effectHooks;
		if (h.heatDecayBonus)        result.heatDecayBonus        += h.heatDecayBonus;
		if (h.goldMult)              result.goldMult              *= h.goldMult;
		if (h.passiveGold)           result.passiveGold           += h.passiveGold;
		if (h.siphonSuccessBonus)    result.siphonSuccessBonus    += h.siphonSuccessBonus;
		if (h.bustThresholdBonus)    result.bustThresholdBonus    += h.bustThresholdBonus;
		if (h.raidPenaltyReduction)  result.raidPenaltyReduction  += h.raidPenaltyReduction;
	}
	return result;
}

// Returns the initial mapDiscovery array: H00 + its immediate neighbors.
export function getInitialDiscovery() {
	return ['H00', ...(CITY_MAP['H00']?.connections ?? [])];
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
  { key: 'voidDrive', label: 'VOID_DRIVE', baseCost: 500, max: 6, effect: 'Inventory +5 slots / lvl' },
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
  return 20 + (upgrades.voidDrive ?? 0) * 5; 
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
    district:            'neon_strip',
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
  let s = state;

  // ── Log batch expiry (3s) ─────────────────────────────────────────────────
  const nowMs = Date.now();
  if ((s.logBatch ?? null) && (nowMs - s.logBatch.ts) > 3000) s = { ...s, logBatch: null };

  // ── Daily challenge reset (86400 real seconds) ────────────────────────────
  const dc = s.dailyChallenge;
  if (!dc || !dc.type || (nowMs - (dc.lastReset ?? 0)) >= 86400000) {
    s = { ...s, dailyChallenge: pickNewChallenge(nowMs) };
  }

  const effectiveMaxStamina  = 100 + (s.upgrades.neuralBoost ?? 0) * 10;
  const baseRegen            = 2 + (s.upgrades.stimPack ?? 0) * 0.5;
  const protoStaminaMult     = PROTOCOL_DEFS[s.activeProtocol ?? 'NONE']?.staminaRegenMult ?? 1;
  const effectiveRegen       = (s.layLowActive ? baseRegen + 2 : baseRegen) * protoStaminaMult;
  s = { ...s, stamina: Math.min(effectiveMaxStamina, s.stamina + effectiveRegen) };

  if (s.bustedLockout > 0) {
    return { ...s, bustedLockout: s.bustedLockout - 1, lastTickTime: nowMs };
  }

  // ── Heat decay (ACTIVE TRACE) ────────
  if ((s.heatSpikeTimer ?? 0) > 0) {
    s = { ...s, heatSpikeTimer: s.heatSpikeTimer - 1 };
    if (s.layLowActive) {
      s = { ...s, heat: Math.max(0, parseFloat((s.heat - 2).toFixed(2))) };
    } else {
      // ACTIVE TRACE: Heat actively goes UP by 1.5 per second!
      s = { ...s, heat: Math.min(100, parseFloat((s.heat + 1.5).toFixed(2))) };
    }
  } else {
    const distDecayBase  = DISTRICTS[s.district]?.heatDecayBase ?? 0.2;
    const traceBonus     = (s.upgrades.traceEraser ?? 0) * 0.1;
    const corpMoleMult   = (s.intelUpgrades?.corpMole ?? 0) >= 1 ? 2 : 1;
    const mapHeatBonus   = calculateMapModifiers(s).heatDecayBonus;
    const heatDecay      = s.layLowActive ? 2 : (distDecayBase + traceBonus + mapHeatBonus) * corpMoleMult;
    s = { ...s, heat: Math.max(0, parseFloat((s.heat - heatDecay).toFixed(2))) };
  }

  // ── SURVIVE_HEAT daily challenge ──────────────────────────────────────────
  if (s.heat >= 80) s = updateDailyChallenge(s, 'SURVIVE_HEAT', s.heat);

  // ── Bounty system ─────────────────────────────────────────────────────────
  if (!(s.bountyActive ?? false) && s.heat >= 80) {
    s = { ...s, bountyActive: true,
          log: addLog(s.log, ':: BOUNTY ISSUED :: Aether-Biotech has flagged your signature') };
    s = addZero(s, 'bounty');
  } else if ((s.bountyActive ?? false) && s.heat < 40) {
    s = { ...s, bountyActive: false,
          log: addLog(s.log, ':: BOUNTY CLEARED :: signature lost') };
  }

  // Item cooldowns: 2x faster during lay_low
  const cdTick = s.layLowActive ? 2 : 1;
  s = {
    ...s,
    inventory: s.inventory.map(item => {
      if (!item.isHot) return item;
      const rem = item.cooldownRemaining - cdTick;
      return { ...item, cooldownRemaining: Math.max(0, rem), isHot: rem > 0 };
    }),
  };

  function runnerTick(cur, runnerKey, crPerCycle, cycle, heatPerCycle) {
		const count   = cur.runners[runnerKey] ?? 0;
		const newTick = (cur.runnerTick[runnerKey] ?? 0) + 1;
		if (count === 0) return { ...cur, runnerTick: { ...cur.runnerTick, [runnerKey]: newTick } };
		if (newTick < cycle) return { ...cur, runnerTick: { ...cur.runnerTick, [runnerKey]: newTick } };
		const spec         = (cur.runnerSpec ?? {})[runnerKey];
		const synergyMult  = count >= 5 ? 1.20 : 1;
		const guildMult    = (cur.prestigePerks ?? {}).GUILD_MASTER ? 1.25 : 1;
		const specGoldMult = spec === 'GREEDY' ? 1.5 : 1;
		const specHeatMult = spec === 'SHADOW' ? 0.5 : 1;
		const income = applyIncome(cur, count * crPerCycle * synergyMult * guildMult * specGoldMult);
		const stealthMult = 1 - (cur.upgrades?.runnerStealth ?? 0) * 0.25;
		const heat = DEV_MODE ? 0 : count * heatPerCycle * specHeatMult * stealthMult;
		let next = {
			...cur,
			gold:            income.gold,
			totalGoldEarned: income.totalGoldEarned,
			runGoldEarned:   income.runGoldEarned,
			heat:            Math.min(100, cur.heat + heat),
			runnerTick:      { ...cur.runnerTick, [runnerKey]: 0 },
			log: addLog(cur.log, `:: ${runnerKey.toUpperCase().replace('RUNNER','_RUNNER').replace('BROKER','_BROKER')} x${count} :: +${income._earned.toLocaleString()} CR${heat > 0 ? ` :: HEAT +${heat}` : ''}${spec && spec !== 'PENDING' ? ` [${spec}]` : ''}`),
		};
		if (!DEV_MODE) next = applyBustedCheck(next);
		// Runner XP: +1 per cycle fire (capped at 100)
		const prevXp = (cur.runnerXp ?? {})[runnerKey] ?? 0;
		if (prevXp < 100) {
			const newXp = prevXp + 1;
			if (newXp >= 100 && !((cur.runnerSpec ?? {})[runnerKey])) {
				next = {
					...next,
					runnerXp:   { ...(next.runnerXp ?? {}), [runnerKey]: 100 },
					runnerSpec: { ...(next.runnerSpec ?? {}), [runnerKey]: 'PENDING' },
					log: addLog(next.log, `:: RUNNER LVL UP :: ${RUNNER_LABELS[runnerKey] ?? runnerKey.toUpperCase()} :: SPECIALIZATION AVAILABLE`),
				};
			} else {
				next = { ...next, runnerXp: { ...(next.runnerXp ?? {}), [runnerKey]: newXp } };
			}
		}
		return next;
	}

  // HW_OVERCLOCK: each level cuts cycle by 15%, adds 50% heat per runner per cycle
  const hwLvl       = s.upgrades.hwOverclock ?? 0;
  const hwSpeedMult = Math.pow(0.85, hwLvl);   // e.g. lvl1 → 0.85x cycle time
  const hwHeatMult  = 1 + hwLvl * 0.5;          // e.g. lvl1 → 1.5x heat
  function adjCycle(base) { return Math.max(1, Math.round(base * hwSpeedMult)); }

  s = runnerTick(s, 'streetRunner', 2,   adjCycle(RUNNER_SR_CYCLE), 1   * hwHeatMult);
  s = runnerTick(s, 'dataThief',    8,   adjCycle(RUNNER_DT_CYCLE), 2   * hwHeatMult);
  s = runnerTick(s, 'infiltrator',  35,  adjCycle(RUNNER_IF_CYCLE), 3   * hwHeatMult);
  s = runnerTick(s, 'fixer',        150, adjCycle(RUNNER_FX_CYCLE), 1   * hwHeatMult);
  s = runnerTick(s, 'shadowBroker', 600, adjCycle(RUNNER_SB_CYCLE), 0);

  // ── Map passive gold ──────────────────────────────────────────────────────
  const mapPassiveGold = calculateMapModifiers(s).passiveGold;
  if (mapPassiveGold > 0) {
    const inc = applyIncome(s, mapPassiveGold);
    s = { ...s, gold: inc.gold, totalGoldEarned: inc.totalGoldEarned, runGoldEarned: inc.runGoldEarned };
  }

  if (s.upgrades.autoFencer >= 1) {
    const fencerCd    = (s.prestigePerks ?? {}).FAST_FENCE ? 15 : 30;
    const newAutoTick = (s.autoFencerTick ?? 0) + 1;
    if (newAutoTick >= fencerCd) {
      const cold = s.inventory.filter(i => !i.isHot);
      if (cold.length > 0) {
        const income = applyIncome(s, cold.reduce((sum, i) => sum + i.gold, 0));
        s = {
          ...s,
          gold:            income.gold,
          totalGoldEarned: income.totalGoldEarned,
          runGoldEarned:   income.runGoldEarned,
          inventory:       s.inventory.filter(i => i.isHot),
          autoFencerTick:  0,
          log: addLog(s.log, `:: AUTO_FENCER :: SOLD ${cold.length} ITEM(S) :: +${income._earned.toLocaleString()} CR`),
        };
      } else {
        s = { ...s, autoFencerTick: 0 };
      }
    } else {
      s = { ...s, autoFencerTick: newAutoTick };
    }
  }

  if (s.darkMarketCooldown > 0) s = { ...s, darkMarketCooldown: s.darkMarketCooldown - 1 };
  if ((s.barterCooldown ?? 0) > 0) s = { ...s, barterCooldown: s.barterCooldown - 1 };

  if (s.layLowActive) {
    const remaining = s.layLowTimer - 1;
    if (remaining <= 0) {
      s = { ...s, layLowActive: false, layLowTimer: 0, layLowCooldown: 60,
            log: addLog(s.log, ':: LAY_LOW COMPLETE :: cooldowns accelerated') };
    } else {
      s = { ...s, layLowTimer: remaining };
    }
  } else if (s.layLowCooldown > 0) {
    s = { ...s, layLowCooldown: s.layLowCooldown - 1 };
  }

  // ── Police raid countdown ─────────────────────────────────────────────────
  if (!(s.raidActive ?? false)) {
    const newNext = ((s.nextRaidIn ?? randomRaidInterval()) - 1);
    if (newNext <= 0) {
      const cdWasActive = (s.layLowCooldown ?? 0) > 0;
      let raidLog = addLog(s.log, `:: POLICE RAID INCOMING :: LAY LOW IN ${RAID_DURATION}s OR LOSE 30% CR`);
      if (cdWasActive) raidLog = addLog(raidLog, ':: RAID ALERT :: LAY_LOW cooldown cleared');
      s = {
        ...s, raidActive: true, raidTimer: RAID_DURATION, nextRaidIn: randomRaidInterval(),
        layLowCooldown: 0, layLowActive: false, layLowTimer: 0,
        log: raidLog,
      };
    } else {
      s = { ...s, nextRaidIn: newNext };
    }
  } else {
    const newTimer = (s.raidTimer ?? 0) - 1;
    if (newTimer <= 0) {
      const raidReduction = Math.min(0.25, calculateMapModifiers(s).raidPenaltyReduction);
      const goldLost      = Math.floor(s.gold * Math.max(0.05, 0.30 - raidReduction));
      s = {
        ...s, raidActive: false, raidTimer: 0, nextRaidIn: randomRaidInterval(),
        gold: Math.max(0, s.gold - goldLost),
        log: addLog(s.log, `:: RAID :: CREDITS SEIZED :: -${goldLost.toLocaleString()} CR`),
      };
    } else {
      s = { ...s, raidTimer: newTimer };
    }
  }

  // ── Betrayal (heat >= 70 + runners present) ───────────────────────────────
  const totalRunners = Object.values(s.runners).reduce((sum, c) => sum + c, 0);
  if (s.heat >= 70 && totalRunners > 0) {
    const perRunnerChance = DEV_MODE ? 0.005 : 0.0005;
    if (Math.random() < totalRunners * perRunnerChance) {
      const types = Object.entries(s.runners).filter(([, c]) => c > 0);
      let r = Math.random() * types.reduce((sum, [, c]) => sum + c, 0);
      let betrayer = types[0][0];
      for (const [type, c] of types) { r -= c; if (r <= 0) { betrayer = type; break; } }
      const goldLost = Math.floor(s.gold * 0.15);
      s = {
        ...s,
        gold: Math.max(0, s.gold - goldLost),
        heat: Math.min(100, s.heat + 20),
        log: addLog(s.log, `:: BETRAYAL :: ${RUNNER_LABELS[betrayer] ?? betrayer.toUpperCase()} sold your location :: -${goldLost.toLocaleString()} CR :: HEAT +20`),
      };
      s = applyBustedCheck(s);
      s = addZero(s, 'betrayal');
    }
  }

  // ── AI_SUBROUTINE heat suppression ────────────────────────────────────────
  if ((s.upgrades.aiSubroutine ?? 0) >= 1) {
    const newAiTick = (s.aiSubroutineTick ?? 0) + 1;
    if (newAiTick >= AI_SUBROUTINE_CYCLE) {
      s = { ...s, heat: Math.max(0, s.heat - 25), aiSubroutineTick: 0,
            log: addLog(s.log, ':: AI_SUBROUTINE :: heat suppressed :: -25 HEAT') };
    } else {
      s = { ...s, aiSubroutineTick: newAiTick };
    }
  }

  // ── System Scan countdown ─────────────────────────────────────────────────
  if (!(s.systemScan?.active ?? false)) {
		const nextIn = ((s.systemScan?.nextIn) ?? randomScanInterval()) - 1;
		if (nextIn <= 0) {
			s = {
				...s,
				systemScan: { active: true, timer: SCAN_DURATION, nextIn: randomScanInterval() },
				log: addLog(s.log, '!! SYSTEM_SCAN DETECTED :: PURGE LOCAL LOGS IMMEDIATELY'),
			};
		} else {
			s = { ...s, systemScan: { ...(s.systemScan ?? {}), active: false, nextIn } };
		}
	} else {
		const scanTimer = (s.systemScan.timer ?? 0) - 1;
		if (scanTimer <= 0) {
			const goldLost = Math.floor(s.gold * 0.20);
			s = {
				...s,
				gold:       Math.max(0, s.gold - goldLost),
				heat:       Math.min(100, s.heat + 40),
				systemScan: { active: false, timer: 0, nextIn: randomScanInterval() },
				log: addLog(s.log, `:: SCAN COMPLETE :: TRACED :: -${goldLost.toLocaleString()} CR :: HEAT +40`),
			};
			s = applyBustedCheck(s);
		} else {
			s = { ...s, systemScan: { ...s.systemScan, timer: scanTimer } };
		}
	}

  return { ...s, lastTickTime: nowMs };
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