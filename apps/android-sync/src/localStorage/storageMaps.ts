import { isTheme, type Theme } from '@minimalist-apps/components';
import { parseEvoluRelayUrls } from '@minimalist-apps/evolu';
import type {
    MapLocalStorageToState,
    MapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { AppState } from '../appStore/AppState';

export const localStoragePrefix = 'android-sync-v1';

export const mapStateLocalStorage: MapStateLocalStorage<AppState> = {
    themeMode: state => state.themeMode,
    debugMode: state => String(state.debugMode),
    evoluRelayUrls: state => state.evoluRelayUrls.join('\n'),
};

export const mapLocalStorageToState: MapLocalStorageToState<AppState> = {
    themeMode: value => {
        if (!isTheme(value)) {
            return undefined;
        }

        return value as Theme;
    },
    debugMode: value => value === 'true',
    evoluRelayUrls: value => {
        const result = parseEvoluRelayUrls(value);

        return result.ok ? result.value : undefined;
    },
};
