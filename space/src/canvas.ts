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
