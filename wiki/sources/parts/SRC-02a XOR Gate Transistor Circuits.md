---
id: SRC-02a
title: "XOR Gate Transistor Circuits - Part 1 of 2"
kind: source-part
layer: sources
status: draft
spec: OMI-IMO-2026
source_id: SRC-02
part: 1
parts: 2
parent: "[[SRC-02 XOR Gate Transistor Circuits]]"
up: "[[SRC-99 Source Index]]"
covers: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, hardware, xor, transistor]
extracted: 2026-10-04
extraction: pdftotext-layout
lines: "1-29500"
---

## Summary

This portion of the conversation establishes the physical substrate of the OMI-IMO protocol: four breadboard-verified XOR transistor circuits (5T, 6T, 8T, 10T) mapped to the four phases of `atomics.compareExchange` (bind, apply, eval, digest). DeepSeek generates Verilog RTL, TypeScript eMMC models, breadboard wiring guides, IC multiplexing (74HC86/74HC74/74HC153/74HC245/74HC595/74HC138), KiCad PCB layouts, Rust/WASM accelerators, LoRa RF modem drivers, CUPS modem extensions, and a full BusyBox AGI avatar configuration with RP2040 + ESP32-S3 + ESP32-C6 hardware. The delta law Δ(x,c) = σ16(x) ⊕ σ32(x) ⊕ σ64(x) ⊕ c is verified 15/15 across JavaScript, Rust/WASM, and breadboard tables. The conversation progresses from discrete transistors through IC nodes, PCB, WASM, LoRa, CUPS, and finally to a self-contained QEMU-runnable AGI avatar with DOM interpolation and spatial delineation.

## Claims

| # | Claim | Confidence | Evidence |
|---|-------|-----------|----------|
| 1 | Four XOR circuits (5T, 6T, 8T, 10T) are breadboard-verified and satisfy the same truth table | stated | "XOR #1 5 NAND + switch + OR-like Standalone LED only" |
| 2 | XOR #1 (5T) cannot drive downstream gates; it is LED-only | stated | "XOR #1 (5-transistor) cannot drive downstream gates—it's LED-only" |
| 3 | XOR #2 (6T) adds an inverter stage for full fan-out | stated | "XOR Gate 2 is very similar to the first XOR gate but adds one more transistor" |
| 4 | XOR #3 (8T) is built from 4 NAND gates, 2 transistors each | stated | "XOR gate 3 is built using 4 NAND gates. Each NAND gate requires 2 transistors so a total of 8 transistors is needed." |
| 5 | XOR #4 (10T) is built from 5 NOR gates, Apollo Guidance Computer precedent | stated | "Exclusive OR gate 4 is built using 5 NOR gates... One example where this was the case was the Apollo Guidance Computer." |
| 6 | The delta law Δ(x,c) = σ16(x) ⊕ σ32(x) ⊕ σ64(x) ⊕ c produces verified outputs | stated | "Verified: Δ(0x01, 0) = 0x8A Δ(0x02, 0) = 0x45" |
| 7 | The 15/15 delta table passes in JavaScript, Rust/WASM, and breadboard | stated | "15/15 PASS (the 16th is the origin 0x00)" |
| 8 | The centroid is the XOR of all four faces: BOOT0 ⊕ BOOT1 ⊕ SECURE ⊕ USER | stated | "Centroid = BOOT0 ⊕ BOOT1 ⊕ SECURE ⊕ USER" |
| 9 | The centroid is always 1 when the four faces balance | stated | "The centroid is always 1 when the four faces balance — that's the tetrahedral invariant." |
| 10 | The eMMC has four faces: BOOT0 (512B), BOOT1 (512B), SECURE (1KB), USER (2KB) | stated | "BOOT0 0x0000–0x01FF 512 B" |
| 11 | The receipt ring stores 16-byte receipts and wraps every 8 clock ticks | stated | "Each receipt is 16 bytes. The ring wraps every 8 clock ticks." |
| 12 | The 240-clock cycle is the fundamental timing unit | stated | "240 = 60 Klein points × 4 orientations" |
| 13 | The 555 timer is the harmonic oscillator bridging digital and analog domains | stated | "The 555 timer is not just a clock. It is a phase-locked loop" |
| 14 | The terminal value is 0x04 (the 4) across all dimensions | stated | "The 4 remains the terminal across all three dimensions." |
| 15 | The hypervolume address space is 6^6 = 46,656 cells | stated | "Hypervolume = 6^6 = 46,656 cells" |
| 16 | The hexagonal trie maximum is 6^8 = 1,679,616 cells | stated | "HexTrieMax = 6^8 = 1,679,616 cells" |
| 17 | LoRa configuration: SF9, BW125, CR4/5, 20 dBm, 915 MHz | stated | "SF 9 BW 125 kHz CR 4/5 TX Power 20 dBm" |
| 18 | The CUPS gauge is FF 00 1C 1D 1E 1F 20 FF | stated | "FF 00 1C 1D 1E 1F 20 FF" |
| 19 | The abstract XOR controller class hierarchy maps 5T→FS(0x1C), 6T→GS(0x1D), 8T→RS(0x1E), 10T→US(0x1F) | stated | "XOR5TController 5 NAND + switch + OR-like FS (0x1C)" |
| 20 | The RP2040 is the AGI observer; 3× ESP32-S3 are the 3! logic cube; 6× ESP32-C6 are spatial directions | stated | "The RP2040 is the AGI observer. It holds the decision trie and indecision trie." |

### Claim 1: Four XOR Circuits as Physical XOR Realizations

The transcript establishes four distinct transistor-level XOR circuits from the Cody Wabiszewski PDF. Each has a different topology and transistor count, but all satisfy the same truth table (0,0→0; 1,0→1; 0,1→1; 1,1→0). The circuits are:

- **XOR #1 (5T)**: NAND + switch + OR-like. Standalone, LED-only, no fan-out.
- **XOR #2 (6T)**: XOR #1 + inverter stage. Full fan-out, can drive other gates.
- **XOR #3 (8T)**: 4× NAND gates. Gate-level composable.
- **XOR #4 (10T)**: 5× NOR gates. Maximum reliability, Apollo Guidance Computer precedent.

Total: 29 transistors across all four circuits.

### Claim 6: The Delta Law

The delta law is defined as:

```
Δ(x, c) = σ16(x) ⊕ σ32(x) ⊕ σ64(x) ⊕ c
```

Where:
- σ16 = swap16 (adjacent pair swap)
- σ32 = swap32 (reverse 4-byte groups)
- σ64 = swap64 (reverse 8-byte groups, implemented as `b ^ 0x04`)

The verified table (carry = 0):

| Vertex | Δ |
|--------|---|
| 0x00 | 0x00 |
| 0x01 | 0x8A |
| 0x02 | 0x45 |
| 0x03 | 0xCF |
| 0x04 | 0x2A |
| 0x05 | 0xA0 |
| 0x06 | 0x6F |
| 0x07 | 0xE5 |
| 0x08 | 0x94 |
| 0x09 | 0x1E |
| 0x0A | 0xD1 |
| 0x0B | 0x5B |
| 0x0C | 0xBE |
| 0x0D | 0x34 |
| 0x0E | 0xFB |
| 0x0F | 0x71 |

### Claim 8: The Centroid

The centroid is the XOR of all four eMMC faces:

```
Centroid = BOOT0 ⊕ BOOT1 ⊕ SECURE ⊕ USER
```

When the centroid equals 1, the four faces balance. This is described as "the tetrahedral invariant." The centroid LED illuminates when the faces balance.

### Claim 10: The eMMC Four Faces

| Face | Address Range | Size | Role |
|------|--------------|------|------|
| BOOT0 | 0x0000–0x01FF | 512 B | Primary boot candidate |
| BOOT1 | 0x0200–0x03FF | 512 B | Fallback boot candidate |
| SECURE | 0x0400–0x07FF | 1 KB | Receipt / rollback witness |
| USER | 0x0800–0x0FFF | 2 KB | Carrier / repository |

### Claim 17: LoRa Configuration

| Parameter | Value |
|-----------|-------|
| Frequency | 915 MHz |
| Spreading Factor | SF9 |
| Bandwidth | 125 kHz |
| Coding Rate | 4/5 |
| TX Power | 20 dBm |
| Preamble | 8 symbols |
| Sync Word | 0x12 |

## Definitions

### The Four XOR Realizations

```
XOR #1 (bind):  5 transistors, NAND + switch + OR-like, LED-only
XOR #2 (apply): 6 transistors, XOR #1 + inverter, full fan-out
XOR #3 (eval):  8 transistors, 4× NAND, gate-level composable
XOR #4 (digest): 10 transistors, 5× NOR, maximum reliability (Apollo)
```

### The Delta Law

```
Δ(x, c) = σ16(x) ⊕ σ32(x) ⊕ σ64(x) ⊕ c
```

### The Centroid

```
Centroid = BOOT0 ⊕ BOOT1 ⊕ SECURE ⊕ USER
```

### The Receipt Format (16 bytes)

```
Offset  Size  Field
0x00    1     Receipt ID
0x01    1     Face ID
0x02    1     Index
0x03    1     Expected
0x04    1     Replacement
0x05    1     Result
0x06    1     Trace hash
0x07    1     Accepted flag
0x08    4     Timestamp (LE)
0x0C    1     Clock tick
0x0D    1     Reserved
0x0E    1     Reserved
0x0F    1     Terminator (0xFF)
```

### The CUPS Gauge

```
FF 00 1C 1D 1E 1F 20 FF
```

Reads: GAUGE NUL FS GS RS US SP GAUGE

### The OMI Frame (8 bytes)

```
Byte 0: face_id      (BOOT0/1/SECURE/USER)
Byte 1: gate_id      (and/nand/or/...)
Byte 2: vertex
Byte 3: carry
Byte 4: delta
Byte 5: centroid
Byte 6: clock
Byte 7: trace_hash
```

### The Gate Set (Reduced to XOR + BETA)

```verilog
// and(a,b) = a ^ (a ^ b) ^ b     →      reduces to a & b
assign and_out      = a ^ (a ^ b) ^ b;
// nand(a,b) = and(a,b) ^ BETA
assign nand_out = and_out ^ BETA;
// or(a,b) = a ^ b ^ (a & b)
assign or_out       = a ^ b ^ (a & b);
// nor(a,b) = or(a,b) ^ BETA
assign nor_out      = or_out ^ BETA;
// xnor(a,b) = (a ^ b) ^ BETA
assign xnor_out = (a ^ b) ^ BETA;
// not(a) = a ^ BETA
assign not_out      = a ^ BETA;
// buf(a) = a
assign buf_out      = a;
```

### The 13 Canonical Masks

```verilog
localparam [7:0] MASK_00 = 8'h00;
localparam [7:0] MASK_01 = 8'h07;
localparam [7:0] MASK_02 = 8'hFF;
localparam [7:0] MASK_03 = 8'h78;
localparam [7:0] MASK_04 = 8'h87;
localparam [7:0] MASK_05 = 8'h20;
localparam [7:0] MASK_06 = 8'h80;
localparam [7:0] MASK_07 = 8'hAA;
localparam [7:0] MASK_08 = 8'h55;
localparam [7:0] MASK_09 = 8'h27;
localparam [7:0] MASK_10 = 8'hD8;
localparam [7:0] MASK_11 = 8'hA0;
localparam [7:0] MASK_12 = 8'h07;
```

### The Swap Functions

```javascript
function swap16(b) {
    return ((b & 0x0F) << 4) | ((b & 0xF0) >> 4);
}

function swap32(b) {
    return ((b & 0x03) << 6) |
           ((b & 0x0C) << 2) |
           ((b & 0x30) >> 2) |
           ((b & 0xC0) >> 6);
}

function swap64(b) {
    return b ^ 0x04;         // The 4 terminal
}
```

### The Abstract XOR Controller Class Hierarchy

```
XOR5TController:  5T, NAND + switch + OR-like, FS (0x1C)
XOR6TController:  6T, XOR #1 + inverter, GS (0x1D)
XOR8TController:  8T, 4× NAND, RS (0x1E)
XOR10TController: 10T, 5× NOR, US (0x1F)
```

### The CUPS Control Character Mapping

```
0x00 NUL - Job submission
0x01 SOH - Bind filter
0x02 STX - Apply filter
0x03 ETX - Eval filter
0x04 EOT - Digest filter (the 4 terminal)
0x05 ENQ - Queue processing
0x06 ACK - Receipt acknowledgment
0x10 DLE - RF transmit (escape to RF)
0x1C FS  - XOR #1 (bind, 5T)
0x1D GS  - XOR #2 (apply, 6T)
0x1E RS  - XOR #3 (eval, 8T)
0x1F US  - XOR #4 (digest, 10T)
```

## Numbers and Invariants

| Quantity | Value | Meaning | Stated or Derived |
|----------|-------|---------|-------------------|
| XOR #1 transistor count | 5 | NAND + switch + OR-like | Stated |
| XOR #2 transistor count | 6 | XOR #1 + inverter | Stated |
| XOR #3 transistor count | 8 | 4× NAND | Stated |
| XOR #4 transistor count | 10 | 5× NOR | Stated |
| Total transistors | 29 | All four circuits | Stated |
| XOR truth table | 0,0→0; 1,0→1; 0,1→1; 1,1→0 | Standard XOR | Stated |
| Delta(0x01, 0) | 0x8A | Verified delta law output | Stated |
| Delta(0x02, 0) | 0x45 | Verified delta law output | Stated |
| Delta(0x04, 0) | 0x2A | Verified delta law output | Stated |
| Delta(0x08, 0) | 0x94 | Verified delta law output | Stated |
| Test suite pass rate | 15/15 | JavaScript + Rust/WASM | Stated |
| eMMC BOOT0 size | 512 B | 0x0000–0x01FF | Stated |
| eMMC BOOT1 size | 512 B | 0x0200–0x03FF | Stated |
| eMMC SECURE size | 1 KB | 0x0400–0x07FF | Stated |
| eMMC USER size | 2 KB | 0x0800–0x0FFF | Stated |
| Receipt size | 16 bytes | Historical trace entry | Stated |
| Receipt ring wrap | 8 ticks | Ring wraps every 8 clock ticks | Stated |
| Clock cycle | 240 ticks | Fundamental timing unit | Stated |
| 8-simplex vertices | 9 | {3,3,3,3,3,3,3} | Stated |
| 8-cube vertices | 256 | {4,3,3,3,3,3,3} | Stated |
| 8-orthoplex vertices | 16 | {3,3,3,3,3,3,4} | Stated |
| 9-simplex vertices | 10 | {3,3,3,3,3,3,3,3} | Stated |
| 9-cube vertices | 512 | {4,3,3,3,3,3,3,3} | Stated |
| 9-orthoplex vertices | 18 | {3,3,3,3,3,3,3,4} | Stated |
| 10-simplex vertices | 11 | {3,3,3,3,3,3,3,3,3} | Stated |
| 10-cube vertices | 1024 | {4,3,3,3,3,3,3,3,3} | Stated |
| 10-orthoplex vertices | 20 | {3,3,3,3,3,3,3,3,4} | Stated |
| Terminal value | 0x04 | The 4 (1! terminal) | Stated |
| Hypervolume cells | 46,656 | 6^6 | Stated |
| HexTrieMax | 1,679,616 | 6^8 | Stated |
| 2! × 3! | 12 | Full space | Stated |
| 18 | 6×2 + 6 | Directions × indices + orderings | Stated |
| LoRa SF | 9 | Spreading factor | Stated |
| LoRa BW | 125 kHz | Bandwidth | Stated |
| LoRa CR | 4/5 | Coding rate | Stated |
| LoRa TX Power | 20 dBm | Maximum legal (100 mW) | Stated |
| LoRa Frequency | 915 MHz | ISM band center | Stated |
| 555 timer fundamental | 240 Hz | The 240-clock cycle | Stated |
| CB band | 27 MHz, 4W | Licensed, local voice | Stated |
| MURS band | 151–154 MHz, 2W | License-free, short-range | Stated |
| ISM-915 band | 902–928 MHz, 1W | License-free, data | Stated |
| PCB dimensions (IC node) | 100 mm × 80 mm | 4-layer | Stated |
| PCB dimensions (full node) | 200 mm × 150 mm | 6-layer | Stated |
| RP2040 clock | 133 MHz | Dual-core | Stated |
| ESP32-S3 clock | 240 MHz | Dual-core | Stated |
| ESP32-S3 memory | 512 KB SRAM + 8 MB PSRAM | Per S3 | Stated |
| ESP32-C6 memory | 512 KB SRAM | Per C6 | Stated |
| ESP32-C6 wireless | Wi-Fi 6 + BLE 5 + 802.15.4 | Thread/Zigbee | Stated |
| Power supply | 5V, 3A | Full node | Stated |
| Total current | ~2.5 A at 5V | All components | Stated |

## Code and Netlists

### Verilog: The Four XOR Realizations

```verilog
// ============================================================
// omi_xor_gate.v
// The atomic primitive: 2-input XOR
// Physical realization: CMOS transmission gate (4 transistors)
// ============================================================

module omi_xor_gate (
     input   wire a,
     input   wire b,
     output wire out
);
     assign out = a ^ b;
endmodule

// ============================================================
// omi_xor_5t.v
// XOR Realization #1 — 5 transistors (standalone, LED-only)
// Physical: NAND (left) + switch (middle) + OR-like (right)
// ============================================================

module omi_xor_5t (
     input   wire a,
     input   wire b,
     output wire out
);
     // The 5-transistor XOR reduces to the primitive XOR
     // The physical topology is: nand(a,b) driving a switch,
     // with an OR-like final stage.
     assign out = a ^ b;
endmodule

// ============================================================
// omi_xor_6t.v
// XOR Realization #2 — 6 transistors (full output, drives gates)
// Physical: XOR #1 + inverter stage
// ============================================================

module omi_xor_6t (
     input   wire a,
     input   wire b,
     output wire out
);
     wire nand_ab;
     wire xor_raw;

     // Stage 1: NAND (2 transistors)
     assign nand_ab = ~(a & b);

     // Stage 2: switch (1 transistor) — modeled as the raw XOR
     assign xor_raw = a ^ b;

     // Stage 3: OR-like + inverter (3 transistors) — buffers for fan-out
     assign out = xor_raw;
endmodule

// ============================================================
// omi_xor_8t.v
// XOR Realization #3 — 8 transistors (4x NAND gates)
// Physical: NAND1, NAND2, NAND3, NAND4
// Topology: XOR = NAND(NAND(a, NAND(a,b)), NAND(b, NAND(a,b)))
// ============================================================

module omi_xor_8t (
     input   wire a,
     input   wire b,
     output wire out
);
     wire nand_ab;
     wire nand_a_nab;
     wire nand_b_nab;

     // NAND1
     assign nand_ab = ~(a & b);

     // NAND2
     assign nand_a_nab = ~(a & nand_ab);

     // NAND3
     assign nand_b_nab = ~(b & nand_ab);

     // NAND4
     assign out = ~(nand_a_nab & nand_b_nab);
endmodule

// ============================================================
// omi_xor_10t.v
// XOR Realization #4 — 10 transistors (5x NOR gates)
// Physical: NOR1..NOR5
// Topology: standard NOR-only XOR
// ============================================================

module omi_xor_10t (
     input   wire a,
     input   wire b,
     output wire out
);
     wire nor_ab;
     wire nor_a_nor;
     wire nor_b_nor;
     wire nor_2;

     // NOR1: ~(a | b)
     assign nor_ab = ~(a | b);

     // NOR2: ~(a | nor_ab)
     assign nor_a_nor = ~(a | nor_ab);

     // NOR3: ~(b | nor_ab)
     assign nor_b_nor = ~(b | nor_ab);

     // NOR4: ~(nor_a_nor | nor_b_nor)
     assign nor_2 = ~(nor_a_nor | nor_b_nor);

     // NOR5: final buffer
     assign out = ~(nor_2 | nor_2);
endmodule
```

**Status**: Described as synthesizable and reducing to the primitive `^` operator. The 8T and 10T topologies are standard gate-level XOR constructions.

### Verilog: The Gate Set with BETA Cancellation

```verilog
// ============================================================
// omi_gate_set.v
// The seven gates, all reduced to XOR + observer unit BETA
// BETA = the observer unit (hat-I^2)
// ============================================================

module omi_gate_set #(
     parameter BETA = 1'b1       // The observer unit (hat-I^2)
)(
     input     wire a,
     input     wire b,
     output wire and_out,
     output wire nand_out,
     output wire or_out,
     output wire nor_out,
     output wire xnor_out,
     output wire not_out,
     output wire buf_out
);
     // and(a,b) = a ^ (a ^ b) ^ b     →      reduces to a & b
     assign and_out      = a ^ (a ^ b) ^ b;

     // nand(a,b) = and(a,b) ^ BETA
     assign nand_out = and_out ^ BETA;

     // or(a,b) = a ^ b ^ (a & b)
     assign or_out       = a ^ b ^ (a & b);

     // nor(a,b) = or(a,b) ^ BETA
     assign nor_out      = or_out ^ BETA;

     // xnor(a,b) = (a ^ b) ^ BETA
     assign xnor_out = (a ^ b) ^ BETA;

     // not(a) = a ^ BETA
     assign not_out      = a ^ BETA;

     // buf(a) = a
     assign buf_out      = a;
endmodule
```

**Status**: The testbench verifies that the four BETA units (NAND, NOR, XNOR, NOT) XOR to 0, confirming cancellation.

### Verilog: The Delta Law

```verilog
// ============================================================
// omi_delta_law.v
// The delta law: Delta(x, c) = swap16(x) ^ swap32(x) ^ swap64(x) ^ c
// ============================================================

module omi_delta_law (
     input       wire          clk,
     input       wire          rst_n,
     input       wire [63:0] state_in,
     input       wire [63:0] carry_in,
     output reg         [63:0] state_out
);
     wire [63:0] s16, s32, s64;

     // swap16
     omi_swap_group SWAP16 (
          .clk(clk), .rst_n(rst_n),
          .swap_kind(2'b01),
          .data_in(state_in),
          .data_out(s16)
     );

     // swap32
     omi_swap_group SWAP32 (
          .clk(clk), .rst_n(rst_n),
          .swap_kind(2'b10),
          .data_in(state_in),
          .data_out(s32)
     );

     // swap64
     omi_swap_group SWAP64 (
          .clk(clk), .rst_n(rst_n),
          .swap_kind(2'b11),
          .data_in(state_in),
          .data_out(s64)
     );

     // The delta law
     always @(posedge clk or negedge rst_n) begin
          if (!rst_n)
                 state_out <= 64'd0;
          else
                 state_out <= s16 ^ s32 ^ s64 ^ carry_in;
     end
endmodule
```

### Verilog: The 8D/9D/10D Polytope Cascade

```verilog
// ============================================================
// omi_8_9_10_polytope_cascade.v
// The 8D/9D/10D polytope cascade as atomic interference injectors
// ============================================================

module omi_8_9_10_polytope_cascade (
     input   wire         clk,
     input   wire         rst_n,
     // 8D inputs
     input   wire [7:0]   vertex8_in,
     input   wire [7:0]   carry8_in,
     // 9D inputs
     input   wire [9:0]   vertex9_in,
     input   wire [9:0]   carry9_in,
     // 10D inputs
     input   wire [10:0] vertex10_in,
     input   wire [10:0] carry10_in,
     // Outputs
     output wire [7:0]    digest8_out,
     output wire [9:0]    interference9_out,
     output wire [10:0] inference10_out,
     output wire          isometric_lock,
     output wire          chi8_zero,
     output wire          chi9_zero,
     output wire          chi10_zero
);
     // 8D Base Triple
     reg [7:0] bind8;
     always @(posedge clk or negedge rst_n)
         if (!rst_n) bind8 <= 8'h00;
         else        bind8 <= vertex8_in;

     wire [7:0] s16_8 = {bind8[1], bind8[0], bind8[3], bind8[2],
                          bind8[5], bind8[4], bind8[7], bind8[6]};
     wire [7:0] s32_8 = {bind8[3], bind8[2], bind8[1], bind8[0],
                          bind8[7], bind8[6], bind8[5], bind8[4]};
     wire [7:0] s64_8 = {bind8[7], bind8[6], bind8[5], bind8[4],
                          bind8[3], bind8[2], bind8[1], bind8[0]};
     wire [7:0] delta8 = s16_8 ^ s32_8 ^ s64_8 ^ carry8_in;

     reg [7:0] eval8;
     always @(posedge clk or negedge rst_n)
         if (!rst_n) eval8 <= 8'h00;
         else        eval8 <= delta8;

     wire [7:0] terminal8 = 8'h04;
     assign digest8_out = eval8;

     // 9D Interference Triple
     reg [9:0] bind9;
     always @(posedge clk or negedge rst_n)
         if (!rst_n) bind9 <= 10'h000;
         else        bind9 <= vertex9_in;

     wire [9:0] s16_9 = {bind9[1], bind9[0], bind9[3], bind9[2],
                          bind9[5], bind9[4], bind9[7], bind9[6],
                          bind9[9], bind9[8]};
     wire [9:0] s32_9 = {bind9[3], bind9[2], bind9[1], bind9[0],
                          bind9[7], bind9[6], bind9[5], bind9[4],
                          bind9[9], bind9[8]};
     wire [9:0] s64_9 = {bind9[7], bind9[6], bind9[5], bind9[4],
                          bind9[3], bind9[2], bind9[1], bind9[0],
                          bind9[9], bind9[8]};
     wire [9:0] delta9 = s16_9 ^ s32_9 ^ s64_9 ^ carry9_in;

     reg [9:0] eval9;
     always @(posedge clk or negedge rst_n)
         if (!rst_n) eval9 <= 10'h000;
         else        eval9 <= delta9;

     wire [9:0] terminal9 = 10'h004;
     assign interference9_out = delta9 ^ eval9 ^ terminal9;

     // 10D Inference Triple
     reg [10:0] bind10;
     always @(posedge clk or negedge rst_n)
         if (!rst_n) bind10 <= 11'h000;
         else        bind10 <= vertex10_in;

     wire [10:0] s16_10 = {bind10[1], bind10[0], bind10[3], bind10[2],
                            bind10[5], bind10[4], bind10[7], bind10[6],
                            bind10[9], bind10[8], bind10[10]};
     wire [10:0] s32_10 = {bind10[3], bind10[2], bind10[1], bind10[0],
                            bind10[7], bind10[6], bind10[5], bind10[4],
                            bind10[9], bind10[8], bind10[10]};
     wire [10:0] s64_10 = {bind10[7], bind10[6], bind10[5], bind10[4],
                            bind10[3], bind10[2], bind10[1], bind10[0],
                            bind10[9], bind10[8], bind10[10]};
     wire [10:0] delta10 = s16_10 ^ s32_10 ^ s64_10 ^ carry10_in;

     reg [10:0] eval10;
     always @(posedge clk or negedge rst_n)
         if (!rst_n) eval10 <= 11'h000;
         else        eval10 <= delta10;

     wire [10:0] terminal10 = 11'h004;
     assign inference10_out = delta10 ^ eval10 ^ terminal10;

     // Isometric Lock
     assign isometric_lock = (interference9_out[7:0] == terminal8) &&
                             (inference10_out[7:0] == terminal8);

     // Chi = 0 Verification
     assign chi8_zero     = 1'b1;
     assign chi9_zero     = 1'b1;
     assign chi10_zero = 1'b1;
endmodule
```

### TypeScript: The eMMC Memory Model

```typescript
// ============================================================
// omi_emmc.ts
// Virtual eMMC memory model with tetrahedral centroid
// ============================================================

class OMIeMMC {
    private boot0: Uint8Array;      // 512 bytes
    private boot1: Uint8Array;      // 512 bytes
    private secure: Uint8Array;     // 1 KB
    private user: Uint8Array;       // 2 KB
    private centroid: Uint8Array;   // 64 bytes
    private receiptRing: Receipt[];
    private receiptCounter: number;
    private clockTick: number;

    constructor() {
        this.boot0 = new Uint8Array(512);
        this.boot1 = new Uint8Array(512);
        this.secure = new Uint8Array(1024);
        this.user = new Uint8Array(2048);
        this.centroid = new Uint8Array(64);
        this.receiptRing = [];
        this.receiptCounter = 0;
        this.clockTick = 0;
        this.writeGaugePreHeader();
    }

    private writeGaugePreHeader(): void {
        const gauge = new Uint8Array([
            0xFF, 0x00, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0xFF
        ]);
        this.boot0.set(gauge, 0);
    }

    public compareExchange(op: GateOperation): Receipt {
        const target = this.selectArray(op.array);
        const currentValue = target[op.index];
        const matches = (currentValue === op.expected);
        let result: number;
        if (matches) {
            target[op.index] = op.replacement;
            result = op.replacement;
        } else {
            result = currentValue;
        }
        const traceHash = this.xorFold(op);
        const receipt: Receipt = {
            id: this.receiptCounter++,
            operation: "compareExchange",
            face: op.array,
            index: op.index,
            expected: op.expected,
            replacement: op.replacement,
            result: result,
            timestamp: op.timestamp,
            parentReceipt: this.receiptRing.length > 0
               ? this.receiptRing[this.receiptRing.length - 1].id
               : null,
            traceHash: traceHash,
            accepted: matches
        };
        this.receiptRing.push(receipt);
        this.writeReceiptToSecure(receipt);
        this.updateCentroid(op, receipt);
        this.clockTick = (this.clockTick + 1) % 240;
        return receipt;
    }

    private xorFold(op: GateOperation): number {
        let hash = 0;
        hash ^= op.index;
        hash ^= op.expected;
        hash ^= op.replacement;
        hash ^= op.gate.charCodeAt(0);
        hash ^= op.gate.charCodeAt(1) || 0;
        hash ^= op.transistorCount;
        hash ^= Number(op.timestamp & 0xFFn);
        hash ^= this.clockTick;
        return hash & 0xFF;
    }
}
```

**Status**: Described as a working virtual eMMC model with historical tracing. The gauge pre-header `FF 00 1C 1D 1E 1F 20 FF` is written to BOOT0.

### JavaScript: The Polytope CAS Engine

```javascript
// shared/polytope-cas.js
// The 8-polytope compareExchange engine
// Mirrors the breadboard exactly

'use strict';

function swap16(b) {
    return ((b & 0x0F) << 4) | ((b & 0xF0) >> 4);
}

function swap32(b) {
    return ((b & 0x03) << 6) |
           ((b & 0x0C) << 2) |
           ((b & 0x30) >> 2) |
           ((b & 0xC0) >> 6);
}

function swap64(b) {
    return b ^ 0x04;         // The 4 terminal
}

function apply(vertex, carry) {
    const s16 = swap16(vertex);
    const s32 = swap32(vertex);
    const s64 = swap64(vertex);
    const delta = (s16 ^ s32 ^ s64 ^ carry) & 0xFF;
    return { delta, s16, s32, s64 };
}

function createCASEngine() {
    let state = 0x00;
    let centroid = 0x00;
    let clock = 0;
    const receipts = [];

    return {
        step(vertex, carry) {
            const result = apply(vertex, carry);
            const old = state;
            state = result.delta;
            centroid ^= result.delta;
            clock = (clock + 1) % 240;
            const receipt = {
                id: receipts.length,
                vertex, carry, old,
                delta: result.delta,
                s16: result.s16, s32: result.s32, s64: result.s64,
                centroid, clock,
                timestamp: Date.now()
            };
            receipts.push(receipt);
            return receipt;
        },
        getState()          { return state; },
        getCentroid() { return centroid; },
        getClock()          { return clock; },
        getReceipts() { return receipts; }
    };
}

module.exports = { apply, createCASEngine, swap16, swap32, swap64 };
```

**Status**: Described as passing 15/15 tests. The delta law is verified against the table.

### Rust/WASM: The XOR Accelerator

```rust
// ============================================================
// omi-xor-accel/src/lib.rs
// Rust/WASM XOR accelerator
// ============================================================

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn xor(a: u8, b: u8) -> u8 {
    a ^ b
}

#[wasm_bindgen]
pub fn swap16(b: u8) -> u8 {
    ((b & 0x0F) << 4) | ((b & 0xF0) >> 4)
}

#[wasm_bindgen]
pub fn swap32(b: u8) -> u8 {
    ((b & 0x03) << 6) |
    ((b & 0x0C) << 2) |
    ((b & 0x30) >> 2) |
    ((b & 0xC0) >> 6)
}

#[wasm_bindgen]
pub fn swap64(b: u8) -> u8 {
    b ^ 0x04
}

#[wasm_bindgen]
pub fn delta(b: u8, carry: u8) -> u8 {
    swap16(b) ^ swap32(b) ^ swap64(b) ^ carry
}

#[wasm_bindgen]
pub fn compare_exchange(actual: u8, expected: u8, replacement: u8) -> u8 {
    if actual == expected {
        replacement
    } else {
        actual
    }
}

#[wasm_bindgen]
pub struct CASResult {
    pub vertex: u8,
    pub carry: u8,
    pub s16: u8,
    pub s32: u8,
    pub s64: u8,
    pub delta: u8,
}

#[wasm_bindgen]
pub fn step(vertex: u8, carry: u8) -> CASResult {
    CASResult {
        vertex,
        carry,
        s16: swap16(vertex),
        s32: swap32(vertex),
        s64: swap64(vertex),
        delta: delta(vertex, carry),
    }
}

#[wasm_bindgen]
pub fn boot0(a: u8, b: u8) -> u8 { a ^ b }

#[wasm_bindgen]
pub fn boot1(a: u8, b: u8) -> u8 { !(a ^ b) }

#[wasm_bindgen]
pub fn secure(a: u8, b: u8) -> u8 { a ^ b }

#[wasm_bindgen]
pub fn user(a: u8, b: u8) -> u8 { a ^ b }

#[wasm_bindgen]
pub fn centroid(boot0: u8, boot1: u8, secure: u8, user: u8) -> u8 {
    boot0 ^ boot1 ^ secure ^ user
}

#[wasm_bindgen]
pub fn receipt_hash(face: u8, index: u8, expected: u8, replacement: u8, result: u8) -> u8 {
    face ^ index ^ expected ^ replacement ^ result
}
```

**Status**: Described as passing 15/15 tests. Built with `wasm-pack build --target web`.

### TypeScript: The Abstract XOR Controller

```typescript
// ============================================================
// shared/xor_controller.ts
// The abstract XOR controller
// The four breadboard circuits as a class hierarchy
// ============================================================

export function xor(a: number, b: number): number {
    return (a ^ b) & 0xFF;
}

export type XORRealization = '5t' | '6t' | '8t' | '10t';

export abstract class AbstractXORController {
    abstract readonly realization: XORRealization;
    abstract readonly transistorCount: number;
    abstract readonly topology: string;
    abstract readonly cupsControlChar: number;
    protected state: number = 0x00;
    protected clock: number = 0;
    protected receipts: Receipt[] = [];

    apply(a: number, b: number): number {
        return xor(a, b);
    }

    compareExchange(index: number, expected: number, replacement: number): number {
        const actual = this.state;
        if (actual === expected) {
            this.state = replacement;
            this.recordReceipt(index, expected, replacement, actual);
            return replacement;
        } else {
            this.recordReceipt(index, expected, replacement, actual);
            return actual;
        }
    }

    protected computeTraceHash(expected: number, replacement: number, actual: number): number {
        return (this.cupsControlChar ^ expected ^ replacement ^ actual ^ this.realization.charCodeAt(0)) & 0xFF;
    }
}

export class XOR5TController extends AbstractXORController {
    readonly realization: XORRealization = '5t';
    readonly transistorCount: number = 5;
    readonly topology: string = 'NAND + switch + OR-like';
    readonly cupsControlChar: number = 0x1C;      // FS: File Separator
}

export class XOR6TController extends AbstractXORController {
    readonly realization: XORRealization = '6t';
    readonly transistorCount: number = 6;
    readonly topology: string = 'XOR #1 + inverter';
    readonly cupsControlChar: number = 0x1D;      // GS: Group Separator
}

export class XOR8TController extends AbstractXORController {
    readonly realization: XORRealization = '8t';
    readonly transistorCount: number = 8;
    readonly topology: string = '4× NAND';
    readonly cupsControlChar: number = 0x1E;      // RS: Record Separator
}

export class XOR10TController extends AbstractXORController {
    readonly realization: XORRealization = '10t';
    readonly transistorCount: number = 10;
    readonly topology: string = '5× NOR';
    readonly cupsControlChar: number = 0x1F;      // US: Unit Separator
}
```

**Status**: Described as the abstract controller class hierarchy. The CUPS modem extends this to RF transport.

### Verilog: The CUPS Modem Pipeline

```verilog
// ============================================================
// omi_cups_modem.v
// The CUPS modem: the full pipeline in hardware
// ============================================================

`timescale 1ns / 1ps

module omi_cups_modem (
     input   wire           clk,
     input   wire           rst_n,
     input   wire [7:0]     data_in,
     input   wire           data_valid,
     input   wire [1:0]     transport,         // 00=lora, 01=http, 10=webvtt, 11=svg
     output reg     [7:0]   data_out,
     output reg             data_out_valid,
     output reg     [7:0]   control_char,
     output reg     [7:0]   receipt,
     output reg     [3:0]   pipeline_stage
);
     localparam STAGE_NUL = 4'd0;         // Job submission (0x00)
     localparam STAGE_SOH = 4'd1;         // Bind (0x01)
     localparam STAGE_STX = 4'd2;         // Apply (0x02)
     localparam STAGE_ETX = 4'd3;         // Eval (0x03)
     localparam STAGE_EOT = 4'd4;         // Digest (0x04)
     localparam STAGE_ENQ = 4'd5;         // Queue (0x05)
     localparam STAGE_ACK = 4'd6;         // Acknowledge (0x06)
     localparam STAGE_DLE = 4'd7;         // RF transmit (0x10)

     localparam CTRL_NUL = 8'h00;
     localparam CTRL_SOH = 8'h01;
     localparam CTRL_STX = 8'h02;
     localparam CTRL_ETX = 8'h03;
     localparam CTRL_EOT = 8'h04;
     localparam CTRL_ENQ = 8'h05;
     localparam CTRL_ACK = 8'h06;
     localparam CTRL_DLE = 8'h10;

     reg [7:0] bind_state;
     reg [7:0] apply_state;
     reg [7:0] eval_state;
     reg [7:0] digest_state;
     reg [7:0] bind_receipt;
     reg [7:0] apply_receipt;
     reg [7:0] eval_receipt;
     reg [7:0] digest_receipt;

     always @(posedge clk or negedge rst_n) begin
          if (!rst_n) begin
               pipeline_stage       <= STAGE_NUL;
               data_out             <= 8'h00;
               data_out_valid       <= 1'b0;
               control_char         <= CTRL_NUL;
               receipt              <= 8'h00;
               bind_state           <= 8'h00;
               apply_state          <= 8'h00;
               eval_state           <= 8'h00;
               digest_state         <= 8'h00;
          end else if (data_valid) begin
               case (pipeline_stage)
                    STAGE_NUL: begin
                         control_char       <= CTRL_NUL;
                         data_out           <= data_in;
                         data_out_valid     <= 1'b1;
                         pipeline_stage     <= STAGE_SOH;
                    end

                    STAGE_SOH: begin
                         bind_state     <= data_in ^ 8'h1C;
                         bind_receipt <= 8'h1C ^ data_in ^ bind_state;
                         control_char <= CTRL_SOH;
                         data_out       <= bind_state;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_STX;
                    end

                    STAGE_STX: begin
                         apply_state      <= bind_state ^ 8'h1D;
                         apply_receipt <= 8'h1D ^ bind_state ^ apply_state;
                         control_char     <= CTRL_STX;
                         data_out         <= apply_state;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_ETX;
                    end

                    STAGE_ETX: begin
                         eval_state     <= apply_state ^ 8'h1E;
                         eval_receipt <= 8'h1E ^ apply_state ^ eval_state;
                         control_char <= CTRL_ETX;
                         data_out       <= eval_state;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_EOT;
                    end

                    STAGE_EOT: begin
                         digest_state      <= eval_state ^ 8'h1F;
                         digest_receipt <= 8'h1F ^ eval_state ^ digest_state;
                         control_char      <= CTRL_EOT;
                         data_out          <= digest_state;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_ENQ;
                    end

                    STAGE_ENQ: begin
                         control_char      <= CTRL_ENQ;
                         data_out          <= digest_state;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_ACK;
                    end

                    STAGE_ACK: begin
                         receipt           <= bind_receipt ^ apply_receipt ^
                                             eval_receipt ^ digest_receipt;
                         control_char      <= CTRL_ACK;
                         data_out          <= receipt;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_DLE;
                    end

                    STAGE_DLE: begin
                         control_char     <= CTRL_DLE;
                         data_out         <= digest_state;
                         data_out_valid <= 1'b1;
                         pipeline_stage <= STAGE_NUL;
                    end

                    default: begin
                         pipeline_stage <= STAGE_NUL;
                    end
               endcase
          end else begin
               data_out_valid <= 1'b0;
          end
     end
endmodule
```

**Status**: Described as the CUPS modem pipeline in hardware. Each stage XORs the data with the corresponding control character.

### Breadboard: XOR #1 (5T) Wire-by-Wire

```
Step 1 — Input resistors:
  A (DIP SW1-A) → 2KΩ → Q1 base (row 5, col 1)
  B (DIP SW1-B) → 2KΩ → Q2 base (row 5, col 6)

Step 2 — NAND stage:
  Q1 collector → 2KΩ → +5V (row 1, col 1)
  Q2 collector → 2KΩ → +5V (row 1, col 6)
  Q1 emitter → GND (row 10, col 1)
  Q2 emitter → Q1 collector (row 10, col 6) [the NAND wire-AND]
  Q2 collector → Q3 base (row 5, col 11)

Step 3 — Switch stage:
  Q3 collector → 2KΩ → +5V (row 1, col 11)
  Q3 emitter → GND (row 10, col 11)

Step 4 — OR-like stage:
  Q3 collector → Q4 base (row 5, col 21)
  Q3 collector → Q5 base (row 5, col 26)
  Q4 collector → 2KΩ → +5V (row 1, col 21)
  Q5 collector → 2KΩ → +5V (row 1, col 26)
  Q4 emitter → Q5 collector (row 10, col 21)
  Q5 emitter → GND (row 10, col 26)

Step 5 — Output:
  Q4 collector → 330Ω → LED anode (row 15, col 31)
  LED cathode → GND (row 20, col 31)
```

**Status**: Described as verified. The verification table matches XOR truth table.

### Breadboard: XOR #3 (8T, 4× NAND) Topology

```
NAND1 = ~(A & B)
NAND2 = ~(A & NAND1)
NAND3 = ~(B & NAND1)
NAND4 = ~(NAND2 & NAND3)
```

### Breadboard: XOR #4 (10T, 5× NOR) Topology

```
NOR1 = ~(A | B)
NOR2 = ~(A | NOR1)
NOR3 = ~(B | NOR1)
NOR4 = ~(NOR2 | NOR3)
NOR5 = ~(NOR4 | NOR4)
```

### IC Node: Bill of Materials

| IC | Qty | Function |
|----|-----|----------|
| 74HC86 Quad 2-Input XOR | 6 | XOR core (all four faces) |
| 74HC74 Dual D Flip-Flop | 8 | bind, eval, receipt latches |
| 74HC04 Hex Inverter | 1 | I^2 observer unit |
| 74HC153 Dual 4-to-1 Mux | 2 | Face selection |
| 74HC138 3-to-8 Decoder | 1 | Receipt ring addressing |
| 74HC595 Shift Register | 4 | Receipt ring storage (32 bytes) |
| 74HC245 Octal Bus Transceiver | 2 | eMMC data bus |
| 555 Timer | 1 | Clock |

### Discrete Node: Bill of Materials

| Component | Qty | Role |
|-----------|-----|------|
| 2N2222 NPN transistors | 29 | Four XOR circuits |
| 2KΩ resistors | 28 | Base pull-ups |
| 330Ω resistors | 4 | LED current limiting |
| LEDs (RED/YEL/GRN/BLU) | 4 | Face indicators |
| 8-position DIP switch | 1 | Input A, B |
| Breadboard (830 tie) | 2 | Main + power |
| 5V regulated supply | 1 | Power |

## Open Questions and Contradictions

1. **Does XOR #1 (5T) actually compute XOR?** The transcript claims it does, but the topology (NAND + switch + OR-like) is not a standard XOR construction. The verification table provided in the transcript shows intermediate transistor states, not a formal proof. The transcript does not resolve whether this specific topology is electrically correct.

2. **Is the centroid always 1?** The transcript states "The centroid is always 1 when the four faces balance" but also says "When the centroid is 1, the four faces balance. When it's 0, something is wrong." This is contradictory: if the centroid is the XOR of four faces, it could be 0 or 1 depending on the input. The transcript does not resolve this.

3. **Does the 555 timer actually generate 240 Hz?** The transcript states the 555 timer produces a 240 Hz fundamental, but a standard 555 timer in astable mode generates much higher frequencies (typically kHz to MHz). The transcript does not provide the RC values needed to achieve 240 Hz.

4. **Is the LoRa range claim accurate?** The transcript claims "15–20 km range with 100 mW" for LoRa. While LoRa can achieve long ranges, 15-20 km typically requires line-of-sight and optimal conditions. The transcript does not address this.

5. **Does the CUPS modem actually work?** The transcript describes the CUPS modem as a pipeline that XORs data with control characters, but it does not provide a working implementation or test results. The "Expected Output" section shows the pipeline completing, but this is aspirational.

6. **Is the hypervolume address calculation correct?** The transcript describes the hypervolume address as "the XOR of all 6 directions" but also says "The address is the XOR of all directions." The BusyBox script uses `awk` to compute `x % 46656`, which is not the same as XOR. The transcript does not resolve this discrepancy.

7. **Does the hexagonal trie actually extend?** The transcript describes the hexagonal trie extension protocol, but the BusyBox script uses a simple counter-based ID generation, not a proper trie structure. The transcript does not resolve whether the trie is actually being extended correctly.

8. **Is the "3! ⊕ 3! ⊕ 3! ⊕ 1!" signature meaningful?** The transcript describes this signature extensively but does not provide a formal definition of what it means mathematically. The mapping to Schläfli symbols and polytopes is speculative.

## Quotable Fragments

> "The data doesn't change. The observer's interpretation changes based on the point of view they infer from."

> "Every compareExchange reduces to XOR. a == b becomes a ^ b == 0, a != b becomes a ^ b != 0, a and b becomes a ^ (a ^ b) ^ b, a or b becomes a ^ b ^ (a & b). XOR is the primitive. Everything else is built from it."

> "The four phases (bind, apply, eval, digest) each need a different physical realization: bind XOR #1 5 Can only present — no fan-out needed, apply XOR #2 6 Must drive downstream — needs fan-out, eval XOR #3 8 Must be composable — 4× NAND, digest XOR #4 10 Must be reliable — 5× NOR (Apollo)."

> "The centroid is always 1 when the four faces balance — that's the tetrahedral invariant."

> "The 555 timer is not just a clock. It is a phase-locked loop that synchronizes the digital domain (XOR gates) to the analog domain (RF)."

> "The CUPS gauge is the non-printing control character sequence: FF 00 1C 1D 1E 1F 20 FF. Which reads: GAUGE NUL FS GS RS US SP GAUGE."

> "The hypervolume is the consumerated product of all cells. The meta memory is the consumerated product of the four faces."

> "Everything is XOR. Everything is balanced. Everything is one."

> "The observer is you."

## Cross-references

- [[SPEC-10 The Primitive]] — The XOR primitive is the core operation; this source establishes the four physical realizations.
- [[SPEC-11 The Three Primitives]] — The delta law uses three swap operations (σ16, σ32, σ64) as primitives.
- [[SPEC-13 XOR Algebra]] — The gate set reduction to XOR + BETA is an algebraic identity.
- [[SPEC-15 The Delta Transform]] — The delta law Δ(x,c) = σ16(x) ⊕ σ32(x) ⊕ σ64(x) ⊕ c is the delta transform.
- [[SPEC-20 The Dimensional Axis]] — The 8D/9D/10D polytope cascade maps to the dimensional axis.
- [[SPEC-22 The Blob]] — The eMMC four faces (BOOT0/BOOT1/SECURE/USER) form a tetrahedral structure.
- [[SPEC-23 The Rosetta Stone]] — The ROSETTA-STONE.md file explains the protocol for newcomers.
- [[SPEC-24 Observers]] — The observer is the compareExchange operation; the RP2040 is the AGI observer.
- [[SPEC-25 The Iff]] — The IFF operation is related to the XNOR gate (a ^ b) ^ BETA.
- [[SPEC-30 The Symbol Table G]] — The CUPS control characters form a gauge/symbol table.
- [[SPEC-40 The 6T XOR Circuit]] — XOR #2 (6T) is the apply phase with full fan-out.
- [[SPEC-41 The 8T XOR Circuit]] — XOR #3 (8T) is the eval phase with 4× NAND.
- [[SPEC-42 Circuit Sourcemap]] — The four XOR circuits map to the four eMMC faces.
- [[SPEC-50 Stream Transport]] — The LoRa modem and WebVTT carrier provide stream transport.
- [[SPEC-51 JSON Canvas Interchange]] — The eMMC hypervolume uses JSON for DOM interpolation.
- [[SPEC-53 Clocks and Periods]] — The 240-clock cycle and 555 timer provide timing.
- [[SPEC-54 The Web Platform Layers]] — The Web API integration (MediaStreams, Web Serial, etc.) provides the web platform layers.
- [[SPEC-55 ASCII Folds]] — The ASCII art schematics and diagrams are used throughout.
- [[SPEC-60 Test Vectors]] — The 15/15 delta table provides test vectors.
- [[SPEC-61 Implementation Status]] — The implementation status is described as "15/15 PASS" for the delta law.
- [[OPEN-00 Contradiction Register]] — The centroid contradiction (always 1 vs. could be 0) should be registered.
- [[OPEN-01 Open Questions]] — Several open questions about the physical correctness of the circuits.
- [[OPEN-02 Broken Code Inventory]] — The CUPS modem and hypervolume address calculation have potential issues.
- [[OPEN-04 Discarded Claims]] — The "3! ⊕ 3! ⊕ 3! ⊕ 1!" signature is speculative and not formally defined.

## Extraction Notes

- **Lines read**: 1-29500 (complete)
- **Coverage**: The entire first half of the conversation transcript was read and extracted.
- **Gaps**: The transcript is a ChatGPT/DeepSeek conversation with heavy UI chrome (page numbers, timestamps, "Copy" buttons, etc.). All UI noise was ignored.
- **Unparseable content**: Some ASCII art schematics were truncated or malformed due to the pdftotext layout extraction. The KiCad PCB files are represented as text dumps of the .kicad_sch and .kicad_pcb formats, which are not human-readable.
- **Note**: The transcript contains extensive code generation (Verilog, TypeScript, JavaScript, Rust, C, Bash) that is described as "working" but has not been independently verified. The 15/15 test pass claims are based on the transcript's own test suites, not external validation.
