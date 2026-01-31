import type { LocalStorageDep } from '@minimalistic-apps/local-storage';
import type { StoreDep } from '../../state/createStore';
import { STORAGE_KEYS } from './storageKeys';

export interface PersistStore {
    readonly start: () => () => void;
}

export interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

type PersistStoreDeps = LocalStorageDep & StoreDep;

export const createPersistStore = (deps: PersistStoreDeps): PersistStore => {
    const start = () => {
        const unsubscribe = deps.store.subscribe(() => {
            const state = deps.store.getState();

            // Best effort persistence - errors are silently ignored
            // since there's no user-facing action to take on storage failure
            void deps.localStorage.save(STORAGE_KEYS.RATES, state.rates);
            void deps.localStorage.save(
                STORAGE_KEYS.TIMESTAMP,
                state.lastUpdated,
            );
            void deps.localStorage.save(
                STORAGE_KEYS.SELECTED_CURRENCIES,
                state.selectedCurrencies,
            );
            void deps.localStorage.save(STORAGE_KEYS.MODE, state.mode);
        });

        return unsubscribe;
    };

    return { start };
};
