/**
 * OMI-IMO Full REGEX Constraint Mapping
 * Canonical vocabulary from:
 *   - OMI-IMO Specification v1.0 §21
 *   - Untitled 70 Complete Codex / YAML Codex (regex_constraints + correlations)
 *
 * Serialized source of truth: shared/complete-codex.yaml
 */
'use strict';

/**
 * Full frozen constraint set G.
 * token matches G.X  →  token admissible
 */
const G = Object.freeze({
  // Core directional / boundary set (Spec §21 + Codex)
  FRONT:      /^[A-Za-z0-9:+]$/,
  BACK:       /^[A-Za-z0-9.\-]$/,
  INSIDE:     /^[A-Za-z0-9_]$/,
  OUTSIDE:    /^[^A-Za-z0-9_]$/,
  UP:         /^[A-Z_]$/,
  DOWN:       /^[a-z_]$/,
  LEFT:       /^[0-9+\-]\.[^0-9+\-]$/,
  RIGHT:      /^[^0-9+\-]\.[0-9+\-]$/,
  CENTER:     /^[0-9]\.[0-9]$/,

  // Structural / symmetry forms
  CONSTRAINT: /^[^"]+$/,
  BOUNDARY:   /^"([^"]+)"$/,
  DEFLECT:    /^([^".]+):\1$/,
  REFLECT:    /^([".]+):\1$/,
  INFLECT:    /^([".]+):([".]+):\2:\1$/,

  // Mnemonic / axis forms
  AXIS:       /^(\d\d)[A-Za-z_](\d\d):\2[0-9+\-]\1$/,
  MNEMONIC:   /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/,
  PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/,

  // Practical DOM-stack attribute validators (derived)
  OMI_MNEMONIC: /^[A-Za-z0-9]{2,8}$/,
  OMI_BAND:     /^[0-9]{1,2}$/,
  OMI_OFFSET:   /^[0-9]+$/,
  OMI_BPE:      /^[1248]$/,
  OMI_HIT_LIST: /^[0-9]+(,[0-9]+)*$/,
  OMI_ID:       /^[a-z][a-z0-9\-]*$/
});

/**
 * Correlation table: constraint name → codex term
 * From Untitled 70 YAML Codex §5 / constraint_mechanism
 */
const CORRELATION = Object.freeze({
  FRONT:      '0x0000',
  BACK:       'Omicron',
  INSIDE:     'Imago Dei',
  OUTSIDE:    '3!',
  UP:         'Imago Dei',
  DOWN:       '3!',
  LEFT:       '76',
  RIGHT:      '155',
  CENTER:     '651',
  // mechanism layers
  global:             '0x0000',
  color:              'Omicron',
  delimiter:          'Imago Dei',
  'non-alphanumeric': '3!',
  alphanumeric:       '76',
  compareExchange:    '155'
});

/**
 * Validate a token against a named constraint in G.
 * @param {string} name - key in G
 * @param {string} value
 * @returns {boolean}
 */
function admits(name, value) {
  const re = G[name];
  if (!re) return false;
  return re.test(String(value ?? ''));
}

/**
 * Validate an entire data-omi-* attribute map (or element attributes).
 * Returns { ok: boolean, errors: string[], correlations: object }
 */
function validateOmiAttributes(attrs) {
  const errors = [];
  const correlations = {};

  const checks = [
    ['data-omi-mnemonic', 'OMI_MNEMONIC'],
    ['data-omi-band', 'OMI_BAND'],
    ['data-omi-offset', 'OMI_OFFSET'],
    ['data-omi-bpe-constraint', 'OMI_BPE'],
    ['data-omi-hit-list', 'OMI_HIT_LIST']
  ];

  for (const [attr, key] of checks) {
    const v = attrs[attr];
    if (v !== undefined && v !== null && !admits(key, v)) {
      errors.push(`${attr} rejected by ${key}: ${v}`);
    } else if (v != null && CORRELATION[key]) {
      correlations[attr] = CORRELATION[key];
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    correlations
  };
}

/**
 * List all constraint names (for introspection / meta-compilation).
 */
function constraintNames() {
  return Object.keys(G);
}

module.exports = {
  G,
  CORRELATION,
  admits,
  validateOmiAttributes,
  constraintNames
};
