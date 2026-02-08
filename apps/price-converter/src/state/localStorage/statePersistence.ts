import type { WindowServiceDep } from '@minimalistic-apps/window';
import type { LoadInitialStateDep } from './loadInitialState';
import type { PersistStoreDep } from './persistStore';

export interface StatePersistence {
    readonly start: () => () => void;
}

export interface StatePersistenceDep {
    readonly statePersistence: StatePersistence;
}

type StatePersistenceDeps = LoadInitialStateDep & PersistStoreDep & WindowServiceDep;

export const createStatePersistence = (deps: StatePersistenceDeps): StatePersistence => {
    const start = () => {
        deps.loadInitialState();

        const unsubscribe = deps.persistStore();

        const removeBeforeUnloadListener = deps.window.addEventListener(
            'beforeunload',
            unsubscribe,
        );

        return () => {
            removeBeforeUnloadListener();
            unsubscribe();
        };
    };

    return { start };
};
