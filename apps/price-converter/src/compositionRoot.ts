import type { Theme } from '@minimalistic-apps/components';
import { createCurrentDateTime } from '@minimalistic-apps/datetime';
import { createLocalStorage } from '@minimalistic-apps/local-storage';
import { createConnect } from '../../../packages/mini-store/src/connect';
import {
    type AddCurrencyButtonDep,
    createAddCurrencyButton,
} from './app/AddCurrencyScreen/AddCurrencyButton';
import {
    type ConverterScreenDep,
    createConverterScreen,
} from './app/ConverterScreen/ConverterScreen';
import { createCurrencyRow } from './app/ConverterScreen/CurrencyFiatRow';
import { createCurrencyInput } from './app/ConverterScreen/CurrencyInput';
import {
    createSettingsScreen,
    type SettingsScreenDep,
} from './app/SettingsScreen/SettingsScreen';
import { createThemeSettings } from './app/SettingsScreen/ThemeSettings';
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
import { createStore } from './state/createStore';
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

export type Deps = AddCurrencyDep &
    RemoveCurrencyDep &
    RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    LoadInitialStateDep &
    FetchAndStoreRatesDep &
    PersistStoreDep &
    EnsureEvoluDep &
    GetSelectedCurrenciesDep &
    AddCurrencyButtonDep &
    ConverterScreenDep &
    SettingsScreenDep;

export const createCompositionRoot = (): Deps => {
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

    const connect = createConnect(store);
    const setTheme = (theme: Theme) => store.setState({ theme });

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

    const AddCurrencyButton = createAddCurrencyButton({ store });

    const CurrencyInput = createCurrencyInput({
        connect: connect((state, ownProps) => ({
            mode: state.mode,
            focusedCurrency: state.focusedCurrency,
            ...ownProps,
        })),
        setFocusedCurrency: code => store.setState({ focusedCurrency: code }),
    });

    const CurrencyRow = createCurrencyRow({
        connect: connect((state, ownProps) => ({
            mode: state.mode,
            ...ownProps,
        })),
        CurrencyInput,
    });

    const ConverterScreen = createConverterScreen({
        store,
        recalculateFromBtc,
        recalculateFromCurrency,
        getSelectedCurrencies,
        removeCurrency,
        AddCurrencyButton,
        CurrencyRow,
    });

    const ThemeSettings = createThemeSettings({
        connect: connect(state => ({ theme: state.theme })),
        setTheme,
    });
    const SettingsScreen = createSettingsScreen({ ThemeSettings });

    return {
        addCurrency,
        removeCurrency,
        recalculateFromBtc,
        recalculateFromCurrency,
        loadInitialState,
        fetchAndStoreRates,
        persistStore,
        ensureEvolu,
        getSelectedCurrencies,
        AddCurrencyButton,
        ConverterScreen,
        SettingsScreen,
    };
};
