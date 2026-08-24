import { getOrThrow } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { describe, expect, test } from 'vitest';
import { createFetchBlockchainInfoRates } from './fetchBlockchainInfoRates';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));

const createMockFetch = (payload: unknown): typeof globalThis.fetch =>
    (() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(payload),
        })) as unknown as typeof globalThis.fetch;

describe(createFetchBlockchainInfoRates.name, () => {
    test('parses finite positive rates', async () => {
        const fetchRates = createFetchBlockchainInfoRates({
            fetch: createMockFetch({ USD: { last: 50_000 } }),
        });

        const result = await fetchRates();

        expect(result.ok).toBe(true);

        if (result.ok) {
            expect(result.value[USD]?.rate).toBe(1 / 50_000);
        }
    });

    test.each([null, [], { USD: null }, { USD: { last: 0 } }, { USD: { last: '50000' } }])(
        'rejects malformed payload %#',
        async payload => {
            const fetchRates = createFetchBlockchainInfoRates({
                fetch: createMockFetch(payload),
            });

            await expect(fetchRates()).resolves.toEqual({
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        },
    );
});
