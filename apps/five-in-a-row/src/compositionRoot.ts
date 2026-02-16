import { createConnect } from '@minimalist-apps/connect';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { type GameScreenDep, GameScreenPure, type GameScreenStateProps } from './app/GameScreen';
import { createGameStore, selectBoardSize, selectGameViewState } from './app/gameStore';
import {
    type SettingsScreenDep,
    SettingsScreen as SettingsScreenPure,
    type SettingsScreenStateProps,
} from './app/SettingsScreen';
import { createMain, type Main } from './createMain';
import { createStore } from './state/createStore';
import { createNavigate } from './state/navigate';
import { selectCurrentScreen, selectThemeMode } from './state/State';
import { createSetThemeMode } from './state/setThemeMode';

export const createCompositionRoot = (): Main => {
    const store = createStore();
    const gameStore = createGameStore({ initialBoardSize: 10 });

    const navigate = createNavigate({ store });
    const setThemeMode = createSetThemeMode({ store });

    const connect = createConnect({ store, gameStore });

    const AppHeader = connect(AppHeaderPure, () => ({}), {
        onHome: () => navigate('Game'),
        onOpenSettings: () => navigate('Settings'),
    });

    const GameScreen = connect(
        (deps: GameScreenDep, props: GameScreenStateProps) =>
            GameScreenPure({
                winner: props.winner,
                currentPlayer: props.currentPlayer,
                boardIsFull: props.boardIsFull,
                board: props.board,
                boardSize: props.boardSize,
                canUndo: props.canUndo,
                canRedo: props.canRedo,
                onUndo: deps.onUndo,
                onRedo: deps.onRedo,
                onReset: deps.onReset,
                onCellClick: deps.onCellClick,
            }),
        ({ gameStore }) => selectGameViewState(gameStore),
        {
            onUndo: () => gameStore.undo(),
            onRedo: () => gameStore.redo(),
            onReset: () => gameStore.reset(),
            onCellClick: (index: number) => gameStore.playMove(index),
        },
    );

    const SettingsScreen = connect(
        (deps: SettingsScreenDep, props: SettingsScreenStateProps) =>
            SettingsScreenPure({
                themeMode: props.themeMode,
                boardSize: props.boardSize,
                onThemeToggle: deps.onThemeToggle,
                onBoardSizeChange: deps.onBoardSizeChange,
            }),
        ({ store, gameStore }) => ({
            themeMode: selectThemeMode(store),
            boardSize: selectBoardSize(gameStore),
        }),
        {
            onThemeToggle: (checked: boolean) => setThemeMode(checked ? 'light' : 'dark'),
            onBoardSizeChange: (size: number) => gameStore.setBoardSize(size),
        },
    );

    const App = connect(
        AppPure,
        ({ store }) => ({
            themeMode: selectThemeMode(store),
            currentScreen: selectCurrentScreen(store),
        }),
        {
            AppHeader,
            GameScreen,
            SettingsScreen,
        },
    );

    return createMain({ App });
};
