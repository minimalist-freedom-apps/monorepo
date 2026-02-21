import { describe, expect, test } from 'vitest';
import { createGameStore, selectGameViewState } from './createGameStore';
import { createPlayMove } from './playMove';
import { createRedoMove } from './redoMove';
import { createSetBoardSize } from './setBoardSize';
import { createSetGameMode } from './setGameMode';
import { createUndoMove } from './undoMove';

const createServices = () => {
    const gameStore = createGameStore({ initialBoardSize: 3 });

    return {
        gameStore,
        playMove: createPlayMove({ gameStore }),
        undoMove: createUndoMove({ gameStore }),
        redoMove: createRedoMove({ gameStore }),
        setBoardSize: createSetBoardSize({ gameStore }),
        setGameMode: createSetGameMode({ gameStore }),
    };
};

describe(createGameStore.name, () => {
    test('supports undo and redo for moves', () => {
        const { gameStore, playMove, undoMove, redoMove } = createServices();

        playMove({ index: 0 });
        playMove({ index: 1 });

        expect(selectGameViewState(gameStore.getState()).board).toEqual([
            'cross',
            'ring',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);

        undoMove();

        expect(selectGameViewState(gameStore.getState()).board).toEqual([
            'cross',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);

        redoMove();

        expect(selectGameViewState(gameStore.getState()).board).toEqual([
            'cross',
            'ring',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);
    });

    test('drops future history when writing after undo', () => {
        const { gameStore, playMove, undoMove } = createServices();

        playMove({ index: 0 });
        playMove({ index: 1 });
        undoMove();

        expect(selectGameViewState(gameStore.getState()).canRedo).toBe(true);

        playMove({ index: 2 });

        const view = selectGameViewState(gameStore.getState());

        expect(view.board).toEqual(['cross', null, 'ring', null, null, null, null, null, null]);
        expect(view.canRedo).toBe(false);
    });

    test('limits board size to 15 in bot mode', () => {
        const gameStore = createGameStore({ initialBoardSize: 10 });
        const setGameMode = createSetGameMode({ gameStore });
        const setBoardSize = createSetBoardSize({ gameStore });

        setGameMode('bot');
        setBoardSize(30);

        expect(selectGameViewState(gameStore.getState()).boardSize).toBe(15);
    });

    test('stores selected opening protocol and bot level in view state', () => {
        const gameStore = createGameStore({ initialBoardSize: 10 });
        const setGameMode = createSetGameMode({ gameStore });

        setGameMode('bot');

        const view = selectGameViewState(gameStore.getState());

        expect(view.gameMode).toBe('bot');
    });

    test('does not play bot move automatically in store service', () => {
        const { gameStore, playMove, setGameMode } = createServices();

        setGameMode('bot');
        playMove({ index: 0 });

        expect(selectGameViewState(gameStore.getState()).board).toEqual([
            'cross',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);
    });
});
