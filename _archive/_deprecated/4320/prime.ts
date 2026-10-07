type REFERENCE = (declaration: RegExp, definition: string) => Point


interface iExtant {
    Exponent: number = 0; // Entropy
    Exception: string = 0; // Extant
}
class Point implements iExtant{
    Point: number = 0;
    Index: number = 0;
    Number: number = 0;
    bind: REFERENCE = function Bind() { };
    apply: REFERENCE = function Apply() { };
    evaluate: REFERENCE = function Evaluate() { };
    digest: REFERENCE = function Digest() { };

}
class Circle extends Point {
    Centroid: number = 0;
    Radius: number = 0;
}
class Triangle extends Circle {
    X(Equator: number, Up: number, Down: number) {
        Atomics.compareExchange(omi, 0, 2, 1)
        Atomics.compareExchange(omi, 1, 0, 2)
        Atomics.compareExchange(omi, 2, 1, 0)
        if (Atomics.compareExchange(omi, 0, 2, 1)) { throw (new Float64Array(tensor)); }
        `Base 0 ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}`;
        `Base 1 ${[1, 0, 3, 2, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14]}`;
        `Base 2 ${[2, 3, 0, 1, 6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13]}`;
        return Atomics.compareExchange(Equator, this.Index, this.Point, this.Number);
    };
    Y(Middle: number, Left: number, Right: number) {
        return Atomics.compareExchange(omi, 3, 12, 3) ^
            Atomics.compareExchange(omi, 7, 8, 7) ^
            Atomics.compareExchange(omi, 11, 4, 11) ^
            Atomics.compareExchange(omi, 15, 0, 15)
                // ends 12,8,4,0, 26/24
                `base 3: 3 2 1 0 | 7 6 5 4 | 11 10 9 8 | 15 14 13 12      four - block family, starts at 0 - 7`;
        `base 7: 7 6 5 4 | 3 2 1 0 | 15 14 13 12 | 11 10 9 8      fulcrum, splits 0 - 7 and 8 - 15`;
        `base 11: 11 10 9 8 | 15 14 13 12 | 3 2 1 0 | 7 6 5 4      orthogonal base, mixed blocks`;
        `base 15: 15 14 13 12 | 11 10 9 8 | 7 6 5 4 | 3 2 1 0      four - block family, starts at 12 - 15`;

    };
    Z(Standing: number, Front: number, Back: number) {
        return Atomics.compareExchange(omi, 17, 30, 17) ^
            Atomics.compareExchange(omi, 19, 28, 19)
                `base 17: 17 16 19 18 | 21 20 23 22 | 25 24 27 26 | 29 28 31 30   the 5 - bit base, alternating`;
        `base 19: 19 18 17 16 | 23 22 21 20 | 27 26 25 24 | 31 30 29 28   the orbital base`;
    };
    `0, 7, 15`
}
class Square extends Circle {
    Up: number = 0;
    Down: number = 0;
    Left: number = 0;
    Right: number = 0;
    Front: number = 0;
    Back: number = 0;
}
class Tetrahedron extends Square {
    Binary: number = 0;
    Octal: number = 0;
    heXadecimal: number = 0;
    Decimal: number = 0;
}

class Simplex {
    const handler = {
        get(target: any, index: any) {
            return Reflect.get(target, index);
        },
        set(target: any, index: any, value: any) {
            return Reflect.set(target, index, value);
        },
        has(target: object, index: PropertyKey) {
            return Reflect.has(target, index);
        },
    };

    function get(state: any, index: any) {
        if (!admissible(index)) {
            throw new Deviation(index, 'admissible', 'inadmissible');
        }
        return Reflect.get(state, index);
    }
    function set(state: any, index: any, value: any) {
        if (!admissible(index)) {
            throw new Deviation(index, 'admissible', 'inadmissible');
        }
        return Reflect.set(state, index, value);
    }
    function catcher(error: any, handler: { (position: any, expected: any, actual: any, difference: any): { failed: boolean; position: any; expected: any; actual: any; difference: any; }; (arg0: any, arg1: any, arg2: any, arg3: any): any; }) {
        if (error instanceof Deviation) {
            return handler(error.position, error.expected, error.actual, error.difference);
        }
        throw error;
    }
    function access(state: any, index: any, value: any) {
        try {
            if (arguments.length === 2) {
                return get(state, index);
            }
            return set(state, index, value);
        } catch (error) {
            return catcher(error, (position: any, expected: any, actual: any, difference: any) => ({
                failed: true,
                position,
                expected,
                actual,
                difference,
            }));
        }
    }
}
class Structure extends Simplex {
    Centroid: any;
    Radius: any;
    Up: any;
    Down: any;
    Left: any;
    Right: any;
    Front: any;
    Back: any;
    Expression() { }
    Error() { }
    Exit = (x: any, y: any, z: any) => {
        return `${this.Centroid}${this.Radius}${this.Up}${this.Down}${this.Left}${this.Right}${this.Front}${this.Back} `;
    }
    Escape() { }
    Evaluate() { }
}

class Source {
    input = (op: any) => op(this.bytes);
    output = (op: any) => op(this.bytes);
    bytes = Buffer.allocUnsafe(16);

}
class Stream {
    reader: any;
    writer: any;
    buffer = Buffer.allocUnsafe(16);;
}
class Substrate implements Bind {
    length: any;
    offset: any;
    base = Buffer.allocUnsafe(16);;
}


function admissible(index: any) {
    throw new Error("Function not implemented.");
}
// const index = '0p';       // a point at 0
// const index = '1i';       // an index at 1
// const index = '2n';       // a number at 2
// const index = '0x';       // hex at 0
// const index = '3.5';      // a decimal at 3.5

// 0     diagonal        the frame condition
// 1     size            the precision
// 2     top             spatial
// 3     bottom          spatial
// 4     right           spatial
// 5     left            spatial
// 6     forward         spatial
// 7     backward        spatial
// 9     get            read the current position
// 10    set            write the current position
// 11    catch          handle the failure
// 12    bind           build the relation
// 13    apply          invoke the relation
// 14    eval           extract from the relation
// 15    digest         fold the relations

// block 0    60-63      < = > ?        four comparison operators
// block 1    56-59      8 9 : ;        four characters
// block 2    52-55      4 5 6 7        four characters
// block 3    48-51      0 1 2 3        four characters
// block 4    44-47      , - . /        four punctuations
// block 5    40-43      ( ) * +        four punctuations (only 40 shown)
// block 6    36-39      $ % & '        four punctuations (only 36 shown)
// block 7    28-31                      four values (28 shown)
// block 8    24-27                      four values (24 shown)
// block 9    12-15                      four values (12, 14, 15 shown)
// block 10   0-7                        eight values (0-3, 7 shown)
// block 11   124+                        the high boundary