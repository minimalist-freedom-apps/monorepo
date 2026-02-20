import { createConnect } from '@minimalist-apps/connect';
import { createLocalStorage } from '@minimalist-apps/local-storage';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { GameScreenPure } from './app/GameScreen/GameScreen';
import {
    createGameStore,
    selectBoardSize,
    selectGameMode,
    selectGameViewState,
} from './app/game/store/createGameStore';
import { createSetBoardSize } from './app/game/store/setBoardSize';
import { createSetGameMode } from './app/game/store/setGameMode';
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
import { ThemeModeSettingsPure } from './app/SettingsScreen/ThemeModeSettings';
import { selectCurrentScreen, selectThemeMode } from './appStore/AppState';
import { createAppStore } from './appStore/createAppStore';
import { createNavigate } from './appStore/navigate';
import { createSetThemeMode } from './appStore/setThemeMode';
import { createMain, type Main } from './createMain';
import { createLoadInitialState } from './localStorage/loadInitialState';
import { createPersistStore } from './localStorage/persistStore';
import { createStatePersistence } from './localStorage/statePersistence';

export const createCompositionRoot = (): Main => {
    const localStorage = createLocalStorage();
    const store = createAppStore();
    const gameStore = createGameStore({ initialBoardSize: 10 });

    const navigate = createNavigate({ store });
    const setThemeMode = createSetThemeMode({ store });

    const setBoardSize = createSetBoardSize({ gameStore });
    const setGameMode = createSetGameMode({ gameStore });

    const loadInitialState = createLoadInitialState({ store, gameStore, localStorage });
    const persistStore = createPersistStore({ store, gameStore, localStorage });
    const statePersistence = createStatePersistence({ loadInitialState, persistStore });

    const connect = createConnect({ store, gameStore });

    const AppHeader = connect(AppHeaderPure, () => ({}), {
        onHome: () => navigate('Game'),
        onOpenSettings: () => navigate('Settings'),
    });

    const GameScreen = connect(GameScreenPure, ({ gameStore }) => selectGameViewState(gameStore), {
        onUndo: () => gameStore.undo(),
        onRedo: () => gameStore.redo(),
        onReset: () => gameStore.reset(),
        onCellClick: (index: number) => gameStore.playMove(index),
    });

    const ThemeModeSettings = connect(
        ThemeModeSettingsPure,
        ({ store }) => ({
            themeMode: selectThemeMode(store),
        }),
        {
            setThemeMode,
        },
    );

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
