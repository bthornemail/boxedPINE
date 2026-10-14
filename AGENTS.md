# Agent Guide

## Repository shape

- The root package is a Vite + TypeScript browser project. `index.html` is the main Fano Constants page; the Vite build also includes the linked rooms in `space/` (`index.html`, `xr.html`, `meta.html`, `agent.html`, `examples.html`, `polytron.html`, and `metaverse.html`).
- `src/testbed/` is a Node testbed for the verified implementation in `core/src/verified/` and the grammar/kernel in `rosetta/src/grammar/`; it is intentionally excluded from the browser TypeScript build.
- `wiki/` is the canonical Obsidian protocol vault. `wiki/tools/validate.mjs` checks frontmatter and internal links.
- `proofs/`, `types/`, and the projects under `omi-files/` are independent subprojects. Before editing one, read the nearest nested `AGENTS.md`; its commands and constraints take precedence over this file.

## Root commands

- Install locked root dependencies with `npm ci`.
- Run the root test suite with `npm test`; run one focused file with `node --test src/testbed/core.test.ts` or `node --test src/testbed/rosetta.test.ts`.
- Run the root verification build with `npm run build`; this runs `tsc` before `vite build`. There is no separate root lint or formatter script.
- Start the root browser app with `npm run dev`; use `npm run preview` only after a build.
- Validate the declarative metaverse environment with `npm run environment:check`; run `npm run environment:build` to emit its manifest and build all browser rooms; run `npm run environment:run` to start the sibling metaverse-kit server/client (override its path with `METAVERSE_KIT_ROOT`).
- Validate the vault with `node wiki/tools/validate.mjs`.
- For Coq changes, run `make -C proofs proof-strict`; the Makefile enforces the proof registry before compiling and checking the listed modules.
- For JavaScript proof changes, source checks live in `proofs/js/catalog/`; run `make -C proofs js` for the checks and `make -C proofs js-docs` to regenerate `proofs/js/catalog.json`, `proofs/js-docs/`, and VM/Worker carriers. Keep checks that do not hold in `proofs/js/pending/`.

## Change boundaries

- Keep browser production code under the root TypeScript build's `src` boundary; `src/testbed`, `src/server.ts`, and `src/define.commands.ts` are excluded by `tsconfig.json` and are exercised separately or by direct Node usage.
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
