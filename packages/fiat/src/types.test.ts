import { describe, expect, test } from 'vitest';
import { CurrencyCode } from './types.js';

describe('CurrencyCode', () => {
    test.each([
        ['USD', 'accepts a three-letter uppercase code', true],
        ['usd', 'rejects lowercase letters', false],
        ['US', 'rejects a short code', false],
        ['USDT', 'rejects a long code', false],
    ] as const)('%s: %s', (value, _description, expected) => {
        expect(CurrencyCode.fromUnknown(value).ok).toBe(expected);
    });
});
