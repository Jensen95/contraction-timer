import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],

  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
    },
    conditions: ['browser'],
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,js}', 'src/**/*.svelte.{test,spec}.{ts,js}'],
    exclude: ['node_modules', 'dist', '.git'],
    css: true,
    clearMocks: true,
    restoreMocks: true,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,svelte,svelte.ts}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.{test,spec}.ts',
        'src/main.ts',
        'src/app.d.ts',
        'src/lib/sw-registration.ts',
      ],
      thresholds: {
        'src/lib/stats.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
        'src/lib/utils.ts': { lines: 100, branches: 100, functions: 100, statements: 100 },
        'src/lib/storage.ts': { lines: 80, branches: 75, functions: 80, statements: 80 },
      },
    },
  },
});
