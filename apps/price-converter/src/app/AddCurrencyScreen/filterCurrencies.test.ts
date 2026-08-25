import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { CurrencyCode } from '@minimalist-apps/fiat';
import { filterCurrencies } from './filterCurrencies.js';

const currencies = [
    { code: 'USD' as CurrencyCode, name: 'United States dollar' },
    { code: 'EUR' as CurrencyCode, name: 'Euro' },
    { code: 'JPY' as CurrencyCode, name: 'Japanese yen' },
    { code: 'CHF' as CurrencyCode, name: 'Swiss franc' },
] as const;

describe('filterCurrencies', () => {
    test('returns all currencies when search term is empty', () => {
        assert.deepStrictEqual(filterCurrencies(currencies, ''), currencies);
    });

    test('filters by currency code', () => {
        const result = filterCurrencies(currencies, 'JPY');

        assert.deepStrictEqual(result, [{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by currency code case-insensitively', () => {
        const result = filterCurrencies(currencies, 'jpy');

        assert.deepStrictEqual(result, [{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by currency name', () => {
        const result = filterCurrencies(currencies, 'yen');

        assert.deepStrictEqual(result, [{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by territory name', () => {
        const result = filterCurrencies(currencies, 'Japan');

        assert.deepStrictEqual(result, [{ code: 'JPY', name: 'Japanese yen' }]);
    });

    test('filters by partial territory name', () => {
        // "Liech" matches Liechtenstein which uses CHF
        const result = filterCurrencies(currencies, 'Liech');

        assert.deepStrictEqual(result, [{ code: 'CHF', name: 'Swiss franc' }]);
    });

    test('finds EUR when searching for Germany', () => {
        const result = filterCurrencies(currencies, 'Germany');

        assert.deepStrictEqual(result, [{ code: 'EUR', name: 'Euro' }]);
    });

    test('returns empty array when no currencies match', () => {
        const result = filterCurrencies(currencies, 'xyznonexistent');

        assert.deepStrictEqual(result, []);
    });

    test('returns multiple matches', () => {
        const result = filterCurrencies(currencies, 'franc');

        // "franc" matches EUR (territory: France) and CHF (name: Swiss franc)
        assert.deepStrictEqual(result, [
            { code: 'EUR', name: 'Euro' },
            { code: 'CHF', name: 'Swiss franc' },
        ]);
    });

    test('preserves extra properties on items', () => {
        const items = [
            {
                code: 'USD' as CurrencyCode,
                name: 'United States dollar',
                extra: 42,
            },
        ];

        const result = filterCurrencies(items, 'USD');

        assert.deepStrictEqual(result, [
            {
                code: 'USD',
                name: 'United States dollar',
                extra: 42,
            },
        ]);
    });
});
