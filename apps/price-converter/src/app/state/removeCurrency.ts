import type { CurrencyCode } from '../../rates/FetchRates';
import type { State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export const removeCurrency =
    (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) =>
    (code: CurrencyCode) => {
        const { selectedCurrencies, currencyValues } = deps.getState();
        const newCurrencies = selectedCurrencies.filter(c => c !== code);
        deps.saveToLocalStorage(
            STORAGE_KEYS.SELECTED_CURRENCIES,
            newCurrencies,
        );

        const { [code]: _, ...newValues } = currencyValues;
        deps.setState({
            selectedCurrencies: newCurrencies,
            currencyValues: newValues as Record<CurrencyCode, string>,
        });
    };
