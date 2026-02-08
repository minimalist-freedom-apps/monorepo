import { exhaustive } from '@minimalist-apps/type-utils';
import type { FC } from 'react';
import type { Screen } from '../state/State';
import type { AddCurrencyScreenDep } from './AddCurrencyScreen/AddCurrencyScreen';
import type { AppLayoutDep } from './AppLayout';
import type { ConverterScreenDep } from './ConverterScreen/ConverterScreen';
import type { SettingsScreenDep } from './SettingsScreen/SettingsScreen';
import type { ThemeWrapperDep } from './ThemeWrapper';

export type AppStateProps = {
    readonly currentScreen: Screen;
};

type AppDeps = ConverterScreenDep &
    AddCurrencyScreenDep &
    SettingsScreenDep &
    AppLayoutDep &
    ThemeWrapperDep;

export type AppDep = {
    readonly App: FC;
};

export const AppPure = (deps: AppDeps, { currentScreen }: AppStateProps) => {
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
};
