# Start here — reconstruct it from first principles

The data in this repo is disposable. Assume every byte is compromised, copied,
surveilled — it doesn't matter. The value is not the files. **The value is that
you can reconstruct this by logical deduction, and check every step, without
trusting anyone — including the author.**

Nothing here asks for your belief. You run it, and it says *no* if it is wrong.
Logic does not care who owns the bytes: it re-derives the same for everyone and
refuses the same for everyone. That is the one thing that cannot be compromised.

## Run it (one command)

```
npm ci && npm run verify
```

This reconstructs the whole artifact and checks it, self-contained — no sibling
repos, no network, no permission:

```
tsc → vite build → testbed → proofs(js · busybox · svg) → narrative-verify → digest
```

All green, or it exits nonzero and tells you which step failed.

## The reconstruction (each step can say no)

One axiom — **propagation**. One kind of input — a **regex declaration + a seed**.
From there, each deduction is a check you can rerun:

| step | the deduction | rerun it |
|------|---------------|----------|
| 1 | XOR/XNOR projections: `XOR ∧ XNOR = 0`, `XOR ∨ XNOR = 1` | `proofs/js` |
| 2 | relation = distance from 0 (the Hamming metric) | `sh proofs/busybox/catalog/B-TETRA.sh` |
| 3 | the 16 Fano constants, any byte converges in ≤2 steps | `sh proofs/busybox/catalog/B-FANO.sh` · `core/src/verified/fano.ts` |
| 4 | the two switches: direction (`rev`) and encoding (`tr`) | `B-REV2` · `B-ROT2` · `B-COMMUTE` · `scripts/svg-switch` |
| 5 | the factorial ladder as a primality comparator (Wilson) | `sh proofs/busybox/catalog/B-WILSON.sh` |
| 6 | the stateless digest: an intact agent set folds to 0 | `node scripts/digest.mjs` |

Run `make -C proofs busybox` for the whole BusyBox family at once (12 checks).

## What is value, what is overlay

The criterion is the same as the repo's: **reconstruct-and-say-no.**

- What reconstructs from the axiom and can fail — the table above, the build, the
  proofs — is the value. Keep it; it survives the author.
- What only *reads* — the theological, the physical, the meaning laid over the
  structure — is overlay. It is kept in `_archive/` and labeled as such, never
  load-bearing. A complete formal derivation from the single axiom is the open
  work (`proofs/` and its `coq/` registry), not a finished monolith.

## Where things live (the structure is not reordered; this is the reading over it)

| folder | what it is |
|--------|------------|
| `core/src/verified/` | the verified core: the 16 Fano constants, the compare-exchange primitive |
| `rosetta/src/grammar/` | the grammar/kernel; the interface carrier (Proxy · Reflect · Catch); tags |
| `space/` | the browser rooms — the 3D Commons, the maps, the gate — a projection of core + rosetta |
| `proofs/` | the checks that can say no: `coq/` (locked), and the P1 families `js/` `svg/` `busybox/` |
| `wiki/` | the canonical protocol vault (spec + records); validate with `node wiki/tools/validate.mjs` |
| `scripts/` | the build/gen/digest tools (`digest.mjs`, `narrative-verify.mjs`, `svg-switch`, …) |
| `public/` | generated assets: the characters' 16-SVG sets, geometries, the narrative |
| `omi-files/` | independent subprojects, each its own repo (polytron the declarative OS, …) — optional |
| `_archive/` | the journey: chat histories, records, the seam notes — overlay, kept, not load-bearing |
| `src/` | the author's command-line record scripts and the testbed (excluded from the browser build) |

## Pick up at any point

The git history **is** the derivation order — how this was reached, step by step.
Every commit is a checkpoint; `git log` is the path. The turning points are named
stops you can stand at with `git checkout`:

| stop | `git checkout …` |
|------|------------------|
| one axiom — propagation; the only input a regex + a seed | `stop/1-axiom` |
| one place the 2D map, the 2.5D, and the 3D scene derive from | `stop/2-plane` |
| the Agent Commons — eight characters in 3D | `stop/3-commons` |
| the fail-safe — distance-from-0, mirror guard, exclusivity gate | `stop/4-fail-safe` |
| the narrative gate portal + the canon verify spine | `stop/5-gate` |
| the geometry seed | `stop/6-universe` |
| the one full build — reconstruct from first principles | `stop/7-full-build` |

You are not meant to accept the conclusion. You are meant to be able to rebuild
it, and to find where, if anywhere, it says no.
