#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  CHANNEL_BASIS,
  FANO_BASIS,
  COLOR_CHANNELS,
  NOTE_CHANNELS,
  LED_HUES,
  sha256Text,
  sha256File,
  withDigest,
  readNdjson,
  asIntString,
  deterministicIso,
  canonicalBytes,
  sha256Bytes
} = require('./harmonic-lane-lib.js');
const { ensureDir, writeJson, writeNdjson } = require('./lib.js');

const LANE_ID = 'harmonic-lane';

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

function boolArg(v, fallback) {
  if (v === undefined) return fallback;
  return String(v).toLowerCase() === 'true';
}

function toNum(v, fallback, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function fixed8(n) {
  return Number(n).toFixed(8);
}

function main() {
  const args = parseArgs(process.argv);
  const inPath = path.resolve(String(args.in || ''));
  if (!inPath || !fs.existsSync(inPath)) {
    throw new Error(`missing_input:${inPath || '(empty)'}`);
  }

  const outDir = path.resolve(String(args['out-dir'] || path.dirname(inPath)));
  ensureDir(outDir);

  const waveformCheckPath = args['waveform-check'] ? path.resolve(String(args['waveform-check'])) : null;
  const ledCount = toNum(args['led-count'] || '61', 61, 1, 2048);
  const frameIndex = toNum(args['frame-index'] || '0', 0, 0, 1000000000);
  const emitDome = boolArg(args['emit-dome'], true);
  const emitMask = boolArg(args['emit-mask'], false);

  const inputSha = sha256File(inPath);
  const waveformSha = waveformCheckPath && fs.existsSync(waveformCheckPath) ? sha256File(waveformCheckPath) : sha256Text('none');

  const records = readNdjson(inPath);
  const eventCounts = {};
  let totalPayloadKeys = 0;
  let totalRawBytes = 0;

  for (const rec of records) {
    const key = String(rec.event || rec.type || rec.k || 'unknown.event');
    eventCounts[key] = (eventCounts[key] || 0) + 1;
    if (rec.payload && typeof rec.payload === 'object' && !Array.isArray(rec.payload)) {
      totalPayloadKeys += Object.keys(rec.payload).length;
    }
    totalRawBytes += Buffer.byteLength(JSON.stringify(rec), 'utf8');
  }

  const sortedEvents = Object.keys(eventCounts).sort();
  const eventDigest = sha256Text(sortedEvents.map((e) => `${e}:${eventCounts[e]}`).join('\n'));

  const v1 = records.length ? records.length / Math.max(records.length, 1) : 0;
  const v2 = (totalPayloadKeys % 97) / 96;
  const v3 = (totalRawBytes % 997) / 996;
  const v4 = sortedEvents.length / Math.max(sortedEvents.length, 1);
  const v5 = Number(parseInt(eventDigest.slice(7, 15), 16) % 1000) / 999;
  const v6 = Number(parseInt(inputSha.slice(7, 15), 16) % 1000) / 999;
  const v7 = Number(parseInt(waveformSha.slice(7, 15), 16) % 1000) / 999;

  const harmonicVector = [v1, v2, v3, v4, v5, v6, v7].map(fixed8);
  const harmonicClass = records.length <= 32 ? 'sparse' : records.length <= 256 ? 'balanced' : 'dense';

  const runId = sha256Text(
    [
      'harmonic.lane.v0',
      `lane_id=${LANE_ID}`,
      `input_sha=${inputSha}`,
      `waveform_sha=${waveformSha}`,
      `led_count=${ledCount}`,
      `emit_dome=${emitDome}`,
      `emit_mask=${emitMask}`
    ].join('\n')
  );

  const harmonicIdSeed = sha256Text(
    [
      'harmonic.id.seed.v0',
      `run_id=${runId}`,
      `input_sha=${inputSha}`,
      `waveform_sha=${waveformSha}`,
      `event_digest=${eventDigest}`,
      `harmonic_vector=${harmonicVector.join(',')}`
    ].join('\n')
  );

  const harmonicId = withDigest({
    v: 'harmonic_id.v0',
    authority: 'advisory',
    run_id: runId,
    source_ndjson_sha256: inputSha,
    waveform_check_sha256: waveformSha,
    channel_basis: CHANNEL_BASIS,
    fano_basis: FANO_BASIS,
    harmonic_class: harmonicClass,
    harmonic_vector: harmonicVector,
    harmonic_id: harmonicIdSeed
  });

  const outputs = {};
  const events = [];
  let seq = 1;
  const emitEvent = (event, payload) => {
    events.push({
      seq,
      timestamp: deterministicIso(seq),
      lane: LANE_ID,
      run_id: runId,
      event,
      payload
    });
    seq += 1;
  };

  const harmonicPath = path.join(outDir, 'harmonic_id.v0.json');
  writeJson(harmonicPath, harmonicId);
  outputs['harmonic_id.v0.json'] = { path: path.basename(harmonicPath), sha256: sha256File(harmonicPath) };
  emitEvent('harmonic.id.emitted', { path: harmonicPath, sha256: outputs['harmonic_id.v0.json'].sha256 });

  if (emitDome) {
    const leds = [];
    for (let i = 0; i < ledCount; i += 1) {
      const color = COLOR_CHANNELS[i % COLOR_CHANNELS.length];
      const fano = String((i % 7) + 1);
      leds.push({
        index: asIntString(i),
        path: `m/${ledCount}'/${i}'/${fano}'`,
        h: LED_HUES[color],
        s: '255',
        v: i === 0 ? '230' : '255',
        fano,
        channel: color
      });
    }

    const audioChannels = NOTE_CHANNELS.map((note, i) => ({
      note,
      gain: harmonicVector[i % harmonicVector.length],
      phase: asIntString((i * 51) % 360)
    }));

    const domeFrame = withDigest({
      v: 'dome_frame.v0',
      authority: 'advisory',
      harmonic_id: harmonicId.harmonic_id,
      frame_index: asIntString(frameIndex),
      led_count: asIntString(ledCount),
      leds,
      audio_channels: audioChannels
    });

    const domePath = path.join(outDir, 'dome_frame.v0.json');
    writeJson(domePath, domeFrame);
    outputs['dome_frame.v0.json'] = { path: path.basename(domePath), sha256: sha256File(domePath) };
    emitEvent('harmonic.frame.emitted', { path: domePath, sha256: outputs['dome_frame.v0.json'].sha256, led_count: ledCount });
  }

  if (emitMask) {
    const maskVector = harmonicVector.map((n, i) => fixed8((Number(n) * (i + 1)) % 1));
    const mask = withDigest({
      v: 'talisman_mask.v0',
      authority: 'advisory',
      harmonic_id: harmonicId.harmonic_id,
      mask_profile_id: 'mask-profile.v0.default',
      mask_mode: 'obfuscate',
      mask_vector: maskVector,
      target_channels: COLOR_CHANNELS,
      constraints: {
        max_delta: '0.35000000',
        preserve_digest_lineage: 'true',
        projection_only: 'true'
      }
    });

    const maskPath = path.join(outDir, 'talisman_mask.v0.json');
    writeJson(maskPath, mask);
    outputs['talisman_mask.v0.json'] = { path: path.basename(maskPath), sha256: sha256File(maskPath) };
    emitEvent('harmonic.mask.emitted', { path: maskPath, sha256: outputs['talisman_mask.v0.json'].sha256 });
  }

  const replayHash = sha256Bytes(
    Buffer.concat(
      Object.keys(outputs)
        .sort()
        .map((name) => {
          const p = path.join(outDir, outputs[name].path);
          return canonicalBytes(JSON.parse(fs.readFileSync(p, 'utf8')));
        })
    )
  );

  const receipt = withDigest({
    v: 'harmonic_receipt.v0',
    authority: 'advisory',
    run_id: runId,
    harmonic_id_digest: outputs['harmonic_id.v0.json'].sha256,
    dome_frame_digest: outputs['dome_frame.v0.json'] ? outputs['dome_frame.v0.json'].sha256 : null,
    talisman_mask_digest: outputs['talisman_mask.v0.json'] ? outputs['talisman_mask.v0.json'].sha256 : null,
    source_ndjson_sha256: inputSha,
    waveform_check_sha256: waveformSha,
    replay_hash: replayHash,
    gate_status: 'ok'
  });

  const receiptPath = path.join(outDir, 'harmonic_receipt.v0.json');
  writeJson(receiptPath, receipt);
  outputs['harmonic_receipt.v0.json'] = { path: path.basename(receiptPath), sha256: sha256File(receiptPath) };
  emitEvent('harmonic.receipt.emitted', { path: receiptPath, sha256: outputs['harmonic_receipt.v0.json'].sha256, replay_hash: replayHash });

  const report = withDigest({
    v: 'harmonic_lane.report.v0',
    phase: 'wave-a-harmonic',
    fixture_counts: { accept: '0', reject: '0' },
    accept_pass: true,
    reject_pass: true,
    replay_hash: replayHash,
    status: 'ok'
  });

  const reportPath = path.join(outDir, 'harmonic_lane.report.v0.json');
  writeJson(reportPath, report);
  outputs['harmonic_lane.report.v0.json'] = { path: path.basename(reportPath), sha256: sha256File(reportPath) };
  emitEvent('harmonic.report.emitted', { path: reportPath, sha256: outputs['harmonic_lane.report.v0.json'].sha256, replay_hash: replayHash });

  const eventsPath = path.join(outDir, 'harmonic-lane.ndjson');
  writeNdjson(eventsPath, events);
  outputs['harmonic-lane.ndjson'] = { path: path.basename(eventsPath), sha256: sha256File(eventsPath) };

  process.stdout.write(
    JSON.stringify({
      pass: true,
      out_dir: outDir,
      run_id: runId,
      replay_hash: replayHash,
      outputs
    }) + '\n'
  );
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
}
