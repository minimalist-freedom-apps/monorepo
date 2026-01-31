import type { CurrencyCode } from '../../rates/FetchRates';
import type { State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export interface RemoveCurrencyParams {
    readonly code: CurrencyCode;
}

export type RemoveCurrency = (params: RemoveCurrencyParams) => void;

export interface RemoveCurrencyDep {
    readonly removeCurrency: RemoveCurrency;
}

export interface RemoveCurrencyDeps {
    readonly setState: (partial: Partial<State>) => void;
    readonly getState: () => State;
    readonly saveToLocalStorage: <T>(key: string, value: T) => void;
}

export const createRemoveCurrency =
    (deps: RemoveCurrencyDeps): RemoveCurrency =>
    ({ code }) => {
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
