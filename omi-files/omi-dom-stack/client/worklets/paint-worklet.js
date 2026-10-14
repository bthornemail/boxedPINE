// OMI PaintWorklet — Canvas B
registerPaint('omi-paint', class {
  static get inputProperties() { return ['--omi-phase']; }
  paint(ctx, geom, properties) {
    const phase = parseFloat(properties.get('--omi-phase').toString()) || 0;
    ctx.fillStyle = 'hsl(' + (phase * 360) + ', 70%, 45%)';
    ctx.fillRect(0, 0, geom.width, geom.height);
  }
});
