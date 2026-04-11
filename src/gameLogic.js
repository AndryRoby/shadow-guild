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

// ── LOOT TABLES ──────────────────────────────────────────────────────────────

export const STANDARD_LOOT = [
  { id: 'DATA_CHIP',          gold: 5,   xp: 8,   weight: 40,  cooldown: 180  },
  { id: 'CREDIT_CHIP',        gold: 12,  xp: 15,  weight: 28,  cooldown: 180  },
  { id: 'ACCESS_CARD',        gold: 28,  xp: 25,  weight: 16,  cooldown: 300  },
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
  { id: 'CRYPTO_WALLET',      gold: 400,  xp: 200, weight: 40, cooldown: 900  },
  { id: 'CORP_RESERVE',       gold: 800,  xp: 350, weight: 35, cooldown: 1800 },
  { id: 'MASTER_ACCESS_CODE', gold: 1500, xp: 600, weight: 25, cooldown: 3600 },
];

// IDs that trigger a heat spike (tier 3+ loot)
const HIGH_VALUE_IDS = new Set([
  'BIOMETRIC_KEY', 'CORP_BADGE', 'NEURAL_TOKEN',
  'SECURE_TERMINAL', 'CLASSIFIED_DOSSIER', 'CORP_BLUEPRINT', 'EXECUTIVE_KEYCARD',
  'CRYPTO_WALLET', 'CORP_RESERVE', 'MASTER_ACCESS_CODE',
]);

export const CHALLENGE_DEFS = [
  { type: 'SIPHON_COUNT', desc: 'Execute 20 successful siphons',       target: 20,   reward: { rep: 50, gold: 0   } },
  { type: 'BREACH_COUNT', desc: 'Complete 10 breaches',                target: 10,   reward: { rep: 30, gold: 500 } },
  { type: 'SELL_VALUE',   desc: 'Sell items worth 1000 CR total',      target: 1000, reward: { rep: 40, gold: 0   } },
  { type: 'SURVIVE_HEAT', desc: 'Reach heat 80 without getting busted',target: 80,   reward: { rep: 25, gold: 300 } },
  { type: 'COMBO_REACH',  desc: 'Reach combo x10',                     target: 10,   reward: { rep: 20, gold: 200 } },
];

const BARTER_CD      = DEV_MODE ? 10   : 300;
const AI_SUBROUTINE_CYCLE = DEV_MODE ? 30  : 3600;
const RAID_CD_MIN    = DEV_MODE ? 60   : 480;   // 8 min
const RAID_CD_MAX    = DEV_MODE ? 60   : 900;   // 15 min
const RAID_DURATION  = DEV_MODE ? 15   : 60;

function randomRaidInterval() {
  return RAID_CD_MIN + Math.floor(Math.random() * (RAID_CD_MAX - RAID_CD_MIN + 1));
}

const RUNNER_LABELS = {
  streetRunner: 'STREET_RUNNER', dataThief: 'DATA_THIEF', infiltrator: 'INFILTRATOR',
  fixer: 'FIXER', shadowBroker: 'SHADOW_BROKER',
};

// ── DISTRICTS ─────────────────────────────────────────────────────────────────

export const DISTRICTS = {
  neon_strip:   { label: 'NEON_STRIP',   lootMult: 1.0, heatDecayBase: 0.2,  unlockLevel: 1, requiresPrestige: 0 },
  corp_zone:    { label: 'CORP_ZONE',    lootMult: 1.5, heatDecayBase: 0.16, unlockLevel: 5, requiresPrestige: 0 },
  apex_citadel: { label: 'APEX_CITADEL', lootMult: 2.5, heatDecayBase: 0.1,  unlockLevel: 8, requiresPrestige: 0 },
  dark_net:     { label: 'DARK_NET',     lootMult: 3.5, heatDecayBase: 0.4,  unlockLevel: 8, requiresPrestige: 1 },
};

// ── UPGRADE DEFINITIONS ───────────────────────────────────────────────────────

export const UPGRADE_DEFS = [
  { key: 'ghostProtocol',  label: 'GHOST_PROTOCOL',  baseCost: 50,  max: 10, effect: 'Siphon success +2% / lvl'      },
  { key: 'neuralBoost',    label: 'NEURAL_BOOST',    baseCost: 80,  max: 15, effect: 'Max stamina +10 / lvl'         },
  { key: 'signalDampener', label: 'SIGNAL_DAMPENER', baseCost: 120, max: 8,  effect: 'Heat generated -10% / lvl'     },
  { key: 'stimPack',       label: 'STIM_PACK',       baseCost: 200, max: 10, effect: 'Stamina regen +0.5/s / lvl'    },
  { key: 'traceEraser',    label: 'TRACE_ERASER',    baseCost: 150, max: 6,  effect: 'Heat decay +0.1/s / lvl'       },
  { key: 'iceBreaker',     label: 'ICE_BREAKER',     baseCost: 350, max: 5,  effect: 'Bust lockout -1s / lvl'        },
  { key: 'darkChannel',    label: 'DARK_CHANNEL',    baseCost: 200, max: 8,  effect: 'Item cooldown -30s / lvl'      },
  { key: 'voidDrive',         label: 'VOID_DRIVE',         baseCost: 500, max: 6, effect: 'Inventory +2 slots / lvl'               },
  { key: 'proxyServers',     label: 'PROXY_SERVERS',     baseCost: 400, max: 5, effect: 'Bust threshold +10 / lvl (default 100)' },
  { key: 'quantumEncryption',label: 'QUANTUM_ENCRYPTION',baseCost: 800, max: 1, effect: 'On BUSTED: save 20% of inventory'        },
  { key: 'autoFencer',       label: 'AUTO_FENCER',       baseCost: 500, max: 1, effect: 'Auto-sell cold items every 30s'          },
  { key: 'aiSubroutine',    label: 'AI_SUBROUTINE',     baseCost: 600, max: 1, effect: 'Every 60min: auto-reduce heat by 25'       },
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
  first_siphon:   "You found the terminal. Good. Don't trust anyone.",
  level_3:        "Aether-Biotech knows someone is watching. Be careful.",
  first_busted:   "They caught you. But you're still alive. That means something.",
  first_runner:   "You're building something. THE EYE doesn't like that.",
  level_5:        "I've been watching your progress. You're better than I expected.",
  first_prestige: "New iteration. Same city. You remember more than you should.",
  gold_10k:       "Money means nothing here. REP means everything.",
  betrayal:       "Someone talked. Check your roster.",
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

export function effectiveSuccessRate(baseRate, level, levelBonus, heat, ghostProtocol = 0) {
  const heatPenalty =
    heat >= 81 ? 0.40 :
    heat >= 61 ? 0.25 :
    heat >= 31 ? 0.10 : 0;
  const gp = (baseRate === 0.70 || baseRate === 0.65) ? ghostProtocol * 0.02 : 0;
  return Math.min(0.95, baseRate + (level - 1) * levelBonus + gp - heatPenalty);
}

// ── PRIVATE HELPERS ───────────────────────────────────────────────────────────

function addLog(log, message) {
  const t = new Date().toLocaleTimeString('en-US', { hour12: false });
  return [`[${t}] ${message}`, ...log].slice(0, 50);
}

function getMaxInventory(upgrades) {
  return 12 + (upgrades.voidDrive ?? 0) * 2;
}

function makeItem(template, districtMult = 1, upgrades = {}, intelUpgrades = {}) {
  const deepSourceBonus      = (intelUpgrades.deepSource ?? 0) >= 1 ? 1.10 : 1;
  const darkChannelReduction = (upgrades.darkChannel ?? 0) * 30;
  return {
    ...template,
    gold: Math.round(template.gold * districtMult * deepSourceBonus),
    instanceId: `${template.id}_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    isHot: true,
    cooldownRemaining: Math.max(30, template.cooldown - darkChannelReduction),
  };
}

function applyBustedCheck(state) {
  const bustThreshold = 100 + (state.upgrades?.proxyServers ?? 0) * 10;
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
    heat:           0,
    inventory:      savedInventory,
    layLowActive:   false,
    layLowTimer:    0,
    comboCount:     0,
    heatSpikeTimer: 0,
    bustedLockout:  lockout,
    feedback:       { type: 'BUSTED', ts: Date.now() },
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
  if (next.level === 3) next = addZero(next, 'level_3');
  if (next.level === 5) next = addZero(next, 'level_5');
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
  if (state.stamina < 10) {
    return { ...state, log: addLog(state.log, ':: SIPHON ABORTED — INSUFFICIENT_STAMINA') };
  }

  const distMult    = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult    = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const successRate = Math.min(0.95, 0.70 + (state.level - 1) * 0.03 + (state.upgrades.ghostProtocol ?? 0) * 0.02 - heatPenalty);
  const newStamina  = state.stamina - 10;
  const heatFail    = Math.round(10 * heatMult);
  const heatOk      = Math.round(5  * heatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, ':: COMBO BREAK');
    nextLog = addLog(nextLog, `:: ${MSG.siphonFail()} :: HEAT +${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot = getRandomLoot(STANDARD_LOOT);
  const rawItem = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const { item, isCritical, newCombo } = applyComboAndCrit(rawItem, state);
  const isHighValue = HIGH_VALUE_IDS.has(loot.id);

  let nextLog = addLog(state.log, `:: ${MSG.siphonSuccess(loot.id)}${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`);
  if (isCritical)   nextLog = addLog(nextLog, `:: CRITICAL EXTRACTION :: [${loot.id}] :: x10 VALUE :: +${item.gold.toLocaleString()} CR`);
  if (isHighValue)  nextLog = addLog(nextLog, ':: HEAT_SPIKE :: High-value asset detected :: trace suppression offline 10s');
  nextLog = addLog(nextLog, ':: REP +1 :: SIPHON successful');

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + loot.xp,
    reputation:     state.reputation + 1,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: loot.id, critical: isCritical, ts: Date.now() },
    log:            nextLog,
  });
  next = applyBustedCheck(next);
  next = addZero(next, 'first_siphon');
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'SIPHON_COUNT', 1);
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
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

  const distMult    = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult    = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const successRate = Math.min(0.95, 0.55 + (state.level - 1) * 0.04 - heatPenalty);
  const newStamina  = state.stamina - 25;
  const heatFail    = Math.round(20 * heatMult);
  const heatOk      = Math.round(15 * heatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, ':: COMBO BREAK');
    nextLog = addLog(nextLog, `:: ${MSG.breachFail()} :: HEAT +${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot = getRandomLoot(PREMIUM_LOOT);
  const rawItem = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const { item, isCritical, newCombo } = applyComboAndCrit(rawItem, state);
  const isHighValue = HIGH_VALUE_IDS.has(loot.id);

  let nextLog = addLog(state.log, `:: ${MSG.breachSuccess(loot.id)}${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`);
  if (isCritical)  nextLog = addLog(nextLog, `:: CRITICAL EXTRACTION :: [${loot.id}] :: x10 VALUE :: +${item.gold.toLocaleString()} CR`);
  if (isHighValue) nextLog = addLog(nextLog, ':: HEAT_SPIKE :: High-value asset detected :: trace suppression offline 10s');
  nextLog = addLog(nextLog, ':: REP +3 :: BREACH successful');

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + loot.xp,
    reputation:     state.reputation + 3,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: loot.id, critical: isCritical, ts: Date.now() },
    log:            nextLog,
  });
  next = applyBustedCheck(next);
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'BREACH_COUNT', 1);
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
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

  const distMult    = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult    = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const successRate = Math.min(0.95, 0.65 + (state.level - 1) * 0.03 - heatPenalty);
  const newStamina  = state.stamina - 15;
  const heatFail    = Math.round(12 * heatMult);
  const heatOk      = Math.round(8  * heatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, ':: COMBO BREAK');
    nextLog = addLog(nextLog, `:: ${MSG.deepSiphonFail()} :: HEAT +${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot = getRandomLoot(DEEP_SIPHON_LOOT);
  const rawItem = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const { item, isCritical, newCombo } = applyComboAndCrit(rawItem, state);
  const isHighValue = HIGH_VALUE_IDS.has(loot.id);

  let nextLog = addLog(state.log, `:: ${MSG.deepSiphonSuccess(loot.id)}${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`);
  if (isCritical)  nextLog = addLog(nextLog, `:: CRITICAL EXTRACTION :: [${loot.id}] :: x10 VALUE :: +${item.gold.toLocaleString()} CR`);
  if (isHighValue) nextLog = addLog(nextLog, ':: HEAT_SPIKE :: High-value asset detected :: trace suppression offline 10s');

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + loot.xp,
    reputation:     state.reputation + 2,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: loot.id, critical: isCritical, ts: Date.now() },
    log:            nextLog,
  });
  next = applyBustedCheck(next);
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
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

  const distMult    = DISTRICTS[state.district]?.lootMult ?? 1;
  const heatMult    = Math.max(0, 1 - (state.upgrades.signalDampener ?? 0) * 0.1);
  const heatPenalty = state.heat >= 81 ? 0.40 : state.heat >= 61 ? 0.25 : state.heat >= 31 ? 0.10 : 0;
  const successRate = Math.min(0.95, 0.35 + (state.level - 1) * 0.03 - heatPenalty);
  const newStamina  = state.stamina - 40;
  const heatFail    = Math.round(35 * heatMult);
  const heatOk      = Math.round(25 * heatMult);

  if (Math.random() >= successRate) {
    const comboBroke = (state.comboCount ?? 0) > 0;
    let nextLog = state.log;
    if (comboBroke) nextLog = addLog(nextLog, ':: COMBO BREAK');
    nextLog = addLog(nextLog, `:: ${MSG.mainframeFail()} :: HEAT +${heatFail}`);
    return applyBustedCheck({
      ...state,
      stamina:    newStamina,
      heat:       Math.min(100, state.heat + heatFail),
      comboCount: 0,
      feedback:   { type: 'FAIL', ts: Date.now() },
      log:        nextLog,
    });
  }

  const loot = getRandomLoot(VAULT_LOOT);
  const rawItem = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  const { item, isCritical, newCombo } = applyComboAndCrit(rawItem, state);
  const isHighValue = HIGH_VALUE_IDS.has(loot.id); // vault loot is always high-value

  let nextLog = addLog(state.log, `:: ${MSG.mainframeSuccess(loot.id)}${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`);
  if (isCritical)  nextLog = addLog(nextLog, `:: CRITICAL EXTRACTION :: [${loot.id}] :: x10 VALUE :: +${item.gold.toLocaleString()} CR`);
  if (isHighValue) nextLog = addLog(nextLog, ':: HEAT_SPIKE :: High-value asset detected :: trace suppression offline 10s');
  nextLog = addLog(nextLog, ':: REP +8 :: MAINFRAME_HACK successful');

  let next = checkLevelUp({
    ...state,
    stamina:        newStamina,
    heat:           Math.min(100, state.heat + heatOk),
    xp:             state.xp + loot.xp,
    reputation:     state.reputation + 8,
    comboCount:     newCombo,
    heatSpikeTimer: isHighValue ? 10 : (state.heatSpikeTimer ?? 0),
    inventory:      [...state.inventory, item],
    feedback:       { type: 'SUCCESS', gold: item.gold, item: loot.id, critical: isCritical, ts: Date.now() },
    log:            nextLog,
  });
  next = applyBustedCheck(next);
  if (next.gold >= 10000) next = addZero(next, 'gold_10k');
  next = updateDailyChallenge(next, 'COMBO_REACH', newCombo);
  return next;
}

export function layLow(state) {
  if (state.bustedLockout > 0)  return state;
  if (state.layLowActive)       return state;
  if (state.layLowCooldown > 0) return state;
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
  if (state.reputation < def.repCost) return state;
  return {
    ...state,
    reputation:    state.reputation - def.repCost,
    intelUpgrades: { ...(state.intelUpgrades ?? {}), [upgradeKey]: currentLevel + 1 },
    feedback: { type: 'UPGRADE', label: def.label, ts: Date.now() },
    log: addLog(state.log, `:: INTEL: [${def.label}] UNLOCKED :: -${def.repCost} REP`),
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
  const cost = getRunnerCost(cfg.baseCost, count);
  if (state.gold < cost) return state;
  let next = {
    ...state,
    gold:    state.gold - cost,
    runners: { ...state.runners, [runnerType]: count + 1 },
    log: addLog(state.log, `:: ${cfg.label} HIRED (${count + 1}/5) :: -${cost.toLocaleString()} CR`),
  };
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
      voidDrive: 0, proxyServers: 0, quantumEncryption: 0, autoFencer: 0, aiSubroutine: 0,
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
    feedback:           null,
    dailyFeedback:      null,
    lastTickTime:       Date.now(),
    runGoldEarned:      0,
    district:           'neon_strip',
    // Keep
    prestige:           newPrestige,
    prestigeMultiplier: mult,
    reputation:         state.reputation,
    totalGoldEarned:    state.totalGoldEarned ?? 0,
    offlineAccrualCap:  state.offlineAccrualCap,
    intelUpgrades:      state.intelUpgrades ?? {},
    zeroMessages:       state.zeroMessages ?? [],
    log: addLog([], `>> PRESTIGE ACTIVATED :: RUN #${newPrestige} INITIATED :: MULTIPLIER x${mult.toFixed(2)}`),
  };
  next = addZero(next, 'first_prestige');
  return next;
}

// ── OFFLINE PROGRESS ──────────────────────────────────────────────────────────

export function calculateOfflineProgress(state, nowMs) {
  const rawElapsed = (nowMs - (state.lastTickTime ?? nowMs)) / 1000;
  const elapsed    = Math.min(rawElapsed, state.offlineAccrualCap ?? 14400);
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

  return { elapsed, earnedGold, heatAfter };
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

  // ── Daily challenge reset (86400 real seconds) ────────────────────────────
  const nowMs = Date.now();
  const dc = s.dailyChallenge;
  if (!dc || !dc.type || (nowMs - (dc.lastReset ?? 0)) >= 86400000) {
    s = { ...s, dailyChallenge: pickNewChallenge(nowMs) };
  }

  const effectiveMaxStamina = 100 + (s.upgrades.neuralBoost ?? 0) * 10;
  const baseRegen = 2 + (s.upgrades.stimPack ?? 0) * 0.5;
  s = { ...s, stamina: Math.min(effectiveMaxStamina, s.stamina + (s.layLowActive ? baseRegen + 2 : baseRegen)) };

  if (s.bustedLockout > 0) {
    return { ...s, bustedLockout: s.bustedLockout - 1, lastTickTime: nowMs };
  }

  // ── Heat decay (paused during heat spike unless lay_low is active) ────────
  if ((s.heatSpikeTimer ?? 0) > 0) {
    s = { ...s, heatSpikeTimer: s.heatSpikeTimer - 1 };
    if (s.layLowActive) {
      s = { ...s, heat: Math.max(0, parseFloat((s.heat - 2).toFixed(2))) };
    }
  } else {
    const distDecayBase = DISTRICTS[s.district]?.heatDecayBase ?? 0.2;
    const traceBonus    = (s.upgrades.traceEraser ?? 0) * 0.1;
    const corpMoleMult  = (s.intelUpgrades?.corpMole ?? 0) >= 1 ? 2 : 1;
    const heatDecay     = s.layLowActive ? 2 : (distDecayBase + traceBonus) * corpMoleMult;
    s = { ...s, heat: Math.max(0, parseFloat((s.heat - heatDecay).toFixed(2))) };
  }

  // ── SURVIVE_HEAT daily challenge ──────────────────────────────────────────
  if (s.heat >= 80) s = updateDailyChallenge(s, 'SURVIVE_HEAT', s.heat);

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
    const synergyMult = count >= 5 ? 1.20 : 1;
    const income = applyIncome(cur, count * crPerCycle * synergyMult);
    const heat   = DEV_MODE ? 0 : count * heatPerCycle;
    let next = {
      ...cur,
      gold:            income.gold,
      totalGoldEarned: income.totalGoldEarned,
      runGoldEarned:   income.runGoldEarned,
      heat:            Math.min(100, cur.heat + heat),
      runnerTick:      { ...cur.runnerTick, [runnerKey]: 0 },
      log: addLog(cur.log, `:: ${runnerKey.toUpperCase().replace('RUNNER','_RUNNER').replace('BROKER','_BROKER')} x${count} :: +${income._earned.toLocaleString()} CR${heat > 0 ? ` :: HEAT +${heat}` : ''}`),
    };
    if (!DEV_MODE) next = applyBustedCheck(next);
    return next;
  }

  s = runnerTick(s, 'streetRunner', 2,   RUNNER_SR_CYCLE, 1);
  s = runnerTick(s, 'dataThief',    8,   RUNNER_DT_CYCLE, 2);
  s = runnerTick(s, 'infiltrator',  35,  RUNNER_IF_CYCLE, 3);
  s = runnerTick(s, 'fixer',        150, RUNNER_FX_CYCLE, 1);
  s = runnerTick(s, 'shadowBroker', 600, RUNNER_SB_CYCLE, 0);

  if (s.upgrades.autoFencer >= 1) {
    const newAutoTick = (s.autoFencerTick ?? 0) + 1;
    if (newAutoTick >= 30) {
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
        layLowCooldown: 0,
        log: raidLog,
      };
    } else {
      s = { ...s, nextRaidIn: newNext };
    }
  } else {
    const newTimer = (s.raidTimer ?? 0) - 1;
    if (newTimer <= 0) {
      const goldLost = Math.floor(s.gold * 0.30);
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

  return { ...s, lastTickTime: nowMs };
}
