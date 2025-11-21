import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'],
  // Note: threads are controlled via the CLI (--threads=false) to avoid
  // TypeScript type mismatches for vitest's config types.
    // Configure JSDOM base URL so tests can call history.pushState with relative paths
    // without causing a SecurityError when the default base is about:blank.
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/'
      }
    }
  },
});
