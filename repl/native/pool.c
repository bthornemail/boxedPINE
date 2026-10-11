/* Raw pool contamination below JavaScript: write a block, free it, allocate again
   and XOR the raw block against a zeroed one (wiki: SPEC-07 I-83). Build: gcc -o pool pool.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int nonzero(unsigned char *p, int n) { int c = 0; for (int i = 0; i < n; i++) c += p[i] != 0; return c; }
int main(void) {
  for (int size = 64; size <= 65536; size <<= 2) {
    unsigned char *a = malloc(size); memset(a, 0x3c, size); free(a);   /* write, then return to the pool */
    unsigned char *b = malloc(size);                                    /* raw: what does the pool give back? */
    unsigned char *c = calloc(1, size);                                 /* safe: zeroed */
    int x = 0; for (int i = 0; i < size; i++) x += (b[i] ^ c[i]) != 0;  /* deviation: raw XOR safe */
    printf("size %6d  raw nonzero %6d  deviation raw^safe %6d\n", size, nonzero(b, size), x);
    free(b); free(c);
  }
  return 0;
}
