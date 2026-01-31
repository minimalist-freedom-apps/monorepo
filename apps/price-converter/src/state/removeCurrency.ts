import type { CurrencyCode } from '../rates/FetchRates';
import type { StoreDep } from './createStore';

export interface RemoveCurrencyParams {
    readonly code: CurrencyCode;
}

export type RemoveCurrency = (params: RemoveCurrencyParams) => void;

export interface RemoveCurrencyDep {
    readonly removeCurrency: RemoveCurrency;
}

type RemoveCurrencyDeps = StoreDep;

export const createRemoveCurrency =
    (deps: RemoveCurrencyDeps): RemoveCurrency =>
    ({ code }) => {
        const { selectedCurrencies, currencyValues } = deps.store.getState();

        const newCurrencies = selectedCurrencies.filter(c => c !== code);

        const { [code]: _, ...newValues } = currencyValues;

        deps.store.setState({
            selectedCurrencies: newCurrencies,
            currencyValues: newValues,
        });
    };
