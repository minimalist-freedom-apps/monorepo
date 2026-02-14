import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import type { ChangeEvent } from 'react';

interface SearchInputProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder?: string;
    readonly allowClear?: boolean;
    readonly autoFocus?: boolean;
    readonly style?: React.CSSProperties;
}

export const SearchInput = ({
    value,
    onChange,
    placeholder = 'Search...',
    allowClear = true,
    autoFocus = false,
    style,
}: SearchInputProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <Input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            allowClear={allowClear}
            autoFocus={autoFocus}
            size="large"
            suffix={<SearchOutlined style={{ fontSize: 18, pointerEvents: 'none' }} />}
            style={style}
        />
    );
};
