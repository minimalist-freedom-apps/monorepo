import { Button, Column } from '@minimalist-apps/components';
import type { ThemeModeSettingsDep } from './ThemeModeSettings';

type SettingsScreenDeps = ThemeModeSettingsDep & {
    readonly onBack: () => void;
};

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <Button onClick={deps.onBack} variant="text" style={{ alignSelf: 'start' }}>
            ← Back
        </Button>
        <deps.ThemeModeSettings />
    </Column>
);
