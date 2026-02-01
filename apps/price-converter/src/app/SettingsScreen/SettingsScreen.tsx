import {
    Column,
    Row,
    Switch,
    Text,
    Title,
} from '@minimalistic-apps/components';
import { useServices } from '../../ServicesProvider';
import { selectThemeMode, useStore } from '../../state/createStore';

export const SettingsScreen = () => {
    const { store } = useServices();
    const themeMode = useStore(selectThemeMode);

    const handleThemeToggle = (checked: boolean) => {
        store.setState({ theme: checked ? 'light' : 'dark' });
    };

    return (
        <Column gap={24} style={{ padding: 24 }}>
            <Title level={2}>Settings</Title>

            <Row
                gap={16}
                style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Column gap={4}>
                    <Text>Theme Mode</Text>
                    <Text>
                        {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                </Column>
                <Switch
                    checked={themeMode === 'light'}
                    onChange={handleThemeToggle}
                    checkedChildren="☀️"
                    unCheckedChildren="🌙"
                />
            </Row>
        </Column>
    );
};
