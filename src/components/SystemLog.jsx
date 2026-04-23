// System log with 3 tiers: normal / fail / zero.
// ZERO messages get a typewriter reveal animation on first render.

import { useEffect, useRef, useState } from 'react';
import { Panel, Tag, COLORS } from '../design/primitives.jsx';
import { getLogTierColor } from '../selectors.js';

// ─── Detect tier from log string content ─────────────────────────────────
function detectTier(entry) {
  const text = typeof entry === 'string' ? entry : (entry?.text ?? '');
  const upper = text.toUpperCase();

  if (text.includes('[ZERO >>]') || text.includes('[AMBIENT SHIFT]')) return 'zero';

  if (upper.includes('[BUSTED]')
   || upper.includes('FAIL')
   || upper.includes('CRITICAL')
   || upper.includes('LOCKOUT')
   || upper.includes('SEIZED')
   || upper.includes('LOST')
   || upper.includes('ERROR')) return 'fail';

  if (upper.includes('WARNING')
   || upper.includes('BOUNTY')
   || upper.includes('ABORTED')
   || upper.includes('INTRUSION')
   || upper.includes('ALERT')
   || upper.includes('[!]')) return 'warning';

  if (upper.includes('LEVEL UP')
   || upper.includes('UNLOCK')
   || upper.includes('ACHIEVEMENT')
   || upper.includes('CAPTURED')
   || upper.includes('SOLD')
   || upper.includes('RESTORED')
   || upper.includes('CLEARED')
   || upper.includes('SUCCESS')) return 'success';

  if (upper.includes('PROTOCOL')
   || upper.includes('RECOVERED')) return 'info';

  return 'normal';
}

// ─── Main ──────────────────────────────────────────────────────────────────
export function SystemLog({ state }) {
  const log = state.log ?? [];
  const contentRef = useRef(null);
  const prevLengthRef = useRef(log.length);
  const [newestKey, setNewestKey] = useState(0);

  // Bump key when new entry arrives → triggers typewriter for ZERO messages
  useEffect(() => {
    if (log.length > prevLengthRef.current) {
      setNewestKey(k => k + 1);
    }
    prevLengthRef.current = log.length;
  }, [log.length]);

  // Auto-scroll to top on new entry
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [log.length]);

  // Status badge
  const busted = (state.bustedLockout ?? 0) > 0;
  const raid = state.raidActive;
  const scanning = state.systemScan?.active;

  let statusLabel, statusColor;
  if (busted) {
    statusLabel = `BUSTED ${state.bustedLockout}s`;
    statusColor = COLORS.red;
  } else if (raid) {
    statusLabel = `RAID ${state.raidTimer}s`;
    statusColor = COLORS.red;
  } else if (scanning) {
    statusLabel = `SCAN ${state.systemScan.timer}s`;
    statusColor = COLORS.orange;
  } else if (state.layLowActive) {
    statusLabel = `LAY_LOW ${state.layLowTimer}s`;
    statusColor = COLORS.green;
  } else {
    statusLabel = 'SYSTEM_STABLE';
    statusColor = COLORS.green;
  }

  // Panel border color = last event tier
  const accentColor = getLogTierColor(state.lastLogTier);

  return (
    <Panel
      accent={accentColor}
      title="SYSTEM_LOG"
      right={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tag color={COLORS.amberDim}>{log.length} ENTRIES</Tag>
          <Tag color={statusColor}>{statusLabel}</Tag>
        </div>
      }
      style={{ flex: 1, minHeight: 220, display: 'flex', flexDirection: 'column' }}
    >
      <div
        ref={contentRef}
        style={{
          overflowY: 'auto',
          flex: 1,
          minHeight: 180,
          maxHeight: 320,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.55,
          paddingRight: 4,
          maskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
        }}
      >
        {log.length === 0 ? (
          <div style={{
            color: COLORS.amberDim,
            fontStyle: 'italic',
            fontSize: 11,
            padding: '8px 0',
          }}>
            &gt; awaiting_input...
          </div>
        ) : (
          log.slice(0, 40).map((entry, i) => (
            <LogEntry
              key={i === 0 ? `new-${newestKey}` : i}
              entry={entry}
              index={i}
              isNewest={i === 0}
            />
          ))
        )}
      </div>
    </Panel>
  );
}

// ─── Log entry — handles 3 visual tiers ───────────────────────────────────
function LogEntry({ entry, index, isNewest }) {
  const text = typeof entry === 'string' ? entry : (entry?.text ?? '');
  const tier = detectTier(entry);

  // Age-based fade
  const opacity = tier === 'fail'
    ? Math.max(0.3, 0.75 - index * 0.04)
    : Math.max(0.35, 1 - index * 0.04);

  if (tier === 'zero' && isNewest) {
    return <ZeroEntry text={text} />;
  }

  if (tier === 'zero') {
    return (
      <div style={{
        color: COLORS.zeroMessage,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: 1.55,
        opacity: Math.max(0.5, 1 - index * 0.035),
        textShadow: `0 0 6px ${COLORS.zeroMessage}33`,
        padding: '1px 0',
      }}>
        {text}
      </div>
    );
  }

  const color = tier === 'fail' ? COLORS.red
            : tier === 'warning' ? COLORS.orange
            : tier === 'success' ? COLORS.green
            : tier === 'info' ? COLORS.cyan
            : COLORS.amber;

  return (
    <div
      className={isNewest ? 'snap-in' : ''}
      style={{
        color,
        fontSize: 11,
        opacity,
        padding: '1px 0',
        letterSpacing: '0.02em',
      }}
    >
      {text}
    </div>
  );
}

// ─── ZERO entry with typewriter reveal ────────────────────────────────────
function ZeroEntry({ text }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, 22);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <div style={{
      color: COLORS.zeroMessage,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.02em',
      lineHeight: 1.55,
      padding: '2px 0',
      textShadow: `0 0 8px ${COLORS.zeroMessage}55`,
      display: 'flex',
      gap: 4,
      alignItems: 'baseline',
    }}>
      <span
        className="blink"
        style={{
          color: COLORS.zeroMessage,
          fontWeight: 700,
        }}
      >
        ▌
      </span>
      <span>
        {displayed}
        {!done && <span style={{ opacity: 0.5 }}>_</span>}
      </span>
    </div>
  );
}