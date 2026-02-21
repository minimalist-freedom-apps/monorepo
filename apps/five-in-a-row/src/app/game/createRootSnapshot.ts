import { type GameBoard, type GameState, startingPlayer } from './game';

interface CreateEmptyBoardProps {
    readonly size: number;
}

export const createEmptyBoard = ({ size }: CreateEmptyBoardProps): GameBoard =>
    Array.from({ length: size * size }, () => null);

interface CreateSnapshotProps {
    readonly boardSize: number;
}

export const createRootSnapshot = ({ boardSize }: CreateSnapshotProps): GameState => ({
    boardSize,
    board: createEmptyBoard({ size: boardSize }),
    currentPlayer: startingPlayer,
    winner: null,
    moveCount: 0,
    lastMoveIndex: null,
});
