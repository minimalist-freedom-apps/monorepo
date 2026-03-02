import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { config } from './config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: './',
    resolve: {
        alias: {
            'disposablestack/auto': path.resolve(dirname, 'src/polyfills/disposablestackAuto.ts'),
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
