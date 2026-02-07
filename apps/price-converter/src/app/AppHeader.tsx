import {
    Button,
    Column,
    ReloadOutlined,
    Row,
    SettingOutlined,
    Switch,
    ThemeProvider,
    Title,
} from '@minimalistic-apps/components';
import type { FC } from 'react';
import type { FetchAndStoreRatesDep } from '../converter/fetchAndStoreRates';
import type { NavigateDep } from '../state/navigate';
import type { BtcMode } from '../state/State';
import type { SetBtcModeDep } from '../state/setBtcMode';

export type AppHeaderStateProps = {
    readonly loading: boolean;
    readonly mode: BtcMode;
};

type AppHeaderDeps = FetchAndStoreRatesDep & NavigateDep & SetBtcModeDep;

export type AppHeaderDep = {
    readonly AppHeader: FC;
};

export const AppHeaderPure = (
    deps: AppHeaderDeps,
    { loading, mode }: AppHeaderStateProps,
) => {
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
        <ThemeProvider mode="dark">
            <Column>
                <Row justify="space-between" align="center">
                    <Title onClick={handleHome}>Price Converter</Title>
                    <Row gap={8}>
                        <strong>₿</strong>
                        <Switch
                            disableStateBgColorChange
                            checked={mode === 'sats'}
                            onChange={handleToggle}
                        />
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
                    </Row>
                </Row>
            </Column>
        </ThemeProvider>
    );
};
