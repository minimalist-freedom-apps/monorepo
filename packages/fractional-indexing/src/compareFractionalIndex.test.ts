import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { compareFractionalIndex } from './compareFractionalIndex';
import type { FractionalIndex } from './FractionalIndex';

describe(compareFractionalIndex.name, () => {
    const cases: ReadonlyArray<readonly [string, FractionalIndex, FractionalIndex, number]> = [
        ['returns -1 when a < b', 'a0' as FractionalIndex, 'a1' as FractionalIndex, -1],
        ['returns 1 when a > b', 'a2' as FractionalIndex, 'a1' as FractionalIndex, 1],
        ['returns 0 when a === b', 'a1' as FractionalIndex, 'a1' as FractionalIndex, 0],
        [
            'handles fractional parts correctly',
            'a1' as FractionalIndex,
            'a1V' as FractionalIndex,
            -1,
        ],
        [
            'sorts uppercase before lowercase (case-sensitive)',
            'Zz' as FractionalIndex,
            'a0' as FractionalIndex,
            -1,
        ],
    ];

    for (const testCase of cases) {
        test('%s' + ': ' + JSON.stringify(testCase), () => {
            const [_, a, b, expected] = testCase;
            assert.strictEqual(compareFractionalIndex(a, b), expected);
        });
    }
});
