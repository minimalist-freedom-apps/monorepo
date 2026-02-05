import {
    type CurrencyCode,
    createIdFromString,
    sqliteTrue,
} from '@evolu/common';
import type { EvoluDep } from './addCurrency';
import type { StoreDep } from './createStore';

export interface RemoveCurrencyParams {
    readonly code: CurrencyCode;
}

export type RemoveCurrency = (params: RemoveCurrencyParams) => void;

export interface RemoveCurrencyDep {
    readonly removeCurrency: RemoveCurrency;
}

type RemoveCurrencyDeps = StoreDep & EvoluDep;

export const createRemoveCurrency =
    (deps: RemoveCurrencyDeps): RemoveCurrency =>
    ({ code }) => {
        const { fiatAmounts: selectedFiatCurrenciesAmounts } =
            deps.store.getState();

        // Upsert with isDeleted flag
        // If currency doesn't exist, it will be created with isDeleted: true
        // If it exists, it will be marked as deleted
        deps.evolu.upsert('currency', {
            id: createIdFromString<'CurrencyId'>(code),
            currency: code,
            isDeleted: sqliteTrue,
        });

        // Drop [code] from selectedFiatCurrenciesAmounts
        const { [code]: _, ...newValues } = selectedFiatCurrenciesAmounts;

        deps.store.setState({
            fiatAmounts: newValues,
        });
    };
