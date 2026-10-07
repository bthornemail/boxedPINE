class JSONCanvas {
  constructor(nodes, edges) {
    __publicField(this, "nodes", []);
    __publicField(this, "edges", []);
    if (nodes) {
      this.nodes = nodes;
    }
    if (edges) {
      this.edges = edges;
    }
  }
  addNode(node) {
    if (this.nodes.find((n) => n.id === node.id)) {
      throw new Error("A node with the same ID already exists in this.nodes");
    }
    this.nodes.push(node);
  }
  addEdge(edge) {
    if (this.edges.find((e) => e.id === edge.id)) {
      throw new Error("An edge with the same ID already exists in this.edges");
    }
    this.edges.push(edge);
  }
  getNode(id) {
    return this.nodes.find((n) => n.id === id);
  }
  getEdge(id) {
    return this.edges.find((e) => e.id === id);
  }
  getNodes() {
    return this.nodes;
  }
  getEdges() {
    return this.edges;
  }
  removeNode(id) {
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.edges = this.edges.filter((e) => e.fromNode !== id && e.toNode !== id);
  }
  removeEdge(id) {
    this.edges = this.edges.filter((e) => e.id !== id);
  }
  toString() {
    return JSON.stringify({
      nodes: this.nodes,
      edges: this.edges
    });
  }
  static fromString(json) {
    const obj = JSON.parse(json);
    return new JSONCanvas(obj.nodes, obj.edges);
  }
}

export { JSONCanvas, JSONCanvas as default };