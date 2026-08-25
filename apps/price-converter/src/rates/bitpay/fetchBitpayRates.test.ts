import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getOrThrow, testCreateNativeFetch, testCreateRun } from '@evolu/common';
import { CurrencyCode, type CurrencyCode as CurrencyCodeType } from '@minimalist-apps/fiat';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { fetchBitpayRates } from './fetchBitpayRates.js';
import bitpayFixture from './fixtures/bitpay.json';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));
const EUR = getOrThrow(CurrencyCode.fromUnknown('EUR'));
const GBP = getOrThrow(CurrencyCode.fromUnknown('GBP'));
const JPY = getOrThrow(CurrencyCode.fromUnknown('JPY'));

const createResponse = (payload: unknown, status = 200): Response =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
    });

const runWithResponse = async (payload: unknown, status = 200) => {
    const nativeFetch = testCreateNativeFetch(() => createResponse(payload, status));
    await using run = testCreateRun({ nativeFetch });

    return {
        result: await run(fetchBitpayRates),
        nativeFetch,
    };
};

describe('fetchBitpayRates', () => {
    test('uses the Fiber abort signal for fetch', async () => {
        const { nativeFetch } = await runWithResponse(bitpayFixture);

        assert.strictEqual(nativeFetch.calls[0]?.input, 'https://bitpay.com/rates/BTC');
        assert.ok(nativeFetch.calls[0]?.init?.signal instanceof AbortSignal);
    });

    test('parses bitpay fixture into currency map', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        assert.ok(result.ok);

        assert.deepStrictEqual(result.value[USD], {
            code: USD,
            name: 'US Dollar',
            rate: 1 / 68430.88,
        });
        assert.deepStrictEqual(result.value[EUR], {
            code: EUR,
            name: 'Eurozone Euro',
            rate: 1 / 58045.62,
        });
        assert.deepStrictEqual(result.value[GBP], {
            code: GBP,
            name: 'Pound Sterling',
            rate: 1 / 50259.54,
        });
        assert.deepStrictEqual(result.value[JPY], {
            code: JPY,
            name: 'Japanese Yen',
            rate: 1 / 10757368.39,
        });
    });

    test('excludes BTC from the currency map', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        assert.ok(result.ok);

        assert.strictEqual(result.value['BTC' as keyof typeof result.value], undefined);
    });

    test('excludes non-bitcoin crypto currencies', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        assert.ok(result.ok);

        assert.strictEqual(result.value['ETH' as CurrencyCodeType], undefined);
        assert.strictEqual(result.value['BCH' as CurrencyCodeType], undefined);
        assert.strictEqual(result.value['LTC' as CurrencyCodeType], undefined);
        assert.strictEqual(result.value['XRP' as CurrencyCodeType], undefined);
        assert.strictEqual(result.value['SOL' as CurrencyCodeType], undefined);
        assert.strictEqual(result.value['APE' as CurrencyCodeType], undefined);
    });

    test('excludes invalid currency codes', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        assert.ok(result.ok);

        // Codes like "MATIC_e", "ETH_m" etc. are not valid CurrencyCodes
        const keys = typedObjectKeys(result.value);

        for (const key of keys) {
            assert.match(key, /^[A-Z]{3}$/);
        }
    });

    test('returns FetchRatesError when response is not ok', async () => {
        const { result } = await runWithResponse(null, 500);

        assert.deepStrictEqual(result, {
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    test('returns FetchRatesError when fetch throws', async () => {
        const nativeFetch = testCreateNativeFetch(() => {
            throw new Error('Network error');
        });
        await using run = testCreateRun({ nativeFetch });

        assert.deepStrictEqual(await run(fetchBitpayRates), {
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    test('returns FetchRatesError for a malformed response', async () => {
        const { result } = await runWithResponse({ data: null });

        assert.deepStrictEqual(result, {
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    [0, -1, Number.NaN, Number.MIN_VALUE, Number.POSITIVE_INFINITY].forEach(rate => {
        test(`returns FetchRatesError for invalid rate ${rate}`, async () => {
            const { result } = await runWithResponse({
                data: [{ code: 'USD', name: 'US Dollar', rate }],
            });
            assert.deepStrictEqual(result, {
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        });
    });
});
