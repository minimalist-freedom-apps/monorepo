import { describe, expect, test } from 'vitest';
import { createEmptyBoard, findWinner, type GameBoard, getNextPlayer, isBoardFull } from './game';

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

describe(getNextPlayer.name, () => {
    test.each([
        {
            label: 'toggles from cross to ring',
            player: 'cross' as const,
            expected: 'ring' as const,
        },
        {
            label: 'toggles from ring to cross',
            player: 'ring' as const,
            expected: 'cross' as const,
        },
    ])('$label', ({ player, expected }) => {
        expect(getNextPlayer({ player })).toBe(expected);
    });
});

describe(isBoardFull.name, () => {
    test.each([
        {
            label: 'returns false if at least one cell is empty',
            board: ['cross', null] as GameBoard,
            expected: false,
        },
        {
            label: 'returns true if all cells are filled',
            board: ['cross', 'ring'] as GameBoard,
            expected: true,
        },
    ])('$label', ({ board, expected }) => {
        expect(isBoardFull({ board })).toBe(expected);
    });
});

describe(findWinner.name, () => {
    test.each([
        {
            label: 'detects horizontal winner on 10x10 board',
            size: 10,
            boardBuilder: () => {
                const board = createEmptyBoard({ size: 10 });
                board[20] = 'cross';
                board[21] = 'cross';
                board[22] = 'cross';
                board[23] = 'cross';
                board[24] = 'cross';

                return board;
            },
            lastMoveIndex: 24,
            expected: {
                player: 'cross' as const,
                cellIndexes: [20, 21, 22, 23, 24],
            },
        },
        {
            label: 'detects diagonal winner on 5x5 board',
            size: 5,
            boardBuilder: () => {
                const board = createEmptyBoard({ size: 5 });
                board[0] = 'ring';
                board[6] = 'ring';
                board[12] = 'ring';
                board[18] = 'ring';
                board[24] = 'ring';

                return board;
            },
            lastMoveIndex: 24,
            expected: {
                player: 'ring' as const,
                cellIndexes: [0, 6, 12, 18, 24],
            },
        },
        {
            label: 'uses board size as target line length for small boards',
            size: 3,
            boardBuilder: () =>
                ['cross', 'cross', 'cross', null, null, null, null, null, null] as GameBoard,
            lastMoveIndex: 2,
            expected: {
                player: 'cross' as const,
                cellIndexes: [0, 1, 2],
            },
        },
        {
            label: 'returns null when there is no winning line',
            size: 5,
            boardBuilder: () => {
                const board = createEmptyBoard({ size: 5 });
                board[0] = 'cross';
                board[1] = 'cross';
                board[2] = 'cross';
                board[3] = 'ring';
                board[4] = 'cross';

                return board;
            },
            lastMoveIndex: 4,
            expected: null,
        },
    ])('$label', ({ size, boardBuilder, lastMoveIndex, expected }) => {
        const board = boardBuilder();

        expect(findWinner({ board, size, lastMoveIndex })).toEqual(expected);
    });
});
