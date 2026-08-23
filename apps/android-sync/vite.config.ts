import { promiseWithResolversPolyfillBanner } from '@minimalist-apps/evolu/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { config } from './config.ts';

export default defineConfig({
    base: './',
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
        rollupOptions: {
            output: {
                banner: promiseWithResolversPolyfillBanner,
            },
        },
    },
    plugins: [react()],
});
