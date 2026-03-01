import { Switch as AntSwitch } from 'antd';
import type { ReactNode } from 'react';
import './Switch.css';

interface SwitchProps {
    readonly checked: boolean;
    readonly onChange: (checked: boolean) => void;
    readonly disabled?: boolean;
    readonly size?: 'small' | 'default';
    readonly checkedChildren?: ReactNode;
    readonly unCheckedChildren?: ReactNode;
    readonly testId?: string;

    // Hack to make it work in 'primary' themed elements (Header)
    readonly disableStateBgColorChange?: boolean;
}

export const Switch = ({
    checked,
    onChange,
    disabled = false,
    size = 'default',
    checkedChildren,
    unCheckedChildren,
    testId,
    disableStateBgColorChange,
}: SwitchProps) => {
    const className = disableStateBgColorChange === true ? 'antd-no-color-switch' : undefined;

    return (
        <AntSwitch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            size={size}
            checkedChildren={checkedChildren}
            unCheckedChildren={unCheckedChildren}
            {...(testId !== undefined ? { id: testId } : {})}
            {...(testId !== undefined ? { 'data-testid': testId } : {})}
            {...(className ? { className } : {})}
        />
    );
};
