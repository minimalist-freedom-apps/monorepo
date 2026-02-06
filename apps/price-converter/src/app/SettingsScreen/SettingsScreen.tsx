import { Column } from '@minimalistic-apps/components';
import type React from 'react';
import type { MnemonicSettingsDep } from './MnemonicSettings';
import type { ThemeSettingsDep } from './ThemeSettings';

type SettingsScreenDeps = ThemeSettingsDep & MnemonicSettingsDep;

type SettingsScreen = React.FC;

export type SettingsScreenDep = { SettingsScreen: SettingsScreen };

export const settingsScreenPure = (
    deps: SettingsScreenDeps,
): React.ReactNode => (
    <Column gap={12}>
        <deps.ThemeSettings />
        <deps.MnemonicSettings />
    </Column>
);
