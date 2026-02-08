import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { BRAND_COLOR } from '@minimalist-apps/components';

/**
 * Android WebView does not support the Web Locks API (`navigator.locks`).
 * Evolu's SharedWebWorker relies on it for cross-tab coordination.
 * In a Capacitor WebView there is only a single tab, so we polyfill
 * `navigator.locks` with an immediate-grant implementation.
 */
const polyfillNavigatorLocks = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.locks !== undefined) {
        return;
    }

    Object.defineProperty(navigator, 'locks', {
        value: {
            request: async (_name: string, callback: () => Promise<void>): Promise<void> =>
                callback(),
            query: async () => ({ held: [], pending: [] }),
        },
        configurable: true,
    });
};

export const setupMobileNative = (): void => {
    polyfillNavigatorLocks();

    if (Capacitor.isNativePlatform()) {
        StatusBar.setBackgroundColor({ color: BRAND_COLOR });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: true });
    }

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BRAND_COLOR);
};
