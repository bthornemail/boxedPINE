const bones = [];
const shoulder = new THREE.Bone();
const elbow = new THREE.Bone();
const hand = new THREE.Bone();
shoulder.add(elbow);
elbow.add(hand);
bones.push(shoulder, elbow, hand);
shoulder.position.y = -5;
elbow.position.y = 0;
hand.position.y = 5;
const armSkeleton = new THREE.Skeleton(bones);
// Create a group and add the two cubes.
// These cubes can now be rotated / scaled etc as a group.
const group = new THREE.Group();
group.add(meshA);
group.add(meshB);
scene.add(group);
const curve = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(- 10, 0),
    new THREE.Vector2(20, 15),
    new THREE.Vector2(10, 0)
)
const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
// Create the final object to add to the scene
const curveObject = new THREE.Line(geometry, material);
new Triangle(a : Vector3, b : Vector3, c : Vector3)
new Sphere(center : Vector3, radius : number)
const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
const vector = new THREE.Vector3(1, 0, 0);
vector.applyQuaternion(quaternion);
new Plane(normal : Vector3, constant : number)
new Box3(min : Vector3, max : Vector3)
new Box2(min : Vector2, max : Vector2)
const a = new THREE.Vector2(0, 1);
//no arguments; will be initialised to (0, 0)
const b = new THREE.Vector2();
const d = a.distanceTo(b);

const a = new THREE.Vector3(0, 1, 0);
//no arguments; will be initialised to (0, 0, 0)
const b = new THREE.Vector3();
const d = a.distanceTo(b);

const a = new THREE.Vector4(0, 1, 0, 0);
//no arguments; will be initialised to (0, 0, 0, 1)
const b = new THREE.Vector4();
const d = a.dot(b);
const m = new THREE.Matrix2();
m.set(11, 12,
    21, 22);

const m = new THREE.Matrix();
m.set(11, 12, 13,
    21, 22, 23,
    31, 32, 33);

m.elements = [11, 21, 31,
    12, 22, 32,
    13, 23, 33];
const m = new THREE.Matrix4();
m.set(11, 12, 13, 14,
    21, 22, 23, 24,
    31, 32, 33, 34,
    41, 42, 43, 44);
m.elements = [11, 21, 31, 41,
    12, 22, 32, 42,
    13, 23, 33, 43,
    14, 24, 34, 44];


function lucasRecursive(n) {
    if (n === 0) return 2;
    if (n === 1) return 1;
    return lucasRecursive(n - 1) + lucasRecursive(n - 2);
}

// Test the recursive function
console.log(lucasRecursive(10)); // Output: 123

// Iterative function to find nth Lucas Number

function lucas(n) {
    // Base values for positions 0 and 1
    let a = 2, b = 1, c;

    if (n === 0) {
        return a;
    }

    // Generating Lucas number for position n
    for (let i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }

    return b;
}

// Example: Compute the 9th Lucas number
let n = 9;
console.log(lucas(n));

function add(x) {
    return x + 2;
}
function mul(x) {
    return x * 3;
}

function compose(f, g) {
    return function(x) {
        return f(g(x));
    };
}
var res = compose(add, mul)(4);
console.log(res);
function mul(x) {
    return function(y) {
        return x * y;
    };
}
var mulFn = mul(2);
console.log(mulFn(5));
function memoize(func) {
    var cache = {};
    return function(arg) {
        if (arg in cache) {
            return cache[arg];
        } else {
            var res = func(arg);
            cache[arg] = res;
            return res;
        }
    };
}
function slow(num) {
    console.log("Computing...");
    return num * 2;
}

var fast = memoize(slow);
console.log(fast(5)); // Computing... 10
console.log(fast(5)); // 10 (cached)

// program to generate fibonacci series up to n terms

// take input from the user
const number = parseInt(prompt('Enter the number of terms: '));
let n1 = 0, n2 = 1, nextTerm;

console.log('Fibonacci Series:');

for (let i = 1; i <= number; i++) {
    console.log(n1);
    nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
}

// program to generate fibonacci series up to a certain number

// take input from the user
const number = parseInt(prompt('Enter a positive number: '));
let n1 = 0, n2 = 1, nextTerm;

console.log('Fibonacci Series:');
console.log(n1); // print 0
console.log(n2); // print 1

nextTerm = n1 + n2;

while (nextTerm <= number) {

    // print the next term
    console.log(nextTerm);

    n1 = n2;
    n2 = nextTerm;
    nextTerm = n1 + n2;
}

// program to display fibonacci sequence using recursion
function fibonacci(num) {
    if (num < 2) {
        return num;
    }
    else {
        return fibonacci(num - 1) + fibonacci(num - 2);
    }
}

// take nth term input from the user
const nTerms = prompt('Enter the number of terms: ');

if (nTerms <= 0) {
    console.log('Enter a positive integer.');
}
else {
    for (let i = 0; i < nTerms; i++) {
        console.log(fibonacci(i));
    }
}
