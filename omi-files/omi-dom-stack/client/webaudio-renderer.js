/**
 * OMI-IMO continuous Web Audio — torus samples → PannerNode (0D observer)
 */
'use strict';

function createWebAudioRenderer(audioContext) {
  const AC = typeof AudioContext !== 'undefined' ? AudioContext
    : (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null);
  if (!AC && !audioContext) {
    return {
      supported: false,
      updateFromGeometry() {},
      updateFrequency() {},
      updateGain() {},
      suspend() { return Promise.resolve(); },
      resume() { return Promise.resolve(); },
      stop() {}
    };
  }

  const ctx = audioContext || new AC();
  const panner = ctx.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 100;
  panner.rolloffFactor = 1;

  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = 220;

  const gain = ctx.createGain();
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(panner);
  panner.connect(ctx.destination);

  let started = false;

  function ensureStart() {
    if (!started) {
      try { oscillator.start(); started = true; } catch (_) { /* already */ }
    }
  }

  function setPos(x, y, z) {
    if (panner.positionX) {
      panner.positionX.setTargetAtTime(x, ctx.currentTime, 0.05);
      panner.positionY.setTargetAtTime(y, ctx.currentTime, 0.05);
      panner.positionZ.setTargetAtTime(z, ctx.currentTime, 0.05);
    } else if (panner.setPosition) {
      panner.setPosition(x, y, z);
    }
  }

  return {
    supported: true,
    ctx,
    panner,

    updateFromGeometry(geometry) {
      ensureStart();
      if (!geometry || !geometry.length) return;
      let sx = 0, sy = 0, sz = 0;
      for (let i = 0; i < geometry.length; i++) {
        sx += geometry[i].x;
        sy += geometry[i].y;
        sz += geometry[i].z || 0;
      }
      const n = geometry.length;
      setPos(sx / n, sy / n, sz / n);
    },

    updateFrequency(diagonal) {
      ensureStart();
      const freq = 110 + ((diagonal >>> 0) % 256) * 2;
      oscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    },

    updateGain(linear) {
      ensureStart();
      const g = 0.04 + (Math.abs(linear) % 100) / 1200;
      gain.gain.setTargetAtTime(g, ctx.currentTime, 0.1);
    },

    suspend() { return ctx.suspend(); },
    resume() { return ctx.resume(); },

    stop() {
      try { oscillator.stop(); } catch (_) {}
      try { oscillator.disconnect(); gain.disconnect(); panner.disconnect(); } catch (_) {}
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createWebAudioRenderer };
}
if (typeof window !== 'undefined') {
  window.createWebAudioRenderer = createWebAudioRenderer;
}
