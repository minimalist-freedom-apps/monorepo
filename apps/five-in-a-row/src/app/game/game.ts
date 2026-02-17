export type Player = 'cross' | 'ring';

export const ringEmoji = '🔵';
export const crossEmoji = '❌';

export const emojiMap: Record<Player, string> = {
    cross: crossEmoji,
    ring: ringEmoji,
};

export type GameBoard = Array<Player | null>;

export interface Winner {
    readonly player: Player;
    readonly cellIndexes: ReadonlyArray<number>;
}

interface CreateEmptyBoardProps {
    readonly size: number;
}

interface IsBoardFullProps {
    readonly board: GameBoard;
}

interface GetNextPlayerProps {
    readonly player: Player;
}

interface FindWinnerProps {
    readonly board: GameBoard;
    readonly size: number;
    readonly lastMoveIndex: number;
}

interface CollectCellsInDirectionProps {
    readonly board: GameBoard;
    readonly size: number;
    readonly startX: number;
    readonly startY: number;
    readonly directionX: number;
    readonly directionY: number;
    readonly player: Player;
}

interface CellCoordinatesProps {
    readonly x: number;
    readonly y: number;
    readonly size: number;
}

interface BuildTargetLineLengthProps {
    readonly size: number;
}

const directions: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
];

const winLength = 5;

const buildCellIndex = ({ x, y, size }: CellCoordinatesProps): number => y * size + x;

const isInsideBoard = ({ x, y, size }: CellCoordinatesProps): boolean =>
    x >= 0 && y >= 0 && x < size && y < size;

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

const buildTargetLineLength = ({ size }: BuildTargetLineLengthProps): number =>
    size < winLength ? size : winLength;

export const createEmptyBoard = ({ size }: CreateEmptyBoardProps): GameBoard =>
    Array.from({ length: size * size }, () => null);

export const isBoardFull = ({ board }: IsBoardFullProps): boolean =>
    board.every(cell => cell !== null);

export const getNextPlayer = ({ player }: GetNextPlayerProps): Player =>
    player === 'cross' ? 'ring' : 'cross';

export const findWinner = ({ board, size, lastMoveIndex }: FindWinnerProps): Winner | null => {
    const player = board[lastMoveIndex];

    if (player === null) {
        return null;
    }

    const startX = lastMoveIndex % size;
    const startY = Math.floor(lastMoveIndex / size);
    const targetLineLength = buildTargetLineLength({ size });

    for (const [directionX, directionY] of directions) {
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
