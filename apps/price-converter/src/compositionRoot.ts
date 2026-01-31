import { createCurrentDateTime } from '@minimalistic-apps/datetime';
import { createLocalStorage } from '@minimalistic-apps/local-storage';
import {
    type LoadInitialStateDep,
    createLoadInitialState,
} from './app/localStorage/loadInitialState';
import {
    type PersistStoreDep,
    createPersistStore,
} from './app/localStorage/persistStore';
import {
    type FetchAndStoreRatesDep,
    createFetchAndStoreRates,
} from './converter/fetchAndStoreRates';
import {
    type RecalculateFromBtcDep,
    createRecalculateFromBtc,
} from './converter/recalculateFromBtc';
import {
    type RecalculateFromCurrencyDep,
    createRecalculateFromCurrency,
} from './converter/recalculateFromCurrency';
import { createFetchAverageRates } from './rates/fetchAverageRates';
import { createFetchBitpayRates } from './rates/fetchBitpayRates';
import { createFetchBlockchainInfoRates } from './rates/fetchBlockchainInfoRates';
import { createFetchCoingeckoRates } from './rates/fetchCoingeckoRates';
import { type AddCurrencyDep, createAddCurrency } from './state/addCurrency';
import { type StoreDep, createStore } from './state/createStore';
import {
    type RemoveCurrencyDep,
    createRemoveCurrency,
} from './state/removeCurrency';
import { type SetRatesDep, createSetRates } from './state/setRates';
import { type ToggleModeDep, createToggleMode } from './state/toggleMode';

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

    const currentDateTime = createCurrentDateTime();
    const localStorage = createLocalStorage();

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
        localStorage,
    });

    const fetchAndStoreRates = createFetchAndStoreRates({
        store,
        fetchAverageRates,
        setRates,
        recalculateFromBtc,
        currentDateTime,
    });

    const persistStore = createPersistStore({ store, localStorage });

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
