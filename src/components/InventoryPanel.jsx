// Right sidebar: inventory with rarity borders, flavor text, HOT countdown.

import { useState, useMemo } from 'react';
import { Cpu } from 'lucide-react';

import { Panel, Tag, DataBar, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import { ITEM_FLAVOR } from '../gameLogic.js';

// Rarity color based on item gold value (matches old system)
function getRarityColor(item) {
  const gold = item.gold;
  const isQuantum = item.isQuantum || item.id.includes('QUANTUM_');

  if (isQuantum || gold >= 500) return COLORS.gold;
  if (gold >= 200)             return COLORS.gold;
  if (gold >= 100)             return COLORS.purple;
  if (gold >= 50)              return COLORS.cyan;
  if (gold >= 20)              return COLORS.cyan;
  return COLORS.amber;
}

// Strip prefix (MILITARY_, QUANTUM_, CORRUPTED_) to get base item ID for flavor lookup
function getBaseItemId(id) {
  return id.replace(/^(MILITARY|QUANTUM|CORRUPTED)_/, '');
}

function getRarityLabel(gold, isQuantum) {
  if (isQuantum || gold >= 500) return 'LEGENDARY';
  if (gold >= 200)              return 'EPIC';
  if (gold >= 100)              return 'RARE';
  if (gold >= 50)               return 'UNCOMMON';
  return 'COMMON';
}

export function InventoryPanel({ state, dispatchWithSound }) {
  const [sort, setSort] = useState('TIME');

  const maxInventory = 12 + (state.upgrades?.voidDrive ?? 0) * 2;
  const inventory = state.inventory ?? [];

  const sorted = useMemo(() => {
    const arr = [...inventory];
    if (sort === 'VALUE') {
      arr.sort((a, b) => b.gold - a.gold);
    } else if (sort === 'COLD') {
      arr.sort((a, b) => {
        if (a.isHot !== b.isHot) return a.isHot ? 1 : -1;
        return a.cooldownRemaining - b.cooldownRemaining;
      });
    } else {
      // TIME: hot first, shortest cooldown first
      arr.sort((a, b) => {
        if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
        return a.cooldownRemaining - b.cooldownRemaining;
      });
    }
    return arr;
  }, [inventory, sort]);

  const coldItems = inventory.filter(i => !i.isHot);
  const coldValue = coldItems.reduce((s, i) => s + i.gold, 0);

  const SORT_MODES = ['TIME', 'VALUE', 'COLD'];

  return (
    <div style={{
      width: 320, minWidth: 320,
      background: COLORS.bg,
      borderLeft: `1px solid ${COLORS.amberLine}`,
      height: '100%',
      overflowY: 'auto',
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxSizing: 'border-box',
    }}>
      {/* ─── HEADER ───────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.amber, letterSpacing: '0.2em' }}>
            :: INVENTORY
          </div>
          <span style={{
            fontSize: 10,
            color: inventory.length >= maxInventory ? COLORS.red : COLORS.amberDim,
            letterSpacing: '0.15em',
            fontWeight: inventory.length >= maxInventory ? 700 : 400,
          }} className={inventory.length >= maxInventory ? 'blink' : ''}>
            {inventory.length}/{maxInventory}
          </span>
        </div>

        {/* Sort toggle */}
        {inventory.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {SORT_MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setSort(mode)}
                style={{
                  flex: 1,
                  background: sort === mode ? COLORS.amber : 'transparent',
                  color: sort === mode ? '#000' : COLORS.amberDim,
                  border: `1px solid ${sort === mode ? COLORS.amber : COLORS.amberLine}`,
                  padding: '4px 0',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantum core alert */}
      {inventory.some(i => i.isQuantum) && (
        <div style={{
          padding: 8,
          border: `1px solid ${COLORS.gold}`,
          color: COLORS.gold,
          fontSize: 10,
          letterSpacing: '0.2em',
          textAlign: 'center',
          fontWeight: 700,
          background: `${COLORS.gold}0d`,
          animation: 'pulseHeatNew 1.2s ease-in-out infinite',
        }}>
          :: QUANTUM CORE DETECTED ::
        </div>
      )}

      {/* ─── ITEMS ────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', gap: 6,
        overflowY: 'auto',
        minHeight: 0,
      }}>
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          sorted.map(item => (
            <InvRow
              key={item.instanceId}
              item={item}
              onSell={() => dispatchWithSound({ type: 'SELL_ITEM', instanceId: item.instanceId })}
            />
          ))
        )}
      </div>

      {/* ─── SELL ALL ─────────────────────────────────── */}
      {coldItems.length > 0 && (
        <BBtn
          full
          variant="success"
          onClick={() => dispatchWithSound({ type: 'SELL_COOLED_ITEMS' })}
        >
          ▲ EXTRACT_COOLED ({fmt(coldValue)} CR)
        </BBtn>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      color: COLORS.amberDim,
      textAlign: 'center',
      gap: 14,
      padding: 20,
    }}>
      <pre style={{ fontSize: 10, opacity: 0.35, lineHeight: 1.2, fontFamily: 'inherit', margin: 0 }}>
{String.raw`
  ┌──────────┐
  │  ░░░░░░  │
  │  ░ ○░ ░  │
  │  ░░░░░░  │
  └──────────┘
`}
      </pre>
      <div style={{ fontSize: 10, letterSpacing: '0.25em' }}>:: AWAITING_EXTRACTION ::</div>
      <div style={{ fontSize: 9, opacity: 0.5, letterSpacing: '0.15em' }}>
        Begin siphoning to acquire data.
      </div>
    </div>
  );
}

function InvRow({ item, onSell }) {
  const [hover, setHover] = useState(false);

  const rarityColor = getRarityColor(item);
  const baseItemId = getBaseItemId(item.id);
  const flavor = ITEM_FLAVOR[baseItemId];
  const isLegendary = rarityColor === COLORS.gold;
  const rarityLabel = getRarityLabel(item.gold, item.isQuantum);

  const coolPct = item.isHot && item.cooldown
    ? Math.max(0, Math.min(100, (1 - item.cooldownRemaining / item.cooldown) * 100))
    : 100;

  const hasMilitary = item.id.includes('MILITARY_');
  const hasQuantum = item.id.includes('QUANTUM_');
  const hasCorrupted = item.id.includes('CORRUPTED_');

  // Legendary scanline overlay
  const legendaryBg = isLegendary
    ? `repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,215,0,0.08) 2px 3px)`
    : 'none';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={!item.isHot ? onSell : undefined}
      className="snap-in"
      style={{
        padding: '8px 10px',
        paddingBottom: item.isHot ? 6 : 10,
        borderLeft: `3px solid ${rarityColor}`,
        background: hover && !item.isHot ? COLORS.surfaceHigh : COLORS.surface,
        backgroundImage: legendaryBg,
        cursor: item.isHot ? 'not-allowed' : 'pointer',
        position: 'relative',
        boxShadow: item.isHot ? `inset 0 0 0 1px ${COLORS.red}44` : 'none',
        transition: 'background 100ms',
        opacity: item.isHot ? 0.85 : 1,
      }}
    >
      {/* Row: name + cpu icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Item ID + prefix badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: rarityColor,
              letterSpacing: '0.03em',
              textShadow: isLegendary ? `0 0 8px ${COLORS.gold}66` : 'none',
            }}>
              {item.id}
            </span>
            {hasMilitary && (
              <span style={{ fontSize: 8, padding: '1px 4px', color: COLORS.green, border: `1px solid ${COLORS.green}`, fontWeight: 700, letterSpacing: '0.1em' }}>MIL</span>
            )}
            {hasQuantum && (
              <span style={{ fontSize: 8, padding: '1px 4px', color: COLORS.gold, border: `1px solid ${COLORS.gold}`, fontWeight: 700, letterSpacing: '0.1em' }}>QNT</span>
            )}
            {hasCorrupted && (
              <span style={{ fontSize: 8, padding: '1px 4px', color: COLORS.red, border: `1px solid ${COLORS.red}`, fontWeight: 700, letterSpacing: '0.1em' }}>CRPT</span>
            )}
          </div>

          {/* Flavor text */}
          {flavor && (
            <div style={{
              fontSize: 9, color: COLORS.amberDim, fontStyle: 'italic',
              marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              opacity: 0.6,
            }}>
              "{flavor}"
            </div>
          )}
        </div>

        <Cpu
          size={11}
          color={item.isHot ? COLORS.orange : COLORS.green}
          style={{ flexShrink: 0, marginTop: 2 }}
        />
      </div>

      {/* Row: value + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontSize: 14, fontWeight: 800,
            color: COLORS.amber,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {item.gold}
          </span>
          <span style={{ fontSize: 9, color: COLORS.amberDim, letterSpacing: '0.15em' }}>CR</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 8,
            color: rarityColor,
            letterSpacing: '0.2em',
            fontWeight: 700,
          }}>
            {rarityLabel}
          </span>

          {item.isHot ? (
            <span style={{
              fontSize: 8, color: COLORS.red,
              letterSpacing: '0.15em', fontWeight: 800,
              textShadow: `0 0 6px ${COLORS.red}`,
            }} className="blink">
              ● HOT {Math.ceil(item.cooldownRemaining)}s
            </span>
          ) : hover ? (
            <span style={{
              fontSize: 8, color: COLORS.green,
              letterSpacing: '0.15em', fontWeight: 800,
              border: `1px solid ${COLORS.green}`,
              padding: '0 4px',
            }}>
              [SELL]
            </span>
          ) : (
            <span style={{
              fontSize: 8, color: COLORS.green,
              letterSpacing: '0.2em', fontWeight: 700,
            }}>
              ◆ READY
            </span>
          )}
        </div>
      </div>

      {/* HOT countdown bar */}
      {item.isHot && (
        <div style={{ marginTop: 6, marginLeft: -10, marginRight: -10, marginBottom: -6 }}>
          <DataBar
            value={coolPct}
            max={100}
            gradient="heat"
            height={2}
          />
        </div>
      )}
    </div>
  );
}