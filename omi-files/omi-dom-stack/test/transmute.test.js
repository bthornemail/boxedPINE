'use strict';

const { createTransmutation, proveLossless } = require('../client/transmute-coordinator');

async function main() {
  console.log('=== AUDIO-VIDEO TRANSMUTATION PROOF ===');

  // In-process lossless proof
  const proof = await proveLossless({ size: 65536 });
  console.log('  size', proof.size);
  console.log('  audio match', proof.audioMatch);
  console.log('  video match', proof.videoMatch);
  console.log('  rgb match', proof.rgbMatch);
  console.log('  mask match', proof.maskMatch);
  console.log('  digest match', proof.digestMatch);
  console.log('  lossless', proof.passed);

  // Worker-thread path
  const t = createTransmutation({ inProcess: false });
  await t.init(4096);
  const audio = Uint8Array.from({ length: 64 }, (_, i) => i);
  const video = Uint8Array.from({ length: 64 }, (_, i) => i * 2);
  const rgb = Uint8Array.from({ length: 64 }, (_, i) => i * 3);
  const mask = Uint8Array.from({ length: 64 }, (_, i) => i * 5);
  const c = await t.compose(audio, video, rgb, mask);
  const d = await t.decompose();
  const workerOk = c.digest === d.digest;
  console.log('  worker-thread digest match', workerOk);
  await t.close();

  const ok = proof.passed && workerOk;
  console.log('===', ok ? 'PASS' : 'FAIL', '===');
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
