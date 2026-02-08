import { Input } from 'antd';
import type { ChangeEvent } from 'react';

const { Search } = Input;

interface SearchInputProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder?: string;
    readonly allowClear?: boolean;
    readonly style?: React.CSSProperties;
}

export const SearchInput = ({
    value,
    onChange,
    placeholder = 'Search...',
    allowClear = true,
    style,
}: SearchInputProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <Search
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            allowClear={allowClear}
            style={style}
        />
    );
};
