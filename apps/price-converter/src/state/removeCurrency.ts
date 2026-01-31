import type { CurrencyCode } from '@evolu/common';
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
        const { selectedFiatCurrencies, selectedFiatCurrenciesAmounts } =
            deps.store.getState();

        // Drop [code] from selectedFiatCurrenciesAmounts
        const { [code]: _, ...newValues } = selectedFiatCurrenciesAmounts;

        deps.store.setState({
            selectedFiatCurrencies: selectedFiatCurrencies.filter(
                it => it !== code,
            ),
            selectedFiatCurrenciesAmounts: newValues,
        });
    };
