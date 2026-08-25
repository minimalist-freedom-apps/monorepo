import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
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

        assert.deepStrictEqual(selectGameViewState(gameStore.getState()).board, [
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

        assert.deepStrictEqual(selectGameViewState(gameStore.getState()).board, [
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

        assert.deepStrictEqual(selectGameViewState(gameStore.getState()).board, [
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

        assert.strictEqual(selectGameViewState(gameStore.getState()).canRedo, true);

        playMove({ index: 2 });

        const view = selectGameViewState(gameStore.getState());

        assert.deepStrictEqual(view.board, [
            'cross',
            null,
            'ring',
            null,
            null,
            null,
            null,
            null,
            null,
        ]);
        assert.strictEqual(view.canRedo, false);
    });

    test('limits board size to 15 in bot mode', () => {
        const gameStore = createGameStore({ initialBoardSize: 10 });
        const setGameMode = createSetGameMode({ gameStore });
        const setBoardSize = createSetBoardSize({ gameStore });

        setGameMode('bot');
        setBoardSize(30);

        assert.strictEqual(selectGameViewState(gameStore.getState()).boardSize, 15);
    });

    test('stores selected opening protocol and bot level in view state', () => {
        const gameStore = createGameStore({ initialBoardSize: 10 });
        const setGameMode = createSetGameMode({ gameStore });

        setGameMode('bot');

        const view = selectGameViewState(gameStore.getState());

        assert.strictEqual(view.gameMode, 'bot');
    });

    test('does not play bot move automatically in store service', () => {
        const { gameStore, playMove, setGameMode } = createServices();

        setGameMode('bot');
        playMove({ index: 0 });

        assert.deepStrictEqual(selectGameViewState(gameStore.getState()).board, [
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
