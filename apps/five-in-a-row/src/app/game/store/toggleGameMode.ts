import type { GameStore } from './createGameStore';

export type ToggleGameMode = (checked: boolean) => void;

export type ToggleGameModeDeps = {
    readonly toggleGameMode: ToggleGameMode;
};

interface CreateToggleGameModeDeps {
    readonly gameStore: GameStore;
}

export const createToggleGameMode =
    (deps: CreateToggleGameModeDeps): ToggleGameMode =>
    checked => {
        deps.gameStore.setGameMode(checked ? 'human' : 'bot');
    };
