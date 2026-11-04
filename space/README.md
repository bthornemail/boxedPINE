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
| `src/codex-form.ts`, `scripts/codex-form.mjs`, `public/avatars/` | the forms: CODEX's, and each of the eight characters' in its own hue, standing in the hub beside its avatar (CODEX at the centre); CODEX's set of 16 (the 14 Fano planes and 2 Hasse diagrams, tag and place in each margin, an intact set tracing to zero): a glTF model generated from its name's code points (each letter a slice, its Braille cells as dots, its plane's Aegean sign as the spine), the same bytes every time, read back to its name from its cubes' places alone; its CSS values for the Commons to bind | ✅ tested |
| `step.html`, `src/step-track.ts`, `scripts/step-track.mjs`, `public/step/` | The Coxeter step (proofs/svg/e8/step.svg) as an instantiation portal: its 30 frames read from its own animateTransform as a WebVTT track and CSS (`--step-frame`, `--step-angle`, `steps`), the track carried by a silent 15-second loop through the portal (`attachTrack`), so every room is cued by the frame and the SVG's clock follows it | ✅ tested |
| `src/exchange.ts`, `src/trace.ts` | The exchange (compareExchange through a Proxy, the Catch-22 reset); the 65,536 trace | ✅ tested |
| `src/story.ts`, `src/score.ts`, `src/sound.ts`, `src/witness.ts` | The story on the plane; the score, sound graph and witness video | ✅ tested (sound and witness in headless Chrome) |
| `src/identity.ts` | Identity without hashing, and its chain | ✅ tested |
| `guest.html`, `src/guest.ts` | The Plan 9 guest's own screen in the room: frames from the host's `unbound/PLAN9/frames.py` (a QEMU screendump as PNG) drawn to a canvas, whose `captureStream` is a video carrying the narrative's WebVTT; the video on a plane in three.js, seen from any angle (drag, `?angle=`) or in VR; and the eight agents on the floor at their hues from the guest's own state (`unbound/PLAN9/space/agentd.c`), the viewer as the Observer: read (the default), constrain, or interject after a second click | ✅ seen in headless Chrome: the frame's states and agentd's agree (tick 110) |
| `twin.html`, `src/twin.ts`, `src/twin-worker.ts`, `src/twin3d-worker.ts` | The twin: one story drawn twice on transferred canvases, Solomon's icon the only difference (a disc and a square in 2D; a sphere and the glTF model in 3D), every frame compared: separate (XOR) inside his icon, the same (XNOR) outside; `?source=plan9` the floor's states, `?falsify` a stray mark | ✅ seen in headless Chrome |
| `walk.html`, `src/walk.ts`, `src/walker.ts` | The acceptance test walked: first person in the Commons (W S A D, Q E), both icons, the floor from above; each step a literal line (keys, the floor's tick, the eight states), replayed from the trace alone: A byte for byte, B differing from A wherever his icon shows and nowhere outside his region | ✅ seen in headless Chrome (71 of 71 replayed; the falsifier fails) |
| `walkthrough.html`, `src/walkthrough.ts` | A podcast walked by its own cues: the picture in picture (a shadow-DOM element) of the Commons in 2D, 2.5D, 3D and 4D (each step's floor stacked by its step, a cone), the 3D on an OffscreenCanvas in a worker, the eight voices rendered by an OfflineAudioContext (one channel each), all rebuilt from the trace and compared | ✅ seen in headless Chrome (89 of 89 cues) |
| `src/portal.ts` (on every page) | The portal: every page of `space/` joined to the same architecture (below) | ✅ seen in headless Chrome across two pages |
| `unbound/PLAN9/space/floor.c`, `observe.c` (beside this project) | `plane.ts`'s floor in Plan 9 C with draw(2) and event(2): the twelve sectors, the rim, the eight characters at their hues stepping `gnomon.ts`'s K once a frame; the Observer attaches with mach(2), reads each state, interjects (stop, write, start) or asks under constraints (exact, ideal, min, max over the K orbit) without writing | ✅ states equal `gnomon.ts`'s |

## The portal: every page a portal to the same architecture

The author: "update documentation an vtt cues so that every html page can share text tracks and media streams between them so each page is a portal to the same underlying architecture". `src/portal.ts` is included by every page in `space/`. The pages share three things through one `BroadcastChannel` (`commons-portal`).

- **The state.** The open pages elect one reader of the Plan 9 floor with a Web Lock (`commons-portal-floor`). That page asks agentd (`?agents=`, normally `http://127.0.0.1:18000/agents`) once a second and tells every page the tick and the eight states. When it closes, another page takes the lock. `onFloor(f)` hears every floor; `floorNow()` gives the latest. The hub, the twin, the walk and the walk-through read the floor this way. `guest.html` still reads agentd itself, because it also constrains and interjects.
- **The world.** Metaverse Kit's world, served from Plan 9 (unbound `PLAN9/src/mkfs.c` and `mkd.c`, `?world=`, normally `http://127.0.0.1:18001`), read the same way: one page, elected by a second Web Lock (`commons-portal-world`), reads its tiles and each tile's state every two seconds and tells every page (`onWorld`). The Commons shows each tile's live nodes above the Living world station; `src/world.ts` is the one reader of a tile's state, shared with the Living World (`metaverse.html`).
- **The text track.** The narrative WebVTT (`?vtt=`, normally `http://127.0.0.1:8790/vtt/NARRATIVE/canticle.vtt`), one URL for every page. `attachTrack(media, src?, label?)` attaches a track and tells every page each cue it enters; `onCue(c)` hears them. The twin, the walk and the walk-through attach their tracks this way.
- **The media streams.** `offer(name, stream)` offers a stream by name; `watch(name)` returns it on any other page. The offer, the answer and the candidates go over the channel, and the stream itself over a local `RTCPeerConnection`, since a `MediaStream` does not cross a channel. The twin offers its two views, the walk its two, and the walk-through its four-view picture in picture.

The narrative levels the pages stand at (the walk embedded in the podcast, the story in the walk) are in `PORTAL.md`.

On each page the portal is a `<commons-portal>` element in a shadow root, in the lower left corner. It shows the shared tick and states, the cue and the page it came from, a link to every room, and the streams on offer; choosing one shows it. In the console, `portal` gives the same functions.

Checked in headless Chrome with two pages (map and gate): one page read the floor and both showed tick 3269; a red canvas offered on map arrived on gate as 219, 20, 30 (drawn as 220, 20, 30); a podcast cue entered on gate was heard on map; and when the reading page closed, the other took the lock.

## ⟦Placeholders⟧ for the author

- ⟦Canvas 2D, three.js, or both? `package.json` already includes three.js.⟧
- ⟦Which view comes first?⟧
