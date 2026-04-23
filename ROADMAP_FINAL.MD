# 👁️ SHADOW GUILD — MASTER ROADMAP v5.1
### "The Resistance Blueprint" — Audit Edition

---

## 🎯 Core Vision
Nie si zlodej. Si posledný Awakened v meste kde každý krok monitoruje THE EYE. Každý prestige = nová inkarnácia. Zero = tvoj kontakt. Runners = tvoji bratia.

**Tri piliere:** Taktický hacking · Syndicate management · Matrix narrative

**Tri paradigm shifts:** ~2h Klikač→Manager · ~8h Peniaze→Prežitie · ~20h Beh→Awakening

---

## 📊 LEGENDA

```
[x] = Implementované a funkčné
[/] = Základ existuje, chýba hĺbka/UX
[ ] = Chýba úplne
[!] = Kritické — blokuje stabilitu
[UX] = UI problém zo screenshotov
[R] = Responsive/platform fix
```

---

# ⛔ FÁZA –1: AUDIT — PRAVDIVÝ STAV KÓDU

> Pred akoukoľvek prácou. Toto je reálny stav, nie optimistický odhad.

## Čo je naozaj hotové [x]

| ID | Feature | Dôkaz v kóde |
|----|---------|-------------|
| A.1 | Zero správy (triggery) | `addZero()` v gameLogic.js, 15 trigger bodov |
| A.2 | Passive scan | `systemScan` v `tick()`, countdown, postih |
| A.3 | Bar komponenta | `Bar({ pct, variant, thin })` s ftg/xp/default variantmi |
| A.4 | Heat glitch CSS | `.heat-critical`, `.heat-extreme`, `.heat-danger` animácie |
| A.5 | Combo + crit systém | `applyComboAndCrit()`, 5% crit chance, 10x hodnota |
| A.6 | Prestige logika | `prestige()` fn, reset + keep správne |
| A.7 | Agent generovanie | `generateAgentName()`, `TRAIT_POOL`, stats |
| A.8 | Mission systém | `checkMissions()`, deploy, success/fail, splash |
| A.9 | Node reclaim | SCAN→BREACH→LAST_STAND stages |
| A.10 | Offline progress | `calculateOfflineProgress()`, 60% efficiency |
| A.11 | Daily challenge | 5 typov, 24h reset, reward |
| A.12 | Achievement systém | 5 achievements, feedback overlay |
| A.13 | Overclock protokol | toggle, cooldown, heat leak, decay multiplier |
| A.14 | Dark Market | CD system, mapMods integration |
| A.15 | Encryption keys | 3% drop, 5 unikátnych, decrypt reward |

## Čo je polohotové [/]

| ID | Feature | Čo chýba |
|----|---------|---------|
| B.1 | **Traity agentov** | Priraďujú sa, ale **nula funkcií ich reálne používa** vo výpočtoch |
| B.2 | **Prestige progress vizualizácia** | Len text `{level}/10`, nie Bar komponenta |
| B.3 | **Perk tree** | Zoznam kariet, chýbajú SVG spojnice a dependencies |
| B.4 | **Log scroll** | Funguje, ale nie je izolovaný od page scrollu |
| B.5 | **Agent bonds** | Nie sú v state ani v logike |
| B.6 | **Hover glow** | CSS existuje na `.btn:hover`, nie všade konzistentne |
| B.7 | **Progressive disclosure** | `isUnlocked()` existuje, ale heat bar ešte lockovaný |

## Čo kriticky chýba [!]

| ID | Feature | Riziko |
|----|---------|--------|
| C.1 | **State versioning** | **NAJVYŠŠIA PRIORITA.** Každá zmena FRESH_STATE rozbije staré savy. Žiadne `saveVersion` v kóde. |
| C.2 | **Dashboard rework** | 260px ľavý stĺpec stále v grid. Zbytočný priestor. |
| C.3 | **Trait efekty** | GREEDY/PARANOID/LOYAL sú len text. Žiadny gameplay dopad. |
| C.4 | **Heat bar od Lvl 1** | `isUnlocked(state, 'heat')` vracia `true` vždy — OK. Ale heat bar sa zobrazuje až po podmienke stamina unlock. Treba overiť. |
| C.5 | **Boot sequence** | Žiadny `isBooting` state. Hráč nevidí žiadny intro. |
| C.6 | **Audio systém** | Nula zvukov. Howler.js nie je nainštalovaný. |
| C.7 | **Squad systém** | `state.squads` neexistuje. Jednotliví agenti bez groupingu. |
| C.8 | **Conspiracy Board** | `state.loreFragments` neexistuje. Tab neexistuje. |

---

# 🔴 FÁZA 0: KRITICKÉ FIXY (Týždeň 1-2)

> Žiadne nové features. Stabilita a základná hrateľnosť.

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [x] | F0.1 | **State versioning** | Pridať `saveVersion: 1` do `FRESH_STATE`. V `loadInitialState()`: ak `parsed.saveVersion !== currentVersion` → run migration fn. Migration fn: `{ ...FRESH_STATE, ...parsed, saveVersion: 1 }`. Každá budúca breaking zmena = `saveVersion++` + migration case. |
| [x] | F0.2 | **Heat bar od Lvl 1** | Overiť `isUnlocked(state, 'heat')` → musí vrátiť `true` pri `lvl >= 1`. Ak nie, opraviť. Zero správa pri first busted ostáva ako tutorial. |
| [x] | F0.3 | **Trait efekty — minimálna implementácia** | V `tick()` agent income loop: `const specGoldMult = a.spec === 'GREEDY' ? 1.5 : 1` → nahradiť traitom. `if (a.traits?.includes('GREEDY')) totalAgentIncome += basePayouts[role] * 0.3`. PARANOID: heat gen +0.5/cycle. LOYAL: loyalty decay 0x. Stačí 3 traity pre launch. |
| [x] | F0.4 | **Log scroll fix** | `.system-log-content`: `max-height: 250px`, `overflow-y: auto`, `position: relative`. `useRef(logContentEl)` → `useEffect(() => { el.scrollTop = el.scrollHeight }, [state.log])`. |
| [x] | F0.5 | **Log formát condensed** | `[07:29] ✓ SIPHON · DATA_CHIP · +8XP · HEAT+5`. Batch rovnaká akcia v 3s okne: "✓ SIPHON x5 · +45XP". ZERO správy dostanú iný prefix a farbu. |
| [x] | F0.6 | **Prestige progress bars** | Nahradiť `{state.level}/10` za `<Bar pct={(state.level/10)*100} variant="xp"/>` a `<Bar pct={(runGoldEarned/100000)*100} variant="default"/>`. |
| [x] | F0.7 | **LAY LOW raid bypass** | V `layLow()`: ak `state.raidActive === true`, skip cooldown check. Vždy dovoliť aktiváciu. |
| [x] | F0.8 | **Item flavor text dokončenie** | Overiť že `ITEM_FLAVOR` obsahuje všetky item IDs z STANDARD_LOOT + PREMIUM_LOOT + VAULT_LOOT + DEEP_SIPHON_LOOT. |

**Výstup fázy:** Savy bezpečné. Traity funkčné. Základná hrateľnosť bez frustrácie.

---

# 🟡 FÁZA 1: JUICE & PRVÝ DOJEM (Týždeň 3-5)

> Prvých 15 minút rozhoduje. Aarimous mal pravdu v tomto.

## 1A: Boot Sequence

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [x] | J1.1 | **Cold boot animácia** | `state.isBooting` — ak `true`: render len boot overlay. Sequence: 4 riadky ASCII textu, každý 800ms. `LOADING_KERNEL...` → `DECRYPTING_IDENTITY...` → `ESTABLISHING_SECURE_CHANNEL...` → `[ZERO >>] Welcome, Operative.` → fade in do hry. `useEffect` s `setTimeout(4000)` → `setIsBooting(false)`. Spustí sa len pri `isFirstSession` (localStorage check). |
| [x] | J1.2 | **Zero intro — príbeh nie tutorial** | Po boot sekvencii: Zero napíše 3 vety. "Aether-Biotech owns this city. Every camera. Every transaction. Every breath." Pauza. "You're the only one who sees it." Pauza. "Begin." → SIPHON button sa objaví. Nie tooltip. Nie help text. Príbeh. |
| [x] | J1.3 | **Unlock reveal animácia** | Pri každom `isUnlocked()` prechode: nový element sa objaví s `animation: unlockReveal 0.5s ease`. `@keyframes unlockReveal { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: none; } }`. Pocit: systém sa odomyká, nie len zobrazuje. |

## 1B: Audio

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [x] | J1.4 | **Howler.js setup** | `npm install howler`. `src/audio/AudioManager.js` singleton. `AudioManager.init()` pri prvej user interaction (nie automaticky — browsers blokujú). `AudioManager.play('siphon_success')` atď. Master volume v Settings slider (0-100). Uložiť do localStorage. |
| [x] | J1.5 | **Siphon success sound** | Krátky mechanical "data chunk received" tone. 80ms. Generovateľné cez Web Audio API bez external file. `oscillator.frequency = 880Hz`, `type: 'square'`, fade out 80ms. |
| [x] | J1.6 | **Siphon fail sound** | Static noise burst. 150ms. `AudioContext.createBufferSource` s náhodným noise. |
| [x] | J1.7 | **Busted alarm** | Sirena: 440Hz → 880Hz oscilujúce, loop počas `bustedLockout > 0`. Fade out keď lockout = 0. |
| [x] | J1.8 | **Raid warning** | Pulzujúci low-frequency tone. Spustí sa keď `nextRaidIn < 30`. |
| [x] | J1.9 | **ZERO whisper** | Distorted elektronický hlas. Musí byť audio file (nie generovaný). Použiť royalty-free TTS + distortion filter. |
| [x] | J1.10 | **Ambient loop** | Generovaný: noise + slow LFO filter. Intenzita mapovaná na `state.heat`. Pri heat < 30: sotva počuteľný. Pri heat > 80: výrazný. |

## 1C: Visual Juice

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [x] | J1.11 | **Hover glow konzistentný** | Audit: `btn:hover` má glow, ale niektoré custom buttons nie. Pridať do: `.btn-maintain:hover`, `.proto-btn:hover`, všetky `<button>` elementy v NetworkManager. |
| [x] | J1.12 | **Number pop animácia** | Existuje `overlay-float`. Doladiť: critical hit = zlatá farba + väčší font + dlhšia animácia. Standard = amber. Fail = červená. |
| [x] | J1.13 | **ZERO typewriter** | Existuje `animate-type` ale len na log entry. Zero správy musia mať vlastnú komponentu s letter-by-letter delay (40ms). |
| [x] | J1.14 | **Combo meter intensity** | Combo 5+: bar svieti amber. Combo 10+: bliká + malý shake. Combo 15+: celá sekcia má amber glow border. Combo 20 (max): pulsuje gold + ZERO šepká "Push further." |
| [x] | J1.15 | **Heat pulse na UI** | Heat > 80: `game-header` dostane `box-shadow: 0 0 20px rgba(239,68,68,0.3)`. Intenzita rastie s heatom. Nie iba bar — celý header "dýcha". |

## 1D: Novelty Injection (15-minútové intervaly)

| Stav | ID | Trigger | Akcia |
|------|----|---------|-------|
| [x] | J1.16 | First siphon | ZERO message ✓ |
| [x] | J1.17 | 3. siphon | Combo meter sa prvý raz zobrazí s `unlockReveal` animáciou |
| [x] | J1.18 | Lvl 2 | ZERO + Breach ✓ |
| [x] | J1.19 | First fail (nie busted) | ZERO: "Traced. Heat fades. Try again." — malý reassurance |
| [x] | J1.20 | First busted | ZERO ✓ |
| [x] | J1.21 | Lvl 3 | ZERO + Agency ✓ |
| [x] | J1.22 | First agent hire | Agent card slideIn animácia + ZERO: "You're no longer alone. THE EYE noticed." |
| [x] | J1.23 | First node capture | Mission splash + ZERO: "First node. First step into the network." + mapa reveal animácia |
| [x] | J1.24 | Lvl 6 | ZERO: "The deep channels are yours. Stay quiet." + DEEP_SIPHON reveal |
| [x] | J1.25 | Lvl 8 | ZERO: "The mainframe. Once. Make it count." — tenzívne |
| [x] | J1.26 | Prestige eligibility | Ambient sa zmení. ZERO: "You have enough. Time to see behind the veil." |

**Výstup fázy:** Prvých 30 minút nepustí. Audio + visual reagujú na každú akciu.

---

# 🟡 FÁZA 2: UI ARCHITECTURE (Týždeň 6-7)

> Chirurgické zásahy. Nie celý redesign.

## 2A: Dashboard Rework

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [UX] | L2.1 | **Sticky stat bar** | Nahradiť 260px ľavý stĺpec. Nový element pod `game-header`: `position: sticky, top: headerHeight, height: 48px, width: 100%, z-index: 10`. Obsah: `◈ {gold} CR · ◆ {rep} REP · ▲ LVL {level} · ⚡ {sta}/{maxSta} · 🔥 {heat}%`. Farba heat metriky = `heatColor`. |
| [UX] | L2.2 | **Collapsible detail panel** | Kliknúť na stat bar → slide-down (200px, transition 300ms) s: XP bar, Grid Status (bandwidth), Runner summary, Overclock toggle. State: `statBarExpanded: false`. Klávesová skratka: `Space` keď nie je iný focus. |
| [ ] | L2.3 | **Grid update** | Odstrániť ľavý stĺpec z `game-grid`. Nový grid: `grid-template-columns: 1fr 320px`. Sticky stat bar nad gridom (full width). |

## 2B: Upgrades Reorganizácia

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [UX] | L2.4 | **4 kategórie** | Rozdeliť `UPGRADE_DEFS` do skupín: `COMBAT: ['ghostProtocol', 'iceBreaker', 'signalDampener', 'traceEraser']` / `ECONOMY: ['darkChannel', 'autoFencer', 'aiSubroutine']` / `SURVIVAL: ['neuralBoost', 'stimPack', 'safehouse', 'quantumEncryption', 'proxyServers']` / `NETWORK: ['voidDrive', 'hwOverclock', 'xpBoost', 'runnerStealth']`. Každá kategória: farebný header, collapsible, ikona. |
| [UX] | L2.5 | **Data-primary v upgrade rowoch** | Cena upgradu = najväčší element. Ak `canAfford`: zelená cena. Ak nie: červená. Label (názov upgradu) = medium. Effect text = small muted italic. |

## 2C: Agency Compact

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [UX] | L2.6 | **Compact agent cards** | Default view: 2-column grid. Každá karta max 100px výška. Obsah: `[TRAIT] NAME [STATUS]` · `FTG: [bar]` · `[ACTION BUTTON]`. Klik na kartu → expand modal/sheet s full detailom (stats, XP, bonds, personal quest). |
| [UX] | L2.7 | **Locked zones collapse** | Network tab: locked zóny = 1 riadok `:: Z3 EASTERN_TECH [LOCKED] — Secure 2 more Z2 nodes`. Klik → expand zoznam locked nodov. Default collapsed. |

## 2D: Prestige Tab

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [UX] | L2.8 | **AWAKENING tab** | Nový tab (replaces Settings prestige section). Dostupný od Lvl 8. Obsah: Progress sekcia (dva progress bary), Memory Fragments, Perk Tree, Run History. |
| [ ] | L2.9 | **Prestige progress bars** | "PATH TO AWAKENING" sekcia: `LVL [██████████] 10/10` a `YIELD [████░░░░░░] 67k/100k`. Oba používajú existujúcu `Bar` komponentu. |
| [ ] | L2.10 | **Empty states** | Inventory prázdne → ":: AWAITING EXTRACTION :: Begin siphoning." Agent roster prázdny → ":: NO OPERATIVES :: The city won't liberate itself." S muted ASCII v pozadí. |

## 2E: Information Hierarchy

| Stav | ID | Princíp | Zmena |
|------|----|---------|-------|
| [UX] | L2.11 | **Data > Label** | Stats: veľká hodnota, malý label nad ňou. Napr. namiesto `GOLD: 15,500 CR` → `15,500 CR` (veľké amber) s `GOLD` (tiny muted nad). |
| [UX] | L2.12 | **Visual grouping** | Rovnako dôležité elementy = rovnaký vizuálny weight. Upgrade tiers musia byť odlíšené veľkosťou/farbou podľa importance. |

**Výstup fázy:** Hra vyzerá ako produkt. Layout dáva zmysel na prvý pohľad.

---

# 🔵 FÁZA 3: PARADIGM SHIFT 1 — Syndicate Manager (Týždeň 8-10)

> Shift: hráč prestáva klikať. Začína riadiť ľudí.

## 3A: Squad System

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [ ] | S3.1 | **State pridať** | `FRESH_STATE.squads = []`. Squad objekt: `{ id, name, members: [agentId], stance: 'BALANCED', leaderId }`. Max squady: `1 + Math.floor(level/5)`. |
| [ ] | S3.2 | **Squad UI** | V Agency tabe: Squad sekcia ako primary. 3 squad "sloty" (boxes). Drag agenta do slotu (alebo button "ASSIGN"). Ak slot prázdny: dashed border + "DROP OPERATIVE". |
| [ ] | S3.3 | **Squad stance** | Per-squad toggle: AGGRESSIVE / BALANCED / STEALTH. AGGRESSIVE: `runnerSpeed * 1.3, heatMult * 1.5`. STEALTH: `runnerSpeed * 0.7, heatMult * 0.5`. BALANCED: default. One-click pre celý squad. |
| [ ] | S3.4 | **Squad leader bonus** | `leaderId` = prvý agent pridaný. Ak leader má trait LOYAL: celý squad +5% loyalty decay resistance. PARANOID: squad +10% stealth. GREEDY: squad -5% CR (líder "zdiera"). |
| [ ] | S3.5 | **Bulk actions** | "REST ALL [X]" button (X = počet exhausted). "ASSIGN TRAINING ALL IDLE [X]". Prominentné tlačidlá nad squad grid. |
| [ ] | S3.6 | **Squad deploy na node** | V Network tabe: "DEPLOY SQUAD" button vedľa "DEPLOY RUNNER". Vyberie squad z dropdown, deployuje celú bunku. Každý agent v sqade dostane ON_MISSION. |
| [ ] | S3.7 | **Unlock trigger** | Pri 6. agentovi: ZERO "You need structure. Form cells." + Squad UI reveal s `unlockReveal` animáciou. |

## 3B: Agent Depth

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [!] | A3.8 | **Trait efekty — full** | Rozšírenie F0.3. V `tick()` agent loop: `PARANOID: heatGen += 0.3`. V `hireRunner()`: `GREEDY: cost *= 0.9 (vyjednáva)`. V `checkMissions()`: `LOYAL: successChance += 5`. `UNSTABLE: successChance += (Math.random() > 0.5 ? 15 : -15)`. `IDEALIST: odmietne misiu do Z5 Corp Citadel (log: "X refused corporate infiltration")`. `CYNIC: +10% CR z misie, -1 REP per mission`. |
| [ ] | A3.9 | **Agent Bonds** | `agent.bonds: []`. Po každej spoločnej misii (rovnaký squad): `bond += 10`. Max 100. V state: `{ agentId1, agentId2, strength }`. Bonded pair v rovnakom sqade: `successChance += 5, missionTime *= 0.9`. Ak jeden captured: druhý dostane `stress += 30`. |
| [ ] | A3.10 | **Loyalty DOUBTING** | `agent.loyalty < 30` → `agent.status = 'DOUBTING'`. UI: oranžový border na agent karte + text "[DOUBTING]". Log: "X is questioning the cause." Každých 60s: 2% šanca skimming. |
| [ ] | A3.11 | **Personal quest** | `agent.questAvailable: bool`. Trigger: po 20 misiách. Quest objekt: `{ type, target, description, reward }`. 3 typy: FIND_SOMEONE (infiltrate specific zone), RETRIEVE_DATA (get specific loot), PROTECT_NODE (hold node for 10min). Splnenie: `loyalty += 30` + unikátny dialog. |

---

# 🔵 FÁZA 4: PARADIGM SHIFT 2 — The Bottleneck (Týždeň 11-13)

> THE EYE začína tlačiť späť. Peniaze nie sú limit. Prežitie je limit.

## 4A: Heat 2.0

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [ ] | H4.1 | **Lokálny heat per district** | `state.districtHeat: { Z1: 0, Z2: 0, ... }`. Akcie v districte zvyšujú `districtHeat[state.district]`. Decay nezávislý od globálneho heatu. V UI: pri výbere districtu ukázať jeho lokálny heat. |
| [ ] | H4.2 | **Hot zone mechaniika** | V `tick()`: ak `districtHeat[d] > 80` na viac ako 10 tickov consecutively: `state.hotZones[d] = true`. Hot zone efekt: +15% heat gen pri akciách v tej zóne. Vizuál: district button dostane červenú pulse animáciu. Vymaže sa pri prestige. |
| [ ] | H4.3 | **Heat sink nodes** | Existujúce node effectHooks rozšíriť: typ `heat_decay_district` s `value` (decay rate per tick pre lokálny heat). Strategická voľba: ECONOMIC node vs HEAT SINK node. |
| [ ] | H4.4 | **THE EYE response** | Globálny heat > 90 na 120s+ → "SYSTEM ALERT" event. Log: "THE EYE has flagged your signature as priority." → Hunter spawn accelerated, next raid v 60s namiesto random. |

## 4B: Hunter System

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [ ] | H4.5 | **Hunter spawn** | `state.hunterActive: false`, `state.hunterProgress: 0`. V `tick()`: ak `heat > 85`: `hunterProgress += 1`. Pri 60: `hunterActive = true`. Progress bar v UI: "HUNTER INBOUND [██░░░░] 45/60". |
| [ ] | H4.6 | **Hunter efekt** | `hunterActive`: každých 30s: agenti na misii v aktuálnom districte: 25% capture šanca. Log: "HUNTER spotted near [node]." Vizuál: červená ikona ⚠ na postihnutom districte. |
| [ ] | H4.7 | **Counter** | LAY LOW pri `hunterActive`: ak heat klesne pod 60 počas lay low → `hunterActive = false, hunterProgress = 0`. Log: "HUNTER lost your signal." |
| [ ] | H4.8 | **"Silence" named hunter** | Spawn pri Lvl 10+. `state.silenceActive: bool`. Silence: neviditeľný bez NET_SCANNER (intel upgrade). Ak nemáš NET_SCANNER: agenti failujú bez explanácie (len "Mission failed unexpectedly"). S NET_SCANNER: "SILENCE detected in sector." ZERO: "That's Silence. You won't hear it coming." |

## 4C: Detection Layers

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [x] | D4.9 | **Passive scan** | Hotové. |
| [ ] | D4.10 | **Active trace na misiách** | Misie dlhšie ako 300s: `mission.traceProgress += 1` per tick. UI: progress bar v active mission row: "TRACE [██░░] 45%". Pri 100%: mission fail + heat spike. Môžeš RECALL agenta (stratíš progress ale nie agenta). |
| [ ] | D4.11 | **Deep trace** | `heat > 95`: `deepTraceActive: true`. Efekt: LAY LOW neeliminuje trace progress. Len COUNTER_HACK alebo PURGE_LOGS. ZERO: "They're not just watching. They're inside." |

---

# 🟢 FÁZA 5: PARADIGM SHIFT 3 — Awakening Cycle (Týždeň 14-17)

> Prestige = kapitola príbehu. Nie reset s číslami.

## 5A: Awakening Sequence

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [/] | P5.1 | **Prestige vizualizácia** | V AWAKENING tabe: "PATH TO AWAKENING". Dva `Bar` elementy. `LVL: <Bar pct={(level/10)*100} variant="xp"/>`. `YIELD: <Bar pct={(runGoldEarned/100000)*100} variant="default"/>`. Oba musia byť 100% pre tlačidlo. |
| [/] | P5.2 | **Awakening animácia** | Rozšíriť existujúci prestige modal. Po kliknutí INITIATE: 8s animácia. `position: fixed, inset: 0`. Fáza 1 (3s): Matrix code rain (canvas alebo CSS). Fáza 2 (3s): ZERO dialog per prestige level. Fáza 3 (2s): "RUN #X" fadeuje in, game state resets, hra sa zobrazí. |
| [ ] | P5.3 | **ZERO dialogy per prestige** | P1: "The veil is thin. You see it now." P2: "The loop deepens. They've noticed." P3: "How many times have you died? I've lost count." P5: "You're not a person anymore. You're a pattern." P10: `""` (ticho — najdesivejší). P20+: "Why are you still here?" |
| [ ] | P5.4 | **Memory Fragments** | `state.memoryFragments: 0`. Per prestige: `+1 + floor(sqrt(runGoldEarned/50000))`. Persistent cez prestige. Vizualizácia: glowing hexagony v AWAKENING tabe. |
| [ ] | P5.5 | **Fragment utrácanie** | Fragment Shop v AWAKENING tabe. 5 položiek: `[1 frag] Lore Entry` (Echo File bez misie), `[2 frags] Hidden Zero dialog`, `[3 frags] Permanent +5% global gold`, `[5 frags] Unlock hidden perk slot`, `[10 frags] The Archive entry`. |

## 5B: Evolution Tab — Perk Tree

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [/] | E5.6 | **Visual tree layout** | Namiesto zoznamu: CSS flexbox strom. GHOST branch: vertical stack ľavý stĺpec. OVERLORD: stred. ARCHITECT: pravý. Medzi perkmi: SVG `<line>` spojnice. Farba: muted ak locked, branch color ak owned/available. |
| [ ] | E5.7 | **Perk dependencies** | Pridať do `PRESTIGE_PERK_DEFS`: `requires: ['PERK_ID']`. V `buyPrestigePerk()`: check `requires` splnené. UI: locked child perky sú greyed out s lock icon. |
| [ ] | E5.8 | **Hidden perks** | 3 skryté záznamy v PRESTIGE_PERK_DEFS: `hidden: true, unlockCondition: fn(state)`. Podmienky: BETRAYAL_SURVIVOR (prežiť betrayal event), GHOST_LEGEND (50 total siphons without bust), ZERO_TRUST (10 ZERO správ triggered). Zobrazia sa len ak podmienka splnená. |
| [ ] | E5.9 | **Perk flavor text** | Každý perk: pridať `flavor: "..."`. Zobrazuje sa pod effect textom muted italic. GHOST_STEP flavor: "You've learned to breathe differently. Less noise. Less heat." |

## 5C: Conspiracy Board

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [ ] | C5.10 | **State** | `state.echoFiles: []`, `state.echoConnections: []`. Echo File objekt: `{ id, title, content, connected: [] }`. |
| [ ] | C5.11 | **Echo Files drop** | V `mainframeHack()` success: 3% drop šanca. `VAULT_LOOT` rozšíriť o `ECHO_FILE_[1-20]`. Drop → `state.echoFiles.push(echoId)`. Log: ":: ENCRYPTED_ECHO :: Fragment acquired." |
| [ ] | C5.12 | **BOARD tab UI** | Cork board aesthetic. Každý získaný Echo File = karta (120×80px). Pozadie: `#0a0a0a` s texture. Karty: `background: rgba(255,193,116,0.05), border: 1px solid var(--muted)`. Klik na kartu → decrypt (ak máš KEY) alebo "ENCRYPTED". |
| [ ] | C5.13 | **Connection mechanic** | Klik karta A → klik karta B → `CONNECT` prompt. Ak súvisia (hardcoded pairs): connection line + lore reveal. Nesprávna connection: "No correlation found." Žiadny postih. |
| [ ] | C5.14 | **Story gate** | 5 správnych connections → odomkne DEEP_SOURCE intel upgrade zadarmo. 10 connections → prvý prestige dostane bonus Memory Fragment. |

---

# 🟢 FÁZA 6: NOVELTY WAVES (Týždeň 18-22)

> Každé 1-2 hodiny hra zmení pravidlá. Kittens Game model.

| Stav | ID | Unlock | Nová mechanika | Detail |
|------|----|--------|---------------|--------|
| [ ] | N6.1 | Lvl 12 | **Zone lockdowns** | Po police raid: random district locked 5 minút. Akcie tam blokované. Hráč musí diverzifikovať. Log: "ZONE LOCKDOWN :: Z2 Industrial Wastes — 5:00." |
| [ ] | N6.2 | Lvl 14 | **Market fluctuations** | `state.marketMultiplier` (0.8-1.4) mení sa každých 1800s. SELL_COOLED_ITEMS používa tento mult. UI: "MARKET: [BULL +35%]" alebo "[BEAR -20%]". Čakáš na správny moment? |
| [ ] | N6.3 | Lvl 16 | **Faction war** | 2h event každých 8h. Corporate vs Underground. Vyber stranu (button). Víťaz (kto má viac nodes v contested zones): bonusy na 4h. Porazený: -15% CR v jeho zónach. ZERO: "Choose. But remember — every side has an agenda." |
| [ ] | N6.4 | Prestige 2 | **Dead zones** | 1-2 districty: `heatGen = 0, resourceGen = 0`. Tajné miesta. Echo Files majú 2x drop rate tu. Sú viditeľné len cez NET_SCANNER. |
| [ ] | N6.5 | Prestige 3 | **Silence rivalry** | Silence si pamätá tvoje siphon patterns medzi behmi. Každý ďalší beh: Silence spawne o 10% skôr. Counter: zmeniť district každých 5 siphonov (nepredvídateľnosť). |
| [ ] | N6.6 | Prestige 5 | **Zero hints** | Echo Files začnú obsahovať fragmenty o Zero's origin. "ZERO was not always... this." |
| [ ] | N6.7 | Prestige 7 | **Neural upload** | Agent s loyalty 100 + 50 missions: možnosť "UPLOAD TO NETWORK". Agent "zmizne" ale stane sa permanent passive: `+2% global CR, -0.1 heat/s`. Emocionálne ťažké. ZERO: "They gave everything." |
| [ ] | N6.8 | Prestige 10 | **The Mirror** | Špeciálna 60s sekvencia: vidíš "shadow" svojho Run #1. Rovnaký svet, iný operatívec. Zero: "That was you. Before you knew." |

---

# 📱 FÁZA 7: RESPONSIVE & PLATFORMS (Týždeň 23-26)

> Pred Steam launch. Nie skôr.

## 7A: Breakpoint Infrastructure

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [R] | R7.1 | **Multi-breakpoint** | `xs: <480, sm: 480-767, md: 768-1023, lg: 1024-1439, xl: 1440+`. CSS media queries pre každý. |
| [R] | R7.2 | **Device detection** | Nahradiť `isMobile = width < 768` za: `const device = width < 480 ? 'xs' : width < 768 ? 'sm' : width < 1024 ? 'md' : width < 1440 ? 'lg' : 'xl'`. `isMobile = device === 'xs' || device === 'sm'`. `isTablet = device === 'md'`. |
| [R] | R7.3 | **Responsive grid** | xs/sm: `display:flex, flex-direction:column`. md: `grid-template-columns: 1fr 280px`. lg: `grid-template-columns: 1fr 280px` (stat bar nahrádza left col). xl: `grid-template-columns: 1fr 320px`. |
| [R] | R7.4 | **Font scaling** | CSS: `@media(max-width:767px) { :root { font-size: 15px; } }`. Všetky `.text-*` triedy prepočítané na `rem`. |
| [R] | R7.5 | **Safe area** | `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. CSS: `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)`. |

## 7B: Mobile Design

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [R] | R7.6 | **5-tab mobile bar** | STATUS / OPS / AGENTS / NETWORK / ··· (MORE). "MORE" → bottom sheet: Upgrades, Settings, Achievements. Výška taby: 60px. Icons + labels. |
| [R] | R7.7 | **OPS mobile** | Full-width buttons, `min-height: 56px`. SIPHON vždy prvý, zvýraznený (väčší, amber border). Nie 2-column grid na mobile. |
| [R] | R7.8 | **Bottom sheets** | `.bottom-sheet` CSS: `position:fixed, bottom:0, left:0, right:0, max-height:80vh, transform:translateY(100%), transition:0.3s`. `.bottom-sheet.open { transform:translateY(0) }`. Backdrop: `rgba(0,0,0,0.7)`. Nahradí: spec modal, prestige confirm, save/export. |
| [R] | R7.9 | **Thumb zone** | Primárne akcie (SIPHON, LAY LOW) v dolnej 40% obrazovky. Nav bar dole (existuje). |
| [R] | R7.10 | **44px tap targets** | `@media(max-width:767px) { .btn { min-height: 44px; } .tab { min-height: 48px; } }`. |
| [R] | R7.11 | **Z Fold outer** | `@media(max-width:400px)`: tab bar = icons only (no labels). Stat bar = compressed (2 metriky na riadok). |

## 7C: Tablet & Steam Deck

| Stav | ID | Feature | Implementácia |
|------|----|---------|--------------|
| [R] | R7.12 | **Tablet layout** | Sticky stat bar namiesto left dashboard. Tabs + content vľavo, inventory (280px) vpravo. |
| [R] | R7.13 | **Steam Deck** | lg breakpoint (1280×800). `min-height: 700px` body guarantee. Keyboard nav: Tab/Arrows pre tabs, Enter pre primary action. |
| [R] | R7.14 | **Focus visible** | `.btn:focus-visible, .tab:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }`. Povinné pre Steam Deck. |
| [R] | R7.15 | **Numeric shortcuts** | `useEffect` na `keydown`: `1=SIPHON, 2=BREACH, 3=DEEP_SIPHON, 4=MAINFRAME, L=LAY_LOW, S=SELL`. Zobrazené v button labeloch: "SIPHON [1]". |

---

# 🔴 FÁZA 8: ENDGAME (Týždeň 27-32)

| Stav | ID | Feature | Detail |
|------|----|---------|--------|
| [ ] | E8.1 | **Mainframe zóna** | Unlock: Prestige 10 + 5 Echo connections. Špeciálny district. Heat tu neklense prirodzene (len upgrades/lay low). |
| [ ] | E8.2 | **Phase 1: Perimeter** | 3 nody s hunter guardian. Deploy agenta → hunter vs agent encounter. |
| [ ] | E8.3 | **Phase 2: Core** | 5 sekvenčných akcií bez busted: SIPHON → BREACH → DEEP_SIPHON → MAINFRAME → DECRYPT. Timer 600s na celú sekvenciu. |
| [ ] | E8.4 | **Phase 3: The Eye** | 5 rozhodnutí, každé 30s. ZERO dáva kontext. Zlé rozhodnutie = setback nie koniec. Posledné: Red/Blue pill. |
| [ ] | E8.5 | **Red Pill ending** | Destroy THE EYE. "The truth is worse than the lie." Full lore reveal. Credits. NG+ unlocked. |
| [ ] | E8.6 | **Blue Pill ending** | Ignorovať. "Some things are better unknown." Hra pokračuje. Zero zmizne navždy. Najsmutnejší koniec. |
| [ ] | E8.7 | **Ghost ending** | Max Ghost alignment (75+). "You won by not being found." THE EYE prestane vedieť o tvojej existencii. Hra pokračuje v "ghost mode". |
| [ ] | E8.8 | **Rebel ending** | Max Rebel alignment. Mass event. "They broke the system. The system was all they knew." Chaos mode. |
| [ ] | E8.9 | **Architect ending** | Max Architect alignment. Ovládneš THE EYE. "You became what you fought." Najtemnejší. |
| [ ] | E8.10 | **True Awakening** | Všetky 3 alignments 50+, všetky Echo Files, Prestige 10+, Zero max relationship. ZERO: "I was never just an AI." Transcendence. |

---

# ⚪ FÁZA 9: STEAM RELEASE POLISH (Týždeň 33-36)

| Stav | ID | Feature | Detail |
|------|----|---------|--------|
| [ ] | SP9.1 | **Onboarding cutscene** | 90s intro. Animovaný text vysvetľujúci svet. Skip option. Spúšťa sa len pri `isFirstEver`. |
| [ ] | SP9.2 | **Steam Achievements** | 30-50. Mix: progression, skill-based (no busted run), lore (all Echo Files), hidden (secret endings), challenge (Ironman). |
| [ ] | SP9.3 | **Cloud save** | Steamworks SDK. Auto-sync pri každom auto-save (30s). |
| [ ] | SP9.4 | **Accessibility** | Font size slider (80%-140%). Reduce animations toggle. Colorblind mode (amber→blue pre deuteranopia). High contrast mode. |
| [ ] | SP9.5 | **Difficulty modifiers** | Ghost Mode (no detection system). Ironman (no reloading, busted = CR penalty). Nightmare (+50% heat gen). Voliteľné pri new game. |
| [ ] | SP9.6 | **Performance** | Log virtualizácia ak > 100 entries. `React.memo` na AgentCard, RunnerCard. `useMemo` pre calculateMapModifiers. |
| [ ] | SP9.7 | **Bug hunt** | 20h+ playtesting. Prestige migration edge cases. Offline calculation stress test. Agent capture/recovery flow. |

---

# 🌐 FÁZA 10: POST-LAUNCH (Ongoing)

| Stav | ID | Feature | Detail |
|------|----|---------|--------|
| [ ] | PL.1 | **Weekly events** | Rotujúce globálne udalosti. Data Storm (random buffs/debuffs). Corporate Sweep (raidy 3x frequent 24h). Underground Festival (REP gains 2x). |
| [ ] | PL.2 | **Run Archive** | Každý prestige: uloží súhrn. "Run #3 · 4.2h · Peak: 2.1M CR · Ended: BUSTED by Silence." Vizualizácia v AWAKENING tabe. |
| [ ] | PL.3 | **Leaderboard** | Opt-in. Highest prestige, fastest first prestige, most CR single run. Steam leaderboards API. |
| [ ] | PL.4 | **Community** | r/incremental_games post pri itch.io launch. Zbierať feedback. Top-voted Zero messages sa dostanú do patchu. |

---

# 🚫 SCOPE CONTROL — Vyhodené z launch

Tieto veci sú "neskôr ak hra uspeje":

- 10 runner rolí → 5 stačí
- 4 bandwidth typy → Soft + Hardened
- 20+ named hunters → 1-2 pre launch
- 6-axis alignment → 3-axis
- Multi-step dilemmas → 1-step pre launch
- Replay viewer, build presets → post-launch
- Multiplayer → nikdy (scope killer)
- Black market 7 vendors → 1 Fixer

---

# 📅 ČASOVÝ PLÁN

```
Týždeň 1-2   │ Fáza -1 + Fáza 0 (Audit fixy, state versioning)
Týždeň 3-5   │ Fáza 1 (Juice, audio, boot sequence)
Týždeň 6-7   │ Fáza 2 (UI architecture rework)
              │
              ├── ITCH.IO LAUNCH (free) ──────────────────────────
              │   Cieľ: komunita, feedback, wishlisty
              │
Týždeň 8-10  │ Fáza 3 (Syndicate Manager, Squad systém)
Týždeň 11-13 │ Fáza 4 (Bottleneck, Hunter, Heat 2.0)
Týždeň 14-17 │ Fáza 5 (Awakening Cycle, Conspiracy Board)
Týždeň 18-22 │ Fáza 6 (Novelty Waves)
Týždeň 23-26 │ Fáza 7 (Responsive + Steam Deck)
              │
              ├── STEAM EARLY ACCESS ($2.99-3.99) ───────────────
              │   Cieľ: prvé reálne príjmy
              │
Týždeň 27-32 │ Fáza 8 (Endgame + endings)
Týždeň 33-36 │ Fáza 9 (Release polish)
              │
              └── STEAM FULL RELEASE ($4.99) ────────────────────
```

---

# 💡 TRI ROZHODNUTIA KTORÉ DEFINUJÚ ÚSPECH

**1. Prvý "aha!" moment je definovaný: First agent hire**
ZERO správa + agent card animácia + ZERO: "You're no longer alone. THE EYE noticed." — toto je tvoj Cookie Clicker druhá babička. Všetko pred tým smeruje k tomuto momentu. Všetko po tom z tohto vychádza.

**2. Zero je tvoja jedinečná výhoda**
NGU Idle nemá Zera. Kittens Game nemá Zera. Ty máš narátora s osobnosťou, motívmi, a tajomstvom. Investuj do Zero textov rovnako ako do mechaník. Každá Zero správa musí byť napísaná tak, že hráč chce prečítať ďalšiu.

**3. Itch.io first, Steam second**
Po Fáze 3 (Syndicate Manager) máš dosť na itch.io launch. Zisti čo hráčov baví pred tým, než zaplatíš Steam fee. Komunita ti povie kde je "aha!" moment — ak ho nevie nájsť, vieš čo treba zmeniť.