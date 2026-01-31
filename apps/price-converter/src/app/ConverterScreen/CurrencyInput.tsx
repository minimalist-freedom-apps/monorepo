import { Input } from '@minimalistic-apps/components';

interface CurrencyInputProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
}

export const CurrencyInput = ({ value, onChange }: CurrencyInputProps) => {
    return (
        <Input
            value={value}
            onChange={onChange}
            placeholder="0"
            inputMode="decimal"
            monospace
            large
        />
    );
};
