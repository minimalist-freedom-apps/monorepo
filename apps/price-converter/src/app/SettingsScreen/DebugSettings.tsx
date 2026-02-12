import { SettingsRow, Switch } from '@minimalist-apps/components';
import type { FC } from 'react';
import type { SetDebugModeDep } from '../../state/setDebugMode';

export type DebugSettingsStateProps = {
    readonly debugMode: boolean;
};

export type DebugSettingsDep = {
    readonly DebugSettings: FC;
};

export const DebugSettingsPure = (
    deps: SetDebugModeDep,
    { debugMode }: DebugSettingsStateProps,
) => {
    const onDebugToggle = (checked: boolean) => {
        deps.setDebugMode(checked);
    };

    return (
        <SettingsRow label="Debug">
            <Switch checked={debugMode} onChange={onDebugToggle} />
        </SettingsRow>
    );
};
