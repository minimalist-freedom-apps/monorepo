import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import { exhaustive } from '@minimalistic-apps/type-utils';
import type React from 'react';
import { useEffect } from 'react';
import type { LoadInitialStateDep } from '../state/localStorage/loadInitialState';
import type { PersistStoreDep } from '../state/localStorage/persistStore';
import type { Screen } from '../state/State';
import type { AddCurrencyScreenDep } from './AddCurrencyScreen/AddCurrencyScreen';
import type { AppLayoutDep } from './AppLayout';
import type { ConverterScreenDep } from './ConverterScreen/ConverterScreen';
import type { SettingsScreenDep } from './SettingsScreen/SettingsScreen';
import type { ThemeWrapperDep } from './ThemeWrapper';

type AppStateProps = {
    readonly currentScreen: Screen;
};

type AppDeps = ComponentConnectDep<AppStateProps> &
    ConverterScreenDep &
    AddCurrencyScreenDep &
    SettingsScreenDep &
    AppLayoutDep &
    ThemeWrapperDep &
    LoadInitialStateDep &
    PersistStoreDep;

export type App = React.FC;

export type AppDep = {
    readonly App: App;
};

export const createApp = (deps: AppDeps): App =>
    deps.connect(({ currentScreen }: AppStateProps) => {
        useEffect(() => {
            deps.loadInitialState();
            const unsubscribe = deps.persistStore.start();

            window.addEventListener('beforeunload', unsubscribe);

            return () => {
                window.removeEventListener('beforeunload', unsubscribe);
                unsubscribe();
            };
        }, []);

        const renderScreen = () => {
            switch (currentScreen) {
                case 'Converter':
                    return <deps.ConverterScreen />;
                case 'AddCurrency':
                    return <deps.AddCurrencyScreen />;
                case 'Settings':
                    return <deps.SettingsScreen />;
                default:
                    return exhaustive(currentScreen);
            }
        };

        return (
            <deps.ThemeWrapper>
                <deps.AppLayout>{renderScreen()}</deps.AppLayout>
            </deps.ThemeWrapper>
        );
    });
