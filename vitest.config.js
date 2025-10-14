import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST, compilerOptions: { dev: true } })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.js', 'src/**/*.spec.js'],
    setupFiles: ['./vitest.setup.js'],
  },
  resolve: {
    conditions: ['browser'],
  },
});
