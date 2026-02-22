import type { DebugSettingsDep } from '@minimalist-apps/fragment-debug';
import type { BackupMnemonicDep, RestoreMnemonicDep } from '@minimalist-apps/fragment-evolu';
import { SettingsScreenPure as SharedSettingsScreenPure } from '@minimalist-apps/fragment-settings';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';
import type { FC } from 'react';

type SettingsScreenDeps = ThemeModeSettingsDep &
    DebugSettingsDep &
    BackupMnemonicDep &
    RestoreMnemonicDep & {
        readonly onBack: () => void;
    };

export type SettingsScreenDep = { SettingsScreen: FC };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <SharedSettingsScreenPure onBack={deps.onBack}>
        <deps.ThemeModeSettings />
        <deps.BackupMnemonic />
        <deps.RestoreMnemonic />
        <deps.DebugSettings />
    </SharedSettingsScreenPure>
);
