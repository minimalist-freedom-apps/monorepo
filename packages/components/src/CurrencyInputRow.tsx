import { DeleteOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Typography } from 'antd';
import type { InputRef } from 'antd';
import type { ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';

const { Text } = Typography;

interface CurrencyInputRowProps {
    readonly code: string;
    readonly name?: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly focused: boolean;
    readonly onFocus: () => void;
    readonly onRemove?: () => void;
    readonly showLabel?: boolean;
    readonly labelColor?: string;
}

/**
 * Currency input row with optional remove button using Ant Design Input.
 */
export const CurrencyInputRow = ({
    code,
    name,
    value,
    onChange,
    focused,
    onFocus,
    onRemove,
    showLabel = true,
    labelColor,
}: CurrencyInputRowProps) => {
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (focused && inputRef.current) {
            inputRef.current.select();
        }
    }, [focused]);

    return (
        <Flex gap={12} align="center" style={{ marginBottom: 12 }}>
            <Input
                ref={inputRef}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
                onFocus={onFocus}
                placeholder="0"
                inputMode="decimal"
                style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    background: '#1e1e1e',
                    borderColor: '#333',
                    color: '#fff',
                }}
            />
            {showLabel && (
                <Text
                    style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        minWidth: 60,
                        color: labelColor || '#087d89',
                    }}
                >
                    {code} {name && name !== code ? name : ''}
                </Text>
            )}
            {onRemove && (
                <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={onRemove}
                    size="small"
                />
            )}
        </Flex>
    );
};
