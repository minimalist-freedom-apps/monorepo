import type { ReactNode } from 'react';
import { Column, type FlexProps } from './Flex';

type ScreenProps = {
    readonly children: ReactNode;
} & FlexProps;

export const Screen = ({ children, ...props }: ScreenProps) => (
    <Column {...props}>{children}</Column>
);
