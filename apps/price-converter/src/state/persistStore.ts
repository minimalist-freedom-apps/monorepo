import type { Store } from '@minimalistic-apps/mini-store';
import { saveToLocalStorage } from '@minimalistic-apps/utils';
import type { State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export interface PersistStore {
    readonly start: () => () => void;
}

export interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

export interface PersistStoreDeps {
    readonly store: Store<State>;
}

export const createPersistStore = (deps: PersistStoreDeps): PersistStore => {
    const start = () => {
        const unsubscribe = deps.store.subscribe(() => {
            const state = deps.store.getState();

            saveToLocalStorage(STORAGE_KEYS.RATES, state.rates);
            saveToLocalStorage(STORAGE_KEYS.TIMESTAMP, state.lastUpdated);
            saveToLocalStorage(
                STORAGE_KEYS.SELECTED_CURRENCIES,
                state.selectedCurrencies,
            );
            saveToLocalStorage(STORAGE_KEYS.MODE, state.mode);
        });

        return unsubscribe;
    };

    return { start };
};
