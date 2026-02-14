import { type CurrencyCode, createIdFromString } from '@evolu/common';
import { satsToBtc } from '@minimalist-apps/bitcoin';
import { generateIndexBetween } from '@minimalist-apps/fractional-indexing';
import { bitcoinToFiat } from '../converter/bitcoinToFiat';
import type { StoreDep } from './createStore';
import type { GetSelectedCurrenciesDep } from './evolu/createGetSelectedCurrencies';
import type { EnsureEvoluStorageDep } from './evolu/schema';
import type { SelectedCurrency } from './SelectedCurrency/SelectedCurrency';

type AddCurrencyAllDeps = StoreDep & EnsureEvoluStorageDep & GetSelectedCurrenciesDep;

export interface AddCurrencyParams {
    readonly code: CurrencyCode;
}

export type AddCurrency = (params: AddCurrencyParams) => Promise<void>;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

export const createAddCurrency =
    (deps: AddCurrencyAllDeps): AddCurrency =>
    async ({ code }) => {
        const { fiatAmounts, satsAmount, rates } = deps.store.getState();

        if (rates[code] === undefined) {
            return;
        }

        const btcAmount = satsToBtc(satsAmount);

        // Compute order: place at end of list
        const orderedCurrencies = await deps.getSelectedCurrencies();
        const lastItem = orderedCurrencies[orderedCurrencies.length - 1] as
            | SelectedCurrency
            | undefined;
        const lastIndex = lastItem !== undefined ? lastItem.order : null;
        const newOrder = generateIndexBetween(lastIndex, null);

        // Upsert currency into Evolu (will insert if not exists, update if exists)
        const { evolu, shardOwner } = deps.ensureEvoluStorage();
        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
                order: newOrder,
                isDeleted: 0,
            },
            { ownerId: shardOwner.id },
        );

        deps.store.setState({
            fiatAmounts: {
                ...fiatAmounts,
                [code]: bitcoinToFiat(btcAmount, rates[code].rate),
            },
        });
    };
