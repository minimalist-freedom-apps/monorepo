import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { normalizeBtcInput } from './normalizeBtcInput';

describe(normalizeBtcInput.name, () => {
    const testCases: ReadonlyArray<{
        readonly input: string;
        readonly display: string;
        readonly numeric: string;
        readonly label: string;
    }> = [
        { input: '2', display: '2', numeric: '2', label: 'single digit' },
        { input: '1234', display: '1,234', numeric: '1234', label: 'adds thousand separators' },
        {
            input: '1234.56',
            display: '1,234.56',
            numeric: '1234.56',
            label: 'formats integer part with decimals',
        },
        { input: '0.234', display: '0.23,4', numeric: '0.234', label: 'groups decimal digits' },
        {
            input: '0.1234456789',
            display: '0.12,345,678',
            numeric: '0.12345678',
            label: 'limits to 8 decimal digits',
        },
        { input: '-1', display: '-1', numeric: '-1', label: 'handles negative integer' },
        {
            input: '-0.00001',
            display: '-0.00,001',
            numeric: '-0.00001',
            label: 'handles negative decimal',
        },
        {
            input: '1,234',
            display: '1,234',
            numeric: '1234',
            label: 'handles pre-formatted input',
        },
        {
            input: '0012',
            display: '12',
            numeric: '12',
            label: 'strips leading zeros from integer',
        },
    ];

    testCases.forEach(({ label, input, display, numeric }) => {
        test(`${label} (${input} → ${display})`, () => {
            const result = normalizeBtcInput(input);
            assert.strictEqual(result.display, display);
            assert.strictEqual(result.numeric, numeric);
        });
    });
});
