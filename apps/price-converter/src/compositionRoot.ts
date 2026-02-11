import { createConnect } from '@minimalist-apps/connect';
import { createCurrentDateTime } from '@minimalist-apps/datetime';
import {
    createEnsureEvolu,
    createEnsureEvoluOwner,
    createSubscribableQuery,
} from '@minimalist-apps/evolu';
import { createLocalStorage } from '@minimalist-apps/local-storage';
import { createWindow } from '@minimalist-apps/window';
import { AddCurrencyButtonPure } from './app/AddCurrencyScreen/AddCurrencyButton';
import { AddCurrencyScreenPure } from './app/AddCurrencyScreen/AddCurrencyScreen';
import { AppPure } from './app/App';
import { AppHeaderPure } from './app/AppHeader';
import { type AppLayoutProps, AppLayoutPure } from './app/AppLayout';
import { ConverterScreenPure } from './app/ConverterScreen/ConverterScreen';
import { CurrencyRowPure } from './app/ConverterScreen/CurrencyFiatRow';
import { CurrencyInputPure } from './app/ConverterScreen/CurrencyInput';
import { RatesLoadingPure } from './app/RatesLoading';
import { MnemonicSettingsPure } from './app/SettingsScreen/MnemonicSettings';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import { ThemeSettingsPure } from './app/SettingsScreen/ThemeSettings';
import { ThemeWrapperPure } from './app/ThemeWrapper';
import { createChangeBtcAmount } from './converter/changeBtcAmount';
import { createChangeFiatAmount } from './converter/changeFiatAmount';
import { createFetchAndStoreRates } from './converter/fetchAndStoreRates';
import { createRecalculateFromBtc } from './converter/recalculateFromBtc';
import { createRecalculateFromCurrency } from './converter/recalculateFromCurrency';
import { createRemoveCurrency } from './converter/removeCurrency';
import { createMain, type Main } from './createMain';
import { createFetchRatesCompositionRoot } from './rates/fetchRatesCompositionRoot';
import { createAddCurrency } from './state/addCurrency';
import { createStore } from './state/createStore';
import {
    createGetSelectedCurrencies,
    selectCurrencyCodes,
} from './state/evolu/getSelectedCurrencies';
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
import { createSetTheme } from './state/setTheme';

export const createCompositionRoot = (): Main => {
    // Low Level
    const window = createWindow();
    const currentDateTime = createCurrentDateTime();
    const localStorage = createLocalStorage();

    // Store
    const store = createStore();
    const setTheme = createSetTheme({ store });
    const navigate = createNavigate({ store });
    const setSatsAmount = createSetSatsAmount({ store });
    const setFiatAmount = createSetFiatAmount({ store });
    const setFocusedCurrency = createSetFocusedCurrency({ store });
    const setBtcMode = createSetBtcMode({ store });
    const removeFiatAmount = createRemoveFiatAmount({ store });

    // State Persistence
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

    // Evolu
    const ensureEvoluOwner = createEnsureEvoluOwner({ store });
    const ensureEvolu = createEnsureEvolu({
        deps: { ensureEvoluOwner },
        schema: Schema,
        appName: 'price-converter',
        shardPath: ['minimalist-apps', 'price-converter'],
    });
    const getSelectedCurrencies = createGetSelectedCurrencies({ ensureEvolu });

    // HACK: We need this to subscribe query, in next Evolu this won't be necessary.
    //       But now, we cannot create static query.
    const { evolu } = ensureEvolu();
    const selectedCurrencies = createSubscribableQuery(evolu, getSelectedCurrencies.query);

    const connect = createConnect({ store, selectedCurrencies });

    // Fetch Rates
    const fetchRates = createFetchRatesCompositionRoot();

    // Converter - This is juicy business logic
    const addCurrency = createAddCurrency({ store, ensureEvolu });
    const removeCurrency = createRemoveCurrency({
        ensureEvolu,
        removeFiatAmount,
    });
    const getSelectedCurrencyCodes = () => selectCurrencyCodes(selectedCurrencies.getState());

    const recalculateFromBtc = createRecalculateFromBtc({
        store,
        getSelectedCurrencyCodes,
    });
    const recalculateFromCurrency = createRecalculateFromCurrency({
        store,
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
        store,
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

    const CurrencyRow = connect(
        CurrencyRowPure,
        ({ store }) => ({
            btcMode: store.btcMode,
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
        ({ store, selectedCurrencies }) => ({
            satsAmount: store.satsAmount,
            fiatAmounts: store.fiatAmounts,
            selectedCurrencies: selectCurrencyCodes(selectedCurrencies),
        }),
        {
            // Services
            changeBtcAmount,
            changeFiatAmount,
            removeCurrency,

            // Components
            AddCurrencyButton,
            CurrencyRow,
            RatesLoading,
        },
    );

    const ThemeSettings = connect(ThemeSettingsPure, ({ store }) => ({ theme: store.theme }), {
        setTheme,
    });

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
        ({ store, selectedCurrencies }) => ({
            rates: store.rates,
            selectedCurrencies: selectCurrencyCodes(selectedCurrencies),
        }),
        {
            addCurrency,
            navigate,
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
        },
    );

    const AppLayout = (props: AppLayoutProps) => AppLayoutPure({ AppHeader }, props);

    const ThemeWrapper = connect(ThemeWrapperPure, ({ store }) => ({
        themeMode: store.theme,
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
