import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { config } from './config';

const evoluInstallPolyfillsPath = fileURLToPath(
    new URL('../../packages/evolu/src/installPolyfills.ts', import.meta.url),
);

export default defineConfig({
    base: './',
    resolve: {
        alias: {
            '@evolu/common/polyfills': evoluInstallPolyfillsPath,
        },
    },
    server: {
        host: '0.0.0.0',
        port: config.devPort,
        strictPort: true,
    },
    optimizeDeps: {
        exclude: ['@evolu/web', '@evolu/sqlite-wasm'],
    },
    worker: {
        format: 'es',
    },
    plugins: [react()],
});
