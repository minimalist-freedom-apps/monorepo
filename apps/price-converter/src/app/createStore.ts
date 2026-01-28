import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalistic-apps/bitcoin';
import {
    formatFiatWithCommas,
    loadFromLocalStorage,
    parseFormattedNumber,
    saveToLocalStorage,
} from '@minimalistic-apps/utils';
import { useSyncExternalStore } from 'react';
import type { CurrencyCode, RatesMap } from '../rates/FetchRates';

const STORAGE_KEYS = {
    RATES: 'rates',
    TIMESTAMP: 'timestamp',
    SELECTED_CURRENCIES: 'selectedCurrencies',
    MODE: 'mode',
} as const;

export type Mode = 'BTC' | 'Sats';

export interface State {
    readonly rates: RatesMap;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
    readonly btcValue: string;
    readonly currencyValues: Readonly<Record<CurrencyCode, string>>;
    readonly loading: boolean;
    readonly error: string;
    readonly lastUpdated: number | null;
    readonly mode: Mode;
    readonly showModal: boolean;
    readonly focusedInput: CurrencyCode | 'BTC';
}

type Listener = () => void;

export interface Store {
    readonly getState: () => State;
    readonly subscribe: (listener: Listener) => () => void;
    readonly setLoading: (loading: boolean) => void;
    readonly setError: (error: string) => void;
    readonly setRates: (rates: RatesMap, timestamp: number) => void;
    readonly setBtcValue: (value: string) => void;
    readonly setCurrencyValues: (
        values: Readonly<Record<CurrencyCode, string>>,
    ) => void;
    readonly setFocusedInput: (input: CurrencyCode | 'BTC') => void;
    readonly setShowModal: (show: boolean) => void;
    readonly addCurrency: (code: CurrencyCode) => void;
    readonly removeCurrency: (code: CurrencyCode) => void;
    readonly toggleMode: () => void;
    readonly recalculateFromBtc: (value: string, rates?: RatesMap) => void;
    readonly recalculateFromCurrency: (
        code: CurrencyCode,
        value: string,
    ) => void;
}

export const createStore = (): Store => {
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

    const setRates = (rates: RatesMap, timestamp: number) => {
        setState({ rates, lastUpdated: timestamp });
        saveToLocalStorage(STORAGE_KEYS.RATES, rates);
        saveToLocalStorage(STORAGE_KEYS.TIMESTAMP, timestamp);
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

    const recalculateFromBtc = (value: string, currentRates?: RatesMap) => {
        const rates = currentRates ?? state.rates;
        const btcAmount = parseFormattedNumber(value);

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            setState({ currencyValues: {} as Record<CurrencyCode, string> });
            return;
        }

        const newValues = state.selectedCurrencies.reduce<
            Record<CurrencyCode, string>
        >(
            (acc, code) => {
                if (rates[code]) {
                    const fiatAmount = btcAmount / rates[code].rate;
                    acc[code] = formatFiatWithCommas(fiatAmount);
                }
                return acc;
            },
            {} as Record<CurrencyCode, string>,
        );
        setState({ currencyValues: newValues });
    };

    const recalculateFromCurrency = (code: CurrencyCode, value: string) => {
        const { rates, selectedCurrencies, mode } = state;
        const fiatAmount = parseFormattedNumber(value);

        if (Number.isNaN(fiatAmount) || fiatAmount === 0 || !rates[code]) {
            setState({
                btcValue: '',
                currencyValues: {} as Record<CurrencyCode, string>,
            });
            return;
        }

        const btcAmount = fiatAmount * rates[code].rate;
        const formattedBtc =
            mode === 'BTC'
                ? formatBtcWithCommas(btcAmount)
                : formatSats(btcToSats(btcAmount));

        const newValues = selectedCurrencies.reduce<
            Record<CurrencyCode, string>
        >(
            (acc, otherCode) => {
                if (otherCode !== code && rates[otherCode]) {
                    const otherFiatAmount = btcAmount / rates[otherCode].rate;
                    acc[otherCode] = formatFiatWithCommas(otherFiatAmount);
                } else if (otherCode === code) {
                    acc[otherCode] = value;
                }
                return acc;
            },
            {} as Record<CurrencyCode, string>,
        );

        setState({ btcValue: formattedBtc, currencyValues: newValues });
    };

    const addCurrency = (code: CurrencyCode) => {
        const { selectedCurrencies, btcValue, mode, rates } = state;

        if (selectedCurrencies.includes(code)) {
            setState({ showModal: false });
            return;
        }

        const newCurrencies = [...selectedCurrencies, code];
        saveToLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES, newCurrencies);

        let newCurrencyValues = { ...state.currencyValues };

        if (btcValue && rates[code]) {
            const btcAmount =
                mode === 'Sats'
                    ? satsToBtc(parseFormattedNumber(btcValue))
                    : parseFormattedNumber(btcValue);

            const fiatAmount = btcAmount / rates[code].rate;
            newCurrencyValues = {
                ...newCurrencyValues,
                [code]: formatFiatWithCommas(fiatAmount),
            };
        }

        setState({
            selectedCurrencies: newCurrencies,
            currencyValues: newCurrencyValues,
            showModal: false,
        });
    };

    const removeCurrency = (code: CurrencyCode) => {
        const newCurrencies = state.selectedCurrencies.filter(c => c !== code);
        saveToLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES, newCurrencies);

        const { [code]: _, ...newValues } = state.currencyValues;
        setState({
            selectedCurrencies: newCurrencies,
            currencyValues: newValues as Record<CurrencyCode, string>,
        });
    };

    const toggleMode = () => {
        const { mode, btcValue } = state;
        const newMode: Mode = mode === 'BTC' ? 'Sats' : 'BTC';
        saveToLocalStorage(STORAGE_KEYS.MODE, newMode);

        let newBtcValue = btcValue;
        if (btcValue) {
            const currentValue = parseFormattedNumber(btcValue);
            if (newMode === 'Sats') {
                const btcAmount =
                    mode === 'BTC' ? currentValue : satsToBtc(currentValue);
                newBtcValue = formatSats(btcToSats(btcAmount));
            } else {
                const btcAmount =
                    mode === 'Sats' ? satsToBtc(currentValue) : currentValue;
                newBtcValue = formatBtcWithCommas(btcAmount);
            }
        }

        setState({ mode: newMode, btcValue: newBtcValue });
    };

    return {
        getState,
        subscribe,
        setLoading,
        setError,
        setRates,
        setBtcValue,
        setCurrencyValues,
        setFocusedInput,
        setShowModal,
        addCurrency,
        removeCurrency,
        toggleMode,
        recalculateFromBtc,
        recalculateFromCurrency,
    };
};

let storeInstance: Store | null = null;

export const getStore = (): Store => {
    if (!storeInstance) {
        storeInstance = createStore();
    }
    return storeInstance;
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
