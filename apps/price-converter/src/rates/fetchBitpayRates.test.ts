import { CurrencyCode, getOrThrow } from '@evolu/common';
import { typedObjectKeys } from '@minimalistic-apps/type-utils';
import { describe, expect, test } from 'vitest';
import { createFetchBitpayRates } from './fetchBitpayRates.js';
import bitpayFixture from './fixtures/bitpay.json';

const USD = getOrThrow(CurrencyCode.from('USD'));
const EUR = getOrThrow(CurrencyCode.from('EUR'));
const GBP = getOrThrow(CurrencyCode.from('GBP'));
const JPY = getOrThrow(CurrencyCode.from('JPY'));

const createMockFetch = (
    response: unknown,
    ok = true,
): typeof globalThis.fetch =>
    (() =>
        Promise.resolve({
            ok,
            json: () => Promise.resolve(response),
        })) as unknown as typeof globalThis.fetch;

describe(createFetchBitpayRates, () => {
    test('parses bitpay fixture into currency map', async () => {
        const fetchBitpayRates = createFetchBitpayRates({
            fetch: createMockFetch(bitpayFixture),
        });

        const result = await fetchBitpayRates();

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
        const fetchBitpayRates = createFetchBitpayRates({
            fetch: createMockFetch(bitpayFixture),
        });

        const result = await fetchBitpayRates();

        expect(result.ok).toBe(true);

        if (!result.ok) {
            return;
        }

        expect(
            result.value['BTC' as keyof typeof result.value],
        ).toBeUndefined();
    });

    test('excludes invalid currency codes', async () => {
        const fetchBitpayRates = createFetchBitpayRates({
            fetch: createMockFetch(bitpayFixture),
        });

        const result = await fetchBitpayRates();

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
        const fetchBitpayRates = createFetchBitpayRates({
            fetch: createMockFetch(null, false),
        });

        const result = await fetchBitpayRates();

        expect(result.ok).toBe(false);

        if (result.ok) {
            return;
        }

        expect(result.error.type).toBe('FetchRatesError');
    });

    test('returns FetchRatesError when fetch throws', async () => {
        const fetchBitpayRates = createFetchBitpayRates({
            fetch: (() =>
                Promise.reject(
                    new Error('Network error'),
                )) as typeof globalThis.fetch,
        });

        const result = await fetchBitpayRates();

        expect(result.ok).toBe(false);

        if (result.ok) {
            return;
        }

        expect(result.error.type).toBe('FetchRatesError');
    });
});
