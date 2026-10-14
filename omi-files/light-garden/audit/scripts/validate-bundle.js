#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

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

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`Failed to read JSON ${p}: ${err.message}`);
  }
}

function fmtErrors(errors) {
  if (!Array.isArray(errors) || !errors.length) return '';
  return errors
    .map((e) => {
      const inst = e.instancePath || '(root)';
      const kw = e.keyword || 'schema';
      const msg = e.message || 'invalid';
      return `${inst}: ${kw}: ${msg}`;
    })
    .join('\n');
}

function listFilesRecursive(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) out.push(p);
    }
  }
  return out;
}

function schemaForFile(name) {
  // bundle.verify.json is an aggregator, not a receipt.verify record.
  if (name === 'bundle.verify.json' || name === 'bundle.check.json') return null;
  if (name.endsWith('.check.json')) return 'schemas/receipt.check.schema.json';
  if (name.endsWith('.verify.json')) return 'schemas/receipt.verify.schema.json';
  if (name.endsWith('world.graph.json')) return 'schemas/world.graph.schema.json';
  if (name.endsWith('world.scene.patch.json')) return 'schemas/world.scene.patch.schema.json';
  if (name.endsWith('world.mesh.ir.json')) return 'schemas/world.mesh.ir.schema.json';
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  const dirArg = args.dir || args.d;
  if (!dirArg) {
    console.error('Usage: node scripts/validate-bundle.js --dir <bundle-dir>');
    process.exit(2);
  }

  const auditRoot = path.resolve(__dirname, '..');
  const bundleDir = path.resolve(process.cwd(), dirArg);

  if (!fs.existsSync(bundleDir) || !fs.statSync(bundleDir).isDirectory()) {
    console.error(`Not a directory: ${bundleDir}`);
    process.exit(2);
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    $data: true
  });
  addFormats(ajv);

  const schemaCache = new Map();
  function getValidator(schemaRel) {
    if (schemaCache.has(schemaRel)) return schemaCache.get(schemaRel);
    const schemaPath = path.resolve(auditRoot, schemaRel);
    const schema = readJson(schemaPath);
    const validate = ajv.compile(schema);
    schemaCache.set(schemaRel, validate);
    return validate;
  }

  const files = listFilesRecursive(bundleDir);
  const candidates = files
    .map((p) => ({ p, schemaRel: schemaForFile(path.basename(p)) }))
    .filter((x) => x.schemaRel);

  if (!candidates.length) {
    console.log(`No known schema targets found under ${bundleDir}`);
    return;
  }

  let okCount = 0;
  let failCount = 0;

  for (const { p, schemaRel } of candidates) {
    const rel = path.relative(process.cwd(), p);
    try {
      const doc = readJson(p);
      const validate = getValidator(schemaRel);
      const ok = validate(doc);
      if (ok) {
        okCount++;
        continue;
      }
      failCount++;
      console.error(`INVALID ${rel} against ${schemaRel}`);
      console.error(fmtErrors(validate.errors));
    } catch (err) {
      failCount++;
      console.error(`ERROR ${rel}: ${err.message}`);
    }
  }

  console.log(`validate:bundle ok=${okCount} fail=${failCount} dir=${bundleDir}`);
  if (failCount) process.exit(1);
}

main();
