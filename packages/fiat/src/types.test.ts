import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { CurrencyCode } from './types.js';

describe('CurrencyCode', () => {
    for (const testCase of [
        ['USD', 'accepts a three-letter uppercase code', true],
        ['usd', 'rejects lowercase letters', false],
        ['US', 'rejects a short code', false],
        ['USDT', 'rejects a long code', false],
    ] as const) {
        test('%s: %s' + ': ' + JSON.stringify(testCase), () => {
            const [value, _description, expected] = testCase;
            assert.strictEqual(CurrencyCode.fromUnknown(value).ok, expected);
        });
    }
});
