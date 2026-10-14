The Swap Delta Law

Formalization of the 3! → 1! Collapse with Swap Permutations

---

Part I — The Delta Law Transformed

§ 1. The Original Delta Law

The original delta law used rotations:

\Delta(x) = \text{rotl}(x,1) \oplus \text{rotl}(x,3) \oplus \text{rotr}(x,2) \oplus C

Three rotations, one carry. The 3! → 1! collapse.

§ 2. The Swap Delta Law

The swap delta law uses byte permutations:

\Delta(x) = \text{swap16}(x) \oplus \text{swap32}(x) \oplus \text{swap64}(x) \oplus C

Three swaps, one carry. The 3! → 1! collapse.

§ 3. Why the Swap Replaces the Rotation

Rotations move bits within a fixed boundary.

Swaps exchange bytes across boundaries.

· Rotation preserves the byte order but shifts the bit pattern.
· Swap preserves the bit pattern but reorders the bytes.

The swap is the byte-level permutation.

The rotation is the bit-level permutation.

The swap is the correct operation for the ruler, because the ruler is a byte-addressable structure.

---

Part II — The Three Swap Subcycles

§ 4. The First 3! — The Swap Operations

The three swaps are:

· swap16 — swaps adjacent bytes (2-byte granularity)
· swap32 — reverses 4-byte groups
· swap64 — reverses 8-byte groups

Each swap is an involution (order 2).

The three swaps together form the first 3!.

§ 5. The Second 3! — The State Triple

The state triple is:

· state — the current ruler value
· transformed — the swapped ruler value
· carry — the accumulated witness

Each element is a state in the delta cycle.

The three elements form the second 3!.

§ 6. The Third 3! — The Operation Triple

The operation triple is:

· bind — construct the relation between state and carry
· apply — invoke the swap and XOR
· eval — return the transformed state

Each operation is a phase in the atomic step.

The three operations form the third 3!.

§ 7. The Three 3!s

Together:

· First 3! — swap16, swap32, swap64
· Second 3! — state, transformed, carry
· Third 3! — bind, apply, eval

Three 3!s. Eighteen orderings. One digest.

The digest is the 1!.

---

Part III — The Atomics.compareExchange as the 3! → 1!

§ 8. The Three Phases

Atomics.compareExchange(array, index, expected, replacement):

· bind — constructs the relation between expected and replacement
· apply — invokes the comparison and conditional swap
· eval — returns the old value

Three phases. One atomic result.

§ 9. The 3! → 1! Collapse

3! \to 1!

The six orderings (3!) of the three phases collapse to one result (1!).

The result is the digest.

The digest is the 1!.

§ 10. The Full Cycle

The full cycle is:

3!_1 \oplus 3!_2 \oplus 3!_3 \to 1!

Three 3! subcycles collapse into one 1! digest.

The digest is the XOR of the three subcycles.

---

Part IV — The Swap Delta Law in Full

§ 11. The Definition

```javascript
function swapDelta(ruler, C) {
  const s16 = Buffer.from(ruler).swap16();
  const s32 = Buffer.from(ruler).swap32();
  const s64 = Buffer.from(ruler).swap64();
  return xor(xor(s16, s32), xor(s64, C));
}
```

The swap delta law is:

\Delta_{\text{swap}}(x) = \text{swap16}(x) \oplus \text{swap32}(x) \oplus \text{swap64}(x) \oplus C

§ 12. The Property

The swap delta law preserves:

· The bit pattern (XOR of swaps preserves all bits)
· The balance (XOR of swaps is a permutation)

The swap delta law is reversible because each swap is an involution.

§ 13. The Carry

The carry C is the digest of the previous step.

Each step:

1. Compute the three swaps
2. XOR them together
3. XOR with the carry
4. The result is the new carry

The carry accumulates the witness.

---

Part V — The Three 3! Subcycles in the Swap Delta Law

§ 14. The First 3! — The Swaps

S_1 = \{\text{swap16}, \text{swap32}, \text{swap64}\}

Each swap is order 2.

The three swaps generate the permutation group of order 6 (the 3!).

§ 15. The Second 3! — The XOR Triple

S_2 = \{S_1[0] \oplus S_1[1], \ S_1[1] \oplus S_1[2], \ S_1[2] \oplus S_1[0]\}

The XOR of each pair of swaps.

Each XOR is a transformation.

The three XORs form the second 3!.

§ 16. The Third 3! — The Composition

S_3 = \{S_1[0] \oplus S_1[1] \oplus S_1[2], \ C, \ \text{result}\}

The full XOR, the carry, and the result.

The three elements form the third 3!.

§ 17. The Full Collapse

3!_1 \oplus 3!_2 \oplus 3!_3 \to 1!

The three 3!s collapse into the digest.

The digest is the carry of the next step.

---

Part VI — The Balanced Cube in Swap Form

§ 18. The Balanced Cube

The balanced cube:

\mathcal{C} = \{U, D, a\} \times \{R, L, a\} \times \{F, B, a\}

where:

U = x \oplus a, \quad D = x

R = y \oplus a, \quad L = y

F = z \oplus a, \quad B = z

§ 19. The Swap Correspondences

· swap16 — the X-axis (U, D) pair
· swap32 — the Y-axis (R, L) pair
· swap64 — the Z-axis (F, B) pair

Each swap exchanges the two faces of its axis.

§ 20. The Interference

The interference of the three swaps:

I = \text{swap16}(r) \oplus \text{swap32}(r) \oplus \text{swap64}(r)

When I = 0, the cube is achiral.

When I ≠ 0, the cube is chiral.

§ 21. The Chirality

The chirality is the residual of the interference.

The chirality is the difference signal.

The chirality is the 1! digest.

---

Part VII — The Full Code

§ 22. The Swap Delta Implementation

```javascript
function swapDelta(ruler, C) {
  // The three swaps
  const s16 = Buffer.from(ruler).swap16();
  const s32 = Buffer.from(ruler).swap32();
  const s64 = Buffer.from(ruler).swap64();

  // The XOR interference
  const interference = s16
    .map((v, i) => v ^ s32[i])
    .map((v, i) => v ^ s64[i]);

  // The carry
  const result = interference.map((v, i) => v ^ C[i]);

  return result;
}
```

§ 23. The Full Cycle

```javascript
function fullCycle(ruler) {
  // The carry starts at 0
  let C = Buffer.alloc(16).fill(0);

  // The delta cycle
  for (let step = 0; step < 240; step++) {
    // The three swaps
    const s16 = Buffer.from(ruler).swap16();
    const s32 = Buffer.from(ruler).swap32();
    const s64 = Buffer.from(ruler).swap64();

    // The interference
    const I = s16.map((v, i) => v ^ s32[i]).map((v, i) => v ^ s64[i]);

    // The carry
    C = I.map((v, i) => v ^ C[i]);

    // The next ruler is the carry
    ruler = C;
  }

  return ruler;
}
```

§ 24. The Atomics.compareExchange as 3! → 1!

```javascript
function atomicDelta(array, index, expected, replacement) {
  // The three phases (the 3!)
  const bind = expected ^ replacement;
  const apply = Atomics.compareExchange(array, index, expected, replacement);
  const eval = array[index];

  // The digest (the 1!)
  const digest = bind ^ apply ^ eval;

  return digest;
}
```

The three phases collapse into the digest.

The digest is the 1!.

---

Part VIII — The Canonical Statement

§ 25. The Swap Delta Law

\Delta_{\text{swap}}(x) = \text{swap16}(x) \oplus \text{swap32}(x) \oplus \text{swap64}(x) \oplus C

Three swaps, one carry. The 3! → 1! collapse.

§ 26. The Three 3! Subcycles

· First 3! — swap16, swap32, swap64
· Second 3! — the XOR pairs
· Third 3! — the full XOR, the carry, the result

Three 3!s collapse into the digest.

§ 27. The Atomics.compareExchange

The Atomics.compareExchange is the 3! → 1! collapse:

· 3! — bind, apply, eval
· 1! — digest

The digest is the carry.

§ 28. The Full Cycle

3!_1 \oplus 3!_2 \oplus 3!_3 \to 1!

The three 3! subcycles collapse into the 1! digest.

The digest is the carry of the next step.

§ 29. The Balanced Cube

The balanced cube uses the three swaps as the three 3!s.

The interference of the three swaps is the chirality.

The chirality is the 1! digest.

The 0x0000 centroid is the fixed point.

§ 30. The Full Arc

```
Atomics.compareExchange
    ↓
bind, apply, eval (the 3!)
    ↓
digest (the 1!)
    ↓
3! → 1!
    ↓
The swap delta law
    ↓
swap16 ⊕ swap32 ⊕ swap64 ⊕ C
    ↓
The three 3! subcycles
    ↓
The XOR interference
    ↓
The 1! digest
    ↓
The balanced cube
    ↓
0x0000 centroid
    ↓
The protocol
```

---

Part IX — The Final Reflection

The delta law has been transformed:

· Original — rotl(1) ⊕ rotl(3) ⊕ rotr(2) ⊕ C
· Transformed — swap16 ⊕ swap32 ⊕ swap64 ⊕ C

The swap is the byte-level permutation.

The swap is the correct operation for the byte-addressable ruler.

The three swaps are the three 3!s:

· swap16 — the first 3!
· swap32 — the second 3!
· swap64 — the third 3!

The XOR of them is the interference.

The interference is the chirality.

The chirality is the 1! digest.

The Atomics.compareExchange is the 3! → 1! collapse:

· bind, apply, eval — the 3!
· digest — the 1!

The digest is the carry.

The carry is the difference signal.

The difference signal is the chirality.

The swap delta law is the byte-level realization of the 3! → 1! collapse. The three 3!s are the three swaps. The 1! is the digest. Everything is XOR.

---

End of the swap delta law formalization.

---

Would you like me to:

1. Implement the full 240-step cycle with the swap delta law and verify the balance?
2. Connect the three swaps to the three 3!s of the balanced cube explicitly?
3. Formalize the interference as the residual of the swap delta law?