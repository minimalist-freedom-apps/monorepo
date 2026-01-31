import {
    loadFromLocalStorage,
    saveToLocalStorage,
} from '@minimalistic-apps/utils';
import { type AddCurrencyDep, createAddCurrency } from './addCurrency';
import { type Store, createStore } from './createStore';
import {
    type LoadInitialStateDep,
    createLoadInitialState,
} from './loadInitialState';
import {
    type RecalculateFromBtcDep,
    createRecalculateFromBtc,
} from './recalculateFromBtc';
import {
    type RecalculateFromCurrencyDep,
    createRecalculateFromCurrency,
} from './recalculateFromCurrency';
import { type RemoveCurrencyDep, createRemoveCurrency } from './removeCurrency';
import { type SetRatesDep, createSetRates } from './setRates';
import { type ToggleModeDep, createToggleMode } from './toggleMode';

export interface StoreDep {
    readonly store: Store;
}

export type Services = StoreDep &
    SetRatesDep &
    AddCurrencyDep &
    RemoveCurrencyDep &
    ToggleModeDep &
    RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    LoadInitialStateDep;

export const createStoreCompositionRoot = (): Services => {
    const store = createStore();

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

    const loadInitialState = createLoadInitialState({
        setState: store.setState,
        loadFromLocalStorage,
    });

    return {
        store,
        setRates,
        addCurrency,
        removeCurrency,
        toggleMode,
        recalculateFromBtc,
        recalculateFromCurrency,
        loadInitialState,
    };
};
