import { Buffer } from 'node:buffer';
declare enum CanvasColor {
    RED = 1,
    ORANGE = 2,
    YELLOW = 3,
    GREEN = 4,
    CYAN = 5,
    PURPLE = 6
}

type EdgeSide = "top" | "right" | "bottom" | "left";
type EdgeEnd = "none" | "arrow";
interface Edge {
    id: string;
    fromNode: string;
    fromSide?: EdgeSide;
    fromEnd?: EdgeEnd;
    toNode: string;
    toSide?: EdgeSide;
    toEnd?: EdgeEnd;
    color?: CanvasColor;
    label?: string;
}

interface GenericNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: CanvasColor;
}
interface TextNode extends GenericNode {
    type: "text";
    text: string;
}
interface LinkNode extends GenericNode {
    type: "link";
    url: string;
}
type GroupNodeBackgroundStyle = "cover" | "ratio" | "repeat";
interface GroupNode {
    type: "group";
    label?: string;
    background?: string;
    backgroundStyle?: GroupNodeBackgroundStyle;
}

declare class JSONCanvas {
    private nodes;
    private edges;
    constructor(nodes?: GenericNode[], edges?: Edge[]);
    addNode(node: GenericNode): void;
    addEdge(edge: Edge): void;
    getNode(id: string): GenericNode | undefined;
    getEdge(id: string): Edge | undefined;
    getNodes(): GenericNode[];
    getEdges(): Edge[];
    removeNode(id: string): void;
    removeEdge(id: string): void;
    toString(): string;
    static fromString(json: string): JSONCanvas;
}

export { CanvasColor, type Edge, type EdgeEnd, type EdgeSide, type GenericNode, type GroupNode, JSONCanvas, type LinkNode, type TextNode, JSONCanvas as default };

const domain = Buffer.alloc(5040);
const state = Buffer.alloc(4096);
const context = Buffer.alloc(4032);
const blackboard = Buffer.alloc(1048);
const canvas = Buffer.alloc(512);
const view = Buffer.alloc(256);
const frame = Buffer.alloc(60);
const content = Buffer.alloc(16);
const controller = Buffer.alloc(4);

const node = Buffer.from('hello world', 'utf16le');
function compose(buffers: Buffer[]){
    const totalLength = buffers.reduce((accum,buf)=>buf.length + accum,1);
    const bufA = Buffer.concat(buffers, totalLength);
    console.log(totalLength,bufA.toString('base64'));
    return bufA;
}

const buffer = compose([
    //domain,state,context,
    //blackboard,canvas,view,
    frame,content,controller
]);

function createCounter(initialValue: number): (startingPosition: number ) => Generator<number, never, unknown> {
    // 'count' is enclosed by the returned inner function
    let currentPosition: number = initialValue;

    function increment(): number {
        currentPosition += 1;
        return currentPosition;
    };
    function* accumulator(startingValue = 0): Generator<number, any, number> {
        let value = startingValue;
        while (true) {
            const input = yield value;
            value += input;
        }
    }
    const compose = <A, B, C>(
        f: (val: B) => C,
        g: (val: A) => B
    ) => (x: A): C => f(g(x));

    const alt = <T, R>(
        f1: (val: T) => R | null,
        f2: (val: T) => R
    ) => (x: T): R => {
        const result = f1(x);
        return result !== null ? result : f2(x);
    };

    const rot7 = (x: number, n: number) => (x << n) | (x >>> (7 - n));
    const rot15 = (x: number, n: number) => (x << n) | (x >>> (15 - n));
    const rot60 = (x: number, n: number) => (x << n) | (x >>> (60 - n));
    const rot240 = (x: number, n: number) => (x << n) | (x >>> (240 - n));
    const rot360 = (x: number, n: number) => (x << n) | (x >>> (360 - n));

    function* g1() {
        yield increment;
        yield rot7;
        yield rot15;
    }
    
    function* g2() {
        yield rot60;
        yield rot240;
        yield rot360;
    }
    function* g3() {
        yield compose;
        yield alt;
        yield accumulator;
    }

    const iterator: any = function* () {
        yield* g2();
        yield* g2();
        yield* g3();
    }
    return function* fibonacciGenerator(startingPosition = 1) {
        const f0 = 0;
        if (startingPosition === 1) {
            yield f0;
        }
        const f1 = 1;
        if (startingPosition <= 2) {
            yield f1;
        }
        let previousValue = f0, currentValue = f1, nextValue;
        while (true) {
            nextValue = previousValue + currentValue;
            previousValue = currentValue;
            currentValue = nextValue;
            if (currentPosition >= startingPosition) {
                yield nextValue;
            } else {
                currentPosition += 1;
            }
        }
    }
}