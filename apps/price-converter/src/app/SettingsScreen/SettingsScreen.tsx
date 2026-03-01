import type { DebugSettingsDep } from '@minimalist-apps/fragment-debug';
import type { BackupMnemonicDep, RestoreMnemonicServiceDep } from '@minimalist-apps/fragment-evolu';
import { SettingsScreen } from '@minimalist-apps/fragment-settings';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';
import type { GoBackDep } from '@minimalist-apps/navigator';
import type { FC } from 'react';
import { RestoreSeed } from './RestoreSeed';

type SettingsScreenDeps = ThemeModeSettingsDep &
    DebugSettingsDep &
    BackupMnemonicDep &
    RestoreMnemonicServiceDep &
    GoBackDep;

export type SettingsScreenDep = { SettingsScreen: FC };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <SettingsScreen goBack={deps.goBack}>
        <deps.ThemeModeSettings />
        <deps.BackupMnemonic />
        <RestoreSeed restoreMnemonic={deps.restoreMnemonic} />
        <deps.DebugSettings />
    </SettingsScreen>
);
