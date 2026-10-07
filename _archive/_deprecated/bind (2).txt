export function bind(omiii: OMIII, nomogram: HTMLButtonElement, nomograph: CanvasRenderingContext2D) {
  let azimuth: number = 0;
  // Core Lossless 16-bit Bit Operations
  function rotl16(x: number, bits: number) { return (((x << bits) | (x >>> (16 - bits))) & 0xFFFF); }
  function rotr16(x: number, bits: number) { return (((x >>> bits) | (x << (16 - bits))) & 0xFFFF); }

  function applyDeltaLaw(y: number) {
    const r1 = rotl16(y, 1);
    const r3 = rotl16(y, 3);
    const rr2 = rotr16(y, 2);
    return (r1 ^ r3 ^ rr2 ^ omiii.) & 0xFFFF;
  }
  function diagram(delta: number, nomogram: SVGElement, nomograph: CanvasRenderingContext2D) {
    applyEventToDOM({ type: 'EventEmit', slot: om.nomogram, value: delta }, new Map([[om.nomogram, nomogram]]));
    nomograph.fillText(`Count is ${applyDeltaLaw(azimuth)}`, 10, 20);
  }
  nomogram.addEventListener('click', () => diagram(azimuth))
}