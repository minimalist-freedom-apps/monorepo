import { Flex as AntFlex } from 'antd';
import type { ReactNode } from 'react';
import { buildSpacingStyle, type Spacing } from './spacing';

export interface FlexProps {
    readonly children: ReactNode;
    readonly gap?: number;
    readonly flex?: number | string;
    readonly wrap?: boolean;
    readonly align?: 'start' | 'center' | 'end' | 'stretch';
    readonly justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
    readonly direction?: 'row' | 'column';
    readonly margin?: Spacing;
    readonly padding?: Spacing;
    readonly style?: React.CSSProperties;
}

export const Flex = ({
    children,
    gap = 0,
    flex,
    wrap = false,
    align = 'stretch',
    justify = 'start',
    direction = 'row',
    margin,
    padding,
    style,
}: FlexProps) => {
    const spacingStyle = buildSpacingStyle({
        ...(margin ? { margin } : {}),
        ...(padding ? { padding } : {}),
    });

    return (
        <AntFlex
            gap={gap}
            flex={flex}
            wrap={wrap ? 'wrap' : undefined}
            align={align}
            justify={justify}
            vertical={direction === 'column'}
            style={{ ...spacingStyle, ...style }}
        >
            {children}
        </AntFlex>
    );
};

export const Row = (props: FlexProps) => (
    <Flex {...props} direction="row" align={props.align ?? 'center'} />
);

export const Column = (props: FlexProps) => <Flex {...props} direction="column" />;
