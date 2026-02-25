import { isTheme, type Theme } from '@minimalist-apps/components';
import type {
    MapLocalStorageToState,
    MapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import { type GameMode, isGameMode, isValidBoardSize } from '../app/game/store/createGameStore';

export interface LocalStorageState {
    readonly themeMode: Theme;
    readonly boardSize: number;
    readonly gameMode: GameMode;
}

export const localStoragePrefix = 'five-in-a-row-v1';

export const mapStateLocalStorage: MapStateLocalStorage<LocalStorageState> = {
    themeMode: state => state.themeMode,
    boardSize: state => String(state.boardSize),
    gameMode: state => state.gameMode,
};

export const mapLocalStorageToState: MapLocalStorageToState<LocalStorageState> = {
    themeMode: value => {
        if (!isTheme(value)) {
            return undefined;
        }

        return value as Theme;
    },
    boardSize: value => {
        const parsed = Number(value);

        if (!isValidBoardSize(parsed)) {
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
