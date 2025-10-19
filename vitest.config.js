import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({ hot: !process.env.VITEST, compilerOptions: { dev: true } }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.test.js',
      'src/**/*.spec.js',
      'test/**/*.test.js',
      'test/**/*.spec.js',
    ],
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,svelte}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**',
        'styled-system/**',
        '**/styled-system/**',
        'panda.config.mjs',
        'postcss.config.cjs',
        'svelte.config.js',
        'server.js',
        'src/**/*.test.js',
        'src/**/*.spec.js',
      ],
    },
  },
  resolve: {
    conditions: ['browser'],
  },
});
