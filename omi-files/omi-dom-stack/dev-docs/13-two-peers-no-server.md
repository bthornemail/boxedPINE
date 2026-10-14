# 13 — Three Peers, No Server, No Clock

`shared/peers.js`, `shared/declare.js`, `client/portal.html` + `client/portal.js`.

The claim this has to earn, and can:

> Divergence detection and repair between two parties, with no central
> authority, no coordination, no clock, and no merge function.

It is possible because the metric and the displacement are the same object:

```
distance(A, B) = popcount(A XOR B)     how far apart
A XOR B                                 by how much
(A XOR B) XOR B == A                    and the inverse is free
```

Every other scheme pays for repair separately — vector clocks for ordering,
CRDTs for a merge, a server for truth. Here rollback is not an algorithm. It is
the same XOR that detected the divergence.

## What it deliberately does not do

XOR is commutative, so `a ^ b == b ^ a`. It measures the **magnitude** of a
divergence and never the **order** of two concurrent edits.

```
a=0b0011  b=0b1010
a^b = 9    b^a = 9    symmetric -> no ordering
```

So it is **not** a vector clock, not a Lamport clock, and it cannot replace one.
There is a self-test that asserts this boundary explicitly:

```js
assert('XOR is symmetric, so it cannot order two edits', (e1 ^ e2) === (e2 ^ e1));
```

The honest claim is the narrow one, and the narrow claim is still excellent:
**clocks exist in order to order events. If all you need is how far apart two
states are, and how to undo the difference, you need no clock at all.**

## Three peers: the residue IS the outlier

This is where the argument stops looking like a trick.

With **two** peers you learn the *magnitude* of a disagreement. With **three** you
also learn *which peer* is the odd one out, and it costs the same single XOR.

If exactly one peer has diverged and the other two agree, then the XOR of all
three **is** the outlier's value:

```
alice = 5   bob = 5   carol = 9

5 ^ 5 ^ 9  =  9  =  carol
```

The identity of the dissenter falls out of the algebra. There is no vote, no
quorum, no coordinator, and nothing to elect. In the browser:

```
carol goes offline
  the outlier is carol — and the fold 0x00000003 is carol's value.
  one XOR named the dissenter. no vote, no quorum.
```

### Two things `fold3` deliberately refuses to do

**It is not the agreement test.** Three copies of `x` fold to `x`, not to zero,
because three is odd:

```
alice = bob = carol = 0x1234
residue      = 0x1234   <- nonzero
disagreement = 0        <- but they all agree
```

So agreement is measured **pairwise**, summed, and is 0 if and only if all three
agree. Using the fold as the test would report unanimous agreement as a
disagreement. There is a test pinning this exact case.

**It does not pick a winner when there is no majority.** Three different values
have no majority, so `outliers` reports all three, `hasMajority` is false, and
`reconcile3` returns `stalled: true` and changes nothing. The portal says so
rather than inventing consensus:

```
three-way split
  no majority. three different values, so there is nothing to roll toward.
  refusing rather than picking a winner. residue 0x77777777.
```

The precondition on `residueIsOutlier` is stated rather than assumed: it holds
when there is exactly one outlier. With two or three dissenters the fold is no
longer any single peer's value, and the field reports `false` instead of
guessing.

`reconcile3` takes the report the user was shown, for the same reason `repair`
does, and reports a clobber rather than overwriting a peer that moved in between.
Every roll goes through `applyCas`, so the witness advances and a legitimate
repair is never mistaken for a tamper.


## Tamper evidence, for free

A peer's state is one word, and the peer keeps the XOR-fold of everything it has
ever published. An honest write goes through CAS and advances the fold. A write
that comes from behind the peer's back does not.

```js
t.write(0x11111111);   t.witness()  // state 0x11111111, attested 0x11111111, intact
t.tamper(0x22222222);  t.witness()  // state 0x22222222, attested 0x11111111, NOT intact
```

The check is `state === attested`, not `state === fold`. After two honest writes
`fold` is `a ^ b` and is not the state, so comparing against it would flag
ordinary editing as tampering. There is a test pinning exactly that case.

This is not a security primitive. It is a consequence of the state being one
word and of every sanctioned write passing one gate, which is why it costs
nothing and why it cannot be quietly rewritten.

## The clobber is reported, not hidden

Repair takes the report you already showed the user, because that is the real
shape of the interaction: you Read, they look at the number, they click Roll —
and in between, the peer may have moved.

```js
const stale = divergence(x, y);   // the report on screen
y.tamper(9);                     // the peer moved while they looked
repair(x, y, stale).clobbered    // true — and the write is not overwritten
```

The exchange is checked against the report's own observation, not a fresh read.
A fresh read would always succeed and would silently clobber. This was a real bug
during the build, and the test that caught it is in the file.

## The space, run as three exchanges

`0, 2, 1` — the original bind, asking three possibilities in the order that
makes them definable: `0` the origin, `2` the offset, `1` the unit. The extremes
first, because the middle is only definable once the extremes are known.

```js
exchange(0, 2, 1) ^ exchange(1, 0, 2) ^ exchange(2, 1, 0)
```

## The declarative syntax

`shared/declare.js` declares **arrangements, not meanings**. Every line names
peers and says which comparison to run. Nothing in it assigns a value to a point
or an order to two edits — that is the user's, and the file says so.

```
peer alice 0x00000000
peer bob   0x00000000
peer carol 0x00000000
link  alice bob
offline carol
edit carol 0x00000009
online carol
read  alice bob carol    # the fold IS the outlier
roll  alice bob carol    # roll every outlier to the majority
read  alice bob          # two peers: how far, and exactly which bytes
roll  alice bob          # apply the displacement already measured
bind                      # is this 0, 1, or 2?
```

`read` and `roll` take **two or three** peers. Two is magnitude and
displacement; three adds identity, because when two agree and one does not the
fold of all three *is* the outlier's value. A fourth peer is a structural
refusal, with its line number, like any other malformed line.

A number reads the same in all four radices — `0xF`, `0b1111`, `0o17`, `0d15` are
one number, and the file takes the radix as a *reading*, not a value. Zero is zero
in all four.

Two tiers, the same discipline as the space. A line that is not properly
structured is refused with a `DeclarationError` carrying the **1-based line
number**:

```js
parse('\n\nbad op here')   // DeclarationError at line 3, coordinate.line === 3
```

A line that is well formed but merely disagrees is a reading, and readings are
never refusals.

## The portal

`client/portal.html` — two panels, a distance readout, per-byte difference
markers, and the declarative panel.

It loads the real `shared/peers.js` and `shared/declare.js` over `/shared/*`
through a ~20 line CommonJS loader and runs them as they are. It does **not**
re-implement the engine in the page: a copy in the page would be a different
thing wearing the same name, and the whole point is that the demo runs the
tested code.

There is no server, no clock, and no state in `portal.js`. Every state change
goes through `Atomics.compareExchange` inside `peers.js`. The page only renders
what the XOR says.

### The front door

`/portal` is a route, and the site root links to it:

```
node server/server.js      →  http://localhost:8742/portal
```

The two-click demo is the first screen: the tagline, three peers, the
disagreement number, **carol goes offline** and **roll back**. Nothing competes
with it above the fold. The declarative panel is below, because it is real and
tested but it is not the argument.

A third button, **three-way split**, exists to show the refusal. Demonstrating
where the method says "I don't know" is worth more than another happy path.

## Memory mode, and what it was verified as

`peers.js` uses `SharedArrayBuffer` when available, so `compareExchange` is a
genuine atomic across the peer boundary.

**In this server's browser, it is available.** The server already sets
`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy:
require-corp` on every response (see the "CORS + cross-origin isolation" block in
`createServer`) — that was there before the portal, for the shared-universe gate.
So the portal is cross-origin isolated without any special-casing, and gets no
special-casing.

Verified in real Chrome, not assumed:

```
crossOriginIsolated: true
SAB available      : true
peer A mode        : shared
peer B mode        : shared
```

The full demo driven through DevTools Protocol on the real page, real click
handlers, no mocks:

```
--- click: split them ---
dist 15   xor 0x0BADF00E  ·  15 bits across 4 bytes  ·  0/1 cells agree
--- click: roll back ---
dist 0    agreement — xor is 0x00000000. the states are the same.
log: roll  applied the displacement 0x0BADF00E — bob 0x00000003 → 0x0BADF00D · AGREEMENT
```

Where `SAB` is genuinely absent — a page served without those headers, or a
non-browser host — the module degrades to `ArrayBuffer`: the arithmetic is
identical, the atomicity guarantee is not, and the portal says which mode it is
in rather than implying the stronger one. That fallback is a real property of the
module. The portal simply never takes it.

## Two bugs the browser found that Node could not

1. **`peers.divergence is not a function`.** The portal held the module in a
   container named `peers` and the module at `peers.peers`, so every call was
   `undefined`. `node --check` passed, the unit tests passed, and the page failed
   at runtime. Only driving the real page caught it.

2. **A legitimate repair read as a tamper.** `repair()` wrote through `cas()`,
   which bypasses the witness, so after a correct rollback the peer looked
   tampered. Worse, the check itself was wrong: it compared `state !== fold`, and
   after two honest writes `fold` is `a ^ b`, which is not the state, and nothing
   is wrong at all. The old check would have flagged ordinary editing as
   tampering, which makes the claim worthless.

   The fix is an exact invariant rather than a heuristic: the peer records
   `attested`, the last state that came through its own gate, and

   ```
   intact = (steps === 0) ? state === 0 : state === attested
   ```

   `repair()` now goes through the sanctioned gate (`applyCas`), so a legitimate
   rollback advances the attestation and stays clean. `fold` is kept and
   displayed as an invariant, and is explicitly **not** the tamper check. Both
   cases are pinned by tests, including the two-honest-writes case that the old
   check got wrong.

   After the fix, in the browser:

   ```
   witness  bob  state 0x0BADF00D  attested 0x0BADF00D  fold 0x0BADF00E  steps 3
   ```

   Note `fold 0x0BADF00E != state 0x0BADF00D`, and no tamper flag — correct,
   because the three writes cancelled. The old check would have cried wolf.

## Tests

| Module | Checks | Registered in |
|---|---|---|
| `shared/peers.js` | 42 | `package.json`, `final-test.sh`, `/api/bundle` |
| `shared/declare.js` | 36 | `package.json`, `final-test.sh`, `/api/bundle` |

Full gate: `npm test` green, `node test/inter-instance.test.js` 32/32.
