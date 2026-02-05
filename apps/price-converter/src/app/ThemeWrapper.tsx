import { type Theme, ThemeProvider } from '@minimalistic-apps/components';
import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import type React from 'react';
import type { ReactNode } from 'react';

type ThemeWrapperOwnProps = {
    readonly children: ReactNode;
};

type ThemeWrapperStateProps = {
    readonly themeMode: Theme;
};

type ThemeWrapperDeps = ComponentConnectDep<
    ThemeWrapperStateProps,
    ThemeWrapperOwnProps
>;

type ThemeWrapper = React.FC<ThemeWrapperOwnProps>;

export type ThemeWrapperDep = {
    readonly ThemeWrapper: ThemeWrapper;
};

export const createThemeWrapper = (deps: ThemeWrapperDeps): ThemeWrapper =>
    deps.connect(({ themeMode, children }) => (
        <ThemeProvider mode={themeMode}>{children}</ThemeProvider>
    ));
