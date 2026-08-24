import { getOrThrow, testCreateNativeFetch, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { describe, expect, test } from 'vitest';
import { fetchCoingeckoRates } from './fetchCoingeckoRates';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));

const runWithPayload = async (payload: unknown) => {
    const nativeFetch = testCreateNativeFetch(
        () =>
            new Response(JSON.stringify(payload), {
                headers: { 'content-type': 'application/json' },
            }),
    );
    await using run = testCreateRun({ nativeFetch });

    return await run(fetchCoingeckoRates);
};

describe('fetchCoingeckoRates', () => {
    test('parses finite positive fiat rates', async () => {
        const result = await runWithPayload({
            rates: { usd: { name: 'US Dollar', type: 'fiat', value: 50_000 } },
        });

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
        await expect(runWithPayload(payload)).resolves.toEqual({
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });
});
