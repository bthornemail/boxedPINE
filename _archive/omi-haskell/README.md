# omi-haskell (archived 2026-10-07)

The former `omi-files/omi` Haskell reference: `OMI.Kernel`, `OMI.Relation`, `OMI.Delta`, `OMI.Handler`, `OMI.Pipeline` and `Main.hs`.

It was merged into `omi-files/omi-canvas` so both use the same types (the nibble-pair `Byte`):

| Here | Now |
|------|-----|
| `OMI.Kernel` XOR helpers | `omi-canvas/src/OMI/Bits.hs` |
| `OMI.Delta` | `omi-canvas/src/OMI/Delta.hs` (with the corrected `rotr2`) |
| `OMI.Handler` | `omi-canvas/src/OMI/Handler.hs` (positions over `Word16`, not `Int`) |
| `OMI.Kernel` types, `OMI.Relation`, `OMI.Pipeline` | superseded by the canvas modules of the same names |

The audio breadboard that lived beside it is now `space/breadboard/`. See `wiki/usecases/USE-00 Use Case Scenarios.md`, scenario 2.
