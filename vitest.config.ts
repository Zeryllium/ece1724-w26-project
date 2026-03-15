import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@': resolve(__dirname, './'),
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/*.spec.ts'],
  },
});
