# 01 — The invariants: masks, parity, scope, fold

These are the load-bearing facts. Change any of them and the protocol breaks —
the wiki, hardware reference, and cross-version tests all assert them.

## The 13 canonical masks

`MASKS` (also `MASK` in client code, `EIGHT_FIXED` for the first eight):

```
0x00, 0xFF, 0x78, 0x87, 0x20, 0x80, 0xAA, 0x55, 0x27, 0xD8, 0xA0, 0x27, 0x07
```

(Note: 0x27 appears twice — at index 8 and index 11. This is observed, not
assumed-correct; there is an open thread about a 14th mask, see
[07-open-threads.md](07-open-threads.md), item "the 14th mask / double 0x27".)

## Parity extraction — the octant

```js
parity(byte, mask) = (byte ^ mask) >> 5   // 3 bits: an octant 0..7
```

Each mask partitions the 256 bytes into **8 groups of 32** — exactly one group
per octant. This is verified (`partitionCheck`, and `hardware-ref` vectors). It
means every byte, viewed through any mask, lands in exactly one octant → one
slot of the 8-slot ruler.

`cellParity(byte, mask) = ((byte ^ mask) >> 4) & 1` is the 4th bit — the cell
bit used in encode/decode envelopes.

## The four C0 scope separators (faces)

The project repurposes the four ASCII C0 separators as *scopes/faces*:

| Face   | Byte  | Name             | Role in pipeline | Transistor XOR |
|--------|-------|------------------|------------------|----------------|
| BOOT0  | 0x1C  | File Separator   | bind             | 5T             |
| BOOT1  | 0x1D  | Group Separator  | apply            | 6T             |
| SECURE | 0x1E  | Record Separator | eval             | 8T             |
| USER   | 0x1F  | Unit Separator   | digest           | 10T            |

**Key invariant:**

```
0x1C ^ 0x1D ^ 0x1E ^ 0x1F === 0x00
```

That exact equality is the *centroid gate* checked by the wiki compiler
(`wiki/meta-compile.js` reports `centroid.balanced`). The four faces XOR to
zero — the fold stays 0x0000 — because they are four "1 bits apart" codes.

(0x20 — space, the first printable after the C0s — is the *opening* of system
space; omi-lisp is said to emerge from the first 64 ASCII symbols with the
first 32 as kernel. Digits are 0x30–0x39. The full *user* alphabet is 72
seats — 20 numeric (10 digits × high/low) + 52 letter (26 × upper/lower) — the
signed base-36 doubling on the orthogonal tangent axes of 0000. See
[04-place-value-atomic.md](04-place-value-atomic.md).)

## Every mask partitions 256 into 8×32 — walkthrough of the fold

- A word starts as a byte.
- For rung i: parity is read, then `state ^= MASKS[i]`.
- After 13 rungs you reach `finalState`.
- Folding *all the masks in sequence* gives a net XOR (open thread: it equals
  `0x20` = `MASKS[4]`, per the observed "closure" in `omi.js`/C refs).

## The 3! = 6 ruler and its 8 slots

`ruler.js` / `ascii-table.js` build a **16-bit coordinate ruler** whose halves
have this structure:

| Index | Ruler slot            | Meaning                          |
|-------|-----------------------|----------------------------------|
| 0     | diagonal              | origin; XOR of all six           |
| 1     | size                  | the magnitude of the frame       |
| 2     | top                   | +y                                |
| 3     | bottom                | −y                                |
| 4     | right                 | +x                                |
| 5     | left                  | −x                                |
| 6     | forward               | +z                                |
| 7     | backward              | −z                                |

3! = 6 → the six orderings of the three spatial axes (bind/apply/eval are the
canonical six permutations the protocol knows). The `1.orthogonal` claim is the
invariant that three axes at 3! orderings always resolve to a fold of zero.

## Two clocks, cleanly separated

- `seed + epoch` — the *deterministic* reconstruction key (no clock needed).
- UTC — only a *join key* to seed the epoch handshake; it is never an authority.

## The verified number 33600

33,600 Hz is a *derived* marker: 60×560 = 70×480 = 33,600, and
33,600 ÷ 44,100 = 16/21. It is kept only as a label in the scope markers
(44,100 master / 33,600 derived). Arithmetic checks; the "real-world audio
crossover" story around it does **not** — it is not an audio standard at all.
Keep it as marker, not as fact.

Read on → [02-primitives.md](02-primitives.md).