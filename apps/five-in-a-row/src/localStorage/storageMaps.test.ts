import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { ok } from '@evolu/common';
import {
    applyMapLocalStorageToState,
    applyMapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { LocalStorage } from '@minimalist-apps/local-storage';
import { createGameStore } from '../app/game/store/createGameStore';
import type { AppState } from '../appStore/AppState';
import {
    mapAppLocalStorageToState,
    mapAppStateLocalStorage,
    mapGameLocalStorageToState,
    mapGameStateLocalStorage,
} from './storageMaps';

const appInitState: AppState = {
    themeMode: 'dark',
    currentScreen: 'Game',
};

const gameInitState = createGameStore({ initialBoardSize: 15 }).getState();

describe('storageMaps', () => {
    test('round-trips app persisted values back to equivalent state', () => {
        const data: Record<string, unknown> = {};

        const localStorage: LocalStorage = {
            load: <T>(key: string) => ok((data[key] ?? null) as T | null),
            save: (key: string, value: unknown) => {
                data[key] = value;

                return ok();
            },
        };

        applyMapStateLocalStorage({
            localStorage,
            prefix: 'test-prefix',
            mapStateLocalStorage: mapAppStateLocalStorage,
            state: appInitState,
        });

        assert.deepStrictEqual(data, {
            'test-prefix:themeMode': 'dark',
        });

        const state = applyMapLocalStorageToState({
            localStorage,
            prefix: 'test-prefix',
            mapLocalStorageToState: mapAppLocalStorageToState,
        });

        assert.deepStrictEqual(state, {
            themeMode: 'dark',
        });
    });

    test('round-trips game persisted values back to equivalent state', () => {
        const data: Record<string, unknown> = {};

        const localStorage: LocalStorage = {
            load: <T>(key: string) => ok((data[key] ?? null) as T | null),
            save: (key: string, value: unknown) => {
                data[key] = value;

                return ok();
            },
        };

        applyMapStateLocalStorage({
            localStorage,
            prefix: 'test-prefix',
            mapStateLocalStorage: mapGameStateLocalStorage,
            state: gameInitState,
        });

        assert.deepStrictEqual(data, {
            'test-prefix:history': JSON.stringify(gameInitState.history),
            'test-prefix:gameMode': 'human',
        });

        const state = applyMapLocalStorageToState({
            localStorage,
            prefix: 'test-prefix',
            mapLocalStorageToState: mapGameLocalStorageToState,
        });

        assert.deepStrictEqual(state, {
            history: gameInitState.history,
            gameMode: 'human',
        });
    });
});
