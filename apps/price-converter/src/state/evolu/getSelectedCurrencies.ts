import type { CurrencyCode, Query, Row } from '@evolu/common';
import { sqliteTrue } from '@evolu/common';
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

type GetSelectedCurrenciesDeps = EnsureEvoluDep;

export interface GetSelectedCurrenciesDep {
    readonly getSelectedCurrencies: GetSelectedCurrencies;
}

export const createGetSelectedCurrencies = (
    deps: GetSelectedCurrenciesDeps,
): GetSelectedCurrencies => {
    const { evolu, shardOwner } = deps.ensureEvolu();
    const query: Query<SelectedCurrencyRow> = evolu.createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency'])
            .where('isDeleted', 'is not', sqliteTrue),
    );

    const get = async (): Promise<CurrencyCode[]> => {
        const result = await evolu.loadQuery(query);

        return result
            .filter(row => row.currency !== null && row.id === shardOwner.id)
            .map(row => row.currency as CurrencyCode);
    };

    return { query, get };
};
