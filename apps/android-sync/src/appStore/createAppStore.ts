import type { Store } from '@minimalist-apps/mini-store';
import { createStore as createMiniStore } from '@minimalist-apps/mini-store';
import type { AppState } from './AppState';

export type AppStoreDep = { readonly store: Store<AppState> };

export const createAppStore = (): Store<AppState> => {
    const initialState: AppState = {
        themeMode: 'dark',
        currentScreen: 'Home',
        debugMode: false,
        evoluMnemonic: null,
        activeOwnerId: null,
    };

    return createMiniStore(initialState);
};
