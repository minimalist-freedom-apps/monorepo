import { getOrThrow, testCreateNativeFetch, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { describe, expect, test } from 'vitest';
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

        expect(result.ok).toBe(true);

        if (result.ok) {
            expect(result.value[USD]?.rate).toBe(1 / 50_000);
        }
    });

    test.each([null, [], { USD: null }, { USD: { last: 0 } }, { USD: { last: '50000' } }])(
        'rejects malformed payload %#',
        async payload => {
            await expect(runWithPayload(payload)).resolves.toEqual({
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        },
    );
});
