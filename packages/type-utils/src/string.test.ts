import { describe, expect, expectTypeOf, test } from 'vitest';
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

    test.each(testCases)('returns $expected for $input', ({
        input,
        expected,
    }) => {
        expect(isNonEmpty(input)).toBe(expected);
    });

    test('narrows string | null | undefined to string', () => {
        const value: string | null | undefined = 'test';

        if (isNonEmpty(value)) {
            expectTypeOf(value).toEqualTypeOf<string>();
        }
    });

    test('excludes empty string from union', () => {
        const value: 'foo' | 'bar' | '' | null = 'foo';

        if (isNonEmpty(value)) {
            expectTypeOf(value).toExtend<'foo' | 'bar'>();
        }
    });

    test('works for non-string types', () => {
        type TestType = { a: number };
        const value: TestType | null = { a: 1 };

        if (isNonEmpty(value)) {
            expectTypeOf(value).toExtend<TestType>();
        }
    });
});
