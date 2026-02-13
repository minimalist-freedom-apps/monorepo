import { describe, expect, test } from 'vitest';
import { parseFormattedNumber } from './parseFormattedNumber';

describe(parseFormattedNumber.name, () => {
    const testCases: ReadonlyArray<readonly [string, number, string]> = [
        ['', 0, 'returns 0 for empty string'],
        ['0', 0, 'parses zero'],
        ['123', 123, 'parses integer'],
        ['1,234', 1234, 'strips commas and parses'],
        ['1,234,567.89', 1234567.89, 'handles commas with decimals'],
        ['-1,234', -1234, 'handles negative with commas'],
        ['0.5', 0.5, 'parses decimal'],
    ];

    test.each(testCases)('%s → %s — %s', (input, expected) => {
        expect(parseFormattedNumber(input)).toBe(expected);
    });
});
