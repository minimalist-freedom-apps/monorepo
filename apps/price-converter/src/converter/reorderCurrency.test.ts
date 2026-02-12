import { CurrencyCode, getOrThrow } from '@evolu/common';
import { asFractionalIndex } from '@minimalist-apps/fractional-indexing';
import { describe, expect, test, vi } from 'vitest';
import type { EnsureEvoluDep } from '../state/evolu/schema.js';
import type { SelectedCurrency } from '../state/SelectedCurrency/SelectedCurrency.js';
import { createReorderCurrency } from './reorderCurrency.js';

const USD = getOrThrow(CurrencyCode.from('USD'));
const EUR = getOrThrow(CurrencyCode.from('EUR'));
const GBP = getOrThrow(CurrencyCode.from('GBP'));
const JPY = getOrThrow(CurrencyCode.from('JPY'));

const createTestCurrency = (code: CurrencyCode, order: string): SelectedCurrency => ({
    code,
    order: asFractionalIndex(order),
});

const createTestDeps = (orderedCurrencies: ReadonlyArray<SelectedCurrency>) => {
    const upsert = vi.fn();
    const shardOwner = { id: 'test-owner' };
    const evolu = { upsert };

    return {
        ensureEvolu: (() => ({
            evolu,
            shardOwner,
        })) as unknown as EnsureEvoluDep['ensureEvolu'],
        getOrderedCurrencies: () => orderedCurrencies,
        upsert,
        shardOwner,
    };
};

describe(createReorderCurrency.name, () => {
    test('moves item down in list', () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const deps = createTestDeps(currencies);
        const reorderCurrency = createReorderCurrency(deps);

        reorderCurrency({ active: USD, over: GBP });

        expect(deps.upsert).toHaveBeenCalledOnce();
        const [table, row] = deps.upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(USD);

        // newIndex=2, without=[EUR(a1),GBP(a2)], prev=GBP(a2), next=undefined
        // New order should be after GBP (a2)
        expect(row.order > 'a2').toBe(true);
    });

    test('moves item up in list', () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const deps = createTestDeps(currencies);
        const reorderCurrency = createReorderCurrency(deps);

        reorderCurrency({ active: GBP, over: USD });

        expect(deps.upsert).toHaveBeenCalledOnce();
        const [table, row] = deps.upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(GBP);

        // New order should be before USD (a0)
        expect(row.order < 'a0').toBe(true);
    });

    test('moves item to the beginning of list', () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const deps = createTestDeps(currencies);
        const reorderCurrency = createReorderCurrency(deps);

        reorderCurrency({ active: EUR, over: USD });

        expect(deps.upsert).toHaveBeenCalledOnce();
        const [table, row] = deps.upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(EUR);

        // New order should be before USD (a0)
        expect(row.order < 'a0').toBe(true);
    });

    test('moves item to the end of list', () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const deps = createTestDeps(currencies);
        const reorderCurrency = createReorderCurrency(deps);

        reorderCurrency({ active: USD, over: GBP });

        expect(deps.upsert).toHaveBeenCalledOnce();
        const [table, row] = deps.upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(USD);

        // newIndex=2, without=[EUR(a1),GBP(a2)], prev=GBP(a2), next=undefined
        // New order should be after GBP (a2)
        expect(row.order > 'a2').toBe(true);
    });

    test('passes shardOwner id to upsert', () => {
        const currencies = [createTestCurrency(USD, 'a0'), createTestCurrency(EUR, 'a1')];
        const deps = createTestDeps(currencies);
        const reorderCurrency = createReorderCurrency(deps);

        reorderCurrency({ active: USD, over: EUR });

        expect(deps.upsert).toHaveBeenCalledOnce();
        const [, , options] = deps.upsert.mock.calls[0];
        expect(options).toEqual({ ownerId: 'test-owner' });
    });

    test('maintains correct ordering with four items when middle item moves', () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
            createTestCurrency(JPY, 'a3'),
        ];
        const deps = createTestDeps(currencies);
        const reorderCurrency = createReorderCurrency(deps);

        // Move EUR (index 1) to where JPY is (index 3)
        reorderCurrency({ active: EUR, over: JPY });

        expect(deps.upsert).toHaveBeenCalledOnce();
        const [, row] = deps.upsert.mock.calls[0];
        expect(row.currency).toBe(EUR);

        // After removing EUR, without=[USD(a0), GBP(a2), JPY(a3)]
        // newIndex=3, prevItem=without[2]=JPY(a3), nextItem=without[3]=undefined
        // EUR should go after JPY (a3)
        expect(row.order > 'a3').toBe(true);
    });

    test('fetches ordered currencies from deps, not from params', () => {
        const currencies = [createTestCurrency(USD, 'a0'), createTestCurrency(EUR, 'a1')];
        const getOrderedCurrencies = vi.fn(() => currencies);
        const upsert = vi.fn();
        const deps = {
            ensureEvolu: (() => ({
                evolu: { upsert },
                shardOwner: { id: 'owner' },
            })) as unknown as EnsureEvoluDep['ensureEvolu'],
            getOrderedCurrencies,
        };
        const reorderCurrency = createReorderCurrency(deps);

        reorderCurrency({ active: USD, over: EUR });

        expect(getOrderedCurrencies).toHaveBeenCalledOnce();
    });
});
