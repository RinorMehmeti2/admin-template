import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const resolvedViteConfig = viteConfig({ mode: 'test', command: 'serve' });

export default mergeConfig(
  resolvedViteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      css: true,
      // Playwright owns e2e/. Vitest's default "discover *.spec.ts everywhere"
      // would pick them up and fail because Playwright fixtures need its own
      // runner.
      exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
    },
  }),
);
