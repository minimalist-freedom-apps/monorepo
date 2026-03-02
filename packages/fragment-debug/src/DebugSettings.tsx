import { Code, SettingsRow, Switch } from '@minimalist-apps/components';
import type { FC } from 'react';
import type { SetDebugModeDep } from './createSetDebugMode';

type DebugSettingsStateProps = {
    readonly debugMode: boolean;
};

export type DebugSettingsDep = {
    readonly DebugSettings: FC;
};

const getDebugRuntimeInfo = () => {
    const hasWindow = typeof globalThis.window !== 'undefined';
    const hasDocument = typeof globalThis.document !== 'undefined';
    const hasNavigator = typeof globalThis.navigator !== 'undefined';
    const browserNavigator = hasNavigator ? globalThis.navigator : undefined;

    const onLine =
        browserNavigator === undefined ? 'n/a' : browserNavigator.onLine ? 'online' : 'offline';

    const viewport = hasWindow
        ? `${globalThis.window.innerWidth}x${globalThis.window.innerHeight}`
        : 'n/a';

    return [
        `runtime: ${hasWindow ? 'browser' : 'non-browser'}`,
        `document: ${hasDocument ? 'available' : 'missing'}`,
        `platform: ${browserNavigator?.platform ?? 'n/a'}`,
        `language: ${browserNavigator?.language ?? 'n/a'}`,
        `online: ${onLine}`,
        `viewport: ${viewport}`,
        `url: ${hasWindow ? globalThis.window.location.href : 'n/a'}`,
        `userAgent: ${browserNavigator?.userAgent ?? 'n/a'}`,
    ].join('\n');
};

export const DebugSettingsPure = (
    deps: SetDebugModeDep,
    { debugMode }: DebugSettingsStateProps,
) => {
    const onDebugToggle = (checked: boolean) => {
        deps.setDebugMode(checked);
    };

    const debugRuntimeInfo = getDebugRuntimeInfo();

    return (
        <>
            <SettingsRow label="Debug" direction="row">
                <Switch checked={debugMode} onChange={onDebugToggle} testId="debug-mode-switch" />
            </SettingsRow>
            {debugMode ? (
                <SettingsRow label="Debug" direction="column">
                    <Code>{debugRuntimeInfo}</Code>
                </SettingsRow>
            ) : null}
        </>
    );
};
