// NeuralLink — persistent ZERO communication panel.
//
// Behaviour:
//   - Always shows last ZERO message (no auto-dismiss).
//   - Typewriter animation on new message arrival.
//   - Pulses with glow until player has visually attended (5s timer).
//   - Click to expand history (last 10 messages).
//   - Status indicator: green pulse = uplink active.
//
// Position: top of sidebar (above OperativeIdCard) — sticky but compact.
// Size: collapsed ~70px tall, expanded ~280px (history panel slides down).
//
// Why sticky-not-floating: ZERO is the narrative spine. If it floats,
// players treat it as a transient toast. As a panel, it's part of the HUD.

import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../design/colors.js';

export function NeuralLink({ lastMessage, history }) {
  const [expanded, setExpanded] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isNew, setIsNew] = useState(false);
  const lastIdRef = useRef(null);

  // Typewriter effect on new message
  useEffect(() => {
    if (!lastMessage) {
      setTypedText('');
      return;
    }
    if (lastMessage.id === lastIdRef.current) return;  // same message — skip retype
    lastIdRef.current = lastMessage.id;

    setIsNew(true);
    setTypedText('');
    const text = lastMessage.text;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedText(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 28);  // ms per char

    // Mark "no longer new" after 5s of being visible
    const t = setTimeout(() => setIsNew(false), 5000);

    return () => { clearInterval(iv); clearTimeout(t); };
  }, [lastMessage?.id, lastMessage?.text]);

  // Empty state — uplink inactive
  if (!lastMessage) {
    return (
      <div style={emptyStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SignalDot color={COLORS.amberDim} dim />
          <span style={{ fontSize: 8, letterSpacing: '0.3em', color: COLORS.amberDim }}>
            :: NEURAL_LINK :: STANDBY
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerStyle,
        ...(isNew ? newPulseStyle : {}),
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 4,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SignalDot color={COLORS.green} pulse />
          <span style={{
            fontSize: 8, letterSpacing: '0.3em',
            color: COLORS.green,
            fontWeight: 800,
          }}>
            :: NEURAL_LINK :: ZERO
          </span>
        </span>
        {history && history.length > 1 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={historyBtnStyle}
            title="Show history"
          >
            {expanded ? '▼' : `▶ ${history.length}`}
          </button>
        )}
      </div>

      {/* Last message — typewriter */}
      <div style={{
        fontSize: 11,
        color: COLORS.green,
        lineHeight: 1.45,
        letterSpacing: '0.02em',
        fontStyle: 'italic',
        minHeight: 28,
        textShadow: isNew ? `0 0 6px ${COLORS.green}55` : 'none',
      }}>
        <span style={{ color: COLORS.amber, marginRight: 4, fontStyle: 'normal', fontSize: 9, letterSpacing: '0.1em' }}>
          [zero &gt;&gt;]
        </span>
        {typedText}
        {typedText.length < (lastMessage.text?.length ?? 0) && (
          <span style={{
            display: 'inline-block',
            width: 6, height: 11,
            background: COLORS.green,
            marginLeft: 2,
            animation: 'cursorBlink 0.8s step-end infinite',
            verticalAlign: '-2px',
          }} />
        )}
      </div>

      {/* Expanded history */}
      {expanded && history && history.length > 1 && (
        <div style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px dashed ${COLORS.amberLine}`,
          maxHeight: 200,
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: 8, color: COLORS.amberDim, letterSpacing: '0.25em',
            marginBottom: 6,
          }}>
            :: TRANSMISSION_LOG
          </div>
          {history.slice(-10, -1).reverse().map(m => (
            <div key={m.id} style={{
              fontSize: 10,
              color: COLORS.amberDim,
              lineHeight: 1.4,
              marginBottom: 4,
              fontStyle: 'italic',
              opacity: 0.75,
            }}>
              <span style={{ color: COLORS.green, marginRight: 4, fontStyle: 'normal', fontSize: 8 }}>
                [zero]
              </span>
              {m.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SignalDot({ color, pulse, dim }) {
  return (
    <span style={{
      width: 6, height: 6,
      background: color,
      boxShadow: dim ? 'none' : `0 0 5px ${color}`,
      animation: pulse ? 'signalPulse 1.4s ease-in-out infinite' : undefined,
      flexShrink: 0,
    }} />
  );
}

const containerStyle = {
  padding: '8px 10px',
  background: `${COLORS.green}06`,
  borderLeft: `3px solid ${COLORS.green}`,
  position: 'relative',
};

const newPulseStyle = {
  background: `${COLORS.green}10`,
  boxShadow: `inset 0 0 20px ${COLORS.green}11, 0 0 12px ${COLORS.green}33`,
  animation: 'neuralLinkNew 2.6s ease-out',
};

const emptyStyle = {
  padding: '6px 10px',
  borderLeft: `3px solid ${COLORS.amberLine}`,
  opacity: 0.45,
};

const historyBtnStyle = {
  background: 'transparent',
  border: `1px solid ${COLORS.green}55`,
  color: COLORS.green,
  fontSize: 8,
  padding: '2px 6px',
  fontFamily: 'inherit',
  letterSpacing: '0.15em',
  cursor: 'pointer',
};