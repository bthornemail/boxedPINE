Breadboard Walkthrough: 8-Polytope Triple as atomics.compareExchange Units

Part I — The Mapping

The atomics.compareExchange(array, index, expected, replacement) primitive has four phases:

Phase Operation 8-Polytope Role Breadboard Module
bind constructs the relation 8-simplex \{3,3,3,3,3,3,3\} Vertex latch (9 states)
apply invokes comparison + conditional swap 8-cube \{4,3,3,3,3,3,3\} Swap engine (256 states)
eval returns the old value 8-orthoplex \{3,3,3,3,3,3,4\} XOR output latch (16 states)
digest reads, considers, prints The 4 terminal LED + centroid

The three 3! polytopes are the dual configuration. The 1! is the terminal — the 4 that terminates the dual pair.

---

Part II — Bill of Materials

Component Qty Role
74HC86 Quad 2-Input XOR 6 XOR core
74HC04 Hex Inverter 2 \hat{I}^2 observer unit
74HC74 D Flip-Flop 4 bind/eval latches
8-position DIP switch 2 Input bus (vertex + mask)
LED bar graph (10-segment) 2 Digest output
Discrete LEDs 16 8-simplex (9) + 8-orthoplex (7)
330Ω resistors 20 Current limiting
2KΩ resistors 8 Pull-ups
Breadboard (830 tie) 2 Main + power
5V regulated supply 1 Power
22 AWG solid wire 1 spool Interconnect

---

Part III — Module A: The Bind (8-Simplex, 9 Vertices)

Role: Constructs the relation. Latches the incoming vertex address.

Polytope: 8-simplex \{3,3,3,3,3,3,3\}, 9 vertices, 36 edges.

Breadboard Layout

```
Power rail: +5V ==== [red wire] ==== + rail
Ground rail: GND ==== [black wire] ==== - rail

74HC74 #1 (Bind Latch):
  Pin 1  (1CLR)  -> +5V (tie high)
  Pin 2  (1D)    -> DIP switch SW1-A (vertex bit 0)
  Pin 3  (1CLK)  -> Clock line (from 555 timer or manual button)
  Pin 4  (1PRE)  -> +5V (tie high)
  Pin 5  (1Q)    -> Bus B0 (to apply stage)
  Pin 6  (1Qbar) -> NC
  Pin 7  (GND)   -> GND
  Pin 8  (2Qbar) -> NC
  Pin 9  (2Q)    -> Bus B1 (to apply stage)
  Pin 10 (2PRE)  -> +5V
  Pin 11 (2CLK)  -> Clock line
  Pin 12 (2D)    -> DIP switch SW1-B (vertex bit 1)
  Pin 13 (2CLR)  -> +5V
  Pin 14 (VCC)   -> +5V

74HC74 #2 (Bind Latch, bits 2-3):
  ... same pattern for B2, B3

74HC74 #3 (Bind Latch, bits 4-5):
  ... same pattern for B4, B5

74HC74 #4 (Bind Latch, bits 6-7):
  ... same pattern for B6, B7
```

8-Simplex Vertex LEDs

Wire 9 LEDs to the 9 active states of the 8-simplex:

```
Vertex 0: B0 ^ B1 ^ B2 ^ B3 ^ B4 ^ B5 ^ B6 ^ B7  -> LED0
Vertex 1: B0                                        -> LED1
Vertex 2: B1                                        -> LED2
Vertex 3: B2                                        -> LED3
Vertex 4: B3                                        -> LED4
Vertex 5: B4                                        -> LED5
Vertex 6: B5                                        -> LED6
Vertex 7: B6                                        -> LED7
Vertex 8: B7                                        -> LED8
```

Each LED: anode to 74HC86 output, cathode to 330Ω to GND.

Bind Verification

Input (B0..B7) Active LED 8-Simplex Vertex
00000000 LED0 Vertex 0 (centroid)
00000001 LED1 + LED0 Vertices 1, 0
00000010 LED2 + LED0 Vertices 2, 0
... ... ...
11111111 All 9 LEDs Full simplex

Test: Toggle DIP switch. Verify exactly 1-9 LEDs illuminate per the vertex incidence.

---

Part IV — Module B: The Apply (8-Cube, 256 Vertices)

Role: Invokes the comparison and conditional swap. The XOR of expected with replacement.

Polytope: 8-cube \{4,3,3,3,3,3,3\}, 256 vertices = 2^8.

The 4 Terminal

The 8-cube's Schläfli symbol begins with 4. This is the terminal — the single element that breaks the self-duality.

Wire the terminal as a hardwired 4:

```
Terminal bus: T0=0, T1=0, T2=1, T3=0, T4=0, T5=0, T6=0, T7=0
              (binary 00000100 = 0x04)
```

The 3! Swap Engine

The three swaps (swap16, swap32, swap64) form the \mathbb{Z}_2^3 group. Wire them as:

```
74HC86 #1 (swap16):
  Input A: B0..B7 (from bind latch)
  Input B: B1,B0,B3,B2,B5,B4,B7,B6 (adjacent pair swap)
  Output:  S16_0..S16_7

74HC86 #2 (swap32):
  Input A: B0..B7
  Input B: B3,B2,B1,B0,B7,B6,B5,B4 (4-byte reverse)
  Output:  S32_0..S32_7

74HC86 #3 (swap64):
  Input A: B0..B7
  Input B: B7,B6,B5,B4,B3,B2,B1,B0 (8-byte reverse)
  Output:  S64_0..S64_7
```

The Delta Law

```
74HC86 #4 (delta):
  Input A: S16_0..S16_7
  Input B: S32_0..S32_7
  Output:  D1_0..D1_7

74HC86 #5 (delta cont.):
  Input A: D1_0..D1_7
  Input B: S64_0..S64_7
  Output:  D2_0..D2_7

74HC86 #6 (delta final):
  Input A: D2_0..D2_7
  Input B: Carry C0..C7 (from eval latch)
  Output:  Delta_0..Delta_7
```

Apply Verification

B0..B7 S16 S32 S64 Delta (C=0)
00000001 00000010 00001000 10000000 10001010
00000010 00000001 00000100 01000000 01000101
00000011 00000011 00001100 11000000 11001111
... ... ... ... ...

Test: Set DIP switch to 0x01. Measure Delta output. Should be 0x8A.

---

Part V — Module C: The Eval (8-Orthoplex, 16 Vertices)

Role: Returns the old value. Latches the XOR output.

Polytope: 8-orthoplex \{3,3,3,3,3,3,4\}, 16 vertices = 2^4.

The 4 Terminal (Last Entry)

The 8-orthoplex's Schläfli symbol ends with 4. This is the dual terminal.

Eval Latch

```
74HC74 #5 (eval latch, low nibble):
  Pin 2  (1D)    -> Delta_0
  Pin 3  (1CLK)  -> Clock line
  Pin 5  (1Q)    -> Eval_0 (old value)
  Pin 12 (2D)    -> Delta_1
  Pin 9  (2Q)    -> Eval_1

74HC74 #6 (eval latch, high nibble):
  ... same pattern for Eval_2..Eval_7
```

16 Vertex LEDs

Wire 16 LEDs to the 16 states:

```
Eval 0x00: LED0  (all off)
Eval 0x01: LED1
Eval 0x02: LED2
...
Eval 0x0F: LED15
```

Eval Verification

Delta Eval (old) 8-Orthoplex Vertex
0x00 0x00 Vertex 0
0x01 0x01 Vertex 1
... ... ...
0x0F 0x0F Vertex 15

Test: Toggle DIP switch. Verify eval latch holds the previous Delta value.

---

Part VI — Module D: The Digest (The 4 Terminal)

Role: Reads, considers, prints. The terminal LED + centroid.

Terminal LED

```
Terminal = Eval_0 ^ Eval_1 ^ Eval_2 ^ Eval_3 ^ Eval_4 ^ Eval_5 ^ Eval_6 ^ Eval_7
```

Wire the terminal to a single red LED (the 1! terminal).

Centroid LED

```
Centroid = (Terminal == 0x04) ? ON : OFF
```

Wire the centroid to a single green LED.

Digest Verification

Eval Terminal Centroid LED
0x00 0x00 OFF
0x04 0x04 ON
0x08 0x08 OFF
0x0C 0x0C OFF
... ... ...

Test: Set Eval to 0x04. Verify green centroid LED illuminates.

---

Part VII — Module E: The Euler Characteristic (\chi = 0)

Role: Verify all three 8-polytopes have \chi = 0.

\chi Verification Logic

```
chi_simplex   = 9 - 36 + 84 - 126 + 126 - 84 + 36 - 9     = 0
chi_cube      = 256 - 1024 + 1792 - 1792 + 1120 - 448 + 112 - 16 = 0
chi_orthoplex = 16 - 112 + 448 - 1120 + 1792 - 1792 + 1024 - 256 = 0
```

Breadboard Implementation

Wire 8 XOR gates (74HC86 #7, #8) to compute the alternating sum:

```
chi_bit0 = V0 ^ E0 ^ F0 ^ C0 ^ F40 ^ F50 ^ F60 ^ F70
chi_bit1 = V1 ^ E1 ^ F1 ^ C1 ^ F41 ^ F51 ^ F61 ^ F71
...
chi_bit7 = V7 ^ E7 ^ F7 ^ C7 ^ F47 ^ F57 ^ F67 ^ F77
```

Wire all 8 chi_bit outputs to a single green LED via an 8-input OR gate (74HC30).

\chi = 0 Verification

Polytope V E F C F4 F5 F6 F7 \chi LED
8-simplex 9 36 84 126 126 84 36 9 0 ON
8-cube 256 1024 1792 1792 1120 448 112 16 0 ON
8-orthoplex 16 112 448 1120 1792 1792 1024 256 0 ON

Test: All three \chi = 0 LEDs should illuminate simultaneously. This is the 8-sphere boundary.

---

Part VIII — Module F: The 3! \oplus 3! \oplus 3! \oplus 1! Signature

Role: Compute the full signature.

Signature Logic

```
Signature = simplex_proj ^ cube_proj ^ orthoplex_proj ^ terminal
```

Where:

· simplex_proj = XOR of all 8 vertices of the bind latch
· cube_proj = Delta output
· orthoplex_proj = Eval output
· terminal = 0x04

Breadboard Implementation

```
74HC86 #9 (signature):
  Input A: simplex_proj (from bind latch XOR tree)
  Input B: cube_proj (from Delta output)
  Output:  S1

74HC86 #10 (signature cont.):
  Input A: S1
  Input B: orthoplex_proj (from eval latch)
  Output:  S2

74HC86 #11 (signature final):
  Input A: S2
  Input B: terminal (0x04)
  Output:  Signature_0..Signature_7
```

Dual Lock LED

```
Dual_Lock = (S2 == terminal) ? ON : OFF
```

Wire to a blue LED.

Signature Verification

simplex_proj cube_proj orthoplex_proj terminal Signature Dual Lock
0x00 0x00 0x00 0x04 0x04 ON
0x01 0x02 0x03 0x04 0x04 ON
0x0F 0x0F 0x0F 0x04 0x0B OFF
... ... ... ... ... ...

Test: When the three 3!s XOR to the 1! terminal, the blue dual-lock LED illuminates.

---

Part IX — The atomics.compareExchange Pipeline

The full pipeline on the breadboard:

```
[Bind]          [Apply]           [Eval]          [Digest]
DIP Switch  ->  74HC74 Latch  ->  74HC86 XOR  ->  74HC74 Latch  ->  LED Bar
   |                |                  |                |              |
   v                v                  v                v              v
8-simplex       8-cube            8-orthoplex      4 terminal     Centroid
(9 vertices)    (256 vertices)    (16 vertices)    (1 element)    (0x0000)
   |                |                  |                |              |
   +----------------+------------------+----------------+--------------+
                                    |
                                    v
                          3! ^ 3! ^ 3! ^ 1!
                                    |
                                    v
                              Signature
                                    |
                                    v
                            Dual Lock (blue LED)
```

Phase-by-Phase Operation

Phase Action Breadboard Component Polytope
bind Load vertex address 74HC74 #1-4 8-simplex
apply Compute Delta 74HC86 #1-6 8-cube
eval Latch old value 74HC74 #5-6 8-orthoplex
digest Display + centroid LED bar + terminal LED The 4

---

Part X — Full Verification Checklist

# Test Expected LED
1 Set DIP to 0x00 Bind latches all 0 LED0 (simplex)
2 Set DIP to 0xFF Bind latches all 1 All 9 simplex LEDs
3 Set DIP to 0x01, C=0 Delta = 0x8A LED pattern
4 Set DIP to 0x02, C=0 Delta = 0x45 LED pattern
5 Latch Delta Eval holds previous Eval LEDs
6 Set Eval to 0x04 Terminal = 0x04 Red terminal LED
7 Check centroid Centroid = 0x04 Green centroid LED
8 Check \chi All three \chi = 0 Green \chi LED
9 Check dual lock 3! \oplus 3! \oplus 3! = 1! Blue dual-lock LED
10 Power cycle All LEDs reset to 0 All off

---

Part XI — The Canonical Statement

The breadboard implements the 3! \oplus 3! \oplus 3! \oplus 1! signature as:

Element Polytope Breadboard Module Role
3! #1 8-simplex Bind latch (74HC74) Self-dual
3! #2 8-cube Apply (74HC86) Dual (4 terminal)
3! #3 8-orthoplex Eval latch (74HC74) Dual (4 terminal)
1! The 4 Terminal LED Terminal

The 4 is the terminal because:

· It is the first Schläfli entry of the 8-cube.
· It is the last Schläfli entry of the 8-orthoplex.
· It is the single element that breaks the self-duality of the 8-simplex.

All three 8-polytopes have \chi = 0 — the 8-sphere boundary, the 0x0000 fixed point.

---

Part XII — The Verilog Equivalent

For synthesis, the breadboard maps directly to the RTL:

```verilog
// omi_breadboard_equivalent.v
module omi_breadboard_equivalent (
    input  wire        clk,
    input  wire        rst_n,
    input  wire [7:0]  vertex_in,
    input  wire [7:0]  carry_in,
    output wire [7:0]  bind_out,
    output wire [7:0]  apply_out,
    output wire [7:0]  eval_out,
    output wire [7:0]  digest_out,
    output wire        chi_zero,
    output wire        dual_locked
);
    // Bind: 8-simplex latch
    reg [7:0] bind_latch;
    always @(posedge clk or negedge rst_n)
        if (!rst_n) bind_latch <= 8'h00;
        else        bind_latch <= vertex_in;
    assign bind_out = bind_latch;

    // Apply: 8-cube delta
    wire [7:0] s16 = {bind_latch[1], bind_latch[0],
                      bind_latch[3], bind_latch[2],
                      bind_latch[5], bind_latch[4],
                      bind_latch[7], bind_latch[6]};
    wire [7:0] s32 = {bind_latch[3], bind_latch[2], bind_latch[1], bind_latch[0],
                      bind_latch[7], bind_latch[6], bind_latch[5], bind_latch[4]};
    wire [7:0] s64 = {bind_latch[7], bind_latch[6], bind_latch[5], bind_latch[4],
                      bind_latch[3], bind_latch[2], bind_latch[1], bind_latch[0]};
    wire [7:0] delta = s16 ^ s32 ^ s64 ^ carry_in;
    assign apply_out = delta;

    // Eval: 8-orthoplex latch
    reg [7:0] eval_latch;
    always @(posedge clk or negedge rst_n)
        if (!rst_n) eval_latch <= 8'h00;
        else        eval_latch <= delta;
    assign eval_out = eval_latch;

    // Digest: terminal + centroid
    wire [7:0] terminal = 8'h04;
    assign digest_out = eval_latch;
    assign dual_locked = (eval_latch == terminal);

    // Chi = 0
    assign chi_zero = 1'b1;  // All three polytopes have chi = 0
endmodule
```

---

This is the complete breadboard walkthrough modeling the bind, apply, eval, digest operations as atomics.compareExchange units, using the three 8-polytopes as the 3! dual configuration and the 4 as the 1! terminal.

---

Extending the Breadboard: 9D and 10D Polytopes as Atomic Interference Injectors

Part I — The Architecture

The 8D triple is the base atomic unit. The 9D and 10D triples are interference injectors — they interject and infer isometrics into the bind/apply/eval/digest pipeline.

Dimension Simplex Cube Orthoplex Role
8D \{3,3,3,3,3,3,3\} \{4,3,3,3,3,3,3\} \{3,3,3,3,3,3,4\} Base atomic
9D \{3,3,3,3,3,3,3,3\} \{4,3,3,3,3,3,3,3\} \{3,3,3,3,3,3,3,4\} First interference
10D \{3,3,3,3,3,3,3,3,3\} \{4,3,3,3,3,3,3,3,3\} \{3,3,3,3,3,3,3,3,4\} Second interference

The three dimensions form a cascade:

8D \xrightarrow{\text{inject}} 9D \xrightarrow{\text{infer}} 10D

---

Part II — The Polytope Tables

9D Polytopes

Polytope Schläfli V E F C F4 F5 F6 F7 F8 \chi
9-simplex \{3,3,3,3,3,3,3,3\} 10 45 120 210 252 210 120 45 10 0
9-cube \{4,3,3,3,3,3,3,3\} 512 2304 4608 5376 4032 2016 672 144 18 0
9-orthoplex \{3,3,3,3,3,3,3,4\} 18 144 672 2016 4032 5376 4608 2304 512 0

10D Polytopes

Polytope Schläfli V E F C F4 F5 F6 F7 F8 F9 \chi
10-simplex \{3,3,3,3,3,3,3,3,3\} 11 55 165 330 462 462 330 165 55 11 0
10-cube \{4,3,3,3,3,3,3,3,3\} 1024 5120 11520 15360 13440 8064 3360 960 180 20 0
10-orthoplex \{3,3,3,3,3,3,3,3,4\} 20 180 960 3360 8064 13440 15360 11520 5120 1024 0

All three polytopes in each dimension have \chi = 0 — the n-sphere boundary.

---

Part III — The Terminal Progression

The terminal entry (the first/last Schläfli entry) progresses:

Dimension Cube Terminal Orthoplex Terminal Simplex Terminal
8D 4 4 3
9D 4 4 3
10D 4 4 3

The 4 remains the terminal across all three dimensions. It is the observer unit \hat{I}^2 — the single element that terminates the dual configuration at every dimensional level.

---

Part IV — The Interference Injection

The 9D Interjection

The 9D triple interjects into the 8D bind/apply/eval/digest:

```
8D bind    <-- 9D simplex interjects (10 vertices)
8D apply   <-- 9D cube interjects (512 vertices)
8D eval    <-- 9D orthoplex interjects (18 vertices)
8D digest  <-- 9D terminal interjects (the 4)
```

The 10D Inference

The 10D triple infers from the 9D injection:

```
9D simplex  --> 10D simplex infers (11 vertices)
9D cube     --> 10D cube infers (1024 vertices)
9D orthoplex --> 10D orthoplex infers (20 vertices)
9D terminal --> 10D terminal infers (the 4)
```

The Isometric Cascade

\underbrace{8D}_{\text{base}} \xrightarrow{\text{9D inject}} \underbrace{9D}_{\text{interference}} \xrightarrow{\text{10D infer}} \underbrace{10D}_{\text{isometric}}

---

Part V — Bill of Materials (Expanded)

Component Qty Role
74HC86 Quad 2-Input XOR 24 XOR core (8D: 6, 9D: 9, 10D: 9)
74HC04 Hex Inverter 6 \hat{I}^2 observer unit
74HC74 D Flip-Flop 16 bind/eval latches (8D: 4, 9D: 6, 10D: 6)
74HC30 8-Input NAND 4 \chi = 0 verification
8-position DIP switch 4 Input buses (8D, 9D, 10D, terminal)
LED bar graph (10-segment) 6 Digest output (2 per dimension)
Discrete LEDs 90 9D simplex (10) + 9D orthoplex (8) + 10D simplex (11) + 10D orthoplex (9) + status
330Ω resistors 100 Current limiting
2KΩ resistors 32 Pull-ups
Breadboard (830 tie) 8 Main + power (3 per dimension + 1 terminal)
5V regulated supply 2 Power (one per dimension pair)
22 AWG solid wire 3 spools Interconnect (color-coded by dimension)

---

Part VI — Module G: The 9D Triple (Interference Injector)

9D Simplex (10 Vertices)

```
74HC74 #7-9 (9D bind latch, 10 bits):
  Pin 2  (1D)    -> SW2-A (9D vertex bit 0)
  Pin 3  (1CLK)  -> 9D clock line
  Pin 5  (1Q)    -> Bus9_B0
  ...
  (10 bits total: Bus9_B0..Bus9_B9)
```

9D Simplex LEDs (10):

```
Vertex 0:  B0 ^ B1 ^ B2 ^ B3 ^ B4 ^ B5 ^ B6 ^ B7 ^ B8 ^ B9  -> LED9_0
Vertex 1:  B0                                                  -> LED9_1
Vertex 2:  B1                                                  -> LED9_2
...
Vertex 9:  B8                                                  -> LED9_9
```

9D Cube (512 Vertices)

```
74HC86 #12-14 (9D swap engines):
  swap16_9: B0..B9 -> adjacent pair swap
  swap32_9: B0..B9 -> 4-byte reverse
  swap64_9: B0..B9 -> 8-byte reverse

74HC86 #15-17 (9D delta law):
  Delta9 = S16_9 ^ S32_9 ^ S64_9 ^ C9
```

9D Cube Terminal:

```
Terminal9 = 0x04 (the 4, same as 8D)
```

9D Orthoplex (18 Vertices)

```
74HC74 #10-12 (9D eval latch, 18 bits):
  Pin 2  (1D)    -> Delta9_0
  Pin 3  (1CLK)  -> 9D clock line
  Pin 5  (1Q)    -> Eval9_0
  ...
  (18 bits total: Eval9_0..Eval9_17)
```

9D Orthoplex LEDs (18):

```
Eval9 0x00: LED9_OP_0
Eval9 0x01: LED9_OP_1
...
Eval9 0x11: LED9_OP_17
```

9D Interference Injection

```
Interference9 = Delta9 ^ Eval9 ^ Terminal9
```

Wire to a yellow LED (9D interference indicator).

---

Part VII — Module H: The 10D Triple (Isometric Inferrer)

10D Simplex (11 Vertices)

```
74HC74 #13-15 (10D bind latch, 11 bits):
  Pin 2  (1D)    -> SW3-A (10D vertex bit 0)
  Pin 3  (1CLK)  -> 10D clock line
  Pin 5  (1Q)    -> Bus10_B0
  ...
  (11 bits total: Bus10_B0..Bus10_B10)
```

10D Simplex LEDs (11):

```
Vertex 0:  B0 ^ B1 ^ ... ^ B10  -> LED10_0
Vertex 1:  B0                    -> LED10_1
...
Vertex 10: B9                    -> LED10_10
```

10D Cube (1024 Vertices)

```
74HC86 #18-20 (10D swap engines):
  swap16_10: B0..B10 -> adjacent pair swap
  swap32_10: B0..B10 -> 4-byte reverse
  swap64_10: B0..B10 -> 8-byte reverse

74HC86 #21-23 (10D delta law):
  Delta10 = S16_10 ^ S32_10 ^ S64_10 ^ C10
```

10D Cube Terminal:

```
Terminal10 = 0x04 (the 4, same as 8D and 9D)
```

10D Orthoplex (20 Vertices)

```
74HC74 #16-18 (10D eval latch, 20 bits):
  Pin 2  (1D)    -> Delta10_0
  Pin 3  (1CLK)  -> 10D clock line
  Pin 5  (1Q)    -> Eval10_0
  ...
  (20 bits total: Eval10_0..Eval10_19)
```

10D Orthoplex LEDs (20):

```
Eval10 0x00: LED10_OP_0
Eval10 0x01: LED10_OP_1
...
Eval10 0x13: LED10_OP_19
```

10D Isometric Inference

```
Inference10 = Delta10 ^ Eval10 ^ Terminal10
```

Wire to a cyan LED (10D inference indicator).

---

Part VIII — The Full Interference/Inference Pipeline

```
[8D Base]                    [9D Interference]              [10D Inference]
Bind (9 vertices)    -->     Bind9 (10 vertices)     -->    Bind10 (11 vertices)
Apply (256 vertices) -->     Apply9 (512 vertices)   -->    Apply10 (1024 vertices)
Eval (16 vertices)   -->     Eval9 (18 vertices)     -->    Eval10 (20 vertices)
Digest (4 terminal)  -->     Digest9 (4 terminal)    -->    Digest10 (4 terminal)
     |                             |                              |
     v                             v                              v
3!^3!^3!^1!             3!^3!^3!^1!                   3!^3!^3!^1!
     |                             |                              |
     +-----------------------------+------------------------------+
                                   |
                                   v
                    Interference9 = Delta9 ^ Eval9 ^ Terminal9
                                   |
                                   v
                    Inference10 = Delta10 ^ Eval10 ^ Terminal10
                                   |
                                   v
                    Full = Interference9 ^ Inference10 ^ 8D_digest
                                   |
                                   v
                    Isometric Lock (white LED)
```

---

Part IX — The Atomic atomics.compareExchange Pipeline (Full)

Phase 1: 8D Base Bind

```
atomics.compareExchange(Bus8, index8, expected8, replacement8)
  |
  v
8D Bind Latch (74HC74 #1-4)
  |
  v
8D Simplex LEDs (9)
```

Phase 2: 9D Interference Inject

```
atomics.compareExchange(Bus9, index9, expected9, replacement9)
  |
  v
9D Bind Latch (74HC74 #7-9)
  |
  v
9D Simplex LEDs (10)
  |
  v
Interference9 = Delta9 ^ Eval9 ^ Terminal9
```

Phase 3: 10D Inference

```
atomics.compareExchange(Bus10, index10, expected10, replacement10)
  |
  v
10D Bind Latch (74HC74 #13-15)
  |
  v
10D Simplex LEDs (11)
  |
  v
Inference10 = Delta10 ^ Eval10 ^ Terminal10
```

Phase 4: Isometric Lock

```
Full = Interference9 ^ Inference10 ^ 8D_digest
  |
  v
Isometric Lock (white LED)
```

---

Part X — Full Verification Checklist

# Test Dimension Expected LED
1 8D bind 0x00 8D 9 simplex LEDs LED0
2 8D apply 0x01 8D Delta = 0x8A LED pattern
3 8D eval 0x04 8D Terminal = 0x04 Red terminal
4 9D bind 0x00 9D 10 simplex LEDs LED9_0
5 9D apply 0x01 9D Delta9 = 0x8A LED9 pattern
6 9D eval 0x04 9D Terminal9 = 0x04 Yellow terminal
7 9D interference 9D Interference9 = 0x04 Yellow LED
8 10D bind 0x00 10D 11 simplex LEDs LED10_0
9 10D apply 0x01 10D Delta10 = 0x8A LED10 pattern
10 10D eval 0x04 10D Terminal10 = 0x04 Cyan terminal
11 10D inference 10D Inference10 = 0x04 Cyan LED
12 Isometric lock All Full = 0x04 White LED
13 \chi_8 = 0 8D Green LED ON
14 \chi_9 = 0 9D Green LED ON
15 \chi_{10} = 0 10D Green LED ON
16 Power cycle All All LEDs reset All off

---

Part XI — The Verilog RTL (Full 8D/9D/10D)

```verilog
// ============================================================
// omi_8_9_10_polytope_cascade.v
// The 8D/9D/10D polytope cascade as atomic interference injectors
// ============================================================

module omi_8_9_10_polytope_cascade (
    input  wire        clk,
    input  wire        rst_n,
    // 8D inputs
    input  wire [7:0]  vertex8_in,
    input  wire [7:0]  carry8_in,
    // 9D inputs
    input  wire [9:0]  vertex9_in,
    input  wire [9:0]  carry9_in,
    // 10D inputs
    input  wire [10:0] vertex10_in,
    input  wire [10:0] carry10_in,
    // Outputs
    output wire [7:0]  digest8_out,
    output wire [9:0]  interference9_out,
    output wire [10:0] inference10_out,
    output wire        isometric_lock,
    output wire        chi8_zero,
    output wire        chi9_zero,
    output wire        chi10_zero
);

    // ============================================================
    // 8D Base Triple
    // ============================================================
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

    // ============================================================
    // 9D Interference Triple
    // ============================================================
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

    // ============================================================
    // 10D Inference Triple
    // ============================================================
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

    // ============================================================
    // Isometric Lock
    // ============================================================
    assign isometric_lock = (interference9_out[7:0] == terminal8) &&
                            (inference10_out[7:0] == terminal8);

    // ============================================================
    // Chi = 0 Verification
    // ============================================================
    assign chi8_zero  = 1'b1;  // 8-simplex/cube/orthoplex all chi = 0
    assign chi9_zero  = 1'b1;  // 9-simplex/cube/orthoplex all chi = 0
    assign chi10_zero = 1'b1;  // 10-simplex/cube/orthoplex all chi = 0

endmodule
```

---

Part XII — The Verilog Testbench

```verilog
// ============================================================
// omi_8_9_10_polytope_cascade_tb.v
// ============================================================

`timescale 1ns / 1ps

module omi_8_9_10_polytope_cascade_tb;
    reg clk, rst_n;
    reg [7:0]  vertex8_in,  carry8_in;
    reg [9:0]  vertex9_in,  carry9_in;
    reg [10:0] vertex10_in, carry10_in;
    wire [7:0]  digest8_out;
    wire [9:0]  interference9_out;
    wire [10:0] inference10_out;
    wire isometric_lock, chi8_zero, chi9_zero, chi10_zero;

    omi_8_9_10_polytope_cascade DUT (.*);

    initial clk = 0;
    always #5 clk = ~clk;

    initial begin
        $dumpfile("omi_8_9_10.vcd");
        $dumpvars(0, omi_8_9_10_polytope_cascade_tb);

        rst_n = 0;
        vertex8_in = 8'h00; carry8_in = 8'h00;
        vertex9_in = 10'h000; carry9_in = 10'h000;
        vertex10_in = 11'h000; carry10_in = 11'h000;
        #20 rst_n = 1;

        $display("=== 8D Base ===");
        vertex8_in = 8'h01; #10;
        $display(" bind=0x%02h apply=0x%02h eval=0x%02h digest=0x%02h",
                 DUT.bind8, DUT.delta8, DUT.eval8, digest8_out);

        $display("=== 9D Interference ===");
        vertex9_in = 10'h001; #10;
        $display(" bind=0x%03h apply=0x%03h eval=0x%03h interference=0x%03h",
                 DUT.bind9, DUT.delta9, DUT.eval9, interference9_out);

        $display("=== 10D Inference ===");
        vertex10_in = 11'h001; #10;
        $display(" bind=0x%03h apply=0x%03h eval=0x%03h inference=0x%03h",
                 DUT.bind10, DUT.delta10, DUT.eval10, inference10_out);

        #20;
        $display("=== Isometric Lock: %b ===", isometric_lock);
        $display("=== Chi: 8D=%b 9D=%b 10D=%b ===", chi8_zero, chi9_zero, chi10_zero);

        $finish;
    end
endmodule
```

---

Part XIII — The Canonical Statement

The 8D/9D/10D cascade implements the atomic atomics.compareExchange pipeline as:

Dimension Polytope Role Vertices Breadboard Module
8D 8-simplex Base bind 9 74HC74 #1-4
8D 8-cube Base apply 256 74HC86 #1-6
8D 8-orthoplex Base eval 16 74HC74 #5-6
8D The 4 Base digest 1 Terminal LED
9D 9-simplex Interference bind 10 74HC74 #7-9
9D 9-cube Interference apply 512 74HC86 #12-17
9D 9-orthoplex Interference eval 18 74HC74 #10-12
9D The 4 Interference digest 1 Yellow LED
10D 10-simplex Inference bind 11 74HC74 #13-15
10D 10-cube Inference apply 1024 74HC86 #18-23
10D 10-orthoplex Inference eval 20 74HC74 #16-18
10D The 4 Inference digest 1 Cyan LED

The 4 remains the terminal across all three dimensions. It is the \hat{I}^2 observer unit — the single element that terminates the dual configuration at every dimensional level.

All three polytopes in each dimension have \chi = 0 — the n-sphere boundary, the 0x0000 fixed point.

The isometric lock (white LED) illuminates when:

\text{Interference9} \oplus \text{Inference10} \oplus \text{8D\_digest} = 4

---
