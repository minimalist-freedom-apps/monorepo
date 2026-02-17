import { describe, expect, test } from 'vitest';
import { createGameStore, selectGameViewState } from './createGameStore';

describe(createGameStore.name, () => {
    test('supports undo and redo for moves', () => {
        const store = createGameStore({ initialBoardSize: 3 });

        store.playMove(0);
        store.playMove(1);

        expect(selectGameViewState(store.getState()).board).toEqual([
            'ring',
            'cross',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);

        store.undo();

        expect(selectGameViewState(store.getState()).board).toEqual([
            'ring',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);

        store.redo();

        expect(selectGameViewState(store.getState()).board).toEqual([
            'ring',
            'cross',
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
        const store = createGameStore({ initialBoardSize: 3 });

        store.playMove(0);
        store.playMove(1);
        store.undo();

        expect(selectGameViewState(store.getState()).canRedo).toBe(true);

        store.playMove(2);

        const view = selectGameViewState(store.getState());

        expect(view.board).toEqual(['ring', null, 'cross', null, null, null, null, null, null]);
        expect(view.canRedo).toBe(false);
    });

    test('limits board size to 15 in bot mode', () => {
        const store = createGameStore({ initialBoardSize: 10 });

        store.setGameMode('bot');
        store.setBoardSize(30);

        expect(selectGameViewState(store.getState()).boardSize).toBe(15);
    });

    test('stores selected opening protocol and bot level in view state', () => {
        const store = createGameStore({ initialBoardSize: 10 });

        store.setGameMode('bot');
        store.setOpeningProtocol('swap2');
        store.setBotLevel('Impossible');

        const view = selectGameViewState(store.getState());

        expect(view.gameMode).toBe('bot');
        expect(view.openingProtocol).toBe('swap2');
        expect(view.botLevel).toBe('Impossible');
    });
});
