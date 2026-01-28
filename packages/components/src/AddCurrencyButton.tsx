import { PlusOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { BRAND_COLORS } from './theme';

interface AddCurrencyButtonProps {
    readonly onClick: () => void;
}

/**
 * Floating action button for adding currencies using Ant Design FloatButton.
 */
export const AddCurrencyButton = ({ onClick }: AddCurrencyButtonProps) => (
    <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={onClick}
        style={{
            backgroundColor: BRAND_COLORS.primary,
            width: 56,
            height: 56,
        }}
        tooltip="Add Currency"
    />
);
