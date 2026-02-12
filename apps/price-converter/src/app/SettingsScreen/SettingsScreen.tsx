import { Column } from '@minimalist-apps/components';
import type { FC } from 'react';
import type { DebugSettingsDep } from './DebugSettings';
import type { MnemonicSettingsDep } from './MnemonicSettings';
import type { ThemeSettingsDep } from './ThemeSettings';

type SettingsScreenDeps = ThemeSettingsDep & DebugSettingsDep & MnemonicSettingsDep;

export type SettingsScreenDep = { SettingsScreen: FC };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <deps.ThemeSettings />
        <deps.MnemonicSettings />
        <deps.DebugSettings />
    </Column>
);
