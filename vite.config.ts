import { defineConfig } from 'vite';

// Two pages: the Fano Constants page (index.html) and the Breadboard Space (space/xr.html).
export default defineConfig({
  build: { rollupOptions: { input: { main: 'index.html', space: 'space/xr.html' } } },
});
