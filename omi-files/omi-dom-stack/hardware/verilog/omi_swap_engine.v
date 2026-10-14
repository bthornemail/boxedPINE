// OMI-IMO Swap Engine — endian / lane swaps on 64-bit buffer
// i_swap_kind:
//   2'b00 = swap16  (byte swap within each 16-bit lane)
//   2'b01 = swap32  (byte swap within each 32-bit lane)
//   2'b10 = swap64  (full 64-bit byte reverse)
//   2'b11 = identity
// Correspondence: C omi_swap16 / omi_swap32 / omi_swap64
`timescale 1ns / 1ps

module omi_swap_engine (
    input  wire        clk,
    input  wire        rst_n,
    input  wire [1:0]  i_swap_kind,
    input  wire [63:0] i_buffer,
    output reg  [63:0] o_buffer
);
    // Combinational swap results
    wire [63:0] w_swap16 = {
        i_buffer[55:48], i_buffer[63:56],
        i_buffer[39:32], i_buffer[47:40],
        i_buffer[23:16], i_buffer[31:24],
        i_buffer[7:0],   i_buffer[15:8]
    };

    wire [63:0] w_swap32 = {
        i_buffer[39:32], i_buffer[47:40], i_buffer[55:48], i_buffer[63:56],
        i_buffer[7:0],   i_buffer[15:8],  i_buffer[23:16], i_buffer[31:24]
    };

    wire [63:0] w_swap64 = {
        i_buffer[7:0],   i_buffer[15:8],  i_buffer[23:16], i_buffer[31:24],
        i_buffer[39:32], i_buffer[47:40], i_buffer[55:48], i_buffer[63:56]
    };

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            o_buffer <= 64'd0;
        else case (i_swap_kind)
            2'b00:   o_buffer <= w_swap16;
            2'b01:   o_buffer <= w_swap32;
            2'b10:   o_buffer <= w_swap64;
            default: o_buffer <= i_buffer;
        endcase
    end
endmodule
