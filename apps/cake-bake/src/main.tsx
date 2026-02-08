import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { BRAND_COLOR } from '@minimalistic-apps/components';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';

if (Capacitor.isNativePlatform()) {
    StatusBar.setBackgroundColor({ color: BRAND_COLOR });
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setOverlaysWebView({ overlay: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
