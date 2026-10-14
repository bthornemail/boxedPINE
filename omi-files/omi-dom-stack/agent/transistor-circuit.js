'use strict';

(function () {
  var app = { ac: null, on: false, a: 0, b: 0, master: null, analyser: null, els: {} };
  var VIRIANTS = [
    { id: 'bind',   color: '#5c8cff', pan: -1.0,  ledOnly: true },
    { id: 'apply',  color: '#ffd166', pan: -0.33, ledOnly: false },
    { id: 'eval',   color: '#9fd356', pan: 0.33,  ledOnly: false },
    { id: 'digest', color: '#ff5c8a', pan: 1.0,   ledOnly: false }
  ];
  var FANA = 60, FANB = 240;
  var QNAME = { bind: 'Q1..Q5', apply: 'Q1..Q6', eval: 'Q7..Q14', digest: 'Q15..Q24' };

  function $ (id) { return document.getElementById(id); }

  function getMLContext () {
    var out = $('mlv');
    if (typeof navigator !== 'undefined' && navigator.ml) {
      out.textContent = 'ready';
      $('ml').classList.add('ready');
    } else {
      out.textContent = 'unavailable';
    }
  }

  function xor (a, b) { return (a ^ b) & 1; }

  function buildCircuit (ac, v, outNode) {
    var g = ac.createGain();
    g.gain.value = v.ledOnly ? 0.05 : 0.25;

    var stages = [];
    var n = { bind: 5, apply: 6, eval: 8, digest: 10 }[v.id];
    var i;
    for (i = 0; i < n; i += 1) {
      var q = ac.createGain();
      q.gain.value = 0.35 / n;
      stages.push(q);
      g.connect(q);           // series bias rail (one leg of the long-tail pair)
    }

    var pan = ac.createStereoPanner();
    pan.pan.value = v.pan;

    g.connect(pan);
    pan.connect(outNode);
    v._gain = g;
    v._rail = stages;
    v._pan = pan;
    return v;
  }

  function start () {
    if (app.on) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ac = new AC();
    app.ac = ac;

    var master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);
    app.master = master;

    var analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;
    analyser.connect(master);
    app.analyser = analyser;

    app.carA = ac.createOscillator();
    app.carA.type = 'triangle';
    app.carA.frequency.value = FANA;
    app.carB = ac.createOscillator();
    app.carB.type = 'triangle';
    app.carB.frequency.value = FANB;

    app.carAG = ac.createGain();
    app.carAG.gain.value = 0;
    app.carBG = ac.createGain();
    app.carBG.gain.value = 0;
    app.carA.connect(app.carAG);
    app.carB.connect(app.carBG);

    VIRIANTS.forEach(function (v) { buildCircuit(ac, v, analyser); });

    // per-variant = bias-rail differential: A into even stages, B into odd stages,
    // producing interference = neither (0,0) -> silence, one (x,1) -> tone, both (1,1) -> FG beat.
    VIRIANTS.forEach(function (v) {
      var i;
      for (i = 0; i < v._rail.length; i += 1) {
        var rail = v._rail[i];
        if (i % 2 === 0) app.carAG.connect(rail); // mirror: A into written half
        else app.carBG.connect(rail);
      }
    });

    app.carA.start();
    app.carB.start();

    app.on = true;
    $('tog').textContent = 'stop circuit';
    $('tog').className = 'primary';
    ac.resume();

    app.raf = requestAnimationFrame(draw);
    setBits(app.a, app.b);
  }

  function stop () {
    if (!app.on) return;
    cancelAnimationFrame(app.raf);
    app.ac.close();
    app.on = false;
    $('tog').textContent = 'start circuit';
  }

  function setBits (a, b) {
    app.a = a;
    app.b = b;
    if (!app.ac) return;
    var now = app.ac.currentTime;
    app.carAG.gain.setTargetAtTime(a, now, 0.012);
    app.carBG.gain.setTargetAtTime(b, now, 0.012);

    var x = xor(a, b);
    var el;
    for (var k = 0; k < VIRIANTS.length; k += 1) {
      var v = VIRIANTS[k];
      v._out = x;
      var oids = { bind: 'b-out', apply: 'a-out', eval: 'e-out', digest: 'd-out' };
      el = $(oids[v.id]);
      if (el) el.textContent = x;
    }
    $('kv').textContent = x;
    $('led').className = x ? 'on' : '';

    $('bitA').textContent = 'A = ' + a;
    $('bitB').textContent = 'B = ' + b;
    $('bitA').className = 'bit' + (a ? ' on' : '');
    $('bitB').className = 'bit' + (b ? ' on' : '');
    $('fA').textContent = FANA + ' Hz';
    $('fB').textContent = FANB + ' Hz';
    $('obs').textContent = '0,0,0';
  }

  function draw () {
    var an = app.analyser;
    if (!an || !an.getByteFrequencyData) return;
    var cv = $('spec');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var w = cv.width = cv.clientWidth * devicePixelRatio;
    var h = cv.height = cv.clientHeight * devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    var bins = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(bins);

    var bw = w / bins.length;
    var j, level = 0;
    for (j = 0; j < bins.length; j += 1) {
      var val = bins[j] / 255;
      var bh = val * h * 0.9;
      if (val > level) level = val;
      ctx.fillStyle = 'hsla(' + Math.round(j * 0.5) + ',70%,55%,0.85)';
      ctx.fillRect(j * bw, h - bh, Math.max(1, bw), bh);
    }
    VIRIANTS.forEach(function (v) {
      var m = $('meter-' + v.id);
      var bar = m ? m.querySelector('i') : null;
      if (bar) bar.style.width = Math.round(level * 100) + '%';
    });
    app.raf = requestAnimationFrame(draw);
  }

  function wire () {
    $('bitA').addEventListener('click', function () { ensureAudio(); setBits(xor(app.a, 1), app.b); });
    $('bitB').addEventListener('click', function () { ensureAudio(); setBits(app.a, xor(app.b, 1)); });
    $('tog').addEventListener('click', function () { app.on ? stop() : start(); });
    $('spec').addEventListener('click', function (e) {
      var r = e.target.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      setBits(Math.round(x), app.b); // poke bit A from the scope
    });
  }

  function ensureAudio () { if (!app.on) start(); }

  function boot () {
    getMLContext();
    VIRIANTS.forEach(function (v) {
      var meter = document.querySelector('[data-v="' + v.id + '"] .meter');
      if (meter) meter.id = 'meter-' + v.id;
    });
    wire();
    app.raf = null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.OMICircuit = {
    start: start,
    stop: stop,
    setBits: setBits,
    state: function () { return { a: app.a, b: app.b, on: app.on }; }
  };
})();