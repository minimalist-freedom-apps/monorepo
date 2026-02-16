import { type CurrencyCode, createIdFromString, err, ok, type Result } from '@evolu/common';
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

export type AddCurrencyUpdateErrorType = { type: 'AddCurrencyUpdateError'; caused: unknown };
export const AddCurrencyUpdateError = ({
    caused,
}: {
    caused: unknown;
}): AddCurrencyUpdateErrorType => ({
    type: 'AddCurrencyUpdateError',
    caused,
});

export type AddCurrency = (
    params: AddCurrencyParams,
) => Promise<Result<void, AddCurrencyUpdateErrorType>>;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

export const createAddCurrency =
    (deps: AddCurrencyAllDeps): AddCurrency =>
    async ({ code }) => {
        const { fiatAmounts, satsAmount, rates } = deps.store.getState();

        if (rates[code] === undefined) {
            return ok();
        }

        const btcAmount = satsToBtc(satsAmount);

        // Compute order: place at end of list
        const orderedCurrencies = await deps.getSelectedCurrencies();
        const lastItem = orderedCurrencies[orderedCurrencies.length - 1] as
            | SelectedCurrency
            | undefined;
        const lastIndex = lastItem !== undefined ? lastItem.order : null;
        const newOrder = generateIndexBetween(lastIndex, null);

        const { evolu, shardOwner } = await deps.ensureEvoluStorage();

        const result = evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
                order: newOrder,
                isDeleted: 0,
            },
            { ownerId: shardOwner.id },
        );

        if (!result.ok) {
            return err(AddCurrencyUpdateError({ caused: result.error }));
        }

        deps.store.setState({
            fiatAmounts: {
                ...fiatAmounts,
                [code]: bitcoinToFiat(btcAmount, rates[code].rate),
            },
        });

        return ok();
    };
