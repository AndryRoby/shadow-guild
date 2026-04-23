// Derived state selectors.
// Pure functions: (state) => formatted data for UI components.
// Import: import { getNetworkNodes, getDistrictData, ... } from './selectors.js';

import { CITY_MAP, DISTRICTS as AETHERIA_DISTRICTS } from '../CITY_MAP.js';
import { DISTRICT_COLORS, COLORS } from './design/colors.js';
import { calculateMapModifiers, DEV_MODE, PROTOCOL_DEFS, calculateHeatFlow } from './gameLogic.js';


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

    return {
      id: `${m.agentId}_${m.hexId}`,
      agent: agent?.name ?? m.runnerType?.toUpperCase() ?? 'AGENT',
      agentAvatar: agent?.name?.slice(0, 2).toUpperCase() ?? 'A?',
      target: hex?.label ?? m.hexId,
      duration,
      timer,
      chance: m.successChance ?? 50,
      runnerType: m.runnerType,
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

  // HW overclock affects cycle speed
  const hwLvl = state.upgrades?.hwOverclock ?? 0;
  const hwSpeedMult = Math.pow(0.85, hwLvl);

  const idleMult = state.isIdle ? 0.6 : 1.0;
  const guildMult = state.prestigePerks?.GUILD_MASTER ? 1.25 : 1;
  const prestigeMult = state.prestigeMultiplier ?? 1;
  const synergyMult = activeAgents.length >= 5 ? 1.2 : 1;

  activeAgents.forEach(a => {
    const base = basePayouts[a.role] ?? 0;
    const cycleSec = Math.max(1, Math.round((baseCycles[a.role] ?? 60) * hwSpeedMult));
    const specMult = a.spec === 'GREEDY' ? 1.5 : 1;
    const traitMult = (a.traits ?? []).includes('GREEDY') ? 1.3 : 1;

    // Amount earned per cycle, divided by cycle length = per-second rate
    const perCycle = base * specMult * guildMult * traitMult * idleMult * prestigeMult * synergyMult;
    cps += perCycle / cycleSec;
  });

  // Map passive gold
  const passiveGold = calculateMapModifiers(state).passiveGold ?? 0;
  if (passiveGold > 0) cps += passiveGold * idleMult;

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
    stats: a.stats ?? { stl: 50, spd: 50, int: 50 },
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