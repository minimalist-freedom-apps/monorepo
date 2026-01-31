import { Switch as AntSwitch } from 'antd';
import type { ReactNode } from 'react';

interface SwitchProps {
    readonly checked: boolean;
    readonly onChange: (checked: boolean) => void;
    readonly disabled?: boolean;
    readonly size?: 'small' | 'default';
    readonly checkedChildren?: ReactNode;
    readonly unCheckedChildren?: ReactNode;
}

export const Switch = ({
    checked,
    onChange,
    disabled = false,
    size = 'default',
    checkedChildren,
    unCheckedChildren,
}: SwitchProps) => {
    return (
        <AntSwitch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            size={size}
            checkedChildren={checkedChildren}
            unCheckedChildren={unCheckedChildren}
        />
    );
};
