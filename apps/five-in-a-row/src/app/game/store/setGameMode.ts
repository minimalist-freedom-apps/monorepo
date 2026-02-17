import type { GameMode, GameStore } from './createGameStore';

export type SetGameMode = (mode: GameMode) => void;

export type SetGameModeDeps = {
    readonly setGameMode: SetGameMode;
};

interface CreateSetGameModeDeps {
    readonly gameStore: GameStore;
}

export const createSetGameMode =
    (deps: CreateSetGameModeDeps): SetGameMode =>
    mode => {
        deps.gameStore.setGameMode(mode);
    };
