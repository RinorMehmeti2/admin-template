import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../docs/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: {
    // react-docgen-typescript pulls in a vite plugin that peers vite ^3-6;
    // we're on vite 8. Use the lighter docgen instead.
    reactDocgen: 'react-docgen',
  },
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias ?? {}),
      '@': resolve(__dirname, '../src'),
    };
    return cfg;
  },
};

export default config;
