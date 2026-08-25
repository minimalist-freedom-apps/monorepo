import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { CurrencyCode } from './types.js';

describe('CurrencyCode', () => {
    (
        [
            ['USD', 'accepts a three-letter uppercase code', true],
            ['usd', 'rejects lowercase letters', false],
            ['US', 'rejects a short code', false],
            ['USDT', 'rejects a long code', false],
        ] as const
    ).forEach(([value, description, expected]) => {
        test(`${value}: ${description}`, () => {
            assert.strictEqual(CurrencyCode.fromUnknown(value).ok, expected);
        });
    });
});
