import { describe, expect, test } from 'vitest';
import { getPositiveFiniteReciprocal, PositiveFiniteNumber } from './positiveFiniteNumber';

describe('positive finite number', () => {
    test.each([
        [1, true],
        [0.1, true],
        [0, false],
        [-1, false],
        [Number.NaN, false],
        [Number.POSITIVE_INFINITY, false],
        ['1', false],
    ])('parses finite positive numbers', (value, expected) => {
        expect(PositiveFiniteNumber.fromUnknown(value).ok).toBe(expected);
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
