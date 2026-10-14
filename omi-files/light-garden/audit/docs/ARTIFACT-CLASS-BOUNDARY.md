# Artifact Class Boundary (Light Garden Audit)

Status: `frozen boundary contract`  
Scope: `harmonic projection artifacts in audit lane`  
Applies to: `harmonic_id.v0`, `dome_frame.v0`, `harmonic_receipt.v0`, `talisman_mask.v0`

## 1. Purpose

Define the non-negotiable class boundary for harmonic artifacts so lane outputs
remain governed and replayable without becoming semantic authority.

This document is intentionally short and operational.

## 2. Artifact Class

All harmonic artifacts in this lane are:

- `advisory` and/or `projection/runtime evidence`
- deterministic and versioned
- hash-addressed and replay-checkable
- fail-closed validated

They are **not** canonical semantic truth artifacts.

## 3. Allowed vs Forbidden

Allowed:

- deterministic derivation from bounded inputs
- canonical JSON + digest emission
- replay-hash reporting and golden locking
- transport as advisory/runtime evidence
- downstream rendering/projection use

Forbidden:

- mutating canonical truth stores
- redefining ABI semantic meaning
- redefining EABI invocation semantics
- implicit promotion from advisory/projection to authority
- hidden write-back channels from projection surfaces

## 4. Artifact Roles

- `harmonic_id.v0`: stable derived harmonic locator (advisory)
- `dome_frame.v0`: deterministic projection frame (advisory)
- `harmonic_receipt.v0`: portable replay/audit evidence (advisory/runtime evidence)
- `talisman_mask.v0`: optional experimental mask profile (advisory)
- `harmonic_lane.report.v0`: gate-local report (non-portable lane-local artifact)

## 5. Gate Requirements

The lane remains valid only when all are true:

- accept corpus passes
- must-reject corpus fails closed
- replay hash is deterministic across reruns
- golden outputs match
- authority class remains advisory/projection/runtime-evidence only

## 6. Promotion Rule

No artifact in this lane becomes authority by usage.

Promotion, if ever needed, requires:

- explicit versioned spec update
- explicit governance decision in upstream authority repos
- migration notes and compatibility plan
- updated closure/instrument checks

Without these, class remains unchanged.
