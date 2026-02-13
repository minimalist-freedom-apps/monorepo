import { describe, expect, test } from 'vitest';
import { formatSats } from './formatSats.js';
import type { AmountSats } from './types.js';

describe(formatSats.name, () => {
    const testCases: Array<{
        readonly input: number;
        readonly expected: string;
    }> = [
        { input: 0, expected: '0' },
        { input: 1, expected: '1' },
        { input: 12.345, expected: '12.345' },
        { input: 999.999, expected: '999.999' },
        { input: 1000, expected: '1,000' },
        { input: 1234.5, expected: '1,234.5' },
        { input: 123456789.123, expected: '123,456,789.123' },
        { input: -1234567.89, expected: '-1,234,567.89' },
    ];

    test.each(testCases)('formats $input to $expected', ({ input, expected }) => {
        expect(formatSats(input as AmountSats)).toBe(expected);
    });
});
