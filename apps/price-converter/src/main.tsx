import { ThemeProvider } from '@minimalistic-apps/components';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './index.css';
import { ServicesProvider } from './ServicesProvider';
import { createStoreCompositionRoot } from './compositionRoot';

const main = () => {
    const services = createStoreCompositionRoot();
    services.loadInitialState();

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <ServicesProvider services={services}>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </ServicesProvider>
        </React.StrictMode>,
    );
};

main();
