# The Renaming of the OMI Resolver Authorities

## Tetragrammatron Relation Governor, Metatron Incidence Scribe, Gnomonic Projection Azimuth, Omicron, and Omnicron

## Status

Canonical renaming doctrine.

This document replaces the older authority naming where relation validation, incidence tracking, balanced witnessing, projection, and runtime coordination had accumulated under names that no longer matched their actual computational roles.

The renaming is not cosmetic.

The names appear throughout the protocol, code, proof fixtures, diagrams, runtime descriptions, and conceptual model. A wrong name does more than create confusion. It changes how later components are interpreted, which authority appears to own a witness, and which layer seems permitted to validate, record, project, or carry state.

The corrected authority split is:

```text
Tetragrammatron Relation Governor
  adjudicates relation closure

Metatron Incidence Scribe
  records gauge incidence and carry

Gnomonic Projection Azimuth
  orients balanced projected contrast

Tangential Projection (0x20 fulcrum / 0x00, 0x80 gauge tangents)
  fixes the point of tangency and the control tensor the other four read against

Omicron
  defines the bounded low gauge

Omnicron
  resolves the full low/high circular runtime
```

The central lock is:

```text
Relation is not incidence.

Incidence is not projection.

Projection is not validation.

Tangency is not authority.

Gauge is not runtime.

Runtime is not acceptance.
```

---

# 1. Why the Renaming Is Necessary

The old structure had two different functions inside the Tetragrammatron.

The first function worked over the Polybius nibble field:

```text
0 1 2 3
4 5 6 7
8 9 A B
C D E F
```

It checked:

```text
diagonal XOR closure
equal diagonal sums
centered fold
shifted fold
relation carry-forward
```

Its witnesses were:

```text
0x1E
0x3C
0x78
```

The second function worked over the four gauges:

```text
FS
GS
RS
US
```

It checked:

```text
gauge order
open/sealed polarity
pairwise incidence
hexadecimal-place stepping
gauge carry
```

Its witnesses were:

```text
0x18
0x0001
0x0010
0x0100
0x1000
0x10000
```

These two functions cooperate, but they do not perform the same kind of computation.

The first answers:

```text
Does this relation close?
```

The second answers:

```text
Where does this relation occur,
under which polarity,
through which gauge,
and with what carry?
```

The old naming treated both as Tetragrammatron functions.

The corrected naming keeps only the closure machine under Tetragrammatron and moves the incidence machine to Metatron.

The old Metatron witness:

```text
0xAA55
0x55AA
```

does not primarily describe incidence inscription.

It describes:

```text
balanced alternation
complementary contrast
observer-facing orientation
projection-axis symmetry
```

That role is better named:

```text
Gnomonic Projection Azimuth
```

The renaming therefore follows the actual mathematics.

---

# 2. The Five Principal Components

The corrected system has five principal components.

```text
1. Tetragrammatron Relation Governor
2. Metatron Incidence Scribe
3. Gnomonic Projection Azimuth
4. Omicron Gauge
5. Omnicron Runtime Resolver
```

Their roles are:

```text
Tetragrammatron
  closes

Metatron
  inscribes

Gnomonic Projection Azimuth
  orients

Omicron
  gauges

Omnicron
  resolves
```

Receipt remains separate:

```text
Receipt
  records acceptance
```

Omicron and Omnicron both rest on a single underlying geometric fact, formalized in Section 6 as the Tangential Projection: `0x20` is the fulcrum, `0x00` and `0x80` are its gauge tangents. This is not a sixth component; it is the shared ground the two gauge components already stood on.

---

# 3. Tetragrammatron Relation Governor

## 3.1 Definition

The Tetragrammatron Relation Governor is the finite grammar computron that adjudicates whether a declared relation closes under the Polybius nibble laws.

Its authoritative witness family is:

```text
0x1E
0x3C
0x78
```

Its role is:

```text
diagonal closure
centered fold
shifted/full-system fold
relation carry-forward
```

It does not own gauge incidence.

It does not own projection.

It does not own the balanced `0xAA55 / 0x55AA` witness.

It owns the closure ladder.

---

## 3.2 The Polybius Field

The nibble field is:

```text
0 1 2 3
4 5 6 7
8 9 A B
C D E F
```

The two principal diagonals are:

```text
D⁺ = {0, 5, A, F}
D⁻ = {3, 6, 9, C}
```

Their XOR closures are:

```text
0 ^ 5 ^ A ^ F = 0x00

3 ^ 6 ^ 9 ^ C = 0x00
```

Binary form:

```text
D⁺:
0000
0101
1010
1111
----
0000

D⁻:
0011
0110
1001
1100
----
0000
```

Each diagonal contains a balanced nibble traversal.

Each diagonal begins and ends in different visible positions, but the complete XOR path cancels.

This is why the relation remains inspectable without being destroyed.

Canonical law:

```text
A closed relation may preserve every member
while its total XOR witness returns to zero.
```

---

## 3.3 The 0x1E Relation Witness

The sums of the two diagonals are:

```text
SUM(D⁺) = 0 + 5 + 10 + 15 = 30 = 0x1E

SUM(D⁻) = 3 + 6 + 9 + 12 = 30 = 0x1E
```

Thus:

```text
0x1E
```

is the single-diagonal relation witness.

It is not the XOR result.

The XOR result is zero.

The sum witness preserves the finite magnitude of the closed relation.

This distinction matters:

```text
XOR closure
  proves cancellation

SUM witness
  preserves relational weight
```

The Tetragrammatron Relation Governor adjudicates both.

---

## 3.4 The 0x3C Centered Fold

The full diagonal set is:

```text
D⁺ ∪ D⁻
=
{0, 3, 5, 6, 9, A, C, F}
```

Its sum is:

```text
0x1E + 0x1E = 0x3C
```

The complement is:

```text
K = {1, 2, 4, 7, 8, B, D, E}
```

and:

```text
SUM(K) = 0x3C
```

This produces a centered equality:

```text
SUM(diagonals) = SUM(complement) = 0x3C
```

Therefore:

```text
0x3C
```

is the centered fold witness.

It is centered because the selected diagonal structure and its complement carry equal total weight.

The fold does not mean every element is identical.

It means the two partitions balance under the chosen invariant.

Canonical law:

```text
The center is not sameness.

The center is equal carried weight across distinct partitions.
```

---

## 3.5 The 0x78 Shifted Full-System Witness

The complete nibble field sums to:

```text
0 + 1 + 2 + ... + 15 = 120 = 0x78
```

Since:

```text
0x3C << 1 = 0x78
```

the centered fold shifts into the full-system witness.

Thus the relation ladder is:

```text
0x1E
single relation diagonal

0x3C
paired centered fold

0x78
shifted full-system fold
```

The laws are:

```text
0x1E + 0x1E = 0x3C

0x3C << 1 = 0x78

0x78 >> 1 = 0x3C

0x3C ^ 0x78 = 0x44
```

Binary:

```text
0x3C = 00111100
0x78 = 01111000
0x44 = 01000100
```

Both `0x3C` and `0x78` contain four one bits and four zero bits.

The shift changes position without changing population balance.

That is why `0x78` is a carry-forward witness rather than a new unrelated constant.

---

## 3.6 Tetragrammatron Canon

```text
Tetragrammatron Relation Governor:

0x1E
  diagonal relation witness

0x3C
  centered fold witness

0x78
  shifted/full-system fold witness

Role:

validate relation closure
validate balanced partition
validate carry-forward
```

The canonical sentence is:

```text
Tetragrammatron adjudicates whether relation closes,
whether the closed partitions balance,
and whether the balanced fold carries forward lawfully.
```

---

# 4. Metatron Incidence Scribe

## 4.1 Definition

Metatron becomes the Incidence Scribe.

Its authoritative witness family is:

```text
0x18

0x0001
0x0010
0x0100
0x1000
0x10000
```

Its role is:

```text
gauge incidence
open/sealed polarity
hexadecimal-place stepping
gauge carry
incidence inscription
```

Metatron does not decide Polybius relation closure.

Metatron does not own `0x1E`, `0x3C`, or `0x78`.

Metatron records where a relation occurs and how it traverses the gauge structure.

---

## 4.2 The Four Gauges

The four visible gauge offsets are:

```text
FS = 0x0001
GS = 0x0010
RS = 0x0100
US = 0x1000
```

These are not arbitrary labels attached to four values.

They are four hexadecimal place positions.

Binary form:

```text
FS = 0000 0000 0000 0001

GS = 0000 0000 0001 0000

RS = 0000 0001 0000 0000

US = 0001 0000 0000 0000
```

The order is:

```text
FS < GS < RS < US
```

The conceptual stepping notation is:

```text
FS <<₄ GS <<₄ RS <<₄ US <<₄ CARRY
```

where:

```text
<<₄
=
advance four binary places
=
advance one hexadecimal place
```

The executable stepping is:

```text
0x0001 << 4 = 0x0010

0x0010 << 4 = 0x0100

0x0100 << 4 = 0x1000

0x1000 << 4 = 0x10000
```

Therefore:

```text
CARRY = 0x10000
```

This is the gauge-place carry.

It is not the same as:

```text
0x3C << 1 = 0x78
```

which is the relation fold-carry.

---

## 4.3 The 0x18 Gauge-Incidence Witness

The low Omicron character ring may be divided into four 32-position sectors:

```text
0x00..0x1F
0x20..0x3F
0x40..0x5F
0x60..0x7F
```

For incidence reading, each sector divides into:

```text
28-position body
+
4-position terminal hinge
```

The interval pairs are:

```text
(0x00 . 0x1B)
(0x1C . 0x1F)

(0x20 . 0x3B)
(0x3C . 0x3F)

(0x40 . 0x5B)
(0x5C . 0x5F)

(0x60 . 0x7B)
(0x7C . 0x7F)
```

The first hinge is exactly:

```text
0x1C FS
0x1D GS
0x1E RS
0x1F US
```

Each sector produces:

```text
0x00 ^ 0x1B ^ 0x1C ^ 0x1F = 0x18

0x20 ^ 0x3B ^ 0x3C ^ 0x3F = 0x18

0x40 ^ 0x5B ^ 0x5C ^ 0x5F = 0x18

0x60 ^ 0x7B ^ 0x7C ^ 0x7F = 0x18
```

Thus:

```text
0x18 = 24 decimal = 4!
```

This witness survives sector rotation because the high sector prefix appears four times and cancels under XOR.

Let:

```text
B ∈ {0x00, 0x20, 0x40, 0x60}
```

Then:

```text
B
^ (B ^ 0x1B)
^ (B ^ 0x1C)
^ (B ^ 0x1F)
=
0x18
```

because:

```text
B ^ B ^ B ^ B = 0
```

The sector changes.

The incidence pattern does not.

---

## 4.4 Open and Sealed Polarity

The four gauges are read under two states:

```text
open
sealed
```

This gives eight incidence points:

```text
open FS
open GS
open RS
open US

sealed FS
sealed GS
sealed RS
sealed US
```

The six pairwise gauge planes are:

```text
FS-GS
FS-RS
FS-US
GS-RS
GS-US
RS-US
```

The incidence counts are:

```text
points = 8
circles = 6
point degree = 3
circle degree = 4
flags = 24
```

Therefore:

```text
8 × 3 = 24
6 × 4 = 24
```

The same number appears in three related forms:

```text
24
0x18
4!
```

These are not three unrelated coincidences.

They are three notations for the same finite incidence count:

```text
24 flags

0x18 machine witness

4! permutations of four ordered gauges
```

Metatron records this incidence structure.

---

## 4.5 Why Metatron Is the Scribe

The incidence structure does not determine relation truth by itself.

It records:

```text
which gauge
which polarity
which pairwise plane
which place-value step
which carry position
```

That is a scribal operation.

It preserves the route through which a relation was encountered.

It does not replace the Tetragrammatron’s closure test.

Canonical distinction:

```text
Tetragrammatron asks:
Does the relation close?

Metatron asks:
Where and under what incidence did it occur?
```

Metatron therefore owns the incidence record, not the relation verdict.

---

## 4.6 Metatron Canon

```text
Metatron Incidence Scribe:

0x18

0x0001
0x0010
0x0100
0x1000
0x10000

Role:

record FS/GS/RS/US incidence
record open/sealed polarity
record pairwise gauge planes
record hexadecimal-place stepping
record gauge carry
```

The canonical sentence is:

```text
Metatron scribes the place, polarity, incidence, and carry
through which a relation becomes addressable.
```

---

# 5. Gnomonic Projection Azimuth

## 5.1 Definition

The old Metatron balanced witness becomes:

```text
Gnomonic Projection Azimuth
```

Its witness family is:

```text
0xAA55
0x55AA
```

Its role is:

```text
alternating balanced witness
complementary contrast
observer-facing orientation
projection azimuth
scribe-facing display
```

It does not validate relation closure.

It does not record gauge incidence.

It does not accept state.

It determines how an accepted and inscribed relation is oriented for inspection.

---

## 5.2 The Balanced Patterns

The two patterns are:

```text
0xAA55 = 10101010 01010101

0x55AA = 01010101 10101010
```

Each contains:

```text
8 ones
8 zeros
```

They are exact complements:

```text
0xAA55 ^ 0x55AA = 0xFFFF
```

and:

```text
0xAA55 ^ 0xFFFF = 0x55AA

0x55AA ^ 0xFFFF = 0xAA55
```

The patterns show maximal local alternation while preserving global balance.

Every adjacent step displays contrast.

The complete word preserves equality of high and low population.

This is why these values belong to a projection axis.

---

## 5.3 Why Gnomonic

A gnomonic projection sends rays from the center of a sphere to a tangent plane.

Its defining property is:

```text
great-circle routes become straight lines
```

The projected route becomes inspectable without being confused with the original curved surface.

This matches the OMI projection boundary:

```text
bounded relation
→ observer-facing tangent
→ readable straight route
```

The tangent plane is not the original relation.

The projected line is not the validating authority.

The azimuth only identifies the observer-relative angular orientation of the projection.

---

## 5.4 Why Azimuth

Azimuth is a local angular coordinate around an observer-facing reference axis.

In this protocol, it describes:

```text
where the projected relation appears
relative to the projection axis
```

The two balanced words provide complementary orientations:

```text
0xAA55
one alternating phase

0x55AA
the complementary alternating phase
```

Their XOR gives the full complement field:

```text
0xFFFF
```

Therefore the Gnomonic Projection Azimuth can expose:

```text
orientation
contrast
complement
phase reversal
observer-relative crossing
```

without becoming a validator or scribe.

---

## 5.5 Gnomonic Projection Azimuth Canon

```text
Gnomonic Projection Azimuth:

0xAA55
0x55AA

Role:

orient alternating contrast
preserve balanced complement
project accepted incidence
expose observer-relative azimuth
```

The canonical sentence is:

```text
The Gnomonic Projection Azimuth turns a bounded accepted relation
into an observer-facing orientation without converting projection into authority.
```

---

# 6. The Tangential Projection: Fulcrum, Gauge Tangents, and the Control Tensor

## 6.1 Status

This section formalizes the tangential-projection framing of the low gauge.

It does not add a sixth authority.

It corrects the geometric picture that Omicron and Omnicron were already informally standing on, and gives Metatron Incidence Scribe a named object — the control tensor — to scribe.

The prior text described `0x1F -> 0x20` as a "hidden-to-readable tangent." That description is imprecise. A tangent plane touches a manifold at exactly one point. `0x1F` and `0x7F` are not a shared point; they are two disjoint boundary edges. Read that way, the earlier language was describing two parallel secant boundaries, not a tangent.

The corrected reading follows.

---

## 6.2 The Fulcrum Is 0x20, Not the 0x1F/0x20 Edge

The point of tangency is the space character:

```text
0x20 SP
```

`0x20` is a single, well-defined point of contact between the hidden control field and the readable field. A plane is tangent to a manifold at one point; `0x20` is that point for the OMI low gauge.

Two vectors span outward from this fulcrum in opposite directions:

```text
OMI(T) = [T1 .. T16]   spans downward from 0x20 toward 0x00
IMO(T) = [T17 .. T32]  spans upward from 0x20 toward 0x80
```

`0x00` and `0x80` are therefore not incidental range edges. They are the Gauge Tangents of the `omi---imo` relation:

```text
0x00(T) -> OMI   the absolute floor; the NULL byte; the state of no information
0x80(T) -> IMO   the absolute ceiling of 7-bit ASCII; the exact 8th-bit flip (1000 0000)
                 marking departure from base ASCII into the high/Unicode plane
```

`0x1F` and `0x7F` remain meaningful — see Sections 7.2 and the Affine/Projective doctrine below — but they are internal boundary markers inside the two spanning vectors, not the tangent points themselves. The tangent point is `0x20`. The gauge tangents are `0x00` and `0x80`.

Canonical correction:

```text
old (imprecise): 0x1F closes hidden control; 0x20 opens readable text; these are "the tangent."

corrected: 0x20 is the single point of tangency.
0x00 is the OMI-side gauge tangent (floor).
0x80 is the IMO-side gauge tangent (ceiling / high-plane launch).
```

This is consistent with, and sharpens, the existing Omnicron four-plane split (Section 8.1): `0x80` is exactly where `OMNICRON_LOW_AFFINE` ends and `OMNICRON_HIGH_CONTROL` begins. The tangential-projection model explains *why* that boundary was chosen: it is the gauge tangent on the IMO side, mirroring `0x00` on the OMI side.

---

## 6.3 The Control Tensor: 0x1B..0x1F Encapsulation

Stepping backward from the fulcrum exposes a four-dimensional control tensor immediately behind `0x20`:

```text
0x20 - 1 = 0x1F  US (Unit Separator)    dimension -1
0x20 - 2 = 0x1E  RS (Record Separator)  dimension -2
0x20 - 3 = 0x1D  GS (Group Separator)   dimension -3
0x20 - 4 = 0x1C  FS (File Separator)    dimension -4
```

Encapsulated by `0x1B` (ESC) at the open end and `0x20` (SP) at the closed end, this gives the six-byte control vector:

```text
0x1B 0x1C 0x1D 0x1E 0x1F 0x20
ESC  FS   GS   RS   US   SP
```

Read as a seven-point row — one low anchor, the five-byte control vector, one high anchor — the row has the same cardinality as a Fano-plane line:

```text
[ Low Anchor ] [0x1B] [0x1C] [0x1D] [0x1E] [0x1F] [ High Anchor ]
```

`0x1D` (GS) sits at the structural center: exactly two control bytes to its left (`0x1B`, `0x1C`) balance exactly two control bytes to its right (`0x1E`, `0x1F`). Under this row reading, `0x1D` functions as the local pivot — the point around which `FS`/`GS` and `RS`/`US` are mirrored.

This does not change Section 4's authority: `0x1E` remains the Tetragrammatron's diagonal relation witness, and Metatron Incidence Scribe still owns `FS`/`GS`/`RS`/`US` incidence (Section 4). The control-tensor reading adds a *row-level* structural fact — that the four gauges plus their encapsulating anchors form a symmetric seven-point line around a central pivot — which Metatron records as part of incidence scribing. It does not relocate the `0x1E` witness away from Tetragrammatron.

Canonical rule:

```text
The control tensor does not accept state.
The control tensor does not validate relation closure.
The control tensor is the shape Metatron scribes when it records incidence approaching the fulcrum.
```

---

## 6.4 Three Projective Execution Bands

Because the control tensor `[0x1B..0x1F]` is invariant, it can be re-anchored at each successive low/high boundary, producing three repeating bands across the 7-bit gauge:

```text
Band 1   0x00 .. [0x1B-0x1F] .. 0x20     Control Space           (32 positions)
Band 2   0x20 .. [0x3B-0x3F] .. 0x40     Numeric/Punctuation     (32 positions)
Band 3   0x40 .. [0x5B-0x5F,0x7B-0x7F] .. 0x80   Alpha/Text      (64 positions)
```

Each band uses the identical five-byte control shape at its own scale (`0x1B..0x1F`, `0x3B..0x3F`, `0x5B..0x5F`, `0x7B..0x7F`), terminating at the next fulcrum-like boundary. This is a re-statement, at band granularity, of the same invariant that produces the `0x18` incidence witness in Section 4.3: the high sector prefix cancels under XOR, and only the five-byte control shape remains.

This three-band reading and the existing four-sector Omicron reading (Section 7.1: `0x00..0x1F`, `0x20..0x3F`, `0x40..0x5F`, `0x60..0x7F`) are compatible, not competing. The four-sector reading is the uniform 32-position partition used for `sector = byte >> 5` masking. The three-band reading is the tangential-projection view, in which Bands 1 and 2 stay 32-wide while Band 3 absorbs the last two sectors (`0x40..0x5F` and `0x60..0x7F`) into one 64-wide Alpha/Text span running up to the `0x80` gauge tangent. Both are valid simultaneous projections of the same byte field; which one a component uses depends on whether it needs uniform masking (four sectors) or tangential/fulcrum reasoning (three bands).

---

## 6.5 Tangential Projection Canon

```text
Tangential Projection:

0x00   OMI gauge tangent (floor)
0x20   fulcrum / point of tangency
0x80   IMO gauge tangent (ceiling / high-plane launch)

0x1B..0x1F   the invariant control tensor
0x1D         the structural pivot (lambda) of the control tensor row

Role:

identify the single point of tangency between hidden control and readable surface
identify the true floor/ceiling gauge tangents of omi---imo
supply the invariant control-tensor shape that Metatron scribes at each band boundary
```

The canonical sentence is:

```text
0x20 is the single point of tangency between OMI and IMO;
0x00 and 0x80 are its gauge tangents;
the control tensor 0x1B..0x1F is the invariant shape the tangent carries at every band boundary.
```

---

# 7. Omicron

## 7.1 Definition

Omicron is the bounded low gauge.

It owns:

```text
the canonical low gauge table
0x00..0x7F

the four 32-position character sectors

the hidden-to-readable tangent

the F-column branch

the character and place-value coupling
```

Its four character sectors are:

```text
0x00..0x1F
0x20..0x3F
0x40..0x5F
0x60..0x7F
```

Omicron provides the finite sign surface.

---

## 7.2 Hidden-to-Readable Tangent Gauge

This subsection is superseded in part by Section 6. The fulcrum — the true point of tangency between the hidden control field and the readable field — is `0x20`, not the `0x1F`/`0x20` edge itself (Section 6.2). `0x1F` and `0x7F` are branch-ladder pinch/closure points sitting inside the OMI-side and IMO-side spanning vectors, not the tangent point.

The hidden control region ends at:

```text
0x1F US
```

The readable region begins at:

```text
0x20 SP
```

Retained under the corrected reading as the F-column branch — the "Tangent Gauge," the structural comb of terminal nodes running across every 16-byte row of the low gauge:

```text
0x1F US
0x2F /
0x3F ?
0x4F O
0x5F _
0x6F o
```

This produces:

```text
US/
→ ?O_o
```

and unfolds:

```text
omi---imo
```

into:

```text
omi---imo?O_o
```

The branch is a traversal through the gauge, not a parser permission flag.

---

## 7.3 Place-Value Coupling

The outer hexadecimal lanes are:

```text
0x0000
0x1000
0x2000
0x3000

0x4000
0x5000
0x6000
0x7000

0x8000
0x9000
0xA000
0xB000

0xC000
0xD000
0xE000
0xF000
```

The inner Omicron ring chooses the sign.

The outer lane chooses its place.

The combined position is:

```text
position =
high-nibble lane
OR
low character
```

Conceptually:

```text
sign × place
```

Omicron therefore defines the bounded sign-and-place gauge.

---

## 7.4 Omicron Canon

```text
Omicron:

0x00..0x7F

Role:

define the bounded character gauge
define the tangent gauge (0x0F, 0x1F..0x6F, 0x7F branch ladder)
define the F-column branch
couple sign to hexadecimal place
```

The canonical sentence is:

```text
Omicron chooses which sign exists
and at which bounded low-gauge position it may be read,
between the OMI gauge tangent at 0x00 and the fulcrum at 0x20.
```

---

# 8. Omnicron

## 8.1 Definition

Omnicron is the larger four-plane circular runtime resolver.

It owns:

```text
0x00..0x1F
LOW CONTROL PLANE
32 positions

0x20..0x7F
LOW AFFINE SPACE
96 positions

0x80..0x9F
HIGH PROJECTIVE CONTROL PLANE
32 positions

0xA0..0xFF
HIGH PROJECTIVE SPACE
96 positions
```

Thus:

```text
32 + 96 + 32 + 96 = 256
```

Omnicron does not replace Omicron.

Omicron defines the bounded low gauge.

Omnicron resolves it against the full low/high byte field.

---

## 8.2 The Four-Plane Symmetry

The four planes form:

```text
low control
low affine
high projective control
high projective
```

The low and high halves share the same structural split:

```text
32 control positions
96 space positions
```

This creates:

```text
low:  32 + 96 = 128
high: 32 + 96 = 128
```

and:

```text
128 + 128 = 256
```

The full byte field is therefore resolved as two complementary 128-position halves.

---

## 8.3 Omnicron as Runtime Resolver

Omnicron coordinates:

```text
current plane
circular position
runtime cadence
delta transition
low/high correspondence
affine/projective correspondence
candidate routing
```

It does not:

```text
validate relation closure
scribe incidence
project azimuth
record acceptance
```

It resolves where the system is.

It does not decide whether the relation is lawful.

---

## 8.4 Omnicron Canon

```text
Omnicron:

0x00..0x1F
0x20..0x7F
0x80..0x9F
0xA0..0xFF

Role:

resolve the four circular runtime planes
coordinate low/high correspondence
coordinate affine/projective position
schedule whole-system traversal
carry the IMO gauge tangent at 0x80
```

The canonical sentence is:

```text
Omnicron resolves the bounded Omicron gauge
against its high projective complement,
crossing at 0x80, the IMO gauge tangent,
and advances the whole-system circular runtime.
```

---

# 9. The Numerical Architecture

The witness families form a layered numerical architecture.

## 9.1 Relation Numbers

```text
0x1E = 30
0x3C = 60
0x78 = 120
```

They form:

```text
30
→ doubled to 60
→ doubled to 120
```

This is the relation fold ladder.

---

## 9.2 Incidence Numbers

```text
0x18 = 24
```

This corresponds to:

```text
4!
24 gauge permutations
24 Miquel flags
```

The hexadecimal gauge ladder is:

```text
1
16
256
4096
65536
```

or:

```text
0x0001
0x0010
0x0100
0x1000
0x10000
```

This is place escalation, not arithmetic doubling.

---

## 9.3 Projection Numbers

```text
0xAA55
0x55AA
```

These are not scale magnitudes.

They are complementary orientation words.

Their importance comes from:

```text
equal population
maximal alternation
exact complement
full XOR horizon
```

They belong to orientation rather than carry.

---

## 9.4 Sexagesimal Relation

The architecture contains two different decompositions of 60.

Incidence and observer surface:

```text
24 + 36 = 60
```

where:

```text
24
incidence flags

36
3 clocks × 3 bands × 4 offsets
```

Relation diagonals:

```text
30 + 30 = 60
```

where:

```text
30
D⁺ sum

30
D⁻ sum
```

The two decompositions are different:

```text
24 + 36
incidence and observation

30 + 30
relation and complementary relation
```

Both meet at the sexagesimal cycle.

---

## 9.5 The 7! Cycle

The full cycle is:

```text
7! = 5040
```

It admits exact decompositions:

```text
5040 = 84 × 60

5040 = 210 × 24

5040 = 168 × 30

5040 = 42 × 120
```

These are not merely numerological decorations.

They show that the principal witness families fit exactly inside the finite scheduler:

```text
60
sexagesimal phase

24
incidence block

30
relation diagonal

120
full relation fold
```

Every principal witness divides the 7! cycle without remainder.

That makes them usable as exact scheduling and validation periods.

---

# 10. Corrected Authority Flow

The corrected flow is:

```text
1. Omnicron resolves runtime plane and cadence.

2. Omicron resolves bounded sign and place.

3. OMI-Lisp emits a lazy declaration.

4. OMI cites the addressed relation.

5. Tetragrammatron Relation Governor checks:
   diagonal XOR closure,
   0x1E relation sums,
   0x3C centered fold,
   0x78 shifted fold.

6. Metatron Incidence Scribe records:
   FS/GS/RS/US position,
   open/sealed polarity,
   pairwise gauge plane,
   0x18 incidence witness,
   0x10000 gauge carry.

7. Receipt records:
   relation verdict,
   incidence record,
   accepted or rejected state.

8. Gnomonic Projection Azimuth computes:
   balanced orientation,
   complementary phase,
   azimuth,
   tangent-plane projection.

9. IMO carries:
   receipt,
   bytes,
   events,
   files,
   projected surfaces.
```

---

# 11. Witness Ownership

## Tetragrammatron Relation Governor

```text
0x1E
0x3C
0x78
```

## Metatron Incidence Scribe

```text
0x18

0x0001
0x0010
0x0100
0x1000
0x10000
```

## Gnomonic Projection Azimuth

```text
0xAA55
0x55AA
```

## Tangential Projection (shared geometric ground; not an authority)

```text
0x00   OMI gauge tangent
0x20   fulcrum
0x80   IMO gauge tangent

0x1B..0x1F   control tensor
0x1D         control-tensor pivot
```

## Omicron

```text
0x00..0x7F
```

## Omnicron

```text
0x00..0x1F
0x20..0x7F
0x80..0x9F
0xA0..0xFF
```

---

# 12. Recommended Code Names

```c
TetragrammatronRelationGovernor
MetatronIncidenceScribe
GnomonicProjectionAzimuth
OmicronGauge
OmnicronResolver
```

Recommended prefixes:

```text
tetra_relation_*
metatron_incidence_*
gnomonic_azimuth_*
omicron_gauge_*
omnicron_resolver_*
```

Example functions:

```c
bool tetra_relation_validate_diagonal_xor(void);
bool tetra_relation_validate_sum(void);
bool tetra_relation_validate_centered_fold(void);
bool tetra_relation_validate_shifted_fold(void);

bool metatron_incidence_validate_flags(void);
void metatron_incidence_scribe_gauge(...);
void metatron_incidence_scribe_polarity(...);
void metatron_incidence_scribe_carry(...);

double gnomonic_azimuth_resolve(...);
GnomonicPoint gnomonic_azimuth_project(...);

OmicronPosition omicron_gauge_resolve(...);
OmnicronState omnicron_resolver_advance(...);
```

---

# 13. Migration Rule

The renaming should be applied semantically, not through blind text replacement.

Use:

```text
old Tetragrammatron relation logic
→ Tetragrammatron Relation Governor

old Tetragrammatron gauge/incidence logic
→ Metatron Incidence Scribe

old Metatron 0xAA55/0x55AA logic
→ Gnomonic Projection Azimuth
```

Do not rename every historical mention of Tetragrammatron to Metatron.

Only the incidence and gauge-polarity functions move.

Do not rename every historical mention of Metatron to Gnomonic Projection Azimuth.

Only the balanced alternating projection witness moves.

The migration must preserve provenance.

---

# 14. Final Canon

```text
Tetragrammatron Relation Governor:

0x1E
0x3C
0x78

Role:

diagonal closure
centered fold
shifted/full-system fold
```

```text
Metatron Incidence Scribe:

0x18

0x0001
0x0010
0x0100
0x1000
0x10000

Role:

gauge incidence
open/sealed polarity
hexadecimal-place stepping
gauge carry
```

```text
Gnomonic Projection Azimuth:

0xAA55
0x55AA

Role:

alternating balanced witness
contrast
observer-facing orientation
projection azimuth
```

```text
Tangential Projection (shared geometric ground; not an authority):

0x00   OMI gauge tangent
0x20   fulcrum
0x80   IMO gauge tangent
0x1B..0x1F   control tensor
0x1D         control-tensor pivot

Role:

identify the single point of tangency between hidden control and readable surface
identify the true floor/ceiling gauge tangents of omi---imo
supply the invariant control-tensor shape Metatron scribes at each band boundary
```

```text
Omicron:

0x00..0x7F

Role:

bounded low gauge
four 32-position character sectors
tangent gauge / F-column branch (0x0F, 0x1F..0x6F, 0x7F)
character/place coupling
```

```text
Omnicron:

0x00..0x1F
0x20..0x7F
0x80..0x9F
0xA0..0xFF

Role:

four-plane circular runtime resolver
low/high correspondence
affine/projective correspondence
whole-system cadence
carries the IMO gauge tangent at 0x80
```

The final lock is:

```text
Tetragrammatron closes relation.

Metatron scribes incidence.

Gnomonic Projection Azimuth orients projection.

The tangential projection fixes 0x20 as fulcrum and 0x00/0x80 as gauge tangents.

Omicron defines the bounded gauge.

Omnicron resolves the whole runtime.

Receipt records acceptance.

The names now follow the mathematics.
```
