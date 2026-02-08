import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    server: {
        host: '0.0.0.0',
        port: 5173,
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
