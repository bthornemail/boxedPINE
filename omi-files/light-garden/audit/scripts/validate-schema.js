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

function main() {
  const args = parseArgs(process.argv);
  const schemaArg = args.schema || args.s;
  const inArg = args.in || args.file || args.f;

  if (!schemaArg || !inArg) {
    console.error('Usage: node scripts/validate-schema.js --schema schemas/<name>.schema.json --in <file.json>');
    process.exit(2);
  }

  const auditRoot = path.resolve(__dirname, '..');
  const schemaPath = path.resolve(auditRoot, schemaArg);
  const inPath = path.resolve(auditRoot, inArg);

  const schema = readJson(schemaPath);
  const doc = readJson(inPath);

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    $data: true
  });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const ok = validate(doc);
  if (ok) {
    console.log(`OK ${path.relative(auditRoot, inPath)} against ${path.relative(auditRoot, schemaPath)}`);
    return;
  }

  console.error(`INVALID ${path.relative(auditRoot, inPath)} against ${path.relative(auditRoot, schemaPath)}`);
  console.error(fmtErrors(validate.errors));
  process.exit(1);
}

main();
