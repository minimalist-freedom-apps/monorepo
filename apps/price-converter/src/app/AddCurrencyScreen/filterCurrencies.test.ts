import { describe, expect, test } from 'vitest';
import { filterCurrencies } from './filterCurrencies.js';

const currencies = [
    { code: 'USD', name: 'United States dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese yen' },
    { code: 'CHF', name: 'Swiss franc' },
] as const;

describe(filterCurrencies.name, () => {
    test('returns all currencies when search term is empty', () => {
        expect(filterCurrencies(currencies, '')).toEqual(currencies);
    });

    test('filters by currency code', () => {
        const result = filterCurrencies(currencies, 'JPY');

        expect(result).toEqual([{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by currency code case-insensitively', () => {
        const result = filterCurrencies(currencies, 'jpy');

        expect(result).toEqual([{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by currency name', () => {
        const result = filterCurrencies(currencies, 'yen');

        expect(result).toEqual([{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by territory name', () => {
        const result = filterCurrencies(currencies, 'Japan');

        expect(result).toEqual([{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by partial territory name', () => {
        // "Liech" matches Liechtenstein which uses CHF
        const result = filterCurrencies(currencies, 'Liech');

        expect(result).toEqual([{ code: 'CHF', name: 'Swiss franc' }]);
    });

    test('finds EUR when searching for Germany', () => {
        const result = filterCurrencies(currencies, 'Germany');

        expect(result).toEqual([{ code: 'EUR', name: 'Euro' }]);
    });

    test('returns empty array when no currencies match', () => {
        const result = filterCurrencies(currencies, 'xyznonexistent');

        expect(result).toEqual([]);
    });

    test('returns multiple matches', () => {
        const result = filterCurrencies(currencies, 'franc');

        // "franc" matches EUR (territory: France) and CHF (name: Swiss franc)
        expect(result).toEqual([
            { code: 'EUR', name: 'Euro' },
            { code: 'CHF', name: 'Swiss franc' },
        ]);
    });

    test('preserves extra properties on items', () => {
        const items = [
            { code: 'USD', name: 'United States dollar', extra: 42 },
        ];

        const result = filterCurrencies(items, 'USD');

        expect(result).toEqual([
            { code: 'USD', name: 'United States dollar', extra: 42 },
        ]);
    });
});
