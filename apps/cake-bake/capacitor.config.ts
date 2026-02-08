import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.minimalistic.cakebake',
    appName: 'Cake Bake',
    webDir: 'dist',
    server: {
        url: process.env.CAP_SERVER_URL,
        cleartext: true,
    },
};

export default config;
