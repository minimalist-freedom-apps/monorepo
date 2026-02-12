import { mapSelectedCurrencyFromEvolu } from '../SelectedCurrency/mapSelectedCurrencyFromEvolu';
import type { SelectedCurrency } from '../SelectedCurrency/SelectedCurrency';
import { allSelectedCurrenciesQuery } from './allSelectedCurrenciesQuery';
import type { EnsureEvoluStorageDep } from './schema';

export type GetSelectedCurrencies = () => Promise<ReadonlyArray<SelectedCurrency>>;

type GetSelectedCurrenciesDeps = EnsureEvoluStorageDep;

export interface GetSelectedCurrenciesDep {
    readonly getSelectedCurrencies: GetSelectedCurrencies;
}

export const createGetSelectedCurrencies =
    (deps: GetSelectedCurrenciesDeps): GetSelectedCurrencies =>
    async () => {
        const storage = deps.ensureEvoluStorage();
        const query = allSelectedCurrenciesQuery(storage);
        const result = await storage.evolu.loadQuery(query);

        return mapSelectedCurrencyFromEvolu(result);
    };
