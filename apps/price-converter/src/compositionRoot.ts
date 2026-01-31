import type { Store } from '@minimalistic-apps/mini-store';
import { loadFromLocalStorage } from '@minimalistic-apps/utils';
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
import type { State } from './app/state/State';
import {
    type AddCurrencyDep,
    createAddCurrency,
} from './app/state/addCurrency';
import { createStore } from './app/state/createStore';
import {
    type LoadInitialStateDep,
    createLoadInitialState,
} from './app/state/loadInitialState';
import {
    type PersistStoreDep,
    createPersistStore,
} from './app/state/persistStore';
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
    readonly store: Store<State>;
}

export type Services = StoreDep &
    SetRatesDep &
    AddCurrencyDep &
    RemoveCurrencyDep &
    ToggleModeDep &
    RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    LoadInitialStateDep &
    FetchAndStoreRatesDep &
    PersistStoreDep;

export const createCompositionRoot = (): Services => {
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
    const setRates = createSetRates({ store });
    const addCurrency = createAddCurrency({ store });
    const removeCurrency = createRemoveCurrency({ store });
    const toggleMode = createToggleMode({ store });
    const recalculateFromBtc = createRecalculateFromBtc({ store });
    const recalculateFromCurrency = createRecalculateFromCurrency({ store });

    const loadInitialState = createLoadInitialState({
        store,
        loadFromLocalStorage,
    });

    const fetchAndStoreRates = createFetchAndStoreRates({
        store,
        fetchAverageRates,
        setRates,
        recalculateFromBtc,
    });

    const persistStore = createPersistStore({ store });

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
        persistStore,
    };
};
