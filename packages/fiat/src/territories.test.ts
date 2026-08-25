import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
    asCurrencyCodeUnsafe,
    currencyMatchesTerritory,
    getFlagsForCurrency,
    getTerritoryNamesForCurrency,
    isFiatCurrency,
} from './territories.js';

const USD = asCurrencyCodeUnsafe('USD');
const EUR = asCurrencyCodeUnsafe('EUR');
const JPY = asCurrencyCodeUnsafe('JPY');
const CHF = asCurrencyCodeUnsafe('CHF');
const XYZ = asCurrencyCodeUnsafe('XYZ');

describe(getFlagsForCurrency.name, () => {
    test('returns flags for a known currency', () => {
        const flags = getFlagsForCurrency(USD);

        assert.ok(flags.includes('🇺🇸'));
        assert.ok(flags.length > 1);
    });

    test('returns single flag for single-territory currency', () => {
        const flags = getFlagsForCurrency(JPY);

        assert.deepStrictEqual(flags, ['🇯🇵']);
    });

    test('returns empty array for unknown currency', () => {
        const flags = getFlagsForCurrency(XYZ);

        assert.deepStrictEqual(flags, []);
    });
});

describe(getTerritoryNamesForCurrency.name, () => {
    test('returns territory names for a known currency', () => {
        const names = getTerritoryNamesForCurrency(CHF);

        assert.deepStrictEqual(names, ['Switzerland', 'Liechtenstein']);
    });

    test('returns single name for single-territory currency', () => {
        const names = getTerritoryNamesForCurrency(JPY);

        assert.deepStrictEqual(names, ['Japan']);
    });

    test('returns empty array for unknown currency', () => {
        const names = getTerritoryNamesForCurrency(XYZ);

        assert.deepStrictEqual(names, []);
    });
});

describe(currencyMatchesTerritory.name, () => {
    test('matches territory by full name', () => {
        assert.strictEqual(currencyMatchesTerritory(USD, 'United States'), true);
    });

    test('matches territory by partial name', () => {
        assert.strictEqual(currencyMatchesTerritory(USD, 'united'), true);
    });

    test('matches case-insensitively', () => {
        assert.strictEqual(currencyMatchesTerritory(JPY, 'JAPAN'), true);
    });

    test('matches any territory of a multi-territory currency', () => {
        assert.strictEqual(currencyMatchesTerritory(EUR, 'Germany'), true);
        assert.strictEqual(currencyMatchesTerritory(EUR, 'France'), true);
        assert.strictEqual(currencyMatchesTerritory(EUR, 'Italy'), true);
    });

    test('returns false for non-matching territory', () => {
        assert.strictEqual(currencyMatchesTerritory(JPY, 'France'), false);
    });

    test('returns false for unknown currency', () => {
        assert.strictEqual(currencyMatchesTerritory(XYZ, 'anywhere'), false);
    });

    test('matches partial territory name for search', () => {
        assert.strictEqual(currencyMatchesTerritory(USD, 'puerto'), true);
        assert.strictEqual(currencyMatchesTerritory(USD, 'guam'), true);
    });
});

describe(isFiatCurrency.name, () => {
    test('returns true for fiat currency', () => {
        assert.strictEqual(isFiatCurrency(USD), true);
    });

    test('returns false for unknown currency', () => {
        assert.strictEqual(isFiatCurrency(XYZ), false);
    });
});
