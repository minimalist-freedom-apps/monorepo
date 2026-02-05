import {
    type CurrencyCode,
    createIdFromString,
    sqliteTrue,
} from '@evolu/common';
import type { StoreDep } from './createStore';
import type { EnsureEvoluDep } from './evolu/createEvolu';

export interface RemoveCurrencyParams {
    readonly code: CurrencyCode;
}

export type RemoveCurrency = (params: RemoveCurrencyParams) => void;

export interface RemoveCurrencyDep {
    readonly removeCurrency: RemoveCurrency;
}

type RemoveCurrencyDeps = StoreDep & EnsureEvoluDep;

export const createRemoveCurrency =
    (deps: RemoveCurrencyDeps): RemoveCurrency =>
    ({ code }) => {
        const { fiatAmounts } = deps.store.getState();

        const { evolu, shardOwner } = deps.ensureEvolu();
        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
                isDeleted: sqliteTrue,
            },
            { ownerId: shardOwner.id },
        );

        // Drop [code] from selectedFiatCurrenciesAmounts
        const { [code]: _, ...newFiatAmounts } = fiatAmounts;

        deps.store.setState({
            fiatAmounts: newFiatAmounts,
        });
    };
