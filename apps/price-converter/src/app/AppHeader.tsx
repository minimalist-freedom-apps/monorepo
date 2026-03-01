import {
    AppHeader,
    Button,
    Dropdown,
    Menu,
    type MenuClickInfo,
    type MenuItems,
    MenuOutlined,
    ReloadOutlined,
    Row,
    SettingOutlined,
    Switch,
} from '@minimalist-apps/components';
import { SettingsButton } from '@minimalist-apps/fragment-settings';
import type { NavigateDep } from '@minimalist-apps/navigator';
import { exhaustive } from '@minimalist-apps/type-utils';
import { type FC, useRef, useState } from 'react';
import { config } from '../../config';
import type { FetchAndStoreRatesDep } from '../converter/fetchAndStoreRates';
import type { BtcMode, NavigatorScreen } from '../state/State';
import type { SetBtcModeDep } from '../state/setBtcMode';

type BurgerMenuKey = 'mode' | 'refresh' | 'settings';

type AppHeaderStateProps = {
    readonly loading: boolean;
    readonly mode: BtcMode;
};

type AppHeaderDeps = FetchAndStoreRatesDep & NavigateDep<NavigatorScreen> & SetBtcModeDep;

export type AppHeaderDep = {
    readonly AppHeader: FC;
};

export const AppHeaderPure = (deps: AppHeaderDeps, { loading, mode }: AppHeaderStateProps) => {
    const [isCompactMenuOpen, setIsCompactMenuOpen] = useState(false);
    const keepCompactMenuOpenRef = useRef(false);

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
        <Row gap={8}>
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

    const settingsButton = <SettingsButton onOpenSettings={handleSettings} />;

    const handleCompactMenuClick = ({ key, closeOnClick }: MenuClickInfo<BurgerMenuKey>) => {
        switch (key) {
            case 'mode':
                break;

            case 'refresh':
                deps.fetchAndStoreRates();

                break;

            case 'settings':
                handleSettings();

                break;

            default:
                exhaustive(key);
        }

        if (closeOnClick === true) {
            setIsCompactMenuOpen(false);

            return;
        }

        keepCompactMenuOpenRef.current = true;
    };

    const handleCompactMenuOpenChange = (open: boolean) => {
        if (!open && keepCompactMenuOpenRef.current) {
            keepCompactMenuOpenRef.current = false;

            return;
        }

        setIsCompactMenuOpen(open);
    };

    const compactMenuItems: MenuItems<BurgerMenuKey> = [
        {
            key: 'mode',
            icon: null,
            label: <Row gap={8}>{modeSwitcher}</Row>,
            closeOnClick: false,
        },
        {
            key: 'refresh',
            icon: <ReloadOutlined />,
            label: loading ? 'Refreshing rates…' : 'Refresh rates',
            closeOnClick: true,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            closeOnClick: true,
        },
    ];

    return (
        <AppHeader
            title={config.appShortName}
            onTitleClick={handleHome}
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
                    open={isCompactMenuOpen}
                    onOpenChange={handleCompactMenuOpenChange}
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
