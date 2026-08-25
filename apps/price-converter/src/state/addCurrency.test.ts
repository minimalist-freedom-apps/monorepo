import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { createIdFromString, getOrThrow, type Owner } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { asRateBtcPerFiat } from '../converter/rate.js';
import { createAddCurrency } from './addCurrency.js';
import type { EvoluStorage } from './evolu/schema.js';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));

const mockEvoluStorage = (upsert: unknown): EvoluStorage => ({
    status: 'ready',
    evolu: { upsert: upsert as EvoluStorage['evolu']['upsert'] } as EvoluStorage['evolu'],
    activeOwner: { id: 'test-owner' } as Owner,
    updateRelayUrls: mock.fn(),
    restoreOwner: mock.fn(),
    subscribeOwnerChange: mock.fn(() => () => {}),
    dispose: mock.fn(),
});

describe('createAddCurrency', () => {
    test('clears soft-delete flag when re-adding previously removed currency', async () => {
        const upsert = mock.fn<EvoluStorage['evolu']['upsert']>(
            () =>
                ({ id: createIdFromString<'CurrencyId'>('test') }) as ReturnType<
                    EvoluStorage['evolu']['upsert']
                >,
        );
        const store = {
            getState: () => ({
                rates: {
                    [USD]: {
                        code: USD,
                        name: 'US Dollar',
                        rate: asRateBtcPerFiat(0.00001),
                    },
                },
                satsAmount: 1,
                fiatAmounts: {},
            }),
            setState: mock.fn(),
        };

        const addCurrency = createAddCurrency({
            appStore: store as never,
            ensureEvoluStorage: async () => mockEvoluStorage(upsert),
            getSelectedCurrencies: async () => [],
        });

        await addCurrency({ code: USD });

        assert.strictEqual(upsert.mock.callCount(), 1);
        const [table, row, options] = upsert.mock.calls.at(-1)?.arguments ?? [];
        assert.strictEqual(table, 'currency');
        assert.strictEqual(row?.isDeleted, 0);
        assert.strictEqual(options?.ownerId, 'test-owner');
    });
});
