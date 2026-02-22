import { Notification } from '@minimalist-apps/components';
import { createConnect } from '@minimalist-apps/connect';
import { CurrencyInputPure } from '@minimalist-apps/currency-input';
import { createCurrentDateTime } from '@minimalist-apps/datetime';
import {
    createDebugFragmentCompositionRoot,
    DebugHeaderPure,
    selectDebugMode,
} from '@minimalist-apps/fragment-debug';
import { createEvoluFragmentCompositionRoot } from '@minimalist-apps/fragment-evolu';
import {
    createThemeFragmentCompositionRoot,
    selectThemeMode,
} from '@minimalist-apps/fragment-theme';
import { createLocalStorage } from '@minimalist-apps/local-storage';
import { createWindow } from '@minimalist-apps/window';
import { createElement } from 'react';
import { AddCurrencyButtonPure } from './app/AddCurrencyScreen/AddCurrencyButton';
import { AddCurrencyScreenPure } from './app/AddCurrencyScreen/AddCurrencyScreen';
import { AppPure } from './app/App';
import { AppHeaderPure } from './app/AppHeader';
import { type AppLayoutProps, AppLayoutPure } from './app/AppLayout';
import { ConverterScreenPure } from './app/ConverterScreen/ConverterScreen';
import { CurrencyRowPure } from './app/ConverterScreen/CurrencyFiatRow';
import { type MoscowTimeOwnProps, MoscowTimePure } from './app/ConverterScreen/MoscowTime';
import { DebugRow } from './app/DebugRow';
import { RatesLoadingPure } from './app/RatesLoading';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import { ThemeWrapperPure } from './app/ThemeWrapper';
import { createChangeBtcAmount } from './converter/changeBtcAmount';
import { createChangeFiatAmount } from './converter/changeFiatAmount';
import { createFetchAndStoreRates } from './converter/fetchAndStoreRates';
import { createRecalculateFromBtc } from './converter/recalculateFromBtc';
import { createRecalculateFromCurrency } from './converter/recalculateFromCurrency';
import { createRemoveCurrency } from './converter/removeCurrency';
import { createReorderCurrency } from './converter/reorderCurrency';
import { createMain, type Main } from './createMain';
import { createFetchRatesCompositionRoot } from './rates/fetchRatesCompositionRoot';
import { createAddCurrency } from './state/addCurrency';
import { createAppStore } from './state/createAppStore';
import { createGetSelectedCurrencies } from './state/evolu/createGetSelectedCurrencies';
import { createSelectedCurrenciesStore } from './state/evolu/createSelectedCurrenciesStore';
import { Schema } from './state/evolu/schema';
import { createLoadInitialState } from './state/localStorage/loadInitialState';
import { createPersistStore } from './state/localStorage/persistStore';
import { createStatePersistence } from './state/localStorage/statePersistence';
import { createNavigate } from './state/navigate';
import { createRemoveFiatAmount } from './state/removeFiatAmount';
import { createSetBtcMode } from './state/setBtcMode';
import { createSetFiatAmount } from './state/setFiatAmount';
import { createSetFocusedCurrency } from './state/setFocusedCurrency';
import { createSetSatsAmount } from './state/setSatsAmount';

export const createCompositionRoot = (): Main => {
    // Low Level
    const window = createWindow();
    const currentDateTime = createCurrentDateTime();
    const localStorage = createLocalStorage();

    // Store
    const appStore = createAppStore();
    const navigate = createNavigate({ appStore });
    const setSatsAmount = createSetSatsAmount({ appStore });
    const setFiatAmount = createSetFiatAmount({ appStore });
    const setFocusedCurrency = createSetFocusedCurrency({ appStore });
    const setBtcMode = createSetBtcMode({ appStore });
    const removeFiatAmount = createRemoveFiatAmount({ appStore });

    // State Persistence
    const loadInitialState = createLoadInitialState({
        appStore,
        localStorage,
    });

    const persistStore = createPersistStore({ appStore, localStorage });

    const statePersistence = createStatePersistence({
        loadInitialState,
        persistStore,
        window: window,
    });

    // Modules
    const connectAppStore = createConnect({ store: appStore });
    const { BackupMnemonic, RestoreMnemonic, ensureEvoluStorage } =
        createEvoluFragmentCompositionRoot({
            connect: connectAppStore,
            store: appStore,
            onOwnerUsed: owner => appStore.setState({ activeOwnerId: owner.id }),
            schema: Schema,
            appName: 'price-converter-v2',
        });

    const selectedCurrenciesStore = createSelectedCurrenciesStore({
        ensureEvoluStorage,
    });

    const getSelectedCurrencies = createGetSelectedCurrencies({ ensureEvoluStorage });

    // App
    const connect = createConnect({ store: appStore, selectedCurrencies: selectedCurrenciesStore });
    const { ThemeModeSettings } = createThemeFragmentCompositionRoot({ connect, store: appStore });
    const { DebugSettings } = createDebugFragmentCompositionRoot({
        connect: connectAppStore,
        store: appStore,
    });

    const DebugHeader = connect(DebugHeaderPure, ({ store }) => ({
        debugMode: selectDebugMode(store),
        children:
            store.activeOwnerId === null
                ? null
                : createElement(DebugRow, { ownerId: store.activeOwnerId }),
    }));

    // Fetch Rates
    const fetchRates = createFetchRatesCompositionRoot();

    const addCurrency = createAddCurrency({
        appStore,
        ensureEvoluStorage,
        getSelectedCurrencies,
    });
    const removeCurrency = createRemoveCurrency({
        ensureEvoluStorage,
        removeFiatAmount,
    });
    const reorderCurrency = createReorderCurrency({
        ensureEvoluStorage,
        getSelectedCurrencies,
    });
    const getSelectedCurrencyCodes = () => selectedCurrenciesStore.getState().map(c => c.code);

    const recalculateFromBtc = createRecalculateFromBtc({
        appStore,
        getSelectedCurrencyCodes,
    });
    const recalculateFromCurrency = createRecalculateFromCurrency({
        appStore,
        recalculateFromBtc,
    });
    const changeFiatAmount = createChangeFiatAmount({
        setFiatAmount,
        recalculateFromCurrency,
    });
    const changeBtcAmount = createChangeBtcAmount({
        setSatsAmount,
        recalculateFromBtc,
    });

    const fetchAndStoreRates = createFetchAndStoreRates({
        appStore,
        fetchRates,
        recalculateFromBtc,
        currentDateTime,
    });

    // Components
    const AddCurrencyButton = () => AddCurrencyButtonPure({ navigate });

    const CurrencyInput = connect(
        CurrencyInputPure,
        ({ store }) => ({
            mode: store.btcMode,
            focusedCurrency: store.focusedCurrency,
        }),
        {
            setFocusedCurrency,
        },
    );

    const MoscowTime = connect(MoscowTimePure, ({ store }, ownProps: MoscowTimeOwnProps) => ({
        btcMode: store.btcMode,
        rateBtcPerFiat: ownProps.code === 'BTC' ? undefined : store.rates[ownProps.code]?.rate,
    }));

    const CurrencyRow = connect(
        CurrencyRowPure,
        ({ store }) => ({
            btcMode: store.btcMode,
        }),
        {
            CurrencyInput,
            MoscowTime,
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
            DebugHeader,
        },
    );

    const ConverterScreen = connect(
        ConverterScreenPure,
        ({ store, selectedCurrencies }) => ({
            satsAmount: store.satsAmount,
            fiatAmounts: store.fiatAmounts,
            selectedCurrencies,
        }),
        {
            // Services
            changeBtcAmount,
            changeFiatAmount,
            removeCurrency,
            reorderCurrency,

            // Components
            AddCurrencyButton,
            CurrencyRow,
            RatesLoading,
        },
    );

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeModeSettings,
            DebugSettings,
            BackupMnemonic,
            RestoreMnemonic,
        });

    const AddCurrencyScreen = connect(
        AddCurrencyScreenPure,
        ({ store, selectedCurrencies }) => ({
            rates: store.rates,
            selectedCurrencies: selectedCurrencies.map(c => c.code),
        }),
        {
            addCurrency,
            navigate,
            notification: Notification,
        },
    );

    const AppHeader = connect(
        AppHeaderPure,
        ({ store }) => ({
            loading: store.loading,
            mode: store.btcMode,
        }),
        {
            fetchAndStoreRates,
            setBtcMode,
            navigate,
            DebugHeader,
        },
    );

    const AppLayout = (props: AppLayoutProps) => AppLayoutPure({ AppHeader }, props);

    const ThemeWrapper = connect(ThemeWrapperPure, ({ store }) => ({
        themeMode: selectThemeMode(store),
    }));

    const App = connect(AppPure, ({ store }) => ({ currentScreen: store.currentScreen }), {
        // Components
        ConverterScreen,
        AddCurrencyScreen,
        SettingsScreen,
        AppLayout,
        ThemeWrapper,
    });

    return createMain({ App, statePersistence });
};
