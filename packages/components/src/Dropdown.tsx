import type { DropdownProps as AntDropdownProps } from 'antd';
import { Dropdown as AntDropdown } from 'antd';
import type { ReactNode } from 'react';

interface DropdownProps {
    readonly children: ReactNode;
    readonly trigger?: NonNullable<AntDropdownProps['trigger']>;
    readonly placement?: AntDropdownProps['placement'];
    readonly dropdownRender?: AntDropdownProps['dropdownRender'];
    readonly open?: AntDropdownProps['open'];
    readonly onOpenChange?: AntDropdownProps['onOpenChange'];
}

export const Dropdown = ({
    children,
    trigger,
    placement,
    dropdownRender,
    open,
    onOpenChange,
}: DropdownProps) => (
    <AntDropdown
        {...(trigger !== undefined ? { trigger } : {})}
        {...(placement !== undefined ? { placement } : {})}
        {...(dropdownRender !== undefined ? { dropdownRender } : {})}
        {...(open !== undefined ? { open } : {})}
        {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
        {children}
    </AntDropdown>
);
