import {
    Button,
    Header,
    ReloadOutlined,
    Row,
    Title,
} from '@minimalistic-apps/components';
import { createCompositionRoot } from '../createCompositionRoot';
import { useServices } from './state/ServicesProvider';
import {
    selectBtcValue,
    selectLoading,
    selectMode,
    useStore,
} from './state/createStore';

const { fetchAverageRates } = createCompositionRoot();

export const AppHeader = () => {
    const services = useServices();
    const loading = useStore(selectLoading);
    const mode = useStore(selectMode);
    const btcValue = useStore(selectBtcValue);

    const fetchRates = async () => {
        services.store.setState({ loading: true });
        services.store.setState({ error: '' });

        const result = await fetchAverageRates();
        if (!result.ok) {
            services.store.setState({
                error: 'Failed to fetch rates. Please try again.',
            });
            services.store.setState({ loading: false });
            return;
        }

        const fetchedRates = result.value;
        const now = Date.now();
        services.setRates({ rates: fetchedRates, timestamp: now });

        // Recalculate values with new rates
        if (btcValue) {
            services.recalculateFromBtc({
                value: btcValue,
                rates: fetchedRates,
            });
        }

        services.store.setState({ loading: false });
    };

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
                    onClick={fetchRates}
                    loading={loading}
                />
            </Row>
        </Header>
    );
};
