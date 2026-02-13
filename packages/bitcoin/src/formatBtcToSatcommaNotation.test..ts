import { describe, expect, test } from 'vitest';
import { formatBtcToSatcommaNotation } from './formatBtcToSatcommaNotation.js';
import type { AmountBtc } from './types.js';

describe(formatBtcToSatcommaNotation.name, () => {
    const testCases: Array<{
        readonly input: number;
        readonly expected: string;
    }> = [
        // Zero values
        { input: 0, expected: '0' },

        // Very small numbers with scientific notation
        { input: 1e-16, expected: '0' },
        { input: 1e-9, expected: '0' },

        // Integers and large numbers trails zeros
        { input: 1, expected: '1.00,000,000' },
        { input: 100, expected: '100.00,000,000' },
        { input: 21000000, expected: '21,000,000.00,000,000' },

        // Negative numbers
        { input: -0.00001, expected: '-0.00,001,000' },
        { input: -1.23456789, expected: '-1.23,456,789' },
    ];

    test.each(testCases)('formats $input to $expected', ({ input, expected }) => {
        expect(formatBtcToSatcommaNotation(input as AmountBtc)).toBe(expected);
    });
});
