import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
        exclude: [...configDefaults.exclude, '**/e2e/**', '**/*.e2e.test.ts', '**/*.e2e.ts'],
    },
});
