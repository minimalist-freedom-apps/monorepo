import { Column } from '@minimalistic-apps/components';
import type React from 'react';
import { MnemonicSettings } from './MnemonicSettings';
import type { ThemeSettingsDep } from './ThemeSettings';

type SettingsScreenDeps = ThemeSettingsDep;

type SettingsScreen = React.FC;

export type SettingsScreenDep = { SettingsScreen: SettingsScreen };

export const createSettingsScreen =
    (deps: SettingsScreenDeps): SettingsScreen =>
    () => {
        const { ThemeSettings } = deps;

        return (
            <Column gap={12}>
                <ThemeSettings />
                <MnemonicSettings />
            </Column>
        );
    };
