import {
    Button,
    Header,
    ReloadOutlined,
    Row,
    Title,
} from '@minimalistic-apps/components';
import { createCompositionRoot } from '../createCompositionRoot';
import {
    selectBtcValue,
    selectLoading,
    selectMode,
    useStore,
    useStoreActions,
} from './state';

const { fetchAverageRates } = createCompositionRoot();

export const AppHeader = () => {
    const loading = useStore(selectLoading);
    const mode = useStore(selectMode);
    const btcValue = useStore(selectBtcValue);
    const actions = useStoreActions();

    const fetchRates = async () => {
        actions.setLoading(true);
        actions.setError('');

        const result = await fetchAverageRates();
        if (!result.ok) {
            actions.setError('Failed to fetch rates. Please try again.');
            actions.setLoading(false);
            return;
        }

        const fetchedRates = result.value;
        const now = Date.now();
        actions.setRates(fetchedRates, now);

        // Recalculate values with new rates
        if (btcValue) {
            actions.recalculateFromBtc(btcValue, fetchedRates);
        }

        actions.setLoading(false);
    };

    return (
        <Header>
            <Title level={4}>Price Converter</Title>
            <Row gap={8}>
                <Button variant="text" onClick={actions.toggleMode}>
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
