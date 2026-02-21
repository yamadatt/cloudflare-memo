import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: [
        'lib/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'middleware.ts',
      ],
      exclude: ['lib/types.ts', '**/*.d.ts', '**/*.test.*', '**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
