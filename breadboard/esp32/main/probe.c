/*
 * THE boxedPINE PROBE (breadboard/esp32)
 *
 * The readings core/ makes, made on an ESP32 (Xtensa LX6) and printed one per
 * line over UART0 at 115200, so a host (repl/src/serial.ts) or a browser over
 * Web Serial can read them and XOR them against its own. No Wi-Fi, no
 * credentials, no allocation. wiki: SPEC-07 I-101.
 *
 *   orbit      K(p, 0x1D) from 0x4242, the step law of delta.ts and polytron
 *   period     steps until the orbit returns
 *   constants  the sixteen Fano constants (fano.ts), index order
 *   converge   how many of the 128 masks converge, and the most steps taken
 *   blob       the XOR fold of the 8192-byte proof Blob, 60 ^ (j & 0xFF)
 *   meta       ticks for the ring-and-crystal meta-cycle to return (cycle.ts)
 *   tick_us    microseconds for 65536 steps of K: a physical reading of this frame
 *
 * Input: "?" reprints the reading; four hex digits print that seed's orbit.
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include "driver/uart.h"
#include "esp_timer.h"
#include "esp_chip_info.h"

typedef uint16_t pair;

static inline pair rotl(pair x, int n) { return (pair)((x << n) | (x >> (16 - n))); }
static inline pair K(pair p, pair c) { return rotl(p, 1) ^ rotl(p, 3) ^ rotl(p, 14) ^ c; } /* rotr 2 = rotl 14 */

static const uint8_t LINES[7][3] = {{1,2,3},{1,4,5},{1,6,7},{2,4,6},{2,5,7},{3,4,7},{3,5,6}};
static inline int bit(int m, int n) { return (m >> (n - 1)) & 1; }

static int step(int mask) {
    int out = mask & 0x7f;
    for (int l = 0; l < 7; l++) {
        int a = LINES[l][0], b = LINES[l][1], c = LINES[l][2];
        out |= (bit(mask, a) & bit(mask, b)) << (c - 1);
        out |= (bit(mask, a) & bit(mask, c)) << (b - 1);
        out |= (bit(mask, b) & bit(mask, c)) << (a - 1);
    }
    return out;
}

static int perp(int mask) {
    int out = 0;
    for (int x = 1; x < 8; x++) {
        int even = 1;
        for (int n = 1; n < 8; n++) {
            if (!bit(mask, n)) continue;
            int p = x & n; p ^= p >> 2; p ^= p >> 1;
            if (p & 1) even = 0;
        }
        if (even) out |= 1 << (x - 1);
    }
    return out;
}

static int constant(int i) {
    return i == 0 ? 0 : i == 15 ? 0x7f : i < 8 ? 1 << (i - 1) : perp(1 << (15 - i - 1));
}

static void orbit(pair seed) {
    printf("orbit");
    pair x = seed;
    int period = 0;
    for (int i = 0; i < 9; i++) { printf(" %04x", x); x = K(x, 0x1D); }
    x = seed;
    do { x = K(x, 0x1D); period++; } while (x != seed && period < 0x10000);
    printf("\nperiod %d\n", period);
}

static void reading(void) {
    esp_chip_info_t chip;
    esp_chip_info(&chip);
    printf("omi arch=xtensa-lx6 model=%d cores=%d rev=%d\n", chip.model, chip.cores, chip.revision);
    orbit(0x4242);

    printf("constants");
    for (int i = 0; i < 16; i++) printf(" %02x", constant(i));
    printf("\n");

    int closed = 0, most = 0;
    for (int m = 0; m < 128; m++) {
        int x = m, n = 0;
        for (int next = step(x); next != x; next = step(x)) { x = next; n++; }
        int found = 0;
        for (int i = 0; i < 16; i++) if (constant(i) == x) found = 1;
        closed += found;
        if (n > most) most = n;
    }
    printf("converge %d %d\n", closed, most);

    uint8_t fold = 0;
    for (int j = 0; j < 8192; j++) fold ^= (uint8_t)(60 ^ (j & 0xff));
    printf("blob %02x\n", fold);

    uint16_t ring = 1; uint8_t crystal = 60; int ticks = 0;
    do {
        ring = (uint16_t)((ring << 1) | (ring >> 15));
        if (ring == 1) crystal ^= 3;
        ticks++;
    } while (!(ring == 1 && crystal == 60));
    printf("meta %d\n", ticks);

    volatile pair x = 0x4242;
    int64_t t0 = esp_timer_get_time();
    for (int i = 0; i < 65536; i++) x = K(x, 0x1D);
    printf("tick_us %lld\n", (long long)(esp_timer_get_time() - t0));
    printf("ready\n");
    fflush(stdout);
}

static int hex(int c) {
    return c >= '0' && c <= '9' ? c - '0' : c >= 'a' && c <= 'f' ? c - 'a' + 10 : c >= 'A' && c <= 'F' ? c - 'A' + 10 : -1;
}

void app_main(void) {
    uart_driver_install(UART_NUM_0, 256, 0, 0, NULL, 0);
    reading();
    char line[8]; int len = 0; uint8_t c;
    for (;;) {
        if (uart_read_bytes(UART_NUM_0, &c, 1, portMAX_DELAY) != 1) continue;
        if (c != '\n' && c != '\r') { if (len < 7) line[len++] = (char)c; continue; }
        line[len] = 0;
        if (len == 1 && line[0] == '?') reading();
        else if (len == 4) {
            int v = 0, ok = 1;
            for (int i = 0; i < 4; i++) { int h = hex(line[i]); if (h < 0) ok = 0; v = (v << 4) | (h & 15); }
            if (ok) { orbit((pair)v); printf("ready\n"); fflush(stdout); }
        }
        len = 0;
    }
}
