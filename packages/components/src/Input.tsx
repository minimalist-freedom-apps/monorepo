import { Input as AntInput } from 'antd';
import type { InputRef as AntInputRef } from 'antd';
import type { ChangeEvent, RefObject } from 'react';
import { BRAND_COLORS } from './colors';

export type InputRef = AntInputRef;

interface InputProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly onFocus?: () => void;
    readonly placeholder?: string;
    readonly inputMode?: 'decimal' | 'numeric' | 'text';
    readonly inputRef?: RefObject<InputRef>;
    readonly monospace?: boolean;
    readonly large?: boolean;
}

export const Input = ({
    value,
    onChange,
    onFocus,
    placeholder = '',
    inputMode = 'text',
    inputRef,
    monospace = false,
    large = false,
}: InputProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <AntInput
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onFocus={onFocus}
            placeholder={placeholder}
            inputMode={inputMode}
            style={{
                flex: 1,
                fontFamily: monospace ? 'monospace' : 'inherit',
                fontSize: large ? '1.25rem' : '1.125rem',
                fontWeight: 600,
                background: BRAND_COLORS.backgroundDark,
                borderColor: BRAND_COLORS.border,
                color: BRAND_COLORS.textPrimary,
            }}
        />
    );
};
