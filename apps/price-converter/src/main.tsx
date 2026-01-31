import { ThemeProvider } from '@minimalistic-apps/components';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { createStoreCompositionRoot } from './app/state';
import './index.css';

createStoreCompositionRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
