import { EvoluProvider } from '@evolu/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
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
                    <services.ThemeWrapper>
                        <services.App />
                    </services.ThemeWrapper>
                </EvoluProvider>
            </DepsProvider>
        </React.StrictMode>,
    );
};

main();
