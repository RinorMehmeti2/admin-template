import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Visualizer is a rollup plugin; only enabled when `--mode analyze` is
// passed (via `pnpm analyze`). Output lands at dist/stats.html.
export default defineConfig(({ mode }) => {
  const analyze = mode === 'analyze';
  return {
    plugins: [
      react(),
      tailwindcss(),
      analyze &&
        visualizer({
          filename: 'dist/stats.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          open: false,
        }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
