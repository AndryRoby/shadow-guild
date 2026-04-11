// SHADOW_GUILD — Game Logic
// Pure functions only. No React imports.

// ── DEV MODE ─────────────────────────────────────────────────────────────────
export const DEV_MODE = false;

const DARK_MARKET_CD  = DEV_MODE ? 30  : 7200;
const RUNNER_SR_CYCLE = DEV_MODE ? 5   : 30;    // street runner
const RUNNER_DT_CYCLE = DEV_MODE ? 10  : 120;   // data thief
const RUNNER_IF_CYCLE = DEV_MODE ? 15  : 900;   // infiltrator
const RUNNER_FX_CYCLE = DEV_MODE ? 20  : 3600;  // fixer
const RUNNER_SB_CYCLE = DEV_MODE ? 30  : 7200;  // shadow broker

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
  { key: 'voidDrive',      label: 'VOID_DRIVE',      baseCost: 500, max: 6,  effect: 'Inventory +2 slots / lvl'      },
  { key: 'autoFencer',     label: 'AUTO_FENCER',     baseCost: 500, max: 1,  effect: 'Auto-sell cold items every 30s' },
];

export const INTEL_UPGRADE_DEFS = [
  { key: 'netScanner',   label: 'NET_SCANNER',   repCost: 25,  max: 1, effect: 'Show effective success rate on actions' },
  { key: 'corpMole',     label: 'CORP_MOLE',     repCost: 50,  max: 1, effect: 'Heat decay 2x faster'                  },
  { key: 'deepSource',   label: 'DEEP_SOURCE',   repCost: 100, max: 1, effect: 'Loot value +10%'                       },
  { key: 'darkExchange', label: 'DARK_EXCHANGE', repCost: 200, max: 1, effect: 'Dark Market cooldown -30min'           },
];

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
  if (state.heat < 100) return state;
  const iceBreakerLvl = state.upgrades?.iceBreaker ?? 0;
  const lockout = Math.max(1, 10 - iceBreakerLvl);
  return {
    ...state,
    heat: 0,
    inventory: [],
    layLowActive: false,
    layLowTimer: 0,
    bustedLockout: lockout,
    feedback: { type: 'BUSTED', ts: Date.now() },
    log: addLog(state.log, `:: [BUSTED] — SYSTEM COMPROMISED :: INVENTORY LOST :: ${lockout}s LOCKOUT`),
  };
}

function checkLevelUp(state) {
  const needed = xpRequired(state.level);
  if (state.xp < needed) return state;
  return checkLevelUp({
    ...state,
    level: state.level + 1,
    xp: state.xp - needed,
    log: addLog(state.log, `:: LEVEL UP → LEVEL ${state.level + 1}`),
  });
}

function applyIncome(state, amount) {
  const mult   = state.prestigeMultiplier ?? 1;
  const earned = Math.round(amount * mult);
  return {
    gold:           state.gold + earned,
    totalGoldEarned: (state.totalGoldEarned ?? 0) + earned,
    runGoldEarned:   (state.runGoldEarned  ?? 0) + earned,
    _earned:         earned,
  };
}

// ── PLAYER ACTIONS ────────────────────────────────────────────────────────────

export function siphon(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                      return state;
  if (state.layLowActive)                           return state;
  if (state.inventory.length >= maxInventory)       return state;
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
    return applyBustedCheck({
      ...state,
      stamina:  newStamina,
      heat:     Math.min(100, state.heat + heatFail),
      feedback: { type: 'FAIL', ts: Date.now() },
      log: addLog(state.log, `:: SIPHON FAILED — TARGET_TRACED :: HEAT +${heatFail}`),
    });
  }

  const loot = getRandomLoot(STANDARD_LOOT);
  const item = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  return applyBustedCheck(checkLevelUp({
    ...state,
    stamina:    newStamina,
    heat:       Math.min(100, state.heat + heatOk),
    xp:         state.xp + loot.xp,
    reputation: state.reputation + 1,
    inventory:  [...state.inventory, item],
    feedback:   { type: 'SUCCESS', gold: item.gold, item: loot.id, ts: Date.now() },
    log: addLog(state.log, `:: ACQUIRED: [${loot.id}]${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`),
  }));
}

export function breach(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                      return state;
  if (state.layLowActive)                           return state;
  if (state.inventory.length >= maxInventory)       return state;
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
    return applyBustedCheck({
      ...state,
      stamina:  newStamina,
      heat:     Math.min(100, state.heat + heatFail),
      feedback: { type: 'FAIL', ts: Date.now() },
      log: addLog(state.log, `:: BREACH FAILED — ALARM_TRIGGERED :: HEAT +${heatFail}`),
    });
  }

  const loot = getRandomLoot(PREMIUM_LOOT);
  const item = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  return applyBustedCheck(checkLevelUp({
    ...state,
    stamina:    newStamina,
    heat:       Math.min(100, state.heat + heatOk),
    xp:         state.xp + loot.xp,
    reputation: state.reputation + 3,
    inventory:  [...state.inventory, item],
    feedback:   { type: 'SUCCESS', gold: item.gold, item: loot.id, ts: Date.now() },
    log: addLog(state.log, `:: BREACH: [${loot.id}]${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`),
  }));
}

export function deepSiphon(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                      return state;
  if (state.layLowActive)                           return state;
  if (state.inventory.length >= maxInventory)       return state;
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
    return applyBustedCheck({
      ...state,
      stamina:  newStamina,
      heat:     Math.min(100, state.heat + heatFail),
      feedback: { type: 'FAIL', ts: Date.now() },
      log: addLog(state.log, `:: DEEP_SIPHON FAILED — TRACE_DETECTED :: HEAT +${heatFail}`),
    });
  }

  const loot = getRandomLoot(DEEP_SIPHON_LOOT);
  const item = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  return applyBustedCheck(checkLevelUp({
    ...state,
    stamina:    newStamina,
    heat:       Math.min(100, state.heat + heatOk),
    xp:         state.xp + loot.xp,
    reputation: state.reputation + 2,
    inventory:  [...state.inventory, item],
    feedback:   { type: 'SUCCESS', gold: item.gold, item: loot.id, ts: Date.now() },
    log: addLog(state.log, `:: DEEP_SIPHON: [${loot.id}]${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`),
  }));
}

export function mainframeHack(state) {
  const maxInventory = getMaxInventory(state.upgrades);
  if (state.bustedLockout > 0)                      return state;
  if (state.layLowActive)                           return state;
  if (state.inventory.length >= maxInventory)       return state;
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
    return applyBustedCheck({
      ...state,
      stamina:  newStamina,
      heat:     Math.min(100, state.heat + heatFail),
      feedback: { type: 'FAIL', ts: Date.now() },
      log: addLog(state.log, `:: MAINFRAME_HACK FAILED — ICE_DETECTED :: HEAT +${heatFail}`),
    });
  }

  const loot = getRandomLoot(VAULT_LOOT);
  const item = makeItem(loot, distMult, state.upgrades, state.intelUpgrades ?? {});
  return applyBustedCheck(checkLevelUp({
    ...state,
    stamina:    newStamina,
    heat:       Math.min(100, state.heat + heatOk),
    xp:         state.xp + loot.xp,
    reputation: state.reputation + 8,
    inventory:  [...state.inventory, item],
    feedback:   { type: 'SUCCESS', gold: item.gold, item: loot.id, ts: Date.now() },
    log: addLog(state.log, `:: MAINFRAME_HACK: [${loot.id}]${distMult > 1 ? ` [x${distMult}]` : ''} :: +${loot.xp} XP :: HEAT +${heatOk}`),
  }));
}

export function layLow(state) {
  if (state.bustedLockout > 0)  return state;
  if (state.layLowActive)       return state;
  if (state.layLowCooldown > 0) return state;
  return {
    ...state,
    layLowActive: true,
    layLowTimer:  30,
    log: addLog(state.log, ':: LAY_LOW ACTIVATED :: HEAT DISPERSAL IN PROGRESS'),
  };
}

export function sellCooledItems(state) {
  const cold = state.inventory.filter(i => !i.isHot);
  if (cold.length === 0) {
    return { ...state, log: addLog(state.log, ':: SELL FAILED — NO COOLED ITEMS IN INVENTORY') };
  }
  const raw    = cold.reduce((sum, i) => sum + i.gold, 0);
  const income = applyIncome(state, raw);
  return {
    ...state,
    gold:            income.gold,
    totalGoldEarned: income.totalGoldEarned,
    runGoldEarned:   income.runGoldEarned,
    inventory:       state.inventory.filter(i => i.isHot),
    log: addLog(state.log, `:: SOLD ${cold.length} ITEM(S) :: +${income._earned.toLocaleString()} CR`),
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
  return {
    ...state,
    gold:               income.gold,
    totalGoldEarned:    income.totalGoldEarned,
    runGoldEarned:      income.runGoldEarned,
    inventory:          [],
    darkMarketCooldown: cd,
    log: addLog(state.log, `:: DARK_MARKET :: ALL SOLD (60%) :: +${income._earned.toLocaleString()} CR :: CD ${cdLabel}`),
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
    streetRunner:  { level: 3,  baseCost: 300,   requiresPrestige: 0, label: 'STREET_RUNNER'  },
    dataThief:     { level: 5,  baseCost: 800,   requiresPrestige: 0, label: 'DATA_THIEF'     },
    infiltrator:   { level: 7,  baseCost: 2500,  requiresPrestige: 0, label: 'INFILTRATOR'    },
    fixer:         { level: 9,  baseCost: 8000,  requiresPrestige: 0, label: 'FIXER'          },
    shadowBroker:  { level: 1,  baseCost: 25000, requiresPrestige: 1, label: 'SHADOW_BROKER'  },
  };
  const cfg = configs[runnerType];
  if (!cfg) return state;
  if (state.level < cfg.level)                     return state;
  if ((state.prestige ?? 0) < cfg.requiresPrestige) return state;
  const count = state.runners[runnerType] ?? 0;
  if (count >= 5) return state;
  const cost = getRunnerCost(cfg.baseCost, count);
  if (state.gold < cost) return state;
  return {
    ...state,
    gold:    state.gold - cost,
    runners: { ...state.runners, [runnerType]: count + 1 },
    log: addLog(state.log, `:: ${cfg.label} HIRED (${count + 1}/5) :: -${cost.toLocaleString()} CR`),
  };
}

export function setDistrict(state, district) {
  if (!DISTRICTS[district]) return state;
  const dist = DISTRICTS[district];
  if (dist.unlockLevel > state.level)                 return state;
  if ((dist.requiresPrestige ?? 0) > (state.prestige ?? 0)) return state;
  if (state.district === district)                    return state;
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
  return {
    // Reset
    gold:               0,
    level:              1,
    xp:                 0,
    inventory:          [],
    upgrades: {
      ghostProtocol: 0, neuralBoost: 0, signalDampener: 0,
      stimPack: 0, traceEraser: 0, iceBreaker: 0, darkChannel: 0, voidDrive: 0, autoFencer: 0,
    },
    runners:            { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: state.runners?.shadowBroker ?? 0 },
    runnerTick:         { streetRunner: 0, dataThief: 0, infiltrator: 0, fixer: 0, shadowBroker: 0 },
    autoFencerTick:     0,
    heat:               0,
    stamina:            100,
    layLowActive:       false,
    layLowTimer:        0,
    layLowCooldown:     0,
    bustedLockout:      0,
    darkMarketCooldown: 0,
    feedback:           null,
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
    log: addLog([], `>> PRESTIGE ACTIVATED :: RUN #${newPrestige} INITIATED :: MULTIPLIER x${mult.toFixed(2)}`),
  };
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

  // Stamina regen
  const effectiveMaxStamina = 100 + (s.upgrades.neuralBoost ?? 0) * 10;
  const baseRegen = 2 + (s.upgrades.stimPack ?? 0) * 0.5;
  s = { ...s, stamina: Math.min(effectiveMaxStamina, s.stamina + (s.layLowActive ? baseRegen + 2 : baseRegen)) };

  if (s.bustedLockout > 0) {
    return { ...s, bustedLockout: s.bustedLockout - 1, lastTickTime: Date.now() };
  }

  // Heat decay
  const distDecayBase = DISTRICTS[s.district]?.heatDecayBase ?? 0.2;
  const traceBonus    = (s.upgrades.traceEraser ?? 0) * 0.1;
  const corpMoleMult  = (s.intelUpgrades?.corpMole ?? 0) >= 1 ? 2 : 1;
  const heatDecay     = s.layLowActive ? 2 : (distDecayBase + traceBonus) * corpMoleMult;
  s = { ...s, heat: Math.max(0, parseFloat((s.heat - heatDecay).toFixed(2))) };

  // Inventory cooldown timers
  s = {
    ...s,
    inventory: s.inventory.map(item => {
      if (!item.isHot) return item;
      const rem = item.cooldownRemaining - 1;
      return { ...item, cooldownRemaining: Math.max(0, rem), isHot: rem > 0 };
    }),
  };

  // ── Runner ticks (DRY helper)
  function runnerTick(cur, runnerKey, crPerCycle, cycle, heatPerCycle) {
    const count   = cur.runners[runnerKey] ?? 0;
    const newTick = (cur.runnerTick[runnerKey] ?? 0) + 1;
    if (count === 0) return { ...cur, runnerTick: { ...cur.runnerTick, [runnerKey]: newTick } };
    if (newTick < cycle) return { ...cur, runnerTick: { ...cur.runnerTick, [runnerKey]: newTick } };
    const income = applyIncome(cur, count * crPerCycle);
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

  // ── AUTO_FENCER: auto-sell cold items every 30s
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

  // Dark market cooldown
  if (s.darkMarketCooldown > 0) s = { ...s, darkMarketCooldown: s.darkMarketCooldown - 1 };

  // LAY LOW timer
  if (s.layLowActive) {
    const remaining = s.layLowTimer - 1;
    if (remaining <= 0) {
      s = { ...s, layLowActive: false, layLowTimer: 0, layLowCooldown: 60,
            log: addLog(s.log, ':: LAY_LOW ENDED :: 60s COOLDOWN') };
    } else {
      s = { ...s, layLowTimer: remaining };
    }
  } else if (s.layLowCooldown > 0) {
    s = { ...s, layLowCooldown: s.layLowCooldown - 1 };
  }

  return { ...s, lastTickTime: Date.now() };
}
