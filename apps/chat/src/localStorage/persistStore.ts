import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import { selectThemeMode } from '../appStore/AppState';
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
            const themeMode = selectThemeMode(deps.store.getState());
            deps.localStorage.save(STORAGE_KEYS.THEME_MODE, themeMode);
        });

        return () => {
            unsubscribe();
        };
    };
