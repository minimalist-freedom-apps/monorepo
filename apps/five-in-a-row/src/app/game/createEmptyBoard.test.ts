import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createEmptyBoard } from './createRootSnapshot';

describe(createEmptyBoard.name, () => {
    for (const testCase of [
        {
            label: 'creates board with expected number of cells',
            size: 3,
            expected: [null, null, null, null, null, null, null, null, null],
        },
    ]) {
        test('$label' + ': ' + JSON.stringify(testCase), () => {
            const { size, expected } = testCase;
            const board = createEmptyBoard({ size });
            assert.deepStrictEqual(board, expected);
        });
    }
});
