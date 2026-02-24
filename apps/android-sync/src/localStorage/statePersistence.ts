import type { LoadInitialStateDep } from './loadInitialState';
import type { PersistStoreDep } from './persistStore';

export interface StatePersistence {
    readonly start: () => () => void;
}

export interface StatePersistenceDep {
    readonly statePersistence: StatePersistence;
}

type StatePersistenceDeps = LoadInitialStateDep & PersistStoreDep;

export const createStatePersistence = (deps: StatePersistenceDeps): StatePersistence => {
    const start = () => {
        deps.loadInitialState();

        const unsubscribe = deps.persistStore();

        return () => {
            unsubscribe();
        };
    };

    return { start };
};
