import {
    loadFromLocalStorage,
    saveToLocalStorage,
} from '@minimalistic-apps/utils';
import { useSyncExternalStore } from 'react';
import type { CurrencyCode, RatesMap } from '../../rates/FetchRates';
import type { Mode, State } from './State';
import { STORAGE_KEYS } from './storageKeys';

type Listener = () => void;

export interface Store {
    readonly getState: () => State;
    readonly subscribe: (listener: Listener) => () => void;
    readonly setState: (partial: Partial<State>) => void;
    readonly setLoading: (loading: boolean) => void;
    readonly setError: (error: string) => void;
    readonly setBtcValue: (value: string) => void;
    readonly setCurrencyValues: (
        values: Readonly<Record<CurrencyCode, string>>,
    ) => void;
    readonly setFocusedInput: (input: CurrencyCode | 'BTC') => void;
    readonly setShowModal: (show: boolean) => void;
    readonly setRates: (rates: RatesMap, timestamp: number) => void;
    readonly addCurrency: (code: CurrencyCode) => void;
    readonly removeCurrency: (code: CurrencyCode) => void;
    readonly toggleMode: () => void;
    readonly recalculateFromBtc: (value: string, rates?: RatesMap) => void;
    readonly recalculateFromCurrency: (
        code: CurrencyCode,
        value: string,
    ) => void;
}

export const createStore = (actions: {
    readonly setRates: (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) => (rates: RatesMap, timestamp: number) => void;
    readonly addCurrency: (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) => (code: CurrencyCode) => void;
    readonly removeCurrency: (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) => (code: CurrencyCode) => void;
    readonly toggleMode: (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) => () => void;
    readonly recalculateFromBtc: (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
    }) => (value: string, rates?: RatesMap) => void;
    readonly recalculateFromCurrency: (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
    }) => (code: CurrencyCode, value: string) => void;
}): Store => {
    const savedRates = loadFromLocalStorage<RatesMap>(STORAGE_KEYS.RATES);
    const savedTimestamp = loadFromLocalStorage<number>(STORAGE_KEYS.TIMESTAMP);
    const savedCurrencies = loadFromLocalStorage<CurrencyCode[]>(
        STORAGE_KEYS.SELECTED_CURRENCIES,
    );
    const savedMode = loadFromLocalStorage<Mode>(STORAGE_KEYS.MODE, 'BTC');

    let state: State = {
        rates: savedRates ?? ({} as RatesMap),
        selectedCurrencies:
            savedCurrencies && savedCurrencies.length > 0
                ? savedCurrencies
                : (['USD' as CurrencyCode] as ReadonlyArray<CurrencyCode>),
        btcValue: '',
        currencyValues: {} as Record<CurrencyCode, string>,
        loading: false,
        error: '',
        lastUpdated: savedTimestamp,
        mode: savedMode ?? 'BTC',
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

    const setLoading = (loading: boolean) => {
        setState({ loading });
    };

    const setError = (error: string) => {
        setState({ error });
    };

    const setBtcValue = (value: string) => {
        setState({ btcValue: value });
    };

    const setCurrencyValues = (
        values: Readonly<Record<CurrencyCode, string>>,
    ) => {
        setState({ currencyValues: values });
    };

    const setFocusedInput = (input: CurrencyCode | 'BTC') => {
        setState({ focusedInput: input });
    };

    const setShowModal = (show: boolean) => {
        setState({ showModal: show });
    };

    return {
        getState,
        subscribe,
        setState,
        setLoading,
        setError,
        setBtcValue,
        setCurrencyValues,
        setFocusedInput,
        setShowModal,
        setRates: actions.setRates({ setState, saveToLocalStorage }),
        addCurrency: actions.addCurrency({
            setState,
            getState,
            saveToLocalStorage,
        }),
        removeCurrency: actions.removeCurrency({
            setState,
            getState,
            saveToLocalStorage,
        }),
        toggleMode: actions.toggleMode({
            setState,
            getState,
            saveToLocalStorage,
        }),
        recalculateFromBtc: actions.recalculateFromBtc({ setState, getState }),
        recalculateFromCurrency: actions.recalculateFromCurrency({
            setState,
            getState,
        }),
    };
};

let storeInstance: Store | null = null;

export const getStore = (): Store => {
    if (!storeInstance) {
        throw new Error('Store not initialized. Call initializeStore first.');
    }
    return storeInstance;
};

export const initializeStore = (store: Store) => {
    storeInstance = store;
};

type Selector<T> = (state: State) => T;

export const useStore = <T>(selector: Selector<T>): T => {
    const store = getStore();
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

export const useStoreActions = () => {
    const store = getStore();

    return {
        setLoading: store.setLoading,
        setError: store.setError,
        setRates: store.setRates,
        setBtcValue: store.setBtcValue,
        setCurrencyValues: store.setCurrencyValues,
        setFocusedInput: store.setFocusedInput,
        setShowModal: store.setShowModal,
        addCurrency: store.addCurrency,
        removeCurrency: store.removeCurrency,
        toggleMode: store.toggleMode,
        recalculateFromBtc: store.recalculateFromBtc,
        recalculateFromCurrency: store.recalculateFromCurrency,
    };
};
