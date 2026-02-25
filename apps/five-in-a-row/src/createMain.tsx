import type { LocalStorageInit } from '@minimalist-apps/fragment-local-storage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { AppDep } from './app/App';

export type Main = () => void;

export interface MainDep {
    readonly main: Main;
}

interface LocalStorageInitsDep {
    readonly localStorageInits: ReadonlyArray<LocalStorageInit>;
}

type MainDeps = AppDep & LocalStorageInitsDep;

export const createMain =
    (deps: MainDeps): Main =>
    () => {
        for (const localStorageInit of deps.localStorageInits) {
            localStorageInit();
        }

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <deps.App />
            </React.StrictMode>,
        );
    };
