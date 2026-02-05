import type { AmountSats } from '@minimalistic-apps/bitcoin';
import type {
    ConnectDep as GenericConnectDep,
    SimpleConnectDep as GenericSimpleConnectDep,
    Selector,
    Store,
} from '@minimalistic-apps/mini-store';
import {
    createConnect,
    createStore as createMiniStore,
    createSimpleConnect,
} from '@minimalistic-apps/mini-store';
import { useSyncExternalStore } from 'react';
import { useDeps } from '../ServicesProvider';
import type { State } from './State';

export type StoreDep = { store: Store<State> };
export type ConnectDep = GenericConnectDep<State>;
export type SimpleConnectDep = GenericSimpleConnectDep<State>;

export { createConnect, createSimpleConnect };

export const createStore = (): Store<State> => {
    const initialState: State = {
        rates: {} as never,
        satsAmount: 0 as AmountSats,
        fiatAmounts: {},
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
    const { store } = useDeps();

    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState()),
    );
};

export const selectRates = (state: State) => state.rates;
export const selectSatsAmount = (state: State) => state.satsAmount;
export const selectSelectedFiatCurrenciesAmounts = (state: State) =>
    state.fiatAmounts;
export const selectLoading = (state: State) => state.loading;
export const selectError = (state: State) => state.error;
export const selectLastUpdated = (state: State) => state.lastUpdated;
export const selectMode = (state: State) => state.mode;
export const selectCurrentScreen = (state: State) => state.currentScreen;
export const selectFocusedCurrency = (state: State) => state.focusedCurrency;
export const selectThemeMode = (state: State) => state.theme;
export const selectEvoluMnemonic = (state: State) => state.evoluMnemonic;
