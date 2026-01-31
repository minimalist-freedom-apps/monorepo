import type { CurrencyCode } from '@evolu/common';
import {
    Button,
    DeleteOutlined,
    Row,
    Text,
} from '@minimalistic-apps/components';
import { selectMode, useStore } from '../../state/createStore';
import { CurrencyInput } from './CurrencyInput';

interface CurrencyInputRowProps {
    readonly code: CurrencyCode | 'BTC';
    readonly value: number;
    readonly onChange: (value: number) => void;
    readonly onRemove?: () => void;
}

export const CurrencyRow = ({
    code,
    value,
    onChange,
    onRemove,
}: CurrencyInputRowProps) => {
    const mode = useStore(selectMode);

    return (
        <Row gap={12}>
            <CurrencyInput value={value} onChange={onChange} code={code} />
            <Text>{code === 'BTC' && mode === 'Sats' ? 'Sats' : code}</Text>
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
