import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { config } from './config';

export default defineConfig({
    base: './',
    server: {
        host: '0.0.0.0',
        port: config.devPort,
        strictPort: true,
    },
    plugins: [react()],
});
