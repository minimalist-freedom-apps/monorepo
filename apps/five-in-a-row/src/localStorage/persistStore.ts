import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import {
    type GameStoreDep,
    selectBoardSize,
    selectBotLevel,
    selectGameMode,
    selectOpeningProtocol,
} from '../app/game/store/createGameStore';
import { selectThemeMode } from '../appStore/AppState';
import type { AppStoreDep } from '../appStore/createAppStore';
import { STORAGE_KEYS } from './storageKeys';

type Unsubscribe = () => void;

export type PersistStore = () => Unsubscribe;

export interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

type PersistStoreDeps = AppStoreDep & LocalStorageDep & GameStoreDep;

export const createPersistStore =
    (deps: PersistStoreDeps): PersistStore =>
    () => {
        const unsubscribeAppStore = deps.store.subscribe(() => {
            const themeMode = selectThemeMode(deps.store.getState());
            deps.localStorage.save(STORAGE_KEYS.THEME_MODE, themeMode);
        });

        const unsubscribeGameStore = deps.gameStore.subscribe(() => {
            const boardSize = selectBoardSize(deps.gameStore.getState());
            const gameMode = selectGameMode(deps.gameStore.getState());
            const openingProtocol = selectOpeningProtocol(deps.gameStore.getState());
            const botLevel = selectBotLevel(deps.gameStore.getState());
            deps.localStorage.save(STORAGE_KEYS.BOARD_SIZE, boardSize);
            deps.localStorage.save(STORAGE_KEYS.GAME_MODE, gameMode);
            deps.localStorage.save(STORAGE_KEYS.OPENING_PROTOCOL, openingProtocol);
            deps.localStorage.save(STORAGE_KEYS.BOT_LEVEL, botLevel);
        });

        return () => {
            unsubscribeAppStore();
            unsubscribeGameStore();
        };
    };
