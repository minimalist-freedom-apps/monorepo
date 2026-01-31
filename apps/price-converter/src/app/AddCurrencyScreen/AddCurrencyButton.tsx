import { FloatButton, PlusOutlined } from '@minimalistic-apps/components';

interface AddCurrencyButtonProps {
    readonly onClick: () => void;
}

export const AddCurrencyButton = ({ onClick }: AddCurrencyButtonProps) => (
    <FloatButton
        icon={<PlusOutlined />}
        onClick={onClick}
        tooltip="Add Currency"
    />
);
