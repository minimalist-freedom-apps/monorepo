import { type Theme, ThemeProvider } from '@minimalistic-apps/components';
import type React from 'react';
import type { ReactNode } from 'react';

export type ThemeWrapperOwnProps = {
    readonly children: ReactNode;
};

export type ThemeWrapperStateProps = {
    readonly themeMode: Theme;
};

type ThemeWrapper = React.FC<ThemeWrapperOwnProps>;

export type ThemeWrapperDep = {
    readonly ThemeWrapper: ThemeWrapper;
};

export const themeWrapperPure = ({
    themeMode,
    children,
}: ThemeWrapperStateProps & ThemeWrapperOwnProps): React.ReactNode => (
    <ThemeProvider mode={themeMode}>{children}</ThemeProvider>
);
