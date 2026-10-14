import { defineConfig } from 'vite';

// The root page plus the linked rooms in space/ are built as separate entries.
export default defineConfig({
  build: { rollupOptions: { input: { main: 'index.html', space: 'space/index.html', xr: 'space/xr.html', meta: 'space/meta.html', agent: 'space/agent.html', examples: 'space/examples.html', polytron: 'space/polytron.html', metaverse: 'space/metaverse.html' } } },
});
