// OMI-IMO 240-tick clock
// phase = tick % 240; cycle increments on wrap
// Correspondence: C omi_clock_step
`timescale 1ns / 1ps

module omi_240_clock (
    input  wire        clk,
    input  wire        rst_n,
    input  wire        i_step,      // pulse to advance one tick
    input  wire        i_seek_en,
    input  wire [31:0] i_seek_tick,
    output reg  [31:0] o_tick,
    output reg  [7:0]  o_phase,     // 0..239
    output reg  [23:0] o_cycle
);
    localparam TICKS = 240;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            o_tick  <= 32'd0;
            o_phase <= 8'd0;
            o_cycle <= 24'd0;
        end else if (i_seek_en) begin
            o_tick  <= i_seek_tick;
            o_phase <= i_seek_tick % TICKS;
            o_cycle <= i_seek_tick / TICKS;
        end else if (i_step) begin
            o_tick <= o_tick + 32'd1;
            if (o_phase == TICKS - 1) begin
                o_phase <= 8'd0;
                o_cycle <= o_cycle + 24'd1;
            end else begin
                o_phase <= o_phase + 8'd1;
            end
        end
    end
endmodule
