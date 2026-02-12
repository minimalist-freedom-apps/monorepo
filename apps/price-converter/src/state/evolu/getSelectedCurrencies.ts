import { sqliteTrue } from '@evolu/common';
import type { Subscribable } from '@minimalist-apps/connect';
import { createSubscribableQuery } from '@minimalist-apps/evolu';
import { mapSelectedCurrencyFromEvolu } from '../SelectedCurrency/mapSelectedCurrencyFromEvolu';
import type { SelectedCurrency } from '../SelectedCurrency/SelectedCurrency';
import type { EnsureEvoluDep } from './schema';

export interface GetSelectedCurrencies {
    readonly subscribable: Subscribable<ReadonlyArray<SelectedCurrency>>;
    readonly get: () => Promise<ReadonlyArray<SelectedCurrency>>;
}

type GetSelectedCurrenciesDeps = EnsureEvoluDep;

export interface GetSelectedCurrenciesDep {
    readonly getSelectedCurrencies: GetSelectedCurrencies;
}

export const createGetSelectedCurrencies = (
    deps: GetSelectedCurrenciesDeps,
): GetSelectedCurrencies => {
    const { evolu, shardOwner } = deps.ensureEvolu();
    const query = evolu.createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency', 'order'])
            .where('isDeleted', 'is not', sqliteTrue)
            .where('ownerId', '=', shardOwner.id),
    );

    return {
        subscribable: createSubscribableQuery(deps, query, mapSelectedCurrencyFromEvolu),
        get: async (): Promise<ReadonlyArray<SelectedCurrency>> => {
            const result = await evolu.loadQuery(query);

            return mapSelectedCurrencyFromEvolu(result);
        },
    };
};
