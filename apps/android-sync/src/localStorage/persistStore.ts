import { selectThemeMode } from '@minimalist-apps/fragment-theme';
import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import type { AppStoreDep } from '../appStore/createAppStore';
import { STORAGE_KEYS } from './storageKeys';

type Unsubscribe = () => void;

export type PersistStore = () => Unsubscribe;

export interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

type PersistStoreDeps = AppStoreDep & LocalStorageDep;

export const createPersistStore =
    (deps: PersistStoreDeps): PersistStore =>
    () => {
        const unsubscribe = deps.store.subscribe(() => {
            const state = deps.store.getState();
            const themeMode = selectThemeMode(deps.store.getState());

            deps.localStorage.save(STORAGE_KEYS.THEME_MODE, themeMode);
            deps.localStorage.save(STORAGE_KEYS.DEBUG_MODE, state.debugMode);

            if (state.evoluMnemonic !== null) {
                deps.localStorage.save(STORAGE_KEYS.EVOLU_MNEMONIC, state.evoluMnemonic);
            }
        });

        return () => {
            unsubscribe();
        };
    };
