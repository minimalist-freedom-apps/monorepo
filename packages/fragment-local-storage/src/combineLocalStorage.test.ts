import { createStore } from '@minimalist-apps/mini-store';
import { describe, expect, test, vi } from 'vitest';
import type { MapLocalStorageToState, MapStateLocalStorage } from '.';
import {
    combineLocalStorageToState,
    combineStateLocalStorage,
    createCombinedLocalStorageStore,
    createLocalStorageModule,
} from './combineLocalStorage';

interface AppState {
    readonly theme: string;
}

interface GameState {
    readonly score: number;
}

const mapAppStateLocalStorage: MapStateLocalStorage<AppState> = {
    theme: state => state.theme,
};

const mapAppLocalStorageToState: MapLocalStorageToState<AppState> = {
    theme: value => value,
};

const mapGameStateLocalStorage: MapStateLocalStorage<GameState> = {
    score: state => String(state.score),
};

const mapGameLocalStorageToState: MapLocalStorageToState<GameState> = {
    score: value => Number(value),
};

describe(createCombinedLocalStorageStore.name, () => {
    test('routes combined partial state to module stores', () => {
        const appStore = createStore<AppState>({ theme: 'light' });
        const gameStore = createStore<GameState>({ score: 0 });
        const store = createCombinedLocalStorageStore({
            modules: [
                createLocalStorageModule({
                    key: 'app',
                    store: appStore,
                    mapStateLocalStorage: mapAppStateLocalStorage,
                    mapLocalStorageToState: mapAppLocalStorageToState,
                }),
                createLocalStorageModule({
                    key: 'game',
                    store: gameStore,
                    mapStateLocalStorage: mapGameStateLocalStorage,
                    mapLocalStorageToState: mapGameLocalStorageToState,
                }),
            ],
        });

        store.setState({
            'app.theme': 'dark',
            'game.score': 21,
        });

        expect(appStore.getState()).toEqual({ theme: 'dark' });
        expect(gameStore.getState()).toEqual({ score: 21 });
    });

    test('subscribes to all module stores', () => {
        const appStore = createStore<AppState>({ theme: 'light' });
        const gameStore = createStore<GameState>({ score: 0 });
        const listener = vi.fn();
        const store = createCombinedLocalStorageStore({
            modules: [
                createLocalStorageModule({
                    key: 'app',
                    store: appStore,
                    mapStateLocalStorage: mapAppStateLocalStorage,
                    mapLocalStorageToState: mapAppLocalStorageToState,
                }),
                createLocalStorageModule({
                    key: 'game',
                    store: gameStore,
                    mapStateLocalStorage: mapGameStateLocalStorage,
                    mapLocalStorageToState: mapGameLocalStorageToState,
                }),
            ],
        });

        const unsubscribe = store.subscribe(listener);
        appStore.setState({ theme: 'dark' });
        gameStore.setState({ score: 1 });
        unsubscribe();
        appStore.setState({ theme: 'light' });

        expect(listener).toHaveBeenCalledTimes(2);
    });
});

describe(combineStateLocalStorage.name, () => {
    test('maps module state to combined keys', () => {
        const appStore = createStore<AppState>({ theme: 'dark' });
        const gameStore = createStore<GameState>({ score: 42 });
        const mapStateLocalStorage = combineStateLocalStorage({
            modules: [
                createLocalStorageModule({
                    key: 'app',
                    store: appStore,
                    mapStateLocalStorage: mapAppStateLocalStorage,
                    mapLocalStorageToState: mapAppLocalStorageToState,
                }),
                createLocalStorageModule({
                    key: 'game',
                    store: gameStore,
                    mapStateLocalStorage: mapGameStateLocalStorage,
                    mapLocalStorageToState: mapGameLocalStorageToState,
                }),
            ],
        });

        expect(mapStateLocalStorage['app.theme']?.({})).toBe('dark');
        expect(mapStateLocalStorage['game.score']?.({})).toBe('42');
    });
});

describe(combineLocalStorageToState.name, () => {
    test('maps local-storage values to combined state keys', () => {
        const appStore = createStore<AppState>({ theme: 'light' });
        const gameStore = createStore<GameState>({ score: 0 });
        const mapLocalStorageToState = combineLocalStorageToState({
            modules: [
                createLocalStorageModule({
                    key: 'app',
                    store: appStore,
                    mapStateLocalStorage: mapAppStateLocalStorage,
                    mapLocalStorageToState: mapAppLocalStorageToState,
                }),
                createLocalStorageModule({
                    key: 'game',
                    store: gameStore,
                    mapStateLocalStorage: mapGameStateLocalStorage,
                    mapLocalStorageToState: mapGameLocalStorageToState,
                }),
            ],
        });

        expect(mapLocalStorageToState['app.theme']?.('dark')).toBe('dark');
        expect(mapLocalStorageToState['game.score']?.('42')).toBe(42);
    });
});
