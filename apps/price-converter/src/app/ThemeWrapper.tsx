import { type Theme, ThemeProvider } from '@minimalist-apps/components';
import type { FC, ReactNode } from 'react';

export type ThemeWrapperOwnProps = {
    readonly children: ReactNode;
};

type ThemeWrapperStateProps = {
    readonly themeMode: Theme;
};

export type ThemeWrapperDep = {
    readonly ThemeWrapper: FC<ThemeWrapperOwnProps>;
};

export const ThemeWrapperPure = ({
    themeMode,
    children,
}: ThemeWrapperStateProps & ThemeWrapperOwnProps) => (
    <ThemeProvider mode={themeMode}>{children}</ThemeProvider>
);
