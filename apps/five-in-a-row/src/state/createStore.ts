import type { Store } from '@minimalist-apps/mini-store';
import { createStore as createMiniStore } from '@minimalist-apps/mini-store';
import type { State } from './State';

export type StoreDep = { readonly store: Store<State> };

export const createStore = (): Store<State> => {
    const initialState: State = {
        themeMode: 'dark',
        currentScreen: 'Game',
    };

    return createMiniStore(initialState);
};
