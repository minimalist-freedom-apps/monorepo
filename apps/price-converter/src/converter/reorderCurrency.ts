import { type CurrencyCode, createIdFromString } from '@evolu/common';
import { type FractionalIndex, generateIndexBetween } from '@minimalist-apps/fractional-indexing';
import type { GetOrderedCurrencies } from '../state/addCurrency';
import type { EnsureEvoluDep } from '../state/evolu/schema';
import type { SelectedCurrency } from '../state/SelectedCurrency/SelectedCurrency';

export interface ReorderCurrencyParams {
    readonly active: CurrencyCode;
    readonly over: CurrencyCode;
}

export type ReorderCurrency = (params: ReorderCurrencyParams) => void;

export interface ReorderCurrencyDep {
    readonly reorderCurrency: ReorderCurrency;
}

interface ReorderCurrencyDeps {
    readonly getOrderedCurrencies: GetOrderedCurrencies;
}

type ReorderCurrencyAllDeps = EnsureEvoluDep & ReorderCurrencyDeps;

export const createReorderCurrency =
    (deps: ReorderCurrencyAllDeps): ReorderCurrency =>
    ({ active, over }) => {
        const orderedCurrencies = deps.getOrderedCurrencies();

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

        const { evolu, shardOwner } = deps.ensureEvolu();
        const movedCurrency = orderedCurrencies[oldIndex];

        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(movedCurrency.code),
                currency: movedCurrency.code,
                order: newOrder,
            },
            { ownerId: shardOwner.id },
        );
    };
