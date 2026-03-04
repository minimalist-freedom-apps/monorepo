import './Input.css';

import type { InputRef as AntInputRef } from 'antd';
import { Input as AntInput, theme } from 'antd';
import type { ChangeEvent, RefObject } from 'react';
import { decreaseFontSize, type FontSize, fontSizeMap } from './fontSize';

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
    readonly fontSize?: FontSize;
    readonly textAlign?: 'center' | 'left' | 'right';
    readonly label?: string;
    readonly className?: string;
    readonly testId?: string;
}

const antSizeMap = {
    small: 'small',
    medium: 'middle',
    large: 'large',
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
    fontSize = size,
    textAlign,
    label,
    className,
    testId,
}: InputProps) => {
    const { token } = theme.useToken();
    const labelFontSize = fontSizeMap[decreaseFontSize(fontSize, 1)];

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
            data-testid={testId}
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
                fontSize: fontSizeMap[fontSize],
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
                    fontSize: labelFontSize,
                    lineHeight: '16px',
                    padding: '0 4px',
                    backgroundColor: token.colorBgContainer,
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
