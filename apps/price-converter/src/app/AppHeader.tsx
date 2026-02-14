import {
    AppHeader,
    Button,
    Dropdown,
    Menu,
    type MenuItems,
    MenuOutlined,
    ReloadOutlined,
    Row,
    SettingOutlined,
    Switch,
} from '@minimalist-apps/components';
import { exhaustive } from '@minimalist-apps/type-utils';
import type { FC } from 'react';
import { config } from '../../config';
import type { FetchAndStoreRatesDep } from '../converter/fetchAndStoreRates';
import type { NavigateDep } from '../state/navigate';
import type { BtcMode } from '../state/State';
import type { SetBtcModeDep } from '../state/setBtcMode';
import type { DebugHeaderDep } from './DebugHeader';

type BurgerMenuKey = 'mode' | 'refresh' | 'settings';

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

    const modeSwitcher = (
        <Row gap={4}>
            <strong>₿</strong>
            <Switch disableStateBgColorChange checked={mode === 'sats'} onChange={handleToggle} />
            <strong>丰</strong>
        </Row>
    );

    const refreshButton = (
        <Button
            variant="text"
            icon={<ReloadOutlined />}
            onClick={deps.fetchAndStoreRates}
            loading={loading}
        />
    );

    const settingsButton = (
        <Button variant="text" icon={<SettingOutlined />} onClick={handleSettings} />
    );

    const handleCompactMenuClick = ({ key }: { readonly key: BurgerMenuKey }) => {
        switch (key) {
            case 'mode':
                handleToggle(mode !== 'sats');

                return;

            case 'refresh':
                deps.fetchAndStoreRates();

                return;

            case 'settings':
                handleSettings();

                return;

            default:
                return exhaustive(key);
        }
    };

    const compactMenuItems: MenuItems<BurgerMenuKey> = [
        {
            key: 'mode',
            icon: <strong>{mode === 'sats' ? '丰' : '₿'}</strong>,
            label: mode === 'sats' ? 'Switch to BTC mode' : 'Switch to SATS mode',
        },
        {
            key: 'refresh',
            icon: <ReloadOutlined />,
            label: loading ? 'Refreshing rates…' : 'Refresh rates',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    return (
        <AppHeader
            title={config.appShortName}
            onTitleClick={handleHome}
            secondary={<deps.DebugHeader />}
            actions={
                <>
                    {modeSwitcher}
                    {refreshButton}
                    {settingsButton}
                </>
            }
            compactActions={
                <Dropdown
                    trigger={['click']}
                    placement="bottomRight"
                    dropdownRender={() => (
                        <Menu
                            selectable={false}
                            items={compactMenuItems}
                            onClick={handleCompactMenuClick}
                        />
                    )}
                >
                    <span>
                        <Button variant="text" icon={<MenuOutlined />} />
                    </span>
                </Dropdown>
            }
        />
    );
};
