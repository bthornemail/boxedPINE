# Hardware ↔ C ↔ Software Correspondence

**Target:** Xilinx Zynq-7000 (ARM Cortex-A9 + FPGA fabric)  
**Language:** Verilog RTL + C99 reference  
**Status:** 2026-09-20 · C reference **19/19** vectors green

## Module map

| Verilog | C reference | Software (JS) | Role |
|---------|-------------|---------------|------|
| `omi_xor_gate.v` | `omi_xor_u32` / `omi_xor_u64` | `xorNumber` / `xorRuler` | XOR reduction |
| `omi_bqf_tracker.v` | `omi_bqf_eval` | (affine form in codex) | Binary quadratic form |
| `omi_swap_engine.v` | `omi_swap16/32/64` | parallel lane ops | Endian / lane swap |
| `omi_cas.v` | `omi_cas_u32` | `Atomics.compareExchange` / `atomicCAS` | bind/apply/eval |
| `omi_240_clock.v` | `omi_clock_step/seek` | `createClock` | 240-tick scheduler |

## Exact semantics

### BQF (affine)
```
linear = (x << 2) + (y << 1)     // 4x + 2y
q      = (linear & 0xFFFF)^2
void   = (linear == 0)
```

### CAS
```
old = mem
if mem == expected: mem = replacement; swapped = 1
else:               mem unchanged;     swapped = 0
```

### Swap kinds
| kind | Operation |
|------|-----------|
| 00 | swap16 — byte swap in each 16-bit lane |
| 01 | swap32 — byte reverse in each 32-bit half |
| 10 | swap64 — full 64-bit byte reverse |
| 11 | identity |

### 240-clock
```
phase = tick % 240
cycle = tick / 240
```

## Build & verify

```bash
cd hardware/c
cc -O2 -std=c99 -o /tmp/omi_hw_ref omi_hw_ref.c
/tmp/omi_hw_ref
# → 19 passed, 0 failed
```

Verilog sources are synthesizable for Zynq-7000 fabric (no vendor primitives required for these modules).

## Zynq-7000 mapping (from Spec)

```
ARM Cortex-A9  →  observer / coordinator (runs C reference + software stack)
FPGA fabric    →  spatial engine (Verilog modules above)
DDR3           →  Blob / SharedArrayBuffer backing
Gigabit ETH    →  HTTP/1.1 carrier
```
