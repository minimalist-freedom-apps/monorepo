import { describe, expect, test } from 'vitest';
import type { GameState, Player } from '../../../game';
import { buildPlayerLineScore } from './buildPlayerLineScore';

const parseCell = (char: string): Player | null => {
    if (char === 'X') {
        return 'cross';
    }

    if (char === 'O') {
        return 'ring';
    }

    if (char === '.') {
        return null;
    }

    throw new Error(`Unsupported fixture char: ${char}`);
};

const createSnapshotFromAsciiArt = (asciiArt: string): GameState => {
    const rows = asciiArt
        .trim()
        .split('\n')
        .map(row => row.trim())
        .filter(row => row.length > 0);

    const boardSize = rows.length;

    if (rows.some(row => row.length !== boardSize)) {
        throw new Error('ASCII fixture must be a square board.');
    }

    const board = rows.flatMap(row => row.split('').map(parseCell));

    return {
        boardSize,
        board,
        currentPlayer: 'cross',
        winner: null,
        moveCount: board.filter(it => it !== null).length,
        lastMoveIndex: null,
    };
};

describe(buildPlayerLineScore.name, () => {
    // Expected scores are total heuristic pressure, i.e. sum of all contiguous-run contributions
    // across 4 directions (main pattern + auxiliary short runs from the same stones).
    const dataProvider = [
        {
            description: 'edge horizontal three',
            asciiArt: `
                XXX..
                .....
                .....
                .....
                .....
            `,
            expected: 308,
        },
        {
            description: 'fully open horizontal three',
            asciiArt: `
                .....
                .....
                .XXX.
                .....
                .....
            `,
            expected: 2072,
        },
        {
            description: 'corner single',
            asciiArt: `
                X....
                .....
                .....
                .....
                .....
            `,
            expected: 3,
        },
        {
            description: 'center single',
            asciiArt: `
                .....
                .....
                ..X..
                .....
                .....
            `,
            expected: 32,
        },
        {
            description: 'fully open diagonal three',
            asciiArt: `
                .....
                .X...
                ..X..
                ...X.
                .....
            `,
            expected: 2072,
        },
        {
            description: 'horizontal two',
            asciiArt: `
                .....
                .....
                .XX..
                .....
                .....
            `,
            expected: 168,
        },
        {
            description: 'vertical two',
            asciiArt: `
                .....
                ..X..
                ..X..
                .....
                .....
            `,
            expected: 168,
        },
        {
            description: '5x5 fully open diagonal two',
            asciiArt: `
                .....
                .X...
                ..X..
                .....
                .....
            `,
            expected: 168,
        },
        {
            description: '6x6 fully open horizontal four',
            asciiArt: `
                ......
                ......
                .XXXX.
                ......
                ......
                ......
            `,
            expected: 50096,
        },
        {
            description: '6x6 fully open diagonal four',
            asciiArt: `
                ......
                .X....
                ..X...
                ...X..
                ....X.
                ......
            `,
            expected: 50096,
        },
        {
            description: '6x6 horizontal four touching board edge',
            asciiArt: `
                XXXX..
                ......
                ......
                ......
                ......
                ......
            `,
            expected: 10011, // 10_000 for the 4-run + 11 from auxiliary 1-runs in other directions
        },
        {
            description: '6x6 diagonal four touching board edge',
            asciiArt: `
                X.....
                .X....
                ..X...
                ...X..
                ......
                ......
            `,
            expected: 10074, // 10_000 for the 4-run + 74 from auxiliary edge/corner short runs
        },
        {
            description: '6x6 two diagonal 3s',
            asciiArt: `
                ......
                .X.X..
                ..X...
                .X.X..
                ......
                ......
            `,
            expected: 4112, // 2x open diagonal 3s (2 * 2_000) + 112 from auxiliary short runs
        },
    ] as const;

    test.each(dataProvider)('scores $description as $expected', ({ asciiArt, expected }) => {
        const snapshot = createSnapshotFromAsciiArt(asciiArt);
        const score = buildPlayerLineScore({ snapshot, player: 'cross' });

        expect(score).toBe(expected);
    });
});
