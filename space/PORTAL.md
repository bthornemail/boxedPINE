# The Portal

Every page in `space/` is a portal to the same architecture. Each page is a view of one story, the narrative of the Commons; none is a separate application. This file describes how the pages are joined, and the narrative levels they stand at.

## How the pages are joined

`src/portal.ts` is included by every page. Through one `BroadcastChannel` (`commons-portal`) the pages share three things. The details and the check are in `README.md`, under "The portal".

- **The state.** The Plan 9 floor (`unbound/PLAN9/space/floor.c`), read through agentd (normally `http://127.0.0.1:18000/agents`). The open pages elect one reader with a Web Lock, and it tells every page the tick and the eight states, once a second. When that page closes, another takes the lock. No page is fixed as the master.
- **The text track.** The narrative WebVTT (normally `http://127.0.0.1:8790/vtt/NARRATIVE/canticle.vtt`), one URL for every page. A page playing a track tells every page each cue it enters (`attachTrack`, `onCue`). The time is the media's own, along its cues; the floor's tick is the floor's own.
- **The media streams.** A page offers a stream by name (`offer`), and any page can watch it (`watch`). The stream travels over a local `RTCPeerConnection`, because a `MediaStream` cannot cross a channel.
- **The geometry.** `src/plane.ts` maps a place, (u, v, layer), to the 2D floor, the 2.5D map and the 3D scene, and back. Every page uses it.

## The narrative levels

The author's source, Wikipedia on the hypodiegetic narrative: "a hypodiegetic narrative is a narrative embedded in another narrative". Mieke Bal coined the term in 1977. Narratologists often prefer it to Gérard Genette's "metadiegetic" (1980), because "to indicate dependence, we have to replace higher with its opposite" (Bal). "When narrative levels are confused or entangled, this is metalepsis."

Two embeddings are built and can be checked:

- **The walk-through embeds the walk.** `walkthrough.html` plays a podcast, which is a narrative about this project. The podcast's own cues are the steps of a walk in the Commons, and the walk is shown inside its picture in picture. The walk is hypodiegetic to the podcast.
- **The walk embeds the story.** `walk.html` and `twin.html` show the Commons' story, the eight characters stepping from the Plan 9 floor, drawn twice. Solomon's icon is the only difference between the two views. The story is told again inside the check.

A reading, relayed by the author from DeepSeek, and not derived here, assigns each page a level:

- the podcast and `walkthrough.html` extradiegetic (the telling);
- the Plan 9 floor and the Commons (`index.html`) diegetic (the story);
- `twin.html`, `walk.html` and `modulus-indexer/gate.mjs` metadiegetic (the story within the story);
- the eighth observer (BRIANCODEXDEEPSEEK, unbound `global.vtt`) and the gate as the metalepsis, where a claim from outside the story meets the story's own error.

## The four operations

The record holds the author's four operations: "ATOMICS.PROXY(XOR, ...), REFLECT(XNOR, ...), PIXELATE(XOR, ...), REST(XNOR, ...), each over AGREEMENT, RESOLUTION, CONTRIBUTION, PROPAGATION", in the order Rest, Proxy, Reflect, Pixelate (unbound `environment.vtt`).

A second reading, also relayed from DeepSeek and also not derived, pairs them with rhetoric's four operations of change: addition (adiectio) with PROXY, omission (detractio) with REST, substitution (immutatio) with PIXELATE, and transposition (transmutatio) with REFLECT. The XOR and XNOR in that pairing are the author's; the pairing itself is not checked by anything here.

## The 144 synsets as a static router

The author (proofs I-199): "the WordNet was a synset-based router", and agents "can be 144 of any 360 colors". The 144 are WordNet 3.0's **color** (n 04956594), the 138 synsets below it, and the five above it up to **entity** (`public/polytron/colors.json`). They are all nouns. Each has one parent, its hypernym, so together they form one tree with a single root.

- **Where they stand** (`src/map.ts`): a synset's hue is the colour's own hue, from its name, and is its angle on the wheel. Its depth in WordNet is its distance out. A synset without a hue (the route up to entity, and the achromatic) stands on the inner ring.
- **The route** (`src/commons-agents.ts`, `synsetRoute`): in a tree there is exactly one route between any two nodes, up to their lowest common ancestor and down again. The route is fixed by the parents alone and needs no table.
- **Checked** (`src/testbed/space.test.ts`):
  - 144 synsets, one root (entity), 143 parent edges;
  - 10,296 pairs, each with one route, each step along a parent edge, its length the two depths less twice the meeting point's;
  - the longest route is 9 steps: entity > abstraction > attribute > property > visual property > color > chromatic color > red > dark red > burgundy.
- **The falsifier:** given a second parent (blue as well as dark red), burgundy has two routes up to color, so a fixed route needs the tree.

A reading relayed from DeepSeek, checked against the data and not adopted:

- "their hue is their part of speech": all 144 are nouns, and the hue is the colour's own.
- routes by "hypernym, hyponym, meronym, holonym": the data holds one relation, the hypernym. Hyponym is its reverse; meronym and holonym are not among the 144.
- polytron's `wordnet-to-geometry.c`: polytron has `wordnet-shm.c`.
- "the 4 faces of the tetrahedron are the 4 primary relations, the 6 edges the 6 paths": nothing derives it.
