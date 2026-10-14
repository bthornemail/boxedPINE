# OMI-IMO Handoff Procedure

**Version 2.0.0 · CC0-1.0**

## 1. Verify

```bash
cd omi-dom-stack
./final-test.sh
```

Expect: server syntax, self-tests, HTTP routes 200, pipeline `ok:true`, bundle header.

## 2. Run

```bash
node server/server.js
# http://localhost:8742/
# /adopt  /genesis  /genesis-fold  /api/pipeline  /api/bundle
```

## 3. Share

```bash
curl -o omi-imo-bundle.json http://localhost:8742/api/bundle
```

## 4. Key entry points

| Path | Role |
|------|------|
| `shared/pattern-pipeline.js` | pointer → constraint edit |
| `shared/plugin-api.js` | extensions |
| `client/genesis-interactive.js` | knot · torus · Dali Cross |
| `client/webgl-renderer.js` | perspective 3D |
| `client/webaudio-renderer.js` | continuous PannerNode |
| `client/texttrack-attach.js` | native VTT timing |
| `hardware/` | Verilog + C reference |

## 5. Fixed point

Orchestrator converges at **diff === 0** (0x0000).  
The observer is the centroid. The observer is you.
