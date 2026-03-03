import { describe, expect, test } from 'vitest';
import { groupBtcDecimalDigits } from './groupBtcDecimalDigits';

describe(groupBtcDecimalDigits.name, () => {
    const testCases: ReadonlyArray<readonly [string, string, string]> = [
        ['', '', 'handles empty string'],
        ['1', '1', 'keeps single digit'],
        ['12', '12', 'keeps two digits'],
        ['123', '123', 'keeps three digits'],
        ['1234', '1,234', 'groups four digits'],
        ['12345678', '12,345,678', 'groups eight digits'],
        ['00000000', '00,000,000', 'groups zeros'],
        ['00001000', '00,001,000', 'groups with leading and trailing zeros'],
        ['23456789', '23,456,789', 'groups without padding'],
    ];

    test.each(testCases)('%s → %s — %s', (input, expected) => {
        expect(groupBtcDecimalDigits(input)).toBe(expected);
    });
});
