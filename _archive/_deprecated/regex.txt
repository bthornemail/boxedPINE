const front = /[A-Za-z0-9_-]/;
const back = /[-_A-Za-z0-9]/;
const inside = /[A-Za-z0-9]/;
const outside = /[^A-Za-z0-9]/;
const up = /[A-Z]/;
const down = /[a-z]/;
const left = /[0-9_-]\.[^0-9_-]/;
const right = /[^0-9_-]\.[-_0-9]/;
const center = /[0-9]\.[0-9]/;
const constraint = /[^"]+/; //to match all the content between certain delimiters (in this case double quotes), or with atomic groups.
const boundry = /"([^"]+)"/;
`
[abc] is functionally equivalent to (?:a|b|c).
`
const FRONT = /^[A-Za-z0-9:+]$/;
const BACK = /^[A-Za-z0-9.-]$/;

const INSIDE = /^[A-Za-z0-9_]$/;
const OUTSIDE = /^[^A-Za-z0-9_]$/;

const UP = /^[A-Z_]$/;
const DOWN = /^[a-z_]$/;

const LEFT = /^[0-9+-]\.[^0-9+-]$/;
const RIGHT = /^[^0-9+-]\.[0-9+-]$/;
const CENTER = /^[0-9]\.[0-9]$/;

function matches(rule, value) {
    return rule.test(value);
}

const isFront = value => FRONT.test(value);
const isBack = value => BACK.test(value);
const isInside = value => INSIDE.test(value);
const isOutside = value => OUTSIDE.test(value);

const isUp = value => UP.test(value);
const isDown = value => DOWN.test(value);

const isLeft = value => LEFT.test(value);
const isRight = value => RIGHT.test(value);
const isCenter = value => CENTER.test(value);

const isConstraint = /[^"]+/;
const isBoundary = /"([^"]+)"/;

const willDeflect = value => DEFLECT.test(value);
const willReflect = value => REFLECT.test(value);
const willInflect = value => INFLECT.test(value);

const DEFLECT = /^([^".]+):\1$/;

function deflect(value) {
    const match = DEFLECT.exec(value);

    if (!match) return null;

    return {
        value: match[1]
    };
}
const REFLECT = /^([".]+):\1$/;
function reflect(value) {
    const match = REFLECT.exec(value);

    if (!match) return null;

    return {
        value: match[1]
    };
}
const INFLECT = /^([".]+):([".]+):\2:\1$/;

function inflect(value) {
    const match = INFLECT.exec(value);

    if (!match) return null;

    return {
        first: match[1],
        second: match[2]
    };
}
const CONSTRAINT = /^[^"]+$/;
const BOUNDARY = /^"([^"]+)"$/;

const isConstraint = value => CONSTRAINT.test(value);
const isBoundary = value => BOUNDARY.test(value);
function boundary(value) {
    const match = BOUNDARY.exec(value);
    if (!match) return null;

    return {
        value: match[1]
    };
}
function boundary(value) {
    const match = BOUNDARY.exec(value);
    if (!match) return null;

    return {
        value: match[1]
    };
}
const AXIS = /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/;
const MNEMONIC = /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/;
`
const G = Object.freeze({
    FRONT: /^[A-Za-z0-9:+]$/,
    BACK: /^[A-Za-z0-9.-]$/,

    INSIDE: /^[A-Za-z0-9_]$/,
    OUTSIDE: /^[^A-Za-z0-9_]$/,

    UP: /^[A-Z_]$/,
    DOWN: /^[a-z_]$/,

    LEFT: /^[0-9+-]\.[^0-9+-]$/,
    RIGHT: /^[^0-9+-]\.[0-9+-]$/,
    CENTER: /^[0-9]\.[0-9]$/,

    CONSTRAINT: /^[^"]+$/,
    BOUNDARY: /^"([^"]+)"$/,

    DEFLECT: /^([^".]+):\1$/,
    REFLECT: /^([".]+):\1$/,
    INFLECT: /^([".]+):([".]+):\2:\1$/,

    AXIS: /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/,
    MNEMONIC: /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/
});
function test(symbol, value) {
    const rule = G[symbol];

    if (!(rule instanceof RegExp)) {
        throw new Error(`Unknown symbol: ${ symbol } `);
    }

    return rule.test(value);
}
function match(symbol, value) {
    const rule = G[symbol];
    if (!(rule instanceof RegExp)) return null;

    const m = rule.exec(value);
    return m ? [...m] : null;
}
`

const re = new RegExp("ab+c");
//Using the constructor function provides runtime compilation of the regular expression. Use the constructor function when you know the regular expression pattern will be changing, or you don't know the pattern and are getting it from another source, such as user input.
// Note: In many cases, when trying match a special character, you can wrap it in a character class as an alternative to escaping, for example /a[*]b/.

    `
const reflect = /([^"\.]+):\1/;
const inflect = /(["\.]+):\1/;
const expect = /(["\.]+):(["\.]+):\2:\1/;
const mnemonic = /(\d\d)[A-Za-z_-](\d\d):\2[0-9_-]\1/;
const pallindrome = /(\d\d)([A-Z]?[a-z]+)(\d\d):\3\2\1/;
//latest revisiom to dwepseek
const FRONT = /^[A-Za-z0-9:+]$/;
const BACK = /^[A-Za-z0-9.-]$/;

const INSIDE = /^[A-Za-z0-9]$/;
const OUTSIDE = /^[^A-Za-z0-9]$/;

const UP = /^[A-Z]$/;
const DOWN = /^[a-z]$/;

const LEFT = /^[0-9+-]\.[^0-9+-]$/;
const RIGHT = /^[^0-9+-]\.[0-9+-]$/;
const CENTER = /^[0-9]\.[0-9]$/;

const PALINDROME = /(\d\d)[A-Za-z_-](\d\d):\2[0-9_-]\1/
`
    `
const isFront = /^[A-Za-z0-9:+]$/;
const isBack = /^[A-Za-z0-9.-]$/;

const isInside = /^[A-Za-z0-9_]$/;
const isOutside = /^[^A-Za-z0-9_]$/;

const isUp = /^[A-Z_]$/;
const isDown = /^[a-z_]$/;

const isLeft = /^[0-9+-]\.[^0-9+-]$/;
const isRight = /^[^0-9+-]\.[0-9+-]$/;
const isCenter = /^[0-9]\.[0-9]$/;

const isConstraint = /[^"]+/;
const isBoundary = /"([^"]+)"/;

»const willDeflect = /([^".]+):\1/;
»const willReflect = /([".]+):\1/;
»const willInflect = /([".]+):([".]+):\2:\1/;

»const palindrome = /(\d\d)[A-Za-z_]:\2[0-9+-]\1/;
»const mnemonic = /(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1/;
`

    `
const front = /[A-Za-z0-9_-]/;
const back = /[-_A-Za-z0-9]/;

const inside = /[A-Za-z0-9]/;
const outside = /[^A-Za-z0-9]/;

const up = /[A-Z]/;
const down = /[a-z]/;

const left = /[0-9_-]\.[^0-9_-]/;
const right = /[^0-9_-]\.[-_0-9]/;
const center = /[0-9]\.[0-9]/;

const constraint = /[^"]+/;
const boundary = /"([^"]+)"/;

const reflect = /([^".]+):\1/;
const inflect = /([".]+):\1/;
const expect = /([".]+):([".]+):\2:\1/;

const palindrome = /(\d\d)[A-Za-z_-](\d\d):\2[0-9_-]\1/;
const mnemonic = /(\d\d)([A-Z]?[a-z]+)(\d\d):\3\2\1/;
`

    //// const pallindrome = /(\d\d)\:(\d\d)\.\2\:\1/;
    //const pallindrome = /(\d\d)\+(\d\d)=\2\+\1/;
    // This is for building rulers
    `
//const pallindrome = /(\d\d)(?:[A-Z]|[a-z])(\d\d)\.\3\2\1/;
»const front = /[A-Za-z0-9_-]/;
»const back = /[-A-Za-z0-9]/;
const inside = /[A-Za-z0-9]/;
»const outside = /[^A-Za-z0-9]/;
»const up = /[A-Z]/;
»const down = /[a-z]/;
»const left = /[0-9-].*/;
»const right = /..[-_0-9]/;
»const constraint = /[^"]+/; //to match all the content between certain delimiters (in this case double quotes), or with atomic groups.
»const boundry = /"([^"]+)"/;
        [abc] is functionally equivalent to (?:a|b|c).        
»const pallindrome = /(\d\d):(\d\d).\2:\1/;

»const mnemonic = /(\d\d)A-Za-z_-:\2[0-9_-]\1/;
`

function isImage(filename) {
    return /\.(?:png|jpe?g|webp|avif|gif)$/i.test(filename);
}

isImage("image.png"); // true
isImage("image.jpg"); // true
isImage("image.pdf"); // false


`
Input boundary beginning assertion: Matches the beginning of input. If the multiline (m) flag is enabled, also matches immediately after a line break character. For example, /^A/ does not match the "A" in "an A", but does match the first "A" in "An A".

Note: This character has a different meaning when it appears at the start of a character class.

$	
Input boundary end assertion: Matches the end of input. If the multiline (m) flag is enabled, also matches immediately before a line break character. For example, /t$/ does not match the "t" in "eater", but does match it in "eat".
`

    `
(direct link)
Lookarounds
Lookaround	Legend	Example	Sample Match
(?=…)	Positive lookahead	(?=\d{10})\d{5}	01234 in 0123456789
(?<=…)	Positive lookbehind	(?<=\d)cat	cat in 1cat
(?!…)	Negative lookahead	(?!theatre)the\w+	theme
(?<!…)	Negative lookbehind	\w{3}(?<!mon)ster	Munster
`

    `
Other assertions
Note: The ? character may also be used as a quantifier.

Characters	Meaning
x(?=y)	
Lookahead assertion: Matches "x" only if "x" is followed by "y". For example, /Jack(?=Sprat)/ matches "Jack" only if it is followed by "Sprat".
/Jack(?=Sprat|Frost)/ matches "Jack" only if it is followed by "Sprat" or "Frost". However, neither "Sprat" nor "Frost" is part of the match results.

x(?!y)	
Negative lookahead assertion: Matches "x" only if "x" is not followed by "y". For example, /\d+(?!\.)/ matches a number only if it is not followed by a decimal point. /\d+(?!\.)/.exec('3.141') matches "141" but not "3".

(?<=y)x	
Lookbehind assertion: Matches "x" only if "x" is preceded by "y". For example, /(?<=Jack)Sprat/ matches "Sprat" only if it is preceded by "Jack". /(?<=Jack|Tom)Sprat/ matches "Sprat" only if it is preceded by "Jack" or "Tom". However, neither "Jack" nor "Tom" is part of the match results.

(?<!y)x	
Negative lookbehind assertion: Matches "x" only if "x" is not preceded by "y". For example, /(?<!-)\d+/ matches a number only if it is not preceded by a minus sign. /(?<!-)\d+/.exec('3') matches "3". /(?<!-)\d+/.exec('-3') match is not found because the number is preceded by the minus sign.
`

    `
Quantifiers
Quantifiers indicate numbers of characters or expressions to match.

Note: In the following, item refers not only to singular characters, but also includes character classes and groups and backreferences.

Characters	Meaning
x*	
Matches the preceding item "x" 0 or more times. For example, /bo*/ matches "boooo" in "A ghost booooed" and "b" in "A bird warbled", but nothing in "A goat grunted".

x+	
Matches the preceding item "x" 1 or more times. Equivalent to {1,}. For example, /a+/ matches the "a" in "candy" and all the "a"'s in "caaaaaaandy".

x?	
Matches the preceding item "x" 0 or 1 times. For example, /e?le?/ matches the "el" in "angel" and the "le" in "angle."

If used immediately after any of the quantifiers *, +, ?, or {}, makes the quantifier non-greedy (matching the minimum number of times), as opposed to the default, which is greedy (matching the maximum number of times).

x{n}	
Where "n" is a non-negative integer, matches exactly "n" occurrences of the preceding item "x". For example, /a{2}/ doesn't match the "a" in "candy", but it matches all of the "a"'s in "caandy", and the first two "a"'s in "caaandy".

x{n,}	
Where "n" is a non-negative integer, matches at least "n" occurrences of the preceding item "x". For example, /a{2,}/ doesn't match the "a" in "candy", but matches all of the a's in "caandy" and in "caaaaaaandy".

x{n,m}	
Where "n" and "m" are non-negative integers and m >= n, matches at least "n" and at most "m" occurrences of the preceding item "x". For example, /a{1,3}/ matches nothing in "cndy", the "a" in "candy", the two "a"'s in "caandy", and the first three "a"'s in "caaaaaaandy". Notice that when matching "caaaaaaandy", the match is "aaa", even though the original string had more "a"s in it.

x*?
x+?
x??
x{n}?
x{n,}?
x{n,m}?

By default quantifiers like * and + are "greedy", meaning that they try to match as many times as possible. The ? character after the quantifier makes the quantifier "non-greedy": meaning that it will stop as soon as it finds the minimum number of matches. For example, given a string like "some <foo> <bar> new </bar> </foo> thing":

/<.*>/ will match "<foo> <bar> new </bar> </foo>"
/<.*?>/ will match "<foo>"
Note: Adding ? after {n} is syntactically valid but practically useless. Since {n} always matches exactly n times, x{n}? behaves the same as x{n}.
`
