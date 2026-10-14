/**
 * Native TextTrack attachment for VTT cue timing
 */
'use strict';

function pad(n) { return String(n).padStart(2, '0'); }
function pad3(n) { return String(n).padStart(3, '0'); }

function formatVTT(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return pad(h) + ':' + pad(m) + ':' + pad(s) + '.' + pad3(ms);
}

function cuesToVttText(cues) {
  let vtt = 'WEBVTT\n\nNOTE OMI-IMO genesis fold/proto\n\n';
  (cues || []).forEach((cue, i) => {
    vtt += (i + 1) + '\n';
    vtt += formatVTT(cue.start) + ' --> ' + formatVTT(cue.end) + '\n';
    const payload = cue.payload || { fold: cue.fold, proto: cue.proto, chapter: cue.chapter };
    vtt += JSON.stringify(payload) + '\n\n';
  });
  return vtt;
}

/**
 * Attach metadata TextTrack to media element; onCue(payload, cue).
 */
function attachTextTrack(media, cues, onCue) {
  if (!media || !media.appendChild) {
    return { track: null, url: null, destroy() {} };
  }

  const vtt = cuesToVttText(cues);
  const blob = new Blob([vtt], { type: 'text/vtt' });
  const url = URL.createObjectURL(blob);

  const trackEl = document.createElement('track');
  trackEl.kind = 'metadata';
  trackEl.label = 'OMI-IMO Genesis';
  trackEl.srclang = 'en';
  trackEl.src = url;
  trackEl.default = true;

  media.appendChild(trackEl);

  const bindTrack = () => {
    const list = media.textTracks;
    if (!list || !list.length) return null;
    const textTrack = list[list.length - 1];
    textTrack.mode = 'hidden';
    textTrack.addEventListener('cuechange', () => {
      const active = textTrack.activeCues && textTrack.activeCues[0];
      if (!active || !onCue) return;
      let payload;
      try { payload = JSON.parse(active.text); }
      catch (_) { payload = { raw: active.text }; }
      onCue(payload, active);
    });
    return textTrack;
  };

  trackEl.addEventListener('load', bindTrack);
  // Some browsers fire immediately
  setTimeout(bindTrack, 0);

  return {
    track: trackEl,
    url,
    vtt,
    destroy() {
      try { URL.revokeObjectURL(url); } catch (_) {}
      try { trackEl.remove(); } catch (_) {}
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { attachTextTrack, formatVTT, cuesToVttText };
}
if (typeof window !== 'undefined') {
  window.attachTextTrack = attachTextTrack;
  window.formatVTT = formatVTT;
  window.cuesToVttText = cuesToVttText;
}
