import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { decreaseFontSize } from './fontSize';

describe(decreaseFontSize.name, () => {
    const dataProvider = [
        { fontSize: 'large', steps: 1, expected: 'medium' },
        { fontSize: 'medium', steps: 1, expected: 'small' },
        { fontSize: 'small', steps: 1, expected: 'tiny' },
        { fontSize: 'large', steps: 2, expected: 'small' },
        { fontSize: 'medium', steps: 2, expected: 'tiny' },
        { fontSize: 'tiny', steps: 1, expected: 'tiny' },
        { fontSize: 'small', steps: 2, expected: 'tiny' },
        { fontSize: 'large', steps: 99, expected: 'tiny' },
        { fontSize: 'tiny', steps: 0, expected: 'tiny' },
        { fontSize: 'small', steps: 0, expected: 'small' },
        { fontSize: 'medium', steps: 0, expected: 'medium' },
        { fontSize: 'large', steps: 0, expected: 'large' },
    ] as const;

    for (const testCase of dataProvider) {
        test(
            'returns $expected for $fontSize decreased by $steps' + ': ' + JSON.stringify(testCase),
            () => {
                const value = testCase;
                assert.strictEqual(decreaseFontSize(value.fontSize, value.steps), value.expected);
            },
        );
    }
});
