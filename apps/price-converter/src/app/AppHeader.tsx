import {
    Button,
    Header,
    ReloadOutlined,
    Row,
    Title,
} from '@minimalistic-apps/components';
import { useServices } from './state/ServicesProvider';
import { selectLoading, selectMode, useStore } from './state/createStore';

export const AppHeader = () => {
    const services = useServices();
    const loading = useStore(selectLoading);
    const mode = useStore(selectMode);

    return (
        <Header>
            <Title level={4}>Price Converter</Title>
            <Row gap={8}>
                <Button variant="text" onClick={services.toggleMode}>
                    {mode}
                </Button>
                <Button
                    variant="text"
                    icon={<ReloadOutlined />}
                    onClick={services.fetchAndStoreRates}
                    loading={loading}
                />
            </Row>
        </Header>
    );
};
