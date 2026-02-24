import { Layout, type Theme, ThemeProvider } from '@minimalist-apps/components';
import { exhaustive } from '@minimalist-apps/type-utils';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { Screen } from '../appStore/AppState';

export type AppStateProps = {
    readonly themeMode: Theme;
    readonly currentScreen: Screen;
};

type AppDeps = {
    readonly AppHeader: FC;
    readonly ChatScreen: FC<{ readonly identity: string }>;
    readonly SettingsScreen: FC;
};

export type AppDep = {
    readonly App: FC;
};

const createRandomIdentity = (): string => {
    const fallback = Math.random().toString(36).slice(2, 10);

    if (typeof crypto.randomUUID !== 'function') {
        return `anon-${fallback}`;
    }

    return `anon-${crypto.randomUUID().slice(0, 8)}`;
};

export const AppPure = (deps: AppDeps, { themeMode, currentScreen }: AppStateProps) => {
    const [identity, setIdentity] = useState('');

    useEffect(() => {
        setIdentity(createRandomIdentity());
    }, []);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'Chat':
                return <deps.ChatScreen identity={identity} />;
            case 'Settings':
                return <deps.SettingsScreen />;
            default:
                return exhaustive(currentScreen);
        }
    };

    return (
        <ThemeProvider mode={themeMode}>
            <Layout>
                <Layout.Header>
                    <deps.AppHeader />
                </Layout.Header>
                <Layout.Content maxWidth={760}>{renderScreen()}</Layout.Content>
            </Layout>
        </ThemeProvider>
    );
};
