import { createStore, type Store } from '@minimalist-apps/mini-store';
import {
    canRedo,
    canUndo,
    createUndoState,
    redo,
    type UndoState,
    undo,
    write,
} from '@minimalist-apps/undo';
import {
    createEmptyBoard,
    findWinner,
    type GameBoard,
    getNextPlayer,
    isBoardFull,
    type Player,
    type Winner,
} from '../game';

interface GameSnapshot {
    readonly boardSize: number;
    readonly board: GameBoard;
    readonly currentPlayer: Player;
    readonly winner: Winner | null;
    readonly moveCount: number;
}

interface GameStoreState {
    readonly history: UndoState<GameSnapshot>;
    readonly gameMode: GameMode;
    readonly botPlayer: Player;
}

export type GameMode = 'human' | 'bot';

export const isValidBoardSize = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 3 && value <= 30;

export const isGameMode = (value: unknown): value is GameMode =>
    value === 'human' || value === 'bot';

export interface GameViewState {
    readonly boardSize: number;
    readonly board: GameBoard;
    readonly currentPlayer: Player;
    readonly winner: Winner | null;
    readonly boardIsFull: boolean;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly gameMode: GameMode;
}

export interface GameStore extends Store<GameStoreState> {
    readonly playMove: (index: number) => void;
    readonly reset: () => void;
    readonly setBoardSize: (size: number) => void;
    readonly setGameMode: (mode: GameMode) => void;
    readonly undo: () => void;
    readonly redo: () => void;
}

export type GameStoreDep = {
    readonly gameStore: GameStore;
};

const maxBotBoardSize = 15;

const createSnapshot = ({ boardSize }: { readonly boardSize: number }): GameSnapshot => ({
    boardSize,
    board: createEmptyBoard({ size: boardSize }),
    currentPlayer: 'ring',
    winner: null,
    moveCount: 0,
});

const clampBoardSize = ({
    size,
    gameMode,
}: {
    readonly size: number;
    readonly gameMode: GameMode;
}): number => {
    if (gameMode === 'bot') {
        return size > maxBotBoardSize ? maxBotBoardSize : size;
    }

    return size;
};

const buildNextSnapshot = ({
    snapshot,
    index,
}: {
    readonly snapshot: GameSnapshot;
    readonly index: number;
}): GameSnapshot | null => {
    if (snapshot.winner !== null || snapshot.board[index] !== null) {
        return null;
    }

    const nextBoard: GameBoard = [...snapshot.board];
    nextBoard[index] = snapshot.currentPlayer;

    const nextWinner = findWinner({
        board: nextBoard,
        size: snapshot.boardSize,
        lastMoveIndex: index,
    });

    if (nextWinner !== null) {
        return {
            ...snapshot,
            board: nextBoard,
            winner: nextWinner,
        };
    }

    if (isBoardFull({ board: nextBoard })) {
        return {
            ...snapshot,
            board: nextBoard,
            moveCount: snapshot.moveCount + 1,
        };
    }

    return {
        ...snapshot,
        board: nextBoard,
        moveCount: snapshot.moveCount + 1,
        currentPlayer: getNextPlayer({ player: snapshot.currentPlayer }),
    };
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
    };
};

export const selectBoardSize = ({ history }: GameStoreState): number => history.present.boardSize;
export const selectGameMode = ({ gameMode }: GameStoreState): GameMode => gameMode;

export const createGameStore = ({
    initialBoardSize,
}: {
    readonly initialBoardSize: number;
}): GameStore => {
    const gameMode: GameMode = 'human';

    const store = createStore<GameStoreState>({
        history: createUndoState(
            createSnapshot({
                boardSize: clampBoardSize({ size: initialBoardSize, gameMode }),
            }),
        ),
        gameMode,
        botPlayer: 'cross',
    });

    const playMove = (index: number) => {
        const { history } = store.getState();
        const nextSnapshot = buildNextSnapshot({ snapshot: history.present, index });

        if (nextSnapshot === null) {
            return;
        }

        store.setState({ history: write({ state: history, next: nextSnapshot }) });
    };

    const reset = () => {
        const state = store.getState();
        const size = clampBoardSize({
            size: state.history.present.boardSize,
            gameMode: state.gameMode,
        });

        store.setState({ history: createUndoState(createSnapshot({ boardSize: size })) });
    };

    const setBoardSize = (size: number) => {
        const mode = store.getState().gameMode;
        const nextSize = clampBoardSize({ size, gameMode: mode });

        store.setState({ history: createUndoState(createSnapshot({ boardSize: nextSize })) });
    };

    const setGameMode = (mode: GameMode) => {
        const state = store.getState();
        const size = clampBoardSize({
            size: state.history.present.boardSize,
            gameMode: mode,
        });

        store.setState({
            gameMode: mode,
            botPlayer: 'cross',
            history: createUndoState(createSnapshot({ boardSize: size })),
        });
    };

    const undoMove = () => {
        const { history } = store.getState();

        store.setState({ history: undo({ state: history }) });
    };

    const redoMove = () => {
        const { history } = store.getState();

        store.setState({ history: redo({ state: history }) });
    };

    return {
        ...store,
        playMove,
        reset,
        setBoardSize,
        setGameMode,
        undo: undoMove,
        redo: redoMove,
    };
};
