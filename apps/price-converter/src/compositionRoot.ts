import { createCurrentDateTime } from '@minimalistic-apps/datetime';
import { createLocalStorage } from '@minimalistic-apps/local-storage';
import {
    createEnsureEvolu,
    type EnsureEvoluDep,
} from './app/evolu/createEvolu';
import {
    createLoadInitialState,
    type LoadInitialStateDep,
} from './app/localStorage/loadInitialState';
import {
    createPersistStore,
    type PersistStoreDep,
} from './app/localStorage/persistStore';
import {
    createFetchAndStoreRates,
    type FetchAndStoreRatesDep,
} from './converter/fetchAndStoreRates';
import {
    createRecalculateFromBtc,
    type RecalculateFromBtcDep,
} from './converter/recalculateFromBtc';
import {
    createRecalculateFromCurrency,
    type RecalculateFromCurrencyDep,
} from './converter/recalculateFromCurrency';
import { createFetchAverageRates } from './rates/fetchAverageRates';
import { createFetchBitpayRates } from './rates/fetchBitpayRates';
import { createFetchBlockchainInfoRates } from './rates/fetchBlockchainInfoRates';
import { createFetchCoingeckoRates } from './rates/fetchCoingeckoRates';
import { type AddCurrencyDep, createAddCurrency } from './state/addCurrency';
import { createStore, type StoreDep } from './state/createStore';
import {
    createRemoveCurrency,
    type RemoveCurrencyDep,
} from './state/removeCurrency';

export type Services = StoreDep &
    AddCurrencyDep &
    RemoveCurrencyDep &
    RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    LoadInitialStateDep &
    FetchAndStoreRatesDep &
    PersistStoreDep &
    EnsureEvoluDep;

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
    const addCurrency = createAddCurrency({ store });
    const removeCurrency = createRemoveCurrency({ store });
    const recalculateFromBtc = createRecalculateFromBtc({ store });
    const recalculateFromCurrency = createRecalculateFromCurrency({
        store,
        recalculateFromBtc,
    });

    const loadInitialState = createLoadInitialState({
        store,
        localStorage,
    });

    const fetchAndStoreRates = createFetchAndStoreRates({
        store,
        fetchAverageRates,
        recalculateFromBtc,
        currentDateTime,
    });

    const persistStore = createPersistStore({ store, localStorage });

    const ensureEvolu = createEnsureEvolu({ store, localStorage });

    return {
        store,
        addCurrency,
        removeCurrency,
        recalculateFromBtc,
        recalculateFromCurrency,
        loadInitialState,
        fetchAndStoreRates,
        persistStore,
        ensureEvolu,
    };
};
