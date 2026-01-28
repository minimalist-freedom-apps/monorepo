import { Flex, Input, Typography } from 'antd';
import type { InputRef } from 'antd';
import type { ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';
import { BRAND_COLORS } from './theme';

const { Text } = Typography;

interface CurrencyInputProps {
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly focused: boolean;
    readonly onFocus: () => void;
}

/**
 * Primary currency input component using Ant Design Input.
 */
export const CurrencyInput = ({
    label,
    value,
    onChange,
    focused,
    onFocus,
}: CurrencyInputProps) => {
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (focused && inputRef.current) {
            inputRef.current.select();
        }
    }, [focused]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <Flex
            gap={16}
            align="center"
            style={{ marginBottom: 24, padding: '0 8px' }}
        >
            <Input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onFocus={onFocus}
                placeholder="0"
                inputMode="decimal"
                style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    background: '#1e1e1e',
                    borderColor: '#333',
                    color: '#fff',
                }}
            />
            <Text
                style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    minWidth: 60,
                    color: BRAND_COLORS.primary,
                }}
            >
                {label}
            </Text>
        </Flex>
    );
};
