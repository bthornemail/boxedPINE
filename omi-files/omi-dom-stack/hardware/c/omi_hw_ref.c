/**
 * OMI-IMO Hardware C Reference
 * Exact functional correspondence to Verilog RTL in ../verilog/
 *
 * Modules mirrored:
 *   omi_xor_gate      → omi_xor_u32 / omi_xor_u64
 *   omi_bqf_tracker   → omi_bqf_eval
 *   omi_swap_engine   → omi_swap16 / omi_swap32 / omi_swap64
 *   omi_cas           → omi_cas_u32
 *   omi_240_clock     → omi_clock_step / omi_clock_seek
 *
 * Build:  cc -O2 -std=c99 -o omi_hw_ref omi_hw_ref.c
 * Run:    ./omi_hw_ref
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <assert.h>

/* ---------- XOR (omi_xor_gate) ---------- */
uint32_t omi_xor_u32(uint32_t a, uint32_t b) {
    return a ^ b;
}

uint64_t omi_xor_u64(uint64_t a, uint64_t b) {
    return a ^ b;
}

/* ---------- BQF tracker (omi_bqf_tracker) ---------- */
typedef struct {
    uint32_t q_value;
    int      is_void_centroid;
} omi_bqf_result_t;

omi_bqf_result_t omi_bqf_eval(uint16_t x, uint16_t y) {
    /* Match Verilog: 4x = x<<2, 2y = y<<1, linear = 4x+2y (18-bit),
       q = (linear[15:0])^2 */
    uint32_t four_x  = ((uint32_t)x) << 2;
    uint32_t two_y   = ((uint32_t)y) << 1;
    uint32_t linear  = four_x + two_y;          /* effectively 18-bit */
    uint16_t lin16   = (uint16_t)(linear & 0xFFFF);
    uint32_t q       = (uint32_t)lin16 * (uint32_t)lin16;

    omi_bqf_result_t r;
    r.q_value = q;
    r.is_void_centroid = (linear == 0) ? 1 : 0;
    return r;
}

/* ---------- Swap engine (omi_swap_engine) ---------- */
static uint64_t bswap16_lanes(uint64_t v) {
    /* swap bytes within each 16-bit lane — matches w_swap16 */
    return ((v & 0x00FF00FF00FF00FFULL) << 8) |
           ((v & 0xFF00FF00FF00FF00ULL) >> 8);
}

static uint64_t bswap32_lanes(uint64_t v) {
    /* byte reverse within each 32-bit half — matches w_swap32 */
    uint32_t hi = (uint32_t)(v >> 32);
    uint32_t lo = (uint32_t)(v);
    hi = ((hi & 0x000000FF) << 24) | ((hi & 0x0000FF00) << 8) |
         ((hi & 0x00FF0000) >> 8)  | ((hi & 0xFF000000) >> 24);
    lo = ((lo & 0x000000FF) << 24) | ((lo & 0x0000FF00) << 8) |
         ((lo & 0x00FF0000) >> 8)  | ((lo & 0xFF000000) >> 24);
    return ((uint64_t)hi << 32) | lo;
}

static uint64_t bswap64_full(uint64_t v) {
    return ((v & 0x00000000000000FFULL) << 56) |
           ((v & 0x000000000000FF00ULL) << 40) |
           ((v & 0x0000000000FF0000ULL) << 24) |
           ((v & 0x00000000FF000000ULL) << 8)  |
           ((v & 0x000000FF00000000ULL) >> 8)  |
           ((v & 0x0000FF0000000000ULL) >> 24) |
           ((v & 0x00FF000000000000ULL) >> 40) |
           ((v & 0xFF00000000000000ULL) >> 56);
}

uint64_t omi_swap16(uint64_t buf) { return bswap16_lanes(buf); }
uint64_t omi_swap32(uint64_t buf) { return bswap32_lanes(buf); }
uint64_t omi_swap64(uint64_t buf) { return bswap64_full(buf); }

uint64_t omi_swap_engine(uint8_t kind, uint64_t buf) {
    switch (kind & 3) {
        case 0: return omi_swap16(buf);
        case 1: return omi_swap32(buf);
        case 2: return omi_swap64(buf);
        default: return buf;
    }
}

/* ---------- CAS (omi_cas) ---------- */
typedef struct {
    uint32_t old;
    uint32_t mem;
    int      swapped;
} omi_cas_result_t;

omi_cas_result_t omi_cas_u32(uint32_t mem, uint32_t expected, uint32_t replacement) {
    omi_cas_result_t r;
    r.old = mem;
    if (mem == expected) {
        r.mem = replacement;
        r.swapped = 1;
    } else {
        r.mem = mem;
        r.swapped = 0;
    }
    return r;
}

/* ---------- 240-clock (omi_240_clock) ---------- */
typedef struct {
    uint32_t tick;
    uint8_t  phase;   /* 0..239 */
    uint32_t cycle;
} omi_clock_t;

void omi_clock_init(omi_clock_t *c) {
    c->tick = 0;
    c->phase = 0;
    c->cycle = 0;
}

void omi_clock_step(omi_clock_t *c) {
    c->tick++;
    if (c->phase == 239) {
        c->phase = 0;
        c->cycle++;
    } else {
        c->phase++;
    }
}

void omi_clock_seek(omi_clock_t *c, uint32_t t) {
    c->tick = t;
    c->phase = (uint8_t)(t % 240);
    c->cycle = t / 240;
}

/* ---------- Self-test (correspondence vectors) ---------- */
static int g_pass = 0, g_fail = 0;

static void check(const char *name, int cond) {
    if (cond) { g_pass++; printf("  PASS  %s\n", name); }
    else      { g_fail++; printf("  FAIL  %s\n", name); }
}

int main(void) {
    printf("OMI-IMO Hardware C Reference — correspondence tests\n\n");

    /* XOR */
    check("xor_u32", omi_xor_u32(0xF0F0F0F0, 0x0F0F0F0F) == 0xFFFFFFFF);
    check("xor_u32 identity", omi_xor_u32(0xABCD, 0xABCD) == 0);
    check("xor_u64", omi_xor_u64(0x1, 0x2) == 0x3);

    /* BQF: x=1,y=0 → linear=4, q=16 */
    {
        omi_bqf_result_t r = omi_bqf_eval(1, 0);
        check("bqf (1,0) q==16", r.q_value == 16);
        check("bqf (1,0) not void", r.is_void_centroid == 0);
    }
    {
        omi_bqf_result_t r = omi_bqf_eval(0, 0);
        check("bqf (0,0) void", r.is_void_centroid == 1 && r.q_value == 0);
    }
    {
        /* x=2,y=1 → 4*2+2*1=10 → q=100 */
        omi_bqf_result_t r = omi_bqf_eval(2, 1);
        check("bqf (2,1) q==100", r.q_value == 100);
    }

    /* Swap */
    {
        uint64_t v = 0x0123456789ABCDEFULL;
        uint64_t s16 = omi_swap16(v);
        /* lanes: 0123→2301, 4567→6745, 89AB→AB89, CDEF→EFCD */
        check("swap16 nonzero", s16 != v);
        check("swap16 involution", omi_swap16(s16) == v);

        uint64_t s32 = omi_swap32(v);
        check("swap32 involution", omi_swap32(s32) == v);

        uint64_t s64 = omi_swap64(v);
        check("swap64 involution", omi_swap64(s64) == v);
        check("swap64 ends", (s64 & 0xFF) == 0x01 && ((s64 >> 56) & 0xFF) == 0xEF);
    }

    /* CAS */
    {
        omi_cas_result_t r = omi_cas_u32(5, 5, 99);
        check("cas hit", r.swapped == 1 && r.old == 5 && r.mem == 99);
        r = omi_cas_u32(5, 6, 99);
        check("cas miss", r.swapped == 0 && r.old == 5 && r.mem == 5);
    }

    /* Clock */
    {
        omi_clock_t c;
        omi_clock_init(&c);
        for (int i = 0; i < 240; i++) omi_clock_step(&c);
        check("clock wrap phase", c.phase == 0);
        check("clock cycle 1", c.cycle == 1);
        check("clock tick 240", c.tick == 240);
        omi_clock_seek(&c, 481);
        check("clock seek phase", c.phase == 1);
        check("clock seek cycle", c.cycle == 2);
    }

    printf("\n%d passed, %d failed\n", g_pass, g_fail);
    return g_fail ? 1 : 0;
}
