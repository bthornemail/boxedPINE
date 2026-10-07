---
id: EXT-02
title: "Adding a Symbol"
kind: extension
layer: extension
status: canonical
spec: OMI-IMO-2026
up: "[[EXT-00 How to Extend the Protocol]]"
down: []
related:
  - "[[EXT-00 How to Extend the Protocol]]"
  - "[[EXT-01 Adding a Dimension]]"
  - "[[EXT-03 Adding a Substrate]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[EXT-05 Review Checklist]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/constants.ts"
dimensions: []
symbols: []
tags: [omi-imo, extension, symbol, regex, grammar]
---

# Adding a Symbol

## The Symbol Table G

The regex-constrained vocabulary (G) defines the admissible tokens. To add a new symbol, you must:

1. Define the regex pattern
2. Add it to the `G` object
3. Add a helper function
4. Add a type definition (if needed)
5. Write the spec
6. Update the MOC

## The Process

### 1. Define the Regex Pattern

The regex pattern must be a valid JavaScript RegExp. It should match the token shape you want to admit.

```typescript
const NEW_SYMBOL = /^pattern$/;
```

### 2. Add to the G Object

```typescript
const G: SYMBOL = Object.freeze({
    // ... existing symbols
    NEW_SYMBOL: /^pattern$/,
});
```

### 3. Add a Helper Function

```typescript
const isNewSymbol = (value: string) => NEW_SYMBOL.test(value);
```

### 4. Add a Type Definition (if needed)

```typescript
export type NEW_SYMBOL = `${number}x`;
```

### 5. Write the Spec

Add a new SPEC note. Link it to [[SPEC-30 The Symbol Table G]].

### 6. Update the MOC

Add the new symbol to [[OMI-IMO]].

## The Protocol Handler

If you are extending the protocol handler (the closure-based kernel), you also need to:

1. Add the pattern to the `GRAMMAR` Map
2. The handler will automatically admit the new pattern
3. The kernel can learn the new pattern with `learn`

```javascript
kernel.learn('NEW_SYMBOL', '^pattern$');
```

## The Existing Symbols

| Symbol | Pattern | Meaning |
|--------|---------|---------|
| FRONT | `/^[A-Za-z0-9:+]$/` | the side currently facing the solver |
| BACK | `/^[A-Za-z0-9.-]$/` | the side opposite the front |
| INSIDE | `/^[A-Za-z0-9_]$/` | alphanumeric or underscore |
| OUTSIDE | `/^[^A-Za-z0-9_]$/` | not alphanumeric or underscore |
| UP | `/^[A-Z_]$/` | uppercase or underscore |
| DOWN | `/^[a-z_]$/` | lowercase or underscore |
| LEFT | `/^[0-9+-]\.[^0-9+-]$/` | digit, dot, non-digit |
| RIGHT | `/^[^0-9+-]\.[0-9+-]$/` | non-digit, dot, digit |
| CENTER | `/^[0-9]\.[0-9]$/` | digit, dot, digit |
| CONSTRAINT | `/^[^"]+$/` | any non-quote characters |
| BOUNDARY | `/^"([^"]+)"$/` | quoted string |
| DEFLECT | `/^([^".]+):\1$/` | palindrome with colon separator |
| REFLECT | `/^([".]+):\1$/` | quoted palindrome with colon separator |
| INFLECT | `/^([".]+):([".]+):\2:\1$/` | double palindrome |
| AXIS | `/^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/` | axis pattern |
| MNEMONIC | `/^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/` | mnemonic pattern |

## The Missing PALINDROME

The `PALINDROME` pattern is referenced in the synthesis but is NOT present in the actual `G` object. This is a bug. To fix it:

```typescript
const PALINDROME = /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/;
```

Add it to the `G` object and add a helper function:

```typescript
const isPalindrome = (value: string) => PALINDROME.test(value);
```
