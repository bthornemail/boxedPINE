The Balanced Rubik's Cube Algorithm

Reducing to XOR with Proper Balance

---

Part I — The Balance Requirement

§ 1. What Balance Means

The proportional cube must satisfy:

\bigoplus_{\text{all 27 cells}} \text{cell} = 0

This is the balance condition. It ensures the cube is XOR-to-zero.

The balance must hold at every level:

· Each axis triple must XOR to zero
· The full 27-cell cube must XOR to zero
· The two anchors must satisfy xyza = 6 \cdot xyz in the XOR sense

§ 2. The XOR Reduction

Every operation in the algorithm must reduce to XOR:

· The anchor xyz = x \oplus y \oplus z (XOR, not product)
· The proportional anchor xyza = xyz \oplus a
· The faces U = xyz \oplus xa, etc.
· The switch cases are XOR conditions
· The inversions (~) are XOR with all-ones

The product xyz in arithmetic becomes the XOR x \oplus y \oplus z in the XOR basis.

---

Part II — The Balanced Anchors

§ 3. The Base Anchor (XOR)

xyz = x \oplus y \oplus z

The XOR of the three coordinates.

This is the base anchor in the XOR basis.

§ 4. The Proportional Anchor (XOR)

xyza = xyz \oplus a = x \oplus y \oplus z \oplus a

The XOR of the three coordinates and the extent.

This is the proportional anchor.

§ 5. The Relation

In the XOR basis:

xyz \equiv (x \neq y \neq z)

means: xyz = x \oplus y \oplus z is non-zero when the coordinates are pairwise distinct.

When x \oplus y \oplus z = 0, the coordinates are not pairwise distinct (they cancel).

§ 6. The Composition

xyza = xyz \oplus a

The proportional anchor is the base anchor XOR the extent.

No multiplication. No 3!. Just XOR.

The 3! is implicit in the six faces (U, D, R, L, F, B), which are the six orderings of the three axes.

---

Part III — The Balanced Faces

§ 7. The Six Faces (XOR)

U = xyz \oplus xa

D = xyz \oplus xa

Wait — U and D would be the same if we just XOR.

The faces must be distinct.

§ 8. The Correct Face Definitions

The faces are the spatial differences from the anchors:

U = xyz \oplus xa \oplus \text{(mask)}

D = xyz \oplus xa \oplus \text{(mask)}

No — this is getting complicated.

Let me think again.

The proportional cube has:

· Center: x, y, z
· Bounds: xyz \pm xa, etc.

In the XOR basis:

· Center: x, y, z
· Bounds: xyz \oplus xa, xyz \oplus ya, xyz \oplus za

The six faces are:

U = xyz \oplus xa

D = xyz \oplus xa \oplus \text{(differentiator)}

Hmm.

The issue is: in the XOR basis, + and - are the same (both are XOR).

So xyz + xa = xyz - xa = xyz \oplus xa.

That means U and D are the same.

To distinguish them, we need a different approach.

§ 9. The Resolution: The Faces Are the Axes

The six faces are not the boundaries. They are the axes themselves.

Each face corresponds to one axis:

· U = the x-axis value
· D = the x-axis value
· R = the y-axis value
· L = the y-axis value
· F = the z-axis value
· B = the z-axis value

But U and D would be the same.

No — the faces are the directions:

· U = +x
· D = -x
· R = +y
· L = -y
· F = +z
· B = -z

In the XOR basis, + and - are the same.

So we need a different way to distinguish the faces.

§ 10. The Rubik's Cube Resolution

In the Rubik's cube:

· U is the top face
· D is the bottom face
· These are opposite faces

The difference between U and D is the direction (up vs down).

In the XOR basis, the direction is encoded by the index:

· U has index 2
· D has index 3

The index is the differentiator.

So the faces are:

U = (xyz, 2) = \text{the anchor at index 2}

D = (xyz, 3) = \text{the anchor at index 3}

The anchor is the same. The index is different.

---

Part IV — The Balanced Algorithm

§ 11. The Structure

```javascript
function balancedCube(
  x = 2,
  y = 4,
  z = 8,
  a = 1
) {
  // The two anchors (XOR)
  const xyz = x ^ y ^ z;
  const xyza = xyz ^ a;
  
  // The six faces (XOR with direction)
  const U = { value: xyz, index: 2, direction: +1 };
  const D = { value: xyz, index: 3, direction: -1 };
  const R = { value: xyz, index: 4, direction: +1 };
  const L = { value: xyz, index: 5, direction: -1 };
  const F = { value: xyz, index: 6, direction: +1 };
  const B = { value: xyz, index: 7, direction: -1 };
  
  // The center
  const center = { x, y, z };
  
  // The 27 cells
  const cells = [];
  for (const faceX of [D, center.x, U]) {
    for (const faceY of [L, center.y, R]) {
      for (const faceZ of [B, center.z, F]) {
        const cellX = typeof faceX === 'object' ? faceX.value : faceX;
        const cellY = typeof faceY === 'object' ? faceY.value : faceY;
        const cellZ = typeof faceZ === 'object' ? faceZ.value : faceZ;
        cells.push({
          value: cellX ^ cellY ^ cellZ,
          x: cellX,
          y: cellY,
          z: cellZ,
          diagonal: cellX ^ cellY ^ cellZ,
          linear: cellX + cellY + cellZ
        });
      }
    }
  }
  
  // Check the balance
  const totalXOR = cells.reduce((acc, c) => acc ^ c.value, 0);
  const balanced = totalXOR === 0;
  
  return {
    anchors: { xyz, xyza },
    faces: { U, D, R, L, F, B },
    center,
    cells,
    balanced,
    totalXOR
  };
}
```

---

§ 12. The Balance Condition

For the cube to be balanced, the XOR of all 27 cells must be zero.

Since each axis value appears 9 times (odd), the balance reduces to:

(x_{\text{lower}} \oplus x \oplus x_{\text{upper}}) = 0

(y_{\text{lower}} \oplus y \oplus y_{\text{upper}}) = 0

(z_{\text{lower}} \oplus z \oplus z_{\text{upper}}) = 0

Each axis must XOR to zero.

---

§ 13. The Axis Triple

For the X-axis:

(xyz \oplus xa) \oplus x \oplus (xyz \oplus xa) = 0

But xyz \oplus xa \oplus xyz \oplus xa = 0, so:

0 \oplus x = x \neq 0

This doesn't work.

The issue is that in the XOR basis, the lower and upper bounds are the same.

We need a different construction.

§ 14. The Correct Construction

The three values on each axis are:

· Lower: x \oplus a
· Center: x
· Upper: x \oplus a \oplus \text{mask}

No — let me think about this differently.

In arithmetic, the three values are x - a, x, x + a.

In XOR, the three values should be x \oplus a, x, x \oplus b where a \oplus b = 0 for balance.

The balance condition is:

(x \oplus a) \oplus x \oplus (x \oplus b) = 0

a \oplus b = 0

a = b

So the three values are x \oplus a, x, x \oplus a.

But that means the lower and upper are the same.

The only way to have three distinct values that XOR to zero is:

p \oplus q \oplus r = 0

with p, q, r all distinct.

For example: 1 \oplus 2 \oplus 3 = 0. So p=1, q=2, r=3.

In general: p \oplus q \oplus r = 0 means r = p \oplus q.

So the three values are p, q, p \oplus q.

The center is q. The lower is p. The upper is p \oplus q.

---

§ 15. The Balanced Axis

For the X-axis:

· Lower: x \oplus a
· Center: x
· Upper: a

Check: (x \oplus a) \oplus x \oplus a = 0 ✅

So the three values are x \oplus a, x, a.

The center is x. The lower is x \oplus a. The upper is a.

Similarly for Y and Z:

· Y-axis: y \oplus a, y, a
· Z-axis: z \oplus a, z, a

The cube is:

\{x \oplus a, x, a\} \times \{y \oplus a, y, a\} \times \{z \oplus a, z, a\}

---

§ 16. The Balanced Cube

```javascript
function balancedCube(x, y, z, a) {
  const axes = {
    x: [x ^ a, x, a],
    y: [y ^ a, y, a],
    z: [z ^ a, z, a]
  };
  
  const cells = [];
  for (const xv of axes.x) {
    for (const yv of axes.y) {
      for (const zv of axes.z) {
        cells.push(xv ^ yv ^ zv);
      }
    }
  }
  
  const totalXOR = cells.reduce((acc, v) => acc ^ v, 0);
  const balanced = totalXOR === 0;
  
  return {
    axes,
    cells,
    balanced,
    totalXOR,
    diagonal: totalXOR,
    linear: cells.reduce((acc, v) => acc + v, 0)
  };
}
```

---

§ 17. Example

For x = 2, y = 4, z = 8, a = 1:

· X-axis: 2 \oplus 1, 2, 1 = 3, 2, 1
· Y-axis: 4 \oplus 1, 4, 1 = 5, 4, 1
· Z-axis: 8 \oplus 1, 8, 1 = 9, 8, 1

The 27 cells:

\{3, 2, 1\} \times \{5, 4, 1\} \times \{9, 8, 1\}

Check the balance:

Each axis XORs to zero:

· 3 \oplus 2 \oplus 1 = 0 ✅
· 5 \oplus 4 \oplus 1 = 0 ✅
· 9 \oplus 8 \oplus 1 = 0 ✅

So the cube is balanced.

Total XOR of all 27 cells = 0 ✅

---

Part V — The Rubik's Cube Indices

§ 18. The New Index Order

Index Name Value
0 xyz x \oplus y \oplus z
1 xyza x \oplus y \oplus z \oplus a
2 up x \oplus a
3 down x
4 right y \oplus a
5 left y
6 front z \oplus a
7 back z

The two anchors come first.

The six faces are the balanced axis values.

---

§ 19. The Balanced Algorithm

```javascript
function balancedRubiksCube(
  x = 2,
  y = 4,
  z = 8,
  a = 1
) {
  // The two anchors
  const xyz = x ^ y ^ z;
  const xyza = xyz ^ a;
  
  // The six balanced axis values
  const faces = {
    up:    x ^ a,    // index 2
    down:  x,        // index 3
    right: y ^ a,    // index 4
    left:  y,        // index 5
    front: z ^ a,    // index 6
    back:  z         // index 7
  };
  
  // The 27 cells
  const cells = [];
  for (const xv of [faces.up, faces.down, a]) {
    for (const yv of [faces.right, faces.left, a]) {
      for (const zv of [faces.front, faces.back, a]) {
        cells.push(xv ^ yv ^ zv);
      }
    }
  }
  
  // The balance check
  const totalXOR = cells.reduce((acc, v) => acc ^ v, 0);
  const balanced = totalXOR === 0;
  
  // The linear (sum)
  const linear = cells.reduce((acc, v) => acc + v, 0);
  
  return {
    anchors: { xyz, xyza },
    faces,
    cells,
    balanced,
    totalXOR,
    linear
  };
}
```

---

§ 20. The Switch Reduction to XOR

```javascript
switch (true) {
  case isRight(...):
    faces.right = faces.right ^ 0xFF;  // XOR with all-ones
    break;

  case isLeft(...):
    faces.left = faces.left ^ 0xFF;
    break;

  case linear % count === 0:
    xyza = xyza ^ 0xFF;
    break;

  case diagonal % xy === 0:
    xyz = xyz ^ 0xFF;
    rules[count] = delta16(ruler).toString('hex');
    break;

  default:
    process.stdout.write('.');
}
```

Every operation reduces to XOR.

---

Part VI — The Canonical Statement

§ 21. The Balanced Anchors

xyz = x \oplus y \oplus z

xyza = xyz \oplus a

§ 22. The Balanced Faces

U = x \oplus a, \quad D = x

R = y \oplus a, \quad L = y

F = z \oplus a, \quad B = z

Each axis triple (U, D, a) XORs to zero.

§ 23. The Balance

The cube is balanced if and only if:

(U \oplus D \oplus a) = 0

(R \oplus L \oplus a) = 0

(F \oplus B \oplus a) = 0

Which holds automatically by construction.

§ 24. The Rubik's Cube

The balanced cube is the Rubik's cube:

· Core: the center (x, y, z)
· Slices: the two anchors xyz, xyza
· Faces: U, D, R, L, F, B
· Cells: the 27 cubies

The balance condition is XOR to zero.

Every operation reduces to XOR.

---

Part VII — The Final Algorithm

§ 25. The Complete Function

```javascript
function proportionalCube(x, y, z, a) {
  // Anchors (XOR)
  const xyz = x ^ y ^ z;
  const xyza = xyz ^ a;

  // Balanced faces (XOR)
  const U = x ^ a;
  const D = x;
  const R = y ^ a;
  const L = y;
  const F = z ^ a;
  const B = z;

  // The 27 cells
  const cells = [];
  for (const xv of [U, D, a]) {
    for (const yv of [R, L, a]) {
      for (const zv of [F, B, a]) {
        cells.push(xv ^ yv ^ zv);
      }
    }
  }

  // Balance verification
  const totalXOR = cells.reduce((acc, v) => acc ^ v, 0);
  const balanced = totalXOR === 0;

  // Linear (sum)
  const linear = cells.reduce((acc, v) => acc + v, 0);

  // Diagonal (XOR)
  const diagonal = totalXOR;

  return {
    anchors: { xyz, xyza },
    faces: { U, D, R, L, F, B },
    cells,
    balanced,
    totalXOR,
    diagonal,
    linear
  };
}

// Example
const cube = proportionalCube(2, 4, 8, 1);
console.log(cube.balanced);  // true
console.log(cube.diagonal);  // 0
```

---

§ 26. The Rubik's Cube Operators

```javascript
// Rubik's cube rotations, all reducing to XOR
function rotateU(ruler) {
  // Swap the U face with the D face
  const temp = ruler[2];
  ruler[2] = ruler[3];
  ruler[3] = temp;
  return ruler;
}

function rotateR(ruler) {
  const temp = ruler[4];
  ruler[4] = ruler[5];
  ruler[5] = temp;
  return ruler;
}

function rotateF(ruler) {
  const temp = ruler[6];
  ruler[6] = ruler[7];
  ruler[7] = temp;
  return ruler;
}

// All rotations reduce to XOR with a mask
function rotate(ruler, face, mask) {
  ruler[face] = ruler[face] ^ mask;
  return ruler;
}
```

---

The Final Reflection

The balanced proportional cube:

· Anchors: xyz = x \oplus y \oplus z, xyza = xyz \oplus a
· Faces: U = x \oplus a, D = x, R = y \oplus a, L = y, F = z \oplus a, B = z
· Cells: \{U, D, a\} \times \{R, L, a\} \times \{F, B, a\}
· Balance: every axis triple XORs to zero
· Total: XOR of all 27 cells = 0

Every operation reduces to XOR.

The Rubik's cube is the proportional cube.

The core is the center.

The slices are the anchors.

The faces are the balanced axes.

The cubies are the 27 cells.

The balance is XOR to zero.

The proportional cube is the balanced Rubik's cube. The anchors are the slices. The faces are the balanced axes. The core is the centroid. Everything is XOR.

---

End of the balanced proportional cube algorithm.

---

Would you like me to:

1. Verify the balance for specific values of x, y, z, a?
2. Implement the full Rubik's cube rotation group as XOR operations?
3. Connect the balanced cube to the three 3!s and the 1! pull?