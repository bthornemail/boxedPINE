// THE GRAMMAR — LEVELS 1 TO 3
//
// One table of named regex patterns. In a homoiconic protocol the same
// table checks data and programs, so this file is the single source of truth.
//
// Where each pattern comes from:
//   reference + wordform  DeepSeek0 "the complete grammar" (raw lines 14680–14725),
//                         rev1 §9.2, corrected Haskell defaultGrammar
//   symbols (G)           core/src/index.ts G where it exists; DeepSeek0 raw
//                         lines 14620–14660 for the rest; PALINDROME from the Synthesis
//
// ⟦PLACEHOLDER⟧ marks a decision only the author can make.

export type Group = 'reference' | 'wordform' | 'set' | 'bracket' | 'face' | 'palindrome' | 'higher';

export type Rule = { name: string; group: Group; pattern: RegExp; note?: string };

export const RULES: Rule[] = [
  // LEVEL 1 — the reference space: single literal positions
  { name: 'RADIX',      group: 'reference', pattern: /^0[boxd]$/, note: 'the four radices' },
  { name: 'LITERAL_KIND', group: 'reference', pattern: /^0[pin]$/, note: 'the three literals' },
  { name: 'SELF',       group: 'reference', pattern: /^0[pine]$/, note: 'the self-description (= /0[boxed]/)' },
  { name: 'DISTRIBUTION', group: 'reference', pattern: /^0[pie]$/, note: 'the distribution' },
  { name: 'FRAME',      group: 'reference', pattern: /^0[box]$/, note: 'the frame' },

  // LEVEL 2 — wordforms: positions with content
  { name: 'POINT',    group: 'wordform', pattern: /^(\d+)p$/ },
  { name: 'INDEX',    group: 'wordform', pattern: /^(\d+)i$/ },
  { name: 'NUMBER',   group: 'wordform', pattern: /^(\d+)n$/ },
  { name: 'EXPONENT', group: 'wordform', pattern: /^(\d+)e(\d+)$/,
    note: '⟦PLACEHOLDER⟧ JavaScript form 3e5; the corrected Haskell uses e5. Author to choose one.' },
  { name: 'BINARY',   group: 'wordform', pattern: /^0b([01]+)$/ },
  { name: 'OCTAL',    group: 'wordform', pattern: /^0o([0-7]+)$/ },
  { name: 'HEX',      group: 'wordform', pattern: /^0x([0-9A-Fa-f]+)$/ },
  { name: 'DECIMAL',  group: 'wordform', pattern: /^(\d+)\.(\d+)$/ },
  { name: 'LITERAL',  group: 'wordform', pattern: /^(\d+)([boxd])(\d+)([pin])$/ },
  { name: 'STRUCT',   group: 'wordform', pattern: /^(\d+)([e.])(\d+)([boxd])(\d+)([pin])$/ },
  { name: 'PINEBOXED', group: 'wordform', pattern: /^0?[boxd]?\d+[eE.]?\d[PIN]$/,
    note: 'The author\'s current draft (wiki SPEC-36): uppercase PIN index axis, lowercase boxd value radix, e exponent / E exception / . decimal dot, reducible to 0n concatenation so that XOR of two literals is the XNOR of a 0n Hamming distance. ⟦PLACEHOLDER⟧ 0P / 0x5P not admitted; the scale is one digit; see SPEC-36.' },
  { name: 'CATALOG', group: 'wordform', pattern: /^<([A-Z2-7]+=*)\?([0-9a-z]+)=([A-Za-z0-9+/]+=*)>$/,
    note: 'The catalog coordinate <base32?base36=base64> (wiki SPEC-37); delimiters < = > ? are block 0 of the orbit of 60. See catalog.ts.' },
  { name: 'EXCHANGE', group: 'wordform', pattern: /^0([pn])(\d)([boxd])(\d)0([np])$/,
    note: 'compareExchange as message syntax, e.g. 0p3x40n. Level 4: nothing executes it yet.' },

  // LEVEL 3 — the symbol table G
  { name: 'INCLUDE',  group: 'set', pattern: /^[A-Za-z0-9_]+$/ },
  { name: 'EXCLUDE',  group: 'set', pattern: /^[^A-Za-z0-9_]+$/ },
  { name: 'ESCAPE',   group: 'set', pattern: /^\\(.)$/ },
  { name: 'CLOSURE',  group: 'set', pattern: /^[{}\[\]<>'",]$/,
    note: '⟦PLACEHOLDER⟧ the transcript wrote /^({|})|\\[|\\]|<|>|\'|"|,]$/, which does not parse as one set; this is the likely intent. Author to confirm.' },
  { name: 'ROUND_OPEN',   group: 'bracket', pattern: /^\($/ },
  { name: 'ROUND_CLOSE',  group: 'bracket', pattern: /^\)$/ },
  { name: 'CURLY_OPEN',   group: 'bracket', pattern: /^\{$/ },
  { name: 'CURLY_CLOSE',  group: 'bracket', pattern: /^\}$/ },
  { name: 'SQUARE_OPEN',  group: 'bracket', pattern: /^\[$/ },
  { name: 'SQUARE_CLOSE', group: 'bracket', pattern: /^\]$/ },
  { name: 'ANGLE_OPEN',   group: 'bracket', pattern: /^<$/ },
  { name: 'ANGLE_CLOSE',  group: 'bracket', pattern: /^>$/ },
  { name: 'QUOTE_MARK',   group: 'bracket', pattern: /^'$/ },
  { name: 'STRING_MARK',  group: 'bracket', pattern: /^"$/ },
  { name: 'FRONT',    group: 'face', pattern: /^[A-Za-z0-9:+]$/ },
  { name: 'BACK',     group: 'face', pattern: /^[A-Za-z0-9.-]$/ },
  { name: 'INSIDE',   group: 'face', pattern: /^[A-Za-z0-9_]$/ },
  { name: 'OUTSIDE',  group: 'face', pattern: /^[^A-Za-z0-9_]$/ },
  { name: 'UP',       group: 'face', pattern: /^[A-Z_]$/ },
  { name: 'DOWN',     group: 'face', pattern: /^[a-z_]$/ },
  { name: 'LEFT',     group: 'face', pattern: /^[0-9+-]\.[^0-9+-]$/ },
  { name: 'RIGHT',    group: 'face', pattern: /^[^0-9+-]\.[0-9+-]$/ },
  { name: 'CENTER',   group: 'face', pattern: /^[0-9]\.[0-9]$/,
    note: '⟦PLACEHOLDER⟧ digits only, so signed cases like +.5 fall in no face cell; [0-9+-] on both sides would make the four cells a partition (wiki SPEC-36).' },
  { name: 'EXCEPTION', group: 'face', pattern: /^[^0-9+-]\.[^0-9+-]$/,
    note: 'Author: the plain dot (no number on either side, like car.cdr) is the exception cell; with CENTER, LEFT and RIGHT the faces are the four cells of PINE.' },
  { name: 'DEFLECT',  group: 'palindrome', pattern: /^([^".]+):\1$/ },
  { name: 'REFLECT',  group: 'palindrome', pattern: /^([".]+):\1$/ },
  { name: 'INFLECT',  group: 'palindrome', pattern: /^([".]+):([".]+):\2:\1$/ },
  { name: 'AXIS',       group: 'higher', pattern: /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/ },
  { name: 'MNEMONIC',   group: 'higher', pattern: /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/ },
  { name: 'PALINDROME', group: 'higher', pattern: /^(\d\d)[A-Za-z_-](\d\d):\2[0-9_-]\1$/ },
];

/**
 * The rules that decide which POSITIONS are valid: Levels 1 and 2.
 * The Level 3 symbols classify characters and tokens instead. Mixing the two
 * breaks admissibility, because INCLUDE (/^[A-Za-z0-9_]+$/) admits every
 * alphanumeric word. ⟦PLACEHOLDER⟧ Author to confirm this split (PROG-00, Level 3).
 */
export const POSITION_RULES: Rule[] = RULES.filter((r) => r.group === 'reference' || r.group === 'wordform');

/** A fresh, mutable grammar: name → pattern. Each call returns a new Map. */
export function makeGrammar(rules: Rule[] = RULES): Map<string, RegExp> {
  return new Map(rules.map((r) => [r.name, r.pattern]));
}

/** Every rule name that matches a token, in table order. */
export function classifyAll(token: string, grammar: Map<string, RegExp>): string[] {
  return [...grammar].filter(([, p]) => p.test(token)).map(([name]) => name);
}
