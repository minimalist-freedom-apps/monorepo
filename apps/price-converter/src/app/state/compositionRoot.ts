import { addCurrency } from './addCurrency';
import { createStore, initializeStore } from './createStore';
import { recalculateFromBtc } from './recalculateFromBtc';
import { recalculateFromCurrency } from './recalculateFromCurrency';
import { removeCurrency } from './removeCurrency';
import { setRates } from './setRates';
import { toggleMode } from './toggleMode';

export const createStoreCompositionRoot = () => {
    const store = createStore({
        setRates,
        addCurrency,
        removeCurrency,
        toggleMode,
        recalculateFromBtc,
        recalculateFromCurrency,
    });

    initializeStore(store);

    return store;
};
