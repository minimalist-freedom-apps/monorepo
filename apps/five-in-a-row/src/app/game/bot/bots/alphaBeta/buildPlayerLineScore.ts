import {
    buildCellIndex,
    DIRECTIONS,
    type GameState,
    isInsideBoard,
    type Player,
} from '../../../game';

interface BuildCellValueProps {
    readonly snapshot: GameState;
    readonly x: number;
    readonly y: number;
}

const buildCellValue = ({ snapshot, x, y }: BuildCellValueProps): Player | null => {
    if (!isInsideBoard({ x, y, size: snapshot.boardSize })) {
        return null;
    }

    const index = buildCellIndex({ x, y, size: snapshot.boardSize });

    return snapshot.board[index];
};

interface BuildPatternScoreProps {
    readonly runLength: number;
    readonly openEnds: number;
}

// Heuristic weights: longer runs and more open ends are much more valuable.
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

// Evaluates one player's board pressure by scoring every contiguous run once per direction.
export const buildPlayerLineScore = ({ snapshot, player }: BuildPlayerLineScoreProps): number => {
    let totalScore = 0;

    for (let y = 0; y < snapshot.boardSize; y += 1) {
        for (let x = 0; x < snapshot.boardSize; x += 1) {
            if (buildCellValue({ snapshot, x, y }) !== player) {
                continue;
            }

            for (const direction of DIRECTIONS) {
                const previousX = x - direction[0];
                const previousY = y - direction[1];

                if (buildCellValue({ snapshot, x: previousX, y: previousY }) === player) {
                    continue;
                }

                let runLength = 0;
                let nextX = x;
                let nextY = y;

                while (buildCellValue({ snapshot, x: nextX, y: nextY }) === player) {
                    runLength += 1;
                    nextX += direction[0];
                    nextY += direction[1];
                }

                const headX = nextX;
                const headY = nextY;
                const tailX = x - direction[0];
                const tailY = y - direction[1];
                const openHead = buildCellValue({ snapshot, x: headX, y: headY }) === null;
                const openTail = buildCellValue({ snapshot, x: tailX, y: tailY }) === null;
                const openEnds = Number(openHead) + Number(openTail);

                totalScore += buildPatternScore({ runLength, openEnds });
            }
        }
    }

    return totalScore;
};
