export type Player = 'cross' | 'ring';

export const ringEmoji = '🔵';
export const crossEmoji = '❌';

export const emojiMap: Record<Player, string> = {
    cross: crossEmoji,
    ring: ringEmoji,
};

export type GameBoard = Array<Player | null>;

export interface GameState {
    readonly boardSize: number;
    readonly board: GameBoard;
    readonly currentPlayer: Player;
    readonly winner: Winner | null;
    readonly moveCount: number;
    readonly lastMoveIndex: number | null;
}

export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
];

const winLength = 5;

export interface Coordinates {
    readonly x: number;
    readonly y: number;
}

interface BuildCoordinatesProps {
    readonly index: number;
    readonly size: number;
}

export const buildCoordinates = ({ index, size }: BuildCoordinatesProps): Coordinates => ({
    x: index % size,
    y: Math.floor(index / size),
});

interface CellCoordinatesProps {
    readonly x: number;
    readonly y: number;
    readonly size: number;
}

export const buildCellIndex = ({ x, y, size }: CellCoordinatesProps): number => y * size + x;

export const isInsideBoard = ({ x, y, size }: CellCoordinatesProps): boolean =>
    x >= 0 && y >= 0 && x < size && y < size;

interface CollectCellsInDirectionProps {
    readonly board: GameBoard;
    readonly size: number;
    readonly startX: number;
    readonly startY: number;
    readonly directionX: number;
    readonly directionY: number;
    readonly player: Player;
}

const collectCellsInDirection = ({
    board,
    size,
    startX,
    startY,
    directionX,
    directionY,
    player,
}: CollectCellsInDirectionProps): ReadonlyArray<number> => {
    const cells: Array<number> = [];
    let x = startX + directionX;
    let y = startY + directionY;

    while (isInsideBoard({ x, y, size })) {
        const index = buildCellIndex({ x, y, size });

        if (board[index] !== player) {
            break;
        }

        cells.push(index);
        x += directionX;
        y += directionY;
    }

    return cells;
};

interface BuildTargetLineLengthProps {
    readonly size: number;
}

const buildTargetLineLength = ({ size }: BuildTargetLineLengthProps): number =>
    size < winLength ? size : winLength;

interface IsBoardFullProps {
    readonly board: GameBoard;
}

export const isBoardFull = ({ board }: IsBoardFullProps): boolean =>
    board.every(cell => cell !== null);

interface GetNextPlayerProps {
    readonly player: Player;
}

export const getNextPlayer = ({ player }: GetNextPlayerProps): Player =>
    player === 'cross' ? 'ring' : 'cross';

interface FindWinnerProps {
    readonly board: GameBoard;
    readonly size: number;
    readonly lastMoveIndex: number;
}

export interface Winner {
    readonly player: Player;
    readonly cellIndexes: ReadonlyArray<number>;
}

export const findWinner = ({ board, size, lastMoveIndex }: FindWinnerProps): Winner | null => {
    const player = board[lastMoveIndex];

    if (player === null) {
        return null;
    }

    const startX = lastMoveIndex % size;
    const startY = Math.floor(lastMoveIndex / size);
    const targetLineLength = buildTargetLineLength({ size });

    for (const [directionX, directionY] of DIRECTIONS) {
        const backwardCells = collectCellsInDirection({
            board,
            size,
            startX,
            startY,
            directionX: -directionX,
            directionY: -directionY,
            player,
        });
        const forwardCells = collectCellsInDirection({
            board,
            size,
            startX,
            startY,
            directionX,
            directionY,
            player,
        });

        const line = [...[...backwardCells].reverse(), lastMoveIndex, ...forwardCells];

        if (line.length >= targetLineLength) {
            return {
                player,
                cellIndexes: line,
            };
        }
    }

    return null;
};
