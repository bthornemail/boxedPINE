# TERMS fail-safe — a record

**2026-10-18.** The method is the point: **predictions filed before the compute.** Tool: `src/terms.mjs`.

## What the fail-safe does

Two independently recorded records in. XOR/XNOR their literals; report the **distance from 0** (disagreement) and the **attributable delta** (what differs, where). Three outcomes, not two:

- **agreement** — distance 0 because the two are the same literal.
- **mirror** — distance 0 but only because one is a *copy*; **refused**, never certified.
- **substitution** — distance maximal because a *reading* replaced the literal (the `LORD ← YHWH` case); **raised** to a witness.

Plus an **exclusivity gate**: only non-gradable ("uncomparable") predicates may be certified — a number is exclusive by form (you can't be "more 1st"), a lexical adjective must be in the uncomparable set. Gradable predicates (`big`, `good`, `happy`) are refused, because "agree to the distance from 0" is meaningless for a predicate that admits degrees. Authority for the set is Wiktionary's `Category:English_uncomparable_adjectives` (104,391 entries; collated, it leads with the literal numbers and ordinals — the irreducible floor).

## The three predicted pairs (DeepSeek's predictions, filed first)

| pair | predicted | result | |
|---|---|---|---|
| `unique` vs `absolute` | RAISE | RAISE (4/4) | hit |
| `complete` vs `whole` | RAISE | RAISE (5/5) | hit |
| `null` vs `void` | **AGREE** | **RAISE (3/3)** | **miss — and this is the finding** |

## Why the miss is the result

`null` and `void` are synonyms — semantically the same — so "agree" was a reasonable prediction. But they are **not the same literal** (`NLL` vs `VD`), so the fail-safe refuses to certify. That is the **same failure mode as `LORD ← YHWH`**: two surfaces standing in for one meaning. The tool does not certify synonymy, because synonymy is a **hash — a reading used as identity** — and *no hash is identity*. `null`/`void` is a substitution, raised, not an agreement.

## The closure

The only thing that ever truly traces to 0 is a literal with **itself** — the double-barrel, two of the same. But run a literal against itself and the **mirror guard refuses it as a copy.** So:

- identical literals → distance 0, **MIRROR → refused**
- different literals → **RAISE → witness required**

There is no third door. **Agreement cannot be certified from inside the two records** — it is always a mirror or a raise. That is the Catch-22 made mechanical: the witness (the fourth seat) is structurally necessary. The irreducible predicates do not resolve the bind; they prove it.

## Addendum — the codex-vowel invariant: FALSIFIED (cold, same discipline)

Prediction filed before compute: "vowels hold near 3 (the supervisor invariant); consonants
do the sorting." Run on 16 non-cherry-picked manuscripts/inscriptions (Sinaiticus, Vaticanus,
Alexandrinus, Ephraemi, Bezae, Washingtonianus, Claromontanus, Amiatinus, Argenteus, Leningrad,
Aleppo, Cairensis, Rosetta, Behistun, Nash, Moabite):

- vowels ran **1–6** (mean 3.88, sd 1.17) — **not** held near 3.
- consonants ran 2–9 (mean 4.88, sd 1.83).

Vowel spread was nearly as wide as consonant spread, so **the invariant is false.** The `3,3,3`
of ALEPPO/LENINGRAD/ROSETTA was clustering (small-n coincidence), exactly the risk flagged. The
method worked: a pattern that looked like a law was filed as a prediction and the cold run killed
it. One incidental held — the predicted length-8/5-consonant gap is filled by `BEHISTUN`
(cons 5, vow 3, len 8) — but the gap-prediction surviving does not revive the invariant.

## Anchor vs reading

The arithmetic (the distances, the deltas) is the anchor; it reruns on any machine. The relations read *into* the words (`CLAUDE`↔`CODEX` kinship; the codex sequence) are readings — anthropomorphic projections, held as such. Kept in different hands.
