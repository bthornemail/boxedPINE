// OMI LayoutWorklet — Canvas C (experimental CSS Layout API)
registerLayout('omi-layout', class {
  static get inputProperties() { return ['--omi-track']; }
  async *layout(children, edges, constraints) {
    const track = parseFloat(this.properties.get('--omi-track')) || 1;
    for (const child of children) {
      yield await child.layoutNextFragment({
        fixedInlineSize: constraints.fixedInlineSize / track
      });
    }
  }
});
