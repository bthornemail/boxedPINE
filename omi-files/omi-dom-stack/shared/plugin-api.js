/**
 * OMI-IMO Extension / Plugin API
 * Register new snap modes, solids, GNN layers, and media-type editors.
 */
'use strict';

const registry = {
  snapModes: new Map(),
  solids: new Map(),
  gnnLayers: new Map(),
  mediaEditors: new Map()
};

function registerSnapMode(name, fn) {
  if (typeof name !== 'string' || typeof fn !== 'function') {
    throw new TypeError('registerSnapMode(name, fn)');
  }
  registry.snapModes.set(name, fn);
  return name;
}

function registerSolid(key, solid) {
  if (!key || !solid || solid.v == null) {
    throw new TypeError('registerSolid(key, { name, v, e, f })');
  }
  registry.solids.set(key, Object.freeze({
    name: solid.name || key,
    v: solid.v | 0,
    e: solid.e | 0,
    f: solid.f | 0,
    star: !!solid.star
  }));
  return key;
}

function registerGnnLayer(name, fn) {
  if (typeof name !== 'string' || typeof fn !== 'function') {
    throw new TypeError('registerGnnLayer(name, fn)');
  }
  registry.gnnLayers.set(name, fn);
  return name;
}

/**
 * media editor: (editContext) => payload
 * editContext: { snap, triple, orch, mediaType }
 */
function registerMediaEditor(mediaType, fn) {
  if (typeof mediaType !== 'string' || typeof fn !== 'function') {
    throw new TypeError('registerMediaEditor(mediaType, fn)');
  }
  registry.mediaEditors.set(mediaType, fn);
  return mediaType;
}

function getSnapMode(name) {
  return registry.snapModes.get(name) || null;
}

function getSolid(key) {
  return registry.solids.get(key) || null;
}

function getGnnLayer(name) {
  return registry.gnnLayers.get(name) || null;
}

function getMediaEditor(mediaType) {
  return registry.mediaEditors.get(mediaType) || null;
}

function listExtensions() {
  return {
    snapModes: [...registry.snapModes.keys()],
    solids: [...registry.solids.keys()],
    gnnLayers: [...registry.gnnLayers.keys()],
    mediaEditors: [...registry.mediaEditors.keys()]
  };
}

function clearExtensions() {
  registry.snapModes.clear();
  registry.solids.clear();
  registry.gnnLayers.clear();
  registry.mediaEditors.clear();
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  clearExtensions();
  registerSnapMode('demo-grid', (x, y) => ({ x: Math.round(x), y: Math.round(y) }));
  assert('snap registered', getSnapMode('demo-grid')(1.2, 3.7).x === 1);

  registerSolid('X1', { name: 'demo solid', v: 4, e: 6, f: 4 });
  assert('solid registered', getSolid('X1').v === 4);

  registerGnnLayer('identity', (adj, features) => features);
  assert('gnn layer', typeof getGnnLayer('identity') === 'function');

  registerMediaEditor('demo', (ctx) => ({ kind: 'demo', triple: ctx.triple && ctx.triple.index }));
  assert('media editor', getMediaEditor('demo')({ triple: { index: 3 } }).kind === 'demo');

  const list = listExtensions();
  assert('list has snap', list.snapModes.includes('demo-grid'));
  assert('list has solid', list.solids.includes('X1'));

  clearExtensions();
  assert('cleared', listExtensions().snapModes.length === 0);

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  registerSnapMode,
  registerSolid,
  registerGnnLayer,
  registerMediaEditor,
  getSnapMode,
  getSolid,
  getGnnLayer,
  getMediaEditor,
  listExtensions,
  clearExtensions,
  selfTest
};
