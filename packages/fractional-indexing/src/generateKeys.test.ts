import { describe, expect, test } from 'vitest';
import { compareFractionalIndex } from './compareFractionalIndex';
import type { FractionalIndex } from './FractionalIndex';
import { generateIndexBetween, generateNIndicesBetween } from './generateKeys';

describe(generateIndexBetween.name, () => {
    test('generates first key when both bounds are null', () => {
        const key = generateIndexBetween(null, null);
        expect(key).toBe('a0');
    });

    test('generates key after existing key', () => {
        const first = generateIndexBetween(null, null);
        const second = generateIndexBetween(first, null);
        expect(compareFractionalIndex(first, second)).toBe(-1);
    });

    test('generates key before existing key', () => {
        const first = generateIndexBetween(null, null);
        const before = generateIndexBetween(null, first);
        expect(compareFractionalIndex(before, first)).toBe(-1);
    });

    test('generates key between two existing keys', () => {
        const first = generateIndexBetween(null, null);
        const second = generateIndexBetween(first, null);
        const between = generateIndexBetween(first, second);
        expect(compareFractionalIndex(first, between)).toBe(-1);
        expect(compareFractionalIndex(between, second)).toBe(-1);
    });

    test('returns branded FractionalIndex type', () => {
        const key: FractionalIndex = generateIndexBetween(null, null);
        // If this compiles, the type is correct
        expect(typeof key).toBe('string');
    });
});

describe(generateNIndicesBetween.name, () => {
    test('generates 0 keys', () => {
        const keys = generateNIndicesBetween(null, null, 0);
        expect(keys).toEqual([]);
    });

    test('generates 1 key', () => {
        const keys = generateNIndicesBetween(null, null, 1);
        expect(keys).toHaveLength(1);
    });

    test('generates n keys in sorted order', () => {
        const keys = generateNIndicesBetween(null, null, 5);
        expect(keys).toHaveLength(5);

        const sorted = [...keys].sort(compareFractionalIndex);
        expect(keys).toEqual(sorted);
    });

    test('generates keys between two bounds in sorted order', () => {
        const first = generateIndexBetween(null, null);
        const last = generateIndexBetween(first, null);
        const between = generateNIndicesBetween(first, last, 3);

        expect(between).toHaveLength(3);

        for (const key of between) {
            expect(compareFractionalIndex(first, key)).toBe(-1);
            expect(compareFractionalIndex(key, last)).toBe(-1);
        }

        const sorted = [...between].sort(compareFractionalIndex);
        expect(between).toEqual(sorted);
    });

    test('returns readonly array of FractionalIndex', () => {
        const keys: ReadonlyArray<FractionalIndex> = generateNIndicesBetween(null, null, 3);
        expect(keys).toHaveLength(3);
    });
});
