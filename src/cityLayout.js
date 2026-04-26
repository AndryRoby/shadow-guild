// City Layout Engine
// ───────────────────────────────────────────────────────────────────────────
// CITY_MAP nodes use axial hex coordinates (q, r). This module converts them
// into screen-space coordinates, ready for SVG rendering.
//
// Why static, not d3-force:
//   - Hex grid is already a clean topology — no relaxation needed
//   - Deterministic render → same layout across sessions
//   - Zero deps, zero runtime cost
//
// Output coords are normalized to a viewBox; renderer scales as needed.

import { CITY_MAP, DISTRICTS } from '../CITY_MAP.js';

// Axial → cartesian (pointy-top hex)
// Reference: https://www.redblobgames.com/grids/hexagons/
const HEX_SIZE = 56;          // radius in pixels (pre-scale)
const SQRT3 = Math.sqrt(3);

function axialToScreen(q, r) {
  const x = HEX_SIZE * SQRT3 * (q + r / 2);
  const y = HEX_SIZE * 1.5    * r;
  return { x, y };
}

// ───────────────────────────────────────────────────────────────────────────
// Build layout once — memoized
// ───────────────────────────────────────────────────────────────────────────

let _layoutCache = null;

export function getCityLayout() {
  if (_layoutCache) return _layoutCache;

  // Pass 1: raw screen positions
  const positions = {};
  for (const [id, node] of Object.entries(CITY_MAP)) {
    positions[id] = axialToScreen(node.q ?? 0, node.r ?? 0);
  }

  // Pass 2: compute bounding box for centering
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of Object.values(positions)) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // Add padding for glow/labels
  const PADDING = 80;
  const width  = (maxX - minX) + PADDING * 2;
  const height = (maxY - minY) + PADDING * 2;
  const offsetX = -minX + PADDING;
  const offsetY = -minY + PADDING;

  // Pass 3: build node array with rendering metadata
  const nodes = [];
  for (const [id, node] of Object.entries(CITY_MAP)) {
    const { x, y } = positions[id];
    const district = DISTRICTS[node.districtId];
    nodes.push({
      id,
      x: x + offsetX,
      y: y + offsetY,
      label:        node.label,
      type:         node.type,
      icon:         node.icon,
      districtId:   node.districtId,
      districtColor: district?.color ?? '#888',
      faction:      node.faction,
      captureStatus: node.captureStatus,
      effectHooks:  node.effectHooks ?? [],
      lootMultiplier: node.lootMultiplier,
      flavor:       node.flavor,
      role:         node.role,
      // Visual hierarchy:
      //   mega_facility = core (r=22, strongest glow)
      //   tech_plant / amp_station / bio_lab = major (r=16)
      //   warpgate = special edge (r=18, distinct shape)
      //   outpost = normal (r=12)
      //   empty_block = minor (r=8, dim)
      tier: classifyTier(node.type),
    });
  }

  // Pass 4: build edge array (deduplicated bidirectional)
  const seen = new Set();
  const edges = [];
  for (const [id, node] of Object.entries(CITY_MAP)) {
    for (const targetId of (node.connections ?? [])) {
      if (!CITY_MAP[targetId]) continue;
      const key = [id, targetId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const a = positions[id];
      const b = positions[targetId];
      edges.push({
        id: key,
        from: id,
        to: targetId,
        x1: a.x + offsetX,
        y1: a.y + offsetY,
        x2: b.x + offsetX,
        y2: b.y + offsetY,
        crossDistrict: CITY_MAP[id].districtId !== CITY_MAP[targetId].districtId,
      });
    }
  }

  // Pass 5: district hulls — for background "zone" tinting
  // Each district gets a centroid + furthest-point radius.
  const hullsByDistrict = {};
  for (const [id, node] of Object.entries(CITY_MAP)) {
    const did = node.districtId;
    if (!hullsByDistrict[did]) hullsByDistrict[did] = { points: [], cx: 0, cy: 0, r: 0 };
    const p = { x: positions[id].x + offsetX, y: positions[id].y + offsetY };
    hullsByDistrict[did].points.push(p);
  }
  for (const [did, h] of Object.entries(hullsByDistrict)) {
    if (h.points.length === 0) continue;
    h.cx = h.points.reduce((s, p) => s + p.x, 0) / h.points.length;
    h.cy = h.points.reduce((s, p) => s + p.y, 0) / h.points.length;
    h.r  = Math.max(60, ...h.points.map(p => Math.hypot(p.x - h.cx, p.y - h.cy))) + 50;
  }

  _layoutCache = {
    nodes,
    edges,
    hulls: hullsByDistrict,
    width,
    height,
  };
  return _layoutCache;
}

function classifyTier(type) {
  switch (type) {
    case 'mega_facility': return 'core';
    case 'tech_plant':
    case 'amp_station':
    case 'bio_lab':       return 'major';
    case 'warpgate':      return 'edge';
    case 'outpost':       return 'normal';
    case 'empty_block':   return 'minor';
    default:              return 'normal';
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Per-frame state (player ownership, hot zones, etc.)
// Pure fn — call every render with current state.
// ───────────────────────────────────────────────────────────────────────────

export function decorateNodesWithState(nodes, state) {
  const owned = new Set(state.capturedHexes ?? []);
  const inProgress = new Set((state.activeMissions ?? []).map(m => m.hexId).filter(Boolean));
  const stability = state.nodeStability ?? {};
  const hotZones = state.hotZones ?? {};
  const reclaiming = state.reclaiming ?? {};

  // Adjacency: a node is "available" if it's connected to any owned node
  const ownedSet = owned;
  const adjacent = new Set();
  for (const n of nodes) {
    if (ownedSet.has(n.id)) continue;
    for (const e of (CITY_MAP[n.id]?.connections ?? [])) {
      if (ownedSet.has(e)) { adjacent.add(n.id); break; }
    }
  }

  return nodes.map(n => {
    const isOwned       = owned.has(n.id);
    const isInfiltrating = inProgress.has(n.id);
    const isAdjacent    = adjacent.has(n.id);
    const districtHot   = !!hotZones[n.districtId];
    const stab          = stability[n.id] ?? (isOwned ? 100 : 0);
    const reclaim       = reclaiming[n.id];
    const reclaimStage  = reclaim?.stage ?? null;  // SCAN | BREACH | LAST_STAND

    let status;
    if (isOwned)               status = 'owned';
    else if (isInfiltrating)   status = 'infiltrating';
    else if (isAdjacent)       status = 'available';
    else                       status = 'distant';

    return {
      ...n,
      status,
      stability: stab,
      hot: districtHot,
      reclaimStage,
      reclaimProgress: reclaim?.progress ?? 0,
    };
  });
}