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

    for (const testCase of [
        null,
        { rates: null },
        { rates: { usd: null } },
        { rates: { usd: { name: 'US Dollar', type: 'fiat', value: 0 } } },
        { rates: { usd: { name: 1, type: 'fiat', value: 50_000 } } },
    ]) {
        test('rejects malformed payload %#' + ': ' + JSON.stringify(testCase), async () => {
            const payload = testCase;
            assert.deepStrictEqual(await runWithPayload(payload), {
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        });
    }
});
