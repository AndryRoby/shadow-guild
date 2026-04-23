// SETTINGS tab: audio, save/load, hard reset, achievements.

import { useState, useRef, useEffect } from 'react';
import {
  Volume2, Download, Upload, AlertTriangle,
  Award, RefreshCw,
} from 'lucide-react';

import { Panel, Tag, BBtn, fmt, COLORS } from '../design/primitives.jsx';
import {
  ACHIEVEMENT_DEFS,
  exportSave, importSave, SAVE_KEY,
} from '../gameLogic.js';
import { audioManager } from '../audio/AudioManager.js';

export function SettingsTab({ state, dispatch }) {
  const [audioVolume, setAudioVolume] = useState(audioManager.masterVolume ?? 0.4);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState('');
  const [exportString, setExportString] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);
  const exportRef = useRef(null);

  const unlockedCount = Object.keys(state.achievements ?? {}).length;
  const totalCount = ACHIEVEMENT_DEFS.length;

  const onExport = () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    setExportString(exportSave(state));
    setTimeout(() => exportRef.current?.select(), 50);
  };

  const onImport = () => {
    const parsed = importSave(importInput.trim());
    if (!parsed) { setImportError('INVALID SAVE DATA'); return; }
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    audioManager.dataLoad();
    dispatch({ type: 'LOAD_SAVE', payload: parsed, ts });
    setImportInput('');
    setImportError('');
    setExportString('');
  };

  const onHardReset = () => {
    audioManager.hardReset();
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('sg_booted');
    localStorage.removeItem('sg_intro');
    localStorage.removeItem('sg_first_done');
    localStorage.setItem('sg_reset_tab', 'OPERATIONS');
    dispatch({ type: 'HARD_RESET' });
    window.location.reload();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: 14,
      height: '100%',
      overflowY: 'auto',
      paddingRight: 4,
    }}>
      {/* ─── HEADER ────────────────────────────────── */}
      <div style={{
        paddingBottom: 10, borderBottom: `1px solid ${COLORS.amberLine}`,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.amber, letterSpacing: '0.15em' }}>
          SYSTEM_SETTINGS
        </div>
        <div style={{ fontSize: 10, color: COLORS.amberDim, marginTop: 3, letterSpacing: '0.1em' }}>
          Audio · Save/Load · Achievements
        </div>
      </div>

      {/* ─── AUDIO ─────────────────────────────────── */}
      <Panel accent={COLORS.cyan} title="AUDIO" dense>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.15em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Volume2 size={11} />
            MASTER_VOLUME
          </span>
          <span style={{ fontSize: 11, color: COLORS.cyan, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(audioVolume * 100)}%
          </span>
        </div>
        <input
          type="range" min="0" max="1" step="0.05"
          value={audioVolume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setAudioVolume(v);
            audioManager.setVolume(v);
          }}
          style={{ width: '100%', accentColor: COLORS.cyan }}
        />
        <BBtn
          size="sm"
          variant="cyan"
          onClick={() => { audioManager.init(); audioManager.siphonSuccess(); }}
          style={{ marginTop: 8 }}
        >
          ◉ TEST SOUND
        </BBtn>
      </Panel>

      {/* ─── ACHIEVEMENTS ──────────────────────────── */}
      <Panel
        accent={COLORS.gold}
        title="ACHIEVEMENTS"
        dense
        right={<Tag color={COLORS.gold}>{unlockedCount}/{totalCount}</Tag>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ACHIEVEMENT_DEFS.map(def => {
            const unlocked = !!((state.achievements ?? {})[def.id]);
            return (
              <div key={def.id} style={{
                padding: '8px 10px',
                borderLeft: `2px solid ${unlocked ? COLORS.green : COLORS.amberFaint}`,
                background: unlocked ? `${COLORS.green}08` : 'transparent',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'center',
              }}>
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 700,
                    color: unlocked ? COLORS.green : COLORS.amber,
                    letterSpacing: '0.05em',
                  }}>
                    <Award size={11} />
                    {def.id}
                  </div>
                  <div style={{ fontSize: 9, color: COLORS.amberDim, marginTop: 2, fontStyle: 'italic' }}>
                    {def.desc}
                  </div>
                </div>
                <div style={{
                  fontSize: 10,
                  color: unlocked ? COLORS.green : COLORS.amberDim,
                  letterSpacing: '0.15em', fontWeight: 700,
                }}>
                  {unlocked ? '◆ UNLOCKED' : (def.reward.rep ? `+${def.reward.rep} REP` : `+${def.reward.gold} CR`)}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ─── SAVE / LOAD ───────────────────────────── */}
      <Panel accent={COLORS.amber} title="SAVE_SYSTEM" dense>
        {/* Export */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.15em',
            marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Download size={11} />
            EXPORT_SAVE
          </div>
          <BBtn size="sm" onClick={onExport}>
            GENERATE EXPORT STRING
          </BBtn>
          {exportString && (
            <>
              <textarea
                ref={exportRef}
                readOnly
                value={exportString}
                style={{
                  width: '100%',
                  height: 80,
                  marginTop: 6,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.amberLine}`,
                  color: COLORS.amber,
                  fontFamily: 'inherit',
                  fontSize: 10,
                  padding: 8,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <BBtn size="sm" onClick={() => exportRef.current?.select()} style={{ marginTop: 4 }}>
                SELECT ALL
              </BBtn>
            </>
          )}
        </div>

        {/* Import */}
        <div>
          <div style={{
            fontSize: 10, color: COLORS.amberDim, letterSpacing: '0.15em',
            marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Upload size={11} />
            IMPORT_SAVE
          </div>
          <textarea
            value={importInput}
            onChange={e => { setImportInput(e.target.value); setImportError(''); }}
            placeholder="Paste save string here..."
            style={{
              width: '100%',
              height: 80,
              background: COLORS.bg,
              border: `1px solid ${COLORS.amberLine}`,
              color: COLORS.amber,
              fontFamily: 'inherit',
              fontSize: 10,
              padding: 8,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 6,
            }}
          />
          {importError && (
            <div style={{ fontSize: 10, color: COLORS.red, marginBottom: 6, letterSpacing: '0.15em' }}>
              [!] {importError}
            </div>
          )}
          <BBtn size="sm" onClick={onImport} disabled={!importInput.trim()}>
            LOAD SAVE
          </BBtn>
        </div>
      </Panel>

      {/* ─── HARD RESET ────────────────────────────── */}
      <Panel accent={COLORS.red} title="DANGER_ZONE" dense>
        <div style={{
          fontSize: 10, color: COLORS.red, letterSpacing: '0.15em',
          marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <AlertTriangle size={11} />
          HARD_RESET
        </div>
        <div style={{ fontSize: 9, color: COLORS.amberDim, marginBottom: 10, lineHeight: 1.5 }}>
          Wipes all progress including prestige, achievements, and saves.<br/>
          <span style={{ color: COLORS.red, fontWeight: 700 }}>CANNOT BE UNDONE.</span>
        </div>

        {!resetConfirm ? (
          <BBtn size="sm" variant="danger" onClick={() => setResetConfirm(true)}>
            <RefreshCw size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            INITIATE RESET
          </BBtn>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <BBtn size="sm" variant="danger" full onClick={onHardReset}>
              CONFIRM WIPE
            </BBtn>
            <BBtn size="sm" variant="ghost" full onClick={() => {
              audioManager.abort();
              setResetConfirm(false);
            }}>
              CANCEL
            </BBtn>
          </div>
        )}
      </Panel>
    </div>
  );
}