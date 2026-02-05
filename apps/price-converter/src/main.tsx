import { EvoluProvider } from '@evolu/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { ThemeWrapper } from './app/ThemeWrapper';
import { createCompositionRoot } from './compositionRoot';
import { DepsProvider } from './ServicesProvider';

const main = () => {
    const services = createCompositionRoot();
    services.loadInitialState();

    const unsubscribe = services.persistStore.start();

    window.addEventListener('onbeforeunload', () => {
        unsubscribe();
    });

    const { evolu } = services.ensureEvolu();

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <DepsProvider deps={services}>
                <EvoluProvider value={evolu}>
                    <ThemeWrapper>
                        <App />
                    </ThemeWrapper>
                </EvoluProvider>
            </DepsProvider>
        </React.StrictMode>,
    );
};

main();
