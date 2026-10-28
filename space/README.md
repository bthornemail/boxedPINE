# space — spatial rendering

This folder is the **visual and interactive environment**: what a visitor sees and touches. It draws what `core` computes and what `rosetta` classifies. It never decides anything on its own.

**The author's target:** a three.js virtual breadboard of the transistor circuits, inside a tetrahedron whose x and y are 360 and 65536.
- The circuit is modelled in an `OfflineAudioContext`, as `breadboard/` already does on a 2D canvas.
- The animation frame is its input and output.
- Rendering goes through a three.js adapter on an `OffscreenCanvas`, so it runs on any platform.
- The starting example is `space/src/scene.ts`, a three.js scene with a tetrahedron.

⟦What do the 360 and 65536 axes carry: degrees of rotation, and an index into the 2¹⁶ Blob?⟧

**For the builder:** each view below says what it shows, what drives it, and what has to be true on screen. The "must show" lines are checked facts, and the tests in `src/testbed/` already prove them for the code. The ⟦placeholders⟧ are the author's to fill.

## Views

### 1. The Exchange (Level 0)

- **Shows:** a row of 64 slots, the 64-byte buffer. The visitor picks an index, an expected index and a replacement, and runs one compare-exchange.
- **Driven by:** `core/src/verified/exchange.ts` (`exchange`, `digest`).
- **Must show:** a hit writes and shows difference 0. A miss leaves the slot and shows `expected ⊕ old` as lit bits. The digest is 0 exactly on a hit.
- ⟦How should a hit and a miss look and sound?⟧

### 2. The Blob (Level 1)

- **Shows:** 65,536 bits as 128 buffers of 64 bytes. Highlight the same wordform at each width: offset 12 in each 16, 60 in each 64, 124 in each 128, 252 in each 256.
- **Driven by:** `core/src/verified/wordform.ts`.
- **Must show:** all four highlights are "every bit set except the lowest two".
- ⟦What should one cell of the Blob look like?⟧

### 3. The Orbit of 60 (Level 1)

- **Shows:** the walk `60 ⊕ n` for n = 0..63 as characters, in four blocks of four: `< = > ?`, `8 9 : ;`, `4 5 6 7`, `0 1 2 3`, and so on.
- **Driven by:** `orbit60()` in `core/src/verified/wordform.ts`.
- ⟦Is the walk drawn as a ring, a line or a clock face?⟧

### 4. The Swaps (Level 1)

- **Shows:** 8 byte cells with arrows: swap16 moves `j → j ⊕ 1`, swap32 `j → j ⊕ 3`, swap64 `j → j ⊕ 7`. The visitor applies the three in any of the 6 orders and sees all six land on the same result (`j ⊕ 5`).
- **Driven by:** `core/src/verified/swap.ts`.
- **Must show:** the input never changes (permutation, not mutation).

### 5. The Grammar (Levels 2–3)

- **Shows:** a text box. As the visitor types, every rule that matches lights up, grouped as reference, wordform, sets, brackets, faces, palindromes and higher forms.
- **Driven by:** `classifyAll` in `rosetta/src/grammar/grammar.ts`.
- **Must show:** `0p3x40n` lights `EXCHANGE`; `0xFF` lights `HEX`.

### 6. The Kernel (Levels 3–5)

- **Shows:** the kernel's state and history. The visitor writes positions, gets refused for invalid ones, uses `learn` to add a pattern, and sees the refused position become accepted. `regenerate` rebuilds the kernel from its description.
- **Driven by:** `rosetta/src/grammar/kernel.ts`.
- ⟦This is where your REPL project plugs in: the visitor's typed lines go to the kernel.⟧

### 7. The iExtant Torus

- **Shows:** the four canvases already in `src/main.ts` (`uu`, `uk`, `ku`, `kk`) as the shape axis, against the scope axis (FS, GS, RS, US): 16 cells. Two peers and the weight between them (rev1 Part X).
- ⟦What goes on each of the four canvases?⟧

### 8. The Breadboard (hardware)

- **Already built:** `breadboard/` draws the 5T/6T/8T/10T XOR circuits on a canvas, with the XOR computed in Web Audio (wiki: SPEC-44 The Virtual Breadboard). It can be linked in as is.

## Use case scenarios

Prior work that informs this folder (see [wiki/usecases/USE-00 Use Case Scenarios.md](../wiki/usecases/USE-00%20Use%20Case%20Scenarios.md)): the breadboard (`omi/audio`), canvas projection (`omi-canvas`), the four authorities as views (`omi-tetragrammatron`), music (`omi-music`).

## What is here now

| Path | What it is | State |
|------|------------|-------|
| `src/canvas.ts`, `src/board.ts` | JSON Canvas types and a board class | Building blocks |
| `src/atomics.ts`, `src/clock.ts` | Notes on an Atomics-driven clock (5040 slots) and buffer layout | Placeholders |
| `src/body.ts` | three.js notes (bones, curves, quaternions) | Placeholders |
| `src/index.ts`, `src/main.ts` | Notes on closures, combinators and generators | Learning notes |
| `index.html` | Earlier page | Placeholder |
| `breadboard/` | The virtual breadboard (view 8): canvas plus Web Audio, its own `npm test` | ✅ working |
| `index.html`, `src/hub.ts` | The Agent Commons in 3D: stations, the gnomon dial, the Dalí cross, synset and bridge agents | ✅ builds |
| `map.html`, `src/map.ts` | The z-indexed maps: the colour wheel (2D, 2.5D), a character's state, the pair mask, the story, the terms box, the witness | ✅ tested modules |
| `src/plane.ts` | The plane between the 2D canvas and the 3D scene: (u, v, layer) to the map (2D, 2.5D), the world and the floor canvas, and back; the hub's floor is its canvas, drawn without a DOM, picked by pointer or XR controller at its uv | ✅ tested (round trips, the stand-in context) |
| `src/gnomon.ts`, `src/polyform.ts`, `src/commons-agents.ts` | Polytron's K and gnomon; the polyform generator from a MaxiCode declaration; the agents' steps | ✅ tested |
| `src/avatar.ts`, `src/border.ts` | Avatars as z-indexed SVG parts (Light Garden's format); a name and cues in an SVG's margin | ✅ tested |
| `src/exchange.ts`, `src/trace.ts` | The exchange (compareExchange through a Proxy, the Catch-22 reset); the 65,536 trace | ✅ tested |
| `src/story.ts`, `src/score.ts`, `src/sound.ts`, `src/witness.ts` | The story on the plane; the score, sound graph and witness video | ✅ tested (sound and witness in headless Chrome) |
| `src/identity.ts` | Identity without hashing, and its chain | ✅ tested |
| `unbound/PLAN9/space/floor.c`, `observe.c` (beside this project) | `plane.ts`'s floor in Plan 9 C with draw(2) and event(2): the twelve sectors, the rim, the eight characters at their hues stepping `gnomon.ts`'s K once a frame; the Observer attaches with mach(2), reads each state, interjects (stop, write, start) or asks under constraints (exact, ideal, min, max over the K orbit) without writing | ✅ states equal `gnomon.ts`'s |

## ⟦Placeholders⟧ for the author

- ⟦Canvas 2D, three.js, or both? `package.json` already includes three.js.⟧
- ⟦Which view comes first?⟧
