import type { CurrencyCode } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
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
import { CurrencyInputPure } from './app/ConverterScreen/CurrencyInput';
import { RatesLoadingPure } from './app/RatesLoading';
import { MnemonicSettingsPure } from './app/SettingsScreen/MnemonicSettings';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import { ThemeSettingsPure } from './app/SettingsScreen/ThemeSettings';
import { ThemeWrapperPure } from './app/ThemeWrapper';
import { createFetchAndStoreRates } from './converter/fetchAndStoreRates';
import { createRecalculateFromBtc } from './converter/recalculateFromBtc';
import { createRecalculateFromCurrency } from './converter/recalculateFromCurrency';
import { createMain, type Main } from './createMain';
import { createFetchRatesCompositionRoot } from './rates/fetchRatesCompositionRoot';
import { createAddCurrency } from './state/addCurrency';
import { createStore } from './state/createStore';
import { createEnsureEvoluOwner } from './state/evolu/createEnsureEvoluOwner';
import { createEnsureEvolu } from './state/evolu/createEvolu';
import { createSubscribableQuery } from './state/evolu/createSubscribableQuery';
import {
    createGetSelectedCurrencies,
    selectCurrencyCodes,
} from './state/evolu/getSelectedCurrencies';
import { createLoadInitialState } from './state/localStorage/loadInitialState';
import { createPersistStore } from './state/localStorage/persistStore';
import { createStatePersistence } from './state/localStorage/statePersistence';
import { createNavigate } from './state/navigate';
import { createRemoveCurrency } from './state/removeCurrency';
import type { CurrencyValues } from './state/State';
import { createSetTheme } from './state/setTheme';

export const createCompositionRoot = (): Main => {
    // Store
    const store = createStore();
    const currentDateTime = createCurrentDateTime();
    const localStorage = createLocalStorage();
    const window = createWindow();

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

    // Converter
    const setTheme = createSetTheme({ store });
    const navigate = createNavigate({ store });

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

    // Fetch Rates
    const fetchRates = createFetchRatesCompositionRoot();

    const fetchAndStoreRates = createFetchAndStoreRates({
        store,
        fetchRates,
        recalculateFromBtc,
        currentDateTime,
    });

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

    // Components
    const AddCurrencyButton = () => AddCurrencyButtonPure({ navigate });

    const CurrencyInput = connect(
        CurrencyInputPure,
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
        ({ store, selectedCurrencies }) => ({
            satsAmount: store.satsAmount,
            currencyValues: store.fiatAmounts,
            selectedCurrencies: selectCurrencyCodes(selectedCurrencies),
        }),
        {
            recalculateFromBtc,
            recalculateFromCurrency,
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
            mode: store.mode,
        }),
        {
            fetchAndStoreRates,
            setMode: (mode: 'BTC' | 'Sats') => store.setState({ mode }),
            navigate,
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
