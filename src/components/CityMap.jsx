// CityMap — SVG node topology renderer.
// ───────────────────────────────────────────────────────────────────────────
// Visual rules (per design directive):
//   - Vector-first, sharp 1px borders, no gradients on edges
//   - Hierarchy via radius: core 22, major 16, edge 18, normal 12, minor 8
//   - Glow blur layer beneath nodes for "neon" effect
//   - Edges thin (0.75-1.5px) with low opacity unless owned-to-owned
//   - Captured nodes have particle flow toward base (animated dashes)
//   - District hulls = soft radial color tint as background
//
// Interactivity:
//   - Pan (drag), zoom (wheel)
//   - Click node → side detail panel
//   - Click empty area → close panel

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { COLORS } from '../design/primitives.jsx';
import { getCityLayout, decorateNodesWithState } from '../cityLayout.js';
import { DISTRICTS, CITY_MAP } from '../../CITY_MAP.js';

const NODE_RADII = {
  core: 22, major: 16, edge: 18, normal: 12, minor: 8,
};

function statusColor(node) {
  if (node.status === 'owned') {
    // RECLAIM in progress → red regardless of stability (override)
    if (node.reclaimStage === 'LAST_STAND') return COLORS.red;
    if (node.reclaimStage === 'BREACH')     return COLORS.red;
    if (node.reclaimStage === 'SCAN')       return COLORS.orange;
    if (node.stability < 30) return COLORS.red;
    if (node.stability < 60) return COLORS.orange;
    return COLORS.amber;
  }
  if (node.status === 'infiltrating')  return COLORS.cyan;
  if (node.status === 'available')     return node.districtColor;
  return node.districtColor || '#5a5a5a';
}

function statusOpacity(node) {
  if (node.status === 'distant')      return 0.45;
  if (node.status === 'available')    return 0.9;
  return 1;
}

// ───────────────────────────────────────────────────────────────────────────

export function CityMap({ state, onSelectNode, selectedNodeId }) {
  const layout = useMemo(() => getCityLayout(), []);
  const nodes = useMemo(
    () => decorateNodesWithState(layout.nodes, state),
    [layout, state.capturedHexes, state.activeMissions, state.hotZones, state.nodeStability]
  );

  const wrapRef = useRef(null);
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });
  const dragRef = useRef(null);

  // Center on mount
  useEffect(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const sx = r.width  / layout.width;
    const sy = r.height / layout.height;
    const s  = Math.min(sx, sy) * 0.92;
    setView({
      scale: s,
      tx: r.width  / 2 - (layout.width  / 2) * s,
      ty: r.height / 2 - (layout.height / 2) * s,
    });
  }, [layout.width, layout.height]);

  // Wheel zoom
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = -e.deltaY * 0.0012;
    setView(v => {
      const next = Math.max(0.4, Math.min(3.0, v.scale * (1 + delta)));
      const k = next / v.scale;
      return {
        scale: next,
        tx: cx - k * (cx - v.tx),
        ty: cy - k * (cy - v.ty),
      };
    });
  }, []);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const h = (e) => onWheel(e);
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, [onWheel]);

  // Drag pan
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-node-id]')) return;
    dragRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.hypot(dx, dy) > 4) dragRef.current.moved = true;
    const tx = dragRef.current.tx + dx;
    const ty = dragRef.current.ty + dy;
    setView(v => ({ ...v, tx, ty }));
  };
  const onMouseUp = (e) => {
    const wasDrag = dragRef.current?.moved;
    dragRef.current = null;
    if (!wasDrag && !e.target.closest('[data-node-id]')) {
      onSelectNode?.(null);
    }
  };

  return (
    <div
      ref={wrapRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { dragRef.current = null; }}
      style={{
        width: '100%', height: '100%',
        position: 'relative',
        background: COLORS.bg,
        overflow: 'hidden',
        cursor: dragRef.current ? 'grabbing' : 'grab',
      }}
    >
      <svg width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          {/* Glow filter — small */}
          <filter id="cm-glow-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="cm-glow-md" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="cm-glow-lg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          {/* Subtle dot grid pattern */}
          <pattern id="cm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.8" fill={COLORS.amber} opacity="0.18" />
          </pattern>
        </defs>

        {/* Bg dot grid */}
        <rect width="100%" height="100%" fill="url(#cm-grid)" />

        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
          {/* Layer 1: District hulls (soft radial tints) */}
          {Object.entries(layout.hulls).map(([did, h]) => {
            const color = DISTRICTS[did]?.color ?? '#888';
            return (
              <circle
                key={did}
                cx={h.cx} cy={h.cy} r={h.r}
                fill={color}
                opacity={0.04}
              />
            );
          })}

          {/* Layer 2: Edges (drawn first → behind nodes) */}
          {layout.edges.map(e => {
            const fromNode = nodes.find(n => n.id === e.from);
            const toNode   = nodes.find(n => n.id === e.to);
            if (!fromNode || !toNode) return null;

            const bothOwned = fromNode.status === 'owned' && toNode.status === 'owned';
            const oneOwned  = fromNode.status === 'owned' || toNode.status === 'owned';
            const oneInProgress = fromNode.status === 'infiltrating' || toNode.status === 'infiltrating';
            const bothVisible = fromNode.status !== 'distant' && toNode.status !== 'distant';
            const oneVisible  = fromNode.status !== 'distant' || toNode.status !== 'distant';

            let strokeColor, strokeWidth, strokeOpacity, animated;
            if (bothOwned) {
              strokeColor = COLORS.amber;
              strokeWidth = 2;
              strokeOpacity = 0.9;
              animated = true;
            } else if (oneInProgress) {
              strokeColor = COLORS.cyan;
              strokeWidth = 1.5;
              strokeOpacity = 0.7;
              animated = true;
            } else if (oneOwned) {
              strokeColor = COLORS.amber;
              strokeWidth = 1;
              strokeOpacity = 0.5;
              animated = false;
            } else if (bothVisible) {
              strokeColor = '#5a5a5a';
              strokeWidth = 0.7;
              strokeOpacity = 0.4;
              animated = false;
            } else if (oneVisible) {
              strokeColor = '#3a3a3a';
              strokeWidth = 0.5;
              strokeOpacity = 0.3;
              animated = false;
            } else {
              return null;
            }

            return (
              <g key={e.id}>
                <line
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={strokeOpacity}
                />
                {animated && (
                  <line
                    x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke={COLORS.amber}
                    strokeWidth={1.5}
                    strokeDasharray="2 8"
                    opacity={0.85}
                    style={{
                      filter: `drop-shadow(0 0 3px ${COLORS.amber})`,
                      animation: `cmFlow 1.6s linear infinite`,
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Layer 3: Glow halos (under nodes) */}
          {nodes.map(n => {
            if (n.status === 'distant') return null;
            const color = statusColor(n);
            const r = NODE_RADII[n.tier] ?? 12;
            return (
              <circle
                key={`glow-${n.id}`}
                cx={n.x} cy={n.y}
                r={r * 1.6}
                fill={color}
                opacity={n.status === 'owned' ? 0.18 : 0.10}
                filter="url(#cm-glow-md)"
              />
            );
          })}

          {/* Layer 4: Nodes themselves */}
          {nodes.map(n => {
            const r = NODE_RADII[n.tier] ?? 12;
            const color = statusColor(n);
            const opacity = statusOpacity(n);
            const selected = selectedNodeId === n.id;

            const isWarpgate = n.tier === 'edge';
            const isCore     = n.tier === 'core';

            return (
              <g
                key={n.id}
                data-node-id={n.id}
                onClick={(e) => { e.stopPropagation(); onSelectNode?.(n.id); }}
                style={{ cursor: n.status === 'distant' ? 'default' : 'pointer' }}
              >
                {/* Selection ring */}
                {selected && (
                  <circle
                    cx={n.x} cy={n.y} r={r + 9}
                    fill="none"
                    stroke={COLORS.amber}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity={0.8}
                    style={{ animation: 'cmRotate 8s linear infinite', transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                )}

                {/* Node body — shape varies by tier */}
                {isWarpgate ? (
                  // Diamond for warpgates
                  <polygon
                    points={`${n.x},${n.y - r} ${n.x + r},${n.y} ${n.x},${n.y + r} ${n.x - r},${n.y}`}
                    fill={n.status === 'owned' ? color : COLORS.bg}
                    stroke={color}
                    strokeWidth={selected ? 2 : 1.5}
                    opacity={opacity}
                  />
                ) : isCore ? (
                  // Concentric hex for cores
                  <>
                    <polygon points={hexPts(n.x, n.y, r)}
                      fill={n.status === 'owned' ? color : COLORS.bg}
                      stroke={color} strokeWidth={selected ? 2.5 : 2} opacity={opacity} />
                    <polygon points={hexPts(n.x, n.y, r - 6)}
                      fill="none"
                      stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
                  </>
                ) : (
                  // Circle for normal/major/minor
                  <circle
                    cx={n.x} cy={n.y} r={r}
                    fill={n.status === 'owned' ? color : COLORS.bg}
                    stroke={color}
                    strokeWidth={selected ? 2 : (n.tier === 'major' ? 1.5 : 1)}
                    opacity={opacity}
                  />
                )}

                {/* Inner dot for owned nodes (data flow indicator) */}
                {n.status === 'owned' && !isCore && (
                  <circle cx={n.x} cy={n.y} r={2} fill={COLORS.bg} />
                )}

                {/* Infiltrating pulse */}
                {n.status === 'infiltrating' && (
                  <circle cx={n.x} cy={n.y} r={r + 4}
                    fill="none" stroke={COLORS.cyan} strokeWidth="1"
                    style={{ animation: 'cmPulse 1.4s ease-in-out infinite' }}
                  />
                )}

                {/* Hot zone marker */}
                {n.hot && (
                  <circle cx={n.x + r * 0.8} cy={n.y - r * 0.8} r={3}
                    fill={COLORS.red}
                    style={{ filter: `drop-shadow(0 0 4px ${COLORS.red})` }}
                  />
                )}

                {/* Reclaim warning ring */}
                {n.status === 'owned' && n.reclaimStage && (
                  <circle cx={n.x} cy={n.y} r={r + 6}
                    fill="none"
                    stroke={COLORS.red}
                    strokeWidth="1.5"
                    strokeDasharray={n.reclaimStage === 'LAST_STAND' ? '4 2' : '6 4'}
                    opacity={0.85}
                    style={{ animation: 'cmPulse 1.0s ease-in-out infinite' }}
                  />
                )}

                {/* Label — only for major+ nodes, or selected, or hovered */}
                {(n.tier !== 'minor' && n.tier !== 'normal' || selected) && n.status !== 'distant' && (
                  <text
                    x={n.x} y={n.y + r + 14}
                    textAnchor="middle"
                    fontSize={isCore ? 10 : 8}
                    fontFamily="JetBrains Mono, ui-monospace, monospace"
                    fontWeight={isCore ? 700 : 500}
                    fill={color}
                    opacity={opacity}
                    style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}
                  >
                    {shortLabel(n.label)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        bottom: 14, right: 14,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <ZoomBtn onClick={() => setView(v => ({ ...v, scale: Math.min(3, v.scale * 1.25) }))}>+</ZoomBtn>
        <ZoomBtn onClick={() => setView(v => ({ ...v, scale: Math.max(0.4, v.scale * 0.8) }))}>−</ZoomBtn>
        <ZoomBtn onClick={() => {
          if (!wrapRef.current) return;
          const r = wrapRef.current.getBoundingClientRect();
          const s = Math.min(r.width / layout.width, r.height / layout.height) * 0.92;
          setView({ scale: s, tx: r.width / 2 - (layout.width / 2) * s, ty: r.height / 2 - (layout.height / 2) * s });
        }}>⊡</ZoomBtn>
      </div>

      {/* Legend top-left (zoom controls bottom-right — separated) */}
      <div style={{
        position: 'absolute',
        top: 14, left: 14,
        display: 'flex', flexDirection: 'column', gap: 5,
        fontSize: 9, letterSpacing: '0.18em',
        background: `${COLORS.surface}dd`,
        padding: '6px 10px',
        border: `1px solid ${COLORS.amberLine}`,
      }}>
        <LegendDot color={COLORS.amber} label="OWNED" />
        <LegendDot color={COLORS.cyan} label="INFILTRATING" />
        <LegendDot color={COLORS.amber} label="REACHABLE" dim />
        <LegendDot color={COLORS.amberDim} label="DISTANT" dim />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes cmFlow {
          to { stroke-dashoffset: -10; }
        }
        @keyframes cmPulse {
          0%,100% { opacity: 0.8; r: ${20}; }
          50%     { opacity: 0.2; r: ${28}; }
        }
        @keyframes cmRotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function hexPts(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return pts.join(' ');
}

function shortLabel(label) {
  if (!label) return '';
  if (label.length <= 18) return label;
  return label.slice(0, 16) + '…';
}

function ZoomBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 28, height: 28,
        background: `${COLORS.surface}dd`,
        border: `1px solid ${COLORS.amberLine}`,
        color: COLORS.amber,
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function LegendDot({ color, label, dim }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: dim ? 0.55 : 1 }}>
      <span style={{ width: 7, height: 7, background: color, boxShadow: dim ? 'none' : `0 0 4px ${color}` }} />
      <span style={{ color: COLORS.amberDim, fontWeight: 700 }}>{label}</span>
    </div>
  );
}