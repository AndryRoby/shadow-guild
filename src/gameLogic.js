// SHADOW_GUILD — Game Logic
// Pure functions only. No React imports.
// CITY_MAP, zone definitions, and EFFECTS are imported from CITY_MAP.js.

import { CITY_MAP as AETHERIA_MAP, DISTRICTS as AETHERIA_DISTRICTS, DISTRICTS } from '../CITY_MAP.js';

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


// Pomocná funkcia pre čistý čas [HH:MM]
export const getTimestamp = () => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

// ── AGENT NAMES ──────────────────────────────────────────


const AGENT_NAMES = [
  // Pôvodné
  'Ghost', 'Viper', 'Neon', 'Proxy', 'Razor', 'Cipher', 'Jax', 'Nyx',
  'Echo', 'Vector', 'Zenith', 'Kestrel', 'Vex', 'Rogue', 'Bit',
  
  // Nové - Technické
  'Phantom', 'Wraith', 'Spectre', 'Shadow', 'Void', 'Shade', 'Umbra', 'Glimmer',
  'Pulse', 'Static', 'Circuit', 'Node', 'Kernel', 'Cache', 'Flux', 'Nexus',
  
  // Nové - Zvieratá
  'Raven', 'Wolf', 'Falcon', 'Hawk', 'Owl', 'Lynx', 'Panther', 'Cobra',
  'Vulture', 'Jackal', 'Phoenix', 'Dragon', 'Griffin', 'Sphinx', 'Hydra',
  
  // Nové - Mytologické
  'Odin', 'Thor', 'Loki', 'Freya', 'Athena', 'Ares', 'Hermes', 'Nemesis',
  'Hades', 'Apollo', 'Artemis', 'Orion', 'Titan', 'Erebus', 'Chronos',
  
  // Nové - Cyberpunk
  'Cyber', 'Synth', 'Neural', 'Digital', 'Quantum', 'Atomic', 'Plasma', 'Laser',
  'Nova', 'Aether', 'Helix', 'Matrix', 'Glitch', 'Crash', 'Reboot', 'Daemon',
  
  // Nové - Agresívne
  'Reaper', 'Havoc', 'Chaos', 'Mayhem', 'Fury', 'Rampage', 'Warden', 'Judge',
  'Nemesis', 'Vengeance', 'Justice', 'Talon', 'Blade', 'Steel', 'Iron', 'Titan'
];

const AGENT_SUFFIXES = [
  // Pôvodné
  '47', 'X', 'Alpha', 'Nine', 'Prime', 'Mk.II', 'Shadow',
  
  // Nové - Čísla
  '7', '11', '13', '21', '34', '42', '69', '77', '86', '99', '404', '777',
  
  // Nové - Kódové
  'Kilo', 'Romeo', 'Victor', 'Delta', 'Sigma', 'Omega', 'Gamma', 'Beta',
  'Epsilon', 'Zeta', 'Theta', 'Iota', 'Lambda', 'Mu', 'Nu', 'Xi',
  
  // Nové - Technické
  'Core', 'Pro', 'Ultra', 'Max', 'Extreme', 'X-Treme', 'Mk.III', 'Mk.IV',
  'v2.0', 'v3.0', 'NX', 'GT', 'XLS', 'Turbo', 'Nitro',
  
  // Nové - Štylizované
  'Z3R0', 'N1N3', 'F0UR', 'S1X', 'E1GHT', 'N1NE', 'T3N', 'Z3RO',
  'GH0ST', 'PH4NT0M', 'V01D', 'CH40S', 'R3B00T', 'GL1TCH',
  
  // Nové - Dvojslovné
  'Black', 'Red', 'Blue', 'Green', 'Gold', 'Silver', 'Bronze', 'Platinum',
  'Stealth', 'Viper', 'Raven', 'Wolf', 'Hawk', 'Falcon', 'Talon'
];

export function generateAgentName() {
	const name = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
	const suffix = AGENT_SUFFIXES[Math.floor(Math.random() * AGENT_SUFFIXES.length)];
	return `${name.toUpperCase()}_${suffix.toUpperCase()}`;
}

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

// ── MILESTONES — one-time toast events (QoL, not gameplay) ────────────────
// Cookie Clicker golden popup style. Pure positive reinforcement.
export const MILESTONE_DEFS = [
  { id: 'FIRST_10K',    check: s => (s.totalGoldEarned ?? 0) >= 10000,     title: 'FIRST 10K EARNED',     flavor: 'The first wire hum.' },
  { id: 'FIRST_100K',   check: s => (s.totalGoldEarned ?? 0) >= 100000,    title: '100K CR MILESTONE',    flavor: 'Shadow economy takes notice.' },
  { id: 'FIRST_1M',     check: s => (s.totalGoldEarned ?? 0) >= 1000000,   title: '1 MILLION CR',         flavor: 'The districts whisper your name.' },
  { id: 'FIRST_10M',    check: s => (s.totalGoldEarned ?? 0) >= 10000000,  title: '10 MILLION CR',        flavor: 'You are the black market.' },
  { id: 'FIRST_CAPTURE',check: s => (s.capturedHexes ?? []).length >= 2,   title: 'FIRST NODE SEIZED',    flavor: 'Territory is power.' },
  { id: 'FIVE_NODES',   check: s => (s.capturedHexes ?? []).length >= 5,   title: 'NETWORK EXPANDING',    flavor: 'Five points of presence.' },
  { id: 'TEN_NODES',    check: s => (s.capturedHexes ?? []).length >= 10,  title: 'NETWORK DOMINANT',     flavor: 'The grid answers to you.' },
  { id: 'FIRST_AGENT',  check: s => (s.agents ?? []).length >= 1,          title: 'FIRST OPERATIVE',      flavor: 'You are no longer alone.' },
  { id: 'FULL_ROSTER',  check: s => (s.agents ?? []).length >= 10,         title: 'FULL SYNDICATE',       flavor: 'An army of ghosts.' },
  { id: 'NO_BUSTED_5',  check: s => (s.level ?? 1) >= 5 && !(s.everBustedThisRun), title: 'UNTOUCHABLE RUN',  flavor: 'Level 5, zero traces.' },
  { id: 'HEAT_SURVIVOR',check: s => (s.heat ?? 0) >= 95 && !(s.everBustedThisRun), title: 'HEAT EDGE-WALKER', flavor: '95% heat. Still breathing.' },
  { id: 'FIRST_PRESTIGE', check: s => (s.prestige ?? 0) >= 1,              title: 'AWAKENED',             flavor: 'The veil thins.' },
  { id: 'MAX_COMBO',    check: s => (s.comboCount ?? 0) >= 15,             title: 'FLOW STATE',           flavor: 'Fifteen in chain. Unseen.' },
];

// Returns newly-triggered milestone IDs (for toasts).
export function checkMilestones(state) {
  const done = state.milestones ?? {};
  const newly = [];
  for (const def of MILESTONE_DEFS) {
    if (done[def.id]) continue;
    if (def.check(state)) newly.push(def);
  }
  return newly;
}

// ── PRESTIGE PERK TREE ────────────────────────────────────────────────────────

export const PRESTIGE_PERK_DEFS = [
  // ── GHOST branch (left wing, angles 220–250) ────────────────────
  { id: 'GHOST_STEP',     branch: 'GHOST',     reqLevel: 1,  cost: 1, angle: 230, ring: 1, reqs: [],                                 desc: 'Siphon stamina cost reduced from 10 to 8',           effect: 'SIPHON -2 STA' },
  { id: 'GHOST_FADE',     branch: 'GHOST',     reqLevel: 3,  cost: 2, angle: 242, ring: 2, reqs: ['GHOST_STEP'],                     desc: 'Heat decay +25% (permanent)',                        effect: 'Heat decays 25% faster' },
  { id: 'GHOST_NERVE',    branch: 'GHOST',     reqLevel: 5,  cost: 3, angle: 221, ring: 2, reqs: ['GHOST_STEP'],                     desc: 'Combo timer +2s (gives more time to chain)',         effect: 'Combo timer 6s' },
  { id: 'GHOST_AIM',      branch: 'GHOST',     reqLevel: 5,  cost: 3, angle: 248, ring: 3, reqs: ['GHOST_FADE'],                     desc: 'Siphon/Deep-Siphon success rate permanently +10%',   effect: '+10% siphon success' },
  { id: 'GHOST_PATHWAY',  branch: 'GHOST',     reqLevel: 8,  cost: 5, angle: 232, ring: 3, reqs: ['GHOST_FADE','GHOST_NERVE'],       desc: 'Captures grant 100% less heat',                      effect: 'Capture → 0 heat added' },
  { id: 'GHOST_FINAL',    branch: 'GHOST',     reqLevel: 10, cost: 8, angle: 237, ring: 4, reqs: ['GHOST_PATHWAY','GHOST_AIM'],      desc: 'Immune to Hunter captures (Silence still dangerous)', effect: 'Regular Hunter can\'t capture agents' },

  // ── OVERLORD branch (right wing, angles 110–140) ────────────────
  { id: 'GUILD_MASTER',   branch: 'OVERLORD',  reqLevel: 1,  cost: 1, angle: 130, ring: 1, reqs: [],                                 desc: 'All runners generate +25% credits per cycle',        effect: 'Runner income ×1.25' },
  { id: 'TITHE',          branch: 'OVERLORD',  reqLevel: 3,  cost: 2, angle: 118, ring: 2, reqs: ['GUILD_MASTER'],                   desc: 'Every siphon also gives +1 REP',                     effect: 'Siphon → +1 REP' },
  { id: 'FAST_FENCE',     branch: 'OVERLORD',  reqLevel: 5,  cost: 3, angle: 139, ring: 2, reqs: ['GUILD_MASTER'],                   desc: 'Auto-Fencer triggers every 15s instead of 30s',      effect: 'Auto-Fencer 2× faster' },
  { id: 'MARKET_LORD',    branch: 'OVERLORD',  reqLevel: 5,  cost: 3, angle: 112, ring: 3, reqs: ['TITHE'],                          desc: 'Item sell value +30%',                               effect: 'Items sell ×1.3' },
  { id: 'EMPIRE',         branch: 'OVERLORD',  reqLevel: 8,  cost: 5, angle: 128, ring: 3, reqs: ['TITHE','FAST_FENCE'],             desc: 'Capture rewards +50% CR',                            effect: 'Capture CR ×1.5' },
  { id: 'TYRANT',         branch: 'OVERLORD',  reqLevel: 10, cost: 8, angle: 123, ring: 4, reqs: ['EMPIRE','MARKET_LORD'],           desc: 'All income ×2 when you have 10+ agents',             effect: '10+ agents: all CR ×2' },

  // ── ARCHITECT branch (top wing, angles 340–20) ──────────────────
  { id: 'INTEL_DISCOUNT', branch: 'ARCHITECT', reqLevel: 1,  cost: 1, angle: 350, ring: 1, reqs: [],                                 desc: 'Intel upgrade REP costs reduced by 20%',             effect: 'Intel -20% REP' },
  { id: 'EYE_REVEAL',     branch: 'ARCHITECT', reqLevel: 1,  cost: 1, angle: 10,  ring: 1, reqs: [],                                 desc: 'Reveals exact countdown to next Police Raid',        effect: 'Raid timer always visible' },
  { id: 'DEEP_SCAN',      branch: 'ARCHITECT', reqLevel: 3,  cost: 2, angle: 358, ring: 2, reqs: ['INTEL_DISCOUNT'],                 desc: 'Starts each run with NET_SCANNER intel unlocked',    effect: 'Auto NET_SCANNER' },
  { id: 'PROXY_OVERLOAD', branch: 'ARCHITECT', reqLevel: 5,  cost: 3, angle: 340, ring: 2, reqs: ['INTEL_DISCOUNT'],                 desc: 'Proxy Servers give +10% bust resist each',           effect: 'Proxies +10% resist/lvl' },
  { id: 'SERVER_FARM',    branch: 'ARCHITECT', reqLevel: 5,  cost: 3, angle: 18,  ring: 2, reqs: ['EYE_REVEAL'],                     desc: 'Max bandwidth +2 at start of each run',              effect: 'Start +2 BW' },
  { id: 'CONTRACTOR',     branch: 'ARCHITECT', reqLevel: 8,  cost: 5, angle: 8,   ring: 3, reqs: ['DEEP_SCAN','SERVER_FARM'],        desc: 'Missions complete 25% faster',                       effect: 'Mission time ×0.75' },
  { id: 'MIRROR_PROTOCOL',branch: 'ARCHITECT', reqLevel: 10, cost: 8, angle: 354, ring: 4, reqs: ['CONTRACTOR','PROXY_OVERLOAD'],    desc: 'Failed missions refund 50% of deploy cost',          effect: 'Mission fail refund 50%' },

  // ── UNIVERSAL branch (outer ring 5, prestige-gated) ─────────────
  { id: 'VOID_ECHO',      branch: 'UNIVERSAL', reqLevel: 10, cost: 10, angle: 70,  ring: 5, reqs: ['TYRANT'],                        desc: 'Prestige multiplier +50% (stacks with base)',        effect: 'Prestige mult ×1.5',      requiresPrestige: 3 },
  { id: 'SECOND_WIND',    branch: 'UNIVERSAL', reqLevel: 10, cost: 10, angle: 290, ring: 5, reqs: ['GHOST_FINAL'],                   desc: 'First busted per run auto-clears in 1s',             effect: 'First busted 1s lockout', requiresPrestige: 3 },
  { id: 'ANOMALY',        branch: 'UNIVERSAL', reqLevel: 10, cost: 15, angle: 180, ring: 5, reqs: ['MIRROR_PROTOCOL','TYRANT','GHOST_FINAL'], desc: 'Unlocks ANOMALY events (random lore + bonuses)', effect: 'Anomaly events active',   requiresPrestige: 5 },
];

// Flavor text per perk — used by PerkTreeModal detail sidebar.
export const PERK_FLAVOR = {
  GHOST_STEP:     'you learned to breathe between their heartbeats.',
  GHOST_FADE:     'the air closes behind you like it never parted.',
  GHOST_NERVE:    'a longer exhale. another second before the fall.',
  GHOST_AIM:      'you do not aim. you remember where they will be.',
  GHOST_PATHWAY:  'they look where you were. you are already home.',
  GHOST_FINAL:    'hunters describe a shape. the shape describes them.',
  GUILD_MASTER:   'a thousand hands move and the coin reaches the center.',
  TITHE:          'every theft is a prayer, and prayer is counted.',
  FAST_FENCE:     'the fence no longer sleeps. the market never closes.',
  MARKET_LORD:    'worth is a rumor. you are the loudest rumor.',
  EMPIRE:         'captured does not mean lost. captured means leverage.',
  TYRANT:         'ten shadows and one throne. no one sees it but you.',
  INTEL_DISCOUNT: 'information flows downhill. you built the slope.',
  EYE_REVEAL:     'the raid is a clock. you now hold the key.',
  DEEP_SCAN:      'every run begins knowing. ignorance is a tax.',
  PROXY_OVERLOAD: 'one signal fractured into seventy. they chase echoes.',
  SERVER_FARM:    'concrete hums under the city. it hums for you.',
  CONTRACTOR:     'you do not ask. you schedule.',
  MIRROR_PROTOCOL:'the failure was a rehearsal. the refund was a lesson.',
  VOID_ECHO:      'what you lost was never subtracted. it was folded.',
  SECOND_WIND:    'the cell door opens before it closes.',
  ANOMALY:        'something is watching the watchers. it smiles at you.',
};

// ── ZERO TUTORIAL DIALOGUES ───────────────────────────────────────────────
// Diegetic onboarding via ZERO log lines. Each fires once per player install.
// Persisted in localStorage (sg_zero_dialogues_seen) so HARD_RESET doesn't replay.
// Module-level Set guard prevents double-dispatch race conditions.

const ZERO_SEEN_KEY = 'sg_zero_dialogues_seen';

function loadZeroSeen() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ZERO_SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveZeroSeen(seen) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(ZERO_SEEN_KEY, JSON.stringify(seen)); } catch {}
}

// Module-level cache — synchronously updated to prevent dispatch races.
const _ZERO_DISPATCHED = new Set(loadZeroSeen());

const TUTORIAL_DIALOGUES = [
  { id: 'first_siphon',
    trigger: (s) => (s.totalActions ?? 0) >= 1,
    line: "[ZERO >>] one. they didn't see you yet." },

  { id: 'first_combo_3',
    trigger: (s) => (s.combo ?? 0) >= 3,
    line: '[ZERO >>] hold the rhythm. predators move in patterns.' },

  { id: 'heat_rising',
    trigger: (s) => (s.heat ?? 0) >= 30,
    line: "[ZERO >>] they're scanning now. break or burn." },

  { id: 'first_busted',
    trigger: (s) => (s.bustedLockout ?? 0) > 0,
    line: '[ZERO >>] caught. it happens. learn the patterns and stop.' },

  { id: 'first_level',
    trigger: (s) => (s.level ?? 1) >= 2,
    line: "[ZERO >>] level up. they're noticing." },

  { id: 'first_lay_low',
    trigger: (s) => (s.layLowActive ?? false),
    line: '[ZERO >>] good. silence is a weapon.' },

  { id: 'first_agent',
    trigger: (s) => (s.agents?.length ?? 0) >= 1,
    line: '[ZERO >>] you brought help. trust costs more than it earns.' },

  { id: 'first_capture',
    trigger: (s) => (s.capturedHexes?.length ?? 0) >= 1,
    line: "[ZERO >>] root access. that's how empires start." },

  { id: 'capture_5',
    trigger: (s) => (s.capturedHexes?.length ?? 0) >= 5,
    line: '[ZERO >>] five nodes. the network is yours. aetheria_spire is waiting.' },

  { id: 'capture_10',
    trigger: (s) => (s.capturedHexes?.length ?? 0) >= 10,
    line: "[ZERO >>] ten. they're building a file on you. it's thick." },

  { id: 'pre_prestige',
    trigger: (s) => (s.level ?? 1) >= 8 && (s.prestige ?? 0) === 0,
    line: "[ZERO >>] you're close. awakening clears the slate. choose what you keep." },

  { id: 'first_prestige',
    trigger: (s) => (s.prestige ?? 0) >= 1,
    line: '[ZERO >>] you ascended. the eye flinched. it remembers you now.' },

  { id: 'second_prestige',
    trigger: (s) => (s.prestige ?? 0) >= 2,
    line: "[ZERO >>] twice now. you're becoming what they were afraid of." },

  { id: 'eye_awakened',
    trigger: (s) => (s.prestige ?? 0) >= 3,
    line: '[ZERO >>] the eye is awake. it sees you. the city is different now.' },
];

export function checkTutorialDialogues(state) {
  // Sync state-tracked seen into module set
  const stateSeen = state.zeroDialoguesSeen ?? [];
  for (const id of stateSeen) _ZERO_DISPATCHED.add(id);

  const newLines = [];
  for (const d of TUTORIAL_DIALOGUES) {
    if (_ZERO_DISPATCHED.has(d.id)) continue;
    if (d.trigger(state)) {
      _ZERO_DISPATCHED.add(d.id);  // sync update — second call sees it
      newLines.push(d.line);
    }
  }

  if (newLines.length === 0) {
    return { newLines: [], newSeen: stateSeen };
  }

  const newSeen = [..._ZERO_DISPATCHED];
  saveZeroSeen(newSeen);
  return { newLines, newSeen };
}

// Optional: dev-only utility to replay tutorial (called from settings or console)
export function resetZeroDialogues() {
  _ZERO_DISPATCHED.clear();
  saveZeroSeen([]);
}

export const TUTORIAL_DIALOGUE_COUNT = TUTORIAL_DIALOGUES.length;

// ── PROGRESSIVE DISCLOSURE ────────────────────────────────────────────────────

export function isUnlocked(state, feature) {
  if (DEV_MODE) return true;
  const lvl     = state.level ?? 1;
  const rep     = Math.max(state.maxReputation ?? 0, state.reputation ?? 0);
  const prestige = state.prestige ?? 0;
  const actions = state.totalActions ?? 0;
  const agents  = state.agents?.length ?? 0;
  const captured = state.capturedHexes?.length ?? 0;

  switch (feature) {
    // ── Always visible ─────────────────────────────────────────
    case 'siphon':       return true;
    case 'gold':         return true;
    case 'log':          return true;
    case 'stamina':      return true;
    case 'heat':         return true;

    // ── Tier 1: First 5-10 minutes ─────────────────────────────
    case 'combo':        return (state.siphonsWithoutBust ?? 0) >= 3;
    case 'xp':           return lvl >= 2;
    case 'breach':       return lvl >= 2;  // Dropped action gate — level alone is enough

    // ── Tier 2: 15-30 minutes ──────────────────────────────────
    case 'upgrades_tab': return lvl >= 3;
    case 'rep':          return lvl >= 3 || rep > 0;  // Show once you have any
    case 'barter':       return lvl >= 4;
    case 'agency':       return lvl >= 5;             // Dropped rep gate — too strict
    case 'runners':      return lvl >= 5;

    // ── Tier 3: 30-60 minutes ──────────────────────────────────
    case 'intel':        return lvl >= 6 && rep >= 50;
    case 'daily':        return lvl >= 6;
    case 'protocol':     return lvl >= 7;
    case 'district':     return lvl >= 7;  // Capture first unlocks earlier
    case 'manual_cool':  return lvl >= 7;
    case 'deep_siphon':  return lvl >= 8;                    // Dropped 200-action gate

    // ── Tier 4: 1-2 hours ──────────────────────────────────────
    case 'overclock':    return lvl >= 9;
    case 'mainframe':    return lvl >= 10;
    case 'ai_subroutine':return lvl >= 10;

    // ── Tier 5: Endgame / prestige-gated ───────────────────────
    case 'dark_market':  return prestige >= 1 || (lvl >= 12 && rep >= 500);
    case 'squad_system': return agents >= 6 && prestige >= 1;

    // AWAKENING tab — visible once mainframe reached OR after first prestige
    // (prestige reset → lvl 1, but player still has points to spend)
    case 'awakening_tab': return lvl >= 10 || prestige >= 1;

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
// Single source of truth: CITY_MAP.js. Re-exported here for convenience.
export { DISTRICTS } from '../CITY_MAP.js';

// ── CANONICAL HEX MAP (from CITY_MAP.js) ──────────────────────────────────────
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

// Aggregates all passive modifiers from currently owned hex effectHooks.
// effectHooks is an array of { type, value } objects (CITY_MAP.js format).
// goldMult / runner_speed are compound-multiplicative; all others additive.
export function calculateMapModifiers(state) {
  const owned = state.capturedHexes ?? [];
  
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
    // 🔥 NOVÉ MODIFIKÁTORY
    darkMarketCd:         0,    // Zníženie CD Dark Marketu (napr. -1800s)
    intelDiscount:        0,    // Zľava na Intel upgrady (napr. 0.2 = 20%)
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
        
        // 🔥 NOVÉ PRÍPADY
        case 'dark_market_cd':  result.darkMarketCd         += h.value; break;
        case 'intel_discount':  result.intelDiscount        += h.value; break;
        
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
  { key: 'corpMole',     label: 'CORP_MOLE',     repCost: 50,  max: 1, effect: 'Heat decay 2x faster' },
  { key: 'deepSource',   label: 'DEEP_SOURCE',   repCost: 100, max: 1, effect: 'Loot value +10%' },
  { key: 'darkExchange', label: 'DARK_EXCHANGE', repCost: 200, max: 1, effect: 'Dark Market cooldown -30min' },
  { key: 'serverRacks',  label: 'SOFT_BANDWIDTH', repCost: 150, max: 21, effect: '+1 Max Bandwidth (max 22 channels)' },
  { key: 'hardenedCables', label: 'HARDENED_NODES', repCost: 500, max: 5, effect: 'Node Decay -20% per level' },
  { key: 'quantumRelay', label: 'QUANTUM_LINK', repCost: 2000, max: 1, effect: 'One random node immune to Decay' },
];

// Replace existing REVEAL_DEFS in gameLogic.js with this block.
// Then update LAY_LOW reducer + tick to use getLayLowTier helper below.

export const REVEAL_DEFS = [
  // ── INTEL — information panels ───────────────────────────────────────
  {
    id:     'TIMELINE',
    label:  'TIMELINE_PROBE',
    flavor: 'Reveal incoming events. Plan ahead.',
    cost:   500,
    branch: 'INTEL',
    icon:   '◐',
  },
  {
    id:     'NORTH_STAR',
    label:  'ENDGAME_TARGET',
    flavor: 'Lock the AETHERIA_SPIRE on your HUD. See progress to ascension.',
    cost:   1500,
    branch: 'INTEL',
    icon:   '◉',
  },
  {
    id:     'INV_VALUE_HUD',
    label:  'LEDGER_HUD',
    flavor: 'Display total inventory value next to inventory header.',
    cost:   2000,
    branch: 'INTEL',
    icon:   '⌬',
  },
  {
    id:     'RECENT_GAINS',
    label:  'GAIN_INSPECTOR',
    flavor: 'Hover CR for last 60s breakdown by source.',
    cost:   3000,
    branch: 'INTEL',
    icon:   '⌖',
  },
  {
    id:     'HEAT_PREVIEW',
    label:  'HEAT_FORECAST',
    flavor: 'Show projected heat increase before each action.',
    cost:   5000,
    branch: 'INTEL',
    icon:   '◊',
  },

  // ── TWEAK — modify core mechanics ────────────────────────────────────
  {
    id:     'LAYLOW_T1',
    label:  'DEEP_BREATH',
    flavor: 'LAY_LOW 30s → 28s. Cooling +15%.',
    cost:   4000,
    branch: 'TWEAK',
    icon:   '◇',
  },
  {
    id:     'LAYLOW_T2',
    label:  'GHOST_PROTOCOL_X',
    flavor: 'LAY_LOW 28s → 24s. Cooling +50%. Requires DEEP_BREATH.',
    cost:   12000,
    branch: 'TWEAK',
    icon:   '◇',
    requires: 'LAYLOW_T1',
  },
  {
    id:     'LAYLOW_T3',
    label:  'SHADOW_DIVE',
    flavor: 'LAY_LOW 24s → 18s. Cooling +110%. Requires GHOST_PROTOCOL_X.',
    cost:   30000,
    branch: 'TWEAK',
    icon:   '◇',
    requires: 'LAYLOW_T2',
  },
  {
    id:     'BUFFER_STABILIZER',
    label:  'BUFFER_STABILIZER',
    flavor: 'Combo timer +3s. Click with rhythm, not panic.',
    cost:   25000,
    branch: 'TWEAK',
    icon:   '◈',
  },
  {
    id:     'CRIT_LENS',
    label:  'CRIT_LENS',
    flavor: 'Siphon crit chance +5%. Higher highs.',
    cost:   8000,
    branch: 'TWEAK',
    icon:   '✦',
  },

  // ── AUTO — passive helpers (NO forced-wait actions) ──────────────────
  {
    id:     'IDLE_FOCUS',
    label:  'DEEP_FOCUS',
    flavor: 'Idle focus bonus kicks in 30s sooner.',
    cost:   10000,
    branch: 'AUTO',
    icon:   '⊙',
  },
];

// ── LAY_LOW tier resolver ─────────────────────────────────────────────────
// Pure fn — looks up which tier player owns and returns mechanics.
// Used by LAY_LOW reducer to set duration + decay rate.
export function getLayLowTier(state) {
  const r = state.reveals ?? {};
  if (r.LAYLOW_T3) return { tier: 3, duration: 18, decayPerSec: 4.2, label: 'SHADOW_DIVE' };
  if (r.LAYLOW_T2) return { tier: 2, duration: 24, decayPerSec: 3.0, label: 'GHOST_PROTOCOL_X' };
  if (r.LAYLOW_T1) return { tier: 1, duration: 28, decayPerSec: 2.3, label: 'DEEP_BREATH' };
  return            { tier: 0, duration: 30, decayPerSec: 2.0, label: 'LAY_LOW' };
}

// ── Buy reveal (with require chain) ───────────────────────────────────────
export function buyReveal(state, revealId) {
  const def = REVEAL_DEFS.find(d => d.id === revealId);
  if (!def) return state;
  if ((state.reveals ?? {})[revealId]) return state;
  if (state.gold < def.cost) return state;
  if (def.requires && !(state.reveals ?? {})[def.requires]) return state;

  return {
    ...state,
    gold: state.gold - def.cost,
    reveals: { ...(state.reveals ?? {}), [revealId]: 1 },
    log: addLog(state.log, `:: REVEAL :: ${def.label} acquired.`),
  };
}

export function hasReveal(state, revealId) {
  return !!(state.reveals ?? {})[revealId];
}

// ── LORE MESSAGES ─────────────────────────────────────────────────────────────

export function getIntelUpgradeCost(upgradeKey, currentLevel) {
	const def = INTEL_UPGRADE_DEFS.find(u => u.key === upgradeKey);
	if (!def) return 0;
	
	// Pre serverRacks použijeme škálovanie, ostatné (max: 1) ostanú fixné
	if (upgradeKey === 'serverRacks') {
		return Math.floor(def.repCost * Math.pow(1.25, currentLevel));
	}
	
	return def.repCost;
}


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
	first_siphon:         "terminal active. extract what you can.",
	level_2:              "neural link stabilizing. breach protocol unlocked.",
	level_3:              "you need help. i know people.",
	level_4:              "the underground economy is open to you now.",
	level_5:              "the city is starting to notice you. switch protocols wisely.",
	level_6:              "deep channels accessible. stay off the grid.",
	level_7:              "they know you exist. they don't know what you are. keep it that way.",
  level_8:              "mainframe is exposed. one shot.",
	level_9:              "deep siphon unlocked. the real data runs deeper than you thought.",
	level_10:             "a subroutine now runs in your stead. you're scaling. the eye notices scale.",
	eye_awakened:         "it sees you. not as a ghost, not as a pattern — as a person. that's worse. be careful.",
  first_busted:         "they caught you. but you're still alive. that means something.",
	first_runner:         "you're building something. the eye doesn't like that.",
	first_prestige:       "new iteration. same city. you remember more than you should.",
	gold_10k:             "money means nothing here. rep means everything.",
	betrayal:             "someone talked. check your roster.",
	enc_key_set:          "collect all five. what they unlock will change everything.",
	bounty:               "they put a price on your head. lay low.",
	night_stalker_active: "going loud? i'll have the getaway car ready, just in case.",
  first_fail:            "traced. heat fades. try again.", // nové
  first_capture:         "first node. first step into the network.", // nové
  prestige_ready:        "you have enough. time to see behind the veil.", // nové
	quantum_drop:         "that chip... it's shifting frequencies. be careful who you sell it to.",
};

function addZero(state, key) {
  const zm = state.zeroMessages ?? [];
  if (zm.includes(key) || !ZERO[key]) return state;
  const text = ZERO[key];
  const level = ZERO_LEVELS[key] ?? 'normal';

  const history = state.zeroHistory ?? [];
  const newMessage = {
    key,
    text,
    level,
    ts: Date.now(),
    seen: false,
    id: `zero_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };

  // ZERO messages go to NEURAL_LINK panel + history.
  // Deliberately NOT pushed to state.log (would double-display in SystemLog).
  return {
    ...state,
    zeroMessages: [...zm, key],
    zeroLastMessage: newMessage,
    zeroHistory: [...history, newMessage].slice(-50),
  };
}

// Mark messages "critical" → trigger fullscreen GHOST overlay.
// Use sparingly: act transitions, deaths, prestige, ending beats.
// Everything else is 'normal' (shows in NEURAL_LINK panel only).
const ZERO_LEVELS = {
  intro_complete:  'critical',  // Act 1 opening
  first_busted:    'critical',  // first BUSTED
  level_3:         'critical',  // unlock UPGRADES — story beat
  agency_unlock:   'critical',  // first agent
  district_unlock: 'critical',  // map reveals
  prestige_ready:  'critical',  // awakening eligible
  // others default to 'normal'
};

// Hneď vedľa ZERO objektu
const CONTEXT_MSG = {
  barter:          "[CONTEXT] Use excess Data Chips to gain Reputation without risk.",
  dark_market:     "[CONTEXT] Sell all inventory instantly at 60% value. High cooldown.",
  agency:          "[CONTEXT] Hire operatives to generate passive income.",
  deep_siphon:     "[CONTEXT] High risk, high reward extraction from secure channels.",
  mainframe:       "[CONTEXT] The ultimate heist. Requires max Heat control.",
  quantum_drop:    "[CONTEXT] Quantum chips bypass standard cooldown rules.",
  overclock:       "[CONTEXT] Temporary bandwidth boost at the cost of stability.",
};

function addContext(state, key) {
  const msg = CONTEXT_MSG[key];
  if (!msg) return state;
  // Pridáme to do logu ako špeciálnu správu
  return { ...state, log: addLog(state.log, msg) };
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

  // Scale reward with level + prestige. Level 8 = ~40K CR, 500 REP.
  const lvl = state.level ?? 1;
  const prestige = state.prestige ?? 0;
  const goldReward = Math.round(500 * Math.pow(1.8, lvl - 1) * (1 + prestige * 0.5));
  const repReward  = Math.round(20 * Math.pow(1.4, lvl - 1) * (1 + prestige * 0.3));

  const income = applyIncome(state, goldReward);
  let next = {
    ...state,
    encKeys:    [],
    gold:       income.gold,
    totalGoldEarned: income.totalGoldEarned,
    runGoldEarned:   income.runGoldEarned,
    ...addRep(state, repReward),
    log: addLog(state.log, `:: DECRYPT :: ALL KEYS CONSUMED :: +${income._earned.toLocaleString()} CR :: +${repReward} REP`),
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
    ...addRep(state, repReward),
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
  // Early levels: steep ramp (1.7) to create meaningful progression
  // Mid levels: moderate (1.5) — standard idle pacing
  // Late levels: eased (1.4) — prestige-focused
  if (level <= 5)  return Math.floor(100 * Math.pow(1.7, level - 1));
  if (level <= 10) return Math.floor(xpRequired(5) * Math.pow(1.5, level - 5));
  return Math.floor(xpRequired(10) * Math.pow(1.4, level - 10));
}

export function heatStatus(heat) {
  if (heat >= 81) return 'CRITICAL';
  if (heat >= 61) return 'HOT';
  if (heat >= 31) return 'WATCHED';
  return 'CLEAR';
}

export function effectiveSuccessRate(baseRate, level, levelBonus, heat, ghostProtocol = 0, bountyActive = false, protoSuccessMod = 0) {
  const heatPenalty =
    heat >= 81 ? 0.40 :
    heat >= 61 ? 0.25 :
    heat >= 31 ? 0.10 : 0;
  const gp          = (baseRate === 0.70 || baseRate === 0.65) ? ghostProtocol * 0.02 : 0;
  const bountyPen   = bountyActive ? 0.20 : 0;
  return Math.min(0.95, Math.max(0.05, baseRate + (level - 1) * levelBonus + gp - heatPenalty - bountyPen + protoSuccessMod));
}

// ── PRIVATE HELPERS ───────────────────────────────────────────────────────────

export function addLog(log, message) {
	const d = new Date();
  const t = getTimestamp();
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

		const countStr = count > 1 ? ` x${count}` : '';
		
		// 🚨 ŠPECIÁLNY FORMÁT PRE CHLADENIE
		if (type === 'COOL_DOWN' || type === 'MANUAL_COOL') {
			return `${ts} ${icon} ${type}${countStr}${itemStr} · -${totalXp}s`;
		}

		// ŠTANDARDNÝ FORMÁT PRE SIPHON/BREACH
		const xpStr    = totalXp   > 0 ? ` · +${totalXp}XP` : '';
		const heatStr   = totalHeat > 0 ? ` · HEAT+${totalHeat}` : '';
		return `${ts} ${icon} ${type}${countStr}${itemStr}${xpStr}${heatStr}`;
	}

	// Batching logika (zostáva rovnaká, len volá upravený buildEntry)
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
		logBatch: { type, ts: now, count: 1, items: newItems, xp: xp, heat: heat, hasCrit: critical, entry: newEntry },
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

// Helper: increment both global heat and current district's local heat
function addHeatLocal(state, amount) {
  const did = state.district;
  const dh = { ...(state.districtHeat ?? {}) };
  dh[did] = Math.min(100, (dh[did] ?? 0) + amount);
  return {
    heat: Math.min(100, (state.heat ?? 0) + amount),
    districtHeat: dh,
  };
}

function applyBustedCheck(state) {
  if ((state.heat ?? 0) < 100) return state;

  // === RESIST LOGIC ===
  const mapBustBonus = calculateMapModifiers(state).bustThresholdBonus;

  const resistChance = Math.min(
    0.80,
    (state.upgrades?.proxyServers ?? 0) * 0.10 +
    (state.prestigePerks?.PROXY_OVERLOAD ? 0.20 : 0) +
    (mapBustBonus * 0.01)
  );

  if (Math.random() < resistChance) {
    return {
      ...state,
      heat: 80,
      log: addLog(
        state.log,
        `:: PROXY_REBOUND :: Signature ghosted. Heat cooled to 80%. (${Math.round(resistChance * 100)}% resist)`
      ),
    };
  }

  // === ORIGINAL BUSTED LOGIC ===
  const iceBreakerLvl = state.upgrades?.iceBreaker ?? 0;
  const lockout = Math.max(1, 10 - iceBreakerLvl);

  const hasQE = (state.upgrades?.quantumEncryption ?? 0) >= 1;

  const savedInventory =
    hasQE && state.inventory.length > 0
      ? (() => {
          const shuffled = [...state.inventory].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, Math.max(1, Math.floor(state.inventory.length * 0.2)));
        })()
      : [];

  const invMsg =
    hasQE && savedInventory.length > 0
      ? `:: ${savedInventory.length} ITEM(S) ENCRYPTED — RECOVERED`
      : ':: INVENTORY LOST';

  let next = {
    ...state,
    heat: 0,
    inventory: savedInventory,
    layLowActive: false,
    layLowTimer: 0,
    comboCount: 0,
    heatSpikeTimer: 0,
    peakGold: 0,
    milestones: {},
    milestoneToastQueue: [],
    sessionStartTime: Date.now(),
    totalPlayTime: 0,
    runPlayTime: 0,
    bountyActive: false,
    bustedLockout: lockout,
    siphonsWithoutBust: 0,
    everBustedThisRun: true,
    feedback: { type: 'BUSTED', ts: Date.now() },
    log: addLog(state.log, `:: [BUSTED] ${MSG.busted()} ${invMsg} :: ${lockout}s LOCKOUT`),
  };

  next = addZero(next, 'first_busted');
  return next;
}

// Adds reputation and keeps maxReputation in sync.
function addRep(state, amount) {
  const newRep = (state.reputation ?? 0) + amount;
  return {
    reputation:    newRep,
    maxReputation: Math.max(state.maxReputation ?? 0, newRep),
  };
}

// ── LEVEL UP ──────────────────────────────────────────────────────────────────
// Each level may unlock features. We push:
//   1× toast (state-changing event, persistent visible)
//   1× log line (summary, not 4 separate hints)
//   1× ZERO line (queued, rate-limited via zeroQueue)
// Consolidated from earlier 5-lines-per-level spam.

const LEVEL_UNLOCKS = {
  2:  { tag: 'BREACH',         summary: 'BREACH protocol online',           contexts: ['breach'] },
  3:  { tag: 'UPGRADES + REP', summary: 'UPGRADES tab + Reputation system', contexts: ['upgrades_tab'] },
  4:  { tag: 'BARTER + INTEL', summary: 'BARTER trading + Intel upgrades',   contexts: ['barter', 'intel'] },
  5:  { tag: 'AGENCY',         summary: 'AGENCY recruiting active',          contexts: ['agency', 'runners'] },
  6:  { tag: 'DAILIES',        summary: 'Daily contracts + Deep channels',   contexts: ['daily'] },
  7:  { tag: 'PROTOCOLS',      summary: 'Operation protocols + Overclock',   contexts: ['protocol', 'overclock'] },
  8:  { tag: 'DISTRICTS',      summary: 'District map unlocked',             contexts: ['district'] },
  9:  { tag: 'DEEP_SIPHON',    summary: 'Deep siphon protocol ready',        contexts: ['deep_siphon'] },
  10: { tag: 'AI_SUBROUTINE',  summary: 'AI subroutine + manual cooling',    contexts: ['ai_subroutine', 'manual_cool'] },
  12: { tag: 'DARK_MARKET',    summary: 'Dark market access granted',        contexts: ['dark_market'] },
};

export function checkLevelUp(state) {
  const needed = xpRequired(state.level);
  if (state.xp < needed) return state;

  const newLevel = state.level + 1;
  let next = {
    ...state,
    level: newLevel,
    xp:    state.xp - needed,
  };

  // ZERO dialogue (queued separately, rate-limited)
  next = addZero(next, `level_${newLevel}`);

  const unlock = LEVEL_UNLOCKS[newLevel];
  if (unlock) {
    // Push toast — visible persistent state-change notification
    const toastQueue = [...(next.milestoneToastQueue ?? [])];
    toastQueue.push({
      id:     `LEVEL_${newLevel}`,
      title:  `LEVEL ${newLevel} // ${unlock.tag}`,
      flavor: unlock.summary,
      ts:     Date.now(),
    });

    // Single consolidated log line
    next = {
      ...next,
      milestoneToastQueue: toastQueue,
      log: addLog(next.log, `:: LEVEL ${newLevel} :: ${unlock.summary}`),
    };

    // Apply CONTEXT messages (legacy info — kept but not added to log)
    for (const ctxKey of (unlock.contexts ?? [])) {
      const ctx = state.contextSeen ?? [];
      if (!ctx.includes(ctxKey) && CONTEXT_MSG[ctxKey]) {
        next = { ...next, contextSeen: [...ctx, ctxKey] };
      }
    }
  } else {
    // No special unlock — just a quiet level up log
    next = { ...next, log: addLog(next.log, `:: LEVEL ${newLevel}`) };
  }

  // Achievements that fire on level up
  if (newLevel === 5 && !(next.everBustedThisRun ?? false)) {
    next = checkAchievement(next, 'UNTOUCHABLE');
  }

  // Level 7 random event preserved (gameplay-meaningful, not noise)
  if (newLevel === 7) {
    if (Math.random() > 0.5) {
      const bonus = 2000;
      next = {
        ...next,
        gold: next.gold + bonus,
        log: addLog(next.log, `:: SIGNAL_WINDFALL :: +${bonus} CR transferred from anonymous source.`),
      };
    } else {
      next = {
        ...next,
        heat: Math.min(100, next.heat + 15),
        log: addLog(next.log, ':: HEAT_SPIKE :: THE EYE is watching. Heat +15.'),
      };
    }
  }

  return next;
}

const IDLE_EFFICIENCY = 0.6;

// ── THE EYE AWAKENING ────────────────────────────────────────────────────
// Grandmapocalypse-style shift. Triggers at prestige 3 OR 10M+ total gold.
// Makes the game DARKER — new events, ambient, ZERO tone shifts.
export function isEyeAwakened(state) {
  if ((state.prestige ?? 0) >= 3) return true;
  if ((state.totalGoldEarned ?? 0) >= 10_000_000) return true;
  if (state.eyeAwakenedManual) return true;
  return false;
}

// ─── HUNTER SYSTEM (H4.5-H4.8) ─────────────────────────────────────────────
// Progress bar builds up when heat > 85. Hunter spawns at 60.
// Counter: LAY LOW below 60 heat clears. Silence (lvl 10+) invisible without NET_SCANNER.
function updateHunterSystem(next) {
  const heat = next.heat ?? 0;
  const lvl = next.level ?? 1;

  // LAY LOW counter
  if (next.hunterActive && next.layLowActive && heat < 60) {
    return {
      ...next,
      hunterActive: false,
      hunterProgress: 0,
      hunterLocation: null,
      silenceActive: false,
      log: addLog(next.log, ':: HUNTER_LOST :: Signal scrambled. They lost you.'),
    };
  }

  // Build progress if heat high
  if (heat > 85 && !next.hunterActive) {
    let progress = (next.hunterProgress ?? 0) + 1;
    if (progress >= 60) {
      // Hunter spawn
      const isSilence = lvl >= 10 && Math.random() < 0.25;
      return {
        ...next,
        hunterActive: true,
        hunterProgress: 60,
        hunterLocation: next.district,
        silenceActive: isSilence,
        log: addLog(next.log,
          isSilence
            ? ':: [!!!] SILENCE :: Named hunter deployed. No visible trace without NET_SCANNER.'
            : `:: [!] HUNTER_DEPLOYED :: Heat signature locked to ${next.district}.`
        ),
      };
    }
    return { ...next, hunterProgress: progress };
  }

  // Decay progress when heat low
  if (heat < 50 && (next.hunterProgress ?? 0) > 0 && !next.hunterActive) {
    return { ...next, hunterProgress: Math.max(0, (next.hunterProgress ?? 0) - 1) };
  }

  // Active hunter random agent capture events (every ~30s)
  if (next.hunterActive && Math.random() < 0.033) {
    const hunterDistrict = next.hunterLocation;
    const victims = (next.activeMissions ?? [])
      .filter(m => {
        const hex = (typeof AETHERIA_MAP !== 'undefined') ? AETHERIA_MAP[m.hexId] : null;
        return hex && hex.districtId === hunterDistrict;
      });
    if (victims.length > 0 && Math.random() < 0.25) {
      const victim = victims[Math.floor(Math.random() * victims.length)];
      const agent = (next.agents || []).find(a => a.id === victim.agentId);
      if (agent) {
        const hunterName = next.silenceActive ? 'SILENCE' : 'HUNTER';
        return {
          ...next,
          agents: next.agents.map(a =>
            a.id === victim.agentId ? { ...a, status: 'CAPTURED', fatigue: 100, stress: 100 } : a
          ),
          activeMissions: next.activeMissions.filter(m => m.agentId !== victim.agentId),
          log: addLog(next.log, `[!!!] ${hunterName} :: ${agent.name} captured at ${victim.hexId}!`),
        };
      }
    }
  }

  return next;
}

export function applyIncome(state, amount) {
  const idleMult = state.isIdle ? IDLE_EFFICIENCY : 1.0;
  const mult   = state.prestigeMultiplier ?? 1;
  const earned = Math.round(amount * mult);
  const newGold = state.gold + earned;
  const peakGold = Math.max(state.peakGold ?? 0, newGold);
  return {
    gold:            newGold,
    peakGold,
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
  if (def.reward.rep) s = { ...s, ...addRep(s, def.reward.rep) };
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
// ── COMBO STATE MACHINE ──────────────────────────────────────────────────
// Replaces simple comboMult with 3-state push-your-luck system.
//   STEALTH    (combo 0–5)   — 1.0–1.2x reward,  +0 heat penalty
//   AGGRESSIVE (combo 6–15)  — 1.5–2.0x reward,  +0.5 heat per click
//   BURNING    (combo 16+)   — 3.0x reward,      +2.0 heat per click → BUST risk
//
// Anti-autoclicker: continuous clicking enters BURNING within ~16 actions and
// flushes heat to 100 within 10 more actions → BUSTED. The optimal strategy is
// to push to BURNING for big rewards, then STOP and let combo timer expire.
//
// Pure derivation — does not mutate state. Returns { state, mult, heatPenalty,
// nextCombo, isCritical, finalGold }.
export function getComboState(comboCount) {
  if (comboCount >= 16) return 'BURNING';
  if (comboCount >= 6)  return 'AGGRESSIVE';
  return 'STEALTH';
}

export function getComboMult(comboCount) {
  if (comboCount >= 16) return 3.0;
  if (comboCount >= 6)  return 1.5 + Math.min((comboCount - 6) * 0.05, 0.5); // 1.5 → 2.0
  return 1.0 + Math.min(comboCount * 0.04, 0.20);                              // 1.0 → 1.2
}

export function getComboHeatPenalty(comboCount) {
  if (comboCount >= 16) return 2.0;
  if (comboCount >= 6)  return 0.5;
  return 0;
}

function applyComboAndCrit(rawItem, state) {
  const comboCount = state.comboCount ?? 0;
  const comboMult  = getComboMult(comboCount);
  const critBonus     = state.reveals?.CRIT_LENS ? 0.05 : 0;
  const mapCritBonus  = calculateMapModifiers(state).critChanceBonus ?? 0;
  const isCritical    = Math.random() < (0.05 + critBonus + mapCritBonus);
  const finalGold     = isCritical
    ? Math.round(rawItem.gold * comboMult * 10)
    : Math.round(rawItem.gold * comboMult);
  // Crit gives +5 to combo. Otherwise +1. Caps at 30 (no infinite scaling).
  const nextCombo = Math.min(30, comboCount + (isCritical ? 5 : 1));
  return { item: { ...rawItem, gold: finalGold }, isCritical, newCombo: nextCombo };
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

	const distMult = DISTRICTS[state.district]?.lootMultiplier ?? 1;
	// Rookie buff: first 5 levels of first run get half heat per action
	const rookieHeatMult = ((state.prestige ?? 0) === 0 && (state.level ?? 1) < 1) ? 0.5 : 1.0;
	const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1) * rookieHeatMult;
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

    // Vytvoríme fail stav priamo tu, bez 'next'
    let failState = {
        ...state,
        stamina:    newStamina,
        ...addHeatLocal(state, heatFail),
        comboCount: 0,
        comboTimer: 0,                                             // ← NOVÉ
        comboShatterKey: (state.comboShatterKey ?? 0) + ((state.comboCount ?? 0) > 0 ? 1 : 0),  // ← NOVÉ
        lastLogTier: 'fail',                                       // ← NOVÉ
        logBatch:   null,
        feedback:   { type: 'FAIL', ts: Date.now() },
        log:        nextLog,
    };

    // NOVÉ: First Fail Trigger (opravené)
    if (!failState.everFailedThisRun) {
         failState = { ...failState, everFailedThisRun: true };
         failState = addZero(failState, 'first_fail');
    }

    return applyBustedCheck(failState);
  }

	const loot         = getRandomLoot(STANDARD_LOOT);
	const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
	const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
	const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
	const heatOk       = Math.round(5 * heatMult * protoHeatMult * prefixHeatMult + getComboHeatPenalty(state.comboCount ?? 0));
	
	// 🔥 UNIVERZÁLNY XP VÝPOČET 🔥
	const distXpMult   = DISTRICTS[state.district]?.xpMultiplier ?? 1;
	const mapXpBonus   = calculateMapModifiers(state).xpBoost ?? 0;
	const upgradeXpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
	const totalXpMult  = upgradeXpBonus * (1 + mapXpBonus);
	const finalXp      = Math.round(loot.xp * distXpMult * protoXpMult * prefixXpMult * totalXpMult);

	const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
	const protoRawItem = protoCreditMult !== 1
		? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
		: rawItem;
	const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

	const ar = addActionLog(state, 'SIPHON', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

	let next = checkLevelUp({
		...state,
		stamina:            newStamina,
		...addHeatLocal(state, heatOk),
		xp:                 state.xp + finalXp,
		...addRep(state, state.prestigePerks?.TITHE ? 2 : 1),
		comboCount:         newCombo,
    comboTimer:         state.prestigePerks?.GHOST_NERVE ? 6000 : 4000,  // GHOST_NERVE perk
    totalActions: (state.totalActions ?? 0) + 1,
    lastLogTier:        'success',     // ← NOVÉ
		heatSpikeTimer:     isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
		siphonsWithoutBust: (state.siphonsWithoutBust ?? 0) + 1,
		inventory:          [...state.inventory, item],
		feedback:           { type: 'SUCCESS', gold: item.gold, item: rawItem.id, critical: isCritical, ts: Date.now() },
		log:                ar.log,
		logBatch:           ar.logBatch,
	});
	next = applyBustedCheck(next);

	if (state.siphonsWithoutBust === 0) { // Prvý úspešný siphon
    next = addZero(next, 'first_siphon');
  }

	if (rawItem.isQuantum) next = addZero(next, 'quantum_drop');
	if (next.gold >= 10000) next = addZero(next, 'gold_10k');
	next = updateDailyChallenge(next, 'SIPHON_COUNT', 1);
	next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
	next = tryDropEncKey(next);
	if ((next.siphonsWithoutBust ?? 0) >= 50) next = checkAchievement(next, 'GHOST');
	if (isCritical)  next = checkAchievement(next, 'FIRST_BLOOD');
	if (newCombo >= 15) next = checkAchievement(next, 'COMBO_KING');
	if (next.inventory.length >= getMaxInventory(next.upgrades)) next = checkAchievement(next, 'DATA_HOARDER');

  // --- NOVÉ: First Siphon Trigger ---
    // Sputí sa len pri prvom ÚSPEŠNOM siphone
  if (next.siphonsWithoutBust === 1) {
    next = addZero(next, 'first_siphon');
  }

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

	const distMult = DISTRICTS[state.district]?.lootMultiplier ?? 1;
	// Rookie buff: first 5 levels of first run get half heat per action
	const rookieHeatMult = ((state.prestige ?? 0) === 0 && (state.level ?? 1) < 1) ? 0.5 : 1.0;
	const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1) * rookieHeatMult;
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
			...addHeatLocal(state, heatFail),
			comboCount: 0,
      comboTimer: 0,                                             // ← NOVÉ
      comboShatterKey: (state.comboShatterKey ?? 0) + ((state.comboCount ?? 0) > 0 ? 1 : 0),  // ← NOVÉ
      lastLogTier: 'fail',                                       // ← NOVÉ
			logBatch:   null,
			feedback:   { type: 'FAIL', ts: Date.now() },
			log:        nextLog,
		});
	}

	const loot         = getRandomLoot(PREMIUM_LOOT);
	const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
	const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
	const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
	const heatOk       = Math.round(15 * heatMult * protoHeatMult * prefixHeatMult + getComboHeatPenalty(state.comboCount ?? 0));
	
	// 🔥 UNIVERZÁLNY XP VÝPOČET 🔥
	const distXpMult   = DISTRICTS[state.district]?.xpMultiplier ?? 1;
	const mapXpBonus   = calculateMapModifiers(state).xpBoost ?? 0;
	const upgradeXpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
	const totalXpMult  = upgradeXpBonus * (1 + mapXpBonus);
	const finalXp      = Math.round(loot.xp * distXpMult * protoXpMult * prefixXpMult * totalXpMult);

	const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
	const protoRawItem = protoCreditMult !== 1
		? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
		: rawItem;
	const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

	const ar = addActionLog(state, 'BREACH', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

	let next = checkLevelUp({
		...state,
		stamina:        newStamina,
		...addHeatLocal(state, heatOk),
		xp:             state.xp + finalXp,
		...addRep(state, 3),
		comboCount:     newCombo,
    comboTimer:         state.prestigePerks?.GHOST_NERVE ? 6000 : 4000,  // GHOST_NERVE perk
    totalActions: (state.totalActions ?? 0) + 1,
    lastLogTier:        'success',     // ← NOVÉ
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

	const distMult = DISTRICTS[state.district]?.lootMultiplier ?? 1;
	// Rookie buff: first 5 levels of first run get half heat per action
	const rookieHeatMult = ((state.prestige ?? 0) === 0 && (state.level ?? 1) < 1) ? 0.5 : 1.0;
	const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1) * rookieHeatMult;
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
			...addHeatLocal(state, heatFail),
			comboCount: 0,
      comboTimer: 0,                                             // ← NOVÉ
      comboShatterKey: (state.comboShatterKey ?? 0) + ((state.comboCount ?? 0) > 0 ? 1 : 0),  // ← NOVÉ
      lastLogTier: 'fail',                                       // ← NOVÉ
			logBatch:   null,
			feedback:   { type: 'FAIL', ts: Date.now() },
			log:        nextLog,
		});
	}

	const loot         = getRandomLoot(DEEP_SIPHON_LOOT);
	const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
	const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
	const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
	const heatOk       = Math.round(8 * heatMult * protoHeatMult * prefixHeatMult + getComboHeatPenalty(state.comboCount ?? 0));
	
	// 🔥 UNIVERZÁLNY XP VÝPOČET 🔥
	const distXpMult   = DISTRICTS[state.district]?.xpMultiplier ?? 1;
	const mapXpBonus   = calculateMapModifiers(state).xpBoost ?? 0;
	const upgradeXpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
	const totalXpMult  = upgradeXpBonus * (1 + mapXpBonus);
	const finalXp      = Math.round(loot.xp * distXpMult * protoXpMult * prefixXpMult * totalXpMult);

	const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
	const protoRawItem = protoCreditMult !== 1
		? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
		: rawItem;
	const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

	const ar = addActionLog(state, 'DEEP_SIPHON', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

	let next = checkLevelUp({
		...state,
		stamina:        newStamina,
		...addHeatLocal(state, heatOk),
		xp:             state.xp + finalXp,
		...addRep(state, 2),
		comboCount:     newCombo,
    comboTimer:         state.prestigePerks?.GHOST_NERVE ? 6000 : 4000,  // GHOST_NERVE perk
    totalActions: (state.totalActions ?? 0) + 1,
    lastLogTier:        'success',     // ← NOVÉ
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

	const distMult = DISTRICTS[state.district]?.lootMultiplier ?? 1;
	// Rookie buff: first 5 levels of first run get half heat per action
	const rookieHeatMult = ((state.prestige ?? 0) === 0 && (state.level ?? 1) < 1) ? 0.5 : 1.0;
	const heatMult        = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1) * rookieHeatMult;
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
			...addHeatLocal(state, heatFail),
			comboCount: 0,
      comboTimer: 0,                                             // ← NOVÉ
      comboShatterKey: (state.comboShatterKey ?? 0) + ((state.comboCount ?? 0) > 0 ? 1 : 0),  // ← NOVÉ
      lastLogTier: 'fail',                                       // ← NOVÉ
			logBatch:   null,
			feedback:   { type: 'FAIL', ts: Date.now() },
			log:        nextLog,
		});
	}

	const loot         = getRandomLoot(VAULT_LOOT);
	const rawItem      = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
	const prefixHeatMult = rawItem.prefixHeatMult ?? 1;
	const prefixXpMult   = rawItem.prefixXpMult   ?? 1;
	const heatOk       = Math.round(25 * heatMult * protoHeatMult * prefixHeatMult + getComboHeatPenalty(state.comboCount ?? 0));
	
	// 🔥 UNIVERZÁLNY XP VÝPOČET 🔥
	const distXpMult   = DISTRICTS[state.district]?.xpMultiplier ?? 1;
	const mapXpBonus   = calculateMapModifiers(state).xpBoost ?? 0;
	const upgradeXpBonus = 1 + (state.upgrades?.xpBoost ?? 0) * 0.20;
	const totalXpMult  = upgradeXpBonus * (1 + mapXpBonus);
	const finalXp      = Math.round(loot.xp * distXpMult * protoXpMult * prefixXpMult * totalXpMult);

	const isHighValue  = HIGH_VALUE_IDS.has(loot.id);
	const protoRawItem = protoCreditMult !== 1
		? { ...rawItem, gold: Math.round(rawItem.gold * protoCreditMult) }
		: rawItem;
	const { item, isCritical, newCombo } = applyComboAndCrit(protoRawItem, state);

	const ar = addActionLog(state, 'MAINFRAME', { item: rawItem.id, xp: finalXp, heat: heatOk, critical: isCritical });

	let next = checkLevelUp({
		...state,
		stamina:        newStamina,
		...addHeatLocal(state, heatOk),
		xp:             state.xp + finalXp,
		...addRep(state, 8),
		comboCount:     newCombo,
    comboTimer:         state.prestigePerks?.GHOST_NERVE ? 6000 : 4000,  // GHOST_NERVE perk
    totalActions: (state.totalActions ?? 0) + 1,
    lastLogTier:        'success',     // ← NOVÉ
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
  if (state.bustedLockout > 0) return state;
  if (state.layLowActive) return state;
  // During an active raid, bypass the cooldown so the player can always respond
  if (state.layLowCooldown > 0 && !(state.raidActive ?? false)) return state;

  const t = getLayLowTier(state);
  let log = addLog(state.log, `:: ${t.label} :: COOLING ENGAGED · ${t.duration}s`);
  
  let extra = {};
  if (state.raidActive) {
    log = addLog(log, ':: RAID EVADED :: LAY LOW successful');
    extra = { raidActive: false, raidTimer: 0, nextRaidIn: randomRaidInterval() };
  }

  return { 
    ...state, 
    ...extra, 
    layLowActive: true, 
    layLowTimer: t.duration, // Dynamický timer namiesto hardcoded 30
    layLowCooldown: 60,      // Cooldown sa nastavuje tu pri aktivácii
    log 
  };
}

export function sellCooledItems(state) {
  const cold = state.inventory.filter(i => !i.isHot);
  if (cold.length === 0) {
    return { ...state, log: addLog(state.log, ':: SELL FAILED — NO COOLED ITEMS IN INVENTORY') };
  }
  const marketLordMult = state.prestigePerks?.MARKET_LORD ? 1.3 : 1;
  const raw = Math.round(cold.reduce((sum, i) => sum + i.gold, 0) * marketLordMult);
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

export function sellSingleItem(state, instanceId) {
  const item = state.inventory.find(i => i.instanceId === instanceId);
  if (!item) return state;
  if (item.isHot) {
      return { ...state, log: addLog(state.log, `:: SELL FAILED — ${item.id} STILL HOT`) };
  }

  const marketLordMult = state.prestigePerks?.MARKET_LORD ? 1.3 : 1;
  const adjusted = Math.round(item.gold * marketLordMult);
  const income = applyIncome(state, adjusted);
  let next = {
      ...state,
      gold:            income.gold,
      totalGoldEarned: income.totalGoldEarned,
      runGoldEarned:   income.runGoldEarned,
      inventory:       state.inventory.filter(i => i.instanceId !== instanceId),
      log: addLog(state.log, `:: SOLD :: ${item.id} :: +${income._earned.toLocaleString()} CR`),
  };
  next = updateDailyChallenge(next, 'SELL_VALUE', income._earned);
  return next;
}

export function manualCool(state, action) {
	const hotItems = state.inventory.filter(i => i.isHot);
	if (hotItems.length === 0) return state;

	// 1. Identifikácia cieľa (Priorita: targetId z kliknutia -> inak najhorúcejší)
	const targetId = action?.targetId;
	const target = targetId 
		? hotItems.find(i => i.instanceId === targetId)
		: hotItems.reduce((a, b) => a.cooldownRemaining > b.cooldownRemaining ? a : b);

	if (!target) return state;

	// 2. Kontrola Staminy
	if (state.stamina < 5) {
		const d = new Date();
		const ts = `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}]`;
		return { 
			...state, 
			log: [`${ts} !! ERROR :: INSUFFICIENT_STAMINA`, ...state.log].slice(0, 50) 
		};
	}

	// 3. Proces schladenia v inventári
	const newInventory = state.inventory.map(item => {
		if (item.instanceId !== target.instanceId) return item;
		const rem = Math.max(0, item.cooldownRemaining - 15);
		return { ...item, cooldownRemaining: rem, isHot: rem > 0 };
	});

	// 4. Batchované logovanie cez systém
	// Posielame 15 ako "xp", addActionLog to vďaka typu COOL_DOWN vypíše ako sekundy
	const logUpdate = addActionLog(state, 'COOL_DOWN', { 
		item: target.id, 
		xp: 15 
	});

	return {
		...state,
		stamina: state.stamina - 5,
		inventory: newInventory,
		...logUpdate // Prepíše log a logBatch
	};
}

export function darkMarket(state) {
  const unlocked = isUnlocked(state, 'dark_market');
  if (!unlocked) return state;
  if (state.darkMarketCooldown > 0) return state;
  if (state.inventory.length === 0) {
    return { ...state, log: addLog(state.log, ':: DARK_MARKET — NO ITEMS TO SELL') };
  }
  
  // 🔥 ZÍSKAME BONUS Z MAPY
  const mapMods = calculateMapModifiers(state);
  const nodeBonus = mapMods.darkMarketCd || 0; // Očakávame -1800
  
  // 🔥 INTEL UPGRADE BONUS
  const intelBonus = ((state.intelUpgrades?.darkExchange ?? 0) >= 1) ? 1800 : 0;
  
  // 🔥 ZÁKLADNÝ COOLDOWN (2 hodiny = 7200 sekúnd)
  const BASE_CD = 7200;
  
  // 🔥 VÝPOČET: základ + nodeBonus (negatívny) - intelBonus
  let newCooldown = BASE_CD + nodeBonus - intelBonus;
  newCooldown = Math.max(0, newCooldown);
  
  console.log('DARK_MARKET DEBUG:', {
    BASE_CD,
    nodeBonus,
    intelBonus,
    newCooldown,
    newCooldownHours: Math.floor(newCooldown / 3600),
    newCooldownMinutes: Math.floor((newCooldown % 3600) / 60)
  });
  
  const raw = Math.floor(state.inventory.reduce((sum, i) => sum + i.gold, 0) * 0.6);
  const income = applyIncome(state, raw);
  
  let next = {
    ...state,
    gold: income.gold,
    totalGoldEarned: income.totalGoldEarned,
    runGoldEarned: income.runGoldEarned,
    inventory: [],
    darkMarketCooldown: newCooldown,
    log: addLog(state.log, `:: DARK_MARKET :: ALL SOLD (60%) :: +${income._earned.toLocaleString()} CR :: CD ${Math.floor(newCooldown / 3600)}h ${Math.floor((newCooldown % 3600) / 60)}m`),
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
    ...addRep(state, state.prestigePerks?.TITHE ? 2 : 1),
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
  
  // Získame dynamickú cenu (pre serverRacks škálovanú, pre ostatné fixnú)
  const baseCost = getIntelUpgradeCost(upgradeKey, currentLevel);
  
  const discountMult = (state.prestigePerks?.INTEL_DISCOUNT) ? 0.8 : 1;
  const effectiveCost = Math.round(baseCost * discountMult);
  
  if (state.reputation < effectiveCost) return state;
  
  return {
    ...state,
    reputation: state.reputation - effectiveCost,
    intelUpgrades: { ...(state.intelUpgrades ?? {}), [upgradeKey]: currentLevel + 1 },
    feedback: { type: 'UPGRADE', label: def.label, ts: Date.now() },
    log: addLog(state.log, `:: INTEL: [${def.label}] LVL ${currentLevel + 1} :: -${effectiveCost} REP${discountMult < 1 ? ' [DISCOUNTED]' : ''}`),
  };
}

export function severConnection(state, hexId) {
	return {
		...state,
		capturedHexes: (state.capturedHexes || []).filter(id => id !== hexId),
		log: [`:: CONNECTION_SEVERED :: Node ${hexId} released.`, ...(state.log || [])].slice(0, 50)
	};
}

const TRAIT_POOL = ['PARANOID', 'GREEDY', 'LOYAL', 'UNSTABLE', 'CYNIC', 'IDEALIST'];

function generateInitialTraits() {
	// 60% šanca, že agent príde s "čistým štítom", 40% že už má psychologickú batožinu
	if (Math.random() > 0.4) return []; 
	return [TRAIT_POOL[Math.floor(Math.random() * TRAIT_POOL.length)]];
}

export function hireRunner(state, runnerType) {
	const configs = {
		streetRunner: { level: 3, baseCost: 300,   requiresPrestige: 0, label: 'STREET_RUNNER',  baseStats: { stealth: 40, speed: 60, intel: 20 } },
		dataThief:    { level: 5, baseCost: 800,   requiresPrestige: 0, label: 'DATA_THIEF',     baseStats: { stealth: 70, speed: 40, intel: 50 } },
		infiltrator:  { level: 7, baseCost: 2500,  requiresPrestige: 0, label: 'INFILTRATOR',    baseStats: { stealth: 85, speed: 70, intel: 40 } },
		fixer:        { level: 9, baseCost: 8000,  requiresPrestige: 0, label: 'FIXER',          baseStats: { stealth: 30, speed: 30, intel: 80 } },
		shadowBroker: { level: 1, baseCost: 25000, requiresPrestige: 1, label: 'SHADOW_BROKER',  baseStats: { stealth: 90, speed: 90, intel: 90 } },
	};

	const cfg = configs[runnerType];
	if (!cfg) return state;
	if (state.level < cfg.level) return state;
	if ((state.prestige ?? 0) < cfg.requiresPrestige) return state;

	const currentAgents = state.agents || [];
	const count = currentAgents.filter(a => a.role === runnerType).length;
	if (count >= 5) return state;

	const perksUsed = state.prestigePerksUsed ?? [];
	let cost = getRunnerCost(cfg.baseCost, count);
	let perkId = null;

	if (runnerType === 'streetRunner' && count === 0 && (state.prestige ?? 0) >= 1 && !perksUsed.includes('FREE_STREET_RUNNER')) {
		cost = 0; perkId = 'FREE_STREET_RUNNER';
	} else if (runnerType === 'dataThief' && count === 0 && (state.prestige ?? 0) >= 2 && !perksUsed.includes('FREE_DATA_THIEF')) {
		cost = 0; perkId = 'FREE_DATA_THIEF';
	}

	if (state.gold < cost) return state;

	// Generovanie základných RPG štatistík s miernou randomizáciou (+0 až +10)
	const stats = {
		stealth: cfg.baseStats.stealth + Math.floor(Math.random() * 11),
		speed:   cfg.baseStats.speed   + Math.floor(Math.random() * 11),
		intel:   cfg.baseStats.intel   + Math.floor(Math.random() * 11),
	};

	const newAgent = {
		id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
		name: generateAgentName(),
		role: runnerType,
		level: 1,
		xp: 0,
		spec: null,
		status: 'ACTIVE', // ACTIVE, EXHAUSTED, INJURED, CAPTURED
		fatigue: 0,
		stress: 0,
		loyalty: 50 + Math.floor(Math.random() * 31), // Základ 50-80
		stats: stats,
		traits: generateInitialTraits(),
		injuries: [],
		missions: 0,
		createdAt: Date.now()
	};

	let next = {
		...state,
		gold: state.gold - cost,
		agents: [...currentAgents, newAgent],
		runners: { ...state.runners, [runnerType]: count + 1 }, // Kompatibilita
		prestigePerksUsed: perkId ? [...perksUsed, perkId] : perksUsed,
		log: addLog(state.log, `:: ENLISTED :: ${newAgent.name} [${cfg.label}] :: -${cost.toLocaleString()} CR`),
	};

	if (perkId) next = { ...next, log: addLog(next.log, `:: PRESTIGE PERK :: First operative recruited free`) };
	if (next.agents.length === 1) next = addZero(next, 'first_runner');
	
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
    log: addLog(state.log, `:: DISTRICT → ${dist.name}`),  // 🔥 ZMENENÉ: label → name
  };
}

// ── PRESTIGE ──────────────────────────────────────────────────────────────────

export function prestige(state) {
	if (state.level < 10 || (state.runGoldEarned ?? 0) < 100000) return state;
	
	// Výpočet bodov (odmocninová krivka)
	const pointsEarned = Math.max(1, Math.floor(Math.sqrt((state.runGoldEarned ?? 0) / 100000)));
	
	const newPrestige = (state.prestige ?? 0) + 1;
	const mult = 1 + newPrestige * 0.25;
	
	// DÔLEŽITÉ: Musíme sčítať celkový zárobok predtým, než resetujeme ten aktuálny
	const updatedTotalGold = (state.totalGoldEarned ?? 0) + (state.runGoldEarned ?? 0);

	let next = {
		// --- RESET CURRENT RUN ---
		gold: 0,
		level: 1,
		xp: 0,
		inventory: [],
		agents: [], // Všetci agenti sú prepustení (čistý stôl)
		upgrades: {
			ghostProtocol: 0, neuralBoost: 0, signalDampener: 0,
			stimPack: 0, traceEraser: 0, iceBreaker: 0, darkChannel: 0,
			voidDrive: 0, proxyServers: 0, quantumEncryption: 0, 
			autoFencer: 0, aiSubroutine: 0, hwOverclock: 0,
		},
		runners: { 
			streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, 
			shadowBroker: state.runners?.shadowBroker ?? 0 // ShadowBroker ti ostáva, ak ho už máš
		},
		runnerTick: { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
		autoFencerTick: 0,
		aiSubroutineTick: 0,
		heat: 0,
		stamina: 100,
		layLowActive: false,
		layLowTimer: 0,
		layLowCooldown: 0,
		bustedLockout: 0,
		darkMarketCooldown: 0,
		comboCount: 0,
		heatSpikeTimer: 0,
		barterCooldown: 0,
		raidActive: false,
		raidTimer: 0,
		nextRaidIn: typeof randomRaidInterval === 'function' ? randomRaidInterval() : 600,
		bountyActive: false,
		feedback: null,
		dailyFeedback: null,
		lastTickTime: Date.now(),
		runGoldEarned: 0,
		runPlayTime: 0,
    respecUsed: false,
		district: 'Z4',
		siphonsWithoutBust: 0,
		everBustedThisRun: false,
		achievementFeedback: null,
		offlineReport: null,
		prestigePerksUsed: [],
		
		// --- RESET MAP (Sieť sa musí znova hacknúť) ---
		capturedHexes: ['western_warpgate'], // Návrat do štartovacieho bodu
		nodeStability: {},
		activeMissions: [],
		reclaiming: {},

		// --- KEEP PERMANENT PROGRESS ---
		encKeys: state.encKeys ?? [],
		prestige: newPrestige,
		prestigeMultiplier: mult,

    // NOVÉ: Tieto veci NERESETUJEME
    squadUnlocked: state.squadUnlocked, // Ak si odomkol squady, ostanú
    shownTips: state.shownTips,         // Tipy ostanú
    
    // Reset špecifických vecí
    agentBonds: [], // Vzťahy sa resetujú (nový život)

		reputation: state.reputation,
		totalGoldEarned: updatedTotalGold, // Opravená hodnota
		offlineAccrualCap: state.offlineAccrualCap,
		intelUpgrades: state.intelUpgrades ?? {},
		zeroMessages: state.zeroMessages ?? [],
		achievements: state.achievements ?? {},
		prestigePerks: state.prestigePerks ?? {},
		prestigePoints: (state.prestigePoints ?? 0) + pointsEarned,
		activeProtocol: state.activeProtocol ?? 'NONE',
		storyFlags: state.storyFlags ?? {}, // Príbehové vlajky nesmieme mazať
		
		log: addLog([], `>> PRESTIGE ACTIVATED :: RUN #${newPrestige} :: MULTIPLIER x${mult.toFixed(2)} :: +${pointsEarned} PERK POINT(S)`),
	};

	// Ak máš funkciu na správy od Zero, vyvolaj ju
	if (typeof addZero === 'function') {
		next = addZero(next, 'first_prestige');
	}
	
	return next;
}

export function buyPrestigePerk(state, perkId) {
	const def = PRESTIGE_PERK_DEFS.find(d => d.id === perkId);
	if (!def) return state;

	const cost = def.cost ?? 1;
	const currentPoints = state.prestigePoints ?? 0;
	const alreadyOwned = (state.prestigePerks ?? {})[perkId];
	const levelReqMet = (state.level ?? 1) >= (def.reqLevel ?? 1);

	if (currentPoints < cost || alreadyOwned || !levelReqMet) {
		return state;
	}

	return {
		...state,
		prestigePoints: currentPoints - cost,
		prestigePerks: { 
			...(state.prestigePerks ?? {}), 
			[perkId]: true 
		},
		log: addLog(state.log, `:: PRESTIGE PERK ACTIVATED :: ${perkId} :: ${def.effect}`),
	};
}

// Respec: refund all perks. Cost 10K CR × perkCount (scales with commitment).
// Once per prestige run (flag reset on next prestige).
export function respecPrestigePerks(state) {
  if (state.respecUsed) {
    return { ...state, log: addLog(state.log, '[!] RESPEC_BLOCKED :: Already used this run.') };
  }
  const owned = Object.keys(state.prestigePerks ?? {});
  if (owned.length === 0) {
    return { ...state, log: addLog(state.log, '[!] RESPEC_SKIPPED :: No perks to refund.') };
  }
  const cost = 10000 * owned.length;
  if ((state.gold ?? 0) < cost) {
    return { ...state, log: addLog(state.log, `[!] INSUFFICIENT_FUNDS :: Respec costs ${cost.toLocaleString()} CR`) };
  }

  // Refund points (each perk its original cost)
  let refundedPoints = 0;
  for (const perkId of owned) {
    const def = PRESTIGE_PERK_DEFS.find(d => d.id === perkId);
    refundedPoints += (def?.cost ?? 1);
  }

  return {
    ...state,
    gold: state.gold - cost,
    prestigePoints: (state.prestigePoints ?? 0) + refundedPoints,
    prestigePerks: {},
    respecUsed: true,
    log: addLog(state.log, `:: RESPEC :: ${owned.length} perks refunded (${refundedPoints} points). -${cost.toLocaleString()} CR`),
  };
}

// ── OFFLINE PROGRESS ──────────────────────────────────────────────────────────

export function calculateOfflineProgress(state, nowMs) {
  const rawElapsed = (nowMs - (state.lastTickTime ?? nowMs)) / 1000;
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
  const earnedGold = Math.floor(rawGold * IDLE_EFFICIENCY * mult);

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

// ── NET HEAT FLOW (per-second) ───────────────────────────────────────────
// Single source of truth for heat change per second.
// Used by tick() and by UI selectors so display matches reality.
export function calculateHeatFlow(state) {
  const distDecayBase = DISTRICTS[state.district]?.heatDecayBase ?? 0.2;
  const traceBonus = (state.upgrades?.traceEraser ?? 0) * 0.1;
  const corpMoleMult = (state.intelUpgrades?.corpMole ?? 0) >= 1 ? 2 : 1;
  const mapHeatBonus = calculateMapModifiers(state).heatDecayBonus ?? 0;

  // Rookie buff: first level of first run get 2× decay so onboarding
  // doesn't punish players who can only do 1 siphon before forced wait.
  const lvl = state.level ?? 1;
  const prestige = state.prestige ?? 0;
  const rookieMult = (prestige === 0 && lvl < 1) ? 2.0 : 1.0;

  // Base natural decay (always negative = cooling)
  const ghostFadeMult = state.prestigePerks?.GHOST_FADE ? 1.25 : 1;
  let delta = -((distDecayBase + traceBonus + mapHeatBonus) * corpMoleMult * ghostFadeMult * rookieMult);

  // Lay low accelerates cooling
  if (state.layLowActive) {
    const t = getLayLowTier(state);
    delta = -t.decayPerSec;
  }

  // Heat spike active (high-value loot grabbed recently) = heat rises
  if ((state.heatSpikeTimer ?? 0) > 0 && !state.layLowActive) {
      delta = 1.5;
  }

  // Overload leak from bandwidth (Overclock / too many nodes)
  const usedBw = (state.capturedHexes?.length ?? 0) + (state.activeMissions?.length ?? 0);
  const overclockBonus = state.overclockActive ? 2 : 0;
  const maxBw = 1 + (state.intelUpgrades?.serverRacks ?? 0) + overclockBonus;
  const overload = Math.max(0, usedBw - maxBw);
  if (overload > 0) delta += overload * 0.8;

  // Hot zone penalty — current district is hot → +0.3 heat/s
  if ((state.hotZones ?? {})[state.district]) {
    delta += 0.3;
  }

  return delta; // heat change per second (positive = heating, negative = cooling)
}

// ── GAME TICK (1s interval) ───────────────────────────────────────────────────

export function tick(state) {
	let next = { ...state };
	const nowMs = Date.now();

  // ── COMBO TIMER DECAY ──────────────────────────────────────────────
  if ((next.comboTimer ?? 0) > 0) {
    const newTimer = Math.max(0, next.comboTimer - 1000);
    const comboExpired = newTimer === 0 && next.comboCount > 0;
    next = {
        ...next,
        comboTimer: newTimer,
        comboCount: comboExpired ? 0 : next.comboCount,
        comboShatterKey: comboExpired ? (next.comboShatterKey ?? 0) + 1 : next.comboShatterKey,
    };
  }

  // ── ZERO QUEUE DISPENSER ──────────────────────────────────────────
  // Rate-limit ZERO log lines so player isn't spammed (e.g. 4 lines in 1s
  // when first siphon coincides with quantum drop + first capture).
  // Max 1 line per 2.5s — rest waits in queue.
  const ZERO_DISPENSE_MS = 2500;
  if ((next.zeroQueue?.length ?? 0) > 0) {
    const lastEmit = next.lastZeroEmit ?? 0;
    if (nowMs - lastEmit >= ZERO_DISPENSE_MS) {
      const [first, ...rest] = next.zeroQueue;
      next = {
        ...next,
        zeroQueue: rest,
        lastZeroEmit: nowMs,
        log: addLog(next.log, first),
      };
    }
  }

	// ── AFK / IDLE DETECTION ──
	const IDLE_TIMEOUT = DEV_MODE ? 10000 : 1200000; // 20 minút (1 min v DEV)
	const IDLE_PROMPT_DURATION = DEV_MODE ? 10000 : 60000; // 60 sekúnd výzva
	const timeSinceLastAction = nowMs - (next.lastInteractionTime || nowMs);

	// 1. Spustenie výzvy "Si tu?"
	if (!next.isIdle && !next.idlePromptActive && timeSinceLastAction > IDLE_TIMEOUT) {
		next = { ...next, idlePromptActive: true, idlePromptTimestamp: nowMs };
	}

	// 2. Prepadnutie výzvy -> Offline Režim
	if (next.idlePromptActive && (nowMs - (next.idlePromptTimestamp || 0)) > IDLE_PROMPT_DURATION) {
		const t = getTimestamp();
		next = {
			...next,
			idlePromptActive: false,
			isIdle: true,
			log: [`[${t}] :: NO RESPONSE :: ENTERING POWER-SAVING OFFLINE MODE`, ...(next.log || [])].slice(0, 50)
		};
	}

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

	// ── STAMINA REGEN ────────────────────────────────────────────────
  const effectiveMaxStamina = 100 + (next.upgrades.neuralBoost ?? 0) * 10;
  const baseRegen = 2 + (next.upgrades.stimPack ?? 0) * 0.5;
  const protoStaminaMult = PROTOCOL_DEFS[next.activeProtocol ?? 'NONE']?.staminaRegenMult ?? 1;
  const effectiveRegen = (next.layLowActive ? baseRegen + 2 : baseRegen) * protoStaminaMult;
  next = { ...next, stamina: Math.min(effectiveMaxStamina, next.stamina + effectiveRegen) };

	// ── BUSTED LOCKOUT ─────────────────────────────────────────────────
  if (next.bustedLockout > 0) {
    return { ...next, bustedLockout: next.bustedLockout - 1, lastTickTime: nowMs };
  }

  if (!state.prestigeReadyNotified && state.level >= 10 && state.runGoldEarned >= 100000) {
    next = {
        ...next, 
        prestigeReadyNotified: true, 
        log: addLog(next.log, `[AMBIENT SHIFT] :: ${ZERO.prestige_ready}`)
    };
    // Môžeš zmeniť aj ambient sound, ak máš funkciu audioManager.setAmbientPrestige()
}

  // --- NEURAL SIM (Tréning) ---
  const trainees = (next.agents || []).filter(a => a.status === 'TRAINING');
  if (trainees.length > 0) {
    const trainingCost = trainees.length * 15; // Znížená cena: 15 CR per agent
    if (next.gold >= trainingCost) {
      next.gold -= trainingCost;
      next.agents = next.agents.map(a => {
        if (a.status === 'TRAINING') {
          let newXp = (a.xp || 0) + 2; // +2 XP za tick (spomalené)
          let newLevel = a.level || 1;
          const xpNeeded = newLevel * 1000;
          
          // LEVEL UP LOGIKA
          if (newXp >= xpNeeded) {
            newXp -= xpNeeded; // Zvyšok XP sa prenesie do ďalšieho levelu
            newLevel += 1;
            next.log = addLog(next.log, `:: LEVEL UP :: Agent ${a.name} reached LVL ${newLevel}!`);
          }
          
          return { ...a, xp: newXp, level: newLevel };
        }
        return a;
      });
    } else {
      next.log = addLog(next.log, '!! WARNING !! Insufficient funds for Neural Sim. Training halted.');
      next.agents = next.agents.map(a => a.status === 'TRAINING' ? { ...a, status: 'ACTIVE' } : a);
    }
  }

  // ── OVERCLOCK COOLDOWN TICK ──
  if (next.overclockCooldown > 0) {
    next.overclockCooldown = Math.max(0, next.overclockCooldown - 1);
  }
  

  // ═══════════════════════════════════════════════════════════════
  // ── SYSTEM_OVERRIDE_PROTOCOL (OVERCLOCK & OVERLOAD) ──
  // ═══════════════════════════════════════════════════════════════
  
  // 1. Výpočet Bandwidth a Overloadu
  const usedBw = (next.capturedHexes?.length || 0) + (next.activeMissions?.length || 0);
  const overclockBonus = next.overclockActive ? 2 : 0; // Force inject +2 BW
  const maxBw = 1 + (next.intelUpgrades?.serverRacks || 0) + overclockBonus;
  const overload = Math.max(0, usedBw - maxBw);


    // ── NODE DECAY (JEDNOTNÝ SYSTÉM) ──
    // Decay Multiplier: +300% per overload level (Base 1 + 3*overload)
    // Základný decay je 0.08.
    
  let decayChanged = false;
  let decayStability = { ...(next.nodeStability || {}) };
  let decayCaptured = [...(next.capturedHexes || [])];
  let decayLogs = [...(next.log || [])];
  const decayTime = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Výpočet globálneho multiplikátora decayu
  const overloadDecayMultiplier = 1 + (overload * 3); 

  decayCaptured.forEach(id => {
      if (id !== 'western_warpgate') {
          let s = decayStability[id] ?? 100;
          
          // Upgrades (Hardened Cables znižujú decay)
          const hardenedBonus = (next.intelUpgrades?.hardenedCables || 0) * 0.2;
          
          // Konečný vzorec: Base * (1 - hardening) * OverloadMult
          // Ak je overload 0, multiplier je 1 (normálny decay).
          // Ak je overload 1, multiplier je 4 (300% rýchlejší decay).
          const decayRate = 0.08 * (1 - hardenedBonus) * overloadDecayMultiplier;
          
          s -= decayRate;

          if (s <= 0) {
              decayCaptured = decayCaptured.filter(c => c !== id);
              delete decayStability[id];
              if (next.reclaiming) delete next.reclaiming[id];
              decayLogs = [`[${decayTime}] !!! CONNECTION_LOST :: ${id} burned out (Overload: ${overload}).`, ...decayLogs].slice(0, 50);
              decayChanged = true;
          } else {
              decayStability[id] = s;
              decayChanged = true;
          }
      }
  });

  if (decayChanged) {
      next = { ...next, nodeStability: decayStability, capturedHexes: decayCaptured, log: decayLogs };
  }

  // ── DAILY CHALLENGE: SURVIVE_HEAT ──────────────────────────────────
  if (next.heat >= 80) {
      next = updateDailyChallenge(next, 'SURVIVE_HEAT', next.heat);
  }

  // ── HEAT MANAGEMENT (single source of truth) ───────────────────────────
  const heatDelta = calculateHeatFlow(next);
  const newHeat = Math.max(0, Math.min(100, next.heat + heatDelta));
  next = { ...next, heat: parseFloat(newHeat.toFixed(2)) };

  // If passive heat (overload, hot zone, spike) pushed us to 100, trigger bust.
  // Without this, "BUSTING · 0% RESIST" displays forever with nothing happening.
  if (next.heat >= 100 && (next.bustedLockout ?? 0) === 0 && !next.layLowActive) {
    next = applyBustedCheck(next);
  }

  // ── DISTRICT HEAT (H4.1) — each district cools independently ────────────
  // Lokálny heat stúpa pri akciách v danom districte (v reducer case).
  // Tu v tick() každý district kvapká o ~1/s (trochu rýchlejšie než global).
  {
    const dh = { ...(next.districtHeat ?? {}) };
    let changed = false;
    for (const [did, h] of Object.entries(dh)) {
      if (h > 0) {
        dh[did] = Math.max(0, h - 1);
        changed = true;
      }
    }
    if (changed) next = { ...next, districtHeat: dh };

    // HOT ZONE detection — 10 consecutive ticks above 80
    const hotTicks = { ...(next.districtHeatHotTicks ?? {}) };
    const hot = { ...(next.hotZones ?? {}) };
    for (const did of Object.keys(dh)) {
      if ((dh[did] ?? 0) > 80) {
        hotTicks[did] = (hotTicks[did] ?? 0) + 1;
        if (hotTicks[did] >= 10 && !hot[did]) {
          hot[did] = true;
          next.log = addLog(next.log, `:: HOT_ZONE :: ${did} marked — +15% heat gen here`);
        }
      } else {
        hotTicks[did] = 0;
        if (hot[did] && (dh[did] ?? 0) < 40) {
          delete hot[did];
          next.log = addLog(next.log, `:: HOT_ZONE_CLEARED :: ${did} cooled`);
        }
      }
    }
    next = { ...next, districtHeatHotTicks: hotTicks, hotZones: hot };
  }

  // Heat spike timer countdown (separate from flow calculation)
  if ((next.heatSpikeTimer ?? 0) > 0) {
      next = { ...next, heatSpikeTimer: next.heatSpikeTimer - 1 };
  }

  // ── HUNTER SYSTEM (H4.5-H4.8) ──────────────────────────────────────
  next = updateHunterSystem(next);

  // ── BOUNTY SYSTEM ──────────────────────────────────────────────────
  if (!(next.bountyActive ?? false) && next.heat >= 80) {
      next = {
          ...next, bountyActive: true,
          log: addLog(next.log, ':: BOUNTY ISSUED :: Aether-Biotech has flagged your signature')
      };
      next = addZero(next, 'bounty');
  } else if ((next.bountyActive ?? false) && next.heat < 40) {
      next = {
          ...next, bountyActive: false,
          log: addLog(next.log, ':: BOUNTY CLEARED :: signature lost')
      };
  }

  // ── NODE RECLAIM LOGIC (Útok systému - len ak sme IDLE) ──
  // Decay sme už vyriešili vyššie, tu riešime len Reclaim (útoky)
  if (!next.isIdle) {
    let reclaiming = { ...(next.reclaiming || {}) };
    let captured = [...(next.capturedHexes || [])];
    let stability = { ...(next.nodeStability || {}) };
    let logs = [...(next.log || [])];
    let changed = false;
    
    // 1. Reclaim (Útok systému)
    if (captured.length > 1 && Math.random() < 0.01 + (next.heat / 5000)) {
        const target = captured[Math.floor(Math.random() * captured.length)];
        if (target !== 'western_warpgate' && !reclaiming[target]) {
            reclaiming[target] = { progress: 0, stage: 'SCAN' };
            logs = [`[!] ALERT :: INTRUSION_DETECTED :: Node ${target}`, ...logs].slice(0, 50);
            changed = true;
        }
    }

    Object.keys(reclaiming).forEach(id => {
        let r = { ...reclaiming[id] };
        
        if (r.stage === 'LAST_STAND') {
            r.timer -= 1;
            if (r.timer <= 0) {
                captured = captured.filter(c => c !== id);
                delete reclaiming[id];
                delete stability[id];
                next.heat = Math.min(100, (next.heat || 0) + 15);
                logs = [`[!!!] TERMINATED :: OVERRIDE FAILED ON ${id}. HEAT SPIKE!`, ...logs].slice(0, 50);
            } else {
                reclaiming[id] = r;
            }
            changed = true;
        } else {
            r.progress += 2; 
            if (r.progress >= 100) {
                if (r.stage === 'SCAN') {
                    reclaiming[id] = { progress: 0, stage: 'BREACH' };
                    logs = [`[!!] CRITICAL :: FIREWALL_BREACH :: ${id}`, ...logs].slice(0, 50);
                } else if (r.stage === 'BREACH') {
                    reclaiming[id] = { progress: 100, stage: 'LAST_STAND', timer: 5 };
                    logs = [`[!!!] EMERGENCY :: MANUAL OVERRIDE REQUIRED ON ${id}`, ...logs].slice(0, 50);
                }
            } else {
                reclaiming[id] = r;
            }
            changed = true;
        }
    });
    
    // POZNÁMKA: Sekcia "2. Decay" bola odstránená, pretože ju riešime vyššie globálne s overload multiplikátorom.

    if (changed) {
        next = { ...next, reclaiming, capturedHexes: captured, nodeStability: stability, log: logs };
    }
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

	const idleMult = next.isIdle ? IDLE_EFFICIENCY : 1.0; // V offline režime len 60% zisku
  const idleFocusThreshold = next.reveals?.IDLE_FOCUS ? 30 : 60;
	const secSinceClick = Math.floor((nowMs - (next.lastInteractionTime || nowMs)) / 1000);
	const idleFocusBonus = (!next.isIdle && secSinceClick >= idleFocusThreshold) ? Math.min(3, 1 + (secSinceClick - idleFocusThreshold) / 120) : 1;
	// Linear ramp: threshold → 1x, +120s → 2x, +240s → 3x. Capped at 3x.

	// ── 1. AGENT TICK SYSTEM (Zárobok, Únava, HW Overclock) ────────────────
	const hwLvl = next.upgrades?.hwOverclock ?? 0;
	const hwSpeedMult = Math.pow(0.85, hwLvl);
	const hwHeatMult = 1 + hwLvl * 0.5;

	const cycles = {
		streetRunner: Math.max(1, Math.round((DEV_MODE ? 5 : 30) * hwSpeedMult)),
		dataThief:    Math.max(1, Math.round((DEV_MODE ? 10 : 120) * hwSpeedMult)),
		infiltrator:  Math.max(1, Math.round((DEV_MODE ? 15 : 900) * hwSpeedMult)),
		fixer:        Math.max(1, Math.round((DEV_MODE ? 20 : 3600) * hwSpeedMult)),
		shadowBroker: Math.max(1, Math.round((DEV_MODE ? 30 : 7200) * hwSpeedMult))
	};
	
// --- OPRAVA ZÁROBKOV A HEATU ---
// Agenti musia zarábať toľko, aby pokryli svoje liečenie a generovali profit.
  const basePayouts = { streetRunner: 15, dataThief: 60, infiltrator: 250, fixer: 1000, shadowBroker: 5000 };
  const baseHeats = { streetRunner: 0.5, dataThief: 1, infiltrator: 2, fixer: 1, shadowBroker: 0 }; // Znížený heat

	let totalAgentIncome = 0;
	let totalAgentHeat = 0;

	// Uistíme sa, že agents existujú (spätná kompatibilita)
	if (!next.agents) next.agents = [];

	next.agents = next.agents.map(agent => {
		let updated = { ...agent };

		// Zotavovanie vyčerpaných agentov
		if (updated.status === 'EXHAUSTED') {
			updated.fatigue -= (DEV_MODE ? 5 : 1);
			if (updated.fatigue <= 0) {
				updated.fatigue = 0;
				updated.status = 'ACTIVE';
				next.log = addLog(next.log, `:: AGENT RECOVERED :: ${updated.name} is back online.`);
			}
			return updated; // Unavený agent nepracuje
		}

		// Aktívni agenti pracujú
		if (updated.status === 'ACTIVE') {
			updated.tickCount = (updated.tickCount || 0) + 1;
			const targetCycle = cycles[updated.role] || 30;

			if (updated.tickCount >= targetCycle) {
				updated.tickCount = 0; // Reset cyklu
				
				// Multiplikátory
        const roleCount = next.agents.filter(a => a.role === updated.role && a.status === 'ACTIVE').length;
        const synergyMult = roleCount >= 5 ? 1.20 : 1;
        const guildMult = (next.prestigePerks ?? {}).GUILD_MASTER ? 1.25 : 1;
        
        // Zostalo zo starého 'spec' systému (ak ho ešte chceš používať)
        const specGoldMult = updated.spec === 'GREEDY' ? 1.5 : 1; 
        const specHeatMult = updated.spec === 'SHADOW' ? 0.5 : 1; 
        const stealthMult = 1 - (next.upgrades?.runnerStealth ?? 0) * 0.25;

        // --- TRAIT EFEKTY ---
        let traitGoldMult = 1;
        let traitHeatAdder = 0; // Paranoid pridáva flat heat

        if (updated.traits && updated.traits.includes('GREEDY')) {
          traitGoldMult = 1.3; // +30% income (podľa roadmapy)
        }
        if (updated.traits && updated.traits.includes('PARANOID')) {
          traitHeatAdder = 0.5; // +0.5 heat per cycle (podľa roadmapy)
        }
        if (updated.traits && updated.traits.includes('LOYAL')) {
          updated.loyaltyDecayImmune = true;
        }

        // Zárobok a Heat per Agent
        const tyrantMult = (next.prestigePerks?.TYRANT && (next.agents?.length ?? 0) >= 10) ? 2 : 1;
        totalAgentIncome += basePayouts[updated.role] * synergyMult * guildMult * specGoldMult * traitGoldMult * idleMult * idleFocusBonus * tyrantMult;
        totalAgentHeat += (baseHeats[updated.role] * hwHeatMult * specHeatMult * stealthMult) + traitHeatAdder;

				// Únava a XP
				updated.fatigue += 3; // Bolo 15! Teraz agent vydrží cca 33 cyklov, než odpadne
        if (updated.fatigue >= 100) {
          updated.fatigue = 100;
          updated.status = 'EXHAUSTED';
          next.log = addLog(next.log, `[!] EXHAUSTION :: ${updated.name} goes offline to recover.`);
        }

				updated.xp += 10;
				if (updated.xp >= 100 && !updated.spec) {
					updated.spec = 'PENDING';
					next.log = addLog(next.log, `:: PROMOTION AVAILABLE :: ${updated.name} is ready for specialization.`);
				}
			}
		}
		return updated;
	});

	// Aplikovanie celkového zárobku od agentov
	if (totalAgentIncome > 0) {
		const inc = applyIncome(next, totalAgentIncome);
		next.gold = inc.gold;
		next.totalGoldEarned = inc.totalGoldEarned;
		next.runGoldEarned = inc.runGoldEarned;
		next.heat = Math.min(100, (next.heat || 0) + totalAgentHeat);
		
		// Voliteľný log, aby to nespamovalo
		// next.log = addLog(next.log, `:: AGENTS YIELD :: +${Math.floor(inc._earned).toLocaleString()} CR`);
	}

	// ── MAP PASSIVE GOLD ───────────────────────────────────────────────
	const mapPassiveGold = calculateMapModifiers(next).passiveGold;
	if (mapPassiveGold > 0) {
		const inc = applyIncome(next, mapPassiveGold * idleMult * idleFocusBonus);
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

  // --- MIGRÁCIA AGENTOV (Legacy podpora) ---
	if (next.agents && next.agents.length > 0) {
		next.agents = next.agents.map(a => {
			let migrated = { ...a };
			if (!migrated.stats) {
				migrated.stats = {
					stealth: 50 + Math.floor(Math.random() * 20),
					speed: 50 + Math.floor(Math.random() * 20),
					intel: 50 + Math.floor(Math.random() * 20),
				};
			}
			if (!migrated.traits) {
				// Dáme im náhodný trait, aby nevyzerali smutne
				const tPool = ['PARANOID', 'GREEDY', 'LOYAL', 'UNSTABLE', 'CYNIC', 'IDEALIST'];
				migrated.traits = Math.random() > 0.4 ? [] : [tPool[Math.floor(Math.random() * tPool.length)]];
			}
			return migrated;
		});
	}
	// -----------------------------------------

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
				log: addLog(next.log, ':: LAY_LOW COMPLETE :: COOLDOWNS ACCELERATED')
			};
		} else {
			next = { ...next, layLowTimer: remaining };
		}
	} else if (next.layLowCooldown > 0) {
		next = { ...next, layLowCooldown: next.layLowCooldown - 1 };
	}

	// ── RAID SYSTEM ────────────────────────────────────────────────────
	if (!next.isIdle && !next.idlePromptActive) {
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
	}

  // ── BETRAYAL (Agent System) ───────────────────────────────────────────────
  if (!next.isIdle && !next.idlePromptActive) {
    const activeAgents = (next.agents || []).filter(a => a.status === 'ACTIVE' && !a.loyaltyDecayImmune);
    if (next.heat >= 70 && activeAgents.length > 0) {
      // V DEV_MODE to bolo 0.005 (0.5% KAŽDÚ SEKUNDU). Znížené na 0.0002.
      const perRunnerChance = DEV_MODE ? 0.0002 : 0.00005;
			
			if (Math.random() < activeAgents.length * perRunnerChance) {
				// Vyberieme agenta, ideálne toho s najnižšou lojalitou (alebo náhodného)
				activeAgents.sort((a, b) => a.loyalty - b.loyalty);
				const betrayer = activeAgents[0]; // Ten najmenej lojálny nás zradí!

				const goldLost = Math.floor(next.gold * 0.15);
				next = {
					...next,
					gold: Math.max(0, next.gold - goldLost),
					heat: Math.min(100, next.heat + 20),
					// Zmažeme zradcu zo zoznamu
					agents: next.agents.filter(a => a.id !== betrayer.id),
					log: addLog(next.log, `:: BETRAYAL :: ${betrayer.name} sold you out and fled! :: -${goldLost.toLocaleString()} CR :: HEAT +20`),
				};
				next = applyBustedCheck(next);
				next = addZero(next, 'betrayal');
			}
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
	if (!next.isIdle && !next.idlePromptActive) {
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
	}

  // ── THE EYE AWAKENING TRIGGER ────────────────────────────────
	if (!next.eyeAwakenedTriggered && isEyeAwakened(next)) {
		next = { ...next, eyeAwakenedTriggered: true };
		next = addZero(next, 'eye_awakened');
	}

	// Eye-awakened gameplay shifts: higher heat passive, more events
	if (isEyeAwakened(next)) {
		// Ambient implant whispers — stay in log (NOT NEURAL_LINK), without [ZERO >>] prefix
		// These are environmental flavor, not narrative beats.
		if ((next.lastTickTime ?? 0) > 0 && Math.random() < 0.003) {
			const whispers = [
				':: it\'s watching. right now.',
				':: don\'t trust the pattern.',
				':: the silence isn\'t empty.',
				':: once you see it, you can\'t unsee it.',
			];
			next = {
				...next,
				log: addLog(next.log, whispers[Math.floor(Math.random() * whispers.length)]),
				lastLogTier: 'zero',
			};
		}
	}

	// ── MILESTONE CHECK ──────────────────────────────────────────────
	const newMilestones = checkMilestones(next);
	if (newMilestones.length > 0) {
		const nowTs = Date.now();
		const updatedMilestones = { ...(next.milestones ?? {}) };
		let log = next.log;
		const toastQueue = [...(next.milestoneToastQueue ?? [])];
		for (const def of newMilestones) {
			updatedMilestones[def.id] = nowTs;
			toastQueue.push({ id: def.id, title: def.title, flavor: def.flavor, ts: nowTs });
			log = addLog(log, `:: ★ MILESTONE :: ${def.title}`);
		}
		next = { ...next, milestones: updatedMilestones, milestoneToastQueue: toastQueue, log };
	}

	return {
		...next,
		lastTickTime: nowMs,
		totalPlayTime: (next.totalPlayTime ?? 0) + 1,
		runPlayTime:   (next.runPlayTime ?? 0) + 1,
	};
}

export function checkMissions(state) {
	if (!state.activeMissions || state.activeMissions.length === 0) return state;

	let next = { ...state };
	const now = Date.now();

	const finished = next.activeMissions.filter(m => now >= m.endTime);
	if (finished.length === 0) return next;

  if (next.capturedHexes.length === 1 && state.capturedHexes.length === 0) {
    next = addZero(next, 'first_capture');
  }

	finished.forEach(m => {
		const hex = AETHERIA_MAP[m.hexId];
		if (!hex) return;
		
		let missionSuccess = true;

		// ── TRAIT-BASED MISSION MODIFIERS ─────────────────────────────
		const agent = (next.agents || []).find(a => a.id === m.agentId);
		const agentTraits = agent?.traits ?? [];

		// IDEALIST: refuse Z5 corp missions → auto-fail with no penalty
		if (agentTraits.includes('IDEALIST') && hex.districtId === 'Z5') {
			missionSuccess = false;
			next.log = addLog(next.log, `:: ${agent.name} refused the corporate infiltration. Ideals intact.`);
			// Return agent to ACTIVE (no injury, no capture)
			next.agents = next.agents.map(a =>
				a.id === m.agentId ? { ...a, status: 'ACTIVE', fatigue: Math.min(100, (a.fatigue ?? 0) + 10) } : a
			);
			return;  // Skip the rest of this forEach iteration
		}

		// ── SPRACOVANIE AGENTA (Návrat, Únava, Zranenia) ──
		if (next.agents) {
			next.agents = next.agents.map(a => {
				if (a.id === m.agentId) {
					// 1. Šanca na zlyhanie/katastrofu (Závisí od Heatu)
					let dangerRoll = Math.random() * 100;
					let dangerThreshold = (next.heat / 5); // Pri 100 Heat je 20% šanca na prúser

					// UNSTABLE: coin flip — +15% or -15% to success chance
					if ((a.traits ?? []).includes('UNSTABLE')) {
						const unstableRoll = Math.random();
						if (unstableRoll < 0.5) {
							dangerThreshold -= 15; // Safer
							next.log = addLog(next.log, `:: ${a.name} felt focused. Threat diminished.`);
						} else {
							dangerThreshold += 15; // More dangerous
							next.log = addLog(next.log, `:: ${a.name} lost focus. Threat amplified.`);
						}
					}
					
					if (dangerRoll < dangerThreshold) {
						missionSuccess = false;
						const isCaptured = Math.random() > 0.6; // 40% šanca na zajatie, inak len zranenie

						// Surface fail to splash so player notices without checking log
						next.missionSplash = {
							label: hex.label || hex.name || 'UNKNOWN_NODE',
							runnerType: m.runnerType,
							gold: 0,
							xp: 0,
							failed: true,
							failReason: isCaptured ? `${a.name} CAPTURED` : `${a.name} INJURED`,
							timestamp: Date.now()
						};

						if (isCaptured) {
							next.log = addLog(next.log, `[!!!] M.I.A. :: ${a.name} WAS CAPTURED AT ${hex.label}!`);
							return { ...a, status: 'CAPTURED', fatigue: 100, stress: 100 };
						} else {
							next.log = addLog(next.log, `[!] CASUALTY :: ${a.name} WAS INJURED AT ${hex.label}!`);
							return { ...a, status: 'INJURED', fatigue: 100, stress: Math.min(100, a.stress + 50) };
						}
					}

					// 2. Normálny, úspešný návrat
					let updatedXp = a.xp + 30; // Misie dávajú veľa XP
					let spec = a.spec;
					if (updatedXp >= 100 && !spec) {
						spec = 'PENDING';
						next.log = addLog(next.log, `:: PROMOTION AVAILABLE :: ${a.name} is ready for specialization.`);
					}
					
					// Misia extrémne vyčerpáva (+45% Fatigue)
					const newFatigue = Math.min(100, a.fatigue + 45);
					const newStatus = newFatigue >= 100 ? 'EXHAUSTED' : 'ACTIVE';
					if (newStatus === 'EXHAUSTED') {
						next.log = addLog(next.log, `[!] EXHAUSTION :: ${a.name} collapsed after returning from ${hex.label}.`);
					}

					return { ...a, status: newStatus, fatigue: newFatigue, xp: Math.min(100, updatedXp), spec: spec };
				}
				return a;
			});
		}

		// ── ODMENY (Len ak misia neskončila katastrofou) ──
		if (missionSuccess && !(next.capturedHexes || []).includes(m.hexId)) {
			const mult = hex.lootMultiplier || 1;
			const rewardMult = m.rewardMult ?? 1;

			// CYNIC: +10% CR but -1 REP per mission
			const cynicMult = agentTraits.includes('CYNIC') ? 1.1 : 1;
			// EMPIRE perk: +50% capture CR
			const empireMult = next.prestigePerks?.EMPIRE ? 1.5 : 1;

			const rawGold = Math.floor((Math.random() * 5000 + 5000) * mult * rewardMult * cynicMult * empireMult);
			const xpReward = Math.floor(1500 * mult * rewardMult);

			if (agentTraits.includes('CYNIC')) {
				next.reputation = Math.max(0, (next.reputation ?? 0) - 1);
				next.log = addLog(next.log, `:: ${agent.name}: "I don't do this for the cause." -1 REP`);
			}

			const inc = applyIncome(next, rawGold);
			next.gold = inc.gold;
			next.totalGoldEarned = inc.totalGoldEarned;
			next.runGoldEarned = inc.runGoldEarned;
			next.xp += xpReward;
			const goldReward = inc._earned;
			next = checkLevelUp(next);

			next.capturedHexes = [...(next.capturedHexes || []), m.hexId];
			next.mapDiscovery = [...new Set([
				...(next.mapDiscovery || []), 
				m.hexId, 
				...(hex.connections || [])
			])];

			next.missionSplash = {
				label: hex.label || hex.name || 'UNKNOWN_NODE',
				runnerType: m.runnerType,
				gold: goldReward,
				xp: xpReward,
				timestamp: Date.now()
			};

			const t = getTimestamp();
			next.log = [
				`[${t}] :: MISSION_SUCCESS :: ${hex.label} SECURED`,
				`[${t}] :: REWARD :: +${goldReward.toLocaleString()} CR | +${xpReward} XP`,
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
	
	let next = { ...state };
	let promotedCount = 0;

	// Povýšime všetkých agentov tohto typu, ktorí čakajú na povýšenie
	if (next.agents) {
		next.agents = next.agents.map(a => {
			if (a.role === runnerType && a.spec === 'PENDING') {
				promotedCount++;
				return { ...a, spec: spec, xp: 0, level: a.level + 1 };
			}
			return a;
		});
	}

	if (promotedCount > 0) {
		const specLabel = spec === 'SHADOW' ? '-50% heat/cycle' : '+50% gold/cycle';
		next.log = addLog(next.log, `:: PROMOTION :: ${promotedCount}x ${runnerType.toUpperCase()} → ${spec} :: ${specLabel}`);
		
		// Legacy zmazanie 'PENDING' zo starého objektu
		if (next.runnerSpec && next.runnerSpec[runnerType] === 'PENDING') {
			next.runnerSpec = { ...next.runnerSpec, [runnerType]: spec };
		}
	}

	return next;
}