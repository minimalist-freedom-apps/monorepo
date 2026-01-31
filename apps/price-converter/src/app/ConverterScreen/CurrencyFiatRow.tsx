import {
    Button,
    DeleteOutlined,
    Row,
    Text,
} from '@minimalistic-apps/components';
import { CurrencyInput } from './CurrencyInput';

interface CurrencyInputRowProps {
    readonly code: string;
    readonly name?: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly onRemove?: () => void;
}

export const CurrencyFiatRow = ({
    code,
    value,
    onChange,
    onRemove,
}: CurrencyInputRowProps) => {
    return (
        <Row gap={12}>
            <CurrencyInput value={value} onChange={onChange} />
            <Text>{code}</Text>
            {onRemove && (
                <Button
                    variant="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={onRemove}
                    size="small"
                />
            )}
        </Row>
    );
};
