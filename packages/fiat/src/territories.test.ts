import { describe, expect, test } from 'vitest';
import {
    asCurrencyCodeUnsafe,
    currencyMatchesTerritory,
    getFlagsForCurrency,
    getTerritoryNamesForCurrency,
} from './territories.js';

const USD = asCurrencyCodeUnsafe('USD');
const EUR = asCurrencyCodeUnsafe('EUR');
const JPY = asCurrencyCodeUnsafe('JPY');
const CHF = asCurrencyCodeUnsafe('CHF');
const XYZ = asCurrencyCodeUnsafe('XYZ');

describe(getFlagsForCurrency.name, () => {
    test('returns flags for a known currency', () => {
        const flags = getFlagsForCurrency(USD);

        expect(flags).toContain('🇺🇸');
        expect(flags.length).toBeGreaterThan(1);
    });

    test('returns single flag for single-territory currency', () => {
        const flags = getFlagsForCurrency(JPY);

        expect(flags).toEqual(['🇯🇵']);
    });

    test('returns empty array for unknown currency', () => {
        const flags = getFlagsForCurrency(XYZ);

        expect(flags).toEqual([]);
    });
});

describe(getTerritoryNamesForCurrency.name, () => {
    test('returns territory names for a known currency', () => {
        const names = getTerritoryNamesForCurrency(CHF);

        expect(names).toEqual(['Switzerland', 'Liechtenstein']);
    });

    test('returns single name for single-territory currency', () => {
        const names = getTerritoryNamesForCurrency(JPY);

        expect(names).toEqual(['Japan']);
    });

    test('returns empty array for unknown currency', () => {
        const names = getTerritoryNamesForCurrency(XYZ);

        expect(names).toEqual([]);
    });
});

describe(currencyMatchesTerritory.name, () => {
    test('matches territory by full name', () => {
        expect(currencyMatchesTerritory(USD, 'United States')).toBe(true);
    });

    test('matches territory by partial name', () => {
        expect(currencyMatchesTerritory(USD, 'united')).toBe(true);
    });

    test('matches case-insensitively', () => {
        expect(currencyMatchesTerritory(JPY, 'JAPAN')).toBe(true);
    });

    test('matches any territory of a multi-territory currency', () => {
        expect(currencyMatchesTerritory(EUR, 'Germany')).toBe(true);
        expect(currencyMatchesTerritory(EUR, 'France')).toBe(true);
        expect(currencyMatchesTerritory(EUR, 'Italy')).toBe(true);
    });

    test('returns false for non-matching territory', () => {
        expect(currencyMatchesTerritory(JPY, 'France')).toBe(false);
    });

    test('returns false for unknown currency', () => {
        expect(currencyMatchesTerritory(XYZ, 'anywhere')).toBe(false);
    });

    test('matches partial territory name for search', () => {
        expect(currencyMatchesTerritory(USD, 'puerto')).toBe(true);
        expect(currencyMatchesTerritory(USD, 'guam')).toBe(true);
    });
});
