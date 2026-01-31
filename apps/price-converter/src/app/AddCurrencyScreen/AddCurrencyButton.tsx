import { FloatButton, PlusOutlined } from '@minimalistic-apps/components';
import { useServices } from '../../ServicesProvider';

export const AddCurrencyButton = () => {
    const { store } = useServices();

    const onClick = () => store.setState({ currentScreen: 'AddCurrency' });

    return (
        <FloatButton
            icon={<PlusOutlined />}
            onClick={onClick}
            tooltip="Add Currency"
        />
    );
};
