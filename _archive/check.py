"""Exhaustive checks mirroring orbit.v, plus the gate-equivalence table."""
R=range(16)
assert all(c^(c^n)==n for c in R for n in R)                       # involution
assert all((c^n)<16 for c in R for n in R)                         # closed
assert all(sorted(c^n for n in R)==list(R) for c in R)             # bijection
assert all(c^n==4*((c>>2)^(n>>2))+((c&3)^(n&3)) for c in R for n in R)  # decomposition
assert [5^n for n in R]==[5,4,7,6,1,0,3,2,13,12,15,14,9,8,11,10]
assert [15^n for n in R]==list(reversed(R))
# gate-level: XOR from NAND (4 NANDs) and NOR (5 NORs) vs A^B
nand=lambda a,b:1-(a&b); nor=lambda a,b:1-(a|b)
for a in (0,1):
  for b in (0,1):
    t=nand(a,b); x=nand(nand(a,t),nand(b,t))
    assert x==a^b
    n1=nor(a,b); n2=nor(a,n1); n3=nor(b,n1); n4=nor(n2,n3); x2=nor(n4,n4)
    assert x2==a^b
print("all checks pass")
