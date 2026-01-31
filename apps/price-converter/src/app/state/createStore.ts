import { getOrThrow } from '@evolu/common';
import type { Selector, Store } from '@minimalistic-apps/mini-store';
import { createStore as createMiniStore } from '@minimalistic-apps/mini-store';
import { useSyncExternalStore } from 'react';
import { useServices } from '../../ServicesProvider';
import { CurrencyCode } from '../../rates/FetchRates';
import type { State } from './State';

export type StoreDep = Store<State>;

export const createStore = (): Store<State> => {
    const initialState: State = {
        rates: {} as never,
        selectedCurrencies: [getOrThrow(CurrencyCode.from('USD'))],
        btcValue: '',
        currencyValues: {},
        loading: false,
        error: '',
        lastUpdated: null,
        mode: 'BTC',
        showModal: false,
        focusedInput: 'BTC',
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
export const selectSelectedCurrencies = (state: State) =>
    state.selectedCurrencies;
export const selectBtcValue = (state: State) => state.btcValue;
export const selectCurrencyValues = (state: State) => state.currencyValues;
export const selectLoading = (state: State) => state.loading;
export const selectError = (state: State) => state.error;
export const selectLastUpdated = (state: State) => state.lastUpdated;
export const selectMode = (state: State) => state.mode;
export const selectShowModal = (state: State) => state.showModal;
export const selectFocusedInput = (state: State) => state.focusedInput;
