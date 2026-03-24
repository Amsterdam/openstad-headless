import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { prefix } from '../lib/prefix';

const testConfig = {
  environment: 'jsdom' as const,
  include: ['src/**/*.test.{ts,tsx}'],
  passWithNoTests: false,
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // When running in dev mode, use the React plugin
  if (command === 'serve') {
    return {
      plugins: [react()],
      css: prefix(),
      test: testConfig,
    };
    // During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
  } else {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      css: prefix(),
      define: { 'process.env.NODE_ENV': '"production"' },
      build: {
        lib: {
          formats: ['iife'],
          entry: 'src/stembegroot_2/stem-begroot-2.tsx',
          name: 'OpenstadHeadlessStemBegroot',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'remixicon/fonts/remixicon.css'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
      test: testConfig,
    };
  }
});
