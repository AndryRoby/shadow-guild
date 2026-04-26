// HUD-style vector identicon for agents.
// Cyberpunk: thin lines, hexagons, data readouts, no pixel grid.
// Deterministic per name, status-aware.

function hashString(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h;
  }
  
  // Status → accent color
  function statusColor(status) {
    switch (status) {
      case 'ON_MISSION': return '#00d4ff';
      case 'CAPTURED':   return '#ef4444';
      case 'INJURED':    return '#f97316';
      case 'EXHAUSTED':  return '#a855f7';
      case 'TRAINING':   return '#a855f7';
      default:           return '#FFC174';
    }
  }
  
  export function AgentAvatar({ name, role, size = 40, status, primaryColor }) {
    const h = hashString((name || 'AGENT') + (role || ''));
    const accent = primaryColor || statusColor(status);
  
    // Variant pick — 6 different HUD silhouettes
    const variant = h % 6;
  
    // Ring segments (around portrait)
    const segments = 8;
    const filledSegments = (h >> 4) % segments;
  
    // Signal bars
    const bar1 = ((h >> 8) & 0xff) / 255;
    const bar2 = ((h >> 16) & 0xff) / 255;
    const bar3 = ((h >> 24) & 0xff) / 255;
  
    const cx = size / 2;
    const cy = size / 2;
    const r  = size * 0.32;
  
    // Short ID token
    const idHash = (h % 999).toString(16).toUpperCase().padStart(3, '0');
  
    const dimmed = status === 'CAPTURED' || status === 'EXHAUSTED';
  
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          display: 'block',
          opacity: dimmed ? 0.55 : 1,
          filter: status === 'CAPTURED' ? 'grayscale(1)' : 'none',
        }}
      >
        {/* Dark BG */}
        <rect x="0" y="0" width={size} height={size} fill="#0a0a0a" />
  
        {/* Corner brackets — HUD style */}
        <path d={`M 2 6 L 2 2 L 6 2`} stroke={accent} strokeWidth="1" fill="none" opacity="0.6"/>
        <path d={`M ${size-6} 2 L ${size-2} 2 L ${size-2} 6`} stroke={accent} strokeWidth="1" fill="none" opacity="0.6"/>
        <path d={`M 2 ${size-6} L 2 ${size-2} L 6 ${size-2}`} stroke={accent} strokeWidth="1" fill="none" opacity="0.6"/>
        <path d={`M ${size-6} ${size-2} L ${size-2} ${size-2} L ${size-2} ${size-6}`} stroke={accent} strokeWidth="1" fill="none" opacity="0.6"/>
  
        {/* Ring segments — filled count varies by hash */}
        {Array.from({ length: segments }).map((_, i) => {
          const a1 = (i / segments) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2;
          const gap = 0.05;
          const x1 = cx + Math.cos(a1 + gap) * r * 1.25;
          const y1 = cy + Math.sin(a1 + gap) * r * 1.25;
          const x2 = cx + Math.cos(a2 - gap) * r * 1.25;
          const y2 = cy + Math.sin(a2 - gap) * r * 1.25;
          const filled = i < filledSegments;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r * 1.25} ${r * 1.25} 0 0 1 ${x2} ${y2}`}
              stroke={accent}
              strokeWidth="1"
              fill="none"
              opacity={filled ? 0.9 : 0.15}
            />
          );
        })}
  
        {/* Central silhouette — varies by variant */}
        {variant === 0 && (
          // Hexagon mask
          <polygon
            points={`${cx},${cy - r * 0.9} ${cx + r * 0.78},${cy - r * 0.45} ${cx + r * 0.78},${cy + r * 0.45} ${cx},${cy + r * 0.9} ${cx - r * 0.78},${cy + r * 0.45} ${cx - r * 0.78},${cy - r * 0.45}`}
            stroke={accent}
            strokeWidth="1.2"
            fill="none"
          />
        )}
        {variant === 1 && (
          // Triangle
          <polygon
            points={`${cx},${cy - r} ${cx + r * 0.9},${cy + r * 0.7} ${cx - r * 0.9},${cy + r * 0.7}`}
            stroke={accent}
            strokeWidth="1.2"
            fill="none"
          />
        )}
        {variant === 2 && (
          // Diamond
          <polygon
            points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
            stroke={accent}
            strokeWidth="1.2"
            fill="none"
          />
        )}
        {variant === 3 && (
          // Inverted triangle
          <polygon
            points={`${cx - r * 0.9},${cy - r * 0.6} ${cx + r * 0.9},${cy - r * 0.6} ${cx},${cy + r}`}
            stroke={accent}
            strokeWidth="1.2"
            fill="none"
          />
        )}
        {variant === 4 && (
          // Square rotated
          <polygon
            points={`${cx - r * 0.7},${cy - r * 0.7} ${cx + r * 0.7},${cy - r * 0.7} ${cx + r * 0.7},${cy + r * 0.7} ${cx - r * 0.7},${cy + r * 0.7}`}
            stroke={accent}
            strokeWidth="1.2"
            fill="none"
          />
        )}
        {variant === 5 && (
          // Circle
          <circle cx={cx} cy={cy} r={r} stroke={accent} strokeWidth="1.2" fill="none"/>
        )}
  
        {/* Horizontal scan line through center */}
        <line
          x1={cx - r}
          y1={cy}
          x2={cx + r}
          y2={cy}
          stroke={accent}
          strokeWidth="0.5"
          opacity="0.4"
        />
  
        {/* Signal bars — bottom */}
        {[bar1, bar2, bar3].map((v, i) => (
          <rect
            key={i}
            x={size * 0.08 + i * size * 0.06}
            y={size * 0.88 - size * 0.08 * v}
            width={size * 0.04}
            height={size * 0.08 * v}
            fill={accent}
            opacity="0.7"
          />
        ))}
  
        {/* ID token — top right */}
        <text
          x={size - 4}
          y={9}
          textAnchor="end"
          fontSize={size * 0.16}
          fill={accent}
          fontFamily="monospace"
          letterSpacing="0.05em"
          opacity="0.7"
        >
          {idHash}
        </text>
  
        {/* Status overlay */}
        {status === 'ON_MISSION' && (
          <circle cx={size - 5} cy={size - 5} r={2.5} fill="#00d4ff">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/>
          </circle>
        )}
        {status === 'CAPTURED' && (
          <>
            <line x1="2" y1="2" x2={size-2} y2={size-2} stroke="#ef4444" strokeWidth="1.5" opacity="0.7"/>
            <line x1={size-2} y1="2" x2="2" y2={size-2} stroke="#ef4444" strokeWidth="1.5" opacity="0.7"/>
          </>
        )}
        {status === 'INJURED' && (
          <rect x="0" y={size - 4} width={size} height="2" fill="#f97316">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite"/>
          </rect>
        )}
      </svg>
    );
  }