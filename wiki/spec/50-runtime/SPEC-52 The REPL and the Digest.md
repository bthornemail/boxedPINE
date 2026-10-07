---
id: SPEC-52
title: "The REPL and the Digest"
kind: spec
layer: runtime
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-50 Stream Transport]]"
down: []
related:
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/main.ts"
  - "rosetta/src/define.commands.ts"
dimensions: []
symbols: []
tags: [omi-imo, REPL, digest, F-mean, read-eval-print, Horn-clause]
---

# The REPL and the Digest

## The Digest

The fourth primitive is the digest:

```
digest    —   read, consider, print
```

The digest computes the generalized F-mean of the ruler:

```
M_p(x_1, ..., x_n) = ( (1/n) Σ x_i^p )^(1/p)
```

The mean order p is determined by the observer's position.

## The Digest Cycle

```
read          →    read the ruler
consider      →    compute the F-mean
print         →    write the result
loop          →    repeat
```

This is a REPL. The protocol is a read-eval-print loop.

## The Horn Clause Reading

```
ruler_has_value(V) :- M_p(ruler, V).
```

The head is `ruler_has_value(V)`. The body is `M_p(ruler, V)`.

## The REPL Server

From `rosetta/src/main.ts`:

```typescript
const replCli = repl.start({
    prompt: 'Node.js via stdin> ',
    useGlobal: true,
    input: process.stdin,
    output: process.stdout,
    eval: myEval,
    writer: myWriter
});
defineCommands(replCli, replCli.context);
replCli.on('reset', () => defineCommands(replCli, replCli.context));
```

The REPL is a Node.js REPL with custom commands. The commands are defined by `defineCommands`.

## The HTTP REPL

From `rosetta/src/main.ts`:

```typescript
const server = http
    .createServer((request, response) => {
        response.setHeader('content-type', 'multipart/octet-stream');
        replServer = repl.start({
            prompt: 'curl repl> ',
            input: request,
            output: response,
            terminal: false,
            useColors: true,
            useGlobal: false,
            eval: myEval,
            writer: myWriter
        });
        defineCommands(replServer, replServer.context);
        replServer.on('reset', () => defineCommands(replServer!, replServer.context));
    });
server.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000/");
});
```

The HTTP REPL is an HTTP server that starts a Node.js REPL on each request. The REPL has custom commands.

## The Define Commands

From `rosetta/src/define.commands.ts`:

```typescript
export default function defineCommands(replServer: REPLServer, context: any) {
    // Define custom REPL commands
}
```

The `defineCommands` function defines custom REPL commands. The commands are available in the REPL.

## The Digest as Closure Test

The digest is the closure test. The fold is the XOR of all positions. When the fold is zero, the frame is set.

```typescript
function digest(handler, positions) {
  let fold = 0;
  for (const position of positions) {
    const value = handler[position] ?? 0;
    fold = (fold ^ value) >>> 0;
  }
  return { fold, closed: fold === 0, positions: [...positions] };
}
```

The digest of zeros closes. A nonzero position opens the digest.

## The REPL as the Protocol

The protocol is a REPL. The digest is the read-eval-print loop. The ruler is the state. The F-mean is the evaluation. The closure is the print.

```
read      — read the ruler
eval      — compute the F-mean
print     — write the result
loop      — repeat
```

The protocol is a read-eval-print loop. The digest is the loop. The ruler is the state. The F-mean is the evaluation.
