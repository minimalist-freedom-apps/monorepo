import { describe, expect, test } from 'vitest';
import { stripCommas } from './stripCommas';

describe(stripCommas.name, () => {
    const testCases: ReadonlyArray<readonly [string, string, string]> = [
        ['', '', 'keeps empty string'],
        ['123', '123', 'keeps string without commas'],
        ['1,234', '1234', 'removes single comma'],
        ['1,234,567', '1234567', 'removes multiple commas'],
        ['1,234.56', '1234.56', 'preserves decimal point'],
        [',,,', '', 'removes all commas'],
    ];

    test.each(testCases)('%s → %s — %s', (input, expected) => {
        expect(stripCommas(input)).toBe(expected);
    });
});
