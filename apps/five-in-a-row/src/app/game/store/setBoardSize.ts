import type { GameStore } from './createGameStore';

export type SetBoardSize = (size: number) => void;

export type SetBoardSizeDeps = {
    readonly setBoardSize: SetBoardSize;
};

interface CreateSetBoardSizeDeps {
    readonly gameStore: GameStore;
}

export const createSetBoardSize =
    (deps: CreateSetBoardSizeDeps): SetBoardSize =>
    size => {
        deps.gameStore.setBoardSize(size);
    };
