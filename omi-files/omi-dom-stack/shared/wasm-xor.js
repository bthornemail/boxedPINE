/**
 * Minimal hand-built WASM module for XOR fold / in-place XOR
 * Used by worklets (AudioWorklet pattern) and transmute coordinator.
 *
 * Exports:
 *   memory: WebAssembly.Memory
 *   xor_fold(ptr:i32, len:i32) -> i32
 *   xor_key(ptr:i32, len:i32, key:i32) -> void
 */
'use strict';

/**
 * WAT equivalent:
 *
 * (module
 *   (memory (export "memory") 1)
 *   (func (export "xor_fold") (param $ptr i32) (param $len i32) (result i32)
 *     (local $i i32) (local $acc i32)
 *     (loop $L
 *       (if (i32.lt_u (local.get $i) (local.get $len))
 *         (then
 *           (local.set $acc (i32.xor (local.get $acc)
 *             (i32.load8_u (i32.add (local.get $ptr) (local.get $i)))))
 *           (local.set $i (i32.add (local.get $i) (i32.const 1)))
 *           (br $L))))
 *     (local.get $acc))
 *   (func (export "xor_key") (param $ptr i32) (param $len i32) (param $key i32)
 *     (local $i i32)
 *     (loop $L
 *       (if (i32.lt_u (local.get $i) (local.get $len))
 *         (then
 *           (i32.store8 (i32.add (local.get $ptr) (local.get $i))
 *             (i32.xor (i32.load8_u (i32.add (local.get $ptr) (local.get $i)))
 *                      (local.get $key)))
 *           (local.set $i (i32.add (local.get $i) (i32.const 1)))
 *           (br $L)))))
 * )
 *
 * Binary assembled below (no wat2wasm required).
 */

// Minimal valid WASM binary (custom-built for xor_fold + xor_key + memory)
// Verified structure: magic + version + type + function + memory + export + code
function buildWasmBytes() {
  // Use a well-tested minimal approach: encode via known good bytes
  // Generated offline-equivalent for the WAT above.
  const hex = [
    // magic + version
    '00', '61', '73', '6d', '01', '00', '00', '00',
    // type section: 2 func types
    // (i32,i32)->i32 and (i32,i32,i32)->void
    '01', '0b', '02',
    '60', '02', '7f', '7f', '01', '7f',
    '60', '03', '7f', '7f', '7f', '00',
    // function section: 2 funcs
    '03', '03', '02', '00', '01',
    // memory section: 1 page
    '05', '03', '01', '00', '01',
    // export section: memory, xor_fold, xor_key
    '07', '22', '03',
    '06', '6d', '65', '6d', '6f', '72', '79', '02', '00',
    '08', '78', '6f', '72', '_'.charCodeAt(0).toString(16), '66', '6f', '6c', '64', '00', '00',
    '07', '78', '6f', '72', '_'.charCodeAt(0).toString(16), '6b', '65', '79', '00', '01',
    // code section — filled programmatically below for reliability
  ];
  // Building code section carefully in JS is error-prone; use WebAssembly.Module from
  // a verified minimal buffer constructed with the assembler below.
  return assembleModule();
}

function assembleModule() {
  const parts = [];
  const u8 = (...a) => parts.push(...a);
  const leb = (n) => {
    const out = [];
    let v = n >>> 0;
    while (true) {
      let b = v & 0x7f;
      v >>>= 7;
      if (v) out.push(b | 0x80);
      else { out.push(b); break; }
    }
    return out;
  };
  const section = (id, body) => {
    u8(id, ...leb(body.length), ...body);
  };
  const vec = (items) => [...leb(items.length), ...items.flat()];

  // magic + version
  u8(0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);

  // Type section
  section(1, vec([
    [0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f], // (i32,i32)->i32
    [0x60, 0x03, 0x7f, 0x7f, 0x7f, 0x00]  // (i32,i32,i32)->void
  ].map((t) => t)));

  // Function section
  section(3, vec([[0x00], [0x01]]));

  // Memory section: 1 min page
  section(5, [0x01, 0x00, 0x01]);

  // Export section
  const name = (s) => [...leb(s.length), ...[...s].map((c) => c.charCodeAt(0))];
  const exports = [
    [...name('memory'), 0x02, 0x00],
    [...name('xor_fold'), 0x00, 0x00],
    [...name('xor_key'), 0x00, 0x01]
  ];
  section(7, vec(exports));

  // Code: xor_fold
  // locals: i32 i, i32 acc
  // loop: if i < len: acc ^= mem[ptr+i]; i++; br
  // return acc
  const xorFoldBody = (() => {
    const b = [];
    const P = (...x) => b.push(...x);
    P(0x01, 0x02, 0x7f, 0x7f); // 2 local i32s: $i $acc  — actually local count encoding:
    // locals vector: count of local groups
    // simpler: 1 group of 2 i32
    b.length = 0;
    P(...leb(1), 0x02, 0x7f); // one group: 2 x i32  → local0=$i local1=$acc  (params are 0,1 so locals are 2,3)
    // Actually params are local 0=$ptr, 1=$len; added locals 2=$i, 3=$acc
    // reset locals correctly:
    b.length = 0;
    P(...leb(1), 0x02, 0x7f); // locals 2 and 3

    // loop
    P(0x03, 0x40); // loop void
    // if i < len
    P(0x20, 0x02); // get i
    P(0x20, 0x01); // get len
    P(0x49);       // i32.lt_u
    P(0x04, 0x40); // if
    // acc ^= load8(ptr+i)
    P(0x20, 0x03); // acc
    P(0x20, 0x00); // ptr
    P(0x20, 0x02); // i
    P(0x6a);       // add
    P(0x2d, 0x00, 0x00); // i32.load8_u align0 offset0
    P(0x73);       // xor
    P(0x21, 0x03); // set acc
    // i++
    P(0x20, 0x02);
    P(0x41, 0x01);
    P(0x6a);
    P(0x21, 0x02);
    P(0x0c, 0x01); // br loop (depth 1: if=0 loop=1)
    P(0x0b); // end if
    P(0x0b); // end loop
    P(0x20, 0x03); // get acc
    P(0x0f); // return
    P(0x0b); // end func
    return b;
  })();

  const xorKeyBody = (() => {
    const b = [];
    const P = (...x) => b.push(...x);
    P(...leb(1), 0x01, 0x7f); // 1 local i32 $i → local 3
    P(0x03, 0x40); // loop
    P(0x20, 0x03); // i
    P(0x20, 0x01); // len
    P(0x49); // lt_u
    P(0x04, 0x40); // if
    // store8(ptr+i, load8(ptr+i) ^ key)
    P(0x20, 0x00);
    P(0x20, 0x03);
    P(0x6a); // addr
    P(0x20, 0x00);
    P(0x20, 0x03);
    P(0x6a);
    P(0x2d, 0x00, 0x00); // load8
    P(0x20, 0x02); // key
    P(0x73); // xor
    P(0x3a, 0x00, 0x00); // store8
    P(0x20, 0x03);
    P(0x41, 0x01);
    P(0x6a);
    P(0x21, 0x03);
    P(0x0c, 0x01);
    P(0x0b);
    P(0x0b);
    P(0x0b);
    return b;
  })();

  const code0 = [...leb(xorFoldBody.length), ...xorFoldBody];
  const code1 = [...leb(xorKeyBody.length), ...xorKeyBody];
  section(10, vec([code0, code1]));

  return new Uint8Array(parts);
}

let _instancePromise = null;

async function loadWasmXor() {
  if (_instancePromise) return _instancePromise;
  _instancePromise = (async () => {
    const bytes = assembleModule();
    const { instance } = await WebAssembly.instantiate(bytes, {});
    return instance;
  })();
  return _instancePromise;
}

async function xorFold(data) {
  const inst = await loadWasmXor();
  const mem = new Uint8Array(inst.exports.memory.buffer);
  const src = data instanceof Uint8Array ? data : Uint8Array.from(data);
  if (src.length > mem.length) throw new Error('buffer too large for wasm memory page');
  mem.set(src, 0);
  return inst.exports.xor_fold(0, src.length) >>> 0;
}

async function xorKey(data, key) {
  const inst = await loadWasmXor();
  const mem = new Uint8Array(inst.exports.memory.buffer);
  const src = data instanceof Uint8Array ? data.slice() : Uint8Array.from(data);
  mem.set(src, 0);
  inst.exports.xor_key(0, src.length, key & 0xff);
  return mem.slice(0, src.length);
}

/** Bytes suitable for transfer into AudioWorklet via postMessage(Module) */
async function compileModule() {
  const bytes = assembleModule();
  return WebAssembly.compile(bytes);
}

function selfTest() {
  return (async () => {
    const results = [];
    const assert = (name, cond, detail) => {
      results.push({ name, pass: !!cond, detail: detail || '' });
    };
    try {
      const bytes = assembleModule();
      assert('wasm magic', bytes[0] === 0x00 && bytes[1] === 0x61);
      const { instance } = await WebAssembly.instantiate(bytes, {});
      assert('exports memory', !!instance.exports.memory);
      assert('exports xor_fold', typeof instance.exports.xor_fold === 'function');
      assert('exports xor_key', typeof instance.exports.xor_key === 'function');

      const data = new Uint8Array([1, 2, 4, 8]);
      const fold = await xorFold(data);
      const expected = 1 ^ 2 ^ 4 ^ 8;
      assert('xor_fold', fold === expected, String(fold) + ' vs ' + expected);

      const keyed = await xorKey(data, 0xff);
      assert('xor_key involution', (await xorKey(keyed, 0xff)).every((v, i) => v === data[i]));

      const mod = await compileModule();
      assert('compile Module', mod instanceof WebAssembly.Module);
    } catch (e) {
      assert('exception', false, String(e.message || e));
    }
    const failed = results.filter((r) => !r.pass);
    return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
  })();
}

module.exports = {
  assembleModule,
  loadWasmXor,
  xorFold,
  xorKey,
  compileModule,
  selfTest
};
