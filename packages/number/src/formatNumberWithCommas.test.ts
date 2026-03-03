import { describe, expect, test } from 'vitest';
import { formatNumberWithCommas } from './formatNumberWithCommas';

describe(formatNumberWithCommas.name, () => {
    const testCases: ReadonlyArray<{
        readonly value: number;
        readonly precision: number;
        readonly expected: string;
        readonly label: string;
    }> = [
        { value: 0, precision: 3, expected: '0', label: 'formats zero' },
        { value: 1, precision: 3, expected: '1', label: 'formats integer' },
        { value: 1234, precision: 3, expected: '1,234', label: 'adds thousand separators' },
        { value: 1234.5, precision: 3, expected: '1,234.5', label: 'strips trailing zeros' },
        { value: 12.345, precision: 3, expected: '12.345', label: 'keeps meaningful decimals' },
        {
            value: 123456789.123,
            precision: 3,
            expected: '123,456,789.123',
            label: 'formats large number',
        },
        { value: -1234567.89, precision: 3, expected: '-1,234,567.89', label: 'formats negative' },
        { value: 999.999, precision: 3, expected: '999.999', label: 'keeps all decimals' },
        { value: 1000, precision: 3, expected: '1,000', label: 'strips .000' },
        { value: 1.5, precision: 1, expected: '1.5', label: 'respects precision 1' },
        { value: 1.123456, precision: 5, expected: '1.12346', label: 'respects precision 5' },
    ];

    test.each(testCases)('$label ($value, precision=$precision → $expected)', ({
        value,
        precision,
        expected,
    }) => {
        expect(formatNumberWithCommas({ value, precision })).toBe(expected);
    });
});
