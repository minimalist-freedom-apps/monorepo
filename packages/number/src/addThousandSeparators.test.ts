import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
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

    for (const testCase of testCases) {
        test('%s → %s — %s' + ': ' + JSON.stringify(testCase), () => {
            const [input, expected] = testCase;
            assert.strictEqual(addThousandSeparators(input), expected);
        });
    }
});
