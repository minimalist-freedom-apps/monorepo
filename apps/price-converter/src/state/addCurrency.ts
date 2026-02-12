import { type CurrencyCode, createIdFromString } from '@evolu/common';
import { satsToBtc } from '@minimalist-apps/bitcoin';
import { generateIndexBetween } from '@minimalist-apps/fractional-indexing';
import { bitcoinToFiat } from '../converter/bitcoinToFiat';
import type { StoreDep } from './createStore';
import type { EnsureEvoluDep } from './evolu/schema';
import type { SelectedCurrency } from './SelectedCurrency/SelectedCurrency';

export interface AddCurrencyParams {
    readonly code: CurrencyCode;
}

export type AddCurrency = (params: AddCurrencyParams) => void;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

export type GetOrderedCurrencies = () => ReadonlyArray<SelectedCurrency>;

interface AddCurrencyDeps {
    readonly getOrderedCurrencies: GetOrderedCurrencies;
}

type AddCurrencyAllDeps = StoreDep & EnsureEvoluDep & AddCurrencyDeps;

export const createAddCurrency =
    (deps: AddCurrencyAllDeps): AddCurrency =>
    ({ code }) => {
        const { fiatAmounts, satsAmount, rates } = deps.store.getState();

        if (rates[code] === undefined) {
            return;
        }

        const btcAmount = satsToBtc(satsAmount);

        // Compute order: place at end of list
        const orderedCurrencies = deps.getOrderedCurrencies();
        const lastItem = orderedCurrencies[orderedCurrencies.length - 1] as
            | SelectedCurrency
            | undefined;
        const lastIndex = lastItem !== undefined ? lastItem.order : null;
        const newOrder = generateIndexBetween(lastIndex, null);

        // Upsert currency into Evolu (will insert if not exists, update if exists)
        const { evolu, shardOwner } = deps.ensureEvolu();
        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
                order: newOrder,
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
