import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isValidNumberInput } from './isValidNumberInput';

describe(isValidNumberInput.name, () => {
    const valid: ReadonlyArray<readonly [string, string]> = [
        ['', 'allows empty string'],
        ['123', 'allows digits'],
        ['1.5', 'allows decimal point'],
        ['1.', 'allows trailing decimal point (incomplete number)'],
        ['.5', 'allows leading decimal point'],
        ['1,000', 'allows comma as thousand separator'],
        ['1,', 'allows trailing comma (incomplete formatting)'],
        ['-', 'allows minus sign alone (incomplete negative)'],
        ['-1,000.50', 'allows negative number'],
    ];

    for (const [input, description] of valid) {
        test(`${input} — ${description}`, () => {
            assert.strictEqual(isValidNumberInput(input), true);
        });
    }

    const invalid: ReadonlyArray<readonly [string, string]> = [
        ['abc', 'rejects letters'],
        ['12a3', 'rejects mixed letters and digits'],
        ['1@2', 'rejects special characters'],
        ['1 2', 'rejects spaces'],
        ['1.2.3', 'rejects multiple decimal points'],
        ['--1', 'rejects multiple minus signs'],
        ['1-2', 'rejects minus not at start'],
    ];

    for (const [input, description] of invalid) {
        test(`${input} — ${description}`, () => {
            assert.strictEqual(isValidNumberInput(input), false);
        });
    }
});
