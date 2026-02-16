import { setupMobileNative } from '@minimalist-apps/mobile-native';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';

setupMobileNative();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
