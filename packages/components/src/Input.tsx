import './Input.css';

import type { InputRef as AntInputRef } from 'antd';
import { Input as AntInput, theme } from 'antd';
import type { ChangeEvent, RefObject } from 'react';

export type InputRef = AntInputRef;

interface InputProps {
    readonly value: string;
    readonly onChange: (value: string, selection?: { start: number; end: number }) => void;
    readonly onFocus?: () => void;
    readonly placeholder?: string;
    readonly inputMode?: 'decimal' | 'numeric' | 'text';
    readonly inputRef?: RefObject<InputRef | null>;
    readonly monospace?: boolean;
    readonly size?: 'small' | 'medium' | 'large';
    readonly textAlign?: 'center' | 'left' | 'right';
    readonly label?: string;
    readonly className?: string;
}

const antSizeMap = {
    small: 'small',
    medium: 'middle',
    large: 'large',
} as const;

const fontSizeMap = {
    small: '0.875rem',
    medium: '1.125rem',
    large: '1.25rem',
} as const;

export const Input = ({
    value,
    onChange,
    onFocus,
    placeholder = '',
    inputMode = 'text',
    inputRef,
    monospace = false,
    size = 'medium',
    textAlign,
    label,
    className,
}: InputProps) => {
    const { token } = theme.useToken();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { selectionStart, selectionEnd } = e.target;

        onChange(
            e.target.value,
            selectionStart == null || selectionEnd == null
                ? undefined
                : { start: selectionStart, end: selectionEnd },
        );
    };

    const input = (
        <AntInput
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onFocus={onFocus}
            placeholder={placeholder}
            inputMode={inputMode}
            className={className}
            size={antSizeMap[size]}
            style={{
                flex: 1,
                fontFamily: monospace ? 'monospace' : 'inherit',
                fontSize: fontSizeMap[size],
                fontWeight: 600,
                textAlign,
            }}
        />
    );

    if (label === undefined) {
        return input;
    }

    return (
        <div style={{ position: 'relative', flex: 1 }}>
            <span
                style={{
                    position: 'absolute',
                    top: -8,
                    left: 8,
                    fontSize: 12,
                    lineHeight: '16px',
                    padding: '0 4px',
                    backgroundColor: token.colorBgContainer,
                    color: token.colorTextSecondary,
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            >
                {label}
            </span>
            {input}
        </div>
    );
};
