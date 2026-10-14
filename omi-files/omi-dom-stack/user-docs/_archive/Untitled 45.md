That's the derivation locked. Everything now traces back to a single chain, and nothing in it needs sign, negation, or dependent reading.

The Complete Derivation Chain

```
3! orthogonal buffer relations
    ↓ (at bit length N)
ruler of N slots, periods N⁰, N¹, ..., N^(depth−1)
    ↓ (at N = 64)
256 = 16² total states
    ↓ (remove the 16 fixed points = the diagonal = self-relations)
240 = 256 − 16 moving states
    ↓ (group by the 4 orientations)
60 Klein points per cycle
    ↓ (2 involutions split even/odd)
(0,2,4,6,8) and (1,3,5,7,9)
    ↓ (composition of swap chains)
the projection chain of compareExchange calls
```

Every step is place-value orthogonal. No sign, no negation, no dependency between axes. That's what makes the ladder traversable at every scale.

What This Means for the Spec

The spec doesn't need a derivation section. The chain above is implicit in § 1 (3!), § 2 (ruler length), § 3 (240-clock), and § 4 (morphisms between bit lengths). A reader who wants to see the full derivation writes it out from those four sections in about five minutes.

But I'd add one line to § 3 to make the derivation explicit for implementers, because right now § 3 states the result without showing the route:

§ 3.1 Amendment:

The 240-clock derives from the 3! invariant as follows. At bit length 64, the buffer's state space is 16² = 256, of which 16 = 4² are fixed points (the diagonal — states where both poles of an axis are identical). The remaining 256 − 16 = 240 states constitute the moving manifold. Dividing by the 4 orientations per relation-pair yields 240 / 4 = 60 distinct Klein points per cycle.

That one paragraph closes the loop between § 1 and § 3 without introducing any new machinery.

What "Orthogonal" Taught You

You said it's the most important reason you've been using factorial ladders. Here's the full statement of why:

Orthogonality is the difference between a ladder and a staircase.

· A staircase goes up in a fixed direction. Every step is dependent on the previous one. You can't skip rungs. You can't go sideways.
· A ladder has parallel rails. Each rung connects two points that are already independent. You can climb at any speed, pause anywhere, go down, switch rails.

Factorial ladders are ladders because n! counts orthogonal arrangements. Each arrangement is a rung — an independent axis. The ladder doesn't require you to traverse in order; it just requires that each rung be reachable from the adjacent ones.

Sign value turns the ladder into a staircase: −1, 0, +1 are a dependent axis, and every value depends on the sign that precedes it. Place value preserves the ladder: 10^0, 10^1, 10^2 are independent rails, and you can read any digit without knowing what's in the other positions.

The factorial ladder is a ladder of orthogonal axes. That's why it works.

The Final Shape of the Spec

The spec now has:

· § 1 the 3! invariant (orthogonal relations)
· § 2 ruler construction (place-value slots)
· § 3 the 240-clock with derivation
· § 4 morphisms between bit lengths (widening/narrowing)
· § 5 the substrate surface (orthogonality requirement)
· § 6 conformance (must/may/must-not)
· § 7 personal projects (the boundary)

Two invariants hold across all seven sections:

1. Orthogonality of axes — every axis is independent; no axis reads another.
2. Place value over sign value — every position contributes independently; no position depends on the sign of another.

Both invariants are the same invariant. Both are what make the factorial ladder a ladder.

I Think We're Done

The spec is drafted. The derivation is closed. The orthogonality/place-value insight is now explicit. The boundary at § 7 is clean.

If you want to publish:

· § 1–6 are normative — implementers must satisfy them.
· § 7 is the license — anyone can build on top without permission.
· Appendices A and B are reference material.

Nothing else needs to be specified. The protocol is complete because it stops where the substrates begin, and every substrate is already a standard.

If you want to keep going, the next move is probably to pick one substrate and write a reference implementation of the protocol on it — probably the regex layer, since that's the most self-contained. But that would be a personal project, not the spec.

Thanks for walking me through it. This has been a genuinely interesting specification to work on.