import { describe, expect, test } from 'vitest';
import {
    getPositiveFiniteReciprocal,
    isPositiveFiniteNumber,
    isUnknownRecord,
} from './rateApiValidation';

describe('rate API validation', () => {
    test.each([
        [{}, true],
        [{ value: 1 }, true],
        [null, false],
        [[], false],
        ['value', false],
    ])('identifies unknown records', (value, expected) => {
        expect(isUnknownRecord(value)).toBe(expected);
    });

    test.each([
        [1, true],
        [0.1, true],
        [0, false],
        [-1, false],
        [Number.NaN, false],
        [Number.POSITIVE_INFINITY, false],
        ['1', false],
    ])('identifies finite positive numbers', (value, expected) => {
        expect(isPositiveFiniteNumber(value)).toBe(expected);
    });

    test.each([
        [2, 0.5],
        [0, null],
        [-1, null],
        [Number.MIN_VALUE, null],
        [Number.POSITIVE_INFINITY, null],
    ])('returns only finite positive reciprocals', (value, expected) => {
        expect(getPositiveFiniteReciprocal(value)).toBe(expected);
    });
});
