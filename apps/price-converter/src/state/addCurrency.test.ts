import { CurrencyCode, getOrThrow, type ShardOwner } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { asRateBtcPerFiat } from '../converter/rate.js';
import { createAddCurrency } from './addCurrency.js';
import type { EvoluStorage } from './evolu/schema.js';

const USD = getOrThrow(CurrencyCode.from('USD'));

const mockEvoluStorage = (upsert: EvoluStorage['evolu']['upsert']): EvoluStorage => ({
    evolu: { upsert } as EvoluStorage['evolu'],
    shardOwner: { id: 'test-owner' } as ShardOwner,
    updateRelayUrls: vi.fn(),
    dispose: vi.fn(),
});

describe(createAddCurrency.name, () => {
    test('clears soft-delete flag when re-adding previously removed currency', async () => {
        const upsert = vi.fn();
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
            setState: vi.fn(),
        };

        const addCurrency = createAddCurrency({
            store: store as never,
            ensureEvoluStorage: () => mockEvoluStorage(upsert),
            getSelectedCurrencies: async () => [],
        });

        await addCurrency({ code: USD });

        expect(upsert).toHaveBeenCalledOnce();
        const [, row] = upsert.mock.calls[0];
        expect(row.isDeleted).toBe(0);
    });
});
