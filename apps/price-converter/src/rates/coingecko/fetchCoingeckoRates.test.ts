import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getOrThrow, testCreateNativeFetch, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
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

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.rate, 1 / 50_000);
    });

    [
        { description: 'null root', payload: null },
        { description: 'null rates', payload: { rates: null } },
        { description: 'null currency entry', payload: { rates: { usd: null } } },
        {
            description: 'zero rate',
            payload: { rates: { usd: { name: 'US Dollar', type: 'fiat', value: 0 } } },
        },
        {
            description: 'non-string currency name',
            payload: { rates: { usd: { name: 1, type: 'fiat', value: 50_000 } } },
        },
    ].forEach(({ description, payload }) => {
        test(`rejects malformed payload with ${description}`, async () => {
            assert.deepStrictEqual(await runWithPayload(payload), {
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        });
    });
});
