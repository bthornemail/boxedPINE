#!/usr/bin/env node
/**
 * Deterministic GLB exporter for world.model.glb
 *
 * Input:  world.mesh.ir.json (+ any external buffers referenced by bufferRef)
 * Output: world.model.glb + world.model.glb.check.json
 *
 * Notes:
 * - Euler rotation is interpreted as radians, XYZ order.
 * - GLB is written with JSON chunk first, BIN chunk second, deterministic padding/alignment.
 * - glTF JSON is serialized with stable key ordering (lexicographic) for determinism.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { ensureDir, writeJson } = require('./lib');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[k] = v;
  }
  return out;
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function sha256Prefixed(buf) {
  return `sha256:${sha256Hex(buf)}`;
}

function sha256File(p) {
  return sha256Prefixed(fs.readFileSync(p));
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function stableStringify(value) {
  // Canonicalize objects by sorting keys; arrays keep order.
  function canon(v) {
    if (v === null) return null;
    if (Array.isArray(v)) return v.map(canon);
    if (typeof v !== 'object') return v;
    const keys = Object.keys(v).sort();
    const out = {};
    for (const k of keys) out[k] = canon(v[k]);
    return out;
  }
  return JSON.stringify(canon(value));
}

function padTo4(buf, padByte) {
  const n = buf.length;
  const m = (4 - (n % 4)) % 4;
  if (!m) return buf;
  return Buffer.concat([buf, Buffer.alloc(m, padByte)]);
}

function u32le(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

function f32ArrayToBuffer(arr) {
  const out = Buffer.alloc(arr.length * 4);
  for (let i = 0; i < arr.length; i += 1) out.writeFloatLE(arr[i], i * 4);
  return out;
}

function u16ArrayToBuffer(arr) {
  const out = Buffer.alloc(arr.length * 2);
  for (let i = 0; i < arr.length; i += 1) out.writeUInt16LE(arr[i] >>> 0, i * 2);
  return out;
}

function u32ArrayToBuffer(arr) {
  const out = Buffer.alloc(arr.length * 4);
  for (let i = 0; i < arr.length; i += 1) out.writeUInt32LE(arr[i] >>> 0, i * 4);
  return out;
}

function u8ArrayToBuffer(arr) {
  const out = Buffer.alloc(arr.length);
  for (let i = 0; i < arr.length; i += 1) out.writeUInt8(arr[i] >>> 0, i);
  return out;
}

function align4(n) {
  return (n + 3) & ~3;
}

function eulerXYZToQuat(rx, ry, rz) {
  // Standard XYZ intrinsic rotations in radians.
  const cx = Math.cos(rx * 0.5);
  const sx = Math.sin(rx * 0.5);
  const cy = Math.cos(ry * 0.5);
  const sy = Math.sin(ry * 0.5);
  const cz = Math.cos(rz * 0.5);
  const sz = Math.sin(rz * 0.5);

  const qw = cx * cy * cz - sx * sy * sz;
  const qx = sx * cy * cz + cx * sy * sz;
  const qy = cx * sy * cz - sx * cy * sz;
  const qz = cx * cy * sz + sx * sy * cz;
  return [qx, qy, qz, qw];
}

function readBufferSlice(baseDir, ref, usedFiles) {
  const p = path.resolve(baseDir, ref.path);
  usedFiles.add(p);
  const b = fs.readFileSync(p);
  const start = ref.byte_offset || 0;
  const end = start + ref.byte_length;
  assert(start >= 0 && end <= b.length, `bufferRef out of range: ${ref.path} offset=${start} len=${ref.byte_length}`);
  return b.subarray(start, end);
}

function readAttr(baseDir, attr, usedFiles) {
  assert(attr && typeof attr === 'object', 'attr must be an object');
  const fmt = String(attr.format || '');
  const comps = Number(attr.components || 0);
  assert([1, 2, 3, 4].includes(comps), `invalid attr.components: ${attr.components}`);

  if (attr.buffer) {
    const raw = readBufferSlice(baseDir, attr.buffer, usedFiles);
    return { fmt, comps, raw };
  }

  assert(Array.isArray(attr.data), 'attr.data must be an array when attr.buffer is absent');
  const data = attr.data;
  if (fmt === 'f32') return { fmt, comps, raw: f32ArrayToBuffer(data.map(Number)) };
  if (fmt === 'u32') return { fmt, comps, raw: u32ArrayToBuffer(data.map((x) => Number(x) >>> 0)) };
  if (fmt === 'u16') return { fmt, comps, raw: u16ArrayToBuffer(data.map((x) => Number(x) >>> 0)) };
  if (fmt === 'u8') return { fmt, comps, raw: u8ArrayToBuffer(data.map((x) => Number(x) >>> 0)) };
  throw new Error(`unsupported attr.format for inline data: ${fmt}`);
}

function readIndices(baseDir, idx, usedFiles) {
  assert(idx && typeof idx === 'object', 'indices must be an object');
  const fmt = String(idx.format || '');
  if (idx.buffer) {
    const raw = readBufferSlice(baseDir, idx.buffer, usedFiles);
    return { fmt, raw };
  }

  assert(Array.isArray(idx.data), 'indices.data must be an array when indices.buffer is absent');
  const data = idx.data.map((x) => Number(x) >>> 0);
  if (fmt === 'u32') return { fmt, raw: u32ArrayToBuffer(data) };
  if (fmt === 'u16') return { fmt, raw: u16ArrayToBuffer(data) };
  if (fmt === 'u8') return { fmt, raw: u8ArrayToBuffer(data) };
  throw new Error(`unsupported indices.format for inline data: ${fmt}`);
}

function componentTypeFor(fmt) {
  // glTF componentType enum.
  if (fmt === 'f32') return 5126; // FLOAT
  if (fmt === 'u32') return 5125; // UNSIGNED_INT
  if (fmt === 'u16') return 5123; // UNSIGNED_SHORT
  if (fmt === 'u8') return 5121; // UNSIGNED_BYTE
  throw new Error(`unsupported format: ${fmt}`);
}

function gltfTypeFor(comps) {
  if (comps === 1) return 'SCALAR';
  if (comps === 2) return 'VEC2';
  if (comps === 3) return 'VEC3';
  if (comps === 4) return 'VEC4';
  throw new Error(`invalid components: ${comps}`);
}

function minMaxFromF32VecN(raw, comps) {
  // raw is Buffer of f32 values; compute per-component min/max.
  assert(raw.length % 4 === 0, 'f32 buffer must be 4-byte aligned');
  const n = raw.length / 4;
  assert(n % comps === 0, 'f32 buffer count must be divisible by components');
  const count = n / comps;
  const min = Array(comps).fill(Number.POSITIVE_INFINITY);
  const max = Array(comps).fill(Number.NEGATIVE_INFINITY);
  for (let i = 0; i < count; i += 1) {
    for (let c = 0; c < comps; c += 1) {
      const v = raw.readFloatLE((i * comps + c) * 4);
      if (v < min[c]) min[c] = v;
      if (v > max[c]) max[c] = v;
    }
  }
  return { count, min, max };
}

function indicesCount(raw, fmt) {
  if (fmt === 'u32') return raw.length / 4;
  if (fmt === 'u16') return raw.length / 2;
  if (fmt === 'u8') return raw.length;
  throw new Error(`unsupported indices fmt: ${fmt}`);
}

function main() {
  const args = parseArgs(process.argv);
  const dirArg = args.dir || args.d || '.';
  const baseDir = path.resolve(process.cwd(), String(dirArg));
  const inRel = String(args.in || 'world.mesh.ir.json');
  const outRel = String(args.out || 'world.model.glb');
  const checkRel = String(args['check-out'] || 'world.model.glb.check.json');

  const inPath = path.resolve(baseDir, inRel);
  const outPath = path.resolve(baseDir, outRel);
  const checkPath = path.resolve(baseDir, checkRel);

  assert(fs.existsSync(inPath), `missing input: ${path.relative(process.cwd(), inPath)}`);

  const ir = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  assert(ir && ir.kind === 'world.mesh.ir', `unexpected input kind (want world.mesh.ir): ${ir && ir.kind}`);
  assert(Array.isArray(ir.materials), 'world.mesh.ir.materials must be an array');
  assert(Array.isArray(ir.meshes), 'world.mesh.ir.meshes must be an array');

  const usedFiles = new Set();
  const inSha = sha256File(inPath);

  const materials = [...ir.materials].slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const materialIndex = new Map();
  materials.forEach((m, i) => materialIndex.set(String(m.id), i));

  const meshes = [...ir.meshes].slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const buffers = [];
  const bufferViews = [];
  const accessors = [];
  const gltfMeshes = [];
  const nodes = [];

  // Single BIN buffer that accumulates all attribute/index payloads.
  const binParts = [];
  let binLen = 0;
  function appendBin(raw) {
    const start = align4(binLen);
    const pad = start - binLen;
    if (pad) {
      binParts.push(Buffer.alloc(pad, 0));
      binLen += pad;
    }
    const off = binLen;
    binParts.push(raw);
    binLen += raw.length;
    return { byteOffset: off, byteLength: raw.length };
  }

  // Create glTF meshes + nodes per IR mesh.
  for (const m of meshes) {
    assert(m && m.id && m.name, 'mesh must have id and name');
    assert(m.transform && m.transform.position && m.transform.rotation_euler && m.transform.scale, `mesh ${m.id} missing transform`);
    assert(Array.isArray(m.primitives) && m.primitives.length >= 1, `mesh ${m.id} must have primitives`);

    const prims = [...m.primitives].map((p, i) => ({ p, i }));
    prims.sort((a, b) => {
      const am = String((a.p && a.p.material_id) || '');
      const bm = String((b.p && b.p.material_id) || '');
      const c = am.localeCompare(bm);
      return c !== 0 ? c : a.i - b.i;
    });

    const gltfPrims = [];
    for (const { p } of prims) {
      assert(p && typeof p === 'object', `invalid primitive in mesh ${m.id}`);
      const matId = String(p.material_id || '');
      assert(matId, `primitive missing material_id in mesh ${m.id}`);
      assert(materialIndex.has(matId), `unknown material_id ${matId} in mesh ${m.id}`);

      assert(p.attributes && p.attributes.POSITION, `primitive missing POSITION in mesh ${m.id}`);
      const pos = readAttr(baseDir, p.attributes.POSITION, usedFiles);
      assert(pos.fmt === 'f32' && pos.comps === 3, `POSITION must be f32 vec3 (mesh ${m.id})`);
      const { count: vertCount, min: posMin, max: posMax } = minMaxFromF32VecN(pos.raw, 3);

      const posSeg = appendBin(pos.raw);
      const posView = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: posSeg.byteOffset,
        byteLength: posSeg.byteLength,
        target: 34962
      });
      const posAcc = accessors.length;
      accessors.push({
        bufferView: posView,
        byteOffset: 0,
        componentType: 5126,
        count: vertCount,
        type: 'VEC3',
        min: posMin,
        max: posMax
      });

      let idxAcc = null;
      if (p.indices) {
        const idx = readIndices(baseDir, p.indices, usedFiles);
        const idxCount = indicesCount(idx.raw, idx.fmt);

        const idxSeg = appendBin(idx.raw);
        const idxView = bufferViews.length;
        bufferViews.push({
          buffer: 0,
          byteOffset: idxSeg.byteOffset,
          byteLength: idxSeg.byteLength,
          target: 34963
        });

        const ct = componentTypeFor(idx.fmt);
        const min = [0];
        // Cheap max computation without decoding entire buffer (still deterministic).
        let maxV = 0;
        if (idx.fmt === 'u32') maxV = idx.raw.readUInt32LE((idxCount - 1) * 4);
        else if (idx.fmt === 'u16') maxV = idx.raw.readUInt16LE((idxCount - 1) * 2);
        else if (idx.fmt === 'u8') maxV = idx.raw.readUInt8(idxCount - 1);
        // The above assumes sorted indices; if not, max might be wrong. To keep correctness, scan deterministically.
        // Scan only if it looks suspicious (max < vertCount - 1); otherwise keep fast path.
        if (maxV < vertCount - 1) {
          maxV = 0;
          if (idx.fmt === 'u32') {
            for (let off = 0; off < idx.raw.length; off += 4) maxV = Math.max(maxV, idx.raw.readUInt32LE(off));
          } else if (idx.fmt === 'u16') {
            for (let off = 0; off < idx.raw.length; off += 2) maxV = Math.max(maxV, idx.raw.readUInt16LE(off));
          } else {
            for (let off = 0; off < idx.raw.length; off += 1) maxV = Math.max(maxV, idx.raw.readUInt8(off));
          }
        }

        idxAcc = accessors.length;
        accessors.push({
          bufferView: idxView,
          byteOffset: 0,
          componentType: ct,
          count: idxCount,
          type: 'SCALAR',
          min,
          max: [maxV]
        });
      }

      const glPrim = {
        attributes: { POSITION: posAcc },
        material: materialIndex.get(matId)
      };
      if (idxAcc !== null) glPrim.indices = idxAcc;
      gltfPrims.push(glPrim);
    }

    const meshIndex = gltfMeshes.length;
    gltfMeshes.push({
      name: String(m.name),
      primitives: gltfPrims
    });

    const tr = m.transform;
    const tpos = tr.position || { x: 0, y: 0, z: 0 };
    const trot = tr.rotation_euler || { x: 0, y: 0, z: 0 };
    const tscl = tr.scale || { x: 1, y: 1, z: 1 };

    nodes.push({
      name: String(m.name),
      mesh: meshIndex,
      translation: [Number(tpos.x) || 0, Number(tpos.y) || 0, Number(tpos.z) || 0],
      rotation: eulerXYZToQuat(Number(trot.x) || 0, Number(trot.y) || 0, Number(trot.z) || 0),
      scale: [Number(tscl.x) || 1, Number(tscl.y) || 1, Number(tscl.z) || 1]
    });
  }

  const bin = Buffer.concat(binParts);
  buffers.push({ byteLength: bin.length });

  const gltf = {
    asset: { version: '2.0', generator: 'light-garden/audit render-world-glb.js v1' },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    buffers,
    bufferViews,
    accessors,
    materials: materials.map((m) => {
      const c = (m.pbr && m.pbr.base_color) || [1, 1, 1, 1];
      const metallic = m.pbr && typeof m.pbr.metallic === 'number' ? m.pbr.metallic : 0;
      const roughness = m.pbr && typeof m.pbr.roughness === 'number' ? m.pbr.roughness : 1;
      return {
        name: String(m.name || m.id),
        pbrMetallicRoughness: {
          baseColorFactor: [Number(c[0]) || 1, Number(c[1]) || 1, Number(c[2]) || 1, Number(c[3]) || 1],
          metallicFactor: Number(metallic) || 0,
          roughnessFactor: Number(roughness) || 1
        }
      };
    }),
    meshes: gltfMeshes
  };

  // Serialize glTF JSON deterministically.
  const jsonStr = stableStringify(gltf);
  const jsonBuf = padTo4(Buffer.from(jsonStr, 'utf8'), 0x20);
  const binBuf = padTo4(bin, 0x00);

  // GLB header + chunks
  const magic = Buffer.from([0x67, 0x6c, 0x54, 0x46]); // 'glTF'
  const version = u32le(2);
  const jsonChunkType = Buffer.from([0x4a, 0x53, 0x4f, 0x4e]); // 'JSON'
  const binChunkType = Buffer.from([0x42, 0x49, 0x4e, 0x00]); // 'BIN\0'

  const jsonChunkHeader = Buffer.concat([u32le(jsonBuf.length), jsonChunkType]);
  const binChunkHeader = Buffer.concat([u32le(binBuf.length), binChunkType]);

  const totalLen = 12 + jsonChunkHeader.length + jsonBuf.length + binChunkHeader.length + binBuf.length;
  const length = u32le(totalLen);

  const glb = Buffer.concat([magic, version, length, jsonChunkHeader, jsonBuf, binChunkHeader, binBuf]);

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, glb);

  const outSha = sha256File(outPath);

  // Receipt inputs include mesh IR + any referenced buffers actually read.
  const used = [...usedFiles].sort();
  const inputRefs = {
    world_mesh_ir: { path: path.relative(baseDir, inPath), sha256: inSha }
  };
  for (const abs of used) {
    const rel = path.relative(baseDir, abs);
    inputRefs[`buffer:${rel}`] = { path: rel, sha256: sha256File(abs) };
  }

  // run_id is derived from input digests + output path + exporter version (deterministic).
  const runId = sha256Prefixed(
    Buffer.from(
      stableStringify({
        exporter: 'render-world-glb.js@v1',
        in: inputRefs,
        out: { path: path.relative(baseDir, outPath) }
      }),
      'utf8'
    )
  );

  const check = {
    schema_version: 1,
    kind: 'world.model.glb.check',
    lane_id: 'model',
    pass: true,
    run_id: runId,
    generated_at: new Date().toISOString(),
    inputs: inputRefs,
    outputs: {
      'world.model.glb': { path: path.relative(baseDir, outPath), sha256: outSha }
    }
  };

  writeJson(checkPath, check);
  process.stdout.write(
    `ok world.model.glb wrote=${path.relative(process.cwd(), outPath)} check=${path.relative(process.cwd(), checkPath)}\n`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    process.stderr.write(`render-world-glb failed: ${err.message}\n`);
    process.exit(1);
  }
}

