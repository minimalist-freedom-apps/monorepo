import type { AmountSats } from '@minimalistic-apps/bitcoin';
import type { Theme } from '@minimalistic-apps/components';
import { createCurrentDateTime } from '@minimalistic-apps/datetime';
import { createLocalStorage } from '@minimalistic-apps/local-storage';
import { createWindow } from '@minimalistic-apps/window';
import { createConnect } from '../../../packages/mini-store/src/connect';
import { createAddCurrencyButton } from './app/AddCurrencyScreen/AddCurrencyButton';
import { createAddCurrencyScreen } from './app/AddCurrencyScreen/AddCurrencyScreen';
import { createApp } from './app/App';
import { createAppHeader } from './app/AppHeader';
import { createAppLayout } from './app/AppLayout';
import { createConverterScreen } from './app/ConverterScreen/ConverterScreen';
import { createCurrencyRow } from './app/ConverterScreen/CurrencyFiatRow';
import { createCurrencyInput } from './app/ConverterScreen/CurrencyInput';
import { createRatesLoading } from './app/RatesLoading';
import { createMnemonicSettings } from './app/SettingsScreen/MnemonicSettings';
import { createSettingsScreen } from './app/SettingsScreen/SettingsScreen';
import { createThemeSettings } from './app/SettingsScreen/ThemeSettings';
import { createThemeWrapper } from './app/ThemeWrapper';
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

    const RatesLoading = createRatesLoading({
        connect: connect(state => ({
            error: state.error,
            lastUpdated: state.lastUpdated,
        })),
        fetchAndStoreRates,
    });

    const ConverterScreen = createConverterScreen({
        connect: connect(state => ({
            satsAmount: state.satsAmount,
            currencyValues: state.fiatAmounts,
        })),
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
    });

    const ThemeSettings = createThemeSettings({
        connect: connect(state => ({ theme: state.theme })),
        setTheme,
    });

    const MnemonicSettings = createMnemonicSettings({
        connect: connect(state => ({ evoluMnemonic: state.evoluMnemonic })),
    });

    const SettingsScreen = createSettingsScreen({
        ThemeSettings,
        MnemonicSettings,
    });

    const AddCurrencyScreen = createAddCurrencyScreen({
        connect: connect(state => ({ rates: state.rates })),
        getSelectedCurrencies,
        addCurrency,
        setCurrentScreen,
    });

    const AppHeader = createAppHeader({
        connect: connect(state => ({
            loading: state.loading,
            mode: state.mode,
        })),
        fetchAndStoreRates,
        setMode: mode => store.setState({ mode }),
        setCurrentScreen,
    });

    const AppLayout = createAppLayout({ AppHeader });

    const ThemeWrapper = createThemeWrapper({
        connect: connect((state, ownProps) => ({
            themeMode: state.theme,
            ...ownProps,
        })),
    });

    const App = createApp({
        connect: connect(state => ({ currentScreen: state.currentScreen })),
        ConverterScreen,
        AddCurrencyScreen,
        SettingsScreen,
        AppLayout,
        ThemeWrapper,
    });

    return createMain({
        App,
        statePersistence,
    });
};
