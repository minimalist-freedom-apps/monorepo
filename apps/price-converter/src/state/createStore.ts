import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { Store } from '@minimalist-apps/mini-store';
import { createStore as createMiniStore } from '@minimalist-apps/mini-store';
import type { State } from './State';

export type StoreDep = { store: Store<State> };

export const createStore = (): Store<State> => {
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
        theme: 'dark',
        evoluMnemonic: null,
    };

    return createMiniStore(initialState);
};

export const selectRates = (state: State) => state.rates;
export const selectSatsAmount = (state: State) => state.satsAmount;
export const selectSelectedFiatCurrenciesAmounts = (state: State) => state.fiatAmounts;
export const selectLoading = (state: State) => state.loading;
export const selectError = (state: State) => state.error;
export const selectLastUpdated = (state: State) => state.lastUpdated;
export const selectBtcMode = (state: State) => state.btcMode;
export const selectCurrentScreen = (state: State) => state.currentScreen;
export const selectFocusedCurrency = (state: State) => state.focusedCurrency;
export const selectThemeMode = (state: State) => state.theme;
export const selectEvoluMnemonic = (state: State) => state.evoluMnemonic;
