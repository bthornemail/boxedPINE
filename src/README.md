# src — the test bed

This is where things are **tried and checked**. The Vite app (`npm run dev`) starts here, and `npm test` runs the checks.

## What is here

| Path | What it is | State |
|------|------------|-------|
| `testbed/core.test.ts` | Checks every finding in `core/src/verified` | ✅ passing |
| `testbed/rosetta.test.ts` | Checks the grammar and the kernel in `rosetta/src/grammar` | ✅ passing |
| `server.ts` | The development REPL, headless over HTTP ("curl repl"): the request body is the REPL's input and the response its output | Author's example (Node only, outside the browser build) |
| `define.commands.ts` | The REPL commands `.open .bind .apply .eval .digest .close`, for testing while building. Their cues are `rosetta/src/assets/commands.vtt` | Author's example (Node only, outside the browser build) |
| `main.ts` | The app entry: four canvases, `uu`, `uk`, `ku`, `kk` (the iExtant shape cells) | Placeholder (see `space/README.md`, view 7) |
| `examples.ts` | Scratch from the Vite template | Placeholder |

## Use case scenarios

Models for acceptance testing (see [wiki/usecases/USE-00 Use Case Scenarios.md](../wiki/usecases/USE-00%20Use%20Case%20Scenarios.md)): golden artifacts in `atomic-kernel`, the conformance kit in `tetragrammatron`.

## Running

```bash
npm test
```

Each test name is a sentence saying what it proves, so the output reads as a list of facts. When a test fails, the finding it guards has changed: update the wiki before changing the test.

The tests run under Node (`node --test`), so `tsconfig.json` leaves `testbed/` out of the browser build.

## Adding a check

1. Put the finding in `core/src/verified/` (or the grammar in `rosetta/src/grammar/`).
2. Add a test here whose name states the fact.
3. Log the discovery in `wiki/progress/PROG-00 Homoiconic Syntax Tracker.md`.
