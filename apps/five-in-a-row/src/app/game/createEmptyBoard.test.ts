import { describe, expect, test } from 'bun:test';
import { createEmptyBoard } from './createRootSnapshot';

describe(createEmptyBoard.name, () => {
    test.each([
        {
            label: 'creates board with expected number of cells',
            size: 3,
            expected: [null, null, null, null, null, null, null, null, null],
        },
    ])('$label', ({ size, expected }) => {
        const board = createEmptyBoard({ size });

        expect(board).toEqual(expected);
    });
});
