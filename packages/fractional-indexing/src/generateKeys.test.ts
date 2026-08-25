import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { compareFractionalIndex } from './compareFractionalIndex';
import type { FractionalIndex } from './FractionalIndex';
import { generateIndexBetween, generateNIndicesBetween } from './generateKeys';

describe(generateIndexBetween.name, () => {
    test('generates first key when both bounds are null', () => {
        const key = generateIndexBetween(null, null);
        assert.strictEqual(key, 'a0');
    });

    test('generates key after existing key', () => {
        const first = generateIndexBetween(null, null);
        const second = generateIndexBetween(first, null);
        assert.strictEqual(compareFractionalIndex(first, second), -1);
    });

    test('generates key before existing key', () => {
        const first = generateIndexBetween(null, null);
        const before = generateIndexBetween(null, first);
        assert.strictEqual(compareFractionalIndex(before, first), -1);
    });

    test('generates key between two existing keys', () => {
        const first = generateIndexBetween(null, null);
        const second = generateIndexBetween(first, null);
        const between = generateIndexBetween(first, second);
        assert.strictEqual(compareFractionalIndex(first, between), -1);
        assert.strictEqual(compareFractionalIndex(between, second), -1);
    });

    test('returns branded FractionalIndex type', () => {
        const key: FractionalIndex = generateIndexBetween(null, null);
        // If this compiles, the type is correct
        assert.strictEqual(typeof key, 'string');
    });
});

describe(generateNIndicesBetween.name, () => {
    test('generates 0 keys', () => {
        const keys = generateNIndicesBetween(null, null, 0);
        assert.deepStrictEqual(keys, []);
    });

    test('generates 1 key', () => {
        const keys = generateNIndicesBetween(null, null, 1);
        assert.strictEqual(keys.length, 1);
    });

    test('generates n keys in sorted order', () => {
        const keys = generateNIndicesBetween(null, null, 5);
        assert.strictEqual(keys.length, 5);

        const sorted = [...keys].sort(compareFractionalIndex);
        assert.deepStrictEqual(keys, sorted);
    });

    test('generates keys between two bounds in sorted order', () => {
        const first = generateIndexBetween(null, null);
        const last = generateIndexBetween(first, null);
        const between = generateNIndicesBetween(first, last, 3);

        assert.strictEqual(between.length, 3);

        for (const key of between) {
            assert.strictEqual(compareFractionalIndex(first, key), -1);
            assert.strictEqual(compareFractionalIndex(key, last), -1);
        }

        const sorted = [...between].sort(compareFractionalIndex);
        assert.deepStrictEqual(between, sorted);
    });

    test('returns readonly array of FractionalIndex', () => {
        const keys: ReadonlyArray<FractionalIndex> = generateNIndicesBetween(null, null, 3);
        assert.strictEqual(keys.length, 3);
    });
});
