import { defineConfig } from 'vite';

// The root page plus the linked rooms in space/ are built as separate entries.
export default defineConfig({
  build: { rollupOptions: { input: { main: 'index.html', space: 'space/index.html', xr: 'space/xr.html', meta: 'space/meta.html', agent: 'space/agent.html', examples: 'space/examples.html', polytron: 'space/polytron.html', metaverse: 'space/metaverse.html', map: 'space/map.html', serial: 'space/serial.html', soundCheck: 'space/sound-check.html', gate: 'space/gate.html', step: 'space/step.html', gate3d: 'space/gate3d.html', dominoCube: 'space/domino-cube.html', guest: 'space/guest.html', twin: 'space/twin.html', walk: 'space/walk.html', walkthrough: 'space/walkthrough.html' } } },
});
