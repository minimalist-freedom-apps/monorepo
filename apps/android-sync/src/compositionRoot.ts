import { createConnect } from '@minimalist-apps/connect';
import {
    createDebugFragmentCompositionRoot,
    DebugHeaderPure,
    selectDebugMode,
} from '@minimalist-apps/fragment-debug';
import { createEvoluFragmentCompositionRoot } from '@minimalist-apps/fragment-evolu';
import { createLocalStorageFragmentCompositionRoot } from '@minimalist-apps/fragment-local-storage';
import {
    createNavigatorFragmentCompositionRoot,
    selectCurrentScreen,
} from '@minimalist-apps/fragment-navigator';
import {
    createThemeFragmentCompositionRoot,
    selectThemeMode,
} from '@minimalist-apps/fragment-theme';
import { createWindow } from '@minimalist-apps/window';
import { createElement } from 'react';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { DebugRow } from './app/DebugRow';
import { HomeScreenPure } from './app/HomeScreen/HomeScreen';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import type { Screen } from './appStore/AppState';
import { createAppStore } from './appStore/createAppStore';
import { Schema } from './appStore/evolu/schema';
import { createMain, type Main } from './createMain';
import {
    localStoragePrefix,
    mapLocalStorageToState,
    mapStateLocalStorage,
} from './localStorage/storageMaps';

export const createCompositionRoot = (): Main => {
    const window = createWindow();
    const store = createAppStore();

    const { goBack, navigate } = createNavigatorFragmentCompositionRoot<Screen>({
        store,
        rootScreen: 'Home',
    });

    const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
        store,
        prefix: localStoragePrefix,
        mapStateLocalStorage,
        mapLocalStorageToState,
        window,
    });

    const connect = createConnect({ store });

    const { ThemeModeSettings } = createThemeFragmentCompositionRoot({ connect, store });

    const { BackupMnemonic, RestoreMnemonic, ensureEvoluStorage } =
        createEvoluFragmentCompositionRoot({
            connect,
            store,
            onOwnerUsed: owner => store.setState({ activeOwnerId: owner.id }),
            schema: Schema,
            appName: 'android-sync-v1',
        });

    const { DebugSettings } = createDebugFragmentCompositionRoot({
        connect,
        store,
    });

    const DebugHeader = connect(DebugHeaderPure, ({ store }) => ({
        debugMode: selectDebugMode(store),
        children:
            store.activeOwnerId === null
                ? null
                : createElement(DebugRow, { ownerId: store.activeOwnerId }),
    }));

    const AppHeader = connect(AppHeaderPure, () => ({}), {
        onHome: () => navigate('Home'),
        onOpenSettings: () => navigate('Settings'),
    });

    const HomeScreen = connect(HomeScreenPure, () => ({}), { DebugHeader });

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeModeSettings,
            BackupMnemonic,
            RestoreMnemonic,
            DebugSettings,
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
            HomeScreen,
            SettingsScreen,
        },
    );

    return createMain({
        App,
        localStorageInit,
        onMainInit: () => {
            void ensureEvoluStorage();
        },
    });
};
