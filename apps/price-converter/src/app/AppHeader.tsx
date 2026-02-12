import {
    AppHeader,
    Button,
    ReloadOutlined,
    SettingOutlined,
    Switch,
} from '@minimalist-apps/components';
import type { FC } from 'react';
import { config } from '../../config';
import type { FetchAndStoreRatesDep } from '../converter/fetchAndStoreRates';
import type { NavigateDep } from '../state/navigate';
import type { BtcMode } from '../state/State';
import type { SetBtcModeDep } from '../state/setBtcMode';
import type { DebugHeaderDep } from './DebugHeader';

export type AppHeaderStateProps = {
    readonly loading: boolean;
    readonly mode: BtcMode;
};

type AppHeaderDeps = FetchAndStoreRatesDep & NavigateDep & SetBtcModeDep & DebugHeaderDep;

export type AppHeaderDep = {
    readonly AppHeader: FC;
};

export const AppHeaderPure = (deps: AppHeaderDeps, { loading, mode }: AppHeaderStateProps) => {
    const handleToggle = (checked: boolean) => {
        deps.setBtcMode(checked ? 'sats' : 'btc');
    };

    const handleSettings = () => {
        deps.navigate('Settings');
    };

    const handleHome = () => {
        deps.navigate('Converter');
    };

    return (
        <AppHeader title={config.appShortName} onTitleClick={handleHome}>
            <deps.DebugHeader />
            <strong>₿</strong>
            <Switch disableStateBgColorChange checked={mode === 'sats'} onChange={handleToggle} />
            <strong>丰</strong>
            <Button
                variant="text"
                icon={<ReloadOutlined />}
                onClick={deps.fetchAndStoreRates}
                loading={loading}
            />
            <Button
                variant="text"
                icon={<SettingOutlined />}
                onClick={handleSettings}
                aria-label="Settings"
            />
        </AppHeader>
    );
};
