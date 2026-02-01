import { CurrencyCode, getOrThrow } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import type { Selector, Store } from '@minimalistic-apps/mini-store';
import { createStore as createMiniStore } from '@minimalistic-apps/mini-store';
import { useSyncExternalStore } from 'react';
import { useServices } from '../ServicesProvider';
import type { State } from './State';

export type StoreDep = { store: Store<State> };

export const createStore = (): Store<State> => {
    const initialState: State = {
        rates: {} as never,
        selectedFiatCurrencies: [getOrThrow(CurrencyCode.from('USD'))],
        satsAmount: 0 as AmountSats,
        selectedFiatCurrenciesAmounts: {},
        loading: false,
        error: '',
        lastUpdated: null,
        mode: 'BTC',
        currentScreen: 'Converter',
        focusedCurrency: null,
        theme: 'dark',
        evoluMnemonic: null,
    };

    return createMiniStore(initialState);
};

export const useStore = <T>(selector: Selector<State, T>): T => {
    const { store } = useServices();

    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState()),
    );
};

export const selectRates = (state: State) => state.rates;
export const selectSelectedFiatCurrencies = (state: State) =>
    state.selectedFiatCurrencies;
export const selectSatsAmount = (state: State) => state.satsAmount;
export const selectSelectedFiatCurrenciesAmounts = (state: State) =>
    state.selectedFiatCurrenciesAmounts;
export const selectLoading = (state: State) => state.loading;
export const selectError = (state: State) => state.error;
export const selectLastUpdated = (state: State) => state.lastUpdated;
export const selectMode = (state: State) => state.mode;
export const selectCurrentScreen = (state: State) => state.currentScreen;
export const selectFocusedCurrency = (state: State) => state.focusedCurrency;
export const selectThemeMode = (state: State) => state.theme;
export const selectEvoluMnemonic = (state: State) => state.evoluMnemonic;
