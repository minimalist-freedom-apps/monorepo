import { isTheme, type Theme } from '@minimalist-apps/components';
import type {
    MapLocalStorageToState,
    MapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import {
    type GameStoreState,
    isGameMode,
    isValidBoardSize,
} from '../app/game/store/createGameStore';
import type { AppState } from '../appStore/AppState';

export const localStoragePrefix = 'five-in-a-row-v1';

export const mapAppStateLocalStorage: MapStateLocalStorage<AppState> = {
    themeMode: state => state.themeMode,
};

export const mapGameStateLocalStorage: MapStateLocalStorage<GameStoreState> = {
    history: state => JSON.stringify(state.history),
    gameMode: state => state.gameMode,
};

export const mapAppLocalStorageToState: MapLocalStorageToState<AppState> = {
    themeMode: value => {
        if (!isTheme(value)) {
            return undefined;
        }

        return value as Theme;
    },
};

export const mapGameLocalStorageToState: MapLocalStorageToState<GameStoreState> = {
    history: value => {
        const parsed = JSON.parse(value) as GameStoreState['history'];

        if (!isValidBoardSize(parsed.present.boardSize)) {
            return undefined;
        }

        return parsed;
    },
    gameMode: value => {
        if (!isGameMode(value)) {
            return undefined;
        }

        return value;
    },
};
