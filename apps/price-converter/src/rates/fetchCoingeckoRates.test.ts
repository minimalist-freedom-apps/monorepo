import { getOrThrow } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { describe, expect, test } from 'vitest';
import { createFetchCoingeckoRates } from './fetchCoingeckoRates';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));

const createMockFetch = (payload: unknown): typeof globalThis.fetch =>
    (() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(payload),
        })) as unknown as typeof globalThis.fetch;

describe(createFetchCoingeckoRates.name, () => {
    test('parses finite positive fiat rates', async () => {
        const fetchRates = createFetchCoingeckoRates({
            fetch: createMockFetch({
                rates: { usd: { name: 'US Dollar', type: 'fiat', value: 50_000 } },
            }),
        });

        const result = await fetchRates();

        expect(result.ok).toBe(true);

        if (result.ok) {
            expect(result.value[USD]?.rate).toBe(1 / 50_000);
        }
    });

    test.each([
        null,
        { rates: null },
        { rates: { usd: null } },
        { rates: { usd: { name: 'US Dollar', type: 'fiat', value: 0 } } },
        { rates: { usd: { name: 1, type: 'fiat', value: 50_000 } } },
    ])('rejects malformed payload %#', async payload => {
        const fetchRates = createFetchCoingeckoRates({
            fetch: createMockFetch(payload),
        });

        await expect(fetchRates()).resolves.toEqual({
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });
});
