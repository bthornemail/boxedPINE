/**
 * Browser WebRTC DataChannel + WebSocket signaling for witness P2P
 */
'use strict';

function createWebRTCChannel(options) {
  options = options || {};
  const signalingUrl = options.signalingUrl ||
    ((typeof location !== 'undefined')
      ? ((location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host + '/signal')
      : 'ws://127.0.0.1:8742/signal');
  const iceServers = options.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }];
  const onMessage = options.onMessage || function () {};
  const onOpen = options.onOpen || function () {};
  const onClose = options.onClose || function () {};

  if (typeof RTCPeerConnection === 'undefined') {
    return {
      peerId: null,
      send() {},
      broadcast() {},
      close() {},
      supported: false
    };
  }

  const pc = new RTCPeerConnection({ iceServers });
  let channel = pc.createDataChannel('witness', { ordered: true });
  const signaling = new WebSocket(signalingUrl);

  let peerId = null;
  let targetPeer = null;

  function bindChannel(ch) {
    channel = ch;
    ch.onopen = function () { onOpen(ch); };
    ch.onclose = function () { onClose(); };
    ch.onmessage = function (e) {
      try { onMessage(JSON.parse(e.data)); }
      catch (_) { onMessage({ raw: e.data }); }
    };
  }
  bindChannel(channel);

  pc.ondatachannel = function (ev) {
    bindChannel(ev.channel);
  };

  pc.onicecandidate = function (e) {
    if (e.candidate && targetPeer) {
      signaling.send(JSON.stringify({
        type: 'ice',
        target: targetPeer,
        candidate: e.candidate
      }));
    }
  };

  signaling.onopen = function () {
    signaling.send(JSON.stringify({ type: 'list' }));
  };

  signaling.onmessage = async function (raw) {
    let msg;
    try { msg = JSON.parse(raw.data); } catch (_) { return; }

    switch (msg.type) {
      case 'welcome':
        peerId = msg.peerId;
        break;
      case 'peers':
        if (msg.peers && msg.peers.length > 0 && !targetPeer) {
          targetPeer = msg.peers[0];
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signaling.send(JSON.stringify({
            type: 'offer',
            target: targetPeer,
            offer: pc.localDescription
          }));
        }
        break;
      case 'offer':
        targetPeer = msg.from;
        await pc.setRemoteDescription(msg.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signaling.send(JSON.stringify({
          type: 'answer',
          target: targetPeer,
          answer: pc.localDescription
        }));
        break;
      case 'answer':
        await pc.setRemoteDescription(msg.answer);
        break;
      case 'ice':
        if (msg.candidate) {
          try { await pc.addIceCandidate(msg.candidate); } catch (_) {}
        }
        break;
      case 'witness':
        onMessage({ type: 'witness', witness: msg.witness, from: msg.from });
        break;
      default:
        break;
    }
  };

  return {
    supported: true,
    get peerId() { return peerId; },
    channel: channel,
    pc: pc,
    signaling: signaling,
    send(data) {
      if (channel && channel.readyState === 'open') {
        channel.send(JSON.stringify(data));
      } else if (signaling.readyState === 1) {
        signaling.send(JSON.stringify(data));
      }
    },
    broadcast(witness) {
      this.send({ type: 'witness', witness: witness });
    },
    close() {
      try { channel.close(); } catch (_) {}
      try { pc.close(); } catch (_) {}
      try { signaling.close(); } catch (_) {}
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createWebRTCChannel };
}
if (typeof window !== 'undefined') {
  window.createWebRTCChannel = createWebRTCChannel;
}
