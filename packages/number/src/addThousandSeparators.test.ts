import { describe, expect, test } from 'vitest';
import { addThousandSeparators } from './addThousandSeparators';

describe(addThousandSeparators.name, () => {
    const testCases: ReadonlyArray<readonly [string, string, string]> = [
        ['0', '0', 'keeps zero'],
        ['1', '1', 'keeps single digit'],
        ['12', '12', 'keeps two digits'],
        ['123', '123', 'keeps three digits'],
        ['1234', '1,234', 'separates four digits'],
        ['12345', '12,345', 'separates five digits'],
        ['123456', '123,456', 'separates six digits'],
        ['1234567', '1,234,567', 'separates seven digits'],
        ['1234567890', '1,234,567,890', 'separates ten digits'],
        ['-1234', '-1,234', 'handles negative sign'],
    ];

    test.each(testCases)('%s → %s — %s', (input, expected) => {
        expect(addThousandSeparators(input)).toBe(expected);
    });
});
