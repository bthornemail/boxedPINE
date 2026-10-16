#!/usr/bin/env bash
# 00-RESOLVE.sh — the A-list carries its own resolver, and sorts first (00) by
# universal collation. No math. Only: ls (the collation), regex (the test),
# and the leading literal NUMBER each file carries before its STRING name.
#
# The window is the same two sets read from two ends (the Hasse modem: one read
# is big-endian / forward, the other little-endian / reverse):
#   ls      pool  -> Fano-first  (KNOWN)      ls -r pool -> Hasse-first (UNKOW)
# full = 14 Fano / 2 Hasse (known),  half = 7 Fano / 1 Hasse (unknown).
set -euo pipefail
cd "$(dirname "$0")"

FULL='^(0[0-9]|1[0-3])-'   # the 14 Fano           (full / known)
HALF='^0[0-6]-'            # the 7  Fano           (half / unknown)
H2='^1[45]-'               # the 2 Hasse: read+write
H1='^14-'                  # the 1 Hasse: read only

echo "== the window, resolved by ls + regex only =="
printf '  KNOWN/known    %s\n' "$(ls    pool | grep -Ec "$FULL|$H2")  (14/2)"
printf '  KNOWN/unknown  %s\n' "$(ls    pool | grep -Ec "$HALF|$H1")  (7/1)"
printf '  UNKOW/known    %s\n' "$(ls -r pool | grep -Ec "$HALF|$H1")  (1/7, read reversed)"
printf '  UNKOW/unknown  %s\n' "$(ls -r pool | grep -Ec "$FULL|$H2")  (2/14, read reversed)"

echo
echo "== the 0x20 line: each file is NUMBER (the control/index plane) + STRING (the literal plane) =="
echo "-- super-user: reads the NUMBER each literal carries (the index, the plane below 0x20) --"
ls pool | grep -oE '^[0-9]{2}' | tr '\n' ' '; echo
echo "-- regular user on RESET: clamped to the printable literal, cannot read the leading number --"
ls pool | grep -oE '[A-Za-z_]+' | sort -u | tr '\n' ' '; echo
