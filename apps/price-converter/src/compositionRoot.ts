import { createCurrentDateTime } from '@minimalistic-apps/datetime';
import { createLocalStorage } from '@minimalistic-apps/local-storage';
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
import { createEnsureEvoluOwner } from './state/evolu/createEnsureEvoluOwner';
import {
    createEnsureEvolu,
    type EnsureEvoluDep,
} from './state/evolu/createEvolu';
import {
    createGetSelectedCurrencies,
    type GetSelectedCurrenciesDep,
} from './state/evolu/getSelectedCurrencies';
import {
    createLoadInitialState,
    type LoadInitialStateDep,
} from './state/localStorage/loadInitialState';
import {
    createPersistStore,
    type PersistStoreDep,
} from './state/localStorage/persistStore';
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
    EnsureEvoluDep &
    GetSelectedCurrenciesDep;

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
    const ensureEvoluOwner = createEnsureEvoluOwner({ store });
    const ensureEvolu = createEnsureEvolu({ ensureEvoluOwner });
    const getSelectedCurrencies = createGetSelectedCurrencies({ ensureEvolu });
    const addCurrency = createAddCurrency({ store, ensureEvolu });
    const removeCurrency = createRemoveCurrency({ store, ensureEvolu });
    const recalculateFromBtc = createRecalculateFromBtc({
        store,
        getSelectedCurrencies,
    });
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
        getSelectedCurrencies,
    };
};
