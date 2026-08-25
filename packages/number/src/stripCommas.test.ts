import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
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

    for (const testCase of testCases) {
        test('%s → %s — %s' + ': ' + JSON.stringify(testCase), () => {
            const [input, expected] = testCase;
            assert.strictEqual(stripCommas(input), expected);
        });
    }
});
