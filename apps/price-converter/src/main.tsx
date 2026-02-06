import { EvoluProvider } from '@evolu/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createCompositionRoot } from './compositionRoot';

const main = () => {
    const services = createCompositionRoot();
    services.loadInitialState(); // Todo: this is hack shall not be here

    const unsubscribe = services.persistStore.start();

    window.addEventListener('onbeforeunload', () => {
        unsubscribe();
    });

    const { evolu } = services.ensureEvolu();

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <EvoluProvider value={evolu}>
                <services.ThemeWrapper>
                    <services.App />
                </services.ThemeWrapper>
            </EvoluProvider>
        </React.StrictMode>,
    );
};

main();
