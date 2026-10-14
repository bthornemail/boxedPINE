// OMI-IMO Compare-And-Swap (hardware Atomics.compareExchange)
// If i_mem == i_expected then o_mem <= i_replacement, else o_mem <= i_mem
// o_old always returns previous memory value (eval phase)
// Correspondence: C omi_cas_u32
`timescale 1ns / 1ps

module omi_cas #(
    parameter WIDTH = 32
) (
    input  wire             clk,
    input  wire             rst_n,
    input  wire             i_enable,
    input  wire [WIDTH-1:0] i_mem,
    input  wire [WIDTH-1:0] i_expected,
    input  wire [WIDTH-1:0] i_replacement,
    output reg  [WIDTH-1:0] o_mem,
    output reg  [WIDTH-1:0] o_old,
    output reg              o_swapped
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            o_mem     <= {WIDTH{1'b0}};
            o_old     <= {WIDTH{1'b0}};
            o_swapped <= 1'b0;
        end else if (i_enable) begin
            o_old <= i_mem;
            if (i_mem == i_expected) begin
                o_mem     <= i_replacement;
                o_swapped <= 1'b1;
            end else begin
                o_mem     <= i_mem;
                o_swapped <= 1'b0;
            end
        end
    end
endmodule
