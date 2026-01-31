import { useSyncExternalStore } from 'react';
import { CurrencyCode } from '../../rates/FetchRates';
import type { State } from './State';
import { useServices } from './ServicesProvider';
import { getOrThrow } from '@evolu/common';

type Listener = () => void;

export interface Store {
    readonly getState: () => State;
    readonly subscribe: (listener: Listener) => () => void;
    readonly setState: (partial: Partial<State>) => void;
}

export const createStore = (): Store => {
    let state: State = {
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

    const listeners = new Set<Listener>();

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    const setState = (partial: Partial<State>) => {
        state = { ...state, ...partial };
        notify();
    };

    const getState = () => state;

    const subscribe = (listener: Listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    return {
        getState,
        subscribe,
        setState,
    };
};

type Selector<T> = (state: State) => T;

export const useStore = <T>(selector: Selector<T>): T => {
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
