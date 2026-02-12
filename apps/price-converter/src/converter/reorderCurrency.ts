import { createIdFromString } from '@evolu/common';
import { type FractionalIndex, generateIndexBetween } from '@minimalist-apps/fractional-indexing';
import type { GetOrderedCurrencies } from '../state/addCurrency';
import type { OrderedCurrency } from '../state/evolu/getSelectedCurrencies';
import type { EnsureEvoluDep } from '../state/evolu/schema';

export interface ReorderCurrencyParams {
    readonly activeId: string;
    readonly overId: string;
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
    ({ activeId, overId }) => {
        const orderedCurrencies = deps.getOrderedCurrencies();

        const oldIndex = orderedCurrencies.findIndex(c => c.id === activeId);
        const newIndex = orderedCurrencies.findIndex(c => c.id === overId);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        // Build the new order by removing the active item and inserting at newIndex
        const without = orderedCurrencies.filter(c => c.id !== activeId);
        const prevItem = without[newIndex - 1] as OrderedCurrency | undefined;
        const nextItem = without[newIndex] as OrderedCurrency | undefined;

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
