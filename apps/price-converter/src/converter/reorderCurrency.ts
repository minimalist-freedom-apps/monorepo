import { type CurrencyCode, createIdFromString } from '@evolu/common';
import { type FractionalIndex, generateIndexBetween } from '@minimalist-apps/fractional-indexing';
import type { GetSelectedCurrenciesDep } from '../state/evolu/createGetSelectedCurrencies';
import type { EnsureEvoluStorageDep } from '../state/evolu/schema';
import type { SelectedCurrency } from '../state/SelectedCurrency/SelectedCurrency';

export type ReorderCurrencyDeps = EnsureEvoluStorageDep & GetSelectedCurrenciesDep;

export interface ReorderCurrencyParams {
    readonly active: CurrencyCode;
    readonly over: CurrencyCode;
}

export type ReorderCurrency = (params: ReorderCurrencyParams) => Promise<void>;

export interface ReorderCurrencyDep {
    readonly reorderCurrency: ReorderCurrency;
}

export const createReorderCurrency =
    (deps: ReorderCurrencyDeps): ReorderCurrency =>
    async ({ active, over }) => {
        const orderedCurrencies = await deps.getSelectedCurrencies();

        const oldIndex = orderedCurrencies.findIndex(c => c.code === active);
        const newIndex = orderedCurrencies.findIndex(c => c.code === over);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        // Build the new order by removing the active item and inserting at newIndex
        const without = orderedCurrencies.filter(c => c.code !== active);
        const prevItem = without[newIndex - 1] as SelectedCurrency | undefined;
        const nextItem = without[newIndex] as SelectedCurrency | undefined;

        const prevKey: FractionalIndex | null = prevItem !== undefined ? prevItem.order : null;
        const nextKey: FractionalIndex | null = nextItem !== undefined ? nextItem.order : null;

        const newOrder = generateIndexBetween(prevKey, nextKey);

        const { evolu, activeOwner } = await deps.ensureEvoluStorage();
        const movedCurrency = orderedCurrencies[oldIndex];

        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(movedCurrency.code),
                currency: movedCurrency.code,
                order: newOrder,
            },
            { ownerId: activeOwner.id },
        );
    };
