// Fullscreen radial perk tree modal.
// ESC or backdrop click → close. Pan+zoom (wheel+drag).
// Renders over entire viewport. Opened from AwakeningTab.

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { COLORS } from '../design/primitives.jsx';
import { PRESTIGE_PERK_DEFS, PERK_FLAVOR } from '../gameLogic.js';
import { HexFeed } from './HexFeed.jsx';

// ─── Branch config (matches AwakeningTab colors) ─────────────────────────
const BRANCH = {
  GHOST:     { color: COLORS.cyan,   label: 'GHOST',     sub: 'STEALTH // SURVIVABILITY' },
  OVERLORD:  { color: COLORS.gold,   label: 'OVERLORD',  sub: 'ECONOMY // YIELD' },
  ARCHITECT: { color: COLORS.purple, label: 'ARCHITECT', sub: 'INFRASTRUCTURE // INTEL' },
  UNIVERSAL: { color: COLORS.red,    label: 'UNIVERSAL', sub: 'ASCENDANT // PRESTIGE' },
};

// ─── Geometry ──────────────────────────────────────────────────────────────
const CENTER = { x: 1000, y: 620 };
const RINGS  = { 1: 185, 2: 305, 3: 425, 4: 545, 5: 715 };

function pos(angle, ring) {
  const r = RINGS[ring] ?? 200;
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER.x + Math.cos(rad) * r, y: CENTER.y + Math.sin(rad) * r };
}

function hexPts(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return pts.join(' ');
}
const hexShape     = (cx, cy, r) => hexPts(cx, cy, r);
const diamondShape = (cx, cy, r) => `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;

// ─── Build enriched nodes ──────────────────────────────────────────────────
function buildNodes(state) {
  const owned = state.prestigePerks ?? {};
  const prestige = state.prestige ?? 0;
  const level = state.level ?? 1;
  const points = state.prestigePoints ?? 0;

  return PRESTIGE_PERK_DEFS.map(p => {
    const prestigeOk = !p.requiresPrestige || prestige >= p.requiresPrestige;
    const levelOk    = level >= (p.reqLevel ?? 1);
    const isOwned    = !!owned[p.id];
    // reqs are decorative only (reducer doesn't enforce them).
    const hidden = false; // show all, locked status handles visibility

    let status;
    if (isOwned)                                              status = 'owned';
    else if (levelOk && prestigeOk && points >= (p.cost ?? 1)) status = 'available';
    else if (levelOk && prestigeOk)                            status = 'unaffordable';
    else                                                       status = 'locked';

    const flavor = PERK_FLAVOR[p.id] ?? '';
    return { ...p, status, prestigeOk, levelOk, hidden, flavor };
  });
}

// ─── Main modal ────────────────────────────────────────────────────────────
export function PerkTreeModal({ state, dispatchWithSound, onClose }) {
  const [hoverId, setHoverId] = useState(null);
  const nodes = useMemo(() => buildNodes(state), [state]);
  const hoverNode = nodes.find(n => n.id === hoverId) || null;

  // ESC closes — capture phase + stopImmediatePropagation beats App.jsx global handler
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const buy = (node) => {
    if (node.status !== 'available') return;
    dispatchWithSound({ type: 'BUY_PRESTIGE_PERK', perkId: node.id });
  };

  // Pan + zoom
  const wrapRef = useRef(null);
  const [view, setView] = useState({ scale: 0.6, tx: 0, ty: 0 });
  const dragRef = useRef(null);

  // Center tree on mount
  useEffect(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const s = Math.min(r.width / 2000, r.height / 1250, 1.1) * 0.95;
    setView({
      scale: s,
      tx: r.width / 2 - CENTER.x * s,
      ty: r.height / 2 - CENTER.y * s,
    });
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0012;
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setView(v => {
      const nextScale = Math.max(0.3, Math.min(1.6, v.scale * (1 + delta)));
      const k = nextScale / v.scale;
      return {
        scale: nextScale,
        tx: cx - k * (cx - v.tx),
        ty: cy - k * (cy - v.ty),
      };
    });
  }, []);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const { x, y, tx, ty } = dragRef.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    setView(v => ({ ...v, tx: tx + dx, ty: ty + dy }));
      };
  const onMouseUp = () => { dragRef.current = null; };

  // Attach wheel via ref (passive:false so preventDefault works)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e) => onWheel(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [onWheel]);

  return createPortal((
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(ellipse at center, #0d0b16 0%, #050505 70%)',
        overflow: 'hidden',
        animation: 'snapIn 180ms ease-out',
      }}
    >
      {/* Dot grid background */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.25 }}
      >
        <defs>
          <pattern id="pt-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 L0 0 0 60" fill="none" stroke={COLORS.amberLine} strokeWidth="0.5" />
          </pattern>
          <radialGradient id="pt-fade" cx="50%" cy="50%" r="60%">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pt-grid)" />
        <rect width="100%" height="100%" fill="url(#pt-fade)" />
      </svg>

      {/* Top chrome */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: `1px solid ${COLORS.amberLine}`,
          background: `linear-gradient(180deg, ${COLORS.surface}cc, ${COLORS.surface}66)`,
          backdropFilter: 'blur(6px)',
          zIndex: 5,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 6, height: 6, background: COLORS.red, boxShadow: `0 0 6px ${COLORS.red}` }} />
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: COLORS.amberDim }}>:: SHADOW_GUILD</div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', color: COLORS.amber }}>
            NEURAL_PRESTIGE_WEB
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 10, letterSpacing: '0.2em', color: COLORS.amberDim, alignItems: 'center' }}>
          <span>WHEEL · ZOOM</span>
          <span>DRAG · PAN</span>
          <span>ESC · EXIT</span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${COLORS.amber}`,
              color: COLORS.amber,
              padding: '4px 10px',
              fontFamily: 'inherit',
              fontSize: 10,
              letterSpacing: '0.2em',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 6,
            }}
          >
            ✕ CLOSE
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={wrapRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          position: 'absolute', inset: '44px 0 0 0',
          cursor: dragRef.current ? 'grabbing' : 'grab',
        }}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
            {/* Concentric guide rings */}
            {[1, 2, 3, 4, 5].map(r => (
              <circle
                key={r}
                cx={CENTER.x} cy={CENTER.y} r={RINGS[r]}
                fill="none"
                stroke={r === 5 ? `${COLORS.red}22` : COLORS.amberDim}
                strokeWidth="0.5" strokeOpacity="0.4"
                strokeDasharray={r === 5 ? '1 6' : '1 3'}
              />
            ))}

            {/* Branch axis lines */}
            {[{ a: 0, c: COLORS.purple }, { a: 125, c: COLORS.gold }, { a: 235, c: COLORS.cyan }].map((b, i) => {
              const end = pos(b.a, 5);
              return <line key={i} x1={CENTER.x} y1={CENTER.y} x2={end.x} y2={end.y}
                stroke={`${b.c}11`} strokeWidth="0.5" />;
            })}

            {/* Branch labels */}
            <BranchLabel branch="UNIVERSAL" angle={180} radius={800} />
            <BranchLabel branch="GHOST"     angle={235} radius={800} />
            <BranchLabel branch="OVERLORD"  angle={125} radius={800} />
            <BranchLabel branch="ARCHITECT" angle={0}   radius={800} />

            {/* Connections: reqs-based */}
            {nodes.map(n => {
              if (n.hidden) return null;
              return (n.reqs ?? []).map(rId => {
                const from = nodes.find(x => x.id === rId);
                if (!from || from.hidden) return null;
                const owned = state.prestigePerks ?? {};
                const active = !!owned[from.id] && !!owned[n.id];
                const prospective = !!owned[from.id] && !owned[n.id];
                return <Connection key={`${rId}-${n.id}`} from={from} to={n} active={active} prospective={prospective} />;
              });
            })}

            {/* Connections from core to ring-1 nodes */}
            {nodes.filter(n => n.ring === 1 && !n.hidden).map(n => {
              const bColor = BRANCH[n.branch].color;
              const p = pos(n.angle, n.ring);
              const dx = p.x - CENTER.x, dy = p.y - CENTER.y;
              const d2 = Math.sqrt(dx * dx + dy * dy) || 1;
              const ux = dx / d2, uy = dy / d2;
              const startR = 100;
              const sx = CENTER.x + ux * startR, sy = CENTER.y + uy * startR;
              const owned = !!(state.prestigePerks ?? {})[n.id];
              return (
                <line
                  key={`core-${n.id}`}
                  x1={sx} y1={sy} x2={p.x} y2={p.y}
                  stroke={owned ? bColor : `${bColor}66`}
                  strokeWidth={owned ? 1.5 : 0.75}
                  strokeDasharray={owned ? 'none' : '2 3'}
                  opacity={owned ? 0.9 : 0.5}
                  style={owned ? { filter: `drop-shadow(0 0 3px ${bColor})` } : null}
                />
              );
            })}

            {/* Awakening Core */}
            <AwakeningCore
              level={state.level ?? 1}
              prestige={state.prestige ?? 0}
              points={state.prestigePoints ?? 0}
              totalSpent={Object.keys(state.prestigePerks ?? {}).length}
            />

            {/* Nodes */}
            {nodes.map(n => (
              <PerkNode
                key={n.id}
                node={n}
                isHover={hoverId === n.id}
                onHover={() => setHoverId(n.id)}
                onLeave={() => setHoverId(null)}
                onClick={buy}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Overlays */}
      <StatsHud state={state} nodes={nodes} />
      <DetailSidebar node={hoverNode} onBuy={buy} state={state} />
      <Legend />
    </div>
  ), document.body);
}

// ─── Perk node ─────────────────────────────────────────────────────────────
function PerkNode({ node, isHover, onHover, onLeave, onClick }) {
  if (node.hidden) return null;
  const { x, y } = pos(node.angle, node.ring);
  const bColor = BRANCH[node.branch].color;
  const size = node.ring === 5 ? 46 : node.ring === 4 ? 42 : 38;

  const s = node.status;
  const owned         = s === 'owned';
  const available     = s === 'available';
  const unaffordable  = s === 'unaffordable';
  const locked        = s === 'locked';

  const fill         = owned ? bColor : COLORS.bg;
  const fillAlpha    = owned ? 1 : unaffordable ? 0.7 : 1;
  const stroke       = owned ? bColor : available ? bColor : unaffordable ? `${bColor}88` : COLORS.amberDim;
  const strokeWidth  = owned ? 2 : available ? 1.5 : 1;
  const dashed       = locked;
  const isLegendary  = node.branch === 'UNIVERSAL';
  const shape        = isLegendary ? diamondShape(x, y, size / 2) : hexShape(x, y, size / 2);
  const glow         = owned || available;

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => onClick(node)}
      style={{ cursor: available ? 'pointer' : 'default' }}
    >
      {/* Pulsing outer ring for available */}
      {available && (
        <polygon
          points={isLegendary ? diamondShape(x, y, size / 2 + 7) : hexShape(x, y, size / 2 + 7)}
          fill="none" stroke={bColor} strokeWidth="1" opacity="0.6"
          style={{ animation: 'pulseHeatNew 2s ease-in-out infinite' }}
        />
      )}

      {/* BG disc */}
      <circle cx={x} cy={y} r={size / 2 + 2} fill={COLORS.bg} opacity={0.95} />

      {/* Core shape */}
      <polygon
        points={shape}
        fill={fill}
        fillOpacity={fillAlpha}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '3 3' : 'none'}
        style={{
          filter: glow ? `drop-shadow(0 0 ${owned ? 5 : 2.5}px ${bColor})` : 'none',
          transition: 'all 200ms',
        }}
      />

      {/* Inner ring when owned */}
      {owned && (
        <polygon
          points={isLegendary ? diamondShape(x, y, size / 2 - 5) : hexShape(x, y, size / 2 - 5)}
          fill="none" stroke={COLORS.bg} strokeWidth="1" opacity="0.5"
        />
      )}

      {/* Hover halo */}
      {isHover && (
        <polygon
          points={isLegendary ? diamondShape(x, y, size / 2 + 12) : hexShape(x, y, size / 2 + 12)}
          fill="none" stroke={bColor} strokeWidth="1" opacity="0.7"
        />
      )}

      {/* Short label (first segment of ID) */}
      <text
        x={x} y={y + 3}
        textAnchor="middle"
        fontSize="9"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontWeight="800"
        fill={owned ? '#000' : available ? bColor : locked ? COLORS.amberDim : `${bColor}99`}
        letterSpacing="0.03em"
        style={{ pointerEvents: 'none' }}
      >
        {node.id.split('_')[0].slice(0, 6)}
      </text>

      {/* Cost tag */}
      {!owned && !locked && (
        <g style={{ pointerEvents: 'none' }}>
          <rect x={x - 10} y={y + size / 2 + 4} width="20" height="11"
            fill={COLORS.bg} stroke={bColor} strokeOpacity={0.6} strokeWidth="0.75" />
          <text x={x} y={y + size / 2 + 12}
            fill={bColor} fontSize="8" fontFamily="JetBrains Mono, ui-monospace, monospace"
            textAnchor="middle" fontWeight="700" letterSpacing="0.05em">
            {node.cost}pt
          </text>
        </g>
      )}

      {/* Locked marker */}
      {locked && (
        <text
          x={x + size / 2 - 4} y={y + size / 2 - 2}
          textAnchor="end" fontSize="10"
          fill={COLORS.amberDim} fontFamily="JetBrains Mono, ui-monospace, monospace"
          style={{ pointerEvents: 'none' }}
        >
          ⌧
        </text>
      )}
    </g>
  );
}

// ─── Connection ────────────────────────────────────────────────────────────
function Connection({ from, to, active, prospective }) {
  const bColor = BRANCH[to.branch].color;
  const fromP = pos(from.angle, from.ring);
  const toP   = pos(to.angle,   to.ring);
  const mx = (fromP.x + toP.x) / 2;
  const my = (fromP.y + toP.y) / 2;
  const dx = CENTER.x - mx, dy = CENTER.y - my;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bend = 30;
  // bend away from core
  const cx = mx + (dx / dist) * -bend;
  const cy = my + (dy / dist) * -bend;
  const path = `M ${fromP.x} ${fromP.y} Q ${cx} ${cy} ${toP.x} ${toP.y}`;

  if (active) {
    return (
      <path d={path} fill="none" stroke={bColor} strokeWidth="2" opacity="0.9"
        style={{ filter: `drop-shadow(0 0 4px ${bColor}aa)` }} />
    );
  }
  return (
    <path
      d={path} fill="none"
      stroke={prospective ? `${bColor}77` : COLORS.amberDim}
      strokeWidth="1"
      strokeDasharray={prospective ? 'none' : '2 4'}
      opacity={prospective ? 0.6 : 0.4}
    />
  );
}

// ─── Awakening core ────────────────────────────────────────────────────────
function AwakeningCore({ level, prestige, points, totalSpent }) {
	const { x, y } = CENTER;

	return (
		<g style={{ pointerEvents: 'none' }}>
			{/* Definícia gradientu - musí byť vnútri SVG, ale mimo <g> alebo na začiatku */}
			<defs>
				<radialGradient id="coreHalo">
					<stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.2" />
					<stop offset="50%" stopColor={COLORS.gold} stopOpacity="0.05" />
					<stop offset="100%" stopColor={COLORS.gold} stopOpacity="0" />
				</radialGradient>
			</defs>

			{/* Halo efekt s gradientom */}
			<circle 
				cx={x} cy={y} r={120} 
				fill="url(#coreHalo)" 
				style={{ 
					animation: 'pulseHeatNew 4s ease-in-out infinite alternate',
					transformOrigin: `${x}px ${y}px` 
				}} 
			/>
      
      {/* Outer Geometries */}
      <polygon points={hexPts(x, y, 100)} fill="none" stroke={COLORS.gold} strokeWidth="1" opacity="0.3" />
      <polygon points={hexPts(x, y, 86)}  fill={COLORS.bg} stroke={COLORS.gold} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 16px ${COLORS.gold}66)` }} />
      
      {/* Watermark Prestige Number (Obrovské, ale priesvitné v pozadí) */}
      <text x={x} y={y + 24} textAnchor="middle" fill={COLORS.gold} opacity="0.12" fontSize="76"
        fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="900" letterSpacing="-0.05em">
        P{prestige}
      </text>

      {/* Header */}
      <text x={x} y={y - 28} textAnchor="middle" fill={COLORS.gold} fontSize="11" fontWeight="800"
        fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing="0.3em">
        AWAKENING
      </text>

      {/* Solid Divider */}
      <line x1={x - 48} y1={y - 18} x2={x + 48} y2={y - 18} stroke={COLORS.gold} strokeWidth="1" opacity="0.5" />

      {/* ─── DATA GRID (Labely vľavo, Čísla vpravo) ─── */}
      
      {/* Row 1: LEVEL */}
      <text x={x - 42} y={y - 2} textAnchor="start" fill="rgba(255,215,0,0.6)" fontSize="8" 
        fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing="0.1em">LEVEL</text>
      <text x={x + 42} y={y - 2} textAnchor="end" fill={COLORS.gold} fontSize="11" 
        fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700">{level}</text>

      <line x1={x - 45} y1={y + 5} x2={x + 45} y2={y + 5} stroke={COLORS.gold} strokeWidth="0.5" strokeDasharray="1 3" opacity="0.3" />

      {/* Row 2: POINTS */}
      <text x={x - 42} y={y + 17} textAnchor="start" fill="rgba(255,215,0,0.6)" fontSize="8" 
        fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing="0.1em">POINTS</text>
      <text x={x + 42} y={y + 17} textAnchor="end" fill={COLORS.gold} fontSize="11" 
        fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700">{points}</text>

      <line x1={x - 45} y1={y + 24} x2={x + 45} y2={y + 24} stroke={COLORS.gold} strokeWidth="0.5" strokeDasharray="1 3" opacity="0.3" />

      {/* Row 3: SPENT */}
      <text x={x - 42} y={y + 36} textAnchor="start" fill="rgba(255,215,0,0.6)" fontSize="8" 
        fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing="0.1em">SPENT</text>
      <text x={x + 42} y={y + 36} textAnchor="end" fill={COLORS.gold} fontSize="11" 
        fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700">{totalSpent}</text>
      
      {/* Bottom Accent Bracket (Zakončenie UI) */}
      <path d={`M ${x - 15} ${y + 46} L ${x + 15} ${y + 46}`} fill="none" stroke={COLORS.gold} strokeWidth="1.5" opacity="0.5" />
    </g>
  );
}

// ─── Branch label ──────────────────────────────────────────────────────────
function BranchLabel({ branch, angle, radius = 800 }) {
  const b = BRANCH[branch];
  const a = (angle - 90) * Math.PI / 180;
  const x = CENTER.x + Math.cos(a) * radius;
  const y = CENTER.y + Math.sin(a) * radius;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <text
        x={x} y={y}
        textAnchor="middle"
        fill={b.color}
        fontSize="22"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontWeight="800"
        letterSpacing="0.3em"
        style={{ filter: `drop-shadow(0 0 10px ${b.color}77)` }}
      >
        {b.label}
      </text>
      <text
        x={x} y={y + 16}
        textAnchor="middle"
        fill={`${b.color}88`}
        fontSize="9"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        letterSpacing="0.35em"
      >
        {b.sub}
      </text>
    </g>
  );
}

// ─── Detail sidebar (right) ────────────────────────────────────────────────
function DetailSidebar({ node, onBuy, state }) {
  const panelStyle = {
    position: 'absolute', top: 60, right: 20,
    width: 320,
    background: `${COLORS.surface}ee`,
    padding: '18px 18px 16px',
    backdropFilter: 'blur(6px)',
    animation: 'snapIn 180ms ease-out',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
  };

  if (!node) {
    return (
      <div style={{ ...panelStyle, border: `1px solid ${COLORS.amberLine}` }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: COLORS.amberDim }}>:: DETAIL_SCANNER</div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 6, color: COLORS.amber, letterSpacing: '0.05em' }}>
          AWAITING TARGET
        </div>
        <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 8, lineHeight: 1.6, letterSpacing: '0.04em' }}>
          › hover any node in the neural web to analyze.
        </div>
        <div style={{
          fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.18em',
          marginTop: 14, borderTop: `1px solid ${COLORS.amberLine}`, paddingTop: 10,
        }}>
          ⌖ ghost · overlord · architect · universal
        </div>
      </div>
    );
  }

  const b = BRANCH[node.branch];
  const s = node.status;
  const owned = state.prestigePerks ?? {};

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        ...panelStyle,
        border: `1px solid ${b.color}`,
        boxShadow: `0 0 24px ${b.color}44, inset 0 0 40px ${b.color}08`,
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 8, letterSpacing: '0.3em', color: `${b.color}bb`,
      }}>
        <span>:: {b.label}_BRANCH</span>
        <span>R{node.reqLevel}</span>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 800, marginTop: 4,
        color: b.color, letterSpacing: '0.04em',
        textShadow: `0 0 8px ${b.color}55`,
      }}>
        {node.id.replace(/_/g, ' ')}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <Pill
          label={s.toUpperCase()}
          color={
            s === 'owned' ? COLORS.green
            : s === 'available' ? b.color
            : s === 'unaffordable' ? '#facc15'
            : COLORS.amberDim
          }
        />
        <Pill label={`COST ${node.cost} pt`} color={b.color} />
        {node.requiresPrestige && <Pill label={`P${node.requiresPrestige}+`} color={COLORS.gold} />}
      </div>
      
      {/* ─── LIVE DATA FEED EFEKT ─── */}
      <div style={{ marginTop: 10}}>
        <HexFeed lines={2} bytesPerLine={10} color={b.color} interval={420} />
      </div>

      <div style={{ marginTop: 14 }}>
        <Label>SYSTEM_EFFECT</Label>
        <div style={{ fontSize: 12, color: COLORS.amber, lineHeight: 1.55, marginTop: 4 }}>
          {node.desc}
        </div>
        <div style={{ fontSize: 10, color: `${b.color}cc`, marginTop: 6, letterSpacing: '0.05em' }}>
          ◆ {node.effect}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Label>REQUIREMENTS</Label>
        <div style={{ display: 'grid', gap: 4, marginTop: 4, fontSize: 10 }}>
          <ReqLine ok={node.levelOk} text={`LVL ≥ ${node.reqLevel}`} />
          {(node.reqs ?? []).map(r => (
            <ReqLine key={r} ok={!!owned[r]} text={`◂ ${r.replace(/_/g, ' ')}`} />
          ))}
          {node.requiresPrestige && (
            <ReqLine ok={node.prestigeOk} text={`PRESTIGE ≥ ${node.requiresPrestige}`} />
          )}
        </div>
      </div>

      {node.flavor && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${b.color}33`, paddingTop: 10 }}>
          <Label>FLAVOR_LOG</Label>
          <div style={{
            fontSize: 10, color: COLORS.amberDim, fontStyle: 'italic',
            marginTop: 4, lineHeight: 1.6, letterSpacing: '0.03em',
          }}>
            › {node.flavor}
          </div>
        </div>
      )}

      <button
        disabled={s !== 'available'}
        onClick={() => onBuy(node)}
        style={{
          width: '100%', marginTop: 14,
          background: s === 'available' ? b.color : 'transparent',
          color: s === 'available' ? '#000' : `${b.color}88`,
          border: `1px ${s === 'available' ? 'solid' : 'dashed'} ${b.color}${s === 'available' ? '' : '88'}`,
          padding: '10px 0',
          fontFamily: 'inherit',
          fontSize: 10, fontWeight: 800,
          letterSpacing: '0.3em',
          cursor: s === 'available' ? 'pointer' : 'not-allowed',
          transition: 'all 120ms',
        }}
      >
        {s === 'owned' ? 'ACQUIRED'
          : s === 'available' ? `ACQUIRE · ${node.cost} pt`
          : s === 'unaffordable' ? 'INSUFFICIENT pt'
          : 'LOCKED'}
      </button>
    </div>
  );
}

// ─── Stats HUD (left) ──────────────────────────────────────────────────────
function StatsHud({ state, nodes }) {
  const owned = state.prestigePerks ?? {};
  const ownedList = nodes.filter(n => n.status === 'owned');
  const grouped = {
    GHOST:     ownedList.filter(n => n.branch === 'GHOST').length,
    OVERLORD:  ownedList.filter(n => n.branch === 'OVERLORD').length,
    ARCHITECT: ownedList.filter(n => n.branch === 'ARCHITECT').length,
    UNIVERSAL: ownedList.filter(n => n.branch === 'UNIVERSAL').length,
  };

  const incomeMul = 1
    * (owned.GUILD_MASTER ? 1.25 : 1)
    * (owned.MARKET_LORD  ? 1.3  : 1)
    * (owned.EMPIRE       ? 1.5  : 1)
    * (owned.TYRANT       ? 2    : 1)
    * (owned.VOID_ECHO    ? 1.5  : 1);
  const siphonSuccess = owned.GHOST_AIM ? 10 : 0;
  const heatDecay     = owned.GHOST_FADE ? 25 : 0;
  const comboTimer    = 4 + (owned.GHOST_NERVE ? 2 : 0);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 60, left: 20, width: 260,
        background: `${COLORS.surface}ee`,
        border: `1px solid ${COLORS.amberLine}`,
        padding: '14px 16px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.35em', color: COLORS.amberDim }}>:: TOTAL_BONUSES</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.amber, letterSpacing: '0.04em', marginTop: 2 }}>
        NEURAL_STATE
      </div>

      <div style={{ marginTop: 10 }}>
        <Metric l="GLOBAL_INCOME"  v={`×${incomeMul.toFixed(2)}`}   c={incomeMul > 1 ? COLORS.gold : COLORS.amber} />
        <Metric l="SIPHON_SUCCESS" v={`+${siphonSuccess}%`}         c={siphonSuccess ? COLORS.green : COLORS.amber} />
        <Metric l="HEAT_DECAY"     v={`+${heatDecay}%`}             c={heatDecay ? COLORS.cyan : COLORS.amber} />
        <Metric l="COMBO_TIMER"    v={`${comboTimer}s`}             c={COLORS.amber} />
        <Metric l="HUNTER_IMMUNE"  v={owned.GHOST_FINAL ? 'ACTIVE' : '—'}
          c={owned.GHOST_FINAL ? COLORS.purple : COLORS.amberDim} />
      </div>

      <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.amberLine}`, paddingTop: 10 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: COLORS.amberDim }}>BRANCH_ACQUISITIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
          {Object.entries(grouped).map(([k, v]) => {
            const total = PRESTIGE_PERK_DEFS.filter(p => p.branch === k).length;
            const c = BRANCH[k].color;
            return (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 9, color: c, letterSpacing: '0.1em',
                }}>
                  <span>{k}</span>
                  <span style={{ fontWeight: 800 }}>{v}/{total}</span>
                </div>
                <div style={{ height: 2, background: COLORS.surfaceHigh }}>
                  <div style={{
                    width: `${total ? (v / total) * 100 : 0}%`,
                    height: '100%',
                    background: c,
                    boxShadow: `0 0 4px ${c}`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Legend (bottom right) ─────────────────────────────────────────────────
function Legend() {
  const entries = [
    { label: 'OWNED',        fill: COLORS.amber, stroke: COLORS.amber, dashed: false, solid: true },
    { label: 'AVAILABLE',    fill: 'transparent', stroke: COLORS.amber, dashed: false, solid: false, glow: true },
    { label: 'INSUFFICIENT', fill: 'transparent', stroke: `${COLORS.amber}88`, dashed: false, solid: false },
    { label: 'LOCKED',       fill: 'transparent', stroke: COLORS.amberDim, dashed: true, solid: false },
  ];
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', bottom: 20, right: 20,
        background: `${COLORS.surface}ee`,
        border: `1px solid ${COLORS.amberLine}`,
        padding: '12px 14px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.35em', color: COLORS.amberDim, marginBottom: 8 }}>:: LEGEND</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 9, letterSpacing: '0.12em' }}>
        {entries.map(e => (
          <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polygon
                points="7,1 13,4 13,10 7,13 1,10 1,4"
                fill={e.solid ? e.fill : 'none'}
                stroke={e.stroke}
                strokeWidth="1"
                strokeDasharray={e.dashed ? '2 2' : 'none'}
                style={{ filter: e.glow ? `drop-shadow(0 0 3px ${e.stroke})` : 'none' }}
              />
            </svg>
            <span style={{ color: e.label === 'LOCKED' ? COLORS.amberDim : COLORS.amber }}>{e.label}</span>
          </div>
        ))}
      </div>
      <div style={{
        fontSize: 8, color: COLORS.amberDim, marginTop: 10,
        letterSpacing: '0.15em', borderTop: `1px solid ${COLORS.amberLine}`, paddingTop: 8,
      }}>
        ◆ HEX · DIAMOND=LEGENDARY
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontSize: 8, letterSpacing: '0.3em', color: COLORS.amberDim }}>{children}</div>;
}
function Pill({ label, color }) {
  return (
    <span style={{
      fontSize: 8, letterSpacing: '0.2em', color,
      border: `1px solid ${color}55`,
      padding: '3px 6px', fontWeight: 700,
    }}>
      {label}
    </span>
  );
}
function ReqLine({ ok, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      color: ok ? COLORS.green : COLORS.red, letterSpacing: '0.04em',
    }}>
      <span style={{
        width: 6, height: 6,
        background: ok ? COLORS.green : COLORS.red,
        boxShadow: ok ? `0 0 4px ${COLORS.green}` : 'none',
      }} />
      <span>{text}</span>
    </div>
  );
}
function Metric({ l, v, c }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 10,
      fontSize: 10, letterSpacing: '0.05em',
      padding: '5px 0', borderBottom: `1px solid ${COLORS.amberLine}`,
    }}>
      <span style={{ color: COLORS.amberDim }}>{l}</span>
      <span style={{ color: c || COLORS.amber, fontWeight: 700 }}>{v}</span>
    </div>
  );
}