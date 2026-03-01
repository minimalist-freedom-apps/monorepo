import { Layout, type Theme, ThemeProvider } from '@minimalist-apps/components';
import { exhaustive } from '@minimalist-apps/type-utils';
import type { FC } from 'react';
import type { Screen } from '../appStore/AppState';

type AppStateProps = {
    readonly themeMode: Theme;
    readonly currentScreen: Screen;
};

type AppDeps = {
    readonly AppHeader: FC;
    readonly ChatScreen: FC;
    readonly SettingsScreen: FC;
};

export type AppDep = {
    readonly App: FC;
};

export const AppPure = (deps: AppDeps, { themeMode, currentScreen }: AppStateProps) => {
    const renderScreen = () => {
        switch (currentScreen) {
            case 'Chat':
                return <deps.ChatScreen />;
            case 'Settings':
                return <deps.SettingsScreen />;
            default:
                return exhaustive(currentScreen);
        }
    };

    return (
        <ThemeProvider mode={themeMode}>
            <div id="app">
                <Layout>
                    <Layout.Header>
                        <deps.AppHeader />
                    </Layout.Header>
                    <Layout.Content maxWidth={760}>{renderScreen()}</Layout.Content>
                </Layout>
            </div>
        </ThemeProvider>
    );
};
