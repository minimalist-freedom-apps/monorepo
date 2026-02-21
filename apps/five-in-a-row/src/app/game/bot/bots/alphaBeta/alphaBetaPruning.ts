import { buildNextSnapshot } from '../../../buildNextSnapshot';
import type { Coordinates, GameState, Player } from '../../../game';
import { buildCellIndex, buildCoordinates, isBoardFull, isInsideBoard } from '../../../game';
import { buildPlayerLineScore } from './buildPlayerLineScore';

// Very large terminal score used by minimax when a win/loss is reached.
const WIN_SCORE = 1_000_000;

// Search ply after the root move. Keep this low for responsive gameplay on larger boards.
const SEARCH_DEPTH = 2;

interface BuildCenterIndexProps {
    readonly boardSize: number;
}

const buildCenterIndex = ({ boardSize }: BuildCenterIndexProps): number => {
    const center = Math.floor(boardSize / 2);

    return center * boardSize + center;
};

interface BuildOpponentPlayerProps {
    readonly player: Player;
}

const buildOpponentPlayer = ({ player }: BuildOpponentPlayerProps): Player =>
    player === 'cross' ? 'ring' : 'cross';

interface EvaluateHeuristicScoreProps {
    readonly snapshot: GameState;
    readonly maximizingPlayer: Player;
}

// Non-terminal leaf evaluation: our pressure minus opponent pressure.
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

const OFFSETS: ReadonlyArray<Coordinates> = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];

// Prioritize local tactical answers around the latest move before global move scan.
const buildPreferredMovesNearLastMove = ({
    snapshot,
}: BuildPreferredMovesNearLastMoveProps): ReadonlyArray<number> => {
    if (snapshot.lastMoveIndex === null) {
        return [];
    }

    const { x: lastMoveX, y: lastMoveY } = buildCoordinates({
        index: snapshot.lastMoveIndex,
        size: snapshot.boardSize,
    });

    const moves: Array<number> = [];

    for (const offset of OFFSETS) {
        const x = lastMoveX + offset.x;
        const y = lastMoveY + offset.y;

        if (!isInsideBoard({ x, y, size: snapshot.boardSize })) {
            continue;
        }

        const index = buildCellIndex({ x, y, size: snapshot.boardSize });

        if (snapshot.board[index] === null) {
            moves.push(index);
        }
    }

    return moves;
};

interface BuildAvailableMovesProps {
    readonly snapshot: GameState;
}

// Deterministic move ordering improves alpha-beta pruning and keeps opening sensible.
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

// Terminal scoring prefers faster wins and slower losses via depth adjustment.
const evaluateTerminalScore = ({
    snapshot,
    maximizingPlayer,
    depth,
}: EvaluateTerminalScoreProps): number | null => {
    if (snapshot.winner !== null) {
        if (snapshot.winner.player === maximizingPlayer) {
            return WIN_SCORE - depth;
        }

        return depth - WIN_SCORE;
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

// Depth-limited minimax with alpha-beta pruning.
// Maximizing/minimizing side is inferred from snapshot.currentPlayer.
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
    // No legal move when game already ended or board is full.
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

    // Root search: choose the move with highest minimax score.
    for (const move of moves) {
        const nextSnapshot = buildNextSnapshot({ snapshot: state, index: move });

        if (nextSnapshot === null) {
            continue;
        }

        const score = minimax({
            snapshot: nextSnapshot,
            maximizingPlayer: state.currentPlayer,
            depthLeft: SEARCH_DEPTH,
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
