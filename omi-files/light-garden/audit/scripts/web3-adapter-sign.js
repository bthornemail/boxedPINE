#!/usr/bin/env node
/**
 * web3-adapter-sign.js
 *
 * Sign deterministic evidence artifacts (digests) using an EVM secp256k1 key derived
 * from the Metatron HD seed (ethers HDNodeWallet).
 *
 * Outputs `signatures.json` into the replay directory.
 *
 * This is not "on-chain". It's just ECDSA attestations over the artifacts you already
 * produce deterministically.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');

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

function sha256Bytes(buf) {
  return `sha256:${crypto.createHash('sha256').update(buf).digest('hex')}`;
}

function sha256File(p) {
  return sha256Bytes(fs.readFileSync(p));
}

function scryptKey(passphrase, salt) {
  return crypto.scryptSync(Buffer.from(String(passphrase), 'utf8'), salt, 32, {
    N: 1 << 14,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
}

function decryptSeed(enc, passphrase) {
  if (!enc || enc.schema_version !== 1 || enc.aead !== 'aes-256-gcm') throw new Error('invalid_encrypted_seed');
  const salt = Buffer.from(enc.salt_b64, 'base64');
  const iv = Buffer.from(enc.iv_b64, 'base64');
  const ct = Buffer.from(enc.ct_b64, 'base64');
  const tag = Buffer.from(enc.tag_b64, 'base64');
  const key = scryptKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  const obj = JSON.parse(pt.toString('utf8'));
  if (!obj || typeof obj.phrase !== 'string') throw new Error('invalid_seed_payload');
  return obj.phrase;
}

function clampU32(n) {
  return Number(n) >>> 0;
}

function indexFromLabel(label) {
  const h = crypto.createHash('sha256').update(String(label), 'utf8').digest();
  return clampU32(h.readUInt32BE(0) % 0x80000000);
}

function buildMessage(inputs) {
  // Keep it human-readable + stable.
  return [
    'light-garden attestation v1',
    `build_replay_manifest_sha256=${inputs.build_replay_manifest_sha256}`,
    `build_replay_check_sha256=${inputs.build_replay_check_sha256}`,
    `identities_sha256=${inputs.identities_sha256}`,
    `portal_scene_sha256=${inputs.portal_scene_sha256 || ''}`,
    `bundle_dir=${inputs.bundle_dir}`
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  const auditRoot = path.resolve(__dirname, '..');
  const lgRoot = path.resolve(auditRoot, '..');

 const replayDir = path.resolve(
    auditRoot,
    String(args['replay-dir'] || 'results/bench/replay/universe/latest')
  );
  const outPath = path.resolve(replayDir, String(args.out || 'signatures.json'));
  const signerLabel = String(args.signer || 'enoch'); // persona label in identities.json

  const wkArg = args['well-known-dir'] === true ? '' : String(args['well-known-dir'] || '');
  const wellKnownDir = path.resolve(String(wkArg || process.env.LG_WELL_KNOWN_DIR || ''));
  const keysDir = path.resolve(String(args['keys-dir'] || process.env.LG_KEYS_DIR || '/opt/light-garden/keys-hd'));
  const seedPath = path.resolve(keysDir, String(args['seed-file'] || 'metatron.seed.enc.json'));
  const passphrase = String(args.passphrase || process.env.LG_SEED_PASSPHRASE || '');

  const identitiesPath = path.resolve(
    String(args.identities || (wellKnownDir ? path.join(wellKnownDir, 'identities.json') : path.join(replayDir, '.well-known', 'identities.json')))
  );

  if (!fs.existsSync(replayDir)) throw new Error(`missing_replay_dir:${replayDir}`);
  for (const rel of ['build-replay-manifest.json', 'build-replay-check.json']) {
    const p = path.join(replayDir, rel);
    if (!fs.existsSync(p)) throw new Error(`missing_required:${rel}`);
  }
  if (!fs.existsSync(identitiesPath)) throw new Error(`missing_identities:${identitiesPath}`);
  if (!fs.existsSync(seedPath)) throw new Error(`missing_seed:${seedPath}`);
  if (!passphrase) throw new Error('missing_passphrase: set LG_SEED_PASSPHRASE');

  const encSeed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const phrase = decryptSeed(encSeed, passphrase);

  const cfgPath = path.resolve(lgRoot, 'identities.config.json');
  if (!fs.existsSync(cfgPath)) throw new Error(`missing_config:${cfgPath}`);
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const addressPathTmpl = (cfg.hdwallet && cfg.hdwallet.address_path) || "m/44'/60'/0'/0/{index}";

  const idx = indexFromLabel(signerLabel);
  const signerPath = addressPathTmpl.replace('{index}', String(idx));
  const signerWallet = ethers.HDNodeWallet.fromPhrase(phrase, undefined, signerPath);

  const portalScenePath = path.join(replayDir, 'portal-scene.json');

  const inputs = {
    bundle_dir: path.relative(lgRoot, replayDir),
    build_replay_manifest_sha256: sha256File(path.join(replayDir, 'build-replay-manifest.json')),
    build_replay_check_sha256: sha256File(path.join(replayDir, 'build-replay-check.json')),
    identities_sha256: sha256File(identitiesPath)
  };
  if (fs.existsSync(portalScenePath)) {
    inputs.portal_scene_sha256 = sha256File(portalScenePath);
  }
  const message = buildMessage(inputs);
  const sig = await signerWallet.signMessage(message);

  const out = {
    schema_version: 1,
    kind: 'universe-signatures',
    generated_at: new Date().toISOString(),
    inputs,
    message,
    message_sha256: sha256Bytes(Buffer.from(message, 'utf8')),
    signatures: {
      [signerLabel]: {
        address: signerWallet.address,
        derivation: { label: signerLabel, index: idx, path: signerPath },
        sig,
        scheme: 'eip191_personal_sign'
      }
    }
  };

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  process.stdout.write(JSON.stringify({ ok: true, out: outPath, signer: signerLabel, address: signerWallet.address }) + '\n');
}

main().catch((err) => {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
});
