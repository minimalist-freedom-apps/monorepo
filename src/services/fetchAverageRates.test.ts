import { err, ok } from '@evolu/common';
import { describe, expect, test } from 'vitest';
import type { FetchRates, FetchRatesError, RatesMap } from './FetchRates.js';
import { createFetchAverageRates } from './fetchAverageRates.js';

const createMockFetchRates =
    (rates: RatesMap): FetchRates =>
    async () =>
        ok(rates);

const createFailingFetchRates =
    (source: string): FetchRates =>
    async () =>
        err<FetchRatesError>({
            type: 'FetchRatesError',
            source,
            message: 'Failed',
        });

describe(createFetchAverageRates, () => {
    test('calculates average rate from multiple sources', async () => {
        const source1: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 100 },
            EUR: { code: 'EUR', name: 'Euro', rate: 90 },
        };
        const source2: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 110 },
            EUR: { code: 'EUR', name: 'Euro', rate: 100 },
        };
        const source3: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 105 },
            EUR: { code: 'EUR', name: 'Euro', rate: 95 },
        };

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createMockFetchRates(source2),
                createMockFetchRates(source3),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value.USD.rate).toBe(105); // (100 + 110 + 105) / 3
        expect(result.value.EUR.rate).toBe(95); // (90 + 100 + 95) / 3
    });

    test('calculates average when sources have different currencies', async () => {
        const source1: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 100 },
        };
        const source2: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 200 },
            GBP: { code: 'GBP', name: 'British Pound', rate: 80 },
        };

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createMockFetchRates(source2),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value.USD.rate).toBe(150); // (100 + 200) / 2
        expect(result.value.GBP.rate).toBe(80); // only one source
    });

    test('returns single source rates when only one source succeeds', async () => {
        const source1: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 42000 },
        };

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createFailingFetchRates('api2'),
                createFailingFetchRates('api3'),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value.USD.rate).toBe(42000);
    });

    test('returns AllApisFailed error when all sources fail', async () => {
        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createFailingFetchRates('api1'),
                createFailingFetchRates('api2'),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(false);
        if (result.ok) return;

        expect(result.error.type).toBe('AllApisFailed');
    });

    test('preserves currency name from first available source', async () => {
        const source1: RatesMap = {
            USD: { code: 'USD', name: 'US Dollar', rate: 100 },
        };
        const source2: RatesMap = {
            USD: { code: 'USD', name: 'United States Dollar', rate: 200 },
        };

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createMockFetchRates(source2),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value.USD.name).toBe('US Dollar');
    });
});
