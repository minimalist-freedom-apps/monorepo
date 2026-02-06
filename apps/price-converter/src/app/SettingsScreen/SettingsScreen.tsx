import { Column } from '@minimalistic-apps/components';
import type { FC } from 'react';
import type { MnemonicSettingsDep } from './MnemonicSettings';
import type { ThemeSettingsDep } from './ThemeSettings';

type SettingsScreenDeps = ThemeSettingsDep & MnemonicSettingsDep;

export type SettingsScreenDep = { SettingsScreen: FC };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <deps.ThemeSettings />
        <deps.MnemonicSettings />
    </Column>
);
