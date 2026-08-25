import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isNonEmpty } from './string.js';

describe(isNonEmpty.name, () => {
    const testCases: Array<{
        readonly input: string | null | undefined;
        readonly expected: boolean;
    }> = [
        { input: 'hello', expected: true },
        { input: 'a', expected: true },
        { input: ' ', expected: true },
        { input: '', expected: false },
        { input: null, expected: false },
        { input: undefined, expected: false },
    ];

    testCases.forEach(({ input, expected }) => {
        test(`returns ${expected} for ${String(input)}`, () => {
            assert.strictEqual(isNonEmpty(input), expected);
        });
    });

    test('narrows string | null | undefined to string', () => {
        const value: string | null | undefined = 'test';

        if (isNonEmpty(value)) {
            const narrowed: string = value;
            assert.strictEqual(narrowed, 'test');
        }
    });

    test('excludes empty string from union', () => {
        const value: 'foo' | 'bar' | '' | null = 'foo';

        if (isNonEmpty(value)) {
            const narrowed: 'foo' | 'bar' = value;
            assert.strictEqual(narrowed, 'foo');
        }
    });

    test('works for non-string types', () => {
        type TestType = { a: number };
        const value: TestType | null = { a: 1 };

        if (isNonEmpty(value)) {
            const narrowed: TestType = value;
            assert.deepStrictEqual(narrowed, { a: 1 });
        }
    });
});
