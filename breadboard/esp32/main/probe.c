/*
 * THE PARITY ORGAN (breadboard/esp32)
 *
 * The author: the ESP32 is "just for 3 bit parity check on 8 of the 16
 * indices", cycling through 60 ^ 0 … 64 … 128, "as a sensor organ unless
 * memory added as appendages"; and "it should reflect back its sensory state
 * parity, unless prompted, then it should respond to content negotiation
 * strategies". wiki: SPEC-07 I-102, I-103.
 *
 * SENSING. Each cycle walks m = 0 … 128 through b = 60 ^ m, reads the atom
 * b & 7 (one of 8 indices; the other 8 are their duals, i ^ 15) and its 3-bit
 * parity. The parities of each octet of m pack into a byte; every octet reads
 * the same byte (0x69), so the organ keeps no table: it XORs each octet
 * against the first, and anything but 0 is a deviation it sensed. The poles
 * 60 ^ 64 and 60 ^ 128 must read the parity of 60. The seed is volatile, so
 * the compiler cannot fold the check away: the hardware has to run it.
 *
 * REFLECT (unprompted, 205 Reflect). A tick is 256 cycles. The author: it
 * reflects "if modulus % 4 = 0 when the modulus 2 is 0, or when the modulus of
 * 2 and the modulus of 4 are not 0", so it reflects on tick n unless
 * n & 3 = 2 (three ticks in four), one line:
 *   reflect <parity> <pole> <dev> <count>     (hex, 0/1, hex, hex; count = n)
 * dev is the OR of the deviations sensed since the last reflection, so a
 * deviation in a silent tick rides into the next line.
 *
 * RESPOND (prompted). A request line, answered with a status line and the
 * negotiated content, then the departure "218 This is fine" (SPEC-06):
 *   GET /             300 Multiple Choices, the paths it can answer
 *   GET /parity       200 OK, the whole state (parity, pole, dev, us, wall, cycles)
 *   GET /parity 69    304 Not Modified while the state's tag is still 69
 *   GET /atom/a       200 OK, the parity of atom a (0-7) and its dual a ^ 15;
 *                     307 Temporary Redirect to /atom/(a ^ 15) for a = 8-f
 *   GET /m/a-b        206 Partial Content, the parities of m = a … b (decimal);
 *                     416 Range Not Satisfiable past 128
 *   GET /gate/R/ab    200 OK, gate R (NAND NOR OR SWITCH NOT XOR XNOR AND) on bits a, b;
 *                     404 Not Found for any other rule
 *   GET /build/B/ab   200 OK, every node of build B (5T 6T 8T 10T) and its LED, on a, b;
 *                     404 Not Found for any other build
 *   anything else     400 Bad Request
 * Every answer ends, just before 218, with a fold of the bytes it sent from the
 * status line on, zipped into pairs (car = even byte, cdr = odd byte; a last odd
 * byte pairs with 00): "fold <bits> <place> <length>". bits XORs the pairs (any
 * bit that moves changes it); place zips the pairs through the step law,
 * z = K(z ^ pair, 0x1D), so a pair dropped, repeated or moved changes it.
 * The author: "xor through the buffer like a zipper, because everything is
 * pair-wise". wiki: SPEC-07 I-107.
 * The gates and builds are breadboard/kernel.mjs's netlists, as constant
 * tables: a rule is its truth table as 4 bits, indexed a * 2 + b (SPEC-07 I-105).
 * Registers only, apart from those tables, the 32-byte line the prompt arrives in and
 * the 256-byte line an answer is written through.
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include "driver/uart.h"
#include "driver/uart_vfs.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static volatile uint32_t SEED = 60;

static inline uint32_t parity3(uint32_t a) { return (a ^ (a >> 1) ^ (a >> 2)) & 1; }
static inline uint32_t sense(uint32_t m) { return parity3((SEED ^ m) & 7); }

/* One cycle through 60 ^ 0 … 128: the first octet's byte in bits 0-7, the OR
 * of the octets' deviations in bits 8-15, the poles' agreement in bit 16. */
static inline uint32_t cycle(void) {
    uint32_t seed = SEED, first = 0, dev = 0;
    for (uint32_t k = 0; k < 16; k++) {
        uint32_t octet = 0;
        for (uint32_t i = 0; i < 8; i++) octet |= parity3((seed ^ ((k << 3) | i)) & 7) << i;
        if (k == 0) first = octet;
        dev |= octet ^ first;
    }
    uint32_t p = parity3(seed & 7);
    uint32_t pole = (parity3((seed ^ 64) & 7) == p) & (parity3((seed ^ 128) & 7) == p);
    return first | (dev << 8) | (pole << 16);
}

static uint32_t state, total_dev, cycles;
static int64_t us, t0;

static int hexdigit(char c) {
    return c >= '0' && c <= '9' ? c - '0' : c >= 'a' && c <= 'f' ? c - 'a' + 10 : c >= 'A' && c <= 'F' ? c - 'A' + 10 : -1;
}

/* A decimal number at *s, advancing it; -1 if there is none. */
static int number(const char **s) {
    int v = -1;
    while (**s >= '0' && **s <= '9') { v = (v < 0 ? 0 : v * 10) + (**s - '0'); (*s)++; }
    return v;
}

/* Rules as truth tables over the index a * 2 + b, as in kernel.mjs. */
typedef struct { const char *name; uint8_t table; } rule_t;
static const rule_t RULES[] = {
    {"NAND", 0x7}, {"NOR", 0x1}, {"OR", 0xE}, {"SWITCH", 0x7},
    {"NOT", 0x3}, {"XOR", 0x6}, {"XNOR", 0x9}, {"AND", 0x8},
};
#define NRULES (sizeof RULES / sizeof RULES[0])
static inline uint32_t apply(uint8_t table, uint32_t a, uint32_t b) { return (table >> ((a << 1) | b)) & 1; }

/* The four builds: nets read node 0 (A), 1 (B) or an earlier net (2 + its place). */
typedef struct { const char *net; uint8_t table; uint8_t x, y; } net_t;
typedef struct { const char *id; uint8_t count; uint8_t led; uint8_t sink; net_t nets[5]; } build_t;
static const build_t BUILDS[] = {
    {"5T", 3, 2, 1, {{"n", 0x7, 0, 1}, {"o", 0xE, 0, 1}, {"node", 0x7, 2, 3}}},
    {"6T", 4, 3, 0, {{"n", 0x7, 0, 1}, {"o", 0xE, 0, 1}, {"node", 0x7, 2, 3}, {"out", 0x3, 4, 4}}},
    {"8T", 4, 3, 0, {{"n", 0x7, 0, 1}, {"p", 0x7, 0, 2}, {"q", 0x7, 1, 2}, {"out", 0x7, 3, 4}}},
    {"10T", 5, 4, 0, {{"n1", 0x1, 0, 1}, {"n2", 0x1, 0, 2}, {"n3", 0x1, 1, 2}, {"n4", 0x1, 3, 4}, {"out", 0x1, 5, 5}}},
};
#define NBUILDS (sizeof BUILDS / sizeof BUILDS[0])

/* "ab" at s: two bits; -1 if malformed. */
static int bits2(const char *s) {
    if ((s[0] != '0' && s[0] != '1') || (s[1] != '0' && s[1] != '1') || s[2] != 0) return -1;
    return ((s[0] - '0') << 1) | (s[1] - '0');
}

#include <stdarg.h>

/* The answer's fold, pair-wise: bits XORs the pairs, place zips them through K. */
static inline uint16_t rotl16(uint16_t x, int n) { return (uint16_t)((x << n) | (x >> (16 - n))); }
static inline uint16_t K16(uint16_t p) { return rotl16(p, 1) ^ rotl16(p, 3) ^ rotl16(p, 14) ^ 0x1D; }
static uint32_t fold_bits, fold_place, fold_len, fold_car;
static void fold_byte(uint32_t c) {
    if ((fold_len & 1) == 0) fold_car = c;
    else {
        uint16_t pair = (uint16_t)((fold_car << 8) | c);
        fold_bits ^= pair;
        fold_place = K16((uint16_t)(fold_place ^ pair));
    }
    fold_len++;
}
static void fold_close(void) {
    if (fold_len & 1) {
        uint16_t pair = (uint16_t)(fold_car << 8);
        fold_bits ^= pair;
        fold_place = K16((uint16_t)(fold_place ^ pair));
    }
}
static void out(const char *fmt, ...) {
    char text[256];
    va_list ap;
    va_start(ap, fmt);
    int n = vsnprintf(text, sizeof text, fmt, ap);
    va_end(ap);
    if (n < 0) return;
    if (n > (int)sizeof text - 1) n = (int)sizeof text - 1;
    for (int i = 0; i < n; i++) fold_byte((uint8_t)text[i]);
    fputs(text, stdout);
}

static void respond(const char *line) {
    uint32_t tag = state & 0xff, dev = total_dev;
    fold_bits = fold_place = fold_len = fold_car = 0;
    if (strcmp(line, "GET /") == 0) {
        out("300 Multiple Choices\nchoice /parity\nchoice /atom/0\nchoice /atom/1\nchoice /atom/2\nchoice /atom/3\n"
               "choice /atom/4\nchoice /atom/5\nchoice /atom/6\nchoice /atom/7\nchoice /m/0-128\n"
               "choice /gate/NAND/00\nchoice /build/8T/00\n");
    } else if (strcmp(line, "GET /parity") == 0) {
        out("200 OK\nparity %02x\npole %u\ndev %02x\nus %lld\nwall %lld\ncycles %u\n", (unsigned)tag,
               (unsigned)((state >> 16) & 1), (unsigned)dev, (long long)us, (long long)(esp_timer_get_time() - t0), (unsigned)cycles);
    } else if (strncmp(line, "GET /parity ", 12) == 0) {
        int h = hexdigit(line[12]), l = hexdigit(line[13]);
        if (h >= 0 && l >= 0 && line[14] == 0 && (uint32_t)((h << 4) | l) == tag && dev == 0) out("304 Not Modified\n");
        else out("200 OK\nparity %02x\ndev %02x\n", (unsigned)tag, (unsigned)dev);
    } else if (strncmp(line, "GET /atom/", 10) == 0 && hexdigit(line[10]) >= 0 && line[11] == 0) {
        uint32_t a = (uint32_t)hexdigit(line[10]);
        if (a < 8) out("200 OK\natom %x parity %u dual %x\n", (unsigned)a, (unsigned)sense(a ^ 4), (unsigned)(a ^ 15));
        else out("307 Temporary Redirect\nlocation /atom/%x\n", (unsigned)(a ^ 15));
    } else if (strncmp(line, "GET /m/", 7) == 0) {
        const char *s = line + 7;
        int a = number(&s), b = -1;
        if (*s == '-') { s++; b = number(&s); }
        if (a < 0 || b < 0 || *s != 0 || a > b) out("400 Bad Request\n");
        else if (b > 128) out("416 Range Not Satisfiable\ncontent-range m */129\n");
        else {
            char bits[130];
            int k = 0;
            for (int m = a; m <= b; m++) bits[k++] = (char)('0' + (int)sense((uint32_t)m));
            bits[k] = 0;
            out("206 Partial Content\ncontent-range m %d-%d/129\nbits %s\n", a, b, bits);
        }
    } else if (strncmp(line, "GET /gate/", 10) == 0) {
        const char *r = line + 10, *slash = strchr(r, '/');
        int ab = slash ? bits2(slash + 1) : -1;
        if (ab < 0) out("400 Bad Request\n");
        else {
            const rule_t *rule = 0;
            for (unsigned i = 0; i < NRULES; i++)
                if (strlen(RULES[i].name) == (size_t)(slash - r) && strncmp(RULES[i].name, r, (size_t)(slash - r)) == 0) rule = &RULES[i];
            if (!rule) out("404 Not Found\n");
            else out("200 OK\ngate %s %d%d %u\n", rule->name, ab >> 1, ab & 1, (unsigned)apply(rule->table, (uint32_t)(ab >> 1), (uint32_t)(ab & 1)));
        }
    } else if (strncmp(line, "GET /build/", 11) == 0) {
        const char *r = line + 11, *slash = strchr(r, '/');
        int ab = slash ? bits2(slash + 1) : -1;
        if (ab < 0) out("400 Bad Request\n");
        else {
            const build_t *bd = 0;
            for (unsigned i = 0; i < NBUILDS; i++)
                if (strlen(BUILDS[i].id) == (size_t)(slash - r) && strncmp(BUILDS[i].id, r, (size_t)(slash - r)) == 0) bd = &BUILDS[i];
            if (!bd) out("404 Not Found\n");
            else {
                uint32_t v[7];
                v[0] = (uint32_t)(ab >> 1); v[1] = (uint32_t)(ab & 1);
                out("200 OK\nbuild %s %d%d", bd->id, ab >> 1, ab & 1);
                for (unsigned i = 0; i < bd->count; i++) {
                    v[2 + i] = apply(bd->nets[i].table, v[bd->nets[i].x], v[bd->nets[i].y]);
                    out(" %s=%u", bd->nets[i].net, (unsigned)v[2 + i]);
                }
                uint32_t led = v[2 + bd->led];
                out(" led=%u\n", (unsigned)(bd->sink ? 1 - led : led));
            }
        }
    } else {
        out("400 Bad Request\n");
    }
    fold_close();
    printf("fold %04x %04x %u\n", (unsigned)fold_bits, (unsigned)fold_place, (unsigned)fold_len);
    printf("218 This is fine\n");
    fflush(stdout);
}

void app_main(void) {
    /* one writer on UART0: stdio goes through the driver, with its own TX buffer */
    uart_driver_install(UART_NUM_0, 256, 1024, 0, NULL, 0);
    uart_vfs_dev_use_driver(UART_NUM_0);
    printf("omi organ=parity3 arch=xtensa-lx6 memory=none\n");
    char line[32];
    int len = 0;
    uint32_t batch_dev = 0;
    t0 = esp_timer_get_time();
    int64_t b0 = t0;
    for (;;) {
        state = cycle();
        batch_dev |= (state >> 8) & 0xff;
        total_dev |= (state >> 8) & 0xff;
        cycles++;
        uint8_t c;
        while (uart_read_bytes(UART_NUM_0, &c, 1, 0) == 1) {
            if (c == '\r') continue;
            if (c != '\n') { if (len < (int)sizeof line - 1) line[len++] = (char)c; continue; }
            line[len] = 0;
            if (len) respond(line);
            len = 0;
        }
        if ((cycles & 0xff) == 0) {
            us += esp_timer_get_time() - b0;
            uint32_t n = (cycles >> 8) & 0xffff;
            if ((n & 3) != 2) { /* silent only when n is 2 mod 4 */
                printf("reflect %02x %u %02x %04x\n", (unsigned)(state & 0xff), (unsigned)((state >> 16) & 1),
                       (unsigned)batch_dev, (unsigned)n);
                fflush(stdout);
                batch_dev = 0;
            }
            vTaskDelay(1); /* let the idle task feed the watchdog, outside the measured time */
            b0 = esp_timer_get_time();
        }
    }
}
