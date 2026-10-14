(function () {
  function qs(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function joinUrl(baseUrl, rel) {
    const b = String(baseUrl || "");
    const base = b.endsWith("/") ? b : b + "/";
    return base + rel.replace(/^\/+/, "");
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function scalePos(p, s) {
    return {
      x: (p && typeof p.x === "number" ? p.x : 0) * s,
      y: (p && typeof p.y === "number" ? p.y : 0) * s,
      z: (p && typeof p.z === "number" ? p.z : 0) * s
    };
  }

  async function fetchJson(url) {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error("fetch_failed:" + res.status + ":" + url);
    return await res.json();
  }

  function setMeta(text, cls) {
    const el = document.getElementById("meta");
    el.textContent = text;
    el.className = "meta" + (cls ? " " + cls : "");
  }

  function addEntity(world, entity, idx, overlayUrl) {
    const kind = String(entity.kind || "event");
    const severity = String(entity.severity || "info");
    const label = String(entity.label || entity.id || "entity");

    const color =
      severity === "error" ? "#ef4444" :
      severity === "warn" ? "#f59e0b" :
      kind === "integration" ? "#60a5fa" :
      kind === "benchmark" ? "#a78bfa" :
      kind === "patch" ? "#fbbf24" :
      "#34d399";

    const node = document.createElement("a-sphere");
    const pos = scalePos(entity.position || {}, 0.02);
    node.setAttribute("position", `${pos.x} ${1.2 + clamp(pos.y, -5, 5)} ${pos.z}`);
    node.setAttribute("radius", "0.18");
    node.setAttribute("color", color);
    node.setAttribute("segments-width", "12");
    node.setAttribute("segments-height", "12");
    node.setAttribute("opacity", "0.92");
    node.setAttribute("data-id", String(entity.id || idx));

    const text = document.createElement("a-text");
    text.setAttribute("value", label.slice(0, 42));
    text.setAttribute("align", "center");
    text.setAttribute("color", "#e5e7eb");
    text.setAttribute("width", "4");
    text.setAttribute("position", "0 0.35 0");
    text.setAttribute("rotation", "0 180 0");
    node.appendChild(text);

    // Optional overlay billboard (2D) anchored to world.
    if (overlayUrl) {
      const board = document.createElement("a-plane");
      board.setAttribute("width", "2.2");
      board.setAttribute("height", "1.4");
      board.setAttribute("position", "0 0.95 0");
      board.setAttribute("material", `shader: flat; src: url(${overlayUrl}); transparent: true; opacity: 0.7`);
      node.appendChild(board);
    }

    world.appendChild(node);
  }

  function addWaveformPoint(world, pt, idx) {
    const pos = scalePos(pt.position || {}, 8.0);
    const node = document.createElement("a-sphere");
    node.setAttribute("position", `${pos.x} ${0.4 + clamp(pos.y, -5, 5)} ${pos.z}`);
    node.setAttribute("radius", "0.06");
    node.setAttribute("color", String(pt.color || "#22c55e"));
    node.setAttribute("segments-width", "8");
    node.setAttribute("segments-height", "8");
    node.setAttribute("opacity", "0.75");
    node.setAttribute("data-id", String(pt.id || `wf:${idx}`));
    world.appendChild(node);
  }

  async function boot() {
    if (!window.AFRAME) {
      setMeta("A-Frame missing (aframe.min.js not found).", "bad");
      return;
    }

    // base= should point at a replay directory, e.g. /audit/results/bench/replay/universe/latest/
    const baseUrl = qs("base") || "./";
    const sceneUrl = joinUrl(baseUrl, "portal-scene.json");
    const replayUrl = joinUrl(baseUrl, "build-replay.html");
    const overlayUrl = joinUrl(baseUrl, "portal-overlay.svg");
    const waveformUrl = joinUrl(baseUrl, "waveform.canisa.scene.json");

    document.getElementById("openReplay").href = replayUrl;
    document.getElementById("openScene").href = sceneUrl;
    document.getElementById("openWaveform").href = waveformUrl;

    const world = document.getElementById("world");
    world.innerHTML = "";

    setMeta("Loading portal-scene.json…");

    let portalScene;
    try {
      portalScene = await fetchJson(sceneUrl);
    } catch (err) {
      setMeta("Failed to load portal-scene.json: " + String(err && err.message ? err.message : err), "bad");
      return;
    }

    const entities = Array.isArray(portalScene.entities) ? portalScene.entities : [];
    setMeta(`Loaded ${entities.length} entities from ${baseUrl}`, "good");

    // Try to use overlay if it exists; ignore failures.
    let overlayExists = false;
    try {
      const r = await fetch(overlayUrl, { method: "GET", credentials: "same-origin" });
      overlayExists = r.ok;
    } catch (_) {
      overlayExists = false;
    }

    for (let i = 0; i < entities.length; i += 1) {
      addEntity(world, entities[i], i, overlayExists ? overlayUrl : null);
    }

    // Optional waveform point-cloud layer (ignore failures).
    try {
      const wf = await fetchJson(waveformUrl);
      const wfEntities = Array.isArray(wf.entities) ? wf.entities : [];
      for (let i = 0; i < wfEntities.length; i += 1) {
        addWaveformPoint(world, wfEntities[i], i);
      }
    } catch (_) {
      // no waveform scene in this bundle; ignore
    }

    document.getElementById("recenter").addEventListener("click", () => {
      const rig = document.getElementById("rig");
      rig.setAttribute("position", "0 1.6 4");
    });
  }

  boot();
})();
