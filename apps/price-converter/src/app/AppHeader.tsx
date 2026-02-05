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
import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import type React from 'react';
import type { FetchAndStoreRatesDep } from '../converter/fetchAndStoreRates';
import type { Mode } from '../state/State';

type AppHeaderStateProps = {
    readonly loading: boolean;
    readonly mode: Mode;
};

type SetMode = (mode: Mode) => void;
type SetCurrentScreen = (screen: 'Converter' | 'Settings') => void;

type AppHeaderDeps = ComponentConnectDep<AppHeaderStateProps> &
    FetchAndStoreRatesDep & {
        readonly setMode: SetMode;
        readonly setCurrentScreen: SetCurrentScreen;
    };

type AppHeader = React.FC;

export type AppHeaderDep = {
    readonly AppHeader: AppHeader;
};

export const createAppHeader = (deps: AppHeaderDeps): AppHeader =>
    deps.connect(({ loading, mode }) => {
        const handleToggle = (checked: boolean) => {
            deps.setMode(checked ? 'Sats' : 'BTC');
        };

        const handleSettings = () => {
            deps.setCurrentScreen('Settings');
        };

        const handleHome = () => {
            deps.setCurrentScreen('Converter');
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
                                checked={mode === 'Sats'}
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
    });
