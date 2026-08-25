import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getOrThrow, testCreateNativeFetch, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { fetchBlockchainInfoRates } from './fetchBlockchainInfoRates';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));

const runWithPayload = async (payload: unknown) => {
    const nativeFetch = testCreateNativeFetch(
        () =>
            new Response(JSON.stringify(payload), {
                headers: { 'content-type': 'application/json' },
            }),
    );
    await using run = testCreateRun({ nativeFetch });

    return await run(fetchBlockchainInfoRates);
};

describe('fetchBlockchainInfoRates', () => {
    test('parses finite positive rates', async () => {
        const result = await runWithPayload({ USD: { last: 50_000 } });

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.rate, 1 / 50_000);
    });

    [
        { description: 'null root', payload: null },
        { description: 'array root', payload: [] },
        { description: 'null currency entry', payload: { USD: null } },
        { description: 'zero rate', payload: { USD: { last: 0 } } },
        { description: 'string rate', payload: { USD: { last: '50000' } } },
    ].forEach(({ description, payload }) => {
        test(`rejects malformed payload with ${description}`, async () => {
            assert.deepStrictEqual(await runWithPayload(payload), {
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        });
    });
});
