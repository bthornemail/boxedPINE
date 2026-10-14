// OMI-IMO Binary Quadratic Form tracker
// Affine form: q = (4x + 2y)^2   (truncated to 16-bit intermediate)
// Spec: Untitled 50 §50 / OMI-IMO Spec affine BQF
// Correspondence: C omi_bqf_eval
`timescale 1ns / 1ps

module omi_bqf_tracker (
    input  wire        clk,
    input  wire        rst_n,
    input  wire [15:0] i_x,
    input  wire [15:0] i_y,
    output reg  [31:0] o_q_value,
    output reg         o_is_void_centroid
);
    // 4x = x << 2; 2y = y << 1
    wire [17:0] w_4x     = {i_x, 2'b00};
    wire [17:0] w_2y     = {1'b0, i_y, 1'b0};
    wire [17:0] w_linear = w_4x + w_2y;
    // Square lower 16 bits of linear form
    wire [15:0] w_lin16  = w_linear[15:0];
    wire [31:0] w_q      = w_lin16 * w_lin16;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            o_q_value          <= 32'd0;
            o_is_void_centroid <= 1'b1;
        end else begin
            o_q_value          <= w_q;
            o_is_void_centroid <= (w_linear == 18'd0);
        end
    end
endmodule
