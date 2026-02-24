import { Mnemonic } from '@evolu/common';
import type { Store } from '@minimalist-apps/mini-store';
import { createStore as createMiniStore } from '@minimalist-apps/mini-store';
import type { AppState } from './AppState';

export type AppStoreDep = { readonly store: Store<AppState> };

const SHARED_CHAT_MNEMONIC = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);

export const createAppStore = (): Store<AppState> => {
    const initialState: AppState = {
        themeMode: 'dark',
        currentScreen: 'Chat',
        debugMode: false,
        evoluMnemonic: SHARED_CHAT_MNEMONIC,
        activeOwnerId: null,
    };

    return createMiniStore(initialState);
};
