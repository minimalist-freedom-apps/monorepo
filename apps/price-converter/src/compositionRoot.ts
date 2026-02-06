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

    const connect = createConnect(store);
    const setTheme = (theme: Theme) => store.setState({ theme });
    const setCurrentScreen = (screen: Screen) =>
        store.setState({ currentScreen: screen });

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
        state => ({
            mode: state.mode,
            focusedCurrency: state.focusedCurrency,
        }),
        {
            setFocusedCurrency: (code: CurrencyCode | 'BTC') =>
                store.setState({ focusedCurrency: code }),
        },
    );

    const CurrencyRow = connect(
        CurrencyRowPure,
        state => ({
            mode: state.mode,
        }),
        {
            CurrencyInput,
        },
    );

    const RatesLoading = connect(
        RatesLoadingPure,
        state => ({
            error: state.error,
            lastUpdated: state.lastUpdated,
        }),
        {
            fetchAndStoreRates,
        },
    );

    const ConverterScreen = connect(
        ConverterScreenPure,
        state => ({
            satsAmount: state.satsAmount,
            currencyValues: state.fiatAmounts,
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
        state => ({ theme: state.theme }),
        {
            setTheme,
        },
    );

    const MnemonicSettings = connect(MnemonicSettingsPure, state => ({
        evoluMnemonic: state.evoluMnemonic,
    }));

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeSettings,
            MnemonicSettings,
        });

    const AddCurrencyScreen = connect(
        AddCurrencyScreenPure,
        state => ({ rates: state.rates }),
        {
            getSelectedCurrencies,
            addCurrency,
            setCurrentScreen,
        },
    );

    const AppHeader = connect(
        AppHeaderPure,
        state => ({
            loading: state.loading,
            mode: state.mode,
        }),
        {
            fetchAndStoreRates,
            setMode: (mode: 'BTC' | 'Sats') => store.setState({ mode }),
            setCurrentScreen,
        },
    );

    const AppLayout = (props: AppLayoutProps) =>
        AppLayoutPure({ AppHeader }, props);

    const ThemeWrapper = connect(ThemeWrapperPure, state => ({
        themeMode: state.theme,
    }));

    const App = connect(
        AppPure,
        state => ({ currentScreen: state.currentScreen }),
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
