import type { CurrencyCode } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import type { Theme } from '@minimalistic-apps/components';
import { createConnect } from '@minimalistic-apps/connect';
import { createCurrentDateTime } from '@minimalistic-apps/datetime';
import { createLocalStorage } from '@minimalistic-apps/local-storage';
import { createWindow } from '@minimalistic-apps/window';
import { AddCurrencyButtonPure } from './app/AddCurrencyScreen/AddCurrencyButton';
import { AddCurrencyScreenPure } from './app/AddCurrencyScreen/AddCurrencyScreen';
import { AppPure } from './app/App';
import { AppHeaderPure } from './app/AppHeader';
import { type AppLayoutProps, AppLayoutPure } from './app/AppLayout';
import { ConverterScreenPure } from './app/ConverterScreen/ConverterScreen';
import { CurrencyRowPure } from './app/ConverterScreen/CurrencyFiatRow';
import { InputPure } from './app/ConverterScreen/CurrencyInput';
import { RatesLoadingPure } from './app/RatesLoading';
import { MnemonicSettingsPure } from './app/SettingsScreen/MnemonicSettings';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import { ThemeSettingsPure } from './app/SettingsScreen/ThemeSettings';
import { ThemeWrapperPure } from './app/ThemeWrapper';
import { createFetchAndStoreRates } from './converter/fetchAndStoreRates';
import { createRecalculateFromBtc } from './converter/recalculateFromBtc';
import { createRecalculateFromCurrency } from './converter/recalculateFromCurrency';
import { createMain, type Main } from './createMain';
import { createFetchAverageRates } from './rates/fetchAverageRates';
import { createFetchBitpayRates } from './rates/fetchBitpayRates';
import { createFetchBlockchainInfoRates } from './rates/fetchBlockchainInfoRates';
import { createFetchCoingeckoRates } from './rates/fetchCoingeckoRates';
import { createAddCurrency } from './state/addCurrency';
import { createStore } from './state/createStore';
import { createEnsureEvoluOwner } from './state/evolu/createEnsureEvoluOwner';
import { createEnsureEvolu } from './state/evolu/createEvolu';
import { createSubscribableQuery } from './state/evolu/createSubscribableQuery';
import { createGetSelectedCurrencies } from './state/evolu/getSelectedCurrencies';
import { createLoadInitialState } from './state/localStorage/loadInitialState';
import { createPersistStore } from './state/localStorage/persistStore';
import { createStatePersistence } from './state/localStorage/statePersistence';
import { createRemoveCurrency } from './state/removeCurrency';
import type { CurrencyValues, Screen } from './state/State';

export const createCompositionRoot = (): Main => {
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

    // Evolu
    const ensureEvoluOwner = createEnsureEvoluOwner({ store });
    const ensureEvolu = createEnsureEvolu({ ensureEvoluOwner });
    const getSelectedCurrencies = createGetSelectedCurrencies({ ensureEvolu });

    // HACK: We need this to subscribe query, in next Evolu this won't be necessary.
    //       But now, we cannot create static query.
    const { evolu } = ensureEvolu();
    const selectedCurrencies = createSubscribableQuery(
        evolu,
        getSelectedCurrencies.query,
    );

    const connect = createConnect({ store, selectedCurrencies });

    const setTheme = (theme: Theme) => store.setState({ theme });
    const setCurrentScreen = (screen: Screen) =>
        store.setState({ currentScreen: screen });

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

    const window = createWindow();

    const loadInitialState = createLoadInitialState({
        store,
        localStorage,
    });

    const persistStore = createPersistStore({ store, localStorage });

    const statePersistence = createStatePersistence({
        loadInitialState,
        persistStore,
        window: window,
    });

    const fetchAndStoreRates = createFetchAndStoreRates({
        store,
        fetchAverageRates,
        recalculateFromBtc,
        currentDateTime,
    });

    const AddCurrencyButton = () => AddCurrencyButtonPure({ store });

    const CurrencyInput = connect(
        InputPure,
        ({ store }) => ({
            mode: store.mode,
            focusedCurrency: store.focusedCurrency,
        }),
        {
            setFocusedCurrency: (code: CurrencyCode | 'BTC') =>
                store.setState({ focusedCurrency: code }),
        },
    );

    const CurrencyRow = connect(
        CurrencyRowPure,
        ({ store }) => ({
            mode: store.mode,
        }),
        {
            CurrencyInput,
        },
    );

    const RatesLoading = connect(
        RatesLoadingPure,
        ({ store }) => ({
            error: store.error,
            lastUpdated: store.lastUpdated,
        }),
        {
            fetchAndStoreRates,
        },
    );

    const ConverterScreen = connect(
        ConverterScreenPure,
        ({ store }) => ({
            satsAmount: store.satsAmount,
            currencyValues: store.fiatAmounts,
        }),
        {
            recalculateFromBtc,
            recalculateFromCurrency,
            getSelectedCurrencies,
            removeCurrency,
            AddCurrencyButton,
            CurrencyRow,
            RatesLoading,
            setSatsAmount: (satsAmount: AmountSats) =>
                store.setState({ satsAmount }),
            setFiatAmounts: (fiatAmounts: Readonly<CurrencyValues>) =>
                store.setState({ fiatAmounts }),
        },
    );

    const ThemeSettings = connect(
        ThemeSettingsPure,
        ({ store }) => ({ theme: store.theme }),
        {
            setTheme,
        },
    );

    const MnemonicSettings = connect(MnemonicSettingsPure, ({ store }) => ({
        evoluMnemonic: store.evoluMnemonic,
    }));

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeSettings,
            MnemonicSettings,
        });

    const AddCurrencyScreen = connect(
        AddCurrencyScreenPure,
        ({ store }) => ({ rates: store.rates }),
        {
            getSelectedCurrencies,
            addCurrency,
            setCurrentScreen,
        },
    );

    const AppHeader = connect(
        AppHeaderPure,
        ({ store }) => ({
            loading: store.loading,
            mode: store.mode,
        }),
        {
            fetchAndStoreRates,
            setMode: (mode: 'BTC' | 'Sats') => store.setState({ mode }),
            setCurrentScreen,
        },
    );

    const AppLayout = (props: AppLayoutProps) =>
        AppLayoutPure({ AppHeader }, props);

    const ThemeWrapper = connect(ThemeWrapperPure, ({ store }) => ({
        themeMode: store.theme,
    }));

    const App = connect(
        AppPure,
        ({ store }) => ({ currentScreen: store.currentScreen }),
        {
            ConverterScreen,
            AddCurrencyScreen,
            SettingsScreen,
            AppLayout,
            ThemeWrapper,
        },
    );

    return createMain({ App, statePersistence });
};
