import type { DebugSettingsDep } from '@minimalist-apps/fragment-debug';
import type { BackupMnemonicDep, RestoreMnemonicDep } from '@minimalist-apps/fragment-evolu';
import { SettingsScreen } from '@minimalist-apps/fragment-settings';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';
import type { GoBackDep } from '@minimalist-apps/navigator';
import type { FC } from 'react';

type SettingsScreenDeps = ThemeModeSettingsDep &
    DebugSettingsDep &
    BackupMnemonicDep &
    RestoreMnemonicDep &
    GoBackDep;

export type SettingsScreenDep = { SettingsScreen: FC };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <SettingsScreen goBack={deps.goBack}>
        <deps.ThemeModeSettings />
        <deps.BackupMnemonic />
        <deps.RestoreMnemonic />
        <deps.DebugSettings />
    </SettingsScreen>
);
