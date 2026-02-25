import { createConnect } from '@minimalist-apps/connect';
import { createLocalStorageFragmentCompositionRoot } from '@minimalist-apps/fragment-local-storage';
import {
    createNavigatorFragmentCompositionRoot,
    selectCurrentScreen,
} from '@minimalist-apps/fragment-navigator';
import {
    createThemeFragmentCompositionRoot,
    selectThemeMode,
} from '@minimalist-apps/fragment-theme';
import type { Store } from '@minimalist-apps/mini-store';
import { toGetter } from '@minimalist-apps/mini-store';
import { createWindow } from '@minimalist-apps/window';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { GameScreenPure } from './app/GameScreen/GameScreen';
import { createPlayerMove } from './app/game/createPlayerMove';
import {
    createGameStore,
    type GameMode,
    isGameMode,
    isValidBoardSize,
    selectBoardSize,
    selectCurrentSnapshot,
    selectGameMode,
    selectGameViewState,
    selectShouldPlayBot,
} from './app/game/store/createGameStore';
import { createPlayMove } from './app/game/store/playMove';
import { createRedoMove } from './app/game/store/redoMove';
import { createResetGame } from './app/game/store/resetGame';
import { createSetBoardSize } from './app/game/store/setBoardSize';
import { createSetGameMode } from './app/game/store/setGameMode';
import { createUndoMove } from './app/game/store/undoMove';
import {
    type BoardSizeSettingsDeps,
    BoardSizeSettingsPure,
    type BoardSizeSettingsStateProps,
} from './app/SettingsScreen/BoardSizeSettings';
import {
    type GameModeSettingsDeps,
    GameModeSettingsPure,
    type GameModeSettingsStateProps,
} from './app/SettingsScreen/GameModeSettings';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import type { NavigatorScreen } from './appStore/AppState';
import { createAppStore } from './appStore/createAppStore';
import { createMain, type Main } from './createMain';
import {
    type LocalStorageState,
    localStoragePrefix,
    mapLocalStorageToState,
    mapStateLocalStorage,
} from './localStorage/storageMaps';

export const createCompositionRoot = (): Main => {
    const window = createWindow();
    const store = createAppStore();
    const gameStore = createGameStore({ initialBoardSize: 10 });

    const { goBack, navigate } = createNavigatorFragmentCompositionRoot<NavigatorScreen>({
        store,
        rootScreen: 'Game',
    });

    const setBoardSize = createSetBoardSize({ gameStore });
    const setGameMode = createSetGameMode({ gameStore });
    const playMove = createPlayMove({ gameStore });
    const getShouldPlayBot = toGetter(gameStore.getState, selectShouldPlayBot);
    const getCurrentSnapshot = toGetter(gameStore.getState, selectCurrentSnapshot);
    const playerMove = createPlayerMove({
        gameStore,
        playMove,
        getShouldPlayBot,
        getCurrentSnapshot,
    });
    const resetGame = createResetGame({ gameStore });
    const undoMove = createUndoMove({ gameStore });
    const redoMove = createRedoMove({ gameStore });

    const localStorageStore: Store<LocalStorageState> = {
        getState: () => ({
            themeMode: store.getState().themeMode,
            boardSize: selectBoardSize(gameStore.getState()),
            gameMode: selectGameMode(gameStore.getState()),
        }),
        setState: partial => {
            if (partial.themeMode !== undefined) {
                store.setState({ themeMode: partial.themeMode });
            }

            if (partial.boardSize !== undefined && isValidBoardSize(partial.boardSize)) {
                setBoardSize(partial.boardSize);
            }

            if (partial.gameMode !== undefined && isGameMode(partial.gameMode)) {
                setGameMode(partial.gameMode as GameMode);
            }
        },
        subscribe: listener => {
            const unsubscribeAppStore = store.subscribe(listener);
            const unsubscribeGameStore = gameStore.subscribe(listener);

            return () => {
                unsubscribeAppStore();
                unsubscribeGameStore();
            };
        },
    };

    const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
        store: localStorageStore,
        prefix: localStoragePrefix,
        mapStateLocalStorage,
        mapLocalStorageToState,
        window,
    });

    const connect = createConnect({ store, gameStore });

    const { ThemeModeSettings } = createThemeFragmentCompositionRoot({ connect, store });

    const AppHeader = connect(AppHeaderPure, () => ({}), {
        onHome: () => navigate('Game'),
        onOpenSettings: () => navigate('Settings'),
    });

    const GameScreen = connect(GameScreenPure, ({ gameStore }) => selectGameViewState(gameStore), {
        undoMove,
        redoMove,
        resetGame,
        playerMove,
    });

    const GameModeSettings = connect(
        (deps: GameModeSettingsDeps, props: GameModeSettingsStateProps) =>
            GameModeSettingsPure(deps, props),
        ({ gameStore }) => ({
            gameMode: selectGameMode(gameStore),
        }),
        {
            setGameMode,
        },
    );

    const BoardSizeSettings = connect(
        (deps: BoardSizeSettingsDeps, props: BoardSizeSettingsStateProps) =>
            BoardSizeSettingsPure(deps, props),
        ({ gameStore }) => ({
            boardSize: selectBoardSize(gameStore),
            gameMode: selectGameMode(gameStore),
        }),
        {
            setBoardSize,
        },
    );

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeModeSettings,
            GameModeSettings,
            BoardSizeSettings,
            goBack,
        });

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

    return createMain({ App, localStorageInit });
};
