/*
 * THE PARITY ORGAN (breadboard/esp32)
 *
 * The author: the ESP32 is "just for 3 bit parity check on 8 of the 16
 * indices", cycling through 60 ^ 0 … 64 … 128, "as a sensor organ unless
 * memory added as appendages". wiki: SPEC-07 I-102.
 *
 * Each cycle walks m = 0 … 128 through b = 60 ^ m, reads the atom b & 7 (one
 * of 8 indices; the other 8 are their duals, i ^ 15) and its 3-bit parity.
 * The parities of each octet of m pack into a byte. Every octet reads the same
 * byte (0x69, the Thue-Morse byte 0x96 complemented by the flip 4), so the
 * organ keeps no table: it XORs each octet against the first, and anything
 * but 0 is a deviation it sensed. The poles 60 ^ 64 and 60 ^ 128 must read the
 * parity of 60. No arrays, no heap: registers only. The seed is volatile so
 * the compiler cannot fold the check away; the hardware has to run it.
 *
 * Output, one reading per line at 115200, every 65,536 cycles, and at once on
 * a deviation:
 *   parity  the first octet's byte (hex)     dev   the OR of all deviations (hex)
 *   pole    the poles' parity agreement (1)  us    microseconds the checks took
 *   wall    microseconds the report spans, including the pauses that feed the
 *           watchdog (one RTOS tick per 256 cycles)
 *   cycles  cycles in the report
 * Input "?" reports now.
 */
#include <stdio.h>
#include <stdint.h>
#include "driver/uart.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static volatile uint32_t SEED = 60;

static inline uint32_t parity3(uint32_t a) { return (a ^ (a >> 1) ^ (a >> 2)) & 1; }

/* One cycle through 60 ^ 0 … 128: returns the first octet's byte in bits 0-7,
 * the OR of the octets' deviations in bits 8-15, the poles' agreement in bit 16. */
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

static void report(uint32_t r, uint32_t dev, uint32_t cycles, int64_t us, int64_t wall) {
    printf("parity %02x\npole %u\ndev %02x\nus %lld\nwall %lld\ncycles %u\nready\n",
           (unsigned)(r & 0xff), (unsigned)((r >> 16) & 1), (unsigned)dev, (long long)us, (long long)wall, (unsigned)cycles);
    fflush(stdout);
}

void app_main(void) {
    uart_driver_install(UART_NUM_0, 256, 0, 0, NULL, 0);
    printf("omi organ=parity3 arch=xtensa-lx6 memory=none\n");
    uint32_t cycles = 0, dev = 0, r = 0;
    int64_t t0 = esp_timer_get_time(), us = 0, b0 = t0;
    for (;;) {
        r = cycle();
        dev |= (r >> 8) & 0xff;
        cycles++;
        uint8_t c = 0;
        int asked = uart_read_bytes(UART_NUM_0, &c, 1, 0) == 1 && c == '?';
        if (((cycles & 0xffff) == 0) || ((r >> 8) & 0xff) || asked) {
            int64_t now = esp_timer_get_time();
            report(r, dev, cycles, us + (now - b0), now - t0);
            cycles = 0; dev = 0; us = 0; t0 = b0 = esp_timer_get_time();
        }
        if ((cycles & 0xff) == 0) { /* let the idle task feed the watchdog, outside the measured time */
            us += esp_timer_get_time() - b0;
            vTaskDelay(1);
            b0 = esp_timer_get_time();
        }
    }
}
