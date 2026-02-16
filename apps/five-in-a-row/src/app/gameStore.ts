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
} from './game';

interface GameSnapshot {
    readonly boardSize: number;
    readonly board: GameBoard;
    readonly currentPlayer: Player;
    readonly winner: Winner | null;
}

interface GameStoreState {
    readonly history: UndoState<GameSnapshot>;
}

export interface GameViewState {
    readonly boardSize: number;
    readonly board: GameBoard;
    readonly currentPlayer: Player;
    readonly winner: Winner | null;
    readonly boardIsFull: boolean;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
}

export interface GameStore extends Store<GameStoreState> {
    readonly playMove: (index: number) => void;
    readonly reset: () => void;
    readonly setBoardSize: (size: number) => void;
    readonly undo: () => void;
    readonly redo: () => void;
}

const createSnapshot = ({ boardSize }: { readonly boardSize: number }): GameSnapshot => ({
    boardSize,
    board: createEmptyBoard({ size: boardSize }),
    currentPlayer: 'ring',
    winner: null,
});

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
        };
    }

    return {
        ...snapshot,
        board: nextBoard,
        currentPlayer: getNextPlayer({ player: snapshot.currentPlayer }),
    };
};

export const selectGameViewState = ({ history }: GameStoreState): GameViewState => {
    const snapshot = history.present;

    return {
        boardSize: snapshot.boardSize,
        board: snapshot.board,
        currentPlayer: snapshot.currentPlayer,
        winner: snapshot.winner,
        boardIsFull: isBoardFull({ board: snapshot.board }),
        canUndo: canUndo({ state: history }),
        canRedo: canRedo({ state: history }),
    };
};

export const selectBoardSize = ({ history }: GameStoreState): number => history.present.boardSize;

export const createGameStore = ({
    initialBoardSize,
}: {
    readonly initialBoardSize: number;
}): GameStore => {
    const store = createStore<GameStoreState>({
        history: createUndoState(createSnapshot({ boardSize: initialBoardSize })),
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
        const size = store.getState().history.present.boardSize;

        store.setState({ history: createUndoState(createSnapshot({ boardSize: size })) });
    };

    const setBoardSize = (size: number) => {
        store.setState({ history: createUndoState(createSnapshot({ boardSize: size })) });
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
        undo: undoMove,
        redo: redoMove,
    };
};
