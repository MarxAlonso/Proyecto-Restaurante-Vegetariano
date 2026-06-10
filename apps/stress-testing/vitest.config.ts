import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 30000,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    reporters: ['default', 'json'],
    outputFile: {
      json: './reports/vitest-results.json',
    },
  },
});
