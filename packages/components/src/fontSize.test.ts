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

    dataProvider.forEach(({ fontSize, steps, expected }) => {
        test(`returns ${expected} for ${fontSize} decreased by ${steps}`, () => {
            assert.strictEqual(decreaseFontSize(fontSize, steps), expected);
        });
    });
});
