import React from 'react';
import ReactDOM from 'react-dom/client';
import { createAppCompositionRoot } from './compositionRoot';

const main = () => {
    const App = createAppCompositionRoot();

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
};

main();
