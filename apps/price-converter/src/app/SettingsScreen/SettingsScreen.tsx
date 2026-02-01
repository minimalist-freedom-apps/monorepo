import { Column, SettingsRow, Switch } from '@minimalistic-apps/components';
import { useServices } from '../../ServicesProvider';
import { selectThemeMode, useStore } from '../../state/createStore';
import { EvoluMnemonicSettings } from './EvoluMnemonicSettingsSection';

export const SettingsScreen = () => {
    const { store } = useServices();
    const themeMode = useStore(selectThemeMode);

    const handleThemeToggle = (checked: boolean) => {
        store.setState({ theme: checked ? 'light' : 'dark' });
    };

    return (
        <Column gap={12}>
            <SettingsRow label="Theme Mode">
                <Switch
                    checked={themeMode === 'light'}
                    onChange={handleThemeToggle}
                />
            </SettingsRow>
            <EvoluMnemonicSettings />
        </Column>
    );
};
