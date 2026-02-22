import { Column } from '@minimalist-apps/components';
import type { DebugSettingsDep } from '@minimalist-apps/fragment-debug';
import type { BackupMnemonicDep, RestoreMnemonicDep } from '@minimalist-apps/fragment-evolu';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';
import type { FC } from 'react';

type SettingsScreenDeps = ThemeModeSettingsDep &
    DebugSettingsDep &
    BackupMnemonicDep &
    RestoreMnemonicDep;

export type SettingsScreenDep = { SettingsScreen: FC };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <deps.ThemeModeSettings />
        <deps.BackupMnemonic />
        <deps.RestoreMnemonic />
        <deps.DebugSettings />
    </Column>
);
