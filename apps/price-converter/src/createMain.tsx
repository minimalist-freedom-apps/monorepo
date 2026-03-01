import type { LocalStorageInitDep } from '@minimalist-apps/fragment-local-storage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { AppDep } from './app/App';

export type Main = () => void;

/** @publicdep */
export interface MainDep {
    readonly main: Main;
}

type MainDeps = AppDep & LocalStorageInitDep;

export const createMain =
    (deps: MainDeps): Main =>
    () => {
        deps.localStorageInit();

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <deps.App />
            </React.StrictMode>,
        );
    };
