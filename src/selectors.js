// Derived state selectors.
// Pure functions: (state) => formatted data for UI components.
// Import: import { getNetworkNodes, getDistrictData, ... } from './selectors.js';

import { CITY_MAP, DISTRICTS as AETHERIA_DISTRICTS } from '../CITY_MAP.js';
import { DISTRICT_COLORS, COLORS } from './design/colors.js';
import { calculateMapModifiers, DEV_MODE, PROTOCOL_DEFS, calculateHeatFlow, UPGRADE_DEFS, INTEL_UPGRADE_DEFS, getUpgradeCost, getIntelUpgradeCost, REVEAL_DEFS } from './gameLogic.js';



// ─── NETWORK NODES ─────────────────────────────────────────────────────────
// Combines capturedHexes + nodeStability + reclaiming + CITY_MAP
// into an array of objects ready for <NodeCard />.
export function getNetworkNodes(state) {
  const captured = state.capturedHexes ?? [];
  const stability = state.nodeStability ?? {};
  const reclaiming = state.reclaiming ?? {};

  return captured.map(hexId => {
    const hex = CITY_MAP[hexId];
    if (!hex) return null;

    const districtColor = DISTRICT_COLORS[hex.districtId] ?? COLORS.amber;
    const nodeStability = stability[hexId] ?? 100;
    const reclaimData = reclaiming[hexId];

    // Estimate yield from lootMultiplier (rough CR/min indicator)
    const yieldCr = Math.round((hex.lootMultiplier ?? 1) * 120);

    return {
      id: hexId,
      name: hex.label ?? hexId,
      districtId: hex.districtId,
      districtColor,
      stability: Math.round(nodeStability),
      yieldCr,
      reclaiming: !!reclaimData,
      reclaimProgress: reclaimData?.progress ?? 0,
      reclaimStage: reclaimData?.stage ?? null,
      isAnchor: hexId === 'western_warpgate', // can't be disconnected
      faction: hex.faction,
      icon: hex.icon,
    };
  }).filter(Boolean);
}

// ─── ACTIVE MISSIONS ───────────────────────────────────────────────────────
// Formats state.activeMissions for <MissionRow />.
export function getActiveMissions(state) {
  const missions = state.activeMissions ?? [];
  const now = Date.now();

  return missions.map(m => {
    const agent = (state.agents ?? []).find(a => a.id === m.agentId);
    const hex = CITY_MAP[m.hexId];
    const duration = m.endTime - m.startTime;
    const timer = Math.max(0, m.endTime - now);
    const secondsLeft = Math.ceil(timer / 1000);
    const totalSeconds = Math.ceil(duration / 1000);

    return {
      id: `${m.agentId}_${m.hexId}`,
      hexId: m.hexId,
      agentId: m.agentId,
      agent: agent?.name ?? m.runnerType?.toUpperCase() ?? 'AGENT',
      agentAvatar: agent?.name?.slice(0, 2).toUpperCase() ?? 'A?',
      target: hex?.label ?? m.hexId,
      duration,
      timer,
      secondsLeft,
      totalSeconds,
      chance: m.successChance ?? 50,
      runnerType: m.runnerType,
      risk: m.risk ?? 'BALANCED',
    };
  });
}

// ─── DISTRICT DATA ─────────────────────────────────────────────────────────
// Current district info for <OpsTab /> target briefing.
export function getDistrictData(state) {
  const d = AETHERIA_DISTRICTS[state.district] ?? AETHERIA_DISTRICTS.Z4;

  // Heat decay rate = how fast heat cools per second in this district
  // Lower value = more dangerous (heat stays longer)
  const heatDecay = d.heatDecayBase ?? 0.2;

  return {
    id: state.district,
    name: d.name,
    desc: d.desc,
    color: DISTRICT_COLORS[state.district] ?? COLORS.amber,
    mult: d.lootMultiplier ?? 1,
    heatDecay,           // actual decay rate (0.05 to 0.4)
    heatRisk: 1 / heatDecay,  // inverse — "how dangerous" scale 2.5 to 20
    xpMult: d.xpMultiplier ?? 1,
  };
}

// ─── FLOW RATES ────────────────────────────────────────────────────────────
// Real-time CPS / stamina regen / heat per minute.
// All values match what tick() actually does each second.
export function getFlowRates(state) {
  // ── CPS from active agents ──────────────────────────────────────────────
  // Matches tick() agent income calculation exactly.
  let cps = 0;
  const activeAgents = (state.agents ?? []).filter(a => a.status === 'ACTIVE');
  const basePayouts = { streetRunner: 15, dataThief: 60, infiltrator: 250, fixer: 1000, shadowBroker: 5000 };
  const baseCycles = {
    streetRunner: DEV_MODE ? 5 : 30,
    dataThief:    DEV_MODE ? 10 : 120,
    infiltrator:  DEV_MODE ? 15 : 900,
    fixer:        DEV_MODE ? 20 : 3600,
    shadowBroker: DEV_MODE ? 30 : 7200,
  };

  // Per-role active count → synergy applies per role (matches tick)
  const roleCounts = activeAgents.reduce((acc, a) => {
    acc[a.role] = (acc[a.role] ?? 0) + 1;
    return acc;
  }, {});

  // HW overclock affects cycle speed
  const hwLvl = state.upgrades?.hwOverclock ?? 0;
  const hwSpeedMult = Math.pow(0.85, hwLvl);

  const idleMult = state.isIdle ? 0.6 : 1.0;
  const guildMult = state.prestigePerks?.GUILD_MASTER ? 1.25 : 1;
  const prestigeMult = state.prestigeMultiplier ?? 1;

  activeAgents.forEach(a => {
    const base = basePayouts[a.role] ?? 0;
    const cycleSec = Math.max(1, Math.round((baseCycles[a.role] ?? 60) * hwSpeedMult));
    const specMult = a.spec === 'GREEDY' ? 1.5 : 1;
    const traitMult = (a.traits ?? []).includes('GREEDY') ? 1.3 : 1;
    const synergyMult = (roleCounts[a.role] ?? 0) >= 5 ? 1.2 : 1;

    // Amount earned per cycle, divided by cycle length = per-second rate
    const perCycle = base * specMult * guildMult * traitMult * idleMult * prestigeMult * synergyMult;
    cps += perCycle / cycleSec;
  });

  // Map passive gold
  const passiveGold = calculateMapModifiers(state).passiveGold ?? 0;
  if (passiveGold > 0) cps += passiveGold * idleMult;

  // Idle focus bonus (matches tick)
  const secSinceClick = Math.floor((Date.now() - (state.lastInteractionTime || Date.now())) / 1000);
  const idleFocusBonus = (!state.isIdle && secSinceClick >= 60) ? Math.min(3, 1 + (secSinceClick - 60) / 120) : 1;
  cps *= idleFocusBonus;

  // ── STAMINA REGEN (per second) ──────────────────────────────────────────
  const baseRegen = 2 + (state.upgrades?.stimPack ?? 0) * 0.5;
  const protoStaminaMult = PROTOCOL_DEFS[state.activeProtocol ?? 'NONE']?.staminaRegenMult ?? 1;
  const staRegen = (state.layLowActive ? baseRegen + 2 : baseRegen) * protoStaminaMult;

  // ── HEAT PER MINUTE ─────────────────────────────────────────────────────
  // Use the single source of truth — same function tick() uses.
  const heatPerSec = calculateHeatFlow(state);
  const heatPerMin = heatPerSec * 60;

  return {
    cps,
    staRegen,
    heatPerMin,
    idleFocusBonus,
    secSinceClick,
  };
}

// ─── BANDWIDTH ─────────────────────────────────────────────────────────────
// Fixes the bug where bandwidth was calculated inconsistently.
// Single source of truth.
export function getBandwidth(state) {
  const used = (state.capturedHexes?.length ?? 0) + (state.activeMissions?.length ?? 0);
  const overclockBonus = state.overclockActive ? 2 : 0;
  const max = 1 + (state.intelUpgrades?.serverRacks ?? 0) + overclockBonus;
  const overload = Math.max(0, used - max);
  const heatLeakPerSec = Math.round(overload * 0.8 * 10) / 10; // fix the floating point bug
  const decayMultiplier = 100 + (overload * 300);

  return {
    used,
    max,
    overload,
    heatLeakPerSec,
    decayMultiplier,
    isOverloaded: overload > 0,
    loadPct: max > 0 ? (used / max) * 100 : 0,
  };
}

// Concurrent missions limit (different from bandwidth — gates how many agents
// can be deployed simultaneously). Formula matches DEPLOY_RUNNER reducer.
export function getMissionLimit(state) {
  const max = 2 + Math.floor((state.level ?? 1) / 5);
  const used = (state.activeMissions ?? []).length;
  return { used, max, isFull: used >= max };
}

// ─── MAP MODIFIERS (passthrough) ───────────────────────────────────────────
// Re-exports existing calculateMapModifiers for consistency.
export function getMapModifiers(state) {
  return calculateMapModifiers(state);
}

// ─── AGENT ROSTER (enhanced view) ──────────────────────────────────────────
// Adds UI-friendly derived fields to each agent.
export function getAgentRoster(state) {
  const agents = state.agents ?? [];

  return agents.map(a => ({
    ...a,
    // Derived UI state
    avatar: a.name?.slice(0, 2).toUpperCase() ?? 'A?',
    pendingSpec: a.spec === 'PENDING',
    training: a.status === 'TRAINING',
    onMission: a.status === 'ON_MISSION',
    exhausted: a.status === 'EXHAUSTED',
    injured: a.status === 'INJURED',
    captured: a.status === 'CAPTURED',
    // Stats (ensure they exist for older saves)
    stats: a.stats ?? { stealth: 50, speed: 50, intel: 50 },
    loyalty: a.loyalty ?? 50,
    traits: a.traits ?? [],
  }));
}

// ─── LOG TIER → COLOR ──────────────────────────────────────────────────────
// Maps lastLogTier to border color for <SystemLog /> panel.
export function getLogTierColor(tier) {
  switch (tier) {
    case 'success': return COLORS.green;
    case 'fail':    return COLORS.red;
    case 'warning': return COLORS.orange;
    case 'info':    return COLORS.cyan;
    case 'zero':    return COLORS.zeroMessage;
    default:        return COLORS.amber;
  }
}

// ─── AVAILABLE NODES ─────────────────────────────────────────────────────
// Hackable (not owned, adjacent to owned) + locked (not adjacent) nodes.
// Grouped by district for the Network tab.
export function getAvailableNodes(state) {
  const captured = new Set(state.capturedHexes ?? []);
  const discovery = new Set(state.mapDiscovery ?? []);
  const activeMissions = new Set((state.activeMissions ?? []).map(m => m.hexId));

  const result = [];

  for (const [hexId, hex] of Object.entries(CITY_MAP)) {
    if (!hex || hex.type === 'empty_block') continue;
    if (captured.has(hexId)) continue;
    if (!discovery.has(hexId)) continue;

    const isAdjacent = (hex.connections ?? []).some(id => captured.has(id));
    const inProgress = activeMissions.has(hexId);

    result.push({
      id: hexId,
      name: hex.label ?? hexId,
      districtId: hex.districtId,
      districtColor: DISTRICT_COLORS[hex.districtId] ?? COLORS.amber,
      icon: hex.icon,
      faction: hex.faction,
      connections: hex.connections ?? [],
      captureTime: hex.captureTime ?? 45,
      lootMult: hex.lootMultiplier ?? 1,
      canHack: isAdjacent && !inProgress,
      inProgress,
      effectHooks: hex.effectHooks ?? [],
    });
  }

  return result;
}

// ─── NODES GROUPED BY DISTRICT ───────────────────────────────────────────
export function getNodesByDistrict(state) {
  const owned = getNetworkNodes(state);
  const available = getAvailableNodes(state);

  const districts = {};

  for (const node of owned) {
    if (!districts[node.districtId]) districts[node.districtId] = { owned: [], available: [] };
    districts[node.districtId].owned.push(node);
  }
  for (const node of available) {
    if (!districts[node.districtId]) districts[node.districtId] = { owned: [], available: [] };
    districts[node.districtId].available.push(node);
  }

  return districts;
}

// ─── TAB BADGES ────────────────────────────────────────────────────────────
// Returns { count, color, pulse } or null per tab.
// Inspired by Melvor Idle / NGU Idle notification system.

export function getTabBadges(state) {
  const badges = {};

  // AGENCY: pending spec + captured + available heal (has gold for any)
  const pendingSpec = (state.agents ?? []).filter(a => a.spec === 'PENDING').length;
  const captured = (state.agents ?? []).filter(a => a.status === 'CAPTURED').length;
  const gold = state.gold ?? 0;
  const healable = (state.agents ?? []).filter(a => {
    if (!['EXHAUSTED', 'INJURED'].includes(a.status)) return false;
    const healCost = a.status === 'INJURED' ? 500 : 100; // Approx
    return gold >= healCost;
  }).length;

  const agencyTotal = pendingSpec + captured + healable;
  if (agencyTotal > 0) {
    badges.AGENCY = {
      count: agencyTotal,
      color: captured > 0 ? '#ef4444' : pendingSpec > 0 ? '#FFC174' : '#22c55e',
      pulse: pendingSpec > 0 || captured > 0,
    };
  }

  // UPGRADES: affordable upgrades + reveals + intel (if unlocked)
  let affordable = 0;
  
  // Standard CR upgrades
  for (const def of UPGRADE_DEFS) {
    const lvl = state.upgrades?.[def.key] ?? 0;
    if (lvl >= def.max) continue;
    const cost = getUpgradeCost(def.baseCost, lvl);
    if (gold >= cost) affordable++;
  }

  // Intel (REP) upgrades - gated by unlock requirement and applying discount
  const isIntelUnlocked = (state.level ?? 1) >= 6 && (state.reputation ?? 0) >= 50;
  if (isIntelUnlocked) {
    const hasIntelDiscount = !!state.prestigePerks?.INTEL_DISCOUNT;
    for (const def of INTEL_UPGRADE_DEFS) {
      const lvl = state.intelUpgrades?.[def.key] ?? 0;
      if (lvl >= def.max) continue;
      const baseCost = getIntelUpgradeCost(def.key, lvl);
      const cost = hasIntelDiscount ? Math.round(baseCost * 0.8) : baseCost;
      if ((state.reputation ?? 0) >= cost) affordable++;
    }
  }

  // Reveals (CR)
  for (const def of REVEAL_DEFS) {
    if (state.reveals?.[def.id]) continue; // Už vlastnené
    if (gold >= def.cost) affordable++;
  }
  
  if (affordable > 0) {
    badges.UPGRADES = { count: affordable, color: '#22c55e', pulse: false };
  }

  // NETWORK: actionable = has idle agent AND bandwidth free AND adjacent-hackable node exists
  const captured_set = new Set(state.capturedHexes ?? []);
  const discovery = new Set(state.mapDiscovery ?? []);
  const activeMissions = new Set((state.activeMissions ?? []).map(m => m.hexId));
  const bwUsed = (state.capturedHexes?.length ?? 0) + (state.activeMissions?.length ?? 0);
  const bwMax = 1 + (state.intelUpgrades?.serverRacks ?? 0) + (state.overclockActive ? 2 : 0);
  const bandwidthFree = bwUsed < bwMax;
  const activeIdleAgents = (state.agents ?? []).filter(a => a.status === 'ACTIVE').length;

  if (bandwidthFree && activeIdleAgents > 0) {
    // Count adjacent hackable nodes
    let hackable = 0;
    for (const hexId of discovery) {
      if (captured_set.has(hexId) || activeMissions.has(hexId)) continue;
      const hex = CITY_MAP[hexId];
      if (!hex || hex.type === 'empty_block') continue;
      const isAdjacent = (hex.connections ?? []).some(id => captured_set.has(id));
      if (isAdjacent) hackable++;
    }
    if (hackable > 0) {
      badges.NETWORK = {
        count: Math.min(hackable, activeIdleAgents),
        color: '#00d4ff',
        pulse: false,
      };
    }
  }

  // AWAKENING: ready to prestige
  if ((state.level ?? 1) >= 10 && (state.runGoldEarned ?? 0) >= 100000) {
    badges.AWAKENING = { color: '#ffd700', pulse: true };
  }

  return badges;
}

// ─── CURRENT OBJECTIVE ─────────────────────────────────────────────────────
// Determines the player's immediate "next goal" hint.
// Progress Knight / Swarmsim style — hráč vždy vie čo robiť.
export function getCurrentObjective(state) {
  const lvl = state.level ?? 1;
  const captured = (state.capturedHexes ?? []).length;
  const agents = (state.agents ?? []).length;
  const rep = state.reputation ?? 0;
  const gold = state.gold ?? 0;
  const runGold = state.runGoldEarned ?? 0;

  // Early game — unlocks
  if (lvl < 2) return { icon: '▲', text: 'Siphon data to reach Level 2', progress: state.xp / 100 };
  if (lvl < 3) return { icon: '▲', text: 'Level up to unlock Agency', progress: lvl / 3 };
  if (lvl < 5) return { icon: '▲', text: 'Level up to unlock Deep Siphon', progress: lvl / 5 };

  // Mid game
  if (agents === 0 && lvl >= 3) return { icon: '◆', text: 'Hire your first operative', progress: 0 };
  if (captured === 0 && lvl >= 4) return { icon: '◆', text: 'Capture your first node', progress: 0 };
  if (lvl < 8) return { icon: '▲', text: 'Level up to unlock Mainframe & Awakening', progress: lvl / 8 };

  // Prestige gate
  if (lvl < 10) return { icon: '★', text: `Reach Level 10 for Awakening (${lvl}/10)`, progress: lvl / 10 };
  if (runGold < 100000) return { icon: '★', text: `Earn ${Math.round((100000 - runGold)/1000)}K more CR to Awaken`, progress: runGold / 100000 };

  // Prestige ready
  if ((state.prestige ?? 0) < 1) return { icon: '✦', text: 'Ready to Awaken — see AWAKENING tab', progress: 1, action: 'AWAKEN' };

  // Post-prestige meta goals
  if ((state.prestige ?? 0) < 3) return { icon: '✦', text: `Awaken again (Prestige ${state.prestige}/3)`, progress: (state.prestige ?? 0) / 3 };

  // Endgame
  const totalCap = Object.keys(CITY_MAP).filter(k => CITY_MAP[k]?.type !== 'empty_block').length;
  if (captured < totalCap) return { icon: '◈', text: `Capture all nodes (${captured}/${totalCap})`, progress: captured / totalCap };

  return { icon: '✦', text: 'Seek the Mainframe. The Eye awaits.', progress: 1 };
}

// ─── EVENT TIMELINE ───────────────────────────────────────────────────────
// Forward-looking timeline of upcoming events. Hráč vie plánovať.
// Inspired by How Many Dudes & Swarm Simulator.
export function getEventTimeline(state) {
  const events = [];
  const now = Date.now();

  // Active mission completions
  for (const m of state.activeMissions ?? []) {
    const sec = Math.max(0, Math.round((m.endTime - now) / 1000));
    events.push({
      type: 'MISSION',
      label: `${m.label ?? m.hexId} complete`,
      seconds: sec,
      color: '#00d4ff',
      icon: '⟳',
    });
  }

  // Raid
  if (state.raidActive) {
    events.push({
      type: 'RAID_ACTIVE',
      label: 'Raid ongoing',
      seconds: state.raidTimer ?? 0,
      color: '#ef4444',
      icon: '⚠',
    });
  } else if ((state.nextRaidIn ?? 0) > 0) {
    // Hidden raids ONLY shown with EYE_REVEAL perk or <60s away
    const revealed = state.prestigePerks?.EYE_REVEAL || (state.nextRaidIn ?? 0) < 60;
    if (revealed) {
      events.push({
        type: 'RAID',
        label: 'Police raid',
        seconds: state.nextRaidIn,
        color: '#ef4444',
        icon: '⚡',
      });
    } else {
      // Vague ambient hint — no exact timer
      events.push({
        type: 'RAID',
        label: 'Unusual activity detected',
        seconds: -1,
        color: '#666',
        icon: '?',
        hidden: true,
      });
    }
  }

  // System scan
  if (state.systemScan?.active) {
    events.push({
      type: 'SCAN_ACTIVE',
      label: 'Purge scan window',
      seconds: state.systemScan.timer ?? 0,
      color: '#f97316',
      icon: '▣',
    });
  } else if ((state.systemScan?.nextIn ?? 0) > 0) {
    events.push({
      type: 'SCAN',
      label: 'System scan',
      seconds: state.systemScan.nextIn,
      color: '#f97316',
      icon: '▣',
    });
  }

  // Lay low timer
  if (state.layLowActive) {
    events.push({
      type: 'LAY_LOW',
      label: 'Lay low ends',
      seconds: state.layLowTimer ?? 0,
      color: '#22c55e',
      icon: '◉',
    });
  }

  // Busted lockout
  if ((state.bustedLockout ?? 0) > 0) {
    events.push({
      type: 'BUSTED',
      label: 'Lockout ends',
      seconds: state.bustedLockout,
      color: '#ef4444',
      icon: '✕',
    });
  }

  // Reclaim nodes (nearest)
  const reclaiming = state.reclaiming ?? {};
  for (const [hexId, data] of Object.entries(reclaiming)) {
    if (!data) continue;
    // Reclaim has no direct timer; estimate via progress
    events.push({
      type: 'RECLAIM',
      label: `${hexId} under reclaim (${data.stage})`,
      seconds: Math.round((100 - (data.progress ?? 0)) * 0.5), // Rough
      color: '#ef4444',
      icon: '✕',
    });
  }

  // Auto-fencer / AI subroutine
  const autoFencerLvl = state.upgrades?.autoFencer ?? 0;
  if (autoFencerLvl > 0) {
    const cycle = state.prestigePerks?.FAST_FENCE ? 15 : 30;
    const tick = state.autoFencerTick ?? 0;
    events.push({
      type: 'AUTO_FENCE',
      label: 'Auto-Fencer tick',
      seconds: Math.max(0, cycle - tick),
      color: '#FFC174',
      icon: '⏣',
    });
  }

  // Sort by time ascending
  events.sort((a, b) => a.seconds - b.seconds);

  // Limit to 6 most imminent
  return events.slice(0, 6);
}

export function getUIVisibility(state) {
  const compact = isCompactMode();
 
  // If compact mode is OFF, show everything immediately
  if (!compact) {
    return ALL_VISIBLE;
  }
 
  const actions       = state.totalActions ?? 0;
  // Real captures = excluding initial player base/warpgate. Player starts with
  // 'western_warpgate' so a raw .length >= 1 check would always be true.
  const allCaptured   = state.capturedHexes ?? [];
  const realCaptured  = allCaptured.filter(id => id && !id.endsWith('_warpgate')).length;
  const heat          = state.heat ?? 0;
  const inv           = state.inventory?.length ?? 0;
  const lvl           = state.level ?? 1;
  const xp            = state.xp ?? 0;
  const rep           = state.reputation ?? 0;
  const maxRep        = state.maxReputation ?? 0;
  const agents        = state.agents?.length ?? 0;
  const prestige      = state.prestige ?? 0;
 
  // Purchased reveals override action-count gating
  const reveals       = state.reveals ?? {};
  const hasNorthStar  = !!reveals.NORTH_STAR;
  const hasTimeline   = !!reveals.TIMELINE;
 
  return {
    // ── Vitals (left sidebar) ─────────────────────────────────────
    creditsRow:   actions >= 1,           // After 1st action: CR appears
    heatRow:      actions >= 3 || heat > 0,
    xpLvlRow:     actions >= 5 || lvl >= 2 || xp > 0,
    staminaRow:   actions >= 1,           // Show after any action (uses stamina)
    repRow:       lvl >= 3 || rep > 0 || maxRep > 0,
    operativeId:  actions >= 5,           // ID_01 SPECTER-1 — appears with XP
 
    // ── Sidebar panels ────────────────────────────────────────────
    currentObjective: actions >= 1,                                                // Always after first click
    northStar:        hasNorthStar || realCaptured >= 3 || prestige >= 1,          // Reveal-purchasable
    eventTimeline:    hasTimeline  || realCaptured >= 1,                           // Reveal-purchasable
    hunterTracker:    state.hunters?.named?.length > 0 || state.hunters?.activeOps?.length > 0,
 
    // ── Right sidebar (inventory) ─────────────────────────────────
    inventoryPanel: inv > 0 || actions >= 5,
 
    // ── Center column (Ops tab) ───────────────────────────────────
    targetBriefing: realCaptured >= 1,                // District panel — only when network exists
    secondaryOps:   actions >= 5,                 // LAY_LOW, SELL_COLD, DECRYPT panel
    layLowButton:   actions >= 3 || heat >= 30,   // Solo earlier if heat high
 
    // ── Log ───────────────────────────────────────────────────────
    systemLog: true,                              // Always — primary feedback
 
    // ── First-time hint badges ────────────────────────────────────
    showZeroIntroHint: actions >= 10 && (state.zeroDialoguesSeen?.length ?? 0) === 0,

    showInvValueHUD:   !!reveals.INV_VALUE_HUD,
    showHeatPreview:   !!reveals.HEAT_PREVIEW,
    showRecentGains:   !!reveals.RECENT_GAINS,
    showCritLensIcon:  !!reveals.CRIT_LENS,
  };
}
 
// Power user override — show everything
const ALL_VISIBLE = {
  creditsRow:        true,
  heatRow:           true,
  xpLvlRow:          true,
  staminaRow:        true,
  repRow:            true,
  operativeId:       true,
  currentObjective:  true,
  northStar:         true,
  eventTimeline:     true,
  hunterTracker:     true,
  inventoryPanel:    true,
  targetBriefing:    true,
  secondaryOps:      true,
  layLowButton:      true,
  systemLog:         true,
  showZeroIntroHint: false,
};
 
function isCompactMode() {
  if (typeof window === 'undefined') return true;
  try {
    const v = localStorage.getItem('sg_compact_ui');
    if (v === '0') return false;     // Explicitly off
    return true;                      // Default ON (incl. when missing)
  } catch {
    return true;
  }
}
 
// ── Tab visibility / lock state ──────────────────────────────────────────────
// Returns: { id, visible, locked, reqText }
//   visible:false → don't render at all
//   visible:true,locked:true → render greyed-out with tooltip showing reqText
//   visible:true,locked:false → fully accessible
 
const TAB_RULES = [
  { id: 'OPERATIONS', label: 'OPS',      hidden: () => false,                                        locked: () => false,
    reachable: () => true, req: '' },
 
  { id: 'AGENCY',     label: 'AGENCY',   hidden: (s) => (s.level ?? 1) < 4,                          locked: (s) => (s.level ?? 1) < 5,
    reachable: (s) => (s.level ?? 1) >= 4,                                                           req: 'LVL 5' },
 
  { id: 'UPGRADES',   label: 'UPGRADES', hidden: (s) => (s.level ?? 1) < 2,                          locked: (s) => (s.level ?? 1) < 3,
    reachable: (s) => (s.level ?? 1) >= 2,                                                           req: 'LVL 3' },
 
  { id: 'NETWORK',    label: 'NETWORK',  hidden: (s) => (s.level ?? 1) < 6,                          locked: (s) => (s.level ?? 1) < 7,
    reachable: (s) => (s.level ?? 1) >= 6,                                                           req: 'LVL 7' },
 
  { id: 'AWAKENING',  label: 'AWK',      hidden: (s) => (s.level ?? 1) < 9 && (s.prestige ?? 0) < 1, locked: (s) => (s.level ?? 1) < 10 && (s.prestige ?? 0) < 1,
    reachable: (s) => (s.level ?? 1) >= 9 || (s.prestige ?? 0) >= 1,                                 req: 'LVL 10 / P1' },
 
  { id: 'SETTINGS',   label: 'SETTINGS', hidden: () => false,                                        locked: () => false,
    reachable: () => true, req: '' },
];
 
export function getVisibleTabs(state) {
  const compact = isCompactMode();
  return TAB_RULES.map(rule => {
    const visible = compact ? !rule.hidden(state) : true;  // compact mode hides; full mode shows all
    const locked  = rule.locked(state);
    return {
      id:       rule.id,
      label:    rule.label,
      visible,
      locked,
      reqText:  locked ? rule.req : '',
    };
  });
}