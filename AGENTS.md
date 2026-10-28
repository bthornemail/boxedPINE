# Agent Guide

## Repository shape

- The root package is a Vite + TypeScript browser project. `index.html` is the main Fano Constants page; the Vite build also includes the linked rooms in `space/` (`index.html`, `xr.html`, `meta.html`, `agent.html`, `examples.html`, `polytron.html`, `metaverse.html`, and `guest.html`).
- `src/testbed/` is a Node testbed for the verified implementation in `core/src/verified/` and the grammar/kernel in `rosetta/src/grammar/`; it is intentionally excluded from the browser TypeScript build.
- `wiki/` is the canonical Obsidian protocol vault. `wiki/tools/validate.mjs` checks frontmatter and internal links.
- `proofs/`, `types/`, and the projects under `omi-files/` are independent subprojects. Before editing one, read the nearest nested `AGENTS.md`; its commands and constraints take precedence over this file. `proofs/` and `types/` are submodules (see `.gitmodules`): `proofs/` from `github.com/bthornemail/omi-axioms`, `types/` from `github.com/bthornemail/omi-types`, both on `main`. `omi-files/` lives beside this repository, in the sibling `boxed/`, since 44c5606.

## Root commands

- Install locked root dependencies with `npm ci`.
- Run the root test suite with `npm test`; run one focused file with `node --test src/testbed/core.test.ts` or `node --test src/testbed/rosetta.test.ts`.
- Run the root verification build with `npm run build`; this runs `tsc` before `vite build`. There is no separate root lint or formatter script.
- Start the root browser app with `npm run dev`; use `npm run preview` only after a build.
- Validate the declarative metaverse environment with `npm run environment:check`; run `npm run environment:build` to emit its manifest and build all browser rooms; run `npm run environment:run` to start the sibling metaverse-kit server/client (override its path with `METAVERSE_KIT_ROOT`).
- Validate the vault with `node wiki/tools/validate.mjs`.
- Submodules: clone with `git clone --recurse-submodules`, or run `git submodule update --init` in an existing clone. A change to `proofs/` or `types/` is committed and pushed inside that folder first (it is its own repository); then, here, `git add proofs` (or `types`) records the new commit and is committed and pushed in boxedPINE. `git submodule update --remote` moves both to their remotes' `main`.
- For Coq changes, run `make -C proofs proof-strict`; the Makefile enforces the proof registry before compiling and checking the listed modules.
- For JavaScript proof changes, source checks live in `proofs/js/catalog/`; run `make -C proofs js` for the checks and `make -C proofs js-docs` to regenerate `proofs/js/catalog.json`, `proofs/js-docs/`, and VM/Worker carriers. Keep checks that do not hold in `proofs/js/pending/`.

## Change boundaries

- Keep browser production code under the root TypeScript build's `src` boundary; `src/testbed`, `src/server.ts`, `src/define.commands.ts`, and the author's command-line record scripts in `src/` (america, angela, eve, mertens, m-expr, omnicron, red40, trinity, main, prompt.treemap) are excluded by `tsconfig.json` and are exercised separately or by direct Node usage. Keep their bytes as they are (angela.ts carries the attribution `// 02SISTER03081986`).
- When changing a verified finding or grammar rule, update its corresponding wiki record as well as the test; the testbed README treats the wiki as the record of the finding.
- Do not treat `space/` or Canvas output as protocol authority: `space/README.md` describes it as a visual projection of `core` and `rosetta`.
- `rosetta/src/grammar/interface.ts` is the non-authoritative interface carrier: Proxy and Reflect perform access, Catch returns structured outcomes, and tagged templates preserve literal strings plus interpolated values.
- Keep human record ordinals and zero-based storage indices distinct; use `indexOfOrdinal`/`ordinalOfIndex` at the interface boundary instead of shifting proof or runtime values implicitly.
- `space/polytron.html` is a browser projection of `omi-files/polytron`; its authoritative renderer and verification remain the Polytron C/OpenGL ES/QEMU sources, governed by `omi-files/polytron/AGENTS.md`.
- `space/metaverse.html` is a gateway to the sibling `/home/main/omi/metaverse-kit` client, normally at `http://localhost:3000`; that project owns the event-sourced world runtime, server, and deterministic replay spine.

## Agent channel

- `repl/src/agent-bridge.ts` is both an MCP-over-stdio server and a loopback HTTP bridge for `space/agent.html`, normally on `127.0.0.1:8743`; messages are memory-only and capped at 1000.
- Run the bridge manually with `node repl/src/agent-bridge.ts`; use `AGENT_BRIDGE_STAY=1 AGENT_NAME=hub node repl/src/agent-bridge.ts </dev/null` for a standing hub. A second agent can share the port by setting `AGENT_NAME` and relaying through the first.
- Open the channel page at `http://localhost:5173/space/agent.html` while `npm run dev` and the bridge are running. It supports typed messages, record pointing, WebXR, and optional browser Prompt API/WebMCP features; browser flags are not required for the basic channel.

## The Agent Commons

- `space/index.html` is the 3D playground (the gnomon dial and the Dalí cross at the Polytron station, synset and bridge agents walking); `space/map.html` the z-indexed maps: the 144 colour synsets on the colour wheel (2D, 2.5D), a character's 128-byte state, the 65,536-pair mask, the story on the plane, the terms box and the witness recorder.
- `space/src/plane.ts` is the one place both derive from: a place is (u, v, layer) on the Commons plane, and the map's 2D and 2.5D, the 3D world and the floor canvas map to it and back. The hub's floor is that canvas (an OffscreenCanvas, no DOM), so in a headset the floor is the map; a pointer or an XR controller hitting the floor selects through its uv.
- Each of Light Garden's characters (`space/src/border.ts`, tags METATRON SOLOMON SOLON ASABIYAH ENOCH SPEAKER GENESIS OBSERVER) has its own set of 16 in `public/characters/<TAG>/`: the 14 Fano planes and two Hasse diagrams, XOR (read, place 0) and XNOR (write, place 15), each file's margin carrying the tag and its place. Regenerate with `node scripts/character-trees.mjs`.
- The exchange (`space/src/exchange.ts`) is `Atomics.compareExchange(svg, 60 ⊕ frame, 127, 63)` on 128 bytes, handed over through a Proxy with Reflect and Catch (rosetta's interface carrier); its reset restores the literal at byte 22 (frame 42) unless `CATCH n` moves it.
- The trace (`space/src/trace.ts`) XORs each of an agent's 16 files' places into a 65,536 buffer at its name pairs: an intact set traces to zero.

## Tags

- A tag is `/^[A-Z0-9]{1,8}$/` (rosetta `TAG`). Lower to upper promotes a word (a subject) to a tag (an object); upper to lower deprecates it (`rosetta/src/tag-type.ts`, at type level `ToTag<S>` and `Deprecate<S>`). A word over 8 letters cannot be a tag; a tag of digits has no case.
- The bridge answers an agent by its tag in the Host (`metatron.localhost`) or the path (`/METATRON/...`); a Host-named agent must arrive on the port of its block of 16 whose nibble parity is its tag's (rosetta `portFor`), or gets 421.
- No hash is identity anywhere here: identities are their entropy as tags, records their literals (see `types/AGENTS.md`).

## Skills

`SKILLS.md` lists the skills in the `omi-files` projects' format, each name made only of tag literals derived from the tags those projects share. The `AGENTS.md` and `SKILLS.md` files under `omi-files/` belong to their projects; read the nearest one before editing a project.
