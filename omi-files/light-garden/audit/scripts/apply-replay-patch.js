#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readNdjson, ensureDir } = require('./lib');

const auditRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function sha256Bytes(data) {
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function fileMeta(filePath) {
  const st = fs.statSync(filePath);
  return {
    device: st.dev,
    inode: st.ino,
    size: st.size,
    mtime_ms: st.mtimeMs
  };
}

function sameFileIdentity(a, b) {
  if (!a || !b) return false;
  return a.device === b.device && a.inode === b.inode;
}

function normalizeCanon(events) {
  return events.map((e, i) => {
    const copy = JSON.parse(JSON.stringify(e));
    copy._canon_seq = i + 1;
    copy.seq = i + 1;
    return copy;
  });
}

function parsePatchFile(patchPath) {
  if (!fs.existsSync(patchPath)) return [];
  const raw = fs.readFileSync(patchPath, 'utf8').trim();
  if (!raw) return [];
  return readNdjson(patchPath);
}

function validatePatchRecord(rec, index) {
  if (!rec || rec.event !== 'replay.patch') {
    throw new Error(`Patch line ${index + 1}: event must be 'replay.patch'`);
  }
  if (!['replace', 'insert_after', 'delete'].includes(rec.op)) {
    throw new Error(`Patch line ${index + 1}: invalid op '${rec.op}'`);
  }
  const target = Number(rec.target_seq || 0);
  if (!Number.isInteger(target) || target <= 0) {
    throw new Error(`Patch line ${index + 1}: target_seq must be a positive integer`);
  }
  if ((rec.op === 'replace' || rec.op === 'insert_after') && (typeof rec.value !== 'object' || rec.value === null)) {
    throw new Error(`Patch line ${index + 1}: op '${rec.op}' requires object value`);
  }
}

function applyPatch(canon, patches) {
  const out = canon.map((e) => JSON.parse(JSON.stringify(e)));
  let applied = 0;

  for (let i = 0; i < patches.length; i++) {
    const p = patches[i];
    validatePatchRecord(p, i);
    const target = Number(p.target_seq);
    const idx = out.findIndex((e) => Number(e._canon_seq || 0) === target);
    if (idx < 0) {
      throw new Error(`Patch line ${i + 1}: target_seq ${target} not found in canonical events`);
    }

    if (p.op === 'replace') {
      const next = JSON.parse(JSON.stringify(p.value));
      next._canon_seq = target;
      out[idx] = next;
      applied++;
      continue;
    }

    if (p.op === 'insert_after') {
      const insert = JSON.parse(JSON.stringify(p.value));
      insert._canon_seq = null;
      out.splice(idx + 1, 0, insert);
      applied++;
      continue;
    }

    if (p.op === 'delete') {
      out.splice(idx, 1);
      applied++;
    }
  }

  const patched = out.map((e, i) => {
    const copy = JSON.parse(JSON.stringify(e));
    copy.seq = i + 1;
    return copy;
  });

  return { patched, applied };
}

function main() {
  const args = parseArgs(process.argv);
  const canonPath = path.resolve(auditRoot, args.canon || 'results/bench/replay/latest/build-replay.ndjson');
  const patchPath = path.resolve(auditRoot, args.patch || 'results/bench/replay/latest/build-replay.patch.ndjson');
  const outPath = path.resolve(auditRoot, args.out || 'results/bench/replay/latest/build-replay.patched.ndjson');
  const requireEmpty = String(args['require-empty'] || '').toLowerCase() === 'true' || String(args['require-empty'] || '') === '1';

  if (!fs.existsSync(canonPath)) {
    console.error(`missing canon: ${canonPath}`);
    process.exit(1);
  }

  const canonMetaBefore = fileMeta(canonPath);
  const canon = normalizeCanon(readNdjson(canonPath));
  const canonMetaAfter = fileMeta(canonPath);
  if (!sameFileIdentity(canonMetaBefore, canonMetaAfter)) {
    console.error(
      `TOCTOU detected for canon: dev/ino changed during run\nbefore=${JSON.stringify(canonMetaBefore)}\nafter=${JSON.stringify(canonMetaAfter)}`
    );
    process.exit(2);
  }

  const patchExistsBefore = fs.existsSync(patchPath);
  const patchMetaBefore = patchExistsBefore ? fileMeta(patchPath) : null;
  const patches = parsePatchFile(patchPath);
  const patchExistsAfter = fs.existsSync(patchPath);
  const patchMetaAfter = patchExistsAfter ? fileMeta(patchPath) : null;
  if (patchExistsBefore && patchExistsAfter && !sameFileIdentity(patchMetaBefore, patchMetaAfter)) {
    console.error(
      `TOCTOU detected for patch: dev/ino changed during run\nbefore=${JSON.stringify(patchMetaBefore)}\nafter=${JSON.stringify(patchMetaAfter)}`
    );
    process.exit(2);
  }

  if (requireEmpty && patches.length > 0) {
    console.error(`patch file must be empty in require-empty mode: ${path.relative(auditRoot, patchPath)}`);
    process.exit(2);
  }
  const { patched, applied } = applyPatch(canon, patches);

  const outBody = patched.map((e) => JSON.stringify(e)).join('\n') + (patched.length ? '\n' : '');
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, outBody, 'utf8');

  const summary = {
    canon_path_abs: canonPath,
    patch_path_abs: patchPath,
    patched_path_abs: outPath,
    canon_path: path.relative(auditRoot, canonPath),
    patch_path: path.relative(auditRoot, patchPath),
    patched_path: path.relative(auditRoot, outPath),
    canon_sha256: sha256File(canonPath),
    patch_sha256: fs.existsSync(patchPath) ? sha256File(patchPath) : 'sha256:missing',
    patched_sha256: sha256Bytes(Buffer.from(outBody, 'utf8')),
    canon_meta_before: canonMetaBefore,
    canon_meta_after: canonMetaAfter,
    patch_meta_before: patchMetaBefore,
    patch_meta_after: patchMetaAfter,
    canon_meta: fileMeta(canonPath),
    patch_meta: fs.existsSync(patchPath) ? fileMeta(patchPath) : null,
    patched_meta: fileMeta(outPath),
    canon_events: canon.length,
    patch_events: patches.length,
    patched_events: patched.length,
    patch_ops_applied: applied
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
