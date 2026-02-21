import { createUndoState } from '@minimalist-apps/undo';
import { createRootSnapshot } from '../createRootSnapshot';
import { getNextPlayer, startingPlayer } from '../game';
import { clampBoardSize, type GameMode, type GameStore } from './createGameStore';

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
        const state = deps.gameStore.getState();
        const size = clampBoardSize({
            size: state.history.present.boardSize,
            gameMode: mode,
        });

        deps.gameStore.setState({
            gameMode: mode,
            botPlayer: getNextPlayer({ player: startingPlayer }),
            history: createUndoState(createRootSnapshot({ boardSize: size })),
        });
    };
