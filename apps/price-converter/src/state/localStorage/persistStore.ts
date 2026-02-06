import type { LocalStorageDep } from '@minimalistic-apps/local-storage';
import type { StoreDep } from '../../state/createStore';
import { STORAGE_KEYS } from './storageKeys';

type Unsubscribe = () => void;

export type PersistStore = () => Unsubscribe;

export interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

type PersistStoreDeps = LocalStorageDep & StoreDep;

export const createPersistStore =
    (deps: PersistStoreDeps): PersistStore =>
    () => {
        const unsubscribe = deps.store.subscribe(() => {
            const state = deps.store.getState();

            // Best effort persistence - errors are silently ignored
            // since there's no user-facing action to take on storage failure
            deps.localStorage.save(STORAGE_KEYS.RATES, state.rates);
            deps.localStorage.save(STORAGE_KEYS.TIMESTAMP, state.lastUpdated);
            deps.localStorage.save(STORAGE_KEYS.MODE, state.mode);

            if (state.evoluMnemonic !== null) {
                deps.localStorage.save(
                    STORAGE_KEYS.EVOLU_MNEMONIC,
                    state.evoluMnemonic,
                );
            }
        });

        return unsubscribe;
    };
