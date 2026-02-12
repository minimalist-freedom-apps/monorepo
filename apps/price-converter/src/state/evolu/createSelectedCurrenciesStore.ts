import type { Subscribable } from '@minimalist-apps/connect';
import { createSubscribableQuery } from '@minimalist-apps/evolu';
import { mapSelectedCurrencyFromEvolu } from '../SelectedCurrency/mapSelectedCurrencyFromEvolu';
import type { SelectedCurrency } from '../SelectedCurrency/SelectedCurrency';
import { allSelectedCurrenciesQuery } from './allSelectedCurrenciesQuery';
import type { EnsureEvoluStorageDep } from './schema';

export type SelectedCurrenciesStore = Subscribable<ReadonlyArray<SelectedCurrency>>;

export interface SelectedCurrenciesStoreDep {
    readonly selectedCurrenciesStore: SelectedCurrenciesStore;
}

export const createSelectedCurrenciesStore = (
    deps: EnsureEvoluStorageDep,
): SelectedCurrenciesStore => {
    const query = allSelectedCurrenciesQuery(deps.ensureEvoluStorage());

    return createSubscribableQuery(deps, query, mapSelectedCurrencyFromEvolu);
};
