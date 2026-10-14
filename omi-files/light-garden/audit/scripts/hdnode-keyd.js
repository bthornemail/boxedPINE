#!/usr/bin/env node
/**
 * hdnode-keyd.js
 *
 * HDNodeWallet-based key material generator and identities publisher.
 *
 * - Uses ethers HDNodeWallet (BIP39/BIP32) for adoption.
 * - Stores seed encrypted-at-rest using AES-256-GCM (passphrase-derived via scrypt).
 * - Publishes ONLY public outputs into /opt/light-garden/well-known/identities.json.
 *
 * This is intentionally not a network daemon. Run via systemd timers or manually.
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

function sha256Text(s) {
  return `sha256:${crypto.createHash('sha256').update(String(s), 'utf8').digest('hex')}`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function mustReadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function clampU32(n) {
  const x = Number(n) >>> 0;
  return x;
}

function indexFromLabel(label) {
  const h = crypto.createHash('sha256').update(String(label), 'utf8').digest();
  // BIP32 child index must be < 2^31 (0x80000000). Reserve hardened space.
  return clampU32(h.readUInt32BE(0) % 0x80000000);
}

function scryptKey(passphrase, salt) {
  // Keep within OpenSSL memory limits on small servers while staying non-trivial.
  // Cost tuning is not a security boundary here; file perms + operational controls still apply.
  return crypto.scryptSync(Buffer.from(String(passphrase), 'utf8'), salt, 32, {
    N: 1 << 14,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
}

function encryptJson(obj, passphrase) {
  const salt = crypto.randomBytes(16);
  const key = scryptKey(passphrase, salt);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const pt = Buffer.from(JSON.stringify(obj), 'utf8');
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    schema_version: 1,
    kdf: 'scrypt',
    aead: 'aes-256-gcm',
    salt_b64: salt.toString('base64'),
    iv_b64: iv.toString('base64'),
    ct_b64: ct.toString('base64'),
    tag_b64: tag.toString('base64')
  };
}

function decryptJson(enc, passphrase) {
  if (!enc || enc.schema_version !== 1 || enc.aead !== 'aes-256-gcm') throw new Error('invalid_encrypted_payload');
  const salt = Buffer.from(enc.salt_b64, 'base64');
  const iv = Buffer.from(enc.iv_b64, 'base64');
  const ct = Buffer.from(enc.ct_b64, 'base64');
  const tag = Buffer.from(enc.tag_b64, 'base64');
  const key = scryptKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return JSON.parse(pt.toString('utf8'));
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = String(args.cmd || args._ || args[0] || args.command || 'identities');

  const repoRoot = path.resolve(__dirname, '..', '..');
  // Default config lives at repo root.
  const configPath = path.resolve(repoRoot, String(args.config || 'identities.config.json'));

  const keysDir = path.resolve(String(args['keys-dir'] || process.env.LG_KEYS_DIR || '/opt/light-garden/keys-hd'));
  const wellKnownDir = path.resolve(String(args['well-known-dir'] || process.env.LG_WELL_KNOWN_DIR || '/opt/light-garden/well-known'));

  const seedFile = String(args['seed-file'] || 'metatron.seed.enc.json');
  const seedPath = path.join(keysDir, seedFile);
  const passphrase = String(args.passphrase || process.env.LG_SEED_PASSPHRASE || '');
  const unsafePlaintext = String(args['unsafe-plaintext'] || '').toLowerCase() === 'true';

  ensureDir(keysDir);
  ensureDir(wellKnownDir);

  if (!fs.existsSync(configPath)) {
    throw new Error(`missing_config:${configPath}`);
  }
  const cfg = mustReadJson(configPath);

  function loadOrCreateMnemonic() {
    if (fs.existsSync(seedPath)) {
      const raw = mustReadJson(seedPath);
      if (raw && raw.kind === 'plaintext-mnemonic') return raw.phrase;
      if (!passphrase) throw new Error('missing_passphrase: set LG_SEED_PASSPHRASE to decrypt seed');
      const dec = decryptJson(raw, passphrase);
      if (!dec || typeof dec.phrase !== 'string') throw new Error('invalid_seed_payload');
      return dec.phrase;
    }

    const created = ethers.Wallet.createRandom();
    const phrase = created && created.mnemonic && created.mnemonic.phrase ? created.mnemonic.phrase : null;
    if (!phrase) throw new Error('mnemonic_generation_failed');

    if (unsafePlaintext) {
      fs.writeFileSync(seedPath, JSON.stringify({ kind: 'plaintext-mnemonic', phrase }, null, 2) + '\n', { mode: 0o600 });
      return phrase;
    }

    if (!passphrase) {
      throw new Error('missing_passphrase: refusing to write seed without LG_SEED_PASSPHRASE (or --unsafe-plaintext true)');
    }
    const enc = encryptJson({ phrase }, passphrase);
    fs.writeFileSync(seedPath, JSON.stringify(enc, null, 2) + '\n', { mode: 0o600 });
    return phrase;
  }

  if (cmd === 'init') {
    const phrase = loadOrCreateMnemonic();
    process.stdout.write(JSON.stringify({ ok: true, seed_path: seedPath, phrase_sha256: sha256Text(phrase) }) + '\n');
    return;
  }

  // Load mnemonic (creating if needed)
  const phrase = loadOrCreateMnemonic();

  const xpubPath = (cfg.hdwallet && cfg.hdwallet.xpub_path) || "m/44'/60'/0'";
  const addressPathTmpl = (cfg.hdwallet && cfg.hdwallet.address_path) || "m/44'/60'/0'/0/{index}";

  // Root for xpub publication
  const root = ethers.HDNodeWallet.fromPhrase(phrase, undefined, xpubPath);
  const xpub = root.neuter().extendedKey;

  function deriveAddressFor(label) {
    const idx = indexFromLabel(label);
    const p = addressPathTmpl.replace('{index}', String(idx));
    const w = ethers.HDNodeWallet.fromPhrase(phrase, undefined, p);
    return { index: idx, path: p, address: w.address, public_key: w.publicKey };
  }

  if (cmd === 'identities') {
    const personas = cfg.personas || {};
    const out = {
      schema_version: 1,
      canonical_host: cfg.canonical_host || null,
      generated_at: new Date().toISOString(),
      hdwallet: {
        impl: 'ethers.HDNodeWallet',
        coin_type: (cfg.hdwallet && cfg.hdwallet.coin_type) || 60,
        account: (cfg.hdwallet && cfg.hdwallet.account) || 0,
        xpub_path: xpubPath,
        address_path: addressPathTmpl,
        index_mode: (cfg.hdwallet && cfg.hdwallet.index_mode) || 'sha256(label)->u32'
      },
      metatron: {
        role: (personas.metatron && personas.metatron.role) || 'EXTENDED_KEY_PROVIDER',
        domain: (personas.metatron && personas.metatron.domain) || null,
        xpub,
        xpub_sha256: sha256Text(xpub)
      },
      personas: Object.fromEntries(
        Object.entries(personas).map(([name, meta]) => {
          const pub = deriveAddressFor(name);
          return [
            name,
            {
              domain: meta.domain || null,
              role: meta.role || null,
              address: pub.address,
              public_key: pub.public_key,
              derivation: { index: pub.index, path: pub.path }
            }
          ];
        })
      )
    };

    const outPath = path.join(wellKnownDir, 'identities.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', { mode: 0o644 });
    process.stdout.write(JSON.stringify({ ok: true, out: outPath }) + '\n');
    return;
  }

  if (cmd === 'derive') {
    const label = String(args.label || '');
    if (!label) throw new Error('missing --label');
    const idx = indexFromLabel(label);
    const p = addressPathTmpl.replace('{index}', String(idx));
    const w = ethers.HDNodeWallet.fromPhrase(phrase, undefined, p);
    process.stdout.write(
      JSON.stringify({ ok: true, label, path: p, index: idx, address: w.address, public_key: w.publicKey }) + '\n'
    );
    return;
  }

  throw new Error(`unknown_cmd:${cmd}`);
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
}
