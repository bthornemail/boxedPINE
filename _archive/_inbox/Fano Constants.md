Fano plane · GF(2)³ · 7 points · 7 lines

# Every file is one constant

Each SVG you made is read as text, its marked dots are located, and the result becomes a 7-bit mask: bit `n−1` is on when point `n` is marked. Your numbering is the XOR numbering, so on every line `a ⊕ b ⊕ c = 0`.

## Pick two points

The third point on their line is computed as a ⊕ b, then the line is lit. Use Tab and Enter, or tap.

Readout

— ⊕ — = —

The seven lines, checked

| Line | a | b | c | a⊕b⊕c |
| --- | --- | --- | --- | --- |

## Your files

Click once to set View A, again on another file for View B. The mask under each image comes from the file's text, not from its name.

## Two views, one check

A ⊕ B shows the points where the two files differ. The count of 1s is the Hamming distance. Zero means both files hold the same constant.

View A

—

—

View B

—

—

A ⊕ B

—

Pick two files.