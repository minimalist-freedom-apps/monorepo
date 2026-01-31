import { ThemeProvider } from '@minimalistic-apps/components';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ServicesProvider } from './ServicesProvider';
import { App } from './app/App';
import { createCompositionRoot } from './compositionRoot';

const main = () => {
    const services = createCompositionRoot();
    services.loadInitialState();

    const unsubscribe = services.persistStore.start();

    window.addEventListener('onbeforeunload', () => {
        unsubscribe();
    });

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
