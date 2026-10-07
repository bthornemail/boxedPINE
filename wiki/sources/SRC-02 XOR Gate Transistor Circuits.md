---
id: SRC-02
title: "XOR Gate Transistor Circuits"
kind: source
layer: sources
status: canonical
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SRC-99 Source Index]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, hardware, xor, transistor, circuits]
---

# XOR Gate Transistor Circuits

## Summary

This is a 744-page DeepSeek conversation transcript about XOR gate transistor circuits. It covers the 5T, 6T, 8T, and 10T BJT XOR circuits, their netlists, truth tables, and the mapping to the protocol's primitives.

## The Parts

- [[SRC-02a XOR Gate Transistor Circuits|Part 1]] (lines 1-29500)
- [[SRC-02b XOR Gate Transistor Circuits|Part 2]] (lines 29501-58922)

## Key Claims

- Four XOR realizations: 5T (NAND+switch+OR-like), 6T (XOR#1+inverter), 8T (4× NAND), 10T (5× NOR)
- The 8T and 10T netlists are algebraically correct XOR (verified by hand)
- The 6T is XNOR, not XOR — `Atom.apply()` returns 254/255 (contradiction)
- The 5T/10T frame the orbit as endpoints; the 6T/8T are the conserved interior
- The switch is the 0D indexed transistor reference position — the loop selector

## Key Definitions

- The 5T circuit: NAND + switch + OR-like, LED sinks
- The 6T circuit: XOR#1 + inverter, +1 output transistor
- The 8T circuit: 4× 2T NAND
- The 10T circuit: 5× 2T NOR + 7× 2K resistors + LED @ 5V

## Key Numbers

- 5T, 6T, 8T, 10T (transistor counts)
- 29 transistors total (across all four circuits)
- 2N2222 (transistor type)
- 2K, 330 (resistor values)
- 5V (supply voltage)

## Open Questions

- The 6T circuit is XNOR, not XOR — how to fix?
- The naming collision between BJT and CMOS transistor counts
- The ALU XOR total (2+4=6 at best, marked speculative)

## Cross-references

- [[SPEC-40 The 6T XOR Circuit]] — the 6T circuit
- [[SPEC-41 The 8T XOR Circuit]] — the 8T circuit
- [[SPEC-42 Circuit Sourcemap]] — the sourcemap
- [[SPEC-43 Prime Gaps and Sextuplets]] — prime gaps
- [[SPEC-10 The Primitive]] — the primitive
- [[SPEC-12 The Ruler]] — the ruler
- [[OPEN-00 Contradiction Register]] — contradictions
- [[OPEN-02 Broken Code Inventory]] — broken code
