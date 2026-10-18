// seed-geometries.mjs — build the universe's geometry seed from the glTF Sample Assets.
// The drop (omi-files/light-garden/GeneratedAssets-0.6.1) is 123M, almost all PNG textures
// and figures. The geometry itself (.gltf + .bin) is tiny. This indexes every loadable
// Positive model into a catalog (the logic/index) and copies one representative geometry per
// category (glTF + its .bin, no PNGs) into public/geometries/ as the committed seed palette.
//   node scripts/seed-geometries.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';

const repo = new URL('..', import.meta.url);
const srcRoot = new URL('omi-files/light-garden/GeneratedAssets-0.6.1/Positive/', repo);
const outAssets = new URL('public/geometries/', repo);
const man = JSON.parse(readFileSync(new URL('Manifest.json', srcRoot), 'utf8'));

const binsOf = (gltfPath) => {
  try { const g = JSON.parse(readFileSync(gltfPath, 'utf8')); return (g.buffers || []).map(b => b.uri).filter(u => u && !u.startsWith('data:')); }
  catch { return []; }
};

const catalog = [];
let seeded = 0;
for (const k of Object.keys(man)) {
  const folder = man[k].folder;
  const models = (man[k].models || []).filter(m => m.loadable);
  models.forEach((m, i) => {
    const entry = { category: folder, file: m.fileName, thumb: m.sampleImageName || null, seeded: false, path: null };
    if (i === 0) { // one representative per category becomes the committed seed
      const gltfSrc = new URL(`${folder}/${m.fileName}`, srcRoot);
      const dir = new URL(`${folder}/`, outAssets);
      mkdirSync(dir, { recursive: true });
      copyFileSync(gltfSrc, new URL(m.fileName, dir));
      for (const bin of binsOf(gltfSrc)) { const bs = new URL(`${folder}/${bin}`, srcRoot); if (existsSync(bs)) copyFileSync(bs, new URL(bin, dir)); }
      entry.seeded = true; entry.path = `/geometries/${folder}/${m.fileName}`;
      seeded++;
    }
    catalog.push(entry);
  });
}

mkdirSync(new URL('public/narrative/', repo), { recursive: true });
writeFileSync(new URL('public/narrative/geometries.json', repo),
  JSON.stringify({ source: 'glTF Sample Assets 0.6.1 (Khronos) · Positive', total: catalog.length, seeded, note: 'geometry only (.gltf+.bin); the full textured set lives in omi-files/light-garden/GeneratedAssets-0.6.1', geometries: catalog }, null, 1) + '\n');
console.log(`seed-geometries: ${catalog.length} loadable indexed, ${seeded} copied to public/geometries/ as the seed palette`);
