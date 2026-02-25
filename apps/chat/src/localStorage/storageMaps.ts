import { isTheme, type Theme } from '@minimalist-apps/components';
import type {
    MapLocalStorageToState,
    MapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { AppState } from '../appStore/AppState';

export const localStoragePrefix = 'chat-v1';

export const mapStateLocalStorage: MapStateLocalStorage<AppState> = {
    themeMode: state => state.themeMode,
    debugMode: state => String(state.debugMode),
    evoluMnemonic: state => (state.evoluMnemonic === null ? null : state.evoluMnemonic),
};

export const mapLocalStorageToState: MapLocalStorageToState<AppState> = {
    themeMode: value => {
        if (!isTheme(value)) {
            return undefined;
        }

        return value as Theme;
    },
    debugMode: value => value === 'true',
    evoluMnemonic: value => value as AppState['evoluMnemonic'],
};
