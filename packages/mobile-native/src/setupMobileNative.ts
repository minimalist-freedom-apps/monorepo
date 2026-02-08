import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { BRAND_COLOR } from '@minimalistic-apps/components';

export const setupMobileNative = (): void => {
    if (Capacitor.isNativePlatform()) {
        StatusBar.setBackgroundColor({ color: BRAND_COLOR });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: true });
    }

    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', BRAND_COLOR);
};
