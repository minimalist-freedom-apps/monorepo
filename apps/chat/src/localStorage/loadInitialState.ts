import { isTheme, type Theme } from '@minimalist-apps/components';
import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import type { AppStoreDep } from '../appStore/createAppStore';
import { STORAGE_KEYS } from './storageKeys';

export type LoadInitialState = () => void;

export interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

type LoadInitialStateDeps = AppStoreDep & LocalStorageDep;

export const createLoadInitialState =
    (deps: LoadInitialStateDeps): LoadInitialState =>
    () => {
        const savedThemeResult = deps.localStorage.load<Theme>(STORAGE_KEYS.THEME_MODE);
        const savedDebugModeResult = deps.localStorage.load<boolean>(STORAGE_KEYS.DEBUG_MODE);

        if (savedThemeResult.ok && isTheme(savedThemeResult.value)) {
            deps.store.setState({ themeMode: savedThemeResult.value });
        }

        if (savedDebugModeResult.ok) {
            deps.store.setState({ debugMode: savedDebugModeResult.value ?? false });
        }
    };
