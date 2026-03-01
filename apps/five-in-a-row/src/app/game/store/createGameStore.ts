import { createStore, type Store } from '@minimalist-apps/mini-store';
import { canRedo, canUndo, createUndoState, type UndoState } from '@minimalist-apps/undo';
import { createRootSnapshot } from '../createRootSnapshot';
import {
    type GameBoard,
    type GameState,
    getNextPlayer,
    isBoardFull,
    type Player,
    startingPlayer,
    type Winner,
} from '../game';

export interface GameStoreState {
    readonly history: UndoState<GameState>;
    readonly gameMode: GameMode;
    readonly botPlayer: Player;
    readonly isBotThinking: boolean;
}

export type GameMode = 'human' | 'bot';

export const isValidBoardSize = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 3 && value <= 30;

export const isGameMode = (value: unknown): value is GameMode =>
    value === 'human' || value === 'bot';

const MAX_BOT_BOARD_SIZE = 15;

interface ClampBoardSizeProps {
    readonly size: number;
    readonly gameMode: 'human' | 'bot';
}

export const clampBoardSize = ({ size, gameMode }: ClampBoardSizeProps): number =>
    gameMode === 'bot' ? Math.min(size, MAX_BOT_BOARD_SIZE) : size;

interface GameViewState {
    readonly boardSize: number;
    readonly board: GameBoard;
    readonly currentPlayer: Player;
    readonly winner: Winner | null;
    readonly boardIsFull: boolean;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly gameMode: GameMode;
    readonly isBotThinking: boolean;
}

export interface GameStore extends Store<GameStoreState> {}

export type GameStoreDep = {
    readonly gameStore: GameStore;
};

export const selectGameViewState = (state: GameStoreState): GameViewState => {
    const snapshot = state.history.present;

    return {
        boardSize: snapshot.boardSize,
        board: snapshot.board,
        currentPlayer: snapshot.currentPlayer,
        winner: snapshot.winner,
        boardIsFull: isBoardFull({ board: snapshot.board }),
        canUndo: canUndo({ state: state.history }),
        canRedo: canRedo({ state: state.history }),
        gameMode: state.gameMode,
        isBotThinking: state.isBotThinking,
    };
};

export const selectBoardSize = ({ history }: GameStoreState): number => history.present.boardSize;
export const selectGameMode = ({ gameMode }: GameStoreState): GameMode => gameMode;
export const selectCurrentSnapshot = ({ history }: GameStoreState): GameState => history.present;

export const selectShouldPlayBot = (state: GameStoreState): boolean => {
    const snapshot = selectCurrentSnapshot(state);

    return (
        state.gameMode === 'bot' &&
        snapshot.winner === null &&
        !isBoardFull({ board: snapshot.board }) &&
        snapshot.currentPlayer === state.botPlayer
    );
};

type CreateGameStoreProps = {
    readonly initialBoardSize: number;
};

export const createGameStore = ({ initialBoardSize }: CreateGameStoreProps): GameStore => {
    const gameMode: GameMode = 'human';

    return createStore<GameStoreState>({
        history: createUndoState(
            createRootSnapshot({
                boardSize: clampBoardSize({ size: initialBoardSize, gameMode }),
            }),
        ),
        gameMode,
        botPlayer: getNextPlayer({ player: startingPlayer }),
        isBotThinking: false,
    });
};
