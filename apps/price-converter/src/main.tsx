import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { BRAND_COLOR } from '@minimalistic-apps/components';
import { createCompositionRoot } from './compositionRoot';

if (Capacitor.isNativePlatform()) {
    StatusBar.setBackgroundColor({ color: BRAND_COLOR });
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setOverlaysWebView({ overlay: true });
}

const main = createCompositionRoot();

main();
