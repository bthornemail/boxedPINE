---
id: SPEC-25
title: "The Iff and Coordinate Types"
kind: spec
layer: architecture
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-20 The Dimensional Axis]]"
down: []
related:
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-21 The Inversion Law]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-24 Observers]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/index.ts"
dimensions: []
symbols: []
tags: [omi-imo, iff, coordinate, types, boundary, constraint]
---

# The Iff and Coordinate Types

## The Base Equivalence

```
position(n)            ⟺     period(n−1, n, n+1)
```

The position holds iff the period holds. Neither can exist without the other.

## The 2! is the Iff

```
2!    =       2   =     the two sides of the iff
                         ├── position
                         └── period
```

## The 3! is the Operations

```
3!    =       6   =    the six operations, read through the iff
```

## The n±1 is the Local Neighborhood

```
n−1       →    the before
n         →    the now
n+1       →    the after
```

The iff captures both the position and the period.

## The Type System

From `rosetta/src/index.ts`:

```typescript
export type SPACE = [b: number, o: number, x: number];
export type TIME = [e: number, d: number];
export type CONTINUUM = [p: number, i: number, n: number];

// Domain Literal
export type POINT = `${number}p`;
export type INDEX = `${number}i`;
export type NUMBER = `${number}n`;
export type EXPONENT = `${number}e${number}` | `${number}e${number}${'p' | 'i' | 'n'}`;

// Dimension Literal
export type BINARY = `0b${number}`;
export type OCTAL = `0o${number}`;
export type HEX = `0x${number}`;
export type DECIMAL = `${number}.${number}` | `${number}.${number}d`;

// Structural Literal
export type LITERAL = `${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'}`;
export type STRUCT = `${number}${'e' | '.'}${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'} `;

export type SPECTRAL = [p: number, i: number];
export type SPATIAL = [b: number, o: number, x: number, e: number, d: number, n: number];
export type SCALAR = [e: FRONT | BACK, d: UP | DOWN, n: LEFT | RIGHT];
export type BOUNDRY = [SPECTRAL, SPATIAL] | COORDINATE;
export type CONSTRAINT = (spectrum: TIME, space: SPACE | CONTINUUM) => BOUNDRY;

export type FRONT = number;
export type BACK = number;
export type UP = number;
export type DOWN = number;
export type LEFT = number;
export type RIGHT = number;

export type SHAPE = [
    POINT: number,
    INDEX: number,
    FRONT: number,
    BACK: number,
    UP: number,
    DOWN: number,
    LEFT: number,
    RIGHT: number,
];
export type COORDINATE = [SPECTRAL, SPATIAL, SHAPE, SCALAR?];
export type RULER = (boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE, COORDINATE];
export type RULE = (boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE];

export type DECLARATION = RegExp;
export type DEFINITION = [number, string];
export type EXPRESSION = (declarations: DECLARATION[], definitions: DEFINITION[]) => string;
export type TEMPLATES = (p: number, i: number, n: number, E: number, b: number, o: number, x: number, e: number, d: number) => string;
export type CONFIGURATION = [
    declarations?: DECLARATION[],
    definitions?: DEFINITION[],
    expressions?: EXPRESSION[],
    templates?: TEMPLATES[]
];
```

## The Hierarchy

```
DOMAIN LITERALS           POINT, INDEX, NUMBER, EXPONENT
  the positions

DIMENSION LITERALS        BINARY, OCTAL, HEX, DECIMAL
  the radix readings

STRUCTURAL LITERALS       SHAPE, STRUCT
  the composition patterns over domain and dimension

POSITION ARRAYS           SPACE, TIME, CONTINUUM
  the three positions

READINGS                  SPECTRAL, SPATIAL, SCALAR
  the multi-slot readings

CUBE                      COORDINATE
  the eight-slot cube reading

BOUNDARY AND FUNCTIONS    BOUNDRY, CONSTRAINT, RULER, RULE
  the constraint and the two arities
```

## The Composition

```
STRUCT → SHAPE → DOMAIN LITERALS + DIMENSION LITERALS → POSITION ARRAYS → READINGS → CUBE → BOUNDARY → FUNCTIONS
```

Six levels of composition, all the way from the structural wordform down to the boundary reading.

## The Two Readings of the Boundary

The BOUNDRY is either:

```
[SPECTRAL, SPATIAL]       the nested reading
COORDINATE                the cube reading
```

Two readings of the same constraint result. The nested reading keeps the spectral and spatial arrays separate; the cube reading flattens them into the eight-slot COORDINATE.

## The Constraint

The CONSTRAINT is a function from a TIME and a SPACE or CONTINUUM to a BOUNDRY:

```typescript
export type CONSTRAINT = (spectrum: TIME, space: SPACE | CONTINUUM) => BOUNDRY;
```

The constraint checks a STRUCT and produces a BOUNDRY. Because STRUCT covers every combination of a base, an exponent, a radix, a span, and a literal.

## The Ruler and the Rule

```typescript
export type RULER = (boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE, COORDINATE];
export type RULE = (boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE];
```

The RULER returns two coordinates (the before and after). The RULE returns one coordinate (the result).

## The Configuration

```typescript
export type CONFIGURATION = [
    declarations?: DECLARATION[],
    definitions?: DEFINITION[],
    expressions?: EXPRESSION[],
    templates?: TEMPLATES[]
];
```

The configuration is a 4-tuple: declarations, definitions, expressions, templates. Each is optional.
