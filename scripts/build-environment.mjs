#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tagTreeCanvasL } from './tag-tree.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'space/environment.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const fail = (message) => { throw new Error(`environment manifest: ${message}`); };
const exact = (value, keys, name) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${name} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.join('\0') !== expected.join('\0')) fail(`${name} keys must be ${expected.join(', ')}`);
};
const string = (value, name) => { if (typeof value !== 'string' || value.length === 0) fail(`${name} must be a non-empty string`); };

exact(manifest, ['schema', 'id', 'title', 'runtime', 'projections'], 'root');
string(manifest.schema, 'schema');
string(manifest.id, 'id');
string(manifest.title, 'title');
if (manifest.schema !== 'boxedpine.metaverse.environment.v0') fail(`unsupported schema ${manifest.schema}`);
exact(manifest.runtime, ['kind', 'rootEnv', 'clientUrl', 'serverUrl', 'world', 'space', 'tile'], 'runtime');
for (const key of ['kind', 'rootEnv', 'clientUrl', 'serverUrl', 'world', 'space', 'tile']) string(manifest.runtime[key], `runtime.${key}`);
if (manifest.runtime.kind !== 'metaverse-kit') fail(`unsupported runtime ${manifest.runtime.kind}`);
if (!Array.isArray(manifest.projections) || manifest.projections.length === 0 || manifest.projections.some((x) => typeof x !== 'string' || !x)) fail('projections must be a non-empty string array');

const mode = process.argv[2] ?? 'check';
if (!['check', 'build', 'run'].includes(mode)) fail(`unknown command ${mode}`);
console.log(`environment: ${manifest.title} (${manifest.id})`);
console.log(`runtime: ${manifest.runtime.kind} · ${manifest.runtime.space}/${manifest.runtime.tile}`);
console.log(`projections: ${manifest.projections.join(', ')}`);

// The tagging mnemonics, propagated by every build (the author: "add tags to all the omi-files folders
// and files, and to the build script in the metaverse build, to forever propagate the tagging
// mnemonics"): scripts/tag-tree.mjs derives each path's tags and address; check reports whether the
// index is current, build writes it again.
const tagIndex = resolve(root, 'public/tags/omi-files.canvasl');
const tags = existsSync(resolve(root, 'omi-files')) ? tagTreeCanvasL(resolve(root, 'omi-files')) : null;
const relative = (text) => text.replaceAll(`${resolve(root, 'omi-files')}`, 'omi-files');
if (tags) {
  const current = existsSync(tagIndex) && (await readFile(tagIndex, 'utf8')) === relative(tags.text);
  console.log(`tags: ${tags.nodes} paths under omi-files, ${tags.universal.length} universal; index ${current ? 'current' : mode === 'build' ? 'rewritten' : 'stale (npm run environment:build rewrites it)'}`);
  if (mode === 'build' && !current) { await mkdir(dirname(tagIndex), { recursive: true }); await writeFile(tagIndex, relative(tags.text)); }
}
if (mode === 'check') process.exit(0);

if (mode === 'build') {
  const dist = resolve(root, 'dist/space');
  await mkdir(dist, { recursive: true });
  await cp(resolve(root, 'space/environment.json'), resolve(dist, 'environment.json'));
  console.log(`emitted ${resolve(dist, 'environment.json')}`);
  console.log('build: manifest emitted; browser projection build follows');
  process.exit(0);
}

const kitRoot = resolve(process.env.METAVERSE_KIT_ROOT ?? '/home/main/omi/metaverse-kit');
if (!existsSync(resolve(kitRoot, 'package.json'))) fail(`metaverse-kit not found at ${kitRoot}; set METAVERSE_KIT_ROOT`);
const children = [
  spawn('npm', ['run', 'dev:server'], { cwd: kitRoot, stdio: 'inherit' }),
  spawn('npm', ['run', 'dev:client'], { cwd: kitRoot, stdio: 'inherit' }),
];
const stop = () => children.forEach((child) => child.kill('SIGTERM'));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
console.log(`environment: running metaverse-kit from ${kitRoot}`);
await Promise.race(children.map((child) => new Promise((resolveExit) => child.on('exit', resolveExit))));
stop();
