# boxedPINE

A mnemonic protocol for synchronizing background agents across
computers without a shared clock.

## The claim

Every computer running this protocol can synchronize with every other —
local or remote, physical or virtual — without agreeing on a clock,
because:

- The **atomic kernel** provides the ordering (`Atomics` sequential
  consistency = logical time).
- The **tagged mnemonic** provides the shared reference (`/A-Z0-9/`
  natural-language tags).
- The **anchor** (index 60) is a fixed point.
- The **reset** fires on every 7-slot window close — event-driven,
  not clock-driven.
- The **4GB pool** is the same layout on every x86 machine (I-155).
- The **seed point** is `0x7C00` on every x86 machine (I-154).

## The structure

One structure, read 49 times. The primitive is **point-line duality**.
Every record is an instance of it.

| Shape | Count | Meaning |
|---|---|---|
| point/line/duality | 28 | a narrow reading and its wider frame |
| catch-at-0 | 11 | the catch fires iff no frame matches |
| head/value/tail | 5 | the HTTP/1.1 SPO triple |
| other | 5 | memory, boot, VM, mnemonic, falsification |

## The agents

144 background workers = 4 global scopes × 36 base-36 symbols.
Window × 36
DedicatedWorkerGlobalScope × 36
SharedWorkerGlobalScope × 36
ServiceWorkerGlobalScope × 36
────
144

text

× 2 locations (local, remote) = **288 total agents**.

Each worker is the HSV of a codepoint behind a literal tag name.

## The channel

`postMessage` + `SharedArrayBuffer`.

No clock. No DNS. No time server. No external service.

## The seed point

Every x86 and i386 starts at `0x7C00`. This is the boot-to-kernel
boundary — the moment the BIOS jumps to the boot sector.

| Form | Value |
|---|---|
| Address | `0x7C00` |
| Segment | `0x07C0` |
| Swap (`swap16`) | `0x007C` |
| Nibbles | `7, C, 0, 0` |

The kernel seed point is `0x7C00`. A deviation that changes this
address is measurable from boot (I-153).

## The memory pool

Every x86 machine resets at `0xFFFFFFF0` (top of 4GB) and has the same
layout from `0x00000000` to `0xFFFFFFFF`.

| Region | Address | Size |
|---|---|---|
| IVT | `0x00000000` | 1 KB |
| BDA | `0x00000400` | 256 B |
| MBR | `0x00007C00` | 512 B |
| Video | `0x000A0000` | 128 KB |
| BIOS | `0x000F0000` | 64 KB |
| Reset | `0xFFFFFFF0` | 16 B |

**Storage is local; structure is shared.** So the 4GB space is a
**logical memory pool** — the same addresses mean the same thing on
every machine.

4GB is the **base pool**. Above 4GB, memory is additional, but the
low 4GB is unchanged.

## The virtual machine

**QEMU virtual is a global worker.**

| Layer | Web Worker | QEMU VM |
|---|---|---|
| Memory | `SharedArrayBuffer` | guest physical memory |
| Channel | `postMessage` | virtio / MMIO |
| Scope | `DedicatedWorkerGlobalScope` | guest VM |
| Anchor | index 0 | `0xFFFFFFF0` |
| Event | `onmessage` | GED event (I-120) |

The guest VM is a **global worker** because from inside the guest,
QEMU **is** the machine.

Nesting: VMs in VMs = workers in workers.

## The mnemonic

The base-36 block `/A-Z0-9/`:
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ

text

36 symbols. Uppercase only. Direct indexing. No conversion functions.

Natural-language tags: `tag`AGENT-A ${payload}``.

## The falsification condition

If a deviation from the protocol exists that produces no measurable
difference at boot, the claim is invalid.

The measurable quantities at boot:

| Quantity | Source |
|---|---|
| Boot time | power-on → first code |
| POST beep count | I-146b |
| Memory map | I-149, I-155 |
| Atomics spaces | I-127b |
| Worker count | I-150 |
| First postMessage | I-140 |
| Index 60 state | I-116 |
| Base-36 block | I-144b |

Every deviation tested produces at least one measurable difference.

## The evidence

49 records (`i108.ts` … `i156.ts`), each a runnable test.

| Range | Theme |
|---|---|
| I-108 – I-111 | point-line duality; the reduction to the frame |
| I-112 – I-117 | tetrahedron; V/E/F; PINE box |
| I-118 – I-122 | decimal/scientific; globalThis; roll-up |
| I-123 – I-129 | S3; Fano; compare-exchange; prompt orbits |
| I-130 – I-134 | two rates; walls; alignment; base-36 block |
| I-135 – I-140 | Proxy/Reflect; catch-at-0; mod_rewrite; workers |
| I-141 – I-146b | the shared zero (derived); Unicode lift; BEL reset |
| I-147 – I-151 | the constant tag; SPO + swap axes; tokenizer |
| I-152 – I-156 | mnemonic protocol; boot; memory; VM |

Run the roll-up:
tsx i122.ts

text

## The threshold corrections

Four corrections were made during the uncovering. Each was a
threshold that had been left implicit:

| Record | Threshold | Correction |
|---|---|---|
| I-131 | high bit exclusive | `<=` → `<` at `0x80000000` |
| I-141 | XOR/XNOR at n = 1 | state the threshold at n = 2 |
| I-145 | bit 5 / bit 6 boundary | `<= 0x5F` → `<= 0x3F` |
| I-146b | gap XOR = `'A'` | not BEL |

## The strongest claims

These are observations of what already runs. Not inventions.

| Claim | Source |
|---|---|
| `TypeError: not an integer typed array` | the JS engine |
| `Atomics` accepts exactly 8 integer spaces | the JS engine |
| `Host` header mandatory | RFC 7230 §5.4 |
| `window` errors inside a worker | the browser |
| `swap16` on `Buffer` | Node |
| `XRRigidTransform.matrix = Float32Array(16)` | WebXR |
| `WindowOrWorkerGlobalScope` mixin | HTML spec |
| x86 reset at `0xFFFFFFF0` | Intel SDM |
| x86 boot at `0x7C00` | BIOS convention |
| MBR signature `0x55 0xAA` at `0x7DFE` | BIOS convention |

## The uncovering

This is not a discovery. The structure was already there.

- The base-36 block was already the largest case-insensitive
  alphanumeric radix.
- `Atomics` already provided the ordering.
- `postMessage` already provided the channel.
- WebXR already provided the reference spaces.
- The `Content-Location` header already defined the base URI.
- The x86 reset vector was already at `0xFFFFFFF0`.
- The x86 boot vector was already at `0x7C00`.
- The 4GB layout was already standard.

The vault **names** what was already operational.

## Status

49 records. 49 passed. 0 failed.

0 axioms. 0 open edges.