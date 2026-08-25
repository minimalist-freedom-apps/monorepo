import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
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

    for (const testCase of testCases) {
        test('%s → %s — %s' + ': ' + JSON.stringify(testCase), () => {
            const [input, expected] = testCase;
            assert.strictEqual(parseFormattedNumber(input), expected);
        });
    }
});
