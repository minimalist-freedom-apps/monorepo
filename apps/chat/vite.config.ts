import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { config } from './config';

export default defineConfig({
    base: './',
    server: {
        host: '0.0.0.0',
        port: config.devPort,
        strictPort: true,
    },
    optimizeDeps: {
        exclude: ['@evolu/web', '@evolu/sqlite-wasm', 'openmls-wasm'],
    },
    worker: {
        format: 'es',
    },
    plugins: [react(), wasm(), topLevelAwait()],
});
