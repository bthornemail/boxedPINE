#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  CHANNEL_BASIS,
  FANO_BASIS,
  COLOR_CHANNELS,
  NOTE_CHANNELS,
  MASK_MODES,
  isSha256,
  digestMatches
} = require('./harmonic-lane-lib.js');

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

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function keyset(obj) {
  return Object.keys(obj).sort().join(',');
}

function requireKeys(obj, keys, label) {
  assert(obj && typeof obj === 'object' && !Array.isArray(obj), `${label}:not_object`);
  assert(keyset(obj) === [...keys].sort().join(','), `${label}:keyset_mismatch`);
}

function decStr(v) {
  return typeof v === 'string' && /^-?[0-9]+$/.test(v);
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(String(args.in || args.file || ''));
  if (!inputPath || !fs.existsSync(inputPath)) throw new Error(`missing_input:${inputPath}`);

  const obj = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  assert(obj && typeof obj === 'object', 'artifact:not_object');
  assert(typeof obj.v === 'string', 'artifact:missing_v');

  if (obj.v === 'harmonic_id.v0') {
    requireKeys(
      obj,
      ['v', 'authority', 'run_id', 'source_ndjson_sha256', 'waveform_check_sha256', 'channel_basis', 'fano_basis', 'harmonic_class', 'harmonic_vector', 'harmonic_id', 'digest'],
      'harmonic_id.v0'
    );
    assert(obj.authority === 'advisory', 'harmonic_id.v0:authority');
    assert(isSha256(obj.run_id), 'harmonic_id.v0:run_id');
    assert(isSha256(obj.source_ndjson_sha256), 'harmonic_id.v0:source_ndjson_sha256');
    assert(isSha256(obj.waveform_check_sha256), 'harmonic_id.v0:waveform_check_sha256');
    assert(Array.isArray(obj.channel_basis), 'harmonic_id.v0:channel_basis_type');
    assert(JSON.stringify(obj.channel_basis) === JSON.stringify(CHANNEL_BASIS), 'harmonic_id.v0:channel_basis');
    assert(Array.isArray(obj.fano_basis), 'harmonic_id.v0:fano_basis_type');
    assert(JSON.stringify(obj.fano_basis) === JSON.stringify(FANO_BASIS), 'harmonic_id.v0:fano_basis');
    assert(['sparse', 'balanced', 'dense'].includes(obj.harmonic_class), 'harmonic_id.v0:harmonic_class');
    assert(Array.isArray(obj.harmonic_vector) && obj.harmonic_vector.length === 7, 'harmonic_id.v0:harmonic_vector');
    for (const v of obj.harmonic_vector) {
      assert(typeof v === 'string' && /^-?[0-9]+\.[0-9]{8}$/.test(v), 'harmonic_id.v0:harmonic_vector_item');
    }
    assert(isSha256(obj.harmonic_id), 'harmonic_id.v0:harmonic_id');
  } else if (obj.v === 'dome_frame.v0') {
    requireKeys(obj, ['v', 'authority', 'harmonic_id', 'frame_index', 'led_count', 'leds', 'audio_channels', 'digest'], 'dome_frame.v0');
    assert(obj.authority === 'advisory', 'dome_frame.v0:authority');
    assert(isSha256(obj.harmonic_id), 'dome_frame.v0:harmonic_id');
    assert(decStr(obj.frame_index), 'dome_frame.v0:frame_index');
    assert(decStr(obj.led_count), 'dome_frame.v0:led_count');
    const ledCount = Number(obj.led_count);
    assert(Number.isInteger(ledCount) && ledCount > 0, 'dome_frame.v0:led_count_range');
    assert(Array.isArray(obj.leds) && obj.leds.length > 0, 'dome_frame.v0:leds_type');

    let prev = -1;
    const seen = new Set();
    for (const led of obj.leds) {
      requireKeys(led, ['index', 'path', 'h', 's', 'v', 'fano', 'channel'], 'dome_frame.v0:led');
      assert(decStr(led.index), 'dome_frame.v0:led_index_type');
      const idx = Number(led.index);
      assert(idx >= 0 && idx < ledCount, 'dome_frame.v0:led_index_range');
      assert(idx > prev, 'dome_frame.v0:led_sort_order');
      prev = idx;
      assert(!seen.has(idx), 'dome_frame.v0:led_duplicate');
      seen.add(idx);
      assert(typeof led.path === 'string' && led.path.length > 0, 'dome_frame.v0:path');
      assert(decStr(led.h) && Number(led.h) >= 0 && Number(led.h) <= 360, 'dome_frame.v0:h');
      assert(decStr(led.s) && Number(led.s) >= 0 && Number(led.s) <= 255, 'dome_frame.v0:s');
      assert(decStr(led.v) && Number(led.v) >= 0 && Number(led.v) <= 255, 'dome_frame.v0:v');
      assert(['1', '2', '3', '4', '5', '6', '7', '8'].includes(led.fano), 'dome_frame.v0:fano');
      assert(COLOR_CHANNELS.includes(led.channel), 'dome_frame.v0:channel');
    }

    assert(Array.isArray(obj.audio_channels), 'dome_frame.v0:audio_channels_type');
    const notes = obj.audio_channels.map((c) => c.note);
    assert(JSON.stringify([...notes].sort()) === JSON.stringify(notes), 'dome_frame.v0:audio_channels_sort');
    for (const ch of obj.audio_channels) {
      requireKeys(ch, ['note', 'gain', 'phase'], 'dome_frame.v0:audio_channel');
      assert(NOTE_CHANNELS.includes(ch.note), 'dome_frame.v0:audio_note');
      assert(typeof ch.gain === 'string' && /^-?[0-9]+\.[0-9]{8}$/.test(ch.gain), 'dome_frame.v0:audio_gain');
      assert(decStr(ch.phase), 'dome_frame.v0:audio_phase');
    }
  } else if (obj.v === 'talisman_mask.v0') {
    requireKeys(
      obj,
      ['v', 'authority', 'harmonic_id', 'mask_profile_id', 'mask_mode', 'mask_vector', 'target_channels', 'constraints', 'digest'],
      'talisman_mask.v0'
    );
    assert(obj.authority === 'advisory', 'talisman_mask.v0:authority');
    assert(isSha256(obj.harmonic_id), 'talisman_mask.v0:harmonic_id');
    assert(typeof obj.mask_profile_id === 'string' && obj.mask_profile_id.length > 0, 'talisman_mask.v0:mask_profile_id');
    assert(MASK_MODES.includes(obj.mask_mode), 'talisman_mask.v0:mask_mode');
    assert(Array.isArray(obj.mask_vector) && obj.mask_vector.length === 7, 'talisman_mask.v0:mask_vector');
    for (const n of obj.mask_vector) {
      assert(typeof n === 'string' && /^-?[0-9]+\.[0-9]{8}$/.test(n), 'talisman_mask.v0:mask_vector_item');
    }
    assert(Array.isArray(obj.target_channels), 'talisman_mask.v0:target_channels_type');
    for (const c of obj.target_channels) {
      assert(COLOR_CHANNELS.includes(c), 'talisman_mask.v0:target_channel');
    }
    requireKeys(obj.constraints, ['max_delta', 'preserve_digest_lineage', 'projection_only'], 'talisman_mask.v0:constraints');
  } else if (obj.v === 'harmonic_lane.report.v0') {
    requireKeys(obj, ['v', 'phase', 'fixture_counts', 'accept_pass', 'reject_pass', 'replay_hash', 'status', 'digest'], 'harmonic_lane.report.v0');
    assert(typeof obj.phase === 'string' && obj.phase.length > 0, 'harmonic_lane.report.v0:phase');
    requireKeys(obj.fixture_counts, ['accept', 'reject'], 'harmonic_lane.report.v0:fixture_counts');
    assert(decStr(obj.fixture_counts.accept), 'harmonic_lane.report.v0:fixture_counts.accept');
    assert(decStr(obj.fixture_counts.reject), 'harmonic_lane.report.v0:fixture_counts.reject');
    assert(typeof obj.accept_pass === 'boolean', 'harmonic_lane.report.v0:accept_pass');
    assert(typeof obj.reject_pass === 'boolean', 'harmonic_lane.report.v0:reject_pass');
    assert(isSha256(obj.replay_hash), 'harmonic_lane.report.v0:replay_hash');
    assert(['ok', 'fail'].includes(obj.status), 'harmonic_lane.report.v0:status');
  } else if (obj.v === 'harmonic_receipt.v0') {
    requireKeys(
      obj,
      [
        'v',
        'authority',
        'run_id',
        'harmonic_id_digest',
        'dome_frame_digest',
        'talisman_mask_digest',
        'source_ndjson_sha256',
        'waveform_check_sha256',
        'replay_hash',
        'gate_status',
        'digest'
      ],
      'harmonic_receipt.v0'
    );
    assert(obj.authority === 'advisory', 'harmonic_receipt.v0:authority');
    assert(isSha256(obj.run_id), 'harmonic_receipt.v0:run_id');
    assert(isSha256(obj.harmonic_id_digest), 'harmonic_receipt.v0:harmonic_id_digest');
    assert(obj.dome_frame_digest === null || isSha256(obj.dome_frame_digest), 'harmonic_receipt.v0:dome_frame_digest');
    assert(obj.talisman_mask_digest === null || isSha256(obj.talisman_mask_digest), 'harmonic_receipt.v0:talisman_mask_digest');
    assert(isSha256(obj.source_ndjson_sha256), 'harmonic_receipt.v0:source_ndjson_sha256');
    assert(isSha256(obj.waveform_check_sha256), 'harmonic_receipt.v0:waveform_check_sha256');
    assert(isSha256(obj.replay_hash), 'harmonic_receipt.v0:replay_hash');
    assert(['ok', 'fail'].includes(obj.gate_status), 'harmonic_receipt.v0:gate_status');
  } else {
    throw new Error(`unsupported_artifact:${obj.v}`);
  }

  assert(isSha256(obj.digest), `${obj.v}:digest_format`);
  assert(digestMatches(obj), `${obj.v}:digest_mismatch`);

  process.stdout.write(`OK ${path.basename(inputPath)}\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(1);
}
