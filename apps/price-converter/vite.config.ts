import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    optimizeDeps: {
        exclude: ['@evolu/web', '@evolu/sqlite-wasm'],
    },
    worker: {
        format: 'es',
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'robots.txt',
                'apple-touch-icon.png',
            ],
            manifest: {
                name: 'Minimalistic Price Converter',
                short_name: 'Price Converter',
                description:
                    'Minimalistic app converting prices between fiat currencies and Bitcoin',
                theme_color: '#f7931a',
                background_color: '#121212',
                display: 'standalone',
                icons: [
                    {
                        src: 'icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'coingecko-api-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 300,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/bitpay\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'bitpay-api-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 300,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/blockchain\.info\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'blockchain-api-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 300,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
});
