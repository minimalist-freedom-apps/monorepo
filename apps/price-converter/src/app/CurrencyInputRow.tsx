import {
    BRAND_COLORS,
    Button,
    DeleteOutlined,
    Input,
    type InputRef,
    Row,
    Text,
} from '@minimalistic-apps/components';
import { useEffect, useRef } from 'react';

interface CurrencyInputRowProps {
    readonly code: string;
    readonly name?: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly focused: boolean;
    readonly onFocus: () => void;
    readonly onRemove?: () => void;
}

export const CurrencyInputRow = ({
    code,
    name,
    value,
    onChange,
    focused,
    onFocus,
    onRemove,
}: CurrencyInputRowProps) => {
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (focused && inputRef.current) {
            inputRef.current.select();
        }
    }, [focused]);

    return (
        <Row gap={12} style={{ marginBottom: 12 }}>
            <Input
                inputRef={inputRef}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                placeholder="0"
                inputMode="decimal"
                monospace
            />
            <Text
                style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    minWidth: 60,
                    color: BRAND_COLORS.primary,
                }}
            >
                {code} {name && name !== code ? name : ''}
            </Text>
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
