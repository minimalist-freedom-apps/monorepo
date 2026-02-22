import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import type { AppStoreDep } from '../createAppStore';
import { STORAGE_KEYS } from './storageKeys';

type Unsubscribe = () => void;

export type PersistStore = () => Unsubscribe;

export interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

type PersistStoreDeps = LocalStorageDep & AppStoreDep;

export const createPersistStore =
    (deps: PersistStoreDeps): PersistStore =>
    () => {
        const unsubscribe = deps.appStore.subscribe(() => {
            const state = deps.appStore.getState();

            // Best effort persistence - errors are silently ignored
            // since there's no user-facing action to take on storage failure
            deps.localStorage.save(STORAGE_KEYS.RATES, state.rates);
            deps.localStorage.save(STORAGE_KEYS.TIMESTAMP, state.lastUpdated);
            deps.localStorage.save(STORAGE_KEYS.MODE, state.btcMode);
            deps.localStorage.save(STORAGE_KEYS.DEBUG_MODE, state.debugMode);

            if (state.evoluMnemonic !== null) {
                deps.localStorage.save(STORAGE_KEYS.EVOLU_MNEMONIC, state.evoluMnemonic);
            }
        });

        return unsubscribe;
    };
