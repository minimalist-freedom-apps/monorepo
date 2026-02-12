import type { Subscribable } from '@minimalist-apps/connect';
import { createSubscribableQuery } from '@minimalist-apps/evolu';
import { mapSelectedCurrencyFromEvolu } from '../SelectedCurrency/mapSelectedCurrencyFromEvolu';
import type { SelectedCurrency } from '../SelectedCurrency/SelectedCurrency';
import { allSelectedCurrenciesQuery } from './allSelectedCurrenciesQuery';
import type { EnsureEvoluDep } from './schema';

export interface GetSelectedCurrencies {
    readonly subscribable: Subscribable<ReadonlyArray<SelectedCurrency>>;
    readonly getState: () => ReadonlyArray<SelectedCurrency>;
    readonly get: () => Promise<ReadonlyArray<SelectedCurrency>>;
}

type GetSelectedCurrenciesDeps = EnsureEvoluDep;

export interface GetSelectedCurrenciesDep {
    readonly getSelectedCurrencies: GetSelectedCurrencies;
}

export const createGetSelectedCurrencies = (
    deps: GetSelectedCurrenciesDeps,
): GetSelectedCurrencies => {
    const query = allSelectedCurrenciesQuery(deps.ensureEvolu());
    const subscribable = createSubscribableQuery(deps, query, mapSelectedCurrencyFromEvolu);

    return {
        subscribable,
        getState: subscribable.getState,
        get: async (): Promise<ReadonlyArray<SelectedCurrency>> => {
            const { evolu } = deps.ensureEvolu();
            const result = await evolu.loadQuery(query);

            return mapSelectedCurrencyFromEvolu(result);
        },
    };
};
