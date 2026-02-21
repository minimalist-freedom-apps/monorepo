import { CurrencyCode, getOrThrow, type ShardOwner } from '@evolu/common';
import { asFractionalIndex } from '@minimalist-apps/fractional-indexing';
import { describe, expect, test, vi } from 'vitest';
import type { EvoluStorage } from '../state/evolu/schema.js';
import type { SelectedCurrency } from '../state/SelectedCurrency/SelectedCurrency.js';
import { createReorderCurrency, type ReorderCurrencyDeps } from './reorderCurrency.js';

const USD = getOrThrow(CurrencyCode.from('USD'));
const EUR = getOrThrow(CurrencyCode.from('EUR'));
const GBP = getOrThrow(CurrencyCode.from('GBP'));
const JPY = getOrThrow(CurrencyCode.from('JPY'));

const createTestCurrency = (code: CurrencyCode, order: string): SelectedCurrency => ({
    code,
    order: asFractionalIndex(order),
});

const createTestDeps = (
    orderedCurrencies: ReadonlyArray<SelectedCurrency>,
    evoluStorage: EvoluStorage,
): ReorderCurrencyDeps => ({
    ensureEvoluStorage: async () => evoluStorage,
    getSelectedCurrencies: async () => orderedCurrencies,
});

const mockEvoluStorage = (upsert: EvoluStorage['evolu']['upsert']): EvoluStorage => ({
    evolu: { upsert } as EvoluStorage['evolu'],
    activeOwner: { id: 'test-owner' } as ShardOwner,
    updateRelayUrls: vi.fn(),
    dispose: vi.fn(),
});

describe(createReorderCurrency.name, () => {
    test('moves item down in list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = vi.fn();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: USD, over: GBP });

        expect(upsert).toHaveBeenCalledOnce();
        const [table, row] = upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(USD);

        // newIndex=2, without=[EUR(a1),GBP(a2)], prev=GBP(a2), next=undefined
        // New order should be after GBP (a2)
        expect(row.order > 'a2').toBe(true);
    });

    test('moves item up in list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = vi.fn();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: GBP, over: USD });

        expect(upsert).toHaveBeenCalledOnce();
        const [table, row] = upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(GBP);

        // New order should be before USD (a0)
        expect(row.order < 'a0').toBe(true);
    });

    test('moves item to the beginning of list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = vi.fn();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: EUR, over: USD });

        expect(upsert).toHaveBeenCalledOnce();
        const [table, row] = upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(EUR);

        // New order should be before USD (a0)
        expect(row.order < 'a0').toBe(true);
    });

    test('moves item to the end of list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = vi.fn();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: USD, over: GBP });

        expect(upsert).toHaveBeenCalledOnce();
        const [table, row] = upsert.mock.calls[0];
        expect(table).toBe('currency');
        expect(row.currency).toBe(USD);

        // newIndex=2, without=[EUR(a1),GBP(a2)], prev=GBP(a2), next=undefined
        // New order should be after GBP (a2)
        expect(row.order > 'a2').toBe(true);
    });

    test('passes shardOwner id to upsert', async () => {
        const currencies = [createTestCurrency(USD, 'a0'), createTestCurrency(EUR, 'a1')];
        const upsert = vi.fn();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: USD, over: EUR });

        expect(upsert).toHaveBeenCalledOnce();
        const [, , options] = upsert.mock.calls[0];
        expect(options).toEqual({ ownerId: 'test-owner' });
    });

    test('maintains correct ordering with four items when middle item moves', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
            createTestCurrency(JPY, 'a3'),
        ];
        const upsert = vi.fn();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        // Move EUR (index 1) to where JPY is (index 3)
        await reorderCurrency({ active: EUR, over: JPY });

        expect(upsert).toHaveBeenCalledOnce();
        const [, row] = upsert.mock.calls[0];
        expect(row.currency).toBe(EUR);

        // After removing EUR, without=[USD(a0), GBP(a2), JPY(a3)]
        // newIndex=3, prevItem=without[2]=JPY(a3), nextItem=without[3]=undefined
        // EUR should go after JPY (a3)
        expect(row.order > 'a3').toBe(true);
    });

    test('fetches selected currencies from deps, not from params', async () => {
        const currencies = [createTestCurrency(USD, 'a0'), createTestCurrency(EUR, 'a1')];

        const getSelectedCurrencies = vi.fn(async () => currencies);

        const reorderCurrency = createReorderCurrency({
            ensureEvoluStorage: async () => mockEvoluStorage(vi.fn()),
            getSelectedCurrencies,
        });

        await reorderCurrency({ active: USD, over: EUR });

        expect(getSelectedCurrencies).toHaveBeenCalledOnce();
    });
});
