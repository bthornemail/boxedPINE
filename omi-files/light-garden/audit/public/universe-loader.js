/* universe-loader.js
 *
 * Embeddable, self-booting loader for a Light-Garden "universe" replay directory.
 *
 * Usage:
 *   <div id="universe"></div>
 *   <script src="/path/to/universe-loader.js"></script>
 *   <script>
 *     UniverseLoader.mount({
 *       root: "#universe",
 *       baseUrl: "/audit/results/bench/replay/universe/latest/",
 *       mode: "iframe" // or "link"
 *     });
 *   </script>
 *
 * What it does (fail-closed):
 * - Verifies build-replay.html exists
 * - Verifies portal-scene.json exists (immersive attachment)
 * - Verifies portal-gate.json exists and pass=true
 * - Optionally reads index.json for metadata (if present)
 * - Mounts an iframe (or renders an "Open" link)
 *
 * Notes:
 * - baseUrl must be same-origin or CORS-enabled for fetch().
 * - This is projection-only; canon stays elsewhere.
 */

(function () {
  const DEFAULTS = {
    root: null, // selector or HTMLElement
    baseUrl: "./", // should end with "/"
    mode: "iframe", // "iframe" | "link"
    iframe: {
      width: "100%",
      height: "720px",
      allow: "fullscreen; xr-spatial-tracking; microphone; camera; clipboard-read; clipboard-write",
      sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
    },
    files: {
      replayHtml: "build-replay.html",
      portalScene: "portal-scene.json",
      portalGate: "portal-gate.json",
      indexJson: "index.json"
    },
    requireGate: true
  };

  function isEl(x) {
    return x && typeof x === "object" && x.nodeType === 1;
  }

  function resolveRoot(root) {
    if (!root) throw new Error("UniverseLoader.mount: missing root");
    if (isEl(root)) return root;
    if (typeof root === "string") {
      const el = document.querySelector(root);
      if (!el) throw new Error(`UniverseLoader.mount: root not found: ${root}`);
      return el;
    }
    throw new Error("UniverseLoader.mount: root must be selector or HTMLElement");
  }

  function joinUrl(baseUrl, rel) {
    const b = String(baseUrl || "");
    const base = b.endsWith("/") ? b : `${b}/`;
    return base + rel.replace(/^\/+/, "");
  }

  function styleBox(el) {
    el.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    el.style.fontSize = "14px";
    el.style.lineHeight = "1.35";
  }

  function renderStatus(root, text) {
    root.innerHTML = "";
    const box = document.createElement("div");
    styleBox(box);
    box.style.border = "1px solid rgba(0,0,0,0.12)";
    box.style.borderRadius = "12px";
    box.style.padding = "12px 14px";
    box.style.background = "rgba(0,0,0,0.02)";
    box.textContent = text;
    root.appendChild(box);
    return box;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`fetch_failed:${res.status}:${url}`);
    return await res.json();
  }

  async function exists(url) {
    const res = await fetch(url, { method: "GET", credentials: "same-origin" });
    return res.ok;
  }

  function renderHeader(root, meta) {
    const header = document.createElement("div");
    styleBox(header);
    header.style.display = "flex";
    header.style.alignItems = "baseline";
    header.style.justifyContent = "space-between";
    header.style.gap = "12px";
    header.style.marginBottom = "10px";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.style.fontWeight = "700";
    title.style.fontSize = "16px";
    title.textContent = meta.title || "Bootable Universe";
    const sub = document.createElement("div");
    sub.style.opacity = "0.7";
    sub.textContent = meta.subtitle || meta.baseUrl;
    left.appendChild(title);
    left.appendChild(sub);

    const right = document.createElement("div");
    right.style.opacity = "0.85";
    right.style.fontSize = "12px";
    right.style.whiteSpace = "nowrap";
    right.textContent = meta.badge || "";

    header.appendChild(left);
    header.appendChild(right);
    root.appendChild(header);
  }

  function renderLink(root, href, label) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label || "Open universe replay";
    a.style.display = "inline-block";
    a.style.padding = "10px 12px";
    a.style.borderRadius = "10px";
    a.style.border = "1px solid rgba(0,0,0,0.18)";
    a.style.textDecoration = "none";
    a.style.color = "inherit";
    a.style.background = "rgba(0,0,0,0.02)";
    root.appendChild(a);
    return a;
  }

  function renderIframe(root, src, iframeCfg) {
    const frame = document.createElement("iframe");
    frame.src = src;
    frame.style.width = iframeCfg.width;
    frame.style.height = iframeCfg.height;
    frame.style.border = "1px solid rgba(0,0,0,0.12)";
    frame.style.borderRadius = "12px";
    frame.allow = iframeCfg.allow;
    frame.sandbox = iframeCfg.sandbox;
    frame.loading = "lazy";
    root.appendChild(frame);
    return frame;
  }

  async function mount(opts) {
    const cfg = deepMerge(DEFAULTS, opts || {});
    const root = resolveRoot(cfg.root);
    const baseUrl = String(cfg.baseUrl || DEFAULTS.baseUrl);
    const replayUrl = joinUrl(baseUrl, cfg.files.replayHtml);
    const sceneUrl = joinUrl(baseUrl, cfg.files.portalScene);
    const gateUrl = joinUrl(baseUrl, cfg.files.portalGate);
    const indexUrl = joinUrl(baseUrl, cfg.files.indexJson);
    const immersiveUrl = joinUrl(baseUrl, "portal-immersive.html") + "?base=" + encodeURIComponent(baseUrl);

    const status = renderStatus(root, "Booting universe…");

    const [hasReplay, hasScene, hasGate] = await Promise.all([
      exists(replayUrl),
      exists(sceneUrl),
      exists(gateUrl)
    ]);
    if (!hasReplay) {
      status.textContent = `Universe not bootable: missing ${cfg.files.replayHtml} at ${replayUrl}`;
      throw new Error("missing_build_replay_html");
    }
    if (!hasScene) {
      status.textContent = `Universe not immersive-ready: missing ${cfg.files.portalScene} at ${sceneUrl}`;
      throw new Error("missing_portal_scene");
    }
    if (cfg.requireGate && !hasGate) {
      status.textContent = `Universe not verified: missing ${cfg.files.portalGate} at ${gateUrl}`;
      throw new Error("missing_portal_gate");
    }

    let indexJson = null;
    let gateJson = null;
    try { indexJson = await fetchJson(indexUrl); } catch (_) {}
    try { gateJson = await fetchJson(gateUrl); } catch (_) {}

    if (cfg.requireGate && !(gateJson && gateJson.pass === true)) {
      status.textContent = `Universe not verified: portal gate did not pass (${cfg.files.portalGate})`;
      throw new Error("portal_gate_failed");
    }

    const badge =
      gateJson && gateJson.pass === true
        ? "✅ verified"
        : gateJson && gateJson.pass === false
          ? "⛔ gate failed"
          : "⚪ ungated";

    const portalScene = await fetchJson(sceneUrl);

    root.innerHTML = "";
    renderHeader(root, {
      title: (indexJson && (indexJson.title || indexJson.lane_title)) || "Bootable Universe",
      subtitle: (indexJson && (indexJson.subtitle || indexJson.lane_subtitle)) || baseUrl,
      badge
    });

    const controls = document.createElement("div");
    styleBox(controls);
    controls.style.display = "flex";
    controls.style.gap = "10px";
    controls.style.flexWrap = "wrap";
    controls.style.marginBottom = "10px";
    root.appendChild(controls);

    renderLink(controls, replayUrl, "Open replay");
    const sceneLink = renderLink(controls, sceneUrl, "Open portal-scene.json");
    sceneLink.style.opacity = "0.9";
    const immersiveLink = renderLink(controls, immersiveUrl, "Open immersive (AR/VR)");
    immersiveLink.style.opacity = "0.95";

    if (cfg.mode === "iframe") {
      renderIframe(root, replayUrl, cfg.iframe);
    } else {
      const note = document.createElement("div");
      styleBox(note);
      note.style.opacity = "0.75";
      note.style.marginTop = "6px";
      note.textContent = "iframe disabled; use links above.";
      root.appendChild(note);
    }

    const handle = {
      baseUrl,
      replayUrl,
      sceneUrl,
      gateUrl,
      indexUrl,
      portalScene,
      gate: gateJson,
      index: indexJson,
      async refresh() {
        return await mount({ ...cfg, root });
      }
    };

    root.__universeHandle = handle;
    window.dispatchEvent(new CustomEvent("universe:ready", { detail: handle }));
    return handle;
  }

  function deepMerge(a, b) {
    const out = Array.isArray(a) ? [...a] : { ...a };
    for (const [k, v] of Object.entries(b || {})) {
      if (v && typeof v === "object" && !Array.isArray(v) && a && typeof a[k] === "object") {
        out[k] = deepMerge(a[k], v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  window.UniverseLoader = {
    mount,
    version: "1.0.0"
  };
})();
