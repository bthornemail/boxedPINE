# 07 — Open threads: observed, deliberately left unfixed

This project's source has a standing policy written into its own comments:

> observe, don't correct.

That means the codebase contains several *observed* numeric facts that look like
bugs but are preserved on purpose — they are the honest record of what the
protocol does, not failures to be patched. This file is the adjunct's shelf of
those residuals, kept so nobody "fixes" them by accident.

## 1. The 14th mask vs the double 0x27

`MASKS = [0x00, 0xFF, 0x78, 0x87, 0x20, 0x80, 0xAA, 0x55, 0x27, 0xD8, 0xA0, 0x27, 0x07]`

0x27 appears twice (index 8 and 11). A 14-mask candidate set
(`0x00, 0x55, 0xAA, ... 0x27, 0xD8, ...`) was floated; there is an invariant if
a 14th mask is added, but the 13-mask table with the double 0x27 is the
*served* table. Both wiki and hardware ref use 13. **Keep 13 as ground truth.**

## 2. Sequential XOR of the masks = 0x20, not 0x00

The instructions claim "XOR of all masks = 0x20" (the `0x20 = 0x80>>2` note) —
but a sequential fold actually leaves 0x20 because masks include 0x20 at slot 9.
Meanwhile the *closure* the wiki asserts is on the four **face masks**
(0x1C^0x1D^0x1E^0x1F = 0x00). The 13-mask net ≠ 0x00; this is real and
deliberate. The `0x20` in the fold is the space/opening-of-system glyph the
user told us about.

## 3. `decodeBase36` collides on case

A pasted canonical snippet decoded `a` → 10, colliding with `A` → 10. Correct
offset for lowercase is 61 (36..61), not 10. Alphabet is **72 seats** (20
numeric + 52 letter — the signed base-36 doubling), not 62/64.
**Not yet codified in a shared module** — see [#6].

## 4. `pAd5n` does not match its own grammar

`/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/` → `pAd5n` is 5 glyphs with no dot → no
match. The true canonical example is `pA.5n` (→ 5/10 → 1/2 under user reading).

## 5. The compareExchange dead-code bug (must fix when building the 0p module)

The pasted canonical reference did:
```js
Atomics.compareExchange(metricSharedBuffer, ...)   // compares THIS buffer
return new DataView(wordBuffer, ...)               // but returns ANOTHER buffer
```
The exchange touched one buffer and reported another → dead primitive. When the
0p/0n module is written, compareExchange and the returned word **must** share the
same underlying buffer (place-value world: same position, or the exchange
didn't happen).

## 6. No 0p module exists yet

`grep 0p|0n|pAd|0x0n` across the repo → hits only `hardware-ref.js:37` (`0n`
BigInt literal). The atomic grammar is specified in
[04-place-value-atomic.md](04-place-value-atomic.md) but **has no
`shared/0p-type.js`**. That is the intended next build: `parseAtomic`,
`word`/`atom`, `xor`/`swap`/`recover`, sync `selfTest()`, wired into npm test +
final-test.sh. (Design-doc stub lives in `docs/The 0p Literal - Canonical Type
Specification.md`, currently with the broken regexes — those were the subject of
the verification session.)

## 7. The endianness claim in the spec is wrong for little-endian hosts

An earlier spec draft asserted `bytes[0]` is the high byte. On an x86/ARM host
`Int8Array[0]` is the **low** byte (e.g. 0x00A5 read as `high=-91` → distance
23296). Any 0p word IO must read/write whole-word via DataView, endian-safe, and
document it.

## 8. 33,600 as "audio crossover" is a story, not a fact

44100 is a real audio master rate; 33,600 = 16/21 × 44100 and = 60×560 = 70×480
(arithmetic verified). The *narrative* that 33,600 is a physical crossover in
audio hardware is unsubstantiated — it is not among 44.1k/48k/32k rates. Keep
the number as a derived marker, not as a spec of the outside world.

## 9. Worker barrier & parallel engine are async

`npm test` silently skips async modules (`r.then` check): `parallel-engine` is
not covered by `npm test` (it IS covered by `final-test.sh`). `worker-barrier`
is async too — coverage asymmetry is known and accepted.

## 10. The observer phrase

"person, place, or thing that selects the pair of active 3! of any 3!" — the
outside observer picks which two of the six orderings are active. This phrasing
is from the user directly and is the intended framing for whatever UI describes
the observer role (it already shows in the agent world HUD).

## 11. `parallel-engine` SAB fallback

SharedArrayBuffer needs crossOriginIsolated flags; without them the engine
falls back to ArrayBuffer (single-process) and main-thread execution on worker
timeout. Tests pass on plain `node`. Known, documented, accepted.

## 12. ASCII "max Hamming separation" is overstated; Fano "max distance 2" is wrong

From the verification sweep (see [08-ascii-hamming.md](08-ascii-hamming.md)):
- Wikipedia's "positioned to maximize the Hamming distance" for essential
  control codes: the measured histogram of (0x01–0x06, 0x10, 0x16) is
  {d=1:7, d=2:12, d=3:8, d=4:1}. Min is still 1. It's "spread out," not maximal.
- DeepSeek's "Fano max distance = 2": measured max is **3** (pairs (1,6),(2,5),(3,4)).
- Digits: consecutive distance 1 EXCEPT 7→8 (0111→1000 nibble carry, d=4).

## 13. BigInt `0n` and literal `0p`

`0n` is already a real JS BigInt literal syntax — so the *type name* `0p`/`0n`
is textual philosophy, not runnable JS. In code, the aliases must be
`ZERO_P`, `ZERO_N` (or `0p_`/`0n_`) prefixed identifiers. Noted so the module
isn't accidentally written with syntax errors the user can't parse.

## What this means for the next build

None of these are bugs to fix today. #5 and #6 are *construction notes* for the
upcoming `shared/0p-type.js`. The rest are documentation boundaries: when
someone writes about 33,600 or the mask fold, label [verified] vs [story]. And
when quoting the Fano/ASCII/Hamming insight, use the *measured* table from
[08-ascii-hamming.md](08-ascii-hamming.md), not the LLM's rounding.