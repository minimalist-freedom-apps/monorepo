import { createConnect } from '@minimalist-apps/connect';
import {
    createNavigatorFragmentCompositionRoot,
    selectCurrentScreen,
} from '@minimalist-apps/fragment-navigator';
import {
    createThemeFragmentCompositionRoot,
    selectThemeMode,
} from '@minimalist-apps/fragment-theme';
import { createLocalStorage } from '@minimalist-apps/local-storage';
import { toGetter } from '@minimalist-apps/mini-store';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { GameScreenPure } from './app/GameScreen/GameScreen';
import { createPlayerMove } from './app/game/createPlayerMove';
import {
    createGameStore,
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
import { createLoadInitialState } from './localStorage/loadInitialState';
import { createPersistStore } from './localStorage/persistStore';
import { createStatePersistence } from './localStorage/statePersistence';

export const createCompositionRoot = (): Main => {
    const localStorage = createLocalStorage();
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

    const loadInitialState = createLoadInitialState({
        store,
        localStorage,
        setBoardSize,
        setGameMode,
    });
    const persistStore = createPersistStore({ store, gameStore, localStorage });
    const statePersistence = createStatePersistence({ loadInitialState, persistStore });

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

    return createMain({ App, statePersistence });
};
