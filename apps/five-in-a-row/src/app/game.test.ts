import { describe, expect, test } from 'vitest';
import { createEmptyBoard, findWinner, type GameBoard, getNextPlayer, isBoardFull } from './game';

describe(createEmptyBoard.name, () => {
    test('creates board with expected number of cells', () => {
        const board = createEmptyBoard({ size: 3 });

        expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
    });
});

describe(getNextPlayer.name, () => {
    test('toggles from cross to ring', () => {
        expect(getNextPlayer({ player: 'cross' })).toBe('ring');
    });

    test('toggles from ring to cross', () => {
        expect(getNextPlayer({ player: 'ring' })).toBe('cross');
    });
});

describe(isBoardFull.name, () => {
    test('returns false if at least one cell is empty', () => {
        expect(isBoardFull({ board: ['cross', null] })).toBe(false);
    });

    test('returns true if all cells are filled', () => {
        expect(isBoardFull({ board: ['cross', 'ring'] })).toBe(true);
    });
});

describe(findWinner.name, () => {
    test('detects horizontal winner on 10x10 board', () => {
        const board = createEmptyBoard({ size: 10 });

        board[20] = 'cross';
        board[21] = 'cross';
        board[22] = 'cross';
        board[23] = 'cross';
        board[24] = 'cross';

        const winner = findWinner({ board, size: 10, lastMoveIndex: 24 });

        expect(winner).toEqual({
            player: 'cross',
            cellIndexes: [20, 21, 22, 23, 24],
        });
    });

    test('detects diagonal winner on 5x5 board', () => {
        const board = createEmptyBoard({ size: 5 });

        board[0] = 'ring';
        board[6] = 'ring';
        board[12] = 'ring';
        board[18] = 'ring';
        board[24] = 'ring';

        const winner = findWinner({ board, size: 5, lastMoveIndex: 24 });

        expect(winner).toEqual({
            player: 'ring',
            cellIndexes: [0, 6, 12, 18, 24],
        });
    });

    test('uses board size as target line length for small boards', () => {
        const board: GameBoard = ['cross', 'cross', 'cross', null, null, null, null, null, null];

        const winner = findWinner({ board, size: 3, lastMoveIndex: 2 });

        expect(winner).toEqual({
            player: 'cross',
            cellIndexes: [0, 1, 2],
        });
    });

    test('returns null when there is no winning line', () => {
        const board = createEmptyBoard({ size: 5 });

        board[0] = 'cross';
        board[1] = 'cross';
        board[2] = 'cross';
        board[3] = 'ring';
        board[4] = 'cross';

        expect(findWinner({ board, size: 5, lastMoveIndex: 4 })).toBeNull();
    });
});
