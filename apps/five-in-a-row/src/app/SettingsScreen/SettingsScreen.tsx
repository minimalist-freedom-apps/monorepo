import { Column } from '@minimalist-apps/components';
import type { FC } from 'react';

interface SettingsScreenDeps {
    readonly ThemeModeSettings: FC;
    readonly GameModeSettings: FC;
    readonly BoardSizeSettings: FC;
    readonly OpeningProtocolSettings: FC;
}

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <deps.ThemeModeSettings />
        <deps.GameModeSettings />
        <deps.BoardSizeSettings />
        <deps.OpeningProtocolSettings />
    </Column>
);
