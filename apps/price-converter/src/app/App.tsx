import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import { exhaustive } from '@minimalistic-apps/type-utils';
import type React from 'react';
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
    ThemeWrapperDep;

export type App = React.FC;

export type AppDep = {
    readonly App: App;
};

export const createApp = (deps: AppDeps): App =>
    deps.connect(({ currentScreen }: AppStateProps) => {
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
