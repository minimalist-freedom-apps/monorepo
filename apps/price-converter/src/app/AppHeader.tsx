import {
    Button,
    Column,
    Header,
    ReloadOutlined,
    Row,
    Title,
} from '@minimalistic-apps/components';
import { useServices } from '../ServicesProvider';
import { selectLoading, selectMode, useStore } from '../state/createStore';
import { RatesLoading } from './RatesLoading';

export const AppHeader = () => {
    const { store, fetchAndStoreRates } = useServices();
    const loading = useStore(selectLoading);
    const mode = useStore(selectMode);

    const handleToggle = () => {
        store.setState({ mode: mode === 'BTC' ? 'Sats' : 'BTC' });
    };

    return (
        <Column>
            <Header>
                <Title level={4}>Price Converter</Title>
                <Row gap={8}>
                    <Button variant="text" onClick={handleToggle}>
                        {mode}
                    </Button>
                    <Button
                        variant="text"
                        icon={<ReloadOutlined />}
                        onClick={fetchAndStoreRates}
                        loading={loading}
                    />
                </Row>
            </Header>
            <RatesLoading />
        </Column>
    );
};
