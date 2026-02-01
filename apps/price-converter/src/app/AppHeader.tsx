import {
    Button,
    Column,
    Header,
    ReloadOutlined,
    Row,
    SettingOutlined,
    Switch,
    Title,
} from '@minimalistic-apps/components';
import { useServices } from '../ServicesProvider';
import { selectLoading, selectMode, useStore } from '../state/createStore';
import { RatesLoading } from './RatesLoading';

export const AppHeader = () => {
    const { store, fetchAndStoreRates } = useServices();
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
        <Column>
            <Header>
                <Title
                    level={4}
                    style={{ cursor: 'pointer' }}
                    onClick={handleHome}
                >
                    Price Converter
                </Title>
                <Row gap={8}>
                    <strong>₿</strong>
                    <Switch checked={mode === 'Sats'} onChange={handleToggle} />
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
            </Header>
            <RatesLoading />
        </Column>
    );
};
