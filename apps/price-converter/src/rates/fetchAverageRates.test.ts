import { CurrencyCode, err, getOrThrow, ok } from '@evolu/common';
import { describe, expect, test } from 'vitest';
import {
    type CurrencyMap,
    type FetchRates,
    FetchRatesError,
} from './FetchRates.js';
import { createFetchAverageRates } from './fetchAverageRates.js';

const USD = getOrThrow(CurrencyCode.from('USD'));
const EUR = getOrThrow(CurrencyCode.from('EUR'));
const GBP = getOrThrow(CurrencyCode.from('GBP'));

const createMockFetchRates =
    (rates: CurrencyMap): FetchRates =>
    async () =>
        ok(rates);

const createFailingFetchRates = (): FetchRates => async () =>
    err(FetchRatesError());

describe(createFetchAverageRates, () => {
    test('calculates average rate from multiple sources', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
            [EUR]: { code: EUR, name: 'Euro', rate: 90 },
        } as CurrencyMap;
        const source2 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 110 },
            [EUR]: { code: EUR, name: 'Euro', rate: 100 },
        } as CurrencyMap;
        const source3 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 105 },
            [EUR]: { code: EUR, name: 'Euro', rate: 95 },
        } as CurrencyMap;

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

        expect(result.value[USD].rate).toBe(105); // (100 + 110 + 105) / 3
        expect(result.value[EUR].rate).toBe(95); // (90 + 100 + 95) / 3
    });

    test('calculates average when sources have different currencies', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
        } as CurrencyMap;
        const source2 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 200 },
            [GBP]: { code: GBP, name: 'British Pound', rate: 80 },
        } as CurrencyMap;

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createMockFetchRates(source2),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value[USD].rate).toBe(150); // (100 + 200) / 2
        expect(result.value[GBP].rate).toBe(80); // only one source
    });

    test('returns single source rates when only one source succeeds', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 42000 },
        } as CurrencyMap;

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createFailingFetchRates(),
                createFailingFetchRates(),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value[USD].rate).toBe(42000);
    });

    test('returns AllApisFailed error when all sources fail', async () => {
        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [createFailingFetchRates(), createFailingFetchRates()],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(false);
        if (result.ok) return;

        expect(result.error.type).toBe('FetchRatesError');
    });

    test('preserves currency name from first available source', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
        } as CurrencyMap;
        const source2 = {
            [USD]: {
                code: USD,
                name: 'United States Dollar',
                rate: 200,
            },
        } as CurrencyMap;

        const fetchAverageRates = createFetchAverageRates({
            fetchRates: [
                createMockFetchRates(source1),
                createMockFetchRates(source2),
            ],
        });

        const result = await fetchAverageRates();

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.value[USD].name).toBe('US Dollar');
    });
});
