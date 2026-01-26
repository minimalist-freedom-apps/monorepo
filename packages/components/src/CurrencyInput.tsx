import { useEffect, useRef } from 'react';
import './CurrencyInput.css';

interface CurrencyInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    focused: boolean;
    onFocus: () => void;
}

export const CurrencyInput = ({
    label,
    value,
    onChange,
    focused,
    onFocus,
}: CurrencyInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (focused && inputRef.current) {
            inputRef.current.select();
        }
    }, [focused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="currency-input-container">
            <input
                ref={inputRef}
                type="text"
                className="currency-input btc-input"
                value={value}
                onChange={handleChange}
                onFocus={onFocus}
                placeholder="0"
                inputMode="decimal"
            />
            <span className="currency-label">{label}</span>
        </div>
    );
};
