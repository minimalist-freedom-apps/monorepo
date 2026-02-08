import type { CapacitorConfig } from '@capacitor/cli';
import { config as appConfig } from './config';

const config: CapacitorConfig = {
    appId: 'com.minimalistic.priceconverter',
    appName: appConfig.appName,
    webDir: 'dist',
    server: {
        url: process.env.CAP_SERVER_URL,
        cleartext: true,
    },
};

export default config;
