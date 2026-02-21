import { createConnect } from '@minimalist-apps/connect';
import { createLocalStorage } from '@minimalist-apps/local-storage';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { ChatScreenPure } from './app/ChatScreen/ChatScreen';
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

    const navigate = createNavigate({ store });
    const setThemeMode = createSetThemeMode({ store });

    const loadInitialState = createLoadInitialState({
        store,
        localStorage,
    });
    const persistStore = createPersistStore({ store, localStorage });
    const statePersistence = createStatePersistence({ loadInitialState, persistStore });

    const connect = createConnect({ store });

    const AppHeader = connect(AppHeaderPure, () => ({}), {
        onHome: () => navigate('Chat'),
        onOpenSettings: () => navigate('Settings'),
    });

    const ChatScreen = connect(ChatScreenPure, () => ({}));

    const ThemeModeSettings = connect(
        ThemeModeSettingsPure,
        ({ store }) => ({
            themeMode: selectThemeMode(store),
        }),
        {
            setThemeMode,
        },
    );

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeModeSettings,
            onBack: () => navigate('Chat'),
        });

    const App = connect(
        AppPure,
        ({ store }) => ({
            themeMode: selectThemeMode(store),
            currentScreen: selectCurrentScreen(store),
        }),
        {
            AppHeader,
            ChatScreen,
            SettingsScreen,
        },
    );

    return createMain({ App, statePersistence });
};
