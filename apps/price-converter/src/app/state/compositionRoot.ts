import { saveToLocalStorage } from '@minimalistic-apps/utils';
import { createAddCurrency } from './addCurrency';
import { createStore, initializeStore } from './createStore';
import { createRecalculateFromBtc } from './recalculateFromBtc';
import { createRecalculateFromCurrency } from './recalculateFromCurrency';
import { createRemoveCurrency } from './removeCurrency';
import { createSetRates } from './setRates';
import { createToggleMode } from './toggleMode';

export const createStoreCompositionRoot = () => {
    const store = createStore({
        setRates: undefined as never,
        addCurrency: undefined as never,
        removeCurrency: undefined as never,
        toggleMode: undefined as never,
        recalculateFromBtc: undefined as never,
        recalculateFromCurrency: undefined as never,
    });

    const setRates = createSetRates({
        setState: store.setState,
        saveToLocalStorage,
    });

    const addCurrency = createAddCurrency({
        setState: store.setState,
        getState: store.getState,
        saveToLocalStorage,
    });

    const removeCurrency = createRemoveCurrency({
        setState: store.setState,
        getState: store.getState,
        saveToLocalStorage,
    });

    const toggleMode = createToggleMode({
        setState: store.setState,
        getState: store.getState,
        saveToLocalStorage,
    });

    const recalculateFromBtc = createRecalculateFromBtc({
        setState: store.setState,
        getState: store.getState,
    });

    const recalculateFromCurrency = createRecalculateFromCurrency({
        setState: store.setState,
        getState: store.getState,
    });

    const storeWithActions = createStore({
        setRates,
        addCurrency,
        removeCurrency,
        toggleMode,
        recalculateFromBtc,
        recalculateFromCurrency,
    });

    initializeStore(storeWithActions);

    return storeWithActions;
};
