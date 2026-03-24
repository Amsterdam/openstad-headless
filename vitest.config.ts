import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Browser IIFE packages: no unit tests; their local node_modules may be root-owned
    // (e.g. after sudo npm), which breaks Vite's config bundling (.vite-temp) under Vitest.
    projects: [
      'apps/*',
      'packages/*',
      '!packages/raw-resource',
      '!packages/simple-voting',
      'packages/apostrophe-widgets/*',
    ],
  },
});
