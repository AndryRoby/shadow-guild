# SHADOW_GUILD — GAME DESIGN DOCUMENT v1.1
> Tento dokument je KONTEXT pre každý AI prompt. Vždy ho vlož na začiatok chatu.

---

## 1. VISION

Idle cyberpunk heist RPG s terminál estetikou. Hráč začína ako osamelý data thief a buduje podsvetný shadow guild. Hra beží pasívne — hráč sa môže vrátiť po hodinách a nájde nahromadené zdroje. Core fantasy: byť géniom podsvetia ktorý riadi celé impérium z tieňa.

**Platformy:** Web (Vercel, zadarmo), neskôr Steam (Electron) a Mobile (Capacitor)
**Stack:** React + Vite + Tailwind, gameLogic.js (pure functions), localStorage save
**Monetizácia:** Steam $4.99 jednorazovo + Mobile freemium s IAP

---

## 2. DESIGN SYSTEM (VŽDY POUŽIŤ)

```
background:         #111319
surface_low:        #191b22
surface_high:       #282a30
primary_amber:      #ffc174
primary_amber_dark: #f59e0b
text_muted:         #ffc17488
font:               JetBrains Mono (Google Fonts)
language:           ENGLISH ONLY
border_radius:      0px (NIKDY zaoblené rohy)
gradients:          ZAKÁZANÉ
divider_lines:      ZAKÁZANÉ
progress_bar_h:     2px
text_align:         left (VŽDY)
labels:             ALL-CAPS, letter-spacing: 0.1rem
```

---

## 3. CURRENCIES

| Mena | Symbol | Popis |
|------|--------|-------|
| Credits | CR | Primárna mena |
| Reputation | REP | Druhá mena, unlock pokročilých operácií |
| Heat | % | Globálny trace meter (0–100), nie je mena |

---

## 4. PLAYER STATE

```json
{
  "gold": 0,
  "reputation": 0,
  "heat": 0,
  "stamina": 100,
  "maxStamina": 100,
  "level": 1,
  "xp": 0,
  "prestige": 0,
  "prestigeMultiplier": 1.0,
  "thieves": [],
  "upgrades": {},
  "inventory": [],
  "log": [],
  "lastTickTime": 0,
  "offlineAccrualCap": 14400,
  "layLowActive": false,
  "layLowTimer": 0,
  "layLowCooldown": 0,
  "bustedLockout": 0
}
```

---

## 5. LEVELING SYSTEM

**XP vzorec:** `xpRequired(level) = Math.floor(100 * Math.pow(2.2, level - 1))`

| Level | XP potrebné | Celkové XP | Unlock |
|-------|-------------|------------|--------|
| 1→2 | 100 | 100 | BREACH mechanic |
| 2→3 | 220 | 320 | Hire first Runner |
| 3→4 | 484 | 804 | Dark Market access |
| 4→5 | 1,065 | 1,869 | District: CORP_ZONE |
| 5→6 | 2,343 | 4,212 | DEEP_SIPHON |
| 6→7 | 5,154 | 9,366 | Hire INFILTRATOR |
| 7→8 | 11,340 | 20,706 | District: APEX_CITADEL |
| 8→9 | 24,948 | 45,654 | MAINFRAME_HACK |
| 9→10 | 54,885 | 100,539 | PRESTIGE available |

### XP za akcie
| Akcia | XP |
|-------|----|
| Siphon success | 8–180 (podľa loot tier) |
| Breach success | 60–250 |
| Sell 1 item | 5 |
| Runner cycle | 10 |

---

## 6. LOOT TABLE

### Standard Loot (SIPHON)
| Item | Credits | REP | XP | Váha | Cooldown |
|------|---------|-----|----|------|----------|
| DATA_CHIP | 5 CR | 0 | 8 | 40% | 180s |
| CREDIT_CHIP | 12 CR | 0 | 15 | 28% | 180s |
| ACCESS_CARD | 28 CR | 5 | 25 | 16% | 300s |
| ENCRYPTED_DRIVE | 50 CR | 10 | 40 | 10% | 300s |
| BIOMETRIC_KEY | 95 CR | 20 | 70 | 4% | 600s |
| CORP_BADGE | 180 CR | 35 | 110 | 1.5% | 900s |
| NEURAL_TOKEN | 350 CR | 60 | 180 | 0.5% | 1800s |

### Premium Loot (BREACH)
| Item | Credits | XP | Váha | Cooldown |
|------|---------|-----|------|----------|
| SECURE_TERMINAL | 80 CR | 60 | 40% | 300s |
| CLASSIFIED_DOSSIER | 150 CR | 100 | 35% | 480s |
| CORPORATE_BLUEPRINT | 280 CR | 160 | 15% | 600s |
| EXECUTIVE_KEYCARD | 500 CR | 250 | 10% | 900s |

### Vault Loot (MAINFRAME_HACK)
| Item | Credits | XP | Váha | Cooldown |
|------|---------|-----|------|----------|
| CRYPTO_WALLET | 400 CR | 200 | 40% | 900s |
| CORP_RESERVE | 800 CR | 350 | 35% | 1800s |
| MASTER_ACCESS_CODE | 1500 CR | 600 | 25% | 3600s |

**Hot/Cold systém:**
- `isHot: true` = nedá sa predať u normálnych fencerov
- Po cooldown: `isHot: false` = predaj za plnú cenu
- Dark Market: predaj HOT itemov za 60% hodnoty (cooldown 2h)

---

## 7. CORE ACTIONS

### SIPHON
```
Stamina cost:  10
Heat:          +5 úspech, +10 neúspech
Base rate:     70%
Level bonus:   +3% per level (max 95%)
Success:       getRandomLoot('standard') + xp
Fail:          log warning, heat penalty
```

### BREACH (unlock level 2)
```
Stamina cost:  25
Heat:          +15 úspech, +20 neúspech
Base rate:     55%
Level bonus:   +4% per level
Loot:          Premium tier only
XP:            2x normálny
```

### DEEP_SIPHON (unlock level 5)
```
Stamina cost:  15
Heat:          +8 úspech, +12 neúspech
Base rate:     65%
```

### MAINFRAME_HACK (unlock level 8)
```
Stamina cost:  40
Heat:          +25 úspech, +35 neúspech
Base rate:     35%
Loot:          Vault tier only
```

### LAY LOW
```
Efekt:         Stamina regen 2/s → 4/s, Heat -2/s
Trvanie:       30s
Blokuje:       Siphon, Breach
Cooldown:      60s po skončení
```

### DARK MARKET (unlock level 4 + 50 REP)
```
Predá:         Všetky items (hot aj cold) za 60% hodnoty
Cooldown:      7200s (2 hodiny) — REENGAGEMENT CLOCK
```

---

## 8. HEAT SYSTEM

| Heat | Status | Efekt |
|------|--------|-------|
| 0–30 | CLEAR | Normálne operácie |
| 31–60 | WATCHED | -10% success rate |
| 61–80 | HOT | -25% success rate |
| 81–99 | CRITICAL | -40% success rate |
| 100 | BUSTED | Stratíš inventory, 10s lockout, heat → 0 |

**Success rate vzorec:** `baseRate + (level * 0.03) - heatPenalty`

---

## 9. UPGRADE SHOP

**Cena vzorec:** `Math.floor(baseCost * Math.pow(1.15, currentLevel))`

### OPERATIVE upgrades
| Upgrade | Base Cost | Efekt per Level | Max |
|---------|-----------|-----------------|-----|
| GHOST_PROTOCOL | 50 CR | Siphon success +2% | 10 |
| NEURAL_BOOST | 80 CR | Stamina max +10 | 15 |
| SIGNAL_DAMPENER | 120 CR | Heat generation -10% | 8 |
| STIM_PACK | 200 CR | Stamina regen +0.5/s | 10 |
| ICE_BREAKER | 350 CR | Bust penalty -1s | 5 |
| DARK_CHANNEL | 200 CR | Item cooldown -30s | 8 |
| TRACE_ERASER | 150 CR | Heat decay +0.5/5s | 6 |

### INTEL upgrades (REP cost)
| Upgrade | REP Cost | Efekt |
|---------|----------|-------|
| NET_SCANNER | 25 REP | Vidíš heat level vopred |
| CORP_MOLE | 50 REP | Heat decay 2x rýchlejší |
| DEEP_SOURCE | 100 REP | +10% loot hodnota |
| DARK_EXCHANGE | 200 REP | Dark Market cooldown -30min |

---

## 10. HIRED RUNNERS (Passive Income)

**Cena každého ďalšieho:** `hireCost * Math.pow(1.3, count)`
**Max per tier:** 5
**Max stored cycles:** 5 (reengagement clock)

| Tier | Hire Cost | Credits/cycle | Cycle | Heat/cycle | Unlock |
|------|-----------|---------------|-------|------------|--------|
| STREET_RUNNER | 300 CR | 2 | 60s | +1 | Level 3 |
| DATA_THIEF | 800 CR | 8 | 300s | +2 | Level 5 |
| INFILTRATOR | 2,500 CR | 35 | 900s | +3 | Level 7 |
| FIXER | 8,000 CR | 150 | 3600s | +1 | Level 9 |
| SHADOW_BROKER | 25,000 CR | 600 | 7200s | 0 | Prestige |

---

## 11. DISTRICTS

| District | Unlock | Loot Multiplier | Heat Decay |
|----------|--------|-----------------|------------|
| NEON_STRIP | Start | 1x | 1/5s |
| CORP_ZONE | Level 5 | 1.5x | 0.8/5s |
| APEX_CITADEL | Level 8 | 2.5x | 0.5/5s |
| DARK_NET | Prestige | Special | 2/5s |

---

## 12. MISSIONS SYSTÉM (Fáza 2)

| Misia | Trvanie | Runners | Reward | Fail chance |
|-------|---------|---------|--------|-------------|
| DATA_RUN | 10 min | 1 | 50–150 CR | 20% |
| SERVER_BREACH | 1 hod | 2 | 300–600 CR | 35% |
| CORP_HQ_INFILTRATION | 4 hod | 3 | 1,000–2,500 CR | 50% |
| MAINFRAME_HEIST | 12 hod | 5 | 5,000–12,000 CR | 65% |

---

## 13. PRESTIGE SYSTÉM

**Unlock:** Level 10 + 100,000 CR zarobených celkovo

**Resetuje:** Credits, Level, XP, Inventory, Operative upgrades, Hired runners (nie SHADOW_BROKER)
**Ostane:** Prestige level, REP, Intel upgrades, unlocked Districts

**Prestige multiplikátor:** `1 + (prestige * 0.25)`

| Prestige | Bonus |
|----------|-------|
| 1 | Credit income +25% |
| 2 | Stamina max +25, regen +1/s |
| 3 | Loot cooldown -20% |
| 4 | Dark Market cooldown -1h |
| 5 | Runner hire cap +2 per type |
| 6+ | Credit income +15% per prestige |

---

## 14. REENGAGEMENT CLOCKS

| Clock | Interval | Cap | Hráč typ |
|-------|----------|-----|----------|
| Stamina full | ~50s | Never | Aktívny |
| STREET_RUNNER | 60s | 5min | Tab hráč |
| DATA_THIEF | 300s | 25min | Každých 5 min |
| INFILTRATOR | 900s | 75min | Každých 15 min |
| Dark Market | 7200s | 7200s | Každé 2 hodiny |
| FIXER | 3600s | 18000s | Každú hodinu |
| SHADOW_BROKER | 7200s | 36000s | Každé 2 hodiny |

---

## 15. OFFLINE PROGRESS

```js
const offlineSeconds = Math.min((now - lastTickTime) / 1000, 14400); // cap 4h
const offlineCredits = calculatePassiveIncome(state) * offlineSeconds * 0.6; // 60% efektívnosť
```

- Runners generujú credits offline (do capu)
- Missions pokračujú offline
- Stamina sa NEregeneruje offline
- Heat decay prebieha offline

---

## 16. BALANCING NUMBERS

### Credits per Hour
| Situácia | CR/hod |
|----------|--------|
| Aktívny level 1 | ~180 |
| Aktívny level 5 | ~850 |
| S 3 Infiltrators level 5 | ~1,400 |
| Post-prestige level 5 | ~2,100 |

### Progression Walls
| Wall | Level | Čo treba | Riešenie |
|------|-------|----------|----------|
| 1 | Level 3 | 320 XP + 300 CR | Hire Street Runner |
| 2 | Level 5 | 1,869 XP + 2,500 CR | Hire Infiltrator |
| 3 | Level 7 | 9,366 XP + 8,000 CR | Dark Market |
| 4 | Level 10 | 100k earned | Prestige |

---

## 17. SAVE SYSTEM

```js
const SAVE_KEY = 'shadow_guild_save_v1';
// Auto-save každých 30s
localStorage.setItem(SAVE_KEY, JSON.stringify(state));
// Load pri štarte
const saved = localStorage.getItem(SAVE_KEY);
if (saved) dispatch({ type: 'LOAD_SAVE', payload: JSON.parse(saved) });
```

---

## 18. TECHNICAL RULES (čítaj každú session)

1. Všetka game logika v `gameLogic.js` ako pure functions — ZERO React imports
2. Všetok state v `useReducer` v `App.jsx` — nikdy `useState` pre game state
3. Game tick: `1000ms setInterval` v `useEffect` s cleanup funkciou
4. Exponenciálne náklady: `Math.floor(baseCost * Math.pow(1.15, level))`
5. XP per level: `Math.floor(100 * Math.pow(2.2, level - 1))`
6. Nikdy neukladaj derived values do state — počítaj v renderi
7. Všetky zobrazené čísla: `toLocaleString()`
8. UI vždy v ENGLISH ONLY

---

## 19. MVP BUILD ORDER

**Fáza 1 — Core Loop (Týždeň 1):**
- [x] Siphon + loot + heat
- [x] Stamina regen
- [x] Inventory s cooldown timermi
- [x] Sell cooled items
- [x] LAY LOW mode
- [x] BUSTED mechanic
- [x] Level + XP systém
- [x] BREACH od levelu 2

**Fáza 2 — Progression (Týždeň 2-3):**
- [ ] Upgrade shop (7 upgradov)
- [ ] Hire STREET_RUNNER (pasívny príjem)
- [ ] CORP_ZONE district

**Fáza 3 — Depth (Týždeň 4-5):**
- [ ] Všetky runner tiery
- [ ] Dark Market
- [ ] Všetky districts

**Fáza 4 — Endgame (Mesiac 2):**
- [ ] Prestige systém
- [ ] Missions
- [ ] Steam build (Electron)
- [ ] Mobile (Capacitor)

---

## 20. PROMPT TEMPLATE PRE AI

Keď začínaš nový chat, vždy začni presne takto:

```
I'm building an idle game called Shadow Guild. Here is the complete game design document:

[vlož celý tento súbor]

CRITICAL RULES:
1. ALL output must be in ENGLISH ONLY — UI text, logs, item names, variables, comments.
2. Follow the design system in Section 2 exactly. No gradients, no rounded corners, no exceptions.
3. All game logic goes in gameLogic.js as pure functions (no React imports).
4. All state managed by useReducer in App.jsx only.
5. Do ONLY the specific task I ask. Do not hallucinate features from later phases.

Current phase: Phase 1 — Core Loop
Current task: [konkrétna úloha]
Current code: [vlož relevantné súbory ak existujú]
```

---

*Shadow Guild Game Design Document v1.1 — ARLing s.r.o.*
