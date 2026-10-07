# The 60-in-64 Clock

A dial of 64 slots where 60 carry time and 4 are held back for control. The same shape repeats at 256 slots, with 240 for time and 16 for control.

## The dial

Take 64 slots, numbered 0 to 63. The first 60 (0 to 59) are the positions, like the minute marks on a clock face. The last four (60 to 63) are spare.

The bigger version works the same way: 256 slots, 240 positions, 16 spare. In both, 15 of every 16 slots carry time.

**60 + 4 = 64**small dial

**240 + 16 = 256**large dial

**15 / 16**share used for time, both sizes

## The spare codes

The spare slots are what turn a list of 60 numbers into a dial. They stand outside the count, so they can mark events: where a lap starts, where it wraps, or where a new cycle begins. Which job each spare code gets is your design choice. The structure only guarantees that there are four on the small dial and sixteen on the large one.

The XOR orbital moves them around. Use 60 as the base and the 64 slots are rearranged so the four spare codes land on slots 0 to 3, and positions 0 to 3 land on 60 to 63. Nothing is lost or doubled. The rearrangement is its own undo: apply it twice and every slot is back where it started.

Run the 16-row orbit from base 60 and it produces exactly the sixteen characters `0123456789:;<=>?`, in four groups of four. That is the same four-block pattern you use elsewhere.

## The counter

The ticking comes from a counter that adds one at each step and wraps from 59 back to 0 (or from 239 back to 0 on the large dial). XOR alone only swaps slots back and forth, so it cannot advance a hand. The two jobs divide cleanly:

- **Counter:** decides which position is current.
- **Orbital (XOR):** decides how the slots are labelled, including where the spare codes sit.

To cover more than one dial, stack counters like hours, minutes and seconds. For example, 7 × 3 × 240 = 5040, and numbering them as `7-part × 720 + 3-part × 240 + position` gives every number from 0 to 5039 exactly once. What the 7-part and 3-part stand for is yours to define.

## Why 240 and 60 fit together

- 240 = 60 × 4, so each position of the small dial can appear in four phases on the large one.
- 240 = 15 × 16, which lines up with the 16 spare codes and the 15/16 share.
- 256 − 16 = 240, and 64 − 4 = 60, so the large dial is the small dial scaled by four.

## Left out on purpose

This page uses only what holds up as arithmetic or was checked directly. It makes no claim that 240 is the size of a geometric rotation group, that the spare codes are the first Unicode control codes, or that the dial produces π.