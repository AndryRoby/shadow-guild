// ZeroOverlay — full-screen ghost projection for critical ZERO messages.
//
// Triggered when state.zeroLastMessage.level === 'critical' and not yet seen.
// Mounted via portal to document.body so it sits above everything.
//
// Behaviour:
//   - Fade in over 400ms.
//   - Letter-by-letter typewriter at 40ms/char.
//   - Auto-dismiss button enables 1s after typewriter completes.
//   - Click button OR background to dismiss → DISMISS_ZERO_OVERLAY action.
//   - Subtle scanline + chromatic aberration for "implant projection" feel.
//
// Used sparingly — Act transitions, deaths, prestige. ~5-10 per Act, no more.

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { COLORS } from '../design/colors.js';

export function ZeroOverlay({ message, onDismiss }) {
  const [typedText, setTypedText] = useState('');
  const [done, setDone] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const canDismissRef = useRef(false);

  // Typewriter effect — only re-runs when message id changes (not on canDismiss)
  useEffect(() => {
    if (!message) return;
    setTypedText('');
    setDone(false);
    setCanDismiss(false);
    canDismissRef.current = false;
    const text = message.text ?? '';
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
        setTimeout(() => {
          setCanDismiss(true);
          canDismissRef.current = true;
        }, 600);
      }
    }, 35);

    return () => clearInterval(iv);
  }, [message?.id]);

  // Keyboard dismiss — separate effect, reads canDismissRef so it doesn't restart typewriter
  useEffect(() => {
    if (!message) return;
    const onKey = (e) => {
      if (canDismissRef.current && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [message?.id, onDismiss]);

  if (!message) return null;

  return createPortal(
    <div
      onClick={() => canDismiss && onDismiss()}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'zeroOverlayIn 400ms ease-out',
        cursor: canDismiss ? 'pointer' : 'default',
        padding: 40,
      }}
    >
      {/* Scanline overlay for "implant projection" feel */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(34,255,136,0.04) 2px, rgba(34,255,136,0.04) 3px)',
      }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 720,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          fontSize: 10,
          letterSpacing: '0.5em',
          color: COLORS.green,
          marginBottom: 24,
          textShadow: `0 0 10px ${COLORS.green}88`,
          animation: 'zeroOverlayHeader 0.6s ease-out',
        }}>
          :: NEURAL_LINK :: ZERO INCOMING
        </div>

        {/* Message — typewriter */}
        <div style={{
          fontSize: 22,
          lineHeight: 1.5,
          color: COLORS.green,
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '0.02em',
          textShadow: `0 0 12px ${COLORS.green}55, 0 0 20px ${COLORS.green}22`,
          minHeight: 80,
          fontFamily: 'inherit',
        }}>
          <span style={{ color: COLORS.amber, marginRight: 8, fontStyle: 'normal' }}>[zero &gt;&gt;]</span>
          {typedText}
          {!done && (
            <span style={{
              display: 'inline-block',
              width: 9, height: 20,
              background: COLORS.green,
              marginLeft: 4,
              verticalAlign: '-3px',
              animation: 'cursorBlink 0.7s step-end infinite',
              boxShadow: `0 0 6px ${COLORS.green}`,
            }} />
          )}
        </div>

        {/* Dismiss button */}
        <button
          disabled={!canDismiss}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          style={{
            marginTop: 40,
            padding: '12px 32px',
            background: 'transparent',
            border: `1px solid ${canDismiss ? COLORS.green : COLORS.amberDim}`,
            color: canDismiss ? COLORS.green : COLORS.amberDim,
            fontSize: 11,
            letterSpacing: '0.3em',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: canDismiss ? 'pointer' : 'default',
            opacity: canDismiss ? 1 : 0.4,
            transition: 'opacity 200ms, color 200ms',
            textShadow: canDismiss ? `0 0 8px ${COLORS.green}55` : 'none',
          }}
        >
          [ ACKNOWLEDGE ]
        </button>

        {canDismiss && (
          <div style={{
            marginTop: 12,
            fontSize: 8,
            color: COLORS.amberDim,
            letterSpacing: '0.3em',
            opacity: 0.6,
          }}>
            ESC / SPACE / ENTER
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}