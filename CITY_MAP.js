// ╔════════════════════════════════════════════════════════════════╗
// ║ SHADOW GUILD — CITY MAP v3.0                                    ║
// ║ Axial Hex Grid (q, r) — Strict adjacency enforced               ║
// ║ Distance: (|dq| + |dq+dr| + |dr|) / 2                           ║
// ║ All connections verified dist=1 in dev console.                  ║
// ╚════════════════════════════════════════════════════════════════╝

export const DISTRICTS = {
  Z1: { id: 'Z1', name: 'NEON_CORE',         color: '#ffc174', desc: 'High tech, high risk. Heart of Aetheria.',     lootMultiplier: 4.0, xpMultiplier: 2.5, heatDecayBase: 0.10 },
  Z2: { id: 'Z2', name: 'INDUSTRIAL_WASTES', color: '#ff6b35', desc: 'Raw resources. Gold focus. Toxic.',           lootMultiplier: 2.0, xpMultiplier: 1.5, heatDecayBase: 0.20 },
  Z3: { id: 'Z3', name: 'EASTERN_TECH',      color: '#00d4ff', desc: 'Encryption and security complexes.',          lootMultiplier: 2.5, xpMultiplier: 2.0, heatDecayBase: 0.15 },
  Z4: { id: 'Z4', name: 'WESTERN_SLUMS',     color: '#b347ff', desc: 'Stealth and black market networks.',          lootMultiplier: 1.0, xpMultiplier: 1.0, heatDecayBase: 0.30 },
  Z5: { id: 'Z5', name: 'CORP_CITADEL',      color: '#ff2244', desc: 'Endgame zone. GID controlled.',               lootMultiplier: 8.0, xpMultiplier: 4.0, heatDecayBase: 0.05 },
  Z6: { id: 'Z6', name: 'THE_UNDERBELLY',    color: '#22ff88', desc: 'Hidden. Below the surface.',                  lootMultiplier: 3.0, xpMultiplier: 3.0, heatDecayBase: 0.40 },
  Z7: { id: 'Z7', name: 'BUFFER_DISTRICTS',  color: '#888899', desc: 'Transition zones. Contested.',                lootMultiplier: 1.5, xpMultiplier: 1.2, heatDecayBase: 0.20 },
};

const FX = {
  none:             { type: 'none' },
  xp_boost:         { type: 'xp_boost',       value: 0.25,  desc: 'XP +25%' },
  xp_boost_major:   { type: 'xp_boost',       value: 0.50,  desc: 'XP +50%' },
  siphon_boost:     { type: 'siphon_rate',    value: 0.15,  desc: 'Siphon success +15%' },
  stamina_regen:    { type: 'stamina_regen',  value: 1,     desc: 'Stamina regen +1/s' },
  stamina_major:    { type: 'stamina_regen',  value: 2,     desc: 'Stamina regen +2/s' },
  heat_decay:       { type: 'heat_decay',     value: 0.5,   desc: 'Heat decay +0.5/s' },
  heat_decay_major: { type: 'heat_decay',     value: 1.5,   desc: 'Heat decay +1.5/s' },
  gold_boost:       { type: 'gold_mult',      value: 0.20,  desc: 'Gold +20%' },
  gold_major:       { type: 'gold_mult',      value: 0.40,  desc: 'Gold +40%' },
  bust_threshold:   { type: 'bust_threshold', value: 10,    desc: 'Bust threshold +10' },
  loot_tier:        { type: 'loot_tier',      value: 1,     desc: 'Loot tier +1' },
  intel_discount:   { type: 'intel_discount', value: 0.20,  desc: 'Intel upgrades -20%' },
  inv_slots:        { type: 'inv_slots',      value: 4,     desc: '+4 inventory slots' },
  crit_chance:      { type: 'crit_chance',    value: 0.05,  desc: 'Crit chance +5%' },
  rep_boost:        { type: 'rep_boost',      value: 0.25,  desc: 'REP gains +25%' },
  offline_cap:      { type: 'offline_cap',    value: 7200,  desc: 'Offline cap +2h' },
};

export const CITY_MAP = {
  // ─── Z1 NEON CORE ───────────────────────────────────────────────
  'aetheria_spire': {
    id: 'aetheria_spire', label: 'AETHERIA SPIRE',
    type: 'mega_facility', districtId: 'Z1', layer: 'endgame',
    role: 'Command Node — controls all district bonuses', icon: '◉',
    q: 0, r: 0,
    connections: ['relay_north', 'relay_east', 'relay_south', 'data_cathedral', 'corp_perimeter'],
    captureStatus: 'contested', faction: 'GID',
    effectHooks: [FX.xp_boost_major, FX.gold_major, FX.siphon_boost],
    lootMultiplier: 3.0, captureTime: 120,
    flavor: 'THE EYE runs from here. Take it and the city is yours.',
  },
  'relay_north': {
    id: 'relay_north', label: 'RELAY NORTH',
    type: 'outpost', districtId: 'Z1', layer: 'core',
    role: 'Signal amplifier', icon: '⬡',
    q: 0, r: -1,
    connections: ['aetheria_spire', 'cipher_vault', 'corp_perimeter'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.heat_decay],
    lootMultiplier: 1.2, captureTime: 30,
    flavor: 'Relay nodes are how Zero finds you.',
  },
  'relay_east': {
    id: 'relay_east', label: 'RELAY EAST',
    type: 'outpost', districtId: 'Z1', layer: 'core',
    role: 'Signal amplifier', icon: '⬡',
    q: 1, r: 0,
    connections: ['aetheria_spire', 'corp_perimeter', 'corp_inner', 'grid_station', 'relay_south'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.stamina_regen],
    lootMultiplier: 1.2, captureTime: 30,
    flavor: 'They upgraded security last cycle.',
  },
  'relay_south': {
    id: 'relay_south', label: 'RELAY SOUTH',
    type: 'outpost', districtId: 'Z1', layer: 'core',
    role: 'Signal amplifier', icon: '⬡',
    q: 0, r: 1,
    connections: ['aetheria_spire', 'data_cathedral', 'ghost_alley', 'grid_station', 'relay_east', 'underbelly_access'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.gold_boost],
    lootMultiplier: 1.3, captureTime: 30,
    flavor: 'Gateway to the southern districts.',
  },
  'data_cathedral': {
    id: 'data_cathedral', label: 'DATA CATHEDRAL',
    type: 'tech_plant', districtId: 'Z1', layer: 'core',
    role: 'Power Grid Reactor', icon: '◉',
    q: -1, r: 1,
    connections: ['aetheria_spire', 'ghost_alley', 'relay_south', 'slum_nexus'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.stamina_major, FX.bust_threshold],
    lootMultiplier: 2.0, captureTime: 60,
    flavor: 'Power flows from here. Cut it and the city goes dark.',
  },

  // ─── Z3 EASTERN TECH ────────────────────────────────────────────
  'cipher_vault': {
    id: 'cipher_vault', label: 'CIPHER VAULT',
    type: 'tech_plant', districtId: 'Z3', layer: 'mid',
    role: 'Encryption node', icon: '◉',
    q: 1, r: -2,
    connections: ['corp_perimeter', 'relay_north', 'sec_array'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.loot_tier, FX.intel_discount],
    lootMultiplier: 1.5, captureTime: 45,
    flavor: 'Cipher Vault holds keys to every corp network.',
  },
  'sec_array': {
    id: 'sec_array', label: 'SECURITY ARRAY',
    type: 'amp_station', districtId: 'Z3', layer: 'mid',
    role: 'GID surveillance hub', icon: '◉',
    q: 2, r: -2,
    connections: ['cipher_vault', 'corp_inner', 'corp_perimeter'],
    captureStatus: 'GID', faction: 'GID',
    effectHooks: [FX.bust_threshold, FX.heat_decay],
    lootMultiplier: 1.8, captureTime: 60,
    flavor: 'GID runs THE EYE surveillance from here.',
  },

  // ─── Z5 CORP CITADEL ────────────────────────────────────────────
  'corp_perimeter': {
    id: 'corp_perimeter', label: 'CORP PERIMETER',
    type: 'outpost', districtId: 'Z5', layer: 'outer',
    role: 'Corporate security checkpoint', icon: '⚠',
    q: 1, r: -1,
    connections: ['aetheria_spire', 'cipher_vault', 'corp_inner', 'relay_east', 'relay_north', 'sec_array'],
    captureStatus: 'GID', faction: 'GID',
    effectHooks: [FX.bust_threshold],
    lootMultiplier: 2.2, captureTime: 75,
    flavor: 'First wall of the Corp Citadel.',
  },
  'corp_inner': {
    id: 'corp_inner', label: 'CORP INNER RING',
    type: 'amp_station', districtId: 'Z5', layer: 'outer',
    role: 'Corporate power core', icon: '⚠',
    q: 2, r: -1,
    connections: ['corp_citadel', 'corp_perimeter', 'relay_east', 'sec_array'],
    captureStatus: 'GID', faction: 'GID',
    effectHooks: [FX.gold_major, FX.loot_tier],
    lootMultiplier: 2.5, captureTime: 90,
    flavor: 'The inner ring. THE EYE knows you are here.',
  },
  'corp_citadel': {
    id: 'corp_citadel', label: 'CORP CITADEL',
    type: 'mega_facility', districtId: 'Z5', layer: 'outer',
    role: 'Aether-Biotech HQ', icon: '⚠',
    q: 3, r: -1,
    connections: ['corp_inner', 'scrapyard'],
    captureStatus: 'GID', faction: 'OMNIGUARD',
    effectHooks: [FX.crit_chance, FX.xp_boost, FX.gold_major],
    lootMultiplier: 4.0, captureTime: 180,
    flavor: 'Aether-Biotech. The reason you are running.',
  },

  // ─── Z2 INDUSTRIAL WASTES ───────────────────────────────────────
  'grid_station': {
    id: 'grid_station', label: 'GRID STATION 7',
    type: 'amp_station', districtId: 'Z2', layer: 'mid',
    role: 'Industrial power grid', icon: '◉',
    q: 1, r: 1,
    connections: ['deep_server', 'refinery', 'relay_east', 'relay_south', 'underbelly_access'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.gold_boost, FX.stamina_regen],
    lootMultiplier: 1.6, captureTime: 45,
    flavor: 'Powers the factories.',
  },
  'refinery': {
    id: 'refinery', label: 'REFINERY BLOCK',
    type: 'tech_plant', districtId: 'Z2', layer: 'mid',
    role: 'Resource processing', icon: '◉',
    q: 2, r: 1,
    connections: ['deep_server', 'grid_station', 'scrapyard'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.gold_major],
    lootMultiplier: 2.0, captureTime: 60,
    flavor: 'They refine ore. You refine intelligence.',
  },
  'scrapyard': {
    id: 'scrapyard', label: 'SCRAPYARD OMEGA',
    type: 'outpost', districtId: 'Z2', layer: 'outer',
    role: 'Salvage operations', icon: '⬡',
    q: 3, r: 0,
    connections: ['corp_citadel', 'refinery'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.inv_slots],
    lootMultiplier: 1.3, captureTime: 25,
    flavor: 'Everything the city throws away.',
  },

  // ─── Z4 WESTERN SLUMS ───────────────────────────────────────────
  'ghost_alley': {
    id: 'ghost_alley', label: 'GHOST ALLEY',
    type: 'bio_lab', districtId: 'Z4', layer: 'mid',
    role: 'Stealth training ground', icon: '◉',
    q: -1, r: 2,
    connections: ['black_den', 'data_cathedral', 'relay_south', 'slum_nexus', 'south_buffer', 'underbelly_access'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.heat_decay, FX.crit_chance],
    lootMultiplier: 1.6, captureTime: 45,
    flavor: 'Ghost Alley. Nobody asks questions here.',
  },
  'slum_nexus': {
    id: 'slum_nexus', label: 'SLUM NEXUS',
    type: 'tech_plant', districtId: 'Z4', layer: 'mid',
    role: 'Black market data hub', icon: '◉',
    q: -2, r: 2,
    connections: ['data_cathedral', 'ghost_alley', 'south_buffer', 'west_buffer'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.rep_boost, FX.intel_discount],
    lootMultiplier: 1.7, captureTime: 45,
    flavor: 'Slum Nexus. Where data goes to disappear.',
  },
  'black_den': {
    id: 'black_den', label: 'BLACK MARKET DEN',
    type: 'outpost', districtId: 'Z4', layer: 'mid',
    role: 'Underground economy', icon: '⬡',
    q: -1, r: 3,
    connections: ['ghost_alley', 'south_buffer', 'underbelly_access', 'zero_station'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.gold_boost],
    lootMultiplier: 1.4, captureTime: 30,
    flavor: 'Whatever you need. No questions. Bring credits.',
  },

  // ─── Z7 BUFFERS ─────────────────────────────────────────────────
  'south_buffer': {
    id: 'south_buffer', label: 'SOUTH BUFFER',
    type: 'empty_block', districtId: 'Z7', layer: 'buffer',
    role: 'Transition zone', icon: '▪',
    q: -2, r: 3,
    connections: ['black_den', 'ghost_alley', 'slum_nexus', 'west_buffer'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.none],
    lootMultiplier: 1.0, captureTime: 20,
    flavor: 'Empty. Or so they say.',
  },
  'west_buffer': {
    id: 'west_buffer', label: 'WEST BUFFER',
    type: 'empty_block', districtId: 'Z7', layer: 'buffer',
    role: 'Transition zone', icon: '▪',
    q: -3, r: 3,
    connections: ['slum_nexus', 'south_buffer', 'western_warpgate'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.none],
    lootMultiplier: 1.0, captureTime: 20,
    flavor: 'Rubble. But rubble has uses.',
  },
  'western_warpgate': {
    id: 'western_warpgate', label: 'PLAYER BASE',
    type: 'warpgate', districtId: 'Z4', layer: 'edge',
    role: 'Your safe house', icon: '⚠',
    q: -4, r: 4,
    connections: ['west_buffer'],
    captureStatus: 'player', faction: 'PLAYER',
    effectHooks: [FX.stamina_regen, FX.heat_decay],
    lootMultiplier: 0.8, captureTime: 999,
    flavor: 'Your base. The only place truly yours.',
  },

  // ─── Z6 UNDERBELLY ──────────────────────────────────────────────
  'underbelly_access': {
    id: 'underbelly_access', label: 'SUBWAY NEXUS',
    type: 'outpost', districtId: 'Z6', layer: 'hidden',
    role: 'Underground access', icon: '⬡',
    q: 0, r: 2,
    connections: ['black_den', 'deep_server', 'ghost_alley', 'grid_station', 'relay_south', 'zero_station'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.offline_cap],
    lootMultiplier: 1.5, captureTime: 40,
    flavor: 'Most people do not know it exists.',
  },
  'deep_server': {
    id: 'deep_server', label: 'DEEP SERVER FARM',
    type: 'tech_plant', districtId: 'Z6', layer: 'hidden',
    role: 'Hidden infrastructure', icon: '◉',
    q: 1, r: 2,
    connections: ['grid_station', 'refinery', 'underbelly_access', 'zero_station'],
    captureStatus: 'neutral', faction: null,
    effectHooks: [FX.xp_boost, FX.siphon_boost],
    lootMultiplier: 2.2, captureTime: 60,
    flavor: 'Servers that do not appear on any map.',
  },
  'zero_station': {
    id: 'zero_station', label: 'ZERO STATION',
    type: 'mega_facility', districtId: 'Z6', layer: 'hidden',
    role: 'Zero\'s hidden base', icon: '◉',
    q: 0, r: 3,
    connections: ['black_den', 'deep_server', 'underbelly_access'],
    captureStatus: 'neutral', faction: 'ZERO',
    effectHooks: [FX.xp_boost_major, FX.gold_major, FX.crit_chance],
    lootMultiplier: 4.0, captureTime: 180,
    flavor: '"You found me. I wondered if you would." — Zero',
  },
};

export const MAP_STATS = {
  totalNodes: Object.keys(CITY_MAP).length,
  byDistrict: Object.values(CITY_MAP).reduce((acc, n) => {
    acc[n.districtId] = (acc[n.districtId] ?? 0) + 1;
    return acc;
  }, {}),
};

if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  const dist = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  let issues = 0;
  for (const [id, n] of Object.entries(CITY_MAP)) {
    for (const c of (n.connections ?? [])) {
      const target = CITY_MAP[c];
      if (!target) { console.warn(`[CITY_MAP] ${id} → missing target ${c}`); issues++; continue; }
      const d = dist(n, target);
      if (d !== 1) { console.warn(`[CITY_MAP] ${id} → ${c} dist=${d}`); issues++; }
    }
  }
  if (issues === 0) console.log(`[CITY_MAP] ✓ ${Object.keys(CITY_MAP).length} nodes, all adjacencies valid`);
}