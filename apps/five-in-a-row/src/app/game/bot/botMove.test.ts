import { describe, expect, test } from 'vitest';
import { createEmptyBoard } from '../createRootSnapshot';
import type { GameState } from '../game';
import { botMove } from './botMove';

interface CreateStateProps {
    readonly boardSize: number;
    readonly currentPlayer: 'ring' | 'cross';
    readonly moveCount: number;
    readonly lastMoveIndex: number | null;
    readonly board?: GameState['board'];
}

const createState = ({
    boardSize,
    currentPlayer,
    moveCount,
    lastMoveIndex,
    board,
}: CreateStateProps): GameState => ({
    boardSize,
    board: board ?? createEmptyBoard({ size: boardSize }),
    currentPlayer,
    winner: null,
    moveCount,
    lastMoveIndex,
});

describe(botMove.name, () => {
    test('returns middle index when bot is first', () => {
        const state = createState({
            boardSize: 5,
            currentPlayer: 'cross',
            moveCount: 0,
            lastMoveIndex: null,
        });

        const moveIndex = botMove(state);

        expect(moveIndex).toBe(12);
    });

    test('returns index next to opponent last move', () => {
        const board = createEmptyBoard({ size: 5 });
        board[6] = 'ring';

        const state = createState({
            boardSize: 5,
            currentPlayer: 'cross',
            moveCount: 1,
            lastMoveIndex: 6,
            board,
        });

        const moveIndex = botMove(state);

        expect(moveIndex).toBe(7);
    });
});
