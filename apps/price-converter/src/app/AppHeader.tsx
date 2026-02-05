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
import { useDeps } from '../ServicesProvider';
import { selectLoading, selectMode, useStore } from '../state/createStore';

export const AppHeader = () => {
    const { store, fetchAndStoreRates } = useDeps();
    const loading = useStore(selectLoading);
    const mode = useStore(selectMode);

    const handleToggle = (checked: boolean) => {
        store.setState({ mode: checked ? 'Sats' : 'BTC' });
    };

    const handleSettings = () => {
        store.setState({ currentScreen: 'Settings' });
    };

    const handleHome = () => {
        store.setState({ currentScreen: 'Converter' });
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
                            onClick={fetchAndStoreRates}
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
