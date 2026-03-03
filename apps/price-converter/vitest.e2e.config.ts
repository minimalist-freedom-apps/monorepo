import { defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: Vitest config entry requires a default export.
export default defineConfig({
    test: {
        environment: 'node',
        fileParallelism: false,
        globalSetup: ['./e2e/globalSetup.ts'],
        include: ['e2e/*.e2e.test.ts', 'e2e/*.e2e.ts'],
        maxWorkers: 1,
        testTimeout: 180_000,
    },
});
