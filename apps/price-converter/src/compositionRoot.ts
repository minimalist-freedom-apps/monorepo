import {
    loadFromLocalStorage,
    saveToLocalStorage,
} from '@minimalistic-apps/utils';
import {
    type FetchAndStoreRatesDep,
    createFetchAndStoreRates,
} from './app/converter/fetchAndStoreRates';
import {
    type RecalculateFromBtcDep,
    createRecalculateFromBtc,
} from './app/converter/recalculateFromBtc';
import {
    type RecalculateFromCurrencyDep,
    createRecalculateFromCurrency,
} from './app/converter/recalculateFromCurrency';
import {
    type AddCurrencyDep,
    createAddCurrency,
} from './app/state/addCurrency';
import { type Store, createStore } from './app/state/createStore';
import {
    type LoadInitialStateDep,
    createLoadInitialState,
} from './app/state/loadInitialState';
import {
    type RemoveCurrencyDep,
    createRemoveCurrency,
} from './app/state/removeCurrency';
import { type SetRatesDep, createSetRates } from './app/state/setRates';
import { type ToggleModeDep, createToggleMode } from './app/state/toggleMode';
import { createFetchAverageRates } from './rates/fetchAverageRates';
import { createFetchBitpayRates } from './rates/fetchBitpayRates';
import { createFetchBlockchainInfoRates } from './rates/fetchBlockchainInfoRates';
import { createFetchCoingeckoRates } from './rates/fetchCoingeckoRates';

export interface StoreDep {
    readonly store: Store;
}

export type Services = StoreDep &
    SetRatesDep &
    AddCurrencyDep &
    RemoveCurrencyDep &
    ToggleModeDep &
    RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    LoadInitialStateDep &
    FetchAndStoreRatesDep;

export const createStoreCompositionRoot = (): Services => {
    const fetchDeps = {
        // Important to be wrapped to preserve the correct `this` context
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            globalThis.fetch(input, init),
    };

    const fetchCoingeckoRates = createFetchCoingeckoRates(fetchDeps);
    const fetchBitpayRates = createFetchBitpayRates(fetchDeps);
    const fetchBlockchainInfoRates = createFetchBlockchainInfoRates(fetchDeps);

    const fetchAverageRates = createFetchAverageRates({
        fetchRates: [
            fetchCoingeckoRates,
            fetchBitpayRates,
            fetchBlockchainInfoRates,
        ],
    });

    const store = createStore();

    const setRates = createSetRates({
        setState: store.setState,
        saveToLocalStorage,
    });

    const addCurrency = createAddCurrency({
        setState: store.setState,
        getState: store.getState,
        saveToLocalStorage,
    });

    const removeCurrency = createRemoveCurrency({
        setState: store.setState,
        getState: store.getState,
        saveToLocalStorage,
    });

    const toggleMode = createToggleMode({
        setState: store.setState,
        getState: store.getState,
        saveToLocalStorage,
    });

    const recalculateFromBtc = createRecalculateFromBtc({
        setState: store.setState,
        getState: store.getState,
    });

    const recalculateFromCurrency = createRecalculateFromCurrency({
        setState: store.setState,
        getState: store.getState,
    });

    const loadInitialState = createLoadInitialState({
        setState: store.setState,
        loadFromLocalStorage,
    });

    const fetchAndStoreRates = createFetchAndStoreRates({
        fetchAverageRates,
        setState: store.setState,
        getState: store.getState,
        setRates,
        recalculateFromBtc,
    });

    return {
        store,
        setRates,
        addCurrency,
        removeCurrency,
        toggleMode,
        recalculateFromBtc,
        recalculateFromCurrency,
        loadInitialState,
        fetchAndStoreRates,
    };
};
