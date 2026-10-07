---
id: SRC-08
title: "XOR Gate Built with Transistors"
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
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, hardware, xor, transistor, reference]
---

# XOR Gate Built with Transistors

## Summary

This is a 40-page saved web page "XOR Gate, Exclusive OR Gate | Built with Transistors". It is a reference source for the transistor-level XOR circuits.

## The Parts

- [[SRC-08 XOR Gate Built with Transistors|The whole source]] (lines 1-948)

## Key Claims

- Transistor ladder (all stated): 5T (Gate 1, 2+1+2 = NAND + switch + OR-like, LED sinks), 6T (Gate 2, recommended, +1 output transistor acting as inverter), 8T (Gate 3, 4× 2T NAND), 10T (Gate 4, 5× 2T NOR + 7× 2K resistors + LED @ 5V)
- No CMOS data at all. No 4T/6T/10T CMOS, no pass transistors, no PMOS
- The 6T and 8T figures are BJT breadboard counts

## Contradictions Found

- The NAND section's own caption says the connections make "the NOR gate" (should be "the NAND gate")
- Gate 4's cost objection says "not the simplest NOR gate" (should be "not the simplest XOR gate")
- "2N222" and "tri-site buffers" are typos
- "in two of the full adders" vs "four full adders and four XOR subtract gates" leaves the ALU XOR total ambiguous (2+4=6 at best, marked speculative)

## The Truth Table

The truth table and all four schematics are raster images and do not survive pdftotext. Only the prose rule is available.

## Cross-references

- [[SPEC-40 The 6T XOR Circuit]] — the 6T circuit
- [[SPEC-41 The 8T XOR Circuit]] — the 8T circuit
- [[SPEC-42 Circuit Sourcemap]] — the sourcemap
- [[SPEC-43 Prime Gaps and Sextuplets]] — prime gaps
- [[OPEN-00 Contradiction Register]] — contradictions
