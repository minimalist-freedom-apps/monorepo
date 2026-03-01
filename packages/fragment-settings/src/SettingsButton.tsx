import { Button, SettingOutlined } from '@minimalist-apps/components';

export type SettingsButtonProps = {
    readonly onOpenSettings: () => void;
};

export const SettingsButton = ({ onOpenSettings }: SettingsButtonProps) => (
    <Button
        variant="text"
        icon={<SettingOutlined />}
        onClick={onOpenSettings}
        testId="open-settings-button"
        ariaLabel="Settings"
    />
);
