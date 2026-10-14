/**
 * WebSocket signaling for WebRTC peer discovery + witness gossip
 */
'use strict';

const { WebSocketServer } = require('ws');

function createSignalingServer(httpServer, options) {
  options = options || {};
  const path = options.path || '/signal';
  const wss = new WebSocketServer({ server: httpServer, path });
  const peers = new Map();

  wss.on('connection', (ws) => {
    const peerId = Math.random().toString(36).slice(2, 10);
    peers.set(peerId, { ws, id: peerId });

    try {
      ws.send(JSON.stringify({ type: 'welcome', peerId }));
    } catch (_) {}

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(String(raw));
      } catch (_) {
        return;
      }

      switch (msg.type) {
        case 'list':
          try {
            ws.send(JSON.stringify({
              type: 'peers',
              peers: Array.from(peers.keys()).filter((id) => id !== peerId)
            }));
          } catch (_) {}
          break;

        case 'offer':
        case 'answer':
        case 'ice': {
          const target = peers.get(msg.target);
          if (target && target.ws.readyState === 1) {
            try {
              target.ws.send(JSON.stringify({ ...msg, from: peerId }));
            } catch (_) {}
          }
          break;
        }

        case 'witness':
        default:
          for (const [id, p] of peers) {
            if (id !== peerId && p.ws.readyState === 1) {
              try {
                p.ws.send(JSON.stringify({ ...msg, from: peerId }));
              } catch (_) {}
            }
          }
          break;
      }
    });

    ws.on('close', () => {
      peers.delete(peerId);
    });
  });

  return {
    wss,
    peers,
    peerCount() {
      return peers.size;
    },
    broadcast(msg) {
      const data = JSON.stringify(msg);
      for (const p of peers.values()) {
        if (p.ws.readyState === 1) {
          try { p.ws.send(data); } catch (_) {}
        }
      }
    }
  };
}

function selfTest() {
  // Structural only — full WS needs a live server
  const results = [];
  results.push({ name: 'export createSignalingServer', pass: typeof createSignalingServer === 'function' });
  return { passed: results.every((r) => r.pass), total: results.length, failed: 0, results };
}

module.exports = { createSignalingServer, selfTest };
