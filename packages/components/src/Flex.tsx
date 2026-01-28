import { Flex as AntFlex } from 'antd';
import type { ReactNode } from 'react';

interface FlexProps {
    readonly children: ReactNode;
    readonly gap?: number;
    readonly align?: 'start' | 'center' | 'end' | 'stretch';
    readonly justify?:
        | 'start'
        | 'center'
        | 'end'
        | 'space-between'
        | 'space-around';
    readonly direction?: 'row' | 'column';
    readonly style?: React.CSSProperties;
}

export const Flex = ({
    children,
    gap = 0,
    align = 'stretch',
    justify = 'start',
    direction = 'row',
    style,
}: FlexProps) => (
    <AntFlex
        gap={gap}
        align={align}
        justify={justify}
        vertical={direction === 'column'}
        style={style}
    >
        {children}
    </AntFlex>
);
