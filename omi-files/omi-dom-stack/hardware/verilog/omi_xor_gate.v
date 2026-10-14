// OMI-IMO XOR reduction gate
// Target: Zynq-7000 fabric
// Correspondence: C omi_xor_u32 / omi_xor_u64
`timescale 1ns / 1ps

module omi_xor_gate #(
    parameter WIDTH = 32
) (
    input  wire [WIDTH-1:0] a,
    input  wire [WIDTH-1:0] b,
    output wire [WIDTH-1:0] y
);
    assign y = a ^ b;
endmodule
