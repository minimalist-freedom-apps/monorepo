import { Input, type InputRef, Row, Text } from '@minimalistic-apps/components';
import { useEffect, useRef } from 'react';

interface CurrencyInputProps {
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly focused: boolean;
    readonly onFocus: () => void;
}

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

    return (
        <Row gap={16}>
            <Input
                inputRef={inputRef}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                placeholder="0"
                inputMode="decimal"
                monospace
                large
            />
            <Text>{label}</Text>
        </Row>
    );
};
