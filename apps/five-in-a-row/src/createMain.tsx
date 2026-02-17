import React from 'react';
import ReactDOM from 'react-dom/client';
import type { AppDep } from './app/App';
import type { StatePersistenceDep } from './localStorage/statePersistence';

export type Main = () => void;

export interface MainDep {
    readonly main: Main;
}

type MainDeps = AppDep & StatePersistenceDep;

export const createMain =
    (deps: MainDeps): Main =>
    () => {
        deps.statePersistence.start();

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <deps.App />
            </React.StrictMode>,
        );
    };
