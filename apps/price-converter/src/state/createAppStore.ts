import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { Store } from '@minimalist-apps/mini-store';
import { createStore as createMiniStore } from '@minimalist-apps/mini-store';
import type { State } from './State';

export type AppStoreDep = { appStore: Store<State> };

export const createAppStore = (): Store<State> => {
    const initialState: State = {
        rates: {} as never,
        satsAmount: 0 as AmountSats,
        fiatAmounts: {},
        loading: false,
        error: '',
        lastUpdated: null,
        btcMode: 'btc',
        currentScreen: 'Converter',
        focusedCurrency: null,
        themeMode: 'dark',
        debugMode: false,
        evoluMnemonic: null,
        activeOwnerId: null,
    };

    return createMiniStore(initialState);
};
