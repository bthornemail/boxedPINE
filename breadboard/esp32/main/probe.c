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
 *   anything else     400 Bad Request
 * Registers only, apart from the 32-byte line the prompt arrives in.
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

static void respond(const char *line) {
    uint32_t tag = state & 0xff, dev = total_dev;
    if (strcmp(line, "GET /") == 0) {
        printf("300 Multiple Choices\nchoice /parity\nchoice /atom/0\nchoice /atom/1\nchoice /atom/2\nchoice /atom/3\n"
               "choice /atom/4\nchoice /atom/5\nchoice /atom/6\nchoice /atom/7\nchoice /m/0-128\n");
    } else if (strcmp(line, "GET /parity") == 0) {
        printf("200 OK\nparity %02x\npole %u\ndev %02x\nus %lld\nwall %lld\ncycles %u\n", (unsigned)tag,
               (unsigned)((state >> 16) & 1), (unsigned)dev, (long long)us, (long long)(esp_timer_get_time() - t0), (unsigned)cycles);
    } else if (strncmp(line, "GET /parity ", 12) == 0) {
        int h = hexdigit(line[12]), l = hexdigit(line[13]);
        if (h >= 0 && l >= 0 && line[14] == 0 && (uint32_t)((h << 4) | l) == tag && dev == 0) printf("304 Not Modified\n");
        else printf("200 OK\nparity %02x\ndev %02x\n", (unsigned)tag, (unsigned)dev);
    } else if (strncmp(line, "GET /atom/", 10) == 0 && hexdigit(line[10]) >= 0 && line[11] == 0) {
        uint32_t a = (uint32_t)hexdigit(line[10]);
        if (a < 8) printf("200 OK\natom %x parity %u dual %x\n", (unsigned)a, (unsigned)sense(a ^ 4), (unsigned)(a ^ 15));
        else printf("307 Temporary Redirect\nlocation /atom/%x\n", (unsigned)(a ^ 15));
    } else if (strncmp(line, "GET /m/", 7) == 0) {
        const char *s = line + 7;
        int a = number(&s), b = -1;
        if (*s == '-') { s++; b = number(&s); }
        if (a < 0 || b < 0 || *s != 0 || a > b) printf("400 Bad Request\n");
        else if (b > 128) printf("416 Range Not Satisfiable\ncontent-range m */129\n");
        else {
            printf("206 Partial Content\ncontent-range m %d-%d/129\nbits ", a, b);
            for (int m = a; m <= b; m++) putchar('0' + (int)sense((uint32_t)m));
            putchar('\n');
        }
    } else {
        printf("400 Bad Request\n");
    }
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
