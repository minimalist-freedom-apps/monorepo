import type { CurrencyCode, Query, Row } from '@evolu/common';
import { sqliteTrue } from '@evolu/common';
import {
    asFractionalIndex,
    compareFractionalIndex,
    type FractionalIndex,
} from '@minimalist-apps/fractional-indexing';
import type { EnsureEvoluDep } from './schema';

export interface SelectedCurrencyRow extends Row {
    readonly id: string;
    readonly currency: CurrencyCode | null;
    readonly order: FractionalIndex | null;
}

export interface OrderedCurrency {
    readonly id: string;
    readonly code: CurrencyCode;
    readonly order: FractionalIndex;
}

export const selectCurrencyCodes = (
    rows: ReadonlyArray<SelectedCurrencyRow>,
): ReadonlyArray<CurrencyCode> =>
    rows.flatMap(row => (row.currency === null ? [] : [row.currency]));

/**
 * Select currencies with their order info, sorted by fractional index.
 * Currencies without an order are placed at the end with a synthetic key.
 */
export const selectOrderedCurrencies = (
    rows: ReadonlyArray<SelectedCurrencyRow>,
): ReadonlyArray<OrderedCurrency> =>
    rows
        .flatMap(row =>
            row.currency === null
                ? []
                : [
                      {
                          id: row.id,
                          code: row.currency,
                          order: row.order ?? asFractionalIndex('~'),
                      },
                  ],
        )
        .toSorted((a, b) => compareFractionalIndex(a.order, b.order));

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
            .select(['id', 'currency', 'order'])
            .where('isDeleted', 'is not', sqliteTrue)
            .where('ownerId', '=', shardOwner.id),
    );

    const get = async (): Promise<CurrencyCode[]> => {
        const result = await evolu.loadQuery(query);

        return result.filter(row => row.currency !== null).map(row => row.currency as CurrencyCode);
    };

    return { query, get };
};
