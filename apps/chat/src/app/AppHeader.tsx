import { Button, AppHeader as CommonAppHeader, SettingOutlined } from '@minimalist-apps/components';
import { config } from '../../config';

interface AppHeaderProps {
    readonly onHome: () => void;
    readonly onOpenSettings: () => void;
}

export const AppHeader = ({ onHome, onOpenSettings }: AppHeaderProps) => (
    <CommonAppHeader
        title={config.appShortName}
        onTitleClick={onHome}
        actions={<Button variant="text" icon={<SettingOutlined />} onClick={onOpenSettings} />}
    />
);
