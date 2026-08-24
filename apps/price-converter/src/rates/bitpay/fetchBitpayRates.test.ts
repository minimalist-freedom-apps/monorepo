import { getOrThrow, testCreateNativeFetch, testCreateRun } from '@evolu/common';
import { CurrencyCode, type CurrencyCode as CurrencyCodeType } from '@minimalist-apps/fiat';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { describe, expect, test } from 'vitest';
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

        expect(nativeFetch.calls[0]?.input).toBe('https://bitpay.com/rates/BTC');
        expect(nativeFetch.calls[0]?.init?.signal).toBeInstanceOf(AbortSignal);
    });

    test('parses bitpay fixture into currency map', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            return;
        }

        expect(result.value[USD]?.code).toBe(USD);
        expect(result.value[USD]?.name).toBe('US Dollar');
        expect(result.value[USD]?.rate).toBe(1 / 68430.88);

        expect(result.value[EUR]?.code).toBe(EUR);
        expect(result.value[EUR]?.name).toBe('Eurozone Euro');
        expect(result.value[EUR]?.rate).toBe(1 / 58045.62);

        expect(result.value[GBP]?.code).toBe(GBP);
        expect(result.value[GBP]?.name).toBe('Pound Sterling');
        expect(result.value[GBP]?.rate).toBe(1 / 50259.54);

        expect(result.value[JPY]?.code).toBe(JPY);
        expect(result.value[JPY]?.name).toBe('Japanese Yen');
        expect(result.value[JPY]?.rate).toBe(1 / 10757368.39);
    });

    test('excludes BTC from the currency map', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            return;
        }

        expect(result.value['BTC' as keyof typeof result.value]).toBeUndefined();
    });

    test('excludes non-bitcoin crypto currencies', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            return;
        }

        expect(result.value['ETH' as CurrencyCodeType]).toBeUndefined();
        expect(result.value['BCH' as CurrencyCodeType]).toBeUndefined();
        expect(result.value['LTC' as CurrencyCodeType]).toBeUndefined();
        expect(result.value['XRP' as CurrencyCodeType]).toBeUndefined();
        expect(result.value['SOL' as CurrencyCodeType]).toBeUndefined();
        expect(result.value['APE' as CurrencyCodeType]).toBeUndefined();
    });

    test('excludes invalid currency codes', async () => {
        const { result } = await runWithResponse(bitpayFixture);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            return;
        }

        // Codes like "MATIC_e", "ETH_m" etc. are not valid CurrencyCodes
        const keys = typedObjectKeys(result.value);

        for (const key of keys) {
            expect(key).toMatch(/^[A-Z]{3}$/);
        }
    });

    test('returns FetchRatesError when response is not ok', async () => {
        const { result } = await runWithResponse(null, 500);

        expect(result).toEqual({
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    test('returns FetchRatesError when fetch throws', async () => {
        const nativeFetch = testCreateNativeFetch(() => {
            throw new Error('Network error');
        });
        await using run = testCreateRun({ nativeFetch });

        await expect(run(fetchBitpayRates)).resolves.toEqual({
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    test('returns FetchRatesError for a malformed response', async () => {
        const { result } = await runWithResponse({ data: null });

        expect(result).toEqual({
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    test.each([0, -1, Number.NaN, Number.MIN_VALUE, Number.POSITIVE_INFINITY])(
        'returns FetchRatesError for invalid rate %s',
        async rate => {
            const { result } = await runWithResponse({
                data: [{ code: 'USD', name: 'US Dollar', rate }],
            });

            expect(result).toEqual({
                ok: false,
                error: { type: 'FetchRatesError' },
            });
        },
    );
});
