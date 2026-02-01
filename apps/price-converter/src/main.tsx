import React from 'react';
import ReactDOM from 'react-dom/client';
import { ServicesProvider } from './ServicesProvider';
import { App } from './app/App';
import { ThemeWrapper } from './app/ThemeWrapper';
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
                <ThemeWrapper>
                    <App />
                </ThemeWrapper>
            </ServicesProvider>
        </React.StrictMode>,
    );
};

main();
