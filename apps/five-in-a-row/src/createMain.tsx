import React from 'react';
import ReactDOM from 'react-dom/client';
import type { AppDep } from './app/App';

export type Main = () => void;

export interface MainDep {
    readonly main: Main;
}

export const createMain =
    (deps: AppDep): Main =>
    () => {
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <deps.App />
            </React.StrictMode>,
        );
    };
