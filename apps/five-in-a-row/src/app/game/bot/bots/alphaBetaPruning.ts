import { buildNextSnapshot } from '../../buildNextSnapshot';
import type { GameState, Player } from '../../game';
import { isBoardFull } from '../../game';

const winScore = 1_000_000;
const searchDepth = 2;
const directions: ReadonlyArray<Coordinates> = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
];

interface Coordinates {
    readonly x: number;
    readonly y: number;
}

interface BuildCoordinatesProps {
    readonly index: number;
    readonly boardSize: number;
}

const buildCoordinates = ({ index, boardSize }: BuildCoordinatesProps): Coordinates => ({
    x: index % boardSize,
    y: Math.floor(index / boardSize),
});

interface BuildCenterIndexProps {
    readonly boardSize: number;
}

const buildCenterIndex = ({ boardSize }: BuildCenterIndexProps): number => {
    const center = Math.floor(boardSize / 2);

    return center * boardSize + center;
};

interface BuildIndexFromCoordinatesProps {
    readonly x: number;
    readonly y: number;
    readonly boardSize: number;
}

const buildIndexFromCoordinates = ({ x, y, boardSize }: BuildIndexFromCoordinatesProps): number =>
    y * boardSize + x;

interface IsInsideBoardProps {
    readonly x: number;
    readonly y: number;
    readonly boardSize: number;
}

const isInsideBoard = ({ x, y, boardSize }: IsInsideBoardProps): boolean =>
    x >= 0 && y >= 0 && x < boardSize && y < boardSize;

interface BuildCellValueProps {
    readonly snapshot: GameState;
    readonly x: number;
    readonly y: number;
}

const buildCellValue = ({ snapshot, x, y }: BuildCellValueProps): Player | null => {
    if (!isInsideBoard({ x, y, boardSize: snapshot.boardSize })) {
        return null;
    }

    const index = buildIndexFromCoordinates({ x, y, boardSize: snapshot.boardSize });

    return snapshot.board[index];
};

interface BuildOpponentPlayerProps {
    readonly player: Player;
}

const buildOpponentPlayer = ({ player }: BuildOpponentPlayerProps): Player =>
    player === 'cross' ? 'ring' : 'cross';

interface BuildPatternScoreProps {
    readonly runLength: number;
    readonly openEnds: number;
}

const buildPatternScore = ({ runLength, openEnds }: BuildPatternScoreProps): number => {
    if (openEnds === 0) {
        return 0;
    }

    if (runLength >= 5) {
        return 200_000;
    }

    if (runLength === 4) {
        if (openEnds === 2) {
            return 50_000;
        }

        return 10_000;
    }

    if (runLength === 3) {
        if (openEnds === 2) {
            return 2_000;
        }

        return 300;
    }

    if (runLength === 2) {
        if (openEnds === 2) {
            return 120;
        }

        return 25;
    }

    if (runLength === 1 && openEnds === 2) {
        return 8;
    }

    return 1;
};

interface BuildPlayerLineScoreProps {
    readonly snapshot: GameState;
    readonly player: Player;
}

const buildPlayerLineScore = ({ snapshot, player }: BuildPlayerLineScoreProps): number => {
    let totalScore = 0;

    for (let y = 0; y < snapshot.boardSize; y += 1) {
        for (let x = 0; x < snapshot.boardSize; x += 1) {
            if (buildCellValue({ snapshot, x, y }) !== player) {
                continue;
            }

            for (const direction of directions) {
                const previousX = x - direction.x;
                const previousY = y - direction.y;

                if (buildCellValue({ snapshot, x: previousX, y: previousY }) === player) {
                    continue;
                }

                let runLength = 0;
                let nextX = x;
                let nextY = y;

                while (buildCellValue({ snapshot, x: nextX, y: nextY }) === player) {
                    runLength += 1;
                    nextX += direction.x;
                    nextY += direction.y;
                }

                const headX = nextX;
                const headY = nextY;
                const tailX = x - direction.x;
                const tailY = y - direction.y;
                const openHead = buildCellValue({ snapshot, x: headX, y: headY }) === null;
                const openTail = buildCellValue({ snapshot, x: tailX, y: tailY }) === null;
                const openEnds = Number(openHead) + Number(openTail);

                totalScore += buildPatternScore({ runLength, openEnds });
            }
        }
    }

    return totalScore;
};

interface EvaluateHeuristicScoreProps {
    readonly snapshot: GameState;
    readonly maximizingPlayer: Player;
}

const evaluateHeuristicScore = ({
    snapshot,
    maximizingPlayer,
}: EvaluateHeuristicScoreProps): number => {
    const minimizingPlayer = buildOpponentPlayer({ player: maximizingPlayer });
    const maximizingScore = buildPlayerLineScore({ snapshot, player: maximizingPlayer });
    const minimizingScore = buildPlayerLineScore({ snapshot, player: minimizingPlayer });

    return maximizingScore - minimizingScore;
};

interface BuildPreferredMovesNearLastMoveProps {
    readonly snapshot: GameState;
}

const buildPreferredMovesNearLastMove = ({
    snapshot,
}: BuildPreferredMovesNearLastMoveProps): ReadonlyArray<number> => {
    if (snapshot.lastMoveIndex === null) {
        return [];
    }

    const { x: lastMoveX, y: lastMoveY } = buildCoordinates({
        index: snapshot.lastMoveIndex,
        boardSize: snapshot.boardSize,
    });

    const moves: Array<number> = [];
    const offsets: ReadonlyArray<Coordinates> = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: -1 },
    ];

    for (const offset of offsets) {
        const x = lastMoveX + offset.x;
        const y = lastMoveY + offset.y;

        if (!isInsideBoard({ x, y, boardSize: snapshot.boardSize })) {
            continue;
        }

        const index = buildIndexFromCoordinates({ x, y, boardSize: snapshot.boardSize });

        if (snapshot.board[index] === null) {
            moves.push(index);
        }
    }

    return moves;
};

interface BuildAvailableMovesProps {
    readonly snapshot: GameState;
}

const buildAvailableMoves = ({ snapshot }: BuildAvailableMovesProps): ReadonlyArray<number> => {
    const preferredNearLastMove = buildPreferredMovesNearLastMove({ snapshot });
    const seen = new Set<number>(preferredNearLastMove);
    const allMoves: Array<number> = [...preferredNearLastMove];

    if (snapshot.moveCount === 0) {
        const center = buildCenterIndex({ boardSize: snapshot.boardSize });

        if (!seen.has(center) && snapshot.board[center] === null) {
            seen.add(center);
            allMoves.unshift(center);
        }
    }

    for (let index = 0; index < snapshot.board.length; index += 1) {
        if (snapshot.board[index] !== null || seen.has(index)) {
            continue;
        }

        seen.add(index);
        allMoves.push(index);
    }

    return allMoves;
};

interface EvaluateTerminalScoreProps {
    readonly snapshot: GameState;
    readonly maximizingPlayer: Player;
    readonly depth: number;
}

const evaluateTerminalScore = ({
    snapshot,
    maximizingPlayer,
    depth,
}: EvaluateTerminalScoreProps): number | null => {
    if (snapshot.winner !== null) {
        if (snapshot.winner.player === maximizingPlayer) {
            return winScore - depth;
        }

        return depth - winScore;
    }

    if (isBoardFull({ board: snapshot.board })) {
        return 0;
    }

    return null;
};

interface MinimaxProps {
    readonly snapshot: GameState;
    readonly maximizingPlayer: Player;
    readonly depthLeft: number;
    readonly depth: number;
    readonly alpha: number;
    readonly beta: number;
}

const minimax = ({
    snapshot,
    maximizingPlayer,
    depthLeft,
    depth,
    alpha,
    beta,
}: MinimaxProps): number => {
    const terminalScore = evaluateTerminalScore({ snapshot, maximizingPlayer, depth });

    if (terminalScore !== null) {
        return terminalScore;
    }

    if (depthLeft === 0) {
        return evaluateHeuristicScore({ snapshot, maximizingPlayer });
    }

    const moves = buildAvailableMoves({ snapshot });
    const isMaximizing = snapshot.currentPlayer === maximizingPlayer;
    let currentAlpha = alpha;
    let currentBeta = beta;

    if (isMaximizing) {
        let bestScore = Number.NEGATIVE_INFINITY;

        for (const move of moves) {
            const nextSnapshot = buildNextSnapshot({ snapshot, index: move });

            if (nextSnapshot === null) {
                continue;
            }

            const score = minimax({
                snapshot: nextSnapshot,
                maximizingPlayer,
                depthLeft: depthLeft - 1,
                depth: depth + 1,
                alpha: currentAlpha,
                beta: currentBeta,
            });

            if (score > bestScore) {
                bestScore = score;
            }

            if (score > currentAlpha) {
                currentAlpha = score;
            }

            if (currentAlpha >= currentBeta) {
                break;
            }
        }

        return bestScore;
    }

    let bestScore = Number.POSITIVE_INFINITY;

    for (const move of moves) {
        const nextSnapshot = buildNextSnapshot({ snapshot, index: move });

        if (nextSnapshot === null) {
            continue;
        }

        const score = minimax({
            snapshot: nextSnapshot,
            maximizingPlayer,
            depthLeft: depthLeft - 1,
            depth: depth + 1,
            alpha: currentAlpha,
            beta: currentBeta,
        });

        if (score < bestScore) {
            bestScore = score;
        }

        if (score < currentBeta) {
            currentBeta = score;
        }

        if (currentAlpha >= currentBeta) {
            break;
        }
    }

    return bestScore;
};

export const alphaBetaPruning = (state: GameState): number | null => {
    if (state.winner !== null || isBoardFull({ board: state.board })) {
        return null;
    }

    const moves = buildAvailableMoves({ snapshot: state });

    if (moves.length === 0) {
        return null;
    }

    let bestMove = moves[0] ?? null;
    let bestScore = Number.NEGATIVE_INFINITY;
    let alpha = Number.NEGATIVE_INFINITY;
    const beta = Number.POSITIVE_INFINITY;

    for (const move of moves) {
        const nextSnapshot = buildNextSnapshot({ snapshot: state, index: move });

        if (nextSnapshot === null) {
            continue;
        }

        const score = minimax({
            snapshot: nextSnapshot,
            maximizingPlayer: state.currentPlayer,
            depthLeft: searchDepth,
            depth: 1,
            alpha,
            beta,
        });

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }

        if (score > alpha) {
            alpha = score;
        }
    }

    return bestMove;
};
