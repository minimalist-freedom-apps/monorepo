import { AppHeader as CommonAppHeader } from '@minimalist-apps/components';
import { SettingsButton } from '@minimalist-apps/fragment-settings';
import { config } from '../../config';

interface AppHeaderProps {
    readonly onHome: () => void;
    readonly onOpenSettings: () => void;
}

export const AppHeader = ({ onHome, onOpenSettings }: AppHeaderProps) => (
    <CommonAppHeader
        title={config.appShortName}
        onTitleClick={onHome}
        actions={<SettingsButton onOpenSettings={onOpenSettings} />}
    />
);
