import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createEmptyBoard } from './createRootSnapshot';

describe(createEmptyBoard.name, () => {
    [
        {
            label: 'creates board with expected number of cells',
            size: 3,
            expected: [null, null, null, null, null, null, null, null, null],
        },
    ].forEach(({ label, size, expected }) => {
        test(label, () => {
            const board = createEmptyBoard({ size });
            assert.deepStrictEqual(board, expected);
        });
    });
});
