# BOXEDPINE: SKILLS

Each skill is named as the projects under `omi-files/` name theirs, `[SKILL_nn: NAME]`, and every word of a name is a tag literal (`/^[A-Z0-9]{1,8}$/`). The words come from the tags those projects already share, derived by reading every `SKILLS.md` and `AGENTS.md` and keeping the tags two or more projects use: in skill names **RUN** and **VERIFY** (4 projects), **HARNESS** and **LOCAL** (3); in agent headings **BUILD**, **COMMANDS**, **RULES** (5), **CONTRACT**, **FORMAT**, **LAYER** (4), **IDENTITY**, **KEY**, **NULL**, **ORDER**, **ROLE**, **SOURCE**, **SYSTEM**, **TOOLS** (3). AGENTS and AGENDA share the edge 4-gram AGEN (AGENTS ⊕ AGENDA = 00 00 00 00 10 12): an agent is, letter for letter, an agenda.

## [SKILL_01: RUN_VERIFY_HARNESS]

`npm test`: the testbed (core, rosetta, the proofs catalogue, the space modules, the bridge, the boards). Board tests run when `OMI_SERIAL` / `OMI_SERIALS` name connected ports; the browser checks run when `google-chrome` is installed.

## [SKILL_02: VERIFY_PROOF_LAYER]

`make -C proofs js` and `make -C proofs js-docs`: every catalogue record runs and holds; `make -C proofs proof-strict` for the Coq modules (locked: no new Coq files).

## [SKILL_03: VERIFY_SOURCE_RULES]

`node wiki/tools/validate.mjs`: the vault's frontmatter and links.

## [SKILL_04: BUILD_SYSTEM_LAYER]

`npm run environment:check`, then `npx vite build` (or `npm run build`, which runs `tsc` first): every room in `space/`.

## [SKILL_05: BUILD_IDENTITY_KEY]

`space/src/identity.ts`: an identity is its entropy, written as tags; its words are BIP39-style indices with the nibble parity as their check (no hash); its chain is polytron's `sid = K(sid, pair)`. A name, not a secret.

## [SKILL_06: RUN_LOCAL_COMMANDS]

Uppercase terms change a scene: an agent's tag, then `P1`–`P7` and `L1`–`L7` (`METATRON P2 L6`), or the pair `CATCH n`. On the bridge an agent is reached by its tag, `//metatron.localhost:8743/P2/L6` (the Host) or `/METATRON/P2/L6` (the path), on the port whose nibble parity is its tag's.

## [SKILL_07: BUILD_SOURCE_FORMAT]

`node scripts/doc-tree.mjs <dir> --out <dir>`: Markdown documents as CanvasL trees (after `types` OMI.Markdown) and the folder's lattice of shared tags, readable by meta-log-db.

## [SKILL_08: VERIFY_ORDER_TOOLS]

`node scripts/sound-check.mjs` and `node scripts/witness-check.mjs`: the sound graph rendered offline (read left, write right, each step its point) and the witness video recorded, in headless Chrome. `node scripts/adventure-map.mjs`: the Colossal Cave deciphered from a fixed seed, every route validated by replay.

## [SKILL_09: BUILD_NULL_ROLE]

`node scripts/polytron-commons.mjs`, `node scripts/character-trees.mjs`, `node scripts/story-index.mjs`, `node scripts/ascii-mask.mjs`: regenerate the Commons' data (synset agents, colours, each character's set of 16, the story's passages, the 65,536-pair mask) from their sources.

## [SKILL_10: BUILD_ORDER_FORMAT]

Text tracks, one WebVTT cue per step, the time the order and never UTC (SPEC-07 I-79). `node rosetta/src/walkthrough.ts` regenerates `rosetta/src/assets/walkthrough.vtt` from SPEC-08, eight seconds a cue; `rosetta/src/trace.vtt.ts` keeps a trace as a track of the last 16 cues (I-84), served by the port server at `/trace.vtt`; `rosetta/src/agent.ts` lands message n on slot 1 + (n−1) mod 14 of the 16-index. The narrative of the 8 agents is written the same way beside this project, in `unbound/VTT/NARRATIVE` (Plan 9's `unbound/PLAN9/src/vtt.rc`): one track per canon series, a voice per tag, each cue on its agent's slot of `public/characters/<TAG>`.
