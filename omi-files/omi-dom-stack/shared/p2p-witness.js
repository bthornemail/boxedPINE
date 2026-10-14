/**
 * P2P witness exchange — WebSocket gossip (Node) + optional browser WebRTC hook
 */
'use strict';

const { makeWitness, witnessEquals } = require('./codex-agreement');
const { submit } = require('./witness-exchange');

function createP2PWitness(options) {
  options = options || {};
  const witnesses = new Map();
  let ws = null;
  let peerId = null;

  function handleIncomingWitness(witness) {
    if (!witness || !witness.input_hash) return;
    const id = (witness.instance_id || 'remote') + ':' + witness.input_hash;
    witnesses.set(id, witness);
    try { submit(witness); } catch (_) {}
  }

  function connectWebSocket(url) {
    // Node: use ws package; browser: native WebSocket
    let WebSocketImpl = null;
    try {
      if (typeof WebSocket !== 'undefined') WebSocketImpl = WebSocket;
      else WebSocketImpl = require('ws');
    } catch (_) {
      return null;
    }
    const socket = new WebSocketImpl(url);
    socket.onopen = function () {
      try { socket.send(JSON.stringify({ type: 'list' })); } catch (_) {}
    };
    socket.onmessage = function (ev) {
      let msg;
      try {
        const data = typeof ev.data !== 'undefined' ? ev.data : ev;
        msg = JSON.parse(String(data));
      } catch (_) { return; }
      if (msg.type === 'welcome') peerId = msg.peerId;
      if (msg.type === 'witness' && msg.witness) handleIncomingWitness(msg.witness);
    };
    return socket;
  }

  if (options.signalingUrl) {
    ws = connectWebSocket(options.signalingUrl);
  }

  function broadcast(witness) {
    const payload = JSON.stringify({ type: 'witness', witness: witness });
    if (ws && (ws.readyState === 1 || ws.readyState === WebSocket.OPEN)) {
      try { ws.send(payload); } catch (_) {}
    }
  }

  function agreeWith(instanceId, input, config) {
    const { runPatternPipeline } = require('./pattern-pipeline');
    const result = runPatternPipeline(input, config || {});
    const localWitness = makeWitness(instanceId || 'local', input, result);
    const inputHash = localWitness.input_hash;
    const remotes = Array.from(witnesses.values()).filter((w) => w.input_hash === inputHash);
    return {
      local: localWitness,
      remotes,
      agreed: remotes.length === 0 ? true : remotes.every((r) => witnessEquals(localWitness, r))
    };
  }

  function close() {
    if (ws) {
      try { ws.close(); } catch (_) {}
      ws = null;
    }
  }

  return {
    broadcast,
    agreeWith,
    handleIncomingWitness,
    witnesses,
    get peerId() { return peerId; },
    close
  };
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  const p2p = createP2PWitness({});
  const input = { clientX: 10, clientY: 20 };
  const a = p2p.agreeWith('node-A', input, { snap: { mode: 'square', size: 8 }, converge: true });
  assert('local fixed', a.local.fixed === true);
  assert('no remotes yet agreed', a.agreed === true);
  assert('centroid', a.local.centroid === '0x0000');

  // Simulate remote same witness
  p2p.handleIncomingWitness({ ...a.local, instance_id: 'node-B' });
  const b = p2p.agreeWith('node-A', input, { snap: { mode: 'square', size: 8 }, converge: true });
  assert('with remote agreed', b.agreed === true);
  assert('remote count', b.remotes.length >= 1);

  p2p.close();
  const failed = results.filter((r) => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { createP2PWitness, selfTest };
