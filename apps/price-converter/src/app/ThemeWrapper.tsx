import { type Theme, ThemeProvider } from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/connect';
import type { ReactNode } from 'react';

export type ThemeWrapperOwnProps = {
    readonly children: ReactNode;
};

export type ThemeWrapperStateProps = {
    readonly themeMode: Theme;
};

export type ThemeWrapperDep = {
    readonly ThemeWrapper: Connected<ThemeWrapperOwnProps>;
};

export const ThemeWrapperPure = ({
    themeMode,
    children,
}: ThemeWrapperStateProps & ThemeWrapperOwnProps) => (
    <ThemeProvider mode={themeMode}>{children}</ThemeProvider>
);
