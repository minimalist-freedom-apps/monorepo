import type { CurrencyCode, Query, Row } from '@evolu/common';
import { sqliteTrue } from '@evolu/common';
import type { EvoluDep } from '../addCurrency';
import type { EnsureEvoluDep } from './createEvolu';

interface SelectedCurrencyRow extends Row {
    readonly id: string;
    readonly currency: CurrencyCode | null;
}

export interface GetSelectedCurrencies {
    /** @deprecated With new Evolu, this wont be needed */
    readonly query: Query<SelectedCurrencyRow>;
    readonly get: () => Promise<CurrencyCode[]>;
}

type GetSelectedCurrenciesDeps = EvoluDep & EnsureEvoluDep;

export interface GetSelectedCurrenciesDep {
    readonly getSelectedCurrencies: GetSelectedCurrencies;
}

export const createGetSelectedCurrencies = (
    deps: GetSelectedCurrenciesDeps,
): GetSelectedCurrencies => {
    const query: Query<SelectedCurrencyRow> = deps.evolu.createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency'])
            .where('isDeleted', 'is not', sqliteTrue),
    );

    const { shardOwner } = deps.ensureEvolu();

    const get = async (): Promise<CurrencyCode[]> => {
        const result = await deps.evolu.loadQuery(query);

        return result
            .filter(row => row.currency !== null && row.id === shardOwner.id)
            .map(row => row.currency as CurrencyCode);
    };

    return { query, get };
};
