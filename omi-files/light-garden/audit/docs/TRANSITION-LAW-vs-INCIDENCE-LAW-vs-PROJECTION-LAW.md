# Transition Law vs Incidence Law vs Projection Law

Status: `frozen terminology guide`  
Scope: `conceptual clarity for deterministic extraction lanes`

## 1. Why This Exists

This guide prevents category confusion when discussing architecture.

Use these terms consistently so design decisions stay aligned with the
authority boundary and deterministic replay discipline.

## 2. Core Definitions

### Transition Law

What state becomes next state.

- finite/deterministic update rule
- replay-critical
- independent of UI phrasing
- examples: lane step rules, replay transitions, deterministic unfold

Question it answers: `what changes next?`

### Incidence Law

What is related to what.

- relation/adjacency/incidence structure
- independent of drawing/encoding choice
- often represented as graphs, configurations, point-line relations

Question it answers: `what belongs/connects to what?`

### Projection Law

How state/relation is rendered or encoded.

- representation surface only
- may use text, Unicode, SVG, LEDs, sound, UI views
- must not redefine semantic authority

Question it answers: `how is it shown/carried?`

## 3. Boundary Rule

Canonical truth must not be inferred from projection form alone.

- transition and incidence laws define invariant structure
- projection law maps invariant structure to observable surface
- changing projection must not change canonical replay result

## 4. Practical Mapping in Light Garden

- `harmonic_id.v0`: transition/incidence-derived advisory artifact
- `dome_frame.v0`: projection artifact
- `harmonic_receipt.v0`: replay/audit evidence artifact
- `talisman_mask.v0`: optional projection/advisory artifact

These are governed artifacts, but non-authoritative.

## 5. Anti-Confusion Checklist

Before adding or changing a lane, ask:

1. Is this changing transition law, incidence law, or only projection?
2. If projection changes, are replay hash and canonical artifacts unchanged?
3. Did we accidentally promote projection output into authority?
4. Are unknown keys/missing keys/digest mismatches still fail-closed?

## 6. Approved Short Phrases

Use:

- `finite relational coordinate system`
- `transition + incidence over projection`
- `projection is downstream, authority is upstream`

Avoid:

- calling the projection carrier itself canonical truth
- calling the coordinate space an algebraic field unless strict field axioms are defined
