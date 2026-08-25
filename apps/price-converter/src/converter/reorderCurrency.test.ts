import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { createIdFromString, getOrThrow, type Owner } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { asFractionalIndex } from '@minimalist-apps/fractional-indexing';
import type { EvoluStorage } from '../state/evolu/schema.js';
import type { SelectedCurrency } from '../state/SelectedCurrency/SelectedCurrency.js';
import { createReorderCurrency, type ReorderCurrencyDeps } from './reorderCurrency.js';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));
const EUR = getOrThrow(CurrencyCode.fromUnknown('EUR'));
const GBP = getOrThrow(CurrencyCode.fromUnknown('GBP'));
const JPY = getOrThrow(CurrencyCode.fromUnknown('JPY'));

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
    status: 'ready',
    evolu: { upsert } as EvoluStorage['evolu'],
    activeOwner: { id: 'test-owner' } as Owner,
    updateRelayUrls: mock.fn(),
    restoreOwner: mock.fn(),
    subscribeOwnerChange: mock.fn(() => () => {}),
    dispose: mock.fn(),
});

const createUpsertMock = () =>
    mock.fn<EvoluStorage['evolu']['upsert']>(
        () =>
            ({ id: createIdFromString<'CurrencyId'>('test') }) as ReturnType<
                EvoluStorage['evolu']['upsert']
            >,
    );

describe('createReorderCurrency', () => {
    test('moves item down in list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = createUpsertMock();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: USD, over: GBP });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [table, row] = upsert.mock.calls[0]?.arguments ?? [];
        assert.strictEqual(table, 'currency');
        assert.strictEqual(row.currency, USD);

        // newIndex=2, without=[EUR(a1),GBP(a2)], prev=GBP(a2), next=undefined
        // New order should be after GBP (a2)
        assert.ok(typeof row.order === 'string' && row.order > 'a2');
    });

    test('moves item up in list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = createUpsertMock();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: GBP, over: USD });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [table, row] = upsert.mock.calls[0]?.arguments ?? [];
        assert.strictEqual(table, 'currency');
        assert.strictEqual(row.currency, GBP);

        // New order should be before USD (a0)
        assert.ok(typeof row.order === 'string' && row.order < 'a0');
    });

    test('moves item to the beginning of list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = createUpsertMock();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: EUR, over: USD });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [table, row] = upsert.mock.calls[0]?.arguments ?? [];
        assert.strictEqual(table, 'currency');
        assert.strictEqual(row.currency, EUR);

        // New order should be before USD (a0)
        assert.ok(typeof row.order === 'string' && row.order < 'a0');
    });

    test('moves item to the end of list', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
        ];
        const upsert = createUpsertMock();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: USD, over: GBP });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [table, row] = upsert.mock.calls[0]?.arguments ?? [];
        assert.strictEqual(table, 'currency');
        assert.strictEqual(row.currency, USD);

        // newIndex=2, without=[EUR(a1),GBP(a2)], prev=GBP(a2), next=undefined
        // New order should be after GBP (a2)
        assert.ok(typeof row.order === 'string' && row.order > 'a2');
    });

    test('passes activeOwner id to upsert', async () => {
        const currencies = [createTestCurrency(USD, 'a0'), createTestCurrency(EUR, 'a1')];
        const upsert = createUpsertMock();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        await reorderCurrency({ active: USD, over: EUR });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [, , options] = upsert.mock.calls[0]?.arguments ?? [];
        assert.deepStrictEqual(options, { ownerId: 'test-owner' });
    });

    test('maintains correct ordering with four items when middle item moves', async () => {
        const currencies = [
            createTestCurrency(USD, 'a0'),
            createTestCurrency(EUR, 'a1'),
            createTestCurrency(GBP, 'a2'),
            createTestCurrency(JPY, 'a3'),
        ];
        const upsert = createUpsertMock();
        const evoluStorage = mockEvoluStorage(upsert);
        const deps = createTestDeps(currencies, evoluStorage);
        const reorderCurrency = createReorderCurrency(deps);

        // Move EUR (index 1) to where JPY is (index 3)
        await reorderCurrency({ active: EUR, over: JPY });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [, row] = upsert.mock.calls[0]?.arguments ?? [];
        assert.strictEqual(row.currency, EUR);

        // After removing EUR, without=[USD(a0), GBP(a2), JPY(a3)]
        // newIndex=3, prevItem=without[2]=JPY(a3), nextItem=without[3]=undefined
        // EUR should go after JPY (a3)
        assert.ok(typeof row.order === 'string' && row.order > 'a3');
    });

    test('fetches selected currencies from deps, not from params', async () => {
        const currencies = [createTestCurrency(USD, 'a0'), createTestCurrency(EUR, 'a1')];

        const getSelectedCurrencies = mock.fn(async () => currencies);

        const reorderCurrency = createReorderCurrency({
            ensureEvoluStorage: async () => mockEvoluStorage(createUpsertMock()),
            getSelectedCurrencies,
        });

        await reorderCurrency({ active: USD, over: EUR });

        assert.strictEqual(getSelectedCurrencies.mock.callCount(), 1);
    });
});
